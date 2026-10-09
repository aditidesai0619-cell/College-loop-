import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../utils/date';
import { eventStatus } from '../utils/status';
import EventImage from './EventImage';
import Icon from './Icon';

// Management table for admins/organizers: view, edit and participants per event
export default function EventTable({ events, showClub = true }) {
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th className="hide-sm">Venue</th>
            <th className="num">Registered</th>
            <th>Status</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const status = eventStatus(e);
            return (
              <tr key={e._id}>
                <td>
                  <Link to={`/events/${e._id}`} className="table-event">
                    <span className="thumb"><EventImage event={e} /></span>
                    <span>
                      <strong>{e.eventName}</strong>
                      {showClub && <span className="muted small">{e.organizer?.name}</span>}
                    </span>
                  </Link>
                </td>
                <td className="nowrap">{formatDate(e.date, { day: 'numeric', month: 'short' })}<span className="muted small">{formatTime(e.time)}</span></td>
                <td className="hide-sm">{e.venue}</td>
                <td className="num nowrap">
                  {e.participantCount}
                  {e.capacity ? <span className="muted"> / {e.capacity}</span> : null}
                </td>
                <td><span className={`badge ${status.cls}`}>{status.key === 'open' ? 'Open' : status.key === 'full' ? 'Full' : status.key === 'closed' ? 'Closed' : status.label}</span></td>
                <td>
                  <div className="row-actions">
                    <Link to={`/events/${e._id}`} className="icon-btn sm" title="View event" aria-label={`View ${e.eventName}`}><Icon name="eye" size={16} /></Link>
                    {e.canManage && (
                      <>
                        <Link to={`/events/${e._id}/edit`} className="icon-btn sm" title="Edit event" aria-label={`Edit ${e.eventName}`}><Icon name="edit" size={16} /></Link>
                        <Link to={`/events/${e._id}/participants`} className="icon-btn sm" title="View participants" aria-label={`Participants of ${e.eventName}`}><Icon name="users" size={16} /></Link>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
