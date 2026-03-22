import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPayment, stripePayment } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Tiny card-chip SVG ── */
const ChipIcon = () => (
  <svg width="34" height="26" viewBox="0 0 34 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="33" height="25" rx="3.5" fill="#c8a84b" stroke="#a8883b"/>
    <rect x="11" y="0.5" width="12" height="25" fill="#b8953e"/>
    <rect x="0.5" y="8" width="33" height="10" fill="#b8953e"/>
    <rect x="11" y="8" width="12" height="10" fill="#a8883b"/>
    <line x1="11" y1="0.5" x2="11" y2="25.5" stroke="#a8883b" strokeWidth="0.5"/>
    <line x1="23" y1="0.5" x2="23" y2="25.5" stroke="#a8883b" strokeWidth="0.5"/>
    <line x1="0.5" y1="8" x2="33.5" y2="8" stroke="#a8883b" strokeWidth="0.5"/>
    <line x1="0.5" y1="18" x2="33.5" y2="18" stroke="#a8883b" strokeWidth="0.5"/>
  </svg>
);

/* ── Visa-like logo ── */
const CardBrandIcon = ({ cardNumber }) => {
  const stripped = cardNumber.replace(/\s/g, '');
  if (stripped.startsWith('4')) {
    return (
      <span style={{
        fontFamily: '"Ultramagnetic", "Arial Black", sans-serif',
        fontStyle: 'italic',
        fontWeight: 900,
        fontSize: '22px',
        color: '#fff',
        letterSpacing: '-1px',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}>VISA</span>
    );
  }
  if (stripped.startsWith('5')) {
    return (
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>MC</span>
    );
  }
  return null;
};

/* ── format card number to XXXX XXXX XXXX XXXX ── */
const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

/* ── format expiry to MM/YY ── */
const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

export default function StripePaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cvvFocused, setCvvFocused] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPayment(id)
      .then(setPayment)
      .catch(() => {})
      .finally(() => setLoadingPage(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    const [mm] = expiry.split('/');
    if (!expiry.includes('/') || parseInt(mm) < 1 || parseInt(mm) > 12) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV.');
      return;
    }
    if (!cardHolder.trim()) {
      setError('Please enter the cardholder name.');
      return;
    }

    setSubmitting(true);
    // Small artificial delay for realism
    await new Promise(r => setTimeout(r, 800));

    try {
      await stripePayment(id, { cardNumber, expiry, cvv, cardHolder });
      navigate(`/payments/${id}?paid=1`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Payment failed. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loadingPage) return <LoadingSpinner fullPage />;
  if (!payment) return (
    <div className="page-container">
      <p className="text-gray-500">Invoice not found.</p>
    </div>
  );

  const cardDigits = cardNumber.replace(/\s/g, '').padEnd(16, '•');
  const displayGroups = [
    cardDigits.slice(0, 4),
    cardDigits.slice(4, 8),
    cardDigits.slice(8, 12),
    cardDigits.slice(12, 16),
  ];

  return (
    <div className="page-container max-w-lg animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to={`/payments/${id}`} className="hover:text-gray-300">Invoice {payment.invoiceNumber}</Link>
        <span>›</span>
        <span className="text-gray-300">Secure Payment</span>
      </div>

      {/* Amount banner */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1e1e24 0%, #2a1f0e 100%)', border: '1px solid #f97316/30' }}
      >
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Amount Due</p>
          <p className="text-3xl font-black text-white">
            LKR <span className="text-orange-400">{parseFloat(payment.totalAmount).toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">{payment.serviceType} · {payment.invoiceNumber}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl">
          🔒
        </div>
      </div>

      {/* Card visual */}
      <div
        className="relative w-full rounded-2xl mb-6 overflow-hidden select-none"
        style={{
          height: '190px',
          background: cvvFocused
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #1c1c22 0%, #2e1a0a 50%, #1a1207 100%)',
          border: '1px solid rgba(249,115,22,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          transition: 'background 0.5s ease',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '180px', height: '180px',
          borderRadius: '50%',
          background: 'rgba(249,115,22,0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-30px',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'rgba(249,115,22,0.05)',
          pointerEvents: 'none',
        }} />

        {/* Card content */}
        {!cvvFocused ? (
          <div className="relative p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <ChipIcon />
              <CardBrandIcon cardNumber={cardNumber} />
            </div>

            {/* Card number */}
            <div className="flex gap-4">
              {displayGroups.map((group, i) => (
                <span key={i} className="font-mono text-lg tracking-widest text-white/90">
                  {group}
                </span>
              ))}
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Card Holder</p>
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide truncate max-w-[180px]">
                  {cardHolder || '•••• •••••'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Expires</p>
                <p className="text-sm font-medium text-white/80 font-mono">
                  {expiry || 'MM/YY'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* CVV flip view */
          <div className="h-full flex flex-col justify-center">
            <div className="w-full h-10 bg-black/60 mb-4" />
            <div className="flex items-center justify-end px-5 gap-3">
              <div
                className="flex-1 h-8 rounded"
                style={{ background: 'repeating-linear-gradient(90deg, #555 0, #555 8px, #444 8px, #444 16px)' }}
              />
              <div className="bg-white/90 rounded px-3 py-1 font-mono text-black text-sm font-bold min-w-[48px] text-center">
                {cvv || '•••'}
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 mt-4">CVV</p>
          </div>
        )}
      </div>

      {/* Card form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {/* Card number */}
        <div>
          <label className="label">Card Number</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              className="input font-mono pr-10"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
              💳
            </span>
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="label">Cardholder Name</label>
          <input
            type="text"
            autoComplete="cc-name"
            placeholder="John Silva"
            className="input uppercase"
            value={cardHolder}
            onChange={e => setCardHolder(e.target.value)}
            required
          />
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Expiry Date</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              className="input font-mono"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="label">CVC / CVV</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="•••"
              className="input font-mono"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => setCvvFocused(true)}
              onBlur={() => setCvvFocused(false)}
              maxLength={4}
              required
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert-error flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-[#141416] rounded-lg p-3">
          <span>🔒</span>
          <span>Your payment is secured with 256-bit SSL encryption.</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full justify-center text-base py-3"
          style={submitting ? {} : { background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Processing Payment…
            </span>
          ) : (
            `Pay LKR ${parseFloat(payment.totalAmount).toLocaleString()}`
          )}
        </button>

        <Link
          to={`/payments/${id}`}
          className="block text-center text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          ← Back to Invoice
        </Link>
      </form>

      {/* Hint */}
      <p className="text-center text-xs text-gray-700 mt-4">
        Test card: <span className="font-mono text-gray-500">4242 4242 4242 4242</span> · Any expiry / CVC
      </p>
    </div>
  );
}
