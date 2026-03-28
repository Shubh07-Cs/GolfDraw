'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const data = await api.getReports();
        setReport(data.report);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Admin Dashboard</h1></div>
        <div className="grid-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120 }}></div>)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: report?.total_users || 0, icon: '👥', color: 'rgba(59, 130, 246, 0.15)' },
    { label: 'Active Subs', value: report?.active_subscriptions || 0, icon: '💳', color: 'rgba(16, 185, 129, 0.15)' },
    { label: 'Monthly Revenue', value: formatCurrency(parseFloat(report?.monthly_revenue || 0)), icon: '💰', color: 'rgba(245, 158, 11, 0.15)' },
    { label: 'Total Scores', value: report?.total_scores || 0, icon: '⛳', color: 'rgba(168, 85, 247, 0.15)' },
    { label: 'Completed Draws', value: report?.completed_draws || 0, icon: '🎲', color: 'rgba(236, 72, 153, 0.15)' },
    { label: 'Total Paid Out', value: formatCurrency(parseFloat(report?.total_paid_out || 0)), icon: '🏆', color: 'rgba(245, 158, 11, 0.15)' },
    { label: 'Charity Donated', value: formatCurrency(parseFloat(report?.total_charity_donated || 0)), icon: '💝', color: 'rgba(34, 197, 94, 0.15)' },
    { label: 'Pending Winners', value: report?.pending_winners || 0, icon: '⏳', color: 'rgba(239, 68, 68, 0.15)' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Platform overview and management hub.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex-between">
              <div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ fontSize: typeof stat.value === 'string' ? '1.4rem' : '2rem' }}>{stat.value}</div>
              </div>
              <div className="stat-icon" style={{ background: stat.color }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Rollover */}
      {report?.current_rollover > 0 && (
        <div className="card card-gold" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="flex-between">
            <div>
              <h3>💰 Current Jackpot Rollover</h3>
              <p className="text-secondary" style={{ marginTop: 4 }}>This amount will be added to next month's 5-match prize pool.</p>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-gold-400)' }}>
              {formatCurrency(report.current_rollover)}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-5)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <a href="/admin/draws" className="btn btn-primary">🎲 Run Monthly Draw</a>
          <a href="/admin/users" className="btn btn-secondary">👥 Manage Users</a>
          <a href="/admin/charities" className="btn btn-secondary">🏛️ Manage Charities</a>
          <a href="/admin/analytics" className="btn btn-secondary">📈 View Analytics</a>
        </div>
      </div>
    </div>
  );
}
