import { useEffect, useState } from 'react';
import * as clubService from '../services/clubService';
import { errorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import EventImage from '../components/EventImage';
import Icon from '../components/Icon';
import { EmptyState } from '../components/ui';

// Admin-only: manage the clubs that organize events
export default function Clubs() {
  const toast = useToast();
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({ name: '', members: 22 });
  const [editing, setEditing] = useState(null); // club id being edited
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => clubService.getClubs().then(setClubs).catch((err) => setError(errorMessage(err)));
  useEffect(() => { load(); }, []);

  const reset = () => { setForm({ name: '', members: 22 }); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (editing) await clubService.updateClub(editing, form);
      else await clubService.createClub(form);
      toast.success(editing ? 'Club updated' : `${form.name} added`);
      reset();
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  };

  const remove = async () => {
    setError('');
    setBusy(true);
    try {
      await clubService.deleteClub(toDelete._id);
      toast.success(`${toDelete.name} deleted`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
    setToDelete(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Manage clubs</h1>
          <p className="muted">{clubs.length} clubs organize events on campus.</p>
        </div>
      </div>
      {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}

      <form className={`card club-form ${editing ? 'is-editing' : ''}`} onSubmit={submit}>
        <span className="club-form-title">{editing ? 'Edit club' : 'Add a club'}</span>
        <label>Club name
          <input placeholder="e.g. Music Club" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>Members
          <input type="number" min="0" placeholder="Members" value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} required />
        </label>
        <div className="club-form-actions">
          <button className="btn" disabled={busy}>{editing ? <><Icon name="check" size={16} /> Update club</> : <><Icon name="plus" size={16} /> Add club</>}</button>
          {editing && <button type="button" className="btn btn-outline" onClick={reset}>Cancel</button>}
        </div>
      </form>

      {clubs.length === 0 ? (
        <div className="card"><EmptyState icon="flag" title="No clubs yet">Add the first club above.</EmptyState></div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Club</th><th className="num">Members</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c._id} className={editing === c._id ? 'row-active' : ''}>
                  <td>
                    <span className="club-cell">
                      <span className="thumb"><EventImage event={{ eventName: c.name, organizer: { name: c.name } }} /></span>
                      <strong>{c.name}</strong>
                    </span>
                  </td>
                  <td className="num">{c.members}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditing(c._id); setForm({ name: c.name, members: c.members }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Icon name="edit" size={15} /> Edit
                      </button>
                      <button className="btn btn-danger-outline btn-sm" onClick={() => setToDelete(c)}>
                        <Icon name="trash" size={15} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        danger
        busy={busy}
        title={`Delete ${toDelete?.name}?`}
        message="Clubs that still have events cannot be deleted."
        confirmLabel="Delete club"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
