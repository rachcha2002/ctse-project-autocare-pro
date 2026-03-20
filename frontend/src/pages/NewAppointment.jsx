import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyVehicles } from '../services/vehicleService';
import { bookAppointment, getAvailableSlots } from '../services/appointmentService';

const SERVICE_TYPES = ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Tune-Up', 'Battery Replacement', 'AC Service', 'Transmission Service', 'Full Inspection', 'Body Work', 'Other'];

export default function NewAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ vehicleId: '', serviceType: '', appointmentDate: '', notes: '', selectedDate: '' });

  useEffect(() => {
    getMyVehicles(user.id).then(setVehicles).catch(console.error);
  }, [user]);

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const data = await getAvailableSlots(date);
      setAvailableSlots(data.availableSlots || []);
    } catch { setAvailableSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setForm({ ...form, selectedDate: date, appointmentDate: '' });
    if (date) fetchSlots(date);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const apt = await bookAppointment({ ...form, customerId: user.id });
      navigate(`/appointments/${apt.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed.');
      setStep(3);
    } finally { setSubmitting(false); }
  };

  const vehicle = vehicles.find(v => v.id === parseInt(form.vehicleId));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <h1 className="page-title">Book a Service Appointment</h1>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${step >= s ? 'bg-orange-500 text-white' : 'bg-[#2a2a32] text-gray-500'}`}>{s}</div>
            <span className={`text-sm hidden sm:block ${step >= s ? 'text-gray-300' : 'text-gray-600'}`}>
              {['Select Vehicle & Service', 'Pick Date & Time', 'Review & Confirm'][s - 1]}
            </span>
            {s < 3 && <div className={`h-0.5 flex-1 ${step > s ? 'bg-orange-500' : 'bg-[#2a2a32]'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-8">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-semibold text-white text-lg">Select Vehicle & Service</h2>
            <div>
              <label className="label">Vehicle <span className="text-orange-500">*</span></label>
              {vehicles.length === 0 ? (
                <div className="alert-info">No vehicles registered. <a href="/vehicles/register" className="underline">Add one first.</a></div>
              ) : (
                <div className="grid gap-3">
                  {vehicles.map(v => (
                    <button key={v.id} type="button"
                      onClick={() => setForm({ ...form, vehicleId: String(v.id) })}
                      className={`p-4 rounded-xl border text-left transition-all ${form.vehicleId === String(v.id)
                        ? 'border-orange-500 bg-orange-500/10' : 'border-[#2a2a32] bg-[#141416] hover:border-[#3a3a42]'}`}>
                      <p className="font-medium text-white">{v.make} {v.model} ({v.year})</p>
                      <p className="text-sm text-orange-400 font-mono">{v.registrationNumber}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label">Service Type <span className="text-orange-500">*</span></label>
              <select className="input" value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}>
                <option value="">Select a service…</option>
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Additional Notes</label>
              <textarea className="input h-24 resize-none" placeholder="Describe any specific issues…"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full justify-center"
              disabled={!form.vehicleId || !form.serviceType}>Continue →</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-semibold text-white text-lg">Pick Date & Time</h2>
            <div>
              <label className="label">Select Date <span className="text-orange-500">*</span></label>
              <input type="date" className="input" min={today} value={form.selectedDate} onChange={handleDateChange} />
            </div>
            {loadingSlots && <p className="text-gray-500 text-sm">Loading available slots…</p>}
            {form.selectedDate && !loadingSlots && (
              <div>
                <label className="label">Available Time Slots</label>
                {availableSlots.length === 0 ? (
                  <div className="alert-error">No slots available for this date. Please choose another day.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => {
                      const time = new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <button key={slot} type="button"
                          onClick={() => setForm({ ...form, appointmentDate: slot })}
                          className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${form.appointmentDate === slot
                            ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-[#2a2a32] bg-[#141416] text-gray-400 hover:border-[#3a3a42]'}`}>
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1 justify-center" disabled={!form.appointmentDate}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-semibold text-white text-lg">Review & Confirm</h2>
            {error && <div className="alert-error">{error}</div>}
            <div className="rounded-xl bg-[#141416] p-5 space-y-3">
              {[
                ['Vehicle', vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})` : '—'],
                ['Service', form.serviceType],
                ['Date & Time', form.appointmentDate ? new Date(form.appointmentDate).toLocaleString() : '—'],
                ['Notes', form.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-gray-200 font-medium text-right max-w-xs">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600">Your appointment will be reviewed by our team and confirmed shortly.</p>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">← Back</button>
              <button onClick={handleSubmit} className="btn-primary flex-1 justify-center" disabled={submitting}>
                {submitting ? 'Booking…' : '✓ Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
