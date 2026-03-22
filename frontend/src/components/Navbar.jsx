import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'mechanic' || user?.type === 'staff';
  const isActive = (path) => location.pathname.startsWith(path) ? 'text-orange-400 font-semibold' : 'text-gray-400 hover:text-gray-100';

  return (
    <nav className="bg-[#111113] border-b border-[#2a2a32] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={logo} alt="AutoCare Pro Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            <span className="font-bold text-white text-lg tracking-tight hidden sm:block">
              AutoCare <span className="text-orange-400">Pro</span>
            </span>
          </Link>

          {/* Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {isAdmin ? (
                <>
                  {user?.role === 'admin' && <Link to="/admin" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/admin')}`}>Dashboard</Link>}
                  {user?.role === 'admin' && <Link to="/admin/appointments" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/admin/appointments')}`}>Appointments</Link>}
                  <Link to="/admin/jobs" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/admin/jobs')}`}>Jobs</Link>
                  {user?.role === 'admin' && <Link to="/admin/customers" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/admin/customers')}`}>Customers</Link>}
                  {user?.role === 'admin' && <Link to="/admin/staff" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/admin/staff')}`}>Staff</Link>}
                  {user?.role === 'admin' && <Link to="/admin/payments" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/admin/payments')}`}>Payments</Link>}
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
                  <Link to="/profile" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/profile')}`}>My Profile</Link>
                  <Link to="/vehicles" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/vehicles')}`}>My Vehicles</Link>
                  <Link to="/appointments" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/appointments')}`}>Appointments</Link>
                  <Link to="/payments" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive('/payments')}`}>Payments</Link>
                </>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-orange-400 font-semibold text-xs">
                      {(user?.fullName || user?.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-200 leading-none">{user?.fullName || user?.name}</p>
                    <p className="text-xs text-orange-400 mt-0.5 capitalize">{user?.role || 'customer'}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-sm !px-3 !py-1.5">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm !px-3 !py-1.5">Login</Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-1.5">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
