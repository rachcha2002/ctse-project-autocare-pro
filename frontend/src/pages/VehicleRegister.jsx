import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerVehicle } from '../services/vehicleService';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg'];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function VehicleRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    make: '', model: '', year: '', registrationNumber: '', colour: '', fuelType: 'petrol', mileage: '', customerId: user?.id,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        customerId: form.customerId,
        registrationNumber: form.registrationNumber,
        brand: form.make,
        model: form.model,
        year: parseInt(form.year),
        fuelType: form.fuelType,
        currentMileage: parseInt(form.mileage) || 0
      };
      const vehicle = await registerVehicle(payload);
      navigate(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/vehicles" className="hover:text-gray-300 transition-colors">My Vehicles</Link>
        <span>›</span>
        <span className="text-gray-300">Register Vehicle</span>
      </div>

      <h1 className="page-title">Register a Vehicle</h1>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="alert-error">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Make <span className="text-orange-500">*</span></label>
              <input id="make" name="make" className="input" placeholder="Toyota" value={form.make} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Model <span className="text-orange-500">*</span></label>
              <input id="model" name="model" className="input" placeholder="Corolla" value={form.model} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Year <span className="text-orange-500">*</span></label>
              <select id="year" name="year" className="input" value={form.year} onChange={handleChange} required>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Colour <span className="text-orange-500">*</span></label>
              <input id="colour" name="colour" className="input" placeholder="White" value={form.colour} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="label">Registration Number <span className="text-orange-500">*</span></label>
            <input id="registrationNumber" name="registrationNumber" className="input font-mono uppercase"
              placeholder="ABC-1234" value={form.registrationNumber} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fuel Type</label>
              <select id="fuelType" name="fuelType" className="input" value={form.fuelType} onChange={handleChange}>
                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Current Mileage (km)</label>
              <input id="mileage" name="mileage" type="number" className="input" placeholder="50000" value={form.mileage} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Registering…' : 'Register Vehicle'}
            </button>
            <Link to="/vehicles" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
