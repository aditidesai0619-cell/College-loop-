import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as eventService from '../services/eventService';
import { errorMessage } from '../services/api';
import { formatDate, formatTime, isPast } from '../utils/date';
import { clubAccent } from '../utils/clubs';
import EventImage from '../components/EventImage';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';
import BookmarkButton from '../components/BookmarkButton';
import { Spinner } from '../components/ui';
import { capacityText, eventStatus, spotsText } from '../utils/status';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    eventService.getEvent(id).then(setEvent).catch((err) => setError(errorMessage(err)));
  }, [id]);

  const act = async (fn, successMsg) => {
    setBusy(true);
    setError('');
    try {
      const updated = await fn();
      if (updated) setEvent(updated);
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    try {
      await eventService.deleteEvent(id);
      toast.success(`"${event.eventName}" was deleted`);
      navigate('/events');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  if (!event) {
    return error ? (
      <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error} <Link to="/events" className="text-link">Back to events</Link></div>
    ) : (
      <Spinner label="Loading event…" />
    );
  }

  const past = isPast(event.date);
  const club = event.organizer?.name;
  const status = eventStatus(event);
  const spots = spotsText(event);
  const fill = event.capacity ? Math.min(100, Math.round((event.participantCount / event.capacity) * 100)) : 0;

  return (
    <article className="details">
      <Link to="/events" className="back"><Icon name="arrowLeft" size={16} /> All events</Link>

      <div className="details-hero">
        <EventImage event={event} eager />
        <div className="details-hero-overlay">
          <span className={`club-label on-image accent-${clubAccent(club)}`}>{club}</span>
          <h1>{event.eventName}</h1>
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}

      <div className="details-grid">
        <section className="details-main">
          <span className="eyebrow">About this event</span>
          <p className="description">{event.description}</p>
          {event.poster && (
            <p className="muted small details-poster-note"><Icon name="image" size={15} /> Poster uploaded by the organizer</p>
          )}
        </section>

        <aside className="card details-side">
          <div className="details-side-head">
            <span className={`badge ${status.cls}`}>
              {status.key === 'registered' && <Icon name="check" size={13} />}
              {status.key === 'full' && <Icon name="lock" size={12} />}
              {status.label}
            </span>
            <span className="muted small"><Icon name="users" size={15} /> {capacityText(event)}</span>
          </div>
          {event.capacity ? (
            <div className="capacity" aria-label={`${event.participantCount} of ${event.capacity} spots taken`}>
              <div className="capacity-bar"><span style={{ width: `${fill}%` }} className={event.isFull ? 'is-full' : ''} /></div>
              <span className="capacity-text">{event.isFull ? 'All spots taken' : spots || `${event.capacity} spots`}</span>
            </div>
          ) : null}
          <ul className="details-facts">
            <li><Icon name="calendar" size={18} /><span><small>Date</small>{formatDate(event.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></li>
            <li><Icon name="clock" size={18} /><span><small>Time</small>{formatTime(event.time)}</span></li>
            <li><Icon name="pin" size={18} /><span><small>Venue</small>{event.venue}</span></li>
            <li><Icon name="flag" size={18} /><span><small>Organized by</small>{club}</span></li>
          </ul>

          {user.role === 'student' && (
            event.isRegistered ? (
              <div className="register-box">
                <span className="badge badge-ok big"><Icon name="check" size={15} /> You're registered</span>
                {!past && (
                  <button className="btn btn-outline btn-block" disabled={busy} onClick={() => act(() => eventService.cancelRegistration(id), 'Registration cancelled')}>
                    {busy ? 'Cancelling…' : 'Cancel registration'}
                  </button>
                )}
              </div>
            ) : (
              <button className="btn btn-lg btn-block btn-accent" disabled={busy || past || event.isFull} onClick={() => act(() => eventService.registerForEvent(id), "You're registered for this event!")}>
                {past ? 'Registration closed' : event.isFull ? <><Icon name="lock" size={16} /> Registration full</> : busy ? <><span className="spinner sm" aria-hidden="true" /> Registering…</> : <>Register for this event <Icon name="arrowRight" size={17} /></>}
              </button>
            )
          )}

          {user.role === 'student' && <BookmarkButton event={event} onChange={setEvent} variant="button" />}

          {event.canManage && (
            <div className="manage-box">
              <span className="eyebrow">Manage</span>
              <Link to={`/events/${id}/participants`} className="btn btn-outline btn-block"><Icon name="users" size={16} /> View participants</Link>
              <div className="manage-row">
                <Link to={`/events/${id}/edit`} className="btn btn-outline"><Icon name="edit" size={16} /> Edit</Link>
                <button className="btn btn-danger-outline" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={16} /> Delete</button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        danger
        busy={busy}
        title="Delete this event?"
        message={`"${event.eventName}" and its registrations will be permanently removed.`}
        confirmLabel="Delete event"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </article>
  );
}
