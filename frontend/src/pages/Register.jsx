import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerCustomer } from '../services/authService';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', address: '', nic: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await registerCustomer(form);
      login(data.customer, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Full Name',     type: 'text',     placeholder: 'John Silva',           required: true },
    { name: 'phone',    label: 'Phone Number',   type: 'tel',      placeholder: '+94 77 123 4567',      required: true },
    { name: 'email',    label: 'Email Address',  type: 'email',    placeholder: 'john@example.com',     required: true },
    { name: 'password', label: 'Password',        type: 'password', placeholder: 'Min. 8 characters',   required: true },
    { name: 'nic',      label: 'NIC Number',      type: 'text',     placeholder: '200012345678',         required: false },
    { name: 'address',  label: 'Address',          type: 'text',     placeholder: '123 Main St, Colombo', required: false },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">AC</span>
            </div>
            <span className="font-bold text-white text-xl">AutoCare <span className="text-orange-400">Pro</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Free forever. No credit card required.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="alert-error">{error}</div>}

            <div className="grid grid-cols-1 gap-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="label">
                    {f.label} {f.required && <span className="text-orange-500">*</span>}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    className="input"
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={f.required}
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary w-full justify-center !mt-6" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
