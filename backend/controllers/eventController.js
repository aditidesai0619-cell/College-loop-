import Event from '../models/Event.js';
import Club from '../models/Club.js';
import User from '../models/User.js';
import { removePoster } from '../middleware/upload.js';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const httpError = (status, message) => Object.assign(new Error(message), { status });

// Admin can manage every event; an organizer only the events of their own club
const canManage = (user, event) =>
  user.role === 'admin' || (user.role === 'organizer' && String(user.club) === String(event.organizer._id || event.organizer));

// Public-facing shape: hides the participant list, adds a count, capacity info, "isRegistered" and "isSaved"
const serialize = (event, user) => {
  const obj = event.toObject ? event.toObject() : event;
  const { participants = [], ...rest } = obj;
  const capacity = obj.capacity ?? null;
  return {
    ...rest,
    capacity,
    participantCount: participants.length,
    spotsLeft: capacity == null ? null : Math.max(capacity - participants.length, 0),
    isFull: capacity != null && participants.length >= capacity,
    isRegistered: participants.some((p) => String(p._id || p) === String(user._id)),
    isSaved: (user.savedEvents || []).some((id) => String(id) === String(obj._id)),
    canManage: canManage(user, obj),
  };
};

// Capacity from a form field: undefined = not sent (keep current), '' = no limit, otherwise a whole number >= 1
const parseCapacity = (raw) => {
  if (raw === undefined) return undefined;
  if (raw === '' || raw === null || raw === 'null') return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw httpError(400, 'Capacity must be a whole number of at least 1 (or left empty for no limit)');
  return n;
};

const findEvent = async (id) => {
  const event = await Event.findById(id).populate('organizer', 'name members');
  if (!event) throw httpError(404, 'Event not found');
  return event;
};

const validateFields = ({ eventName, description, date, time, venue }) => {
  if (!eventName || !description || !date || !time || !venue) {
    return 'Event name, description, date, time and venue are required';
  }
  if (isNaN(new Date(date))) return 'Invalid date';
  if (!TIME_RE.test(time)) return 'Time must be in HH:mm format';
  return null;
};

// POST /api/events  (admin, organizer)
export const createEvent = async (req, res, next) => {
  try {
    const error = validateFields(req.body);
    if (error) throw httpError(400, error);

    // Organizers always create for their own club; admins choose the club
    const clubId = req.user.role === 'organizer' ? req.user.club : req.body.organizer;
    if (!clubId) throw httpError(400, 'Organizer club is required');
    if (!(await Club.exists({ _id: clubId }))) throw httpError(404, 'Club not found');

    const { eventName, description, date, time, venue } = req.body;
    const event = await Event.create({
      eventName, description, date, time, venue,
      capacity: parseCapacity(req.body.capacity) ?? null,
      organizer: clubId,
      createdBy: req.user._id,
      poster: req.file ? `/uploads/${req.file.filename}` : '',
    });
    res.status(201).json(serialize(await findEvent(event._id), req.user));
  } catch (err) {
    if (req.file) removePoster(req.file.filename);
    next(err);
  }
};

// GET /api/events?search=&club=&when=upcoming|past
export const getEvents = async (req, res, next) => {
  try {
    const { search, club, when } = req.query;
    const filter = {};
    if (search) filter.eventName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (club) filter.organizer = club;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (when === 'upcoming') filter.date = { $gte: today };
    if (when === 'past') filter.date = { $lt: today };

    const events = await Event.find(filter)
      .populate('organizer', 'name members')
      .sort({ date: when === 'past' ? -1 : 1, time: 1 });
    res.json(events.map((e) => serialize(e, req.user)));
  } catch (err) {
    next(err);
  }
};

