import { useState, useEffect } from 'react';
import { getStaffMembers, createStaffMember, deleteStaffMember } from '../services/staffService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Creation Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'mechanic', password: '' });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    try {
      const data = await getStaffMembers();
      setStaff(data);
    } catch (err) {
      setError('Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError(''); setSuccess('');
    try {
      await createStaffMember(form);
      setSuccess('Staff member created successfully!');
      setShowForm(false);
      setForm({ fullName: '', email: '', phone: '', role: 'mechanic', password: '' });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Creation failed.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you absolutely sure you want to completely remove this staff member? This action cannot be undone.')) return;
    setDeletingId(id); setError(''); setSuccess('');
    try {
      await deleteStaffMember(id);
      setSuccess('Staff member removed successfully.');
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove staff member.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Staff Management</h1>
          <p className="text-gray-500 text-sm">Manage Admins and Mechanics</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel Creation' : '+ Add New Staff'}
        </button>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}
      {success && <div className="alert-success mb-4">{success}</div>}

      {showForm && (
        <div className="card p-6 mb-8 border-orange-500/30">
          <h2 className="font-semibold text-white mb-4">Provision New Account</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name <span className="text-orange-500">*</span></label>
                <input name="fullName" className="input" value={form.fullName} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Email Address <span className="text-orange-500">*</span></label>
                <input type="email" name="email" className="input" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Phone Number <span className="text-orange-500">*</span></label>
                <input name="phone" className="input" value={form.phone} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Account Role <span className="text-orange-500">*</span></label>
                <select name="role" className="input" value={form.role} onChange={handleChange} required>
                  <option value="mechanic">Mechanic</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Temporary Password <span className="text-orange-500">*</span></label>
                <input type="password" name="password" className="input" minLength={6} value={form.password} onChange={handleChange} required />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long.</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No staff members found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td className="font-mono text-gray-500 text-xs">#{s.id}</td>
                  <td className="font-medium text-white">{s.fullName}</td>
                  <td>
                    <p className="text-sm text-gray-300">{s.email}</p>
                    <p className="text-xs text-gray-500">{s.phone}</p>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize tracking-wide ${s.role === 'admin' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="text-sm text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      disabled={deletingId === s.id}
                      className="btn-danger !px-3 !py-1 text-xs"
                    >
                      {deletingId === s.id ? 'Removing...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
