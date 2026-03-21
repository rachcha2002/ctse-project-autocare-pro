import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, cancelAppointment } from '../services/appointmentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = async () => {
    try {
      const data = await getMyAppointments(user.id);
      setAppointments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.id) load(); }, [user]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    setCancelling(id);
    try {
      await cancelAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel.');
    } finally { setCancelling(null); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">My Appointments</h1>
          <p className="text-gray-500 text-sm">{appointments.length} total</p>
        </div>
        <Link to="/appointments/new" className="btn-primary">+ Book New</Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-white mb-2">No appointments yet</h2>
          <p className="text-gray-500 mb-6">Book your first service appointment to get started.</p>
          <Link to="/appointments/new" className="btn-primary inline-flex">Book Appointment</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="card p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📅</div>
                <div className="min-w-0">
                  <p className="font-medium text-white">{apt.serviceType}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{new Date(apt.appointmentDate).toLocaleString()}</p>
                  {apt.notes && <p className="text-xs text-gray-600 mt-1 truncate">{apt.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={apt.status} />
                <Link to={`/appointments/${apt.id}`} className="text-gray-500 hover:text-gray-300 text-sm">Details →</Link>
                {['pending'].includes(apt.status) && (
                  <button onClick={() => handleCancel(apt.id)} disabled={cancelling === apt.id}
                    className="btn-danger !px-3 !py-1.5 text-xs">
                    {cancelling === apt.id ? '…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
