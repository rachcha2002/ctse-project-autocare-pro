import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { confirmAppointment } from '../services/appointmentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      // GET all appointments — admin endpoint
      const { data } = await api.get('/api/appointments');
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments.');
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id) => {
    setConfirming(id);
    setError('');
    try {
      await confirmAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm appointment.');
    } finally { setConfirming(null); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Appointments</h1>
          <p className="text-gray-500 text-sm">{appointments.length} total</p>
        </div>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === s
              ? 'bg-orange-500 text-white' : 'bg-[#1a1a1e] text-gray-400 hover:text-gray-200'}`}>
            {s === 'all' ? `All (${appointments.length})` : `${s.replace('_', ' ')} (${appointments.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-600">No appointments found for this filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(apt => (
                <tr key={apt.id}>
                  <td className="font-mono text-xs text-gray-500">#{apt.id}</td>
                  <td><span className="text-xs text-gray-400">ID: {apt.customerId}</span></td>
                  <td className="font-medium text-gray-200">{apt.serviceType}</td>
                  <td className="text-xs">{new Date(apt.appointmentDate).toLocaleString()}</td>
                  <td><StatusBadge status={apt.status} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link to={`/appointments/${apt.id}`} className="text-gray-500 hover:text-gray-300 text-xs">View</Link>
                      {apt.status === 'pending' && (
                        <button onClick={() => handleConfirm(apt.id)} disabled={confirming === apt.id}
                          className="btn-success !px-3 !py-1 text-xs">
                          {confirming === apt.id ? '…' : '✓ Confirm'}
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <Link to={`/admin/jobs`} className="text-blue-400 hover:text-blue-300 text-xs">View Job →</Link>
                      )}
                    </div>
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
