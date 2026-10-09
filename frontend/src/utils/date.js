// Event dates are stored as UTC midnight, so we always work with the "YYYY-MM-DD" part
export const dateKey = (iso) => String(iso).slice(0, 10);

export const formatDate = (iso, opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(`${dateKey(iso)}T00:00:00`).toLocaleDateString('en-IN', opts);

export const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isPast = (iso) => dateKey(iso) < todayKey();
