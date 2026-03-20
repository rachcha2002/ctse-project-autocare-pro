import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAppointment } from '../services/appointmentService';
import { getJobByAppointment } from '../services/jobService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppointmentDetails() {
  const { id } = useParams();
  const [apt, setApt] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const a = await getAppointment(id);
        setApt(a);
        if (['confirmed', 'in_progress', 'completed'].includes(a.status)) {
          try { setJob(await getJobByAppointment(id)); } catch { /* no job yet */ }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!apt) return <div className="page-container"><p className="text-gray-500">Appointment not found.</p></div>;

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/appointments" className="hover:text-gray-300">Appointments</Link>
        <span>›</span>
        <span className="text-gray-300">#{apt.id}</span>
      </div>

      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">{apt.serviceType}</h1>
            <p className="text-gray-500 mt-1">{new Date(apt.appointmentDate).toLocaleString()}</p>
          </div>
          <StatusBadge status={apt.status} />
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Appointment ID', `#${apt.id}`],
            ['Customer ID', apt.customerId],
            ['Vehicle ID', apt.vehicleId],
            ['Booked On', new Date(apt.createdAt).toLocaleDateString()],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-gray-600 mb-0.5">{k}</dt>
              <dd className="text-gray-200 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        {apt.notes && (
          <div className="mt-4 p-3 bg-[#141416] rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-300">{apt.notes}</p>
          </div>
        )}
      </div>

      {/* Linked Job */}
      {job && (
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            🔧 Linked Service Job
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Job #{job.id}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {job.assignedMechanic ? `Mechanic assigned` : 'Awaiting mechanic assignment'}
              </p>
              {job.status === 'completed' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Total: LKR {(parseFloat(job.laborCost || 0) + parseFloat(job.partsCost || 0)).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={job.status} />
            </div>
          </div>
          {job.workDescription && (
            <div className="mt-4 p-3 bg-[#141416] rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Work Done</p>
              <p className="text-sm text-gray-300">{job.workDescription}</p>
            </div>
          )}
        </div>
      )}

      {apt.status === 'pending' && (
        <div className="alert-info mt-4">
          ⏳ Your appointment is pending confirmation from our team. We'll update you soon.
        </div>
      )}
    </div>
  );
}
