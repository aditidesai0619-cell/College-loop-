import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import CalendarPage from './pages/CalendarPage';
import MyEvents from './pages/MyEvents';
import Participants from './pages/Participants';
import Clubs from './pages/Clubs';
import SavedEvents from './pages/SavedEvents';

const staff = ['admin', 'organizer'];

export default function App() {
  // Login/Register use a full-width split layout; every other page uses the standard container
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      <Navbar />
      <main className={isAuthPage ? 'auth-main' : 'container'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/events/new" element={<ProtectedRoute roles={staff}><CreateEvent /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/events/:id/edit" element={<ProtectedRoute roles={staff}><EditEvent /></ProtectedRoute>} />
          <Route path="/events/:id/participants" element={<ProtectedRoute roles={staff}><Participants /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute roles={['student']}><SavedEvents /></ProtectedRoute>} />
          <Route path="/clubs" element={<ProtectedRoute roles={['admin']}><Clubs /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
