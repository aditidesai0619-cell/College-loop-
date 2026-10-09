import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getParticipants } from '../services/eventService';
import { errorMessage } from '../services/api';
import { formatDate, formatTime } from '../utils/date';
import { initials } from '../utils/clubs';
import Icon from '../components/Icon';
import { EmptyState, Spinner } from '../components/ui';

export default function Participants() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getParticipants(id).then(setData).catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) return <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error} <Link to="/events" className="text-link">Back to events</Link></div>;
  if (!data) return <Spinner label="Loading participants…" />;

  const { event, participants } = data;

  return (
    <>
      <Link to={`/events/${id}`} className="back"><Icon name="arrowLeft" size={16} /> Back to event</Link>
      <div className="page-head">
        <div>
          <span className="eyebrow">Participants</span>
          <h1>{event.eventName}</h1>
          <p className="muted meta-inline">
            <span><Icon name="calendar" size={15} /> {formatDate(event.date)}</span>
            <span><Icon name="clock" size={15} /> {formatTime(event.time)}</span>
            <span><Icon name="pin" size={15} /> {event.venue}</span>
          </p>
        </div>
        <span className="badge badge-ok big"><Icon name="users" size={15} /> {participants.length} registered</span>
      </div>

      {participants.length === 0 ? (
        <div className="card"><EmptyState icon="users" title="No registrations yet">Students who register will appear here.</EmptyState></div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th className="num">#</th><th>Name</th><th>Email</th><th>Department</th></tr></thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p._id}>
                  <td className="num muted">{i + 1}</td>
                  <td><span className="person"><span className="avatar sm" aria-hidden="true">{initials(p.name)}</span>{p.name}</span></td>
                  <td><a href={`mailto:${p.email}`} className="text-link">{p.email}</a></td>
                  <td>{p.department ? <span className="badge">{p.department}</span> : <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
