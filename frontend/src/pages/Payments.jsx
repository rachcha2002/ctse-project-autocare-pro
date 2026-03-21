import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPayments } from '../services/paymentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPayments(user.id).then(setPayments).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner fullPage />;

  const total = payments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.totalAmount || 0), 0);
  const pending = payments.filter(p => p.status === 'pending');

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title mb-1">My Payments</h1>
        <p className="text-gray-500 text-sm">{payments.length} invoice{payments.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Paid', value: `LKR ${total.toLocaleString()}`, icon: '✅', color: 'bg-green-500/10' },
          { label: 'Pending', value: pending.length, icon: '⏳', color: 'bg-yellow-500/10' },
          { label: 'All Invoices', value: payments.length, icon: '📄', color: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-xl font-semibold text-white mb-2">No invoices yet</h2>
          <p className="text-gray-500">Invoices will appear here after your vehicle service is completed.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Service</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-orange-400">{p.invoiceNumber}</td>
                  <td>{p.serviceType}</td>
                  <td className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="font-semibold text-white">LKR {parseFloat(p.totalAmount).toLocaleString()}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <Link to={`/payments/${p.id}`} className="text-orange-400 hover:text-orange-300 text-sm">
                      {p.status === 'pending' ? 'Pay Now →' : 'View →'}
                    </Link>
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
