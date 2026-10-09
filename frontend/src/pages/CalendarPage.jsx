import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';
import { errorMessage } from '../services/api';
import { dateKey, formatDate, formatTime, todayKey } from '../utils/date';
import { clubAccent } from '../utils/clubs';
import { eventStatus } from '../utils/status';
import EventImage from '../components/EventImage';
import Icon from '../components/Icon';
import { EmptyState } from '../components/ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayKey());

  useEffect(() => {
    getEvents().then(setEvents).catch((err) => setError(errorMessage(err)));
  }, []);

  // { "2026-10-12": [event, ...] }
  const byDate = useMemo(() => {
    const map = {};
    events.forEach((e) => (map[dateKey(e.date)] ||= []).push(e));
    return map;
  }, [events]);

  const year = month.getFullYear();
  const m = month.getMonth();
  const startOffset = month.getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const keyFor = (day) => `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = todayKey();

  const shift = (n) => setMonth(new Date(year, m + n, 1));
  const goToday = () => {
    const d = new Date();
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(todayKey());
  };

  const dayEvents = byDate[selected] || [];
  const monthPrefix = `${year}-${String(m + 1).padStart(2, '0')}`;
  const monthEvents = events.filter((e) => dateKey(e.date).startsWith(monthPrefix));
  // Legend: clubs with events this month
  const legend = [...new Map(monthEvents.map((e) => [e.organizer?.name, clubAccent(e.organizer?.name)])).entries()];

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Plan ahead</span>
          <h1>Event calendar</h1>
          <p className="muted">{monthEvents.length} event{monthEvents.length === 1 ? '' : 's'} in {month.toLocaleDateString('en-IN', { month: 'long' })}. Select a date to see what's on.</p>
        </div>
      </div>
      {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}

      <div className="calendar-layout">
        <div className="card calendar">
          <div className="cal-head">
            <h2>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2>
            <div className="cal-nav">
              <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month"><Icon name="chevronLeft" size={18} /></button>
              <button className="btn btn-outline btn-sm" onClick={goToday}>Today</button>
              <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month"><Icon name="chevronRight" size={18} /></button>
            </div>
          </div>
          <div className="cal-grid" role="grid">
            {WEEKDAYS.map((d) => <div key={d} className="cal-weekday" role="columnheader">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`b${i}`} className="cal-cell blank" />;
              const key = keyFor(day);
              const list = byDate[key] || [];
              const label = `${formatDate(key, { weekday: 'long', day: 'numeric', month: 'long' })}${list.length ? `, ${list.length} event${list.length > 1 ? 's' : ''}` : ''}`;
              return (
                <button
                  key={key}
                  className={`cal-cell ${key === selected ? 'selected' : ''} ${key === today ? 'today' : ''} ${list.length ? 'has-events' : ''} ${key < today ? 'is-past' : ''}`}
                  onClick={() => setSelected(key)}
                  aria-pressed={key === selected}
                  aria-label={label}
                >
                  <span className="cal-day">{day}</span>
                  {list.length > 0 && (
                    <span className="cal-dots" aria-hidden="true">
                      {list.slice(0, 3).map((e) => <i key={e._id} className={`dot accent-${clubAccent(e.organizer?.name)}`} />)}
                      {list.length > 3 && <em>+{list.length - 3}</em>}
                    </span>
                  )}
                  {list.length > 0 && <span className="cal-preview" aria-hidden="true">{list[0].eventName}</span>}
                </button>
              );
            })}
          </div>
          {legend.length > 0 && (
            <ul className="cal-legend" aria-label="Clubs with events this month">
              {legend.map(([name, accent]) => <li key={name}><i className={`dot accent-${accent}`} /> {name}</li>)}
            </ul>
          )}
        </div>

        <div className="card day-panel">
          <span className="eyebrow">{selected === today ? 'Today' : 'Selected date'}</span>
          <h3>{formatDate(selected, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          {dayEvents.length === 0 ? (
            <EmptyState icon="calendar" title="No events on this date">Pick a highlighted day to see its events.</EmptyState>
          ) : (
            <ul className="day-events">
              {dayEvents.map((e) => (
                <li key={e._id}>
                  <Link to={`/events/${e._id}`} className="day-event">
                    <span className="thumb lg"><EventImage event={e} /></span>
                    <span className="day-event-info">
                      <span className={`club-label accent-${clubAccent(e.organizer?.name)}`}>{e.organizer?.name}</span>
                      <strong>{e.eventName}</strong>
                      <span className="muted small"><Icon name="clock" size={14} /> {formatTime(e.time)} · {e.venue}</span>
                      <span className={`badge ${eventStatus(e).cls}`}>{eventStatus(e).label}</span>
                    </span>
                    <Icon name="chevronRight" size={18} className="day-event-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
