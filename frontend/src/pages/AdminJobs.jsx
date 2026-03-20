import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

// Admin Jobs page — fetches recent appointments and shows linked jobs
// Since there's no GET /api/jobs list endpoint, we browse via appointment IDs
export default function AdminJobs() {
  const [appointments, setAppointments] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: apts } = await api.get('/api/appointments');
        const confirmed = apts.filter(a => ['confirmed', 'in_progress', 'completed'].includes(a.status));
        setAppointments(apts);
        // Fetch jobs for confirmed+ appointments in parallel
        const results = await Promise.allSettled(
          confirmed.map(a => api.get(`/api/jobs/appointment/${a.id}`))
        );
        const map = {};
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') map[confirmed[i].id] = r.value.data;
        });
        setJobsMap(map);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const allJobs = Object.values(jobsMap);
  const filtered = filter === 'all' ? allJobs : allJobs.filter(j => j.status === filter);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title mb-1">Service Jobs</h1>
        <p className="text-gray-500 text-sm">{allJobs.length} active jobs</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'created', 'pending', 'in_progress', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === s
              ? 'bg-orange-500 text-white' : 'bg-[#1a1a1e] text-gray-400 hover:text-gray-200'}`}>
            {s === 'all' ? `All (${allJobs.length})` : `${s.replace('_',' ')} (${allJobs.filter(j => j.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🔧</div>
          <p className="text-gray-500">No jobs yet. Confirm appointments to auto-create jobs.</p>
          <Link to="/admin/appointments" className="btn-primary mt-4 inline-flex">Go to Appointments</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Service</th>
                <th>Vehicle</th>
                <th>Mechanic</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id}>
                  <td className="font-mono text-xs text-gray-500">#{job.id}</td>
                  <td className="font-medium text-gray-200">{job.serviceType}</td>
                  <td className="text-xs text-gray-400">Vehicle #{job.vehicleId}</td>
                  <td className="text-xs text-gray-400">
                    {job.assignedMechanic ? `Mechanic #${job.assignedMechanic}` : <span className="text-yellow-500">Unassigned</span>}
                  </td>
                  <td><StatusBadge status={job.status} /></td>
                  <td>
                    <Link to={`/admin/jobs/${job.id}`} className="btn-secondary !px-3 !py-1 text-xs">
                      Manage →
                    </Link>
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
