import Club from '../models/Club.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

// GET /api/clubs
export const getClubs = async (req, res, next) => {
  try {
    res.json(await Club.find().sort({ name: 1 }));
  } catch (err) {
    next(err);
  }
};

// POST /api/clubs  (admin)
export const createClub = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    res.status(201).json(await Club.create({ name, members }));
  } catch (err) {
    next(err);
  }
};

// PUT /api/clubs/:id  (admin)
export const updateClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (req.body.name !== undefined) club.name = req.body.name;
    if (req.body.members !== undefined) club.members = req.body.members;
    res.json(await club.save());
  } catch (err) {
    next(err);
  }
};

// DELETE /api/clubs/:id  (admin) - refused while the club still has events
export const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (await Event.exists({ organizer: club._id })) {
      return res.status(400).json({ message: 'Delete this club\'s events first' });
    }
    await User.updateMany({ club: club._id }, { $unset: { club: 1 } });
    await club.deleteOne();
    res.json({ message: 'Club deleted' });
  } catch (err) {
    next(err);
  }
};
