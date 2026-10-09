import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, getMyEvents, getSavedEvents } from '../services/eventService';
import { getClubs } from '../services/clubService';
import { errorMessage } from '../services/api';
import { formatDate, formatTime, isPast } from '../utils/date';
import { clubImage } from '../utils/clubs';
import EventCard from '../components/EventCard';
import EventTable from '../components/EventTable';
import FeaturedEvent from '../components/FeaturedEvent';
import EventImage from '../components/EventImage';
import Icon from '../components/Icon';
import { EmptyState, SectionHead, Shortcuts, SkeletonGrid, Spinner, StatCard } from '../components/ui';
import { eventStatus } from '../utils/status';

const sum = (events) => events.reduce((s, e) => s + e.participantCount, 0);
const todayLabel = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

function Greeting({ user, subtitle, action }) {
  return (
    <div className="page-head dash-head">
      <div>
        <span className="eyebrow">{todayLabel()}</span>
        <h1>Hello, {user.name.split(' ')[0]}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

const CreateButton = () => (
  <Link to="/events/new" className="btn"><Icon name="plus" size={17} /> Create event</Link>
);

/* ---------- Student ---------- */
function StudentDashboard({ user }) {
  const [upcoming, setUpcoming] = useState(null);
  const [mine, setMine] = useState(null);
  const [saved, setSaved] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents({ when: 'upcoming' }).then(setUpcoming).catch((err) => setError(errorMessage(err)));
    getMyEvents().then(setMine).catch((err) => setError(errorMessage(err)));
    getSavedEvents().then(setSaved).catch(() => {});
  }, []);

  // Keep bookmark state in sync between the featured card, cards and the saved list
  const onChange = (updated) => {
    setUpcoming((list) => list.map((e) => (e._id === updated._id ? updated : e)));
    setSaved((list) => (updated.isSaved ? [...list.filter((e) => e._id !== updated._id), updated] : list.filter((e) => e._id !== updated._id)));
  };

  if (error) return <div className="alert alert-error" role="alert">{error}</div>;
  if (!upcoming || !mine) return <><Greeting user={user} subtitle="Here's what is happening on campus." /><Spinner label="Loading your events…" /></>;

  const myUpcoming = mine.filter((e) => !isPast(e.date));
  const next = myUpcoming[0];
  const featured = upcoming.find((e) => eventStatus(e).key === 'open') || upcoming[0];
  const explore = upcoming.filter((e) => !e.isRegistered && e._id !== featured?._id).slice(0, 3);
  const savedUpcoming = saved.filter((e) => !isPast(e.date));

  return (
    <>
      <Greeting user={user} subtitle="Your campus event hub — what's coming up, what you've saved, and where you're going." />

      <Shortcuts
        items={[
          { to: '/events', icon: 'search', title: 'Browse events', hint: `${upcoming.length} upcoming`, accent: 'forest' },
          { to: '/saved', icon: 'bookmark', title: 'Saved events', hint: `${savedUpcoming.length} saved`, accent: 'mustard' },
          { to: '/my-events', icon: 'ticket', title: 'My registrations', hint: `${myUpcoming.length} upcoming`, accent: 'terra' },
          { to: '/calendar', icon: 'calendar', title: 'Calendar', hint: 'Plan your month', accent: 'sage' },
        ]}
      />

      <div className="stats">
        <StatCard label="Upcoming on campus" value={upcoming.length} icon="calendar" accent="forest" />
        <StatCard label="Your registrations" value={myUpcoming.length} hint={mine.length > myUpcoming.length ? `${mine.length - myUpcoming.length} past` : 'upcoming'} icon="ticket" accent="terra" />
        <StatCard label="Saved for later" value={savedUpcoming.length} hint="bookmarked events" icon="bookmark" accent="mustard" />
        <StatCard label="Next event" value={next ? formatDate(next.date, { day: 'numeric', month: 'short' }) : '—'} hint={next ? next.eventName : 'Nothing booked yet'} icon="clock" accent="sage" />
      </div>

      <div className="dash-split">
        <section>
          <SectionHead eyebrow="Your schedule" title="Registered events" to="/my-events" />
          {myUpcoming.length === 0 ? (
            <div className="card">
              <EmptyState icon="ticket" title="No registrations yet" action={<Link to="/events" className="btn btn-outline">Browse events</Link>}>
                Find an event you like and reserve your spot.
              </EmptyState>
            </div>
          ) : (
            <ul className="agenda card">
              {myUpcoming.slice(0, 4).map((e) => (
                <li key={e._id}>
                  <Link to={`/events/${e._id}`} className="agenda-item">
                    <span className="agenda-date">
                      <strong>{new Date(`${e.date.slice(0, 10)}T00:00:00`).getDate()}</strong>
                      <span>{formatDate(e.date, { month: 'short' })}</span>
                    </span>
                    <span className="agenda-info">
                      <strong>{e.eventName}</strong>
                      <span className="muted small">{formatTime(e.time)} · {e.venue}</span>
                    </span>
                    <span className="badge badge-ok"><Icon name="check" size={13} /> Registered</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="card quick-card">
          <span className="quick-icon"><Icon name="bookmark" size={22} /></span>
          <h3>Saved for later</h3>
          {savedUpcoming.length === 0 ? (
            <p className="muted">Bookmark events you're curious about — they'll wait here until you decide.</p>
          ) : (
            <ul className="mini-list">
              {savedUpcoming.slice(0, 3).map((e) => (
                <li key={e._id}>
                  <Link to={`/events/${e._id}`}>
                    <strong>{e.eventName}</strong>
                    <span className="muted small">{formatDate(e.date, { day: 'numeric', month: 'short' })} · {eventStatus(e).label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to="/saved" className="btn btn-outline">View saved <Icon name="arrowRight" size={16} /></Link>
        </aside>
      </div>

      {featured && (
        <>
          <SectionHead eyebrow="Recommended" title="Featured for you" />
          <FeaturedEvent event={featured} label={featured.isRegistered ? 'You are going' : 'Featured event'} onChange={onChange} />
        </>
      )}

      <SectionHead eyebrow="Explore" title="More upcoming events" to="/events" />
      {explore.length === 0 ? (
        <div className="card"><EmptyState title="You're all caught up">You've registered for every upcoming event.</EmptyState></div>
      ) : (
        <div className="grid">{explore.map((e) => <EventCard key={e._id} event={e} onChange={onChange} />)}</div>
      )}
    </>
  );
}

/* ---------- Organizer ---------- */
function OrganizerDashboard({ user }) {
  const [events, setEvents] = useState(null);
  const [club, setClub] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyEvents().then(setEvents).catch((err) => setError(errorMessage(err)));
    getClubs().then((cs) => setClub(cs.find((c) => c._id === user.club?._id) || null)).catch(() => {});
  }, [user.club?._id]);

  const clubName = user.club?.name || 'Your club';
  const upcoming = (events || []).filter((e) => !isPast(e.date));
  const banner = clubImage(clubName);

  return (
    <>
      <section className={`club-banner ${banner ? '' : 'no-image'}`}>
        {banner && <img src={banner} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />}
        <div className="club-banner-text">
          <span className="eyebrow light">Organizer dashboard · {todayLabel()}</span>
          <h1>{clubName}</h1>
          <p>Hello {user.name.split(' ')[0]} — create events, track registrations and manage your club's calendar.</p>
        </div>
        <Link to="/events/new" className="btn btn-light"><Icon name="plus" size={17} /> Create event</Link>
      </section>

      <Shortcuts
        items={[
          { to: '/events/new', icon: 'plus', title: 'Create event', hint: 'Publish a new event', accent: 'terra' },
          { to: '/my-events', icon: 'grid', title: 'Club events', hint: 'Edit & manage', accent: 'forest' },
          { to: '/calendar', icon: 'calendar', title: 'Calendar', hint: 'All campus dates', accent: 'sage' },
          { to: '/events', icon: 'search', title: 'Discover', hint: 'Events from other clubs', accent: 'mustard' },
        ]}
      />

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {!events ? <Spinner label="Loading club events…" /> : (
        <>
          <div className="stats">
            <StatCard label="Club events" value={events.length} icon="grid" accent="forest" />
            <StatCard label="Upcoming" value={upcoming.length} icon="calendar" accent="terra" />
            <StatCard label="Total registrations" value={sum(events)} icon="users" accent="mustard" />
            {club && <StatCard label="Club members" value={club.members} icon="flag" accent="sage" />}
          </div>

          <SectionHead eyebrow="Up next" title="Upcoming club events" to="/my-events" />
          {upcoming.length === 0 ? (
            <div className="card"><EmptyState title="No upcoming events" action={<CreateButton />}>Plan your club's next event to get students registering.</EmptyState></div>
          ) : (
            <div className="grid">{upcoming.slice(0, 3).map((e) => <EventCard key={e._id} event={e} />)}</div>
          )}

          {events.length > 0 && (
            <>
              <SectionHead eyebrow="Manage" title="All club events" />
              <EventTable events={events} showClub={false} />
            </>
          )}
        </>
      )}
    </>
  );
}

/* ---------- Admin ---------- */
function AdminDashboard({ user }) {
  const [events, setEvents] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents().then(setEvents).catch((err) => setError(errorMessage(err)));
    getClubs().then(setClubs).catch(() => {});
  }, []);

  const upcoming = (events || []).filter((e) => !isPast(e.date));
  const byClub = (id) => (events || []).filter((e) => e.organizer?._id === id);

  return (
    <>
      <Greeting user={user} subtitle="Admin overview of every club, event and registration." action={<CreateButton />} />

      <Shortcuts
        items={[
          { to: '/events/new', icon: 'plus', title: 'Create event', hint: 'For any club', accent: 'terra' },
          { to: '/clubs', icon: 'flag', title: 'Manage clubs', hint: `${clubs.length} clubs`, accent: 'forest' },
          { to: '/events', icon: 'search', title: 'All events', hint: 'Browse & filter', accent: 'mustard' },
          { to: '/calendar', icon: 'calendar', title: 'Calendar', hint: 'Campus schedule', accent: 'sage' },
        ]}
      />

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {!events ? <SkeletonGrid count={3} /> : (
        <>
          <div className="stats">
            <StatCard label="Total events" value={events.length} hint={`${events.length - upcoming.length} past`} icon="grid" accent="forest" />
            <StatCard label="Upcoming events" value={upcoming.length} hint={`${upcoming.filter((e) => e.isFull).length} full`} icon="calendar" accent="terra" />
            <StatCard label="Clubs" value={clubs.length} hint={`${clubs.reduce((s, c) => s + (c.members || 0), 0)} members`} icon="flag" accent="mustard" />
            <StatCard label="Registrations" value={sum(events)} hint="across all events" icon="users" accent="sage" />
          </div>

          <SectionHead eyebrow="Coming up" title="Upcoming events" to="/events" />
          {upcoming.length === 0 ? (
            <div className="card"><EmptyState title="No upcoming events" action={<CreateButton />} /></div>
          ) : (
            <div className="grid">{upcoming.slice(0, 3).map((e) => <EventCard key={e._id} event={e} />)}</div>
          )}

          <div className="dash-split wide">
            <section>
              <SectionHead eyebrow="Manage" title="All events" />
              {events.length === 0 ? <div className="card"><EmptyState title="No events yet" /></div> : <EventTable events={events} />}
            </section>

            <section>
              <SectionHead eyebrow="Organizers" title="Clubs" to="/clubs" linkLabel="Manage" />
              <div className="card table-wrap">
                <table className="table compact">
                  <thead><tr><th>Club</th><th className="num">Members</th><th className="num">Events</th></tr></thead>
                  <tbody>
                    {clubs.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <span className="club-cell">
                            <span className="thumb sm"><EventImage event={{ eventName: c.name, organizer: { name: c.name } }} /></span>
                            {c.name}
                          </span>
                        </td>
                        <td className="num">{c.members}</td>
                        <td className="num">{byClub(c._id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminDashboard user={user} />;
  if (user.role === 'organizer') return <OrganizerDashboard user={user} />;
  return <StudentDashboard user={user} />;
}
