import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/customers').then(({ data }) => setCustomers(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-1">Customers</h1>
          <p className="text-gray-500 text-sm">{customers.length} registered</p>
        </div>
        <input
          className="input !w-64"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-600">{search ? 'No customers match your search.' : 'No customers registered yet.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>NIC</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs text-gray-600">{c.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                        {(c.fullName || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-gray-200 font-medium">{c.fullName}</span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-sm">{c.email}</td>
                  <td className="text-gray-400 text-sm">{c.phone}</td>
                  <td className="text-gray-500 text-xs font-mono">{c.nic || '—'}</td>
                  <td className="text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
