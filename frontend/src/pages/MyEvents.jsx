import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEvents } from '../services/eventService';
import { errorMessage } from '../services/api';
import { isPast } from '../utils/date';
import EventCard from '../components/EventCard';
import Icon from '../components/Icon';
import { EmptyState, SectionHead, SkeletonGrid } from '../components/ui';

export default function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyEvents().then(setEvents).catch((err) => setError(errorMessage(err)));
  }, []);

  const student = user.role === 'student';
  const title = student ? 'My registered events' : user.role === 'admin' ? 'All events' : `${user.club?.name} events`;
  const upcoming = (events || []).filter((e) => !isPast(e.date));
  const past = (events || []).filter((e) => isPast(e.date));

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">{student ? 'Your schedule' : 'Club events'}</span>
          <h1>{title}</h1>
          {events && <p className="muted">{upcoming.length} upcoming · {past.length} past</p>}
        </div>
        {!student && <Link to="/events/new" className="btn"><Icon name="plus" size={17} /> Create event</Link>}
      </div>
      {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}
      {!events ? (
        !error && <SkeletonGrid count={3} />
      ) : events.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={student ? 'ticket' : 'calendar'}
            title={student ? "You haven't registered for any events yet" : 'No events yet'}
            action={student ? <Link to="/events" className="btn">Browse events</Link> : <Link to="/events/new" className="btn">Create your first event</Link>}
          >
            {student ? 'Discover what is happening on campus and save your spot.' : 'Events you create will appear here.'}
          </EmptyState>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <SectionHead title="Upcoming" />
              <div className="grid">{upcoming.map((e) => <EventCard key={e._id} event={e} />)}</div>
            </>
          )}
          {past.length > 0 && (
            <>
              <SectionHead title="Past" />
              <div className="grid is-past">{past.map((e) => <EventCard key={e._id} event={e} />)}</div>
            </>
          )}
        </>
      )}
    </>
  );
}
