import { dateKey, isPast, todayKey } from './date';

// Single source of truth for an event's registration status, used by cards, details, tables and calendar.
// key: 'registered' | 'closed' | 'full' | 'open'
export const eventStatus = (event) => {
  const past = isPast(event.date);
  if (event.isRegistered) return { key: 'registered', label: past ? 'Attended' : 'Registered', cls: 'badge-ok' };
  if (past) return { key: 'closed', label: 'Registration closed', cls: 'badge-muted' };
  if (event.isFull) return { key: 'full', label: 'Registration full', cls: 'badge-danger' };
  return { key: 'open', label: 'Registration open', cls: 'badge-open' };
};

export const isToday = (event) => dateKey(event.date) === todayKey();

// "12 / 60 registered" or "12 registered" when there is no capacity limit
export const capacityText = (event) =>
  event.capacity ? `${event.participantCount} / ${event.capacity} registered` : `${event.participantCount} registered`;

// Short availability hint for open events with a limit, e.g. "5 spots left"
export const spotsText = (event) => {
  if (!event.capacity || event.isFull || isPast(event.date)) return '';
  return `${event.spotsLeft} spot${event.spotsLeft === 1 ? '' : 's'} left`;
};
