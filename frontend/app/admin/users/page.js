'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await api.getUsers(page, 20, search);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, [page]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>View and manage all platform users.</p>
      </div>

      <div className="card">
        <div className="flex-between" style={{ marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 12 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
          <span className="text-muted">{total} users total</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Subscription</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>
                  <div className="spinner spinner-sm" style={{ margin: '0 auto' }}></div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32 }} className="text-muted">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-info'}`}>{u.role}</span></td>
                  <td>{u.subscriptions && u.subscriptions.length > 0 ? (
                    <span className={`badge ${u.subscriptions[0].status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {u.subscriptions[0].status}
                    </span>
                  ) : <span className="text-muted">None</span>}</td>
                  <td className="text-muted">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex-center gap-3" style={{ marginTop: 'var(--space-5)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Prev</button>
            <span className="text-muted">Page {page}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p+1)} disabled={users.length < 20}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
