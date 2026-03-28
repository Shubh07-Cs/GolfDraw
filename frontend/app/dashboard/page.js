'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { subscription, isActive, subscribe } = useSubscription();
  const [scores, setScores] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [scoresData, drawData, contribData] = await Promise.allSettled([
          api.getScores(),
          api.getLatestDraw(),
          api.getMyContributions(),
        ]);
        if (scoresData.status === 'fulfilled') setScores(scoresData.value.scores || []);
        if (drawData.status === 'fulfilled') setLatestDraw(drawData.value.draw);
        if (contribData.status === 'fulfilled') setContributions(contribData.value.contributions || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const avgScore = scores.length > 0
    ? (scores.reduce((s, sc) => s + sc.score, 0) / scores.length).toFixed(1)
    : '—';

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: 200, height: 30, marginBottom: 8 }}></div>
          <div className="skeleton" style={{ width: 300, height: 18 }}></div>
        </div>
        <div className="grid-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120 }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Welcome back, {user?.profile?.full_name?.split(' ')[0] || 'Golfer'} 👋</h1>
        <p>Here's your GolfDraw overview for this month.</p>
      </div>

      {/* Subscription Banner */}
      {!isActive && (
        <div className="card card-gold" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ color: 'var(--color-gold-400)' }}>🔒 Unlock Full Access</h3>
            <p className="text-secondary" style={{ marginTop: 4 }}>Subscribe to submit scores, enter draws, and support charities.</p>
          </div>
          <button className="btn btn-gold" onClick={subscribe}>Subscribe — £9.99/mo</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card stat-card animate-slide-up stagger-1">
          <div className="flex-between">
            <div>
              <div className="stat-label">My Scores</div>
              <div className="stat-value">{scores.length}/5</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-emerald-400)' }}>⛳</div>
          </div>
        </div>

        <div className="card stat-card animate-slide-up stagger-2">
          <div className="flex-between">
            <div>
              <div className="stat-label">Avg Score</div>
              <div className="stat-value">{avgScore}</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)' }}>📊</div>
          </div>
        </div>

        <div className="card stat-card animate-slide-up stagger-3">
          <div className="flex-between">
            <div>
              <div className="stat-label">Subscription</div>
              <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                {isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-warning">Inactive</span>}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-gold-400)' }}>💳</div>
          </div>
        </div>

        <div className="card stat-card animate-slide-up stagger-4">
          <div className="flex-between">
            <div>
              <div className="stat-label">Donated</div>
              <div className="stat-value">
                {formatCurrency(contributions.reduce((s, c) => s + parseFloat(c.amount), 0))}
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>💝</div>
          </div>
        </div>
      </div>

      {/* Recent Scores + Latest Draw */}
      <div className="grid-2">
        {/* Recent Scores */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 'var(--space-5)' }}>
            <h3>Recent Scores</h3>
            <a href="/dashboard/scores" className="btn btn-ghost btn-sm">View All →</a>
          </div>
          {scores.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div className="empty-icon">⛳</div>
              <p className="text-muted">No scores submitted yet. Start tracking your game!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scores.slice(0, 5).map((score) => (
                <div key={score.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)', fontSize: '0.9rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{score.course_name}</span>
                    <span className="text-muted" style={{ marginLeft: 8, fontSize: '0.8rem' }}>
                      {formatDate(score.played_at)}
                    </span>
                  </div>
                  <div className="score-ball" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>{score.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Draw */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 'var(--space-5)' }}>
            <h3>Latest Draw</h3>
            <a href="/dashboard/draws" className="btn btn-ghost btn-sm">All Draws →</a>
          </div>
          {!latestDraw ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div className="empty-icon">🎰</div>
              <p className="text-muted">No draws completed yet. Stay tuned!</p>
            </div>
          ) : (
            <div>
              <p className="text-muted" style={{ marginBottom: 12, fontSize: '0.85rem' }}>
                Winning Numbers — {formatDate(latestDraw.draw_month)}
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {latestDraw.winning_numbers?.map((num, i) => (
                  <div key={i} className="score-ball score-ball-jackpot">{num}</div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div>
                  <span className="text-muted">Prize Pool: </span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(latestDraw.prize_pool)}</span>
                </div>
                <div>
                  <span className="text-muted">Entries: </span>
                  <span style={{ fontWeight: 600 }}>{latestDraw.total_entries}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
