import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVehicle, getVehicleHistory } from '../services/vehicleService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVehicle(id), getVehicleHistory(id)])
      .then(([v, h]) => { setVehicle(v); setHistory(h); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!vehicle) return <div className="page-container"><p className="text-gray-500">Vehicle not found.</p></div>;

  const details = [
    ['Make', vehicle.make], ['Model', vehicle.model], ['Year', vehicle.year],
    ['Colour', vehicle.colour], ['Fuel Type', vehicle.fuelType], ['Mileage', `${vehicle.mileage?.toLocaleString() || 0} km`],
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/vehicles" className="hover:text-gray-300">My Vehicles</Link>
        <span>›</span>
        <span className="text-gray-300">{vehicle.make} {vehicle.model}</span>
      </div>

      {/* Header */}
      <div className="card p-6 flex items-center gap-6 mb-6">
        <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">🚗</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{vehicle.make} {vehicle.model}</h1>
            <StatusBadge status={vehicle.status || 'active'} />
          </div>
          <p className="text-gray-500">{vehicle.year} • {vehicle.colour}</p>
          <p className="text-orange-400 font-mono font-semibold text-lg mt-1">{vehicle.registrationNumber}</p>
        </div>
        <Link to="/appointments/new" className="btn-primary">Book Service</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Vehicle Details</h2>
          <dl className="space-y-3">
            {details.map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <dt className="text-gray-600">{key}</dt>
                <dd className="text-gray-200 font-medium capitalize">{val || '—'}</dd>
              </div>
            ))}
            {vehicle.lastServiceDate && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Last Service</dt>
                <dd className="text-gray-200">{new Date(vehicle.lastServiceDate).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Service History */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-white mb-4">Service History ({history.length})</h2>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">No service history yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className="flex items-start justify-between p-3 rounded-lg bg-[#141416]">
                  <div>
                    <p className="font-medium text-gray-200 text-sm">{h.serviceType}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(h.serviceDate).toLocaleDateString()}</p>
                    {h.summary && <p className="text-xs text-gray-600 mt-1 max-w-xs">{h.summary}</p>}
                  </div>
                  <span className="text-orange-400 font-semibold text-sm flex-shrink-0">
                    LKR {parseFloat(h.amountPaid || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
