import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyVehicles } from '../services/vehicleService';
import { getMyAppointments } from '../services/appointmentService';
import { getMyPayments } from '../services/paymentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [v, a, p] = await Promise.all([
          getMyVehicles(user.id),
          getMyAppointments(user.id),
          getMyPayments(user.id),
        ]);
        setVehicles(v);
        setAppointments(a);
        setPayments(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user]);

  if (loading) return <LoadingSpinner fullPage />;

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).slice(0, 3);
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
          <span className="text-orange-400">{user?.fullName?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your account</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Vehicles',       value: vehicles.length,            icon: '🚗', color: 'bg-blue-500/10',   link: '/vehicles' },
          { label: 'Appointments',      value: appointments.length,         icon: '📅', color: 'bg-orange-500/10', link: '/appointments' },
          { label: 'Pending Payments',  value: pendingPayments.length,      icon: '💳', color: 'bg-red-500/10',    link: '/payments' },
          { label: 'Total Spent',       value: `LKR ${payments.filter(p=>p.status==='paid').reduce((s,p)=>s+parseFloat(p.totalAmount||0),0).toLocaleString()}`, icon: '💰', color: 'bg-green-500/10', link: '/payments' },
        ].map((stat) => (
          <Link to={stat.link} key={stat.label} className="stat-card card-hover">
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/appointments/new" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📅</div>
          <div>
            <p className="font-semibold text-white">Book Appointment</p>
            <p className="text-xs text-gray-500">Schedule a new service</p>
          </div>
          <span className="ml-auto text-gray-600 group-hover:text-orange-400 transition-colors">→</span>
        </Link>
        <Link to="/vehicles/register" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🚗</div>
          <div>
            <p className="font-semibold text-white">Add Vehicle</p>
            <p className="text-xs text-gray-500">Register a new vehicle</p>
          </div>
          <span className="ml-auto text-gray-600 group-hover:text-orange-400 transition-colors">→</span>
        </Link>
        <Link to="/payments" className="card-hover p-5 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💳</div>
          <div>
            <p className="font-semibold text-white">View Invoices</p>
            <p className="text-xs text-gray-500">{pendingPayments.length} awaiting payment</p>
          </div>
          <span className="ml-auto text-gray-600 group-hover:text-orange-400 transition-colors">→</span>
        </Link>
      </div>

      {/* Upcoming appointments */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Upcoming Appointments</h2>
          <Link to="/appointments" className="text-orange-400 text-sm hover:text-orange-300">View all →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No upcoming appointments</p>
            <Link to="/appointments/new" className="btn-primary mt-4 inline-flex">Book Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(apt => (
              <Link to={`/appointments/${apt.id}`} key={apt.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#141416] hover:bg-[#1e1e24] transition-colors">
                <div>
                  <p className="font-medium text-gray-200 text-sm">{apt.serviceType}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(apt.appointmentDate).toLocaleString()}</p>
                </div>
                <StatusBadge status={apt.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
