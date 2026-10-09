import { useState } from 'react';
import { clubAccent, eventImageSources, initials } from '../utils/clubs';

// Shows the uploaded poster, else the demo cover, else the club image.
// If every source fails to load, renders a typographic fallback instead of a broken image.
export default function EventImage({ event, className = '', eager = false }) {
  const sources = eventImageSources(event);
  const key = sources.join('|');
  // Count of failed sources, reset whenever the list of sources changes (e.g. a new poster)
  const [fail, setFail] = useState({ key, n: 0 });
  const failed = fail.key === key ? fail.n : 0;
  const src = sources[failed];
  const club = event?.organizer?.name || '';

  if (!src) {
    return (
      <div className={`event-image fallback accent-${clubAccent(club)} ${className}`} role="img" aria-label={`${event?.eventName || 'Event'} cover`}>
        <span className="fallback-mark">{initials(club) || 'CE'}</span>
        <span className="fallback-club">{club}</span>
      </div>
    );
  }

  return (
    <img
      key={src}
      className={`event-image ${className}`}
      src={src}
      alt={event?.poster && src === event.poster ? `${event.eventName} poster` : `${event?.eventName || 'Event'} cover image`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFail({ key, n: failed + 1 })}
    />
  );
}
