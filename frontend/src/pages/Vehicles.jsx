import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyVehicles } from '../services/vehicleService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyVehicles(user.id).then(setVehicles).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">My Vehicles</h1>
          <p className="text-gray-500 text-sm">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Link to="/vehicles/register" className="btn-primary">+ Add Vehicle</Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-xl font-semibold text-white mb-2">No vehicles yet</h2>
          <p className="text-gray-500 mb-6">Register your vehicle to start booking service appointments.</p>
          <Link to="/vehicles/register" className="btn-primary inline-flex">Register Your First Vehicle</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map(v => (
            <Link to={`/vehicles/${v.id}`} key={v.id} className="card-hover p-5 block group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🚗</div>
                <StatusBadge status={v.status || 'active'} />
              </div>
              <h3 className="font-bold text-white text-lg">{v.make} {v.model}</h3>
              <p className="text-gray-500 text-sm">{v.year} • {v.colour}</p>
              <div className="mt-3 pt-3 border-t border-[#2a2a32] flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Registration</p>
                  <p className="text-sm font-mono font-semibold text-orange-400">{v.registrationNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Fuel Type</p>
                  <p className="text-sm text-gray-300 capitalize">{v.fuelType || '—'}</p>
                </div>
              </div>
              {v.lastServiceDate && (
                <p className="text-xs text-gray-600 mt-3">
                  Last service: {new Date(v.lastServiceDate).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