// GET /api/events/mine  (student: registered events, organizer: own club's events)
export const getMyEvents = async (req, res, next) => {
  try {
    const filter = req.user.role === 'student' ? { participants: req.user._id } : req.user.role === 'organizer' ? { organizer: req.user.club } : {};
    const events = await Event.find(filter).populate('organizer', 'name members').sort({ date: 1, time: 1 });
    res.json(events.map((e) => serialize(e, req.user)));
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id
export const getEvent = async (req, res, next) => {
  try {
    res.json(serialize(await findEvent(req.params.id), req.user));
  } catch (err) {
    next(err);
  }
};

// PUT /api/events/:id  (admin, owning organizer)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await findEvent(req.params.id);
    if (!canManage(req.user, event)) throw httpError(403, 'You can only edit events of your own club');

    const merged = {
      eventName: req.body.eventName ?? event.eventName,
      description: req.body.description ?? event.description,
      date: req.body.date ?? event.date,
      time: req.body.time ?? event.time,
      venue: req.body.venue ?? event.venue,
    };
    const error = validateFields(merged);
    if (error) throw httpError(400, error);
    Object.assign(event, merged);

    const capacity = parseCapacity(req.body.capacity);
    if (capacity !== undefined) {
      if (capacity != null && capacity < event.participants.length) {
        throw httpError(400, `Capacity cannot be lower than the current number of registrations (${event.participants.length})`);
      }
      event.capacity = capacity;
    }

    // Only admins may move an event to another club
    if (req.user.role === 'admin' && req.body.organizer) {
      if (!(await Club.exists({ _id: req.body.organizer }))) throw httpError(404, 'Club not found');
      event.organizer = req.body.organizer;
    }

    if (req.file) {
      removePoster(event.poster);
      event.poster = `/uploads/${req.file.filename}`;
    }
    await event.save();
    res.json(serialize(await findEvent(event._id), req.user));
  } catch (err) {
    if (req.file) removePoster(req.file.filename);
    next(err);
  }
};

// DELETE /api/events/:id  (admin, owning organizer)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await findEvent(req.params.id);
    if (!canManage(req.user, event)) throw httpError(403, 'You can only delete events of your own club');
    removePoster(event.poster);
    await event.deleteOne();
    // Remove the event from every student's saved list
    await User.updateMany({ savedEvents: event._id }, { $pull: { savedEvents: event._id } });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/register  (student)
export const registerForEvent = async (req, res, next) => {
  try {
    const event = await findEvent(req.params.id);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (event.date < today) throw httpError(400, 'Registration is closed for past events');

    if (event.participants.some((p) => String(p) === String(req.user._id))) {
      throw httpError(409, 'You are already registered for this event');
    }

    // Atomic: only adds the student if not already registered AND a spot is still free,
    // so two simultaneous registrations cannot exceed the capacity
    const updated = await Event.findOneAndUpdate(
      {
        _id: event._id,
        participants: { $ne: req.user._id },
        $or: [{ capacity: null }, { $expr: { $lt: [{ $size: '$participants' }, '$capacity'] } }],
      },
      { $addToSet: { participants: req.user._id } },
      { new: true }
    ).populate('organizer', 'name members');
    if (!updated) {
      const latest = await Event.findById(event._id);
      if (latest?.participants.some((p) => String(p) === String(req.user._id))) {
        throw httpError(409, 'You are already registered for this event');
      }
      throw httpError(409, 'Registration is full for this event');
    }

    res.status(201).json(serialize(updated, req.user));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id/register  (student cancels)
export const cancelRegistration = async (req, res, next) => {
  try {
    await findEvent(req.params.id);
    const updated = await Event.findByIdAndUpdate(req.params.id, { $pull: { participants: req.user._id } }, { new: true }).populate('organizer', 'name members');
    res.json(serialize(updated, req.user));
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id/participants  (admin, owning organizer)
export const getParticipants = async (req, res, next) => {
  try {
    const event = await findEvent(req.params.id);
    if (!canManage(req.user, event)) throw httpError(403, 'You can only view participants of your own club events');
    await event.populate('participants', 'name email department');
    res.json({
      event: { _id: event._id, eventName: event.eventName, date: event.date, time: event.time, venue: event.venue, organizer: event.organizer },
      participants: event.participants,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/saved  (student: bookmarked events, soonest first)
export const getSavedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ _id: { $in: req.user.savedEvents || [] } })
      .populate('organizer', 'name members')
      .sort({ date: 1, time: 1 });
    res.json(events.map((e) => serialize(e, req.user)));
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/save  (student bookmarks an event; $addToSet prevents duplicates)
export const saveEvent = async (req, res, next) => {
  try {
    const event = await findEvent(req.params.id);
    const user = await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedEvents: event._id } }, { new: true });
    res.status(201).json(serialize(event, user));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id/save  (student removes a bookmark)
export const unsaveEvent = async (req, res, next) => {
  try {
    const event = await findEvent(req.params.id);
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { savedEvents: event._id } }, { new: true });
    res.json(serialize(event, user));
  } catch (err) {
    next(err);
  }
};
