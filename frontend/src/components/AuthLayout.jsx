import Brand from './Brand';

// Split layout for Login / Register: branded forest-green panel with poster artwork + form panel
const POSTERS = ['hackathon', 'cultural-night', 'film-screening'];

export default function AuthLayout({ children, quote = 'Every club, every stage, every idea — all in one loop.' }) {
  return (
    <div className="auth">
      <aside className="auth-visual">
        <div className="auth-posters" aria-hidden="true">
          {POSTERS.map((p) => (
            <img key={p} src={`/posters/${p}.svg`} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
          ))}
        </div>
        <div className="auth-visual-text">
          <Brand size={64} showName={false} className="auth-logo" />
          <span className="eyebrow light">College Loop</span>
          <p className="auth-quote">{quote}</p>
          <ul className="auth-tags">
            <li>Hackathons</li>
            <li>Cultural nights</li>
            <li>Workshops</li>
            <li>Screenings</li>
          </ul>
        </div>
      </aside>
      <section className="auth-panel">{children}</section>
    </div>
  );
}
