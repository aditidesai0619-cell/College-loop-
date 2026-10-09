import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../utils/date';
import { clubAccent } from '../utils/clubs';
import { capacityText, eventStatus, spotsText } from '../utils/status';
import EventImage from './EventImage';
import BookmarkButton from './BookmarkButton';
import Icon from './Icon';

// Card layout: the title link stretches over the whole card (".stretched-link"),
// so the bookmark button can sit on top without nesting a button inside a link.
export default function EventCard({ event, onChange }) {
  const { user } = useAuth();
  const d = new Date(`${event.date.slice(0, 10)}T00:00:00`);
  const club = event.organizer?.name;
  const status = eventStatus(event);
  const spots = spotsText(event);
  const cta = user?.role === 'student' && status.key === 'open' ? 'Register' : 'View event';

  return (
    <article className={`card event-card status-${status.key}`}>
      <div className="event-card-media">
        <EventImage event={event} />
        <div className="date-chip" aria-hidden="true">
          <strong>{d.getDate()}</strong>
          <span>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
        </div>
        <BookmarkButton event={event} onChange={onChange} />
      </div>
      <div className="event-card-body">
        <div className="event-card-tags">
          <span className={`club-label accent-${clubAccent(club)}`}>{club}</span>
          <span className={`badge ${status.cls}`}>
            {status.key === 'registered' && <Icon name="check" size={13} />}
            {status.key === 'full' && <Icon name="lock" size={12} />}
            {status.label}
          </span>
        </div>
        <h3>
          <Link to={`/events/${event._id}`} className="stretched-link">{event.eventName}</Link>
        </h3>
        <ul className="event-meta">
          <li><Icon name="calendar" size={15} /> {formatDate(event.date)} · {formatTime(event.time)}</li>
          <li><Icon name="pin" size={15} /> {event.venue}</li>
        </ul>
        <div className="event-card-foot">
          <span className="going">
            <Icon name="users" size={15} /> {capacityText(event)}
            {spots && <em className="spots">· {spots}</em>}
          </span>
          <span className="card-cta" aria-hidden="true">{cta} <Icon name="arrowRight" size={15} /></span>
        </div>
      </div>
    </article>
  );
}
