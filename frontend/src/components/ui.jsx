import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button className={`icon-btn theme-toggle ${className}`} onClick={toggleTheme} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

// Placeholder cards shown while event lists load
export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="card skeleton-card" key={i}>
          <div className="skeleton skeleton-img" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line mid" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = 'calendar', title, children, action }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, accent = 'sage', icon }) {
  return (
    <div className={`card stat accent-${accent}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon"><Icon name={icon} size={16} /></span>}
      </div>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

// Row of quick-access tiles on the dashboard: [{ to, icon, title, hint, accent }]
export function Shortcuts({ items }) {
  return (
    <nav className="shortcuts" aria-label="Quick links">
      {items.map((s) => (
        <Link key={s.to + s.title} to={s.to} className={`shortcut accent-${s.accent || 'forest'}`}>
          <span className="shortcut-icon"><Icon name={s.icon} size={20} /></span>
          <span className="shortcut-text">
            <strong>{s.title}</strong>
            {s.hint && <span>{s.hint}</span>}
          </span>
          <Icon name="arrowRight" size={16} className="shortcut-arrow" />
        </Link>
      ))}
    </nav>
  );
}

export function SectionHead({ title, eyebrow, to, linkLabel = 'View all' }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {to && (
        <Link to={to} className="text-link">
          {linkLabel} <Icon name="arrowRight" size={15} />
        </Link>
      )}
    </div>
  );
}
