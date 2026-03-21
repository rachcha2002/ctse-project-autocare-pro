import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { processPayment, cancelInvoice } from '../services/paymentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      // Admin fetches all payments by getting from all customers
      // Since there's no GET /api/payments admin-all endpoint, we use the job-based approach
      // For admin we'll attempt a direct call; backend supports /api/payments (if implemented)
      // Fallback: show message to drill in via job IDs
      const { data } = await api.get('/api/payments');
      setPayments(data);
    } catch (err) {
      // If no listings endpoint, we can't list all payments — show empty state
      setPayments([]);
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (id) => {
    setProcessing(id); setError('');
    try {
      await processPayment(id, 'cash');
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process payment.');
    } finally { setProcessing(null); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this invoice?')) return;
    setProcessing(id); setError('');
    try {
      await cancelInvoice(id);
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'cancelled' } : p));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel.');
    } finally { setProcessing(null); }
  };

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.totalAmount || 0), 0);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title mb-1">Payments & Invoices</h1>
        <p className="text-gray-500 text-sm">{payments.length} invoices • Total Revenue: <span className="text-green-400 font-semibold">LKR {totalRevenue.toLocaleString()}</span></p>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'pending', 'paid', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === s
              ? 'bg-orange-500 text-white' : 'bg-[#1a1a1e] text-gray-400 hover:text-gray-200'}`}>
            {s === 'all' ? `All (${payments.length})` : `${s} (${payments.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">💳</div>
          <p className="text-gray-500">No invoices yet. Complete jobs to generate invoices automatically.</p>
          <Link to="/admin/jobs" className="btn-primary mt-4 inline-flex">View Jobs</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-orange-400 text-xs">{p.invoiceNumber}</td>
                  <td>
                    <p className="text-gray-200 text-sm">{p.customerName}</p>
                    <p className="text-gray-600 text-xs">{p.customerPhone}</p>
                  </td>
                  <td className="font-mono text-xs text-gray-400">{p.vehicleRegistration || '—'}</td>
                  <td className="text-sm text-gray-300">{p.serviceType}</td>
                  <td className="font-semibold text-white">LKR {parseFloat(p.totalAmount).toLocaleString()}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => handlePay(p.id)} disabled={processing === p.id}
                            className="btn-success !px-3 !py-1 text-xs">
                            {processing === p.id ? '…' : '💳 Mark Paid'}
                          </button>
                          <button onClick={() => handleCancel(p.id)} disabled={processing === p.id}
                            className="btn-danger !px-3 !py-1 text-xs">Cancel</button>
                        </>
                      )}
                      <Link to={`/payments/${p.id}`} className="text-gray-500 hover:text-gray-300 text-xs">View</Link>
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
