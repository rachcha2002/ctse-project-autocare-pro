import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getVehicle, updateVehicle } from '../services/vehicleService';
import LoadingSpinner from '../components/LoadingSpinner';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg'];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function VehicleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ brand: '', model: '', year: '', fuelType: '', currentMileage: '' });
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getVehicle(id)
      .then(data => {
        setVehicle(data);
        setForm({
          brand: data.brand || '',
          model: data.model || '',
          year: data.year || '',
          fuelType: data.fuelType || 'petrol',
          currentMileage: data.currentMileage || ''
        });
      })
      .catch(err => setError('Failed to load vehicle data.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        year: parseInt(form.year),
        fuelType: form.fuelType,
        currentMileage: parseInt(form.currentMileage) || 0
      };
      await updateVehicle(id, payload);
      navigate(`/vehicles/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update vehicle details.');
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!vehicle) return <div className="page-container"><p className="text-gray-500">Vehicle not found.</p></div>;

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/vehicles" className="hover:text-gray-300 transition-colors">My Vehicles</Link>
        <span>›</span>
        <Link to={`/vehicles/${id}`} className="hover:text-gray-300 transition-colors">{vehicle.registrationNumber}</Link>
        <span>›</span>
        <span className="text-gray-300">Edit</span>
      </div>

      <h1 className="page-title mb-6">Edit Vehicle Details</h1>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="alert-error">{error}</div>}

          <div className="p-4 bg-[#141416] rounded-xl border border-[#2a2a32] flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Registration</p>
              <p className="text-white font-mono font-bold text-lg">{vehicle.registrationNumber}</p>
            </div>
            <div className="text-4xl">🚗</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Make <span className="text-orange-500">*</span></label>
              <input name="brand" className="input" placeholder="Toyota" value={form.brand} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Model <span className="text-orange-500">*</span></label>
              <input name="model" className="input" placeholder="Corolla" value={form.model} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Year <span className="text-orange-500">*</span></label>
              <select name="year" className="input" value={form.year} onChange={handleChange} required>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fuel Type</label>
              <select name="fuelType" className="input" value={form.fuelType} onChange={handleChange}>
                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Current Mileage (km)</label>
            <input name="currentMileage" type="number" className="input" placeholder="50000" value={form.currentMileage} onChange={handleChange} min="0" />
            <p className="text-xs text-gray-500 mt-2">Update this to keep your vehicle service records accurate.</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#2a2a32]">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link to={`/vehicles/${id}`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
