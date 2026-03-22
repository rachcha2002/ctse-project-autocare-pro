import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false, superAdminOnly = false }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !superAdminOnly) {
    const isStaff = user?.role === 'admin' || user?.role === 'mechanic' || user?.type === 'staff';
    if (!isStaff) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (superAdminOnly) {
    if (user?.role !== 'admin') {
      return (
        <div className="page-container text-center py-24 animate-fade-in">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-500 mb-2">Unauthorized Access</h1>
          <p className="text-gray-400">You do not have permission to view the administrator controls.</p>
        </div>
      );
    }
  }

  return children;
}
