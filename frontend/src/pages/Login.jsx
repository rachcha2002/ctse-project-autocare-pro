import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginCustomer } from '../services/authService';
import logo from '../assets/logo.png';

export default function Login() {
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
      const data = await loginCustomer(email, password);
      login(data.customer, data.token);
      navigate('/dashboard');
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
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src={logo} alt="AutoCare Pro Logo" className="w-12 h-12 object-contain drop-shadow-md" />
            <span className="font-bold text-white text-2xl">AutoCare <span className="text-orange-400">Pro</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your customer account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="alert-error">{error}</div>}

            <div>
              <label className="label">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                id="password"
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
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">Create one free</Link>
            </p>
            <p className="text-gray-600 text-xs">
              Are you staff?{' '}
              <Link to="/staff-login" className="text-gray-400 hover:text-gray-200">Staff login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
