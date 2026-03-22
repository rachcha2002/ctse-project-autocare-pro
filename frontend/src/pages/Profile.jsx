import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomerProfile, updateCustomerProfile } from '../services/customerService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', nic: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getCustomerProfile(user.id)
      .then(data => {
        setForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
          nic: data.nic || ''
        });
      })
      .catch(err => setError('Failed to load profile data.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateCustomerProfile(user.id, form);
      // Update the auth context so the Navbar instantly shows the new name
      login(updated, localStorage.getItem('token'));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container max-w-xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title mb-1">My Profile</h1>
          <p className="text-gray-500 text-sm">Update your personal information and contact details.</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-3xl">
          🧑‍💼
        </div>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <div>
            <label className="label">Full Name <span className="text-orange-500">*</span></label>
            <input
              name="fullName"
              className="input"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Phone Number <span className="text-orange-500">*</span></label>
            <input
              name="phone"
              className="input"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Home Address</label>
            <textarea
              name="address"
              className="input h-20 resize-none"
              placeholder="123 Main Street..."
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">NIC (National Identity Card)</label>
            <input
              name="nic"
              className="input uppercase"
              placeholder="199XXXXXXXXX"
              value={form.nic}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 border-t border-[#2a2a32]">
            <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>
              {saving ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
