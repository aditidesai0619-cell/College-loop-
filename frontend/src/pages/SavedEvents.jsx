import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSavedEvents } from '../services/eventService';
import { errorMessage } from '../services/api';
import { isPast } from '../utils/date';
import EventCard from '../components/EventCard';
import Icon from '../components/Icon';
import { EmptyState, SectionHead, SkeletonGrid } from '../components/ui';

// Student bookmarks. Un-saving a card removes it from this page immediately.
export default function SavedEvents() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSavedEvents().then(setEvents).catch((err) => setError(errorMessage(err)));
  }, []);

  const onChange = (updated) => {
    if (!updated.isSaved) setEvents((list) => list.filter((e) => e._id !== updated._id));
  };

  const upcoming = (events || []).filter((e) => !isPast(e.date));
  const past = (events || []).filter((e) => isPast(e.date));

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow"><Icon name="bookmark" size={13} /> Your shortlist</span>
          <h1>Saved events</h1>
          {events && <p className="muted">{events.length === 0 ? 'Nothing saved yet.' : `${upcoming.length} upcoming · ${past.length} past`}</p>}
        </div>
        <Link to="/events" className="btn btn-outline"><Icon name="search" size={16} /> Discover events</Link>
      </div>

      {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}
      {!events ? (
        !error && <SkeletonGrid count={3} />
      ) : events.length === 0 ? (
        <div className="card">
          <EmptyState icon="bookmark" title="No saved events yet" action={<Link to="/events" className="btn">Browse upcoming events</Link>}>
            Tap the bookmark on any event to keep it here for later — saving doesn't register you.
          </EmptyState>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <SectionHead title="Upcoming" />
              <div className="grid">{upcoming.map((e) => <EventCard key={e._id} event={e} onChange={onChange} />)}</div>
            </>
          )}
          {past.length > 0 && (
            <>
              <SectionHead title="Past" />
              <div className="grid is-past">{past.map((e) => <EventCard key={e._id} event={e} onChange={onChange} />)}</div>
            </>
          )}
        </>
      )}
    </>
  );
}
