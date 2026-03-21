import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments } from '../services/appointmentService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Admin() {
  const { user } = useAuth();
  // Admin dashboard shows aggregated stats
  // We load all appointments to derive pending/active/completed counts
  const [loading, setLoading] = useState(false);

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back, <span className="text-orange-400">{user?.fullName}</span>
          {' '}— <span className="capitalize text-gray-400">{user?.role}</span>
        </p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[
          { title: 'Appointments', desc: 'Review & confirm customer bookings', icon: '📅', link: '/admin/appointments', color: 'from-orange-500/10 to-orange-500/5', border: 'border-orange-500/20' },
          { title: 'Jobs',         desc: 'Assign mechanics & track progress',   icon: '🔧', link: '/admin/jobs',          color: 'from-blue-500/10 to-blue-500/5',   border: 'border-blue-500/20' },
          { title: 'Payments',     desc: 'Process invoices & mark as paid',     icon: '💳', link: '/admin/payments',      color: 'from-green-500/10 to-green-500/5', border: 'border-green-500/20' },
          { title: 'Customers',    desc: 'Browse registered customers',          icon: '👥', link: '/admin/customers',     color: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/20' },
        ].map(card => (
          <Link key={card.title} to={card.link}
            className={`card border ${card.border} bg-gradient-to-br ${card.color} p-6 block group hover:scale-[1.01] transition-all duration-200`}>
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{card.icon}</div>
            <h2 className="text-lg font-bold text-white mb-1">{card.title}</h2>
            <p className="text-sm text-gray-500">{card.desc}</p>
            <p className="text-orange-400 text-sm mt-3 group-hover:gap-2 transition-all">Manage →</p>
          </Link>
        ))}
      </div>

      {/* Workflow guide */}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-4">Service Workflow</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            { icon: '📅', step: 'Customer books', action: 'Confirm appointment →', link: '/admin/appointments' },
            { icon: '🔧', step: 'Job auto-created', action: 'Assign mechanic →', link: '/admin/jobs' },
            { icon: '⚙️', step: 'Work in progress', action: 'Track & complete →', link: '/admin/jobs' },
            { icon: '💳', step: 'Invoice generated', action: 'Process payment →', link: '/admin/payments' },
          ].map((s, i) => (
            <Link key={i} to={s.link} className="p-4 rounded-xl bg-[#141416] hover:bg-[#1e1e24] transition-colors">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-gray-300 font-medium mb-1">{s.step}</p>
              <p className="text-orange-400 text-xs">{s.action}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
