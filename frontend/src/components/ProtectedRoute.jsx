import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const isStaff = user?.role === 'admin' || user?.role === 'mechanic' || user?.type === 'staff';
    if (!isStaff) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
