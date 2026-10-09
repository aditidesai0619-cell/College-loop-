import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects to login when logged out, and to the dashboard when the role is not allowed
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
