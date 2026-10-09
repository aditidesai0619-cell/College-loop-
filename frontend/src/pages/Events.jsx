import { useEffect, useMemo, useState } from 'react';
import { getEvents } from '../services/eventService';
import { getClubs } from '../services/clubService';
import { errorMessage } from '../services/api';
import { dateKey, todayKey } from '../utils/date';
import { eventStatus } from '../utils/status';
import EventCard from '../components/EventCard';
import FeaturedEvent from '../components/FeaturedEvent';
import EventImage from '../components/EventImage';
import Icon from '../components/Icon';
import { EmptyState, SkeletonGrid } from '../components/ui';

// Date ranges. "week"/"month" ask the API for upcoming events and narrow them down here.
const RANGES = [
  ['upcoming', 'Upcoming'],
  ['week', 'This week'],
  ['month', 'Next 30 days'],
  ['past', 'Past'],
  ['', 'All dates'],
];
const DEFAULT_FILTERS = { search: '', club: '', range: 'upcoming', openOnly: false };

const keyPlusDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClubs().then(setClubs).catch(() => {});
    // Separate, unfiltered list of upcoming events for the hero + featured event
    getEvents({ when: 'upcoming' }).then(setUpcoming).catch(() => setUpcoming([]));
  }, []);

  // Re-query the API whenever a server-side filter changes (search is debounced)
  const { search, club, range } = filters;
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const when = range === 'week' || range === 'month' ? 'upcoming' : range;
      const params = Object.fromEntries(Object.entries({ search, club, when }).filter(([, v]) => v));
      getEvents(params)
        .then((data) => { setEvents(data); setError(''); })
        .catch((err) => setError(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, club, range]);

  // Client-side refinements on top of the API result
  const visible = useMemo(() => {
    let list = events;
    if (range === 'week' || range === 'month') {
      const limit = keyPlusDays(range === 'week' ? 7 : 30);
      list = list.filter((e) => dateKey(e.date) >= todayKey() && dateKey(e.date) <= limit);
    }
    if (filters.openOnly) list = list.filter((e) => eventStatus(e).key === 'open');
    return list;
  }, [events, range, filters.openOnly]);

  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }));
  const filtered = search || club || range !== 'upcoming' || filters.openOnly;
  const featured = upcoming?.find((e) => eventStatus(e).key !== 'full') || upcoming?.[0];
  const collage = (upcoming || []).filter((e) => e._id !== featured?._id).slice(0, 3);
  const activeClubs = new Set((upcoming || []).map((e) => e.organizer?._id)).size;
  const openCount = (upcoming || []).filter((e) => eventStatus(e).key === 'open').length;

  // Keep bookmarks in sync across the featured card and the grid
  const onChange = (updated) => {
    setEvents((list) => list.map((e) => (e._id === updated._id ? updated : e)));
    setUpcoming((list) => list?.map((e) => (e._id === updated._id ? updated : e)));
  };

  const rangeLabel = RANGES.find(([v]) => v === range)?.[1];

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Campus events</span>
          <h1>Discover what's <em>happening</em></h1>
          <p className="lead">Hackathons, performances, workshops and screenings from every club on campus — find your next experience, save it, and grab your spot.</p>
          {upcoming && (
            <dl className="hero-stats">
              <div><dt>Upcoming events</dt><dd>{upcoming.length}</dd></div>
              <div><dt>Open for registration</dt><dd>{openCount}</dd></div>
              <div><dt>Clubs hosting</dt><dd>{activeClubs}</dd></div>
            </dl>
          )}
        </div>
        {collage.length > 0 && (
          <div className={`hero-collage n${collage.length}`} aria-hidden="true">
            {collage.map((e) => (
              <figure key={e._id}>
                <EventImage event={e} eager />
                <figcaption>{e.eventName}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {featured && !filtered && <FeaturedEvent event={featured} label="Next up on campus" onChange={onChange} />}

      <section className="discover" aria-labelledby="discover-title">
        <div className="discover-head">
          <div>
            <span className="eyebrow">Browse</span>
            <h2 id="discover-title">{range === 'past' ? 'Past events' : range === '' ? 'All events' : rangeLabel === 'Upcoming' ? 'Upcoming events' : `Upcoming · ${rangeLabel}`}</h2>
          </div>
          <div className="segmented" role="group" aria-label="Filter by date">
            {RANGES.map(([value, label]) => (
              <button key={label} className={range === value ? 'active' : ''} aria-pressed={range === value} onClick={() => set('range', value)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters">
          <div className="filters-row">
            <label className="search-field">
              <Icon name="search" size={17} />
              <span className="sr-only">Search events</span>
              <input name="search" type="search" placeholder="Search events by name…" value={search} onChange={(e) => set('search', e.target.value)} />
            </label>
            <label className={`toggle ${filters.openOnly ? 'on' : ''}`}>
              <input type="checkbox" checked={filters.openOnly} onChange={(e) => set('openOnly', e.target.checked)} />
              <span className="toggle-track" aria-hidden="true"><span /></span>
              Open for registration only
            </label>
          </div>
          <div className="chips" role="group" aria-label="Filter by club">
            <button className={`chip ${!club ? 'active' : ''}`} aria-pressed={!club} onClick={() => set('club', '')}>All clubs</button>
            {clubs.map((c) => (
              <button key={c._id} className={`chip ${club === c._id ? 'active' : ''}`} aria-pressed={club === c._id} onClick={() => set('club', club === c._id ? '' : c._id)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}
        {!loading && !error && <p className="result-count">{visible.length} event{visible.length === 1 ? '' : 's'}</p>}

        {loading ? (
          <SkeletonGrid count={6} />
        ) : visible.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="search"
              title="No events found"
              action={filtered && <button className="btn btn-outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button>}
            >
              {filtered ? 'Try a different search, club or date range.' : 'There are no upcoming events yet — check back soon.'}
            </EmptyState>
          </div>
        ) : (
          <div className="grid">{visible.map((e) => <EventCard key={e._id} event={e} onChange={onChange} />)}</div>
        )}
      </section>
    </>
  );
}
