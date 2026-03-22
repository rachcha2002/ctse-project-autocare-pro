import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJob, assignJob, startJob, updateJobProgress, completeJob, getMechanics } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminJobDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [progress, setProgress] = useState({ workDescription: '', sparePartsUsed: '', partsCost: '', laborCost: '' });
  const [completing, setCompleting] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const loadJob = async () => {
    try {
      const [j, m] = await Promise.all([getJob(id), getMechanics().catch(() => [])]);
      setJob(j);
      setMechanics(m);
      setProgress({
        workDescription: j.workDescription || '',
        sparePartsUsed: j.sparePartsUsed || '',
        partsCost: j.partsCost || '',
        laborCost: j.laborCost || '',
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadJob(); }, [id]);

  const doAction = async (label, fn) => {
    setError(''); setSuccess(''); setActionLoading(label);
    try { await fn(); setSuccess(`${label} successful!`); await loadJob(); }
    catch (err) { setError(err.response?.data?.error || `${label} failed.`); }
    finally { setActionLoading(''); }
  };

  const handleAssign = () => doAction('Assign', () => assignJob(id, parseInt(selectedMechanic)));
  const handleStart  = () => doAction('Start',  () => startJob(id));
  const handleProgress = () => doAction('Save Progress', () => updateJobProgress(id, {
    ...progress, partsCost: parseFloat(progress.partsCost), laborCost: parseFloat(progress.laborCost)
  }));
  const handleComplete = () => {
    if (!progress.workDescription || !progress.laborCost || !progress.partsCost) {
      setError('Please fill in work description, labour cost, and parts cost before completing.');
      return;
    }
    doAction('Complete', () => completeJob(id, {
      ...progress, partsCost: parseFloat(progress.partsCost), laborCost: parseFloat(progress.laborCost)
    }));
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!job) return <div className="page-container"><p className="text-gray-500">Job not found.</p></div>;

  return (
    <div className="page-container max-w-3xl animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/jobs" className="hover:text-gray-300">Jobs</Link>
        <span>›</span>
        <span className="text-gray-300">Job #{job.id}</span>
      </div>

      {/* Header */}
      <div className="card p-6 mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job #{job.id}</h1>
          <p className="text-gray-500 mt-1">{job.serviceType}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span>Vehicle #{job.vehicleId}</span>
            <span>•</span>
            <span>Customer #{job.customerId}</span>
            <span>•</span>
            <span>Appt #{job.appointmentId}</span>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}
      {success && <div className="alert-success mb-4">{success}</div>}

      {/* Assign Mechanic */}
      {!job.assignedMechanic && job.status !== 'completed' && user?.role === 'admin' && (
        <div className="card p-6 mb-5">
          <h2 className="font-semibold text-white mb-4">Assign Mechanic</h2>
          <div className="flex gap-3">
            <select className="input flex-1" value={selectedMechanic} onChange={e => setSelectedMechanic(e.target.value)}>
              <option value="">Select mechanic…</option>
              {mechanics.map(m => <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>)}
            </select>
            <button onClick={handleAssign} disabled={!selectedMechanic || actionLoading === 'Assign'}
              className="btn-primary flex-shrink-0">
              {actionLoading === 'Assign' ? '…' : 'Assign'}
            </button>
          </div>
          {mechanics.length === 0 && <p className="text-xs text-gray-600 mt-2">No mechanics found. Add staff in the CV service.</p>}
        </div>
      )}

      {/* Mechanic assigned */}
      {job.assignedMechanic && (
        <div className="card p-5 mb-5 border-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Assigned Mechanic</p>
            <p className="text-white font-medium">Mechanic #{job.assignedMechanic}</p>
          </div>
          {job.status === 'pending' && (user?.id === job.assignedMechanic || user?.role === 'admin') && (
            <button onClick={handleStart} disabled={actionLoading === 'Start'} className="btn-primary">
              {actionLoading === 'Start' ? '…' : '▶ Start Job'}
            </button>
          )}
        </div>
      )}

      {/* Progress Update */}
      {job.status !== 'completed' && job.status !== 'created' && (user?.id === job.assignedMechanic || user?.role === 'admin') && (
        <div className="card p-6 mb-5">
          <h2 className="font-semibold text-white mb-4">Work Progress</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Work Description <span className="text-orange-500">*</span></label>
              <textarea className="input h-24 resize-none" placeholder="What work is being done…"
                value={progress.workDescription} onChange={e => setProgress({ ...progress, workDescription: e.target.value })} />
            </div>
            <div>
              <label className="label">Spare Parts Used</label>
              <input className="input" placeholder="Oil filter, brake pads, etc." value={progress.sparePartsUsed}
                onChange={e => setProgress({ ...progress, sparePartsUsed: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Parts Cost (LKR) <span className="text-orange-500">*</span></label>
                <input type="number" className="input" placeholder="0.00" value={progress.partsCost}
                  onChange={e => setProgress({ ...progress, partsCost: e.target.value })} min="0" step="0.01" />
              </div>
              <div>
                <label className="label">Labour Cost (LKR) <span className="text-orange-500">*</span></label>
                <input type="number" className="input" placeholder="0.00" value={progress.laborCost}
                  onChange={e => setProgress({ ...progress, laborCost: e.target.value })} min="0" step="0.01" />
              </div>
            </div>
            {progress.partsCost && progress.laborCost && (
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#2a2a32]">
                <span className="text-gray-400">Total Estimate</span>
                <span className="text-orange-400">LKR {(parseFloat(progress.partsCost || 0) + parseFloat(progress.laborCost || 0)).toLocaleString()}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleProgress} disabled={actionLoading === 'Save Progress'} className="btn-secondary flex-1 justify-center">
                {actionLoading === 'Save Progress' ? '…' : '💾 Save Progress'}
              </button>
              {['in_progress', 'waiting_parts'].includes(job.status) && (
                <button onClick={handleComplete} disabled={!!actionLoading} className="btn-success flex-1 justify-center">
                  {actionLoading === 'Complete' ? '…' : '✅ Complete Job & Create Invoice'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completed */}
      {job.status === 'completed' && (
        <div className="card p-6 border-green-500/20">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">✅ Job Completed</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Work Done</dt>
              <dd className="text-gray-200 max-w-xs text-right">{job.workDescription}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Parts Used</dt>
              <dd className="text-gray-200">{job.sparePartsUsed || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Parts Cost</dt>
              <dd className="text-gray-200">LKR {parseFloat(job.partsCost || 0).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Labour Cost</dt>
              <dd className="text-gray-200">LKR {parseFloat(job.laborCost || 0).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between font-semibold border-t border-[#2a2a32] pt-2">
              <dt className="text-gray-300">Total</dt>
              <dd className="text-orange-400">LKR {(parseFloat(job.partsCost || 0) + parseFloat(job.laborCost || 0)).toLocaleString()}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <Link to="/admin/payments" className="btn-primary">View Invoices →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
