import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { saveEvent, unsaveEvent } from '../services/eventService';
import { errorMessage } from '../services/api';
import Icon from './Icon';

// Save / unsave an event (students only). Calls onChange(updatedEvent) after a successful toggle.
export default function BookmarkButton({ event, onChange, variant = 'icon' }) {
  const { user } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(!!event.isSaved);
  const [busy, setBusy] = useState(false);

  useEffect(() => setSaved(!!event.isSaved), [event.isSaved]);

  if (user?.role !== 'student') return null;

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const updated = await (next ? saveEvent(event._id) : unsaveEvent(event._id));
      toast.success(next ? `Saved "${event.eventName}"` : 'Removed from saved events');
      onChange?.(updated);
    } catch (err) {
      setSaved(!next);
      toast.error(errorMessage(err));
    }
    setBusy(false);
  };

  const label = saved ? `Remove ${event.eventName} from saved events` : `Save ${event.eventName} for later`;

  if (variant === 'button') {
    return (
      <button type="button" className={`btn btn-outline btn-block bookmark-btn ${saved ? 'is-saved' : ''}`} onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={label}>
        <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={17} /> {saved ? 'Saved' : 'Save for later'}
      </button>
    );
  }

  return (
    <button type="button" className={`bookmark ${saved ? 'is-saved' : ''}`} onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={label} title={saved ? 'Saved — click to remove' : 'Save for later'}>
      <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={18} />
    </button>
  );
}
