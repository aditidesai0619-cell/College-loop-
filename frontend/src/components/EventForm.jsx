import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getClubs } from '../services/clubService';
import { errorMessage } from '../services/api';
import { dateKey } from '../utils/date';
import EventImage from './EventImage';
import Icon from './Icon';

// Shared by Create Event and Edit Event. Sends multipart FormData (poster is a file).
export default function EventForm({ initial, onSubmit, submitLabel }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    eventName: initial?.eventName || '',
    description: initial?.description || '',
    date: initial ? dateKey(initial.date) : '',
    time: initial?.time || '',
    venue: initial?.venue || '',
    organizer: initial?.organizer?._id || '',
    capacity: initial?.capacity ? String(initial.capacity) : '',
  });
  const [poster, setPoster] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user.role === 'admin') getClubs().then(setClubs).catch(() => {});
  }, [user.role]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const posterUrl = useMemo(() => (poster ? URL.createObjectURL(poster) : ''), [poster]);
  useEffect(() => () => posterUrl && URL.revokeObjectURL(posterUrl), [posterUrl]);

  // What the event will look like if saved now (club picked in the form wins for admins)
  const clubName = user.role === 'admin' ? clubs.find((c) => c._id === form.organizer)?.name || initial?.organizer?.name : user.club?.name;
  const previewEvent = { ...initial, eventName: form.eventName || 'New event', poster: posterUrl || initial?.poster, organizer: { name: clubName } };
  const previewNote = posterUrl
    ? 'New poster selected'
    : initial?.poster
    ? 'Current uploaded poster'
    : initial?.coverImage || clubName
    ? 'No poster uploaded — a default cover image is shown'
    : 'Upload a poster or pick a club to preview the cover';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (user.role === 'admin' && !form.organizer) return setError('Please select the organizing club');
    if (form.capacity && (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1)) {
      return setError('Capacity must be a whole number of at least 1, or left empty for no limit');
    }
    if (form.capacity && initial && Number(form.capacity) < initial.participantCount) {
      return setError(`Capacity cannot be lower than the current number of registrations (${initial.participantCount})`);
    }
    const data = new FormData();
    const { capacity, ...fields } = form;
    Object.entries(fields).forEach(([k, v]) => v && data.append(k, v));
    data.append('capacity', capacity); // always sent: empty string = no limit
    if (poster) data.append('poster', poster);
    setSaving(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form className="card form event-form" onSubmit={submit}>
      {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}

      <fieldset>
        <legend>Event details</legend>
        <label>Event name
          <input name="eventName" value={form.eventName} onChange={set} placeholder="e.g. Hack-A-Thon 2026" required />
        </label>
        <label>Description
          <textarea name="description" rows="5" value={form.description} onChange={set} placeholder="What should attendees expect?" required />
        </label>
      </fieldset>

      <fieldset>
        <legend>When &amp; where</legend>
        <div className="grid-3">
          <label>Date
            <input type="date" name="date" value={form.date} onChange={set} required />
          </label>
          <label>Time
            <input type="time" name="time" value={form.time} onChange={set} required />
          </label>
          <label>Venue
            <input name="venue" value={form.venue} onChange={set} placeholder="e.g. Main Auditorium" required />
          </label>
        </div>

        {user.role === 'admin' ? (
          <label>Organizer club
            <select name="organizer" value={form.organizer} onChange={set}>
              <option value="">Select a club</option>
              {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
        ) : (
          <p className="form-note"><Icon name="flag" size={15} /> Organized by <strong>{user.club?.name}</strong></p>
        )}
      </fieldset>

      <fieldset>
        <legend>Registration</legend>
        <div className="grid-2">
          <label>Maximum participants <span className="optional">optional</span>
            <input type="number" name="capacity" min={Math.max(1, initial?.participantCount || 1)} step="1" inputMode="numeric" value={form.capacity} onChange={set} placeholder="No limit" aria-describedby="capacity-help" />
          </label>
          <p className="form-note help" id="capacity-help">
            <Icon name="users" size={15} />
            {initial ? `${initial.participantCount} registered so far. ` : ''}Leave empty for unlimited spots. Registration closes automatically when the limit is reached.
          </p>
        </div>
      </fieldset>

      <fieldset>
        <legend>Poster</legend>
        <div className="poster-field">
          <label className="file-drop">
            <Icon name="upload" size={22} />
            <span className="file-drop-title">{poster ? poster.name : 'Choose a poster image'}</span>
            <span className="muted">JPG, PNG, WEBP or GIF · max 3 MB</span>
            <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0] || null)} />
          </label>
          <figure className="poster-preview">
            <EventImage event={previewEvent} eager />
            <figcaption>{previewNote}</figcaption>
          </figure>
        </div>
      </fieldset>

      <div className="form-actions">
        <button className="btn btn-lg" disabled={saving}>
          {saving ? <><span className="spinner sm" aria-hidden="true" /> Saving…</> : submitLabel}
        </button>
      </div>
    </form>
  );
}
