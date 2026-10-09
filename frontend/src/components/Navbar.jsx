import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/clubs';
import Icon from './Icon';
import Brand from './Brand';
import { ThemeToggle } from './ui';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`navbar ${open ? 'is-open' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand" aria-label="College Loop home">
          <Brand size={38} />
        </Link>

        {user && (
          <nav className="nav-links" id="main-nav" aria-label="Main">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/events" end>Discover</NavLink>
            <NavLink to="/calendar">Calendar</NavLink>
            <NavLink to="/my-events">{user.role === 'student' ? 'My Events' : 'Club Events'}</NavLink>
            {user.role === 'student' && <NavLink to="/saved">Saved</NavLink>}
            {user.role !== 'student' && <NavLink to="/events/new">Create Event</NavLink>}
            {user.role === 'admin' && <NavLink to="/clubs">Clubs</NavLink>}
            <button className="nav-logout-mobile" onClick={handleLogout}>
              <Icon name="logout" size={16} /> Log out
            </button>
          </nav>
        )}

        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <>
              <div className="nav-user" title={`${user.name} · ${user.role}`}>
                <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
                <span className="nav-user-text">
                  <span className="nav-name">{user.name}</span>
                  <span className="nav-role">{user.role === 'organizer' && user.club?.name ? user.club.name : user.role}</span>
                </span>
              </div>
              <button className="icon-btn nav-logout" onClick={handleLogout} aria-label="Log out" title="Log out">
                <Icon name="logout" size={18} />
              </button>
              <button className="icon-btn nav-burger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav">
                <Icon name={open ? 'close' : 'menu'} size={20} />
              </button>
            </>
          ) : (
            pathname !== '/login' && <Link to="/login" className="btn btn-sm">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
