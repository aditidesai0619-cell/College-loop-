import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../utils/date';
import { clubAccent } from '../utils/clubs';
import { capacityText, eventStatus, spotsText } from '../utils/status';
import EventImage from './EventImage';
import BookmarkButton from './BookmarkButton';
import Icon from './Icon';

// Large editorial card for a single highlighted (real) event
export default function FeaturedEvent({ event, label = 'Featured event', onChange }) {
  const { user } = useAuth();
  const club = event.organizer?.name;
  const status = eventStatus(event);
  const spots = spotsText(event);
  return (
    <article className="featured">
      <Link to={`/events/${event._id}`} className="featured-media" tabIndex={-1} aria-hidden="true">
        <EventImage event={event} eager />
      </Link>
      <div className="featured-body">
        <div className="featured-top">
          <span className="eyebrow"><Icon name="sparkle" size={13} /> {label}</span>
          <BookmarkButton event={event} onChange={onChange} />
        </div>
        <span className={`club-label accent-${clubAccent(club)}`}>{club}</span>
        <h2><Link to={`/events/${event._id}`}>{event.eventName}</Link></h2>
        <p className="featured-desc">{event.description}</p>
        <ul className="event-meta">
          <li><Icon name="calendar" size={16} /> {formatDate(event.date, { weekday: 'long', day: 'numeric', month: 'long' })}</li>
          <li><Icon name="clock" size={16} /> {formatTime(event.time)}</li>
          <li><Icon name="pin" size={16} /> {event.venue}</li>
          <li><Icon name="users" size={16} /> {capacityText(event)}{spots && ` · ${spots}`}</li>
        </ul>
        <div className="featured-actions">
          <Link to={`/events/${event._id}`} className={`btn ${user?.role === 'student' && status.key === 'open' ? 'btn-accent' : ''}`}>
            {user?.role === 'student' && status.key === 'open' ? 'View & register' : 'View event'} <Icon name="arrowRight" size={16} />
          </Link>
          <span className={`badge big ${status.cls}`}>
            {status.key === 'registered' && <Icon name="check" size={14} />}
            {status.key === 'full' && <Icon name="lock" size={13} />}
            {status.key === 'registered' ? "You're registered" : status.label}
          </span>
        </div>
      </div>
    </article>
  );
}
