import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginStaff } from '../services/authService';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginStaff(email, password);
      // Store staff object; mark type as 'staff' so Navbar knows role
      login({ ...data.staff, type: 'staff' }, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">AC</span>
            </div>
            <span className="font-bold text-white text-xl">AutoCare <span className="text-orange-400">Pro</span></span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-4">
            <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">Staff Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Sign In</h1>
          <p className="text-gray-500 mt-1 text-sm">Admin and mechanic access</p>
        </div>

        <div className="card p-8 border-orange-500/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="alert-error">{error}</div>}

            <div>
              <label className="label">Staff Email</label>
              <input
                id="staff-email"
                type="email"
                className="input"
                placeholder="staff@autocarepro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                id="staff-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                  Signing in…
                </span>
              ) : 'Sign In to Staff Portal'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-6">
            Customer?{' '}
            <Link to="/login" className="text-gray-400 hover:text-gray-200">Customer login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
