'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { formatCurrency } from '../../../lib/utils';

export default function AdminAnalyticsPage() {
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getReports();
        setReport(data.report);
        setLogs(data.recent_logs || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Analytics</h1></div>
        <div className="skeleton" style={{ height: 400 }}></div>
      </div>
    );
  }

  const revenueBreakdown = parseFloat(report?.monthly_revenue || 0);
  const prizePool = revenueBreakdown * 0.5;
  const charityPortion = revenueBreakdown * 0.1;
  const platformRevenue = revenueBreakdown * 0.4;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>📈 Analytics</h1>
        <p>Platform performance metrics and revenue breakdown.</p>
      </div>

      {/* Revenue Breakdown */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-6)' }}>Monthly Revenue Breakdown</h3>
        <div className="grid-4">
          <div style={{ textAlign: 'center' }}>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Total Revenue</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
              {formatCurrency(revenueBreakdown)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Prize Pool (50%)</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-gold-400)' }}>
              {formatCurrency(prizePool)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Charity (10%)</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald-400)' }}>
              {formatCurrency(charityPortion)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Platform (40%)</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-info)' }}>
              {formatCurrency(platformRevenue)}
            </div>
          </div>
        </div>

        {/* Visual bar */}
        <div style={{ height: 24, borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex', marginTop: 'var(--space-6)' }}>
          <div style={{ width: '50%', background: 'linear-gradient(90deg, var(--color-gold-600), var(--color-gold-400))' }} title="Prize Pool"></div>
          <div style={{ width: '10%', background: 'linear-gradient(90deg, var(--color-emerald-600), var(--color-emerald-400))' }} title="Charity"></div>
          <div style={{ width: '40%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }} title="Platform"></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem' }}>
          <span className="text-gold">■ Prize Pool 50%</span>
          <span className="text-accent">■ Charity 10%</span>
          <span style={{ color: 'var(--color-info)' }}>■ Platform 40%</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--color-emerald-400)' }}>
            {report?.active_subscriptions || 0}
          </div>
          <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>Active Subscribers</div>
          <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: 2 }}>
            of {report?.total_users || 0} total users
          </div>
          <div style={{ height: 4, background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-full)', marginTop: 12 }}>
            <div style={{
              height: '100%', borderRadius: 'var(--radius-full)',
              width: `${report?.total_users > 0 ? ((report.active_subscriptions / report.total_users) * 100) : 0}%`,
              background: 'var(--color-emerald-500)'
            }}></div>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--color-gold-400)' }}>
            {formatCurrency(parseFloat(report?.total_paid_out || 0))}
          </div>
          <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>Total Prizes Paid</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#ec4899' }}>
            {formatCurrency(parseFloat(report?.total_charity_donated || 0))}
          </div>
          <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>Total Charitable Donations</div>
        </div>
      </div>

      {/* Admin Activity Log */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-5)' }}>Recent Admin Activity</h3>
        {logs.length === 0 ? (
          <p className="text-muted">No admin activity logged yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 15).map((log) => (
                  <tr key={log.id}>
                    <td>{log.users?.full_name || log.admin_id}</td>
                    <td><span className="badge badge-info">{log.action}</span></td>
                    <td className="text-muted">{log.target_type}:{log.target_id?.slice(0, 8)}...</td>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
