import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPayment, processPayment, getReceipt } from '../services/paymentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PaymentDetails() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState('cash');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const p = await getPayment(id);
      setPayment(p);
      if (p.status === 'paid') {
        try { setReceipt(await getReceipt(id)); } catch { /* optional */ }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      await processPayment(id, payMethod);
      setSuccess('Payment processed successfully!');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally { setPaying(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!payment) return <div className="page-container"><p className="text-gray-500">Invoice not found.</p></div>;

  return (
    <div className="page-container max-w-xl animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/payments" className="hover:text-gray-300">Payments</Link>
        <span>›</span>
        <span className="text-gray-300">{payment.invoiceNumber}</span>
      </div>

      {/* Invoice Card */}
      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice</p>
            <h1 className="text-xl font-bold text-orange-400 font-mono">{payment.invoiceNumber}</h1>
          </div>
          <StatusBadge status={payment.status} />
        </div>

        {/* Customer & Vehicle */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Customer</p>
            <p className="text-white font-medium">{payment.customerName}</p>
            <p className="text-gray-500">{payment.customerPhone}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Vehicle</p>
            <p className="text-white font-mono font-medium">{payment.vehicleRegistration || '—'}</p>
            <p className="text-gray-500">{payment.serviceType}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="border-t border-b border-[#2a2a32] py-4 space-y-2 text-sm mb-4">
          <div className="flex justify-between text-gray-400">
            <span>Labour Cost</span>
            <span>LKR {parseFloat(payment.laborCost || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Parts Cost</span>
            <span>LKR {parseFloat(payment.partsCost || 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex justify-between font-bold text-white text-lg">
          <span>Total</span>
          <span className="text-orange-400">LKR {parseFloat(payment.totalAmount).toLocaleString()}</span>
        </div>

        {payment.status === 'paid' && (
          <div className="mt-4 text-sm text-gray-500">
            Paid via <span className="text-gray-300 capitalize">{payment.paymentMethod}</span>
            {' '}on{' '}{new Date(payment.paidAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Pay Now */}
      {payment.status === 'pending' && (
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Process Payment</h2>
          {error && <div className="alert-error mb-4">{error}</div>}
          {success && <div className="alert-success mb-4">{success}</div>}
          <div className="flex gap-3 mb-4">
            {['cash', 'card'].map(m => (
              <button key={m} type="button"
                onClick={() => setPayMethod(m)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${payMethod === m
                  ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-[#2a2a32] text-gray-400 hover:border-[#3a3a42]'}`}>
                {m === 'cash' ? '💵 Cash' : '💳 Card'}
              </button>
            ))}
          </div>
          <button onClick={handlePay} className="btn-primary w-full justify-center" disabled={paying}>
            {paying ? 'Processing…' : `Pay LKR ${parseFloat(payment.totalAmount).toLocaleString()} via ${payMethod}`}
          </button>
        </div>
      )}

      {/* Receipt */}
      {receipt && (
        <div className="card p-6 mt-5 border-green-500/20">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">✅ Receipt</h2>
          <p className="text-gray-500 text-sm text-center py-4">{receipt.footer}</p>
          <p className="text-xs text-gray-600 text-center">{receipt.receiptTitle}</p>
        </div>
      )}
    </div>
  );
}
