'use client';
import { useState } from 'react';
import { useScores } from '../../../hooks/useScores';
import { formatDate } from '../../../lib/utils';

export default function ScoresPage() {
  const { scores, stats, loading, addScore, deleteScore } = useScores();
  const [formData, setFormData] = useState({ score: '', course_name: '', played_at: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await addScore(
        parseInt(formData.score),
        formData.course_name,
        formData.played_at
      );
      setFormData({ score: '', course_name: '', played_at: '' });
      setSuccess('Score added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this score?')) return;
    try {
      await deleteScore(id);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>My Scores</h1>
        </div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 300 }}></div>
          <div className="skeleton" style={{ height: 300 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>⛳ My Scores</h1>
        <p>Track your last 5 golf scores. New scores replace the oldest automatically.</p>
      </div>

      <div className="grid-2">
        {/* Score Entry Form */}
        <div className="card card-glow">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Submit New Score</h3>

          {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}
          {success && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80', padding: '12px 16px', borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem', marginBottom: 16
            }}>{success}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Score</label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 85"
                min="18"
                max="200"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Course Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. St Andrews Old Course"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Date Played</label>
              <input
                type="date"
                className="input"
                value={formData.played_at}
                onChange={(e) => setFormData({ ...formData, played_at: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner spinner-sm"></span> : '+ Add Score'}
            </button>
          </form>

          {stats && (
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Slots used</span>
                <span style={{ fontWeight: 600 }}>{stats.count}/{stats.max_scores}</span>
              </div>
              <div style={{
                height: 6, background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', width: `${(stats.count / stats.max_scores) * 100}%`,
                  background: 'linear-gradient(90deg, var(--color-emerald-500), var(--color-emerald-400))',
                  borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Score History */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 'var(--space-5)' }}>
            <h3>Score History</h3>
            {stats && (
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Best</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald-400)' }}>{stats.best || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Avg</div>
                  <div style={{ fontWeight: 700 }}>{stats.average || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Worst</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-error)' }}>{stats.worst || '—'}</div>
                </div>
              </div>
            )}
          </div>

          {scores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏌️</div>
              <h3>No scores yet</h3>
              <p>Submit your first score to start tracking your golf performance.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scores.map((sc, index) => (
                <div key={sc.id} className="animate-slide-up" style={{
                  animationDelay: `${index * 0.05}s`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="score-ball" style={{
                      background: sc.score <= (stats?.average || 100)
                        ? 'linear-gradient(135deg, var(--color-emerald-600), var(--color-emerald-400))'
                        : 'var(--color-bg-card)',
                      color: sc.score <= (stats?.average || 100) ? 'white' : 'var(--color-text-primary)',
                      borderColor: sc.score <= (stats?.average || 100) ? 'var(--color-emerald-400)' : 'var(--color-border)'
                    }}>
                      {sc.score}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sc.course_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(sc.played_at)}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(sc.id)} className="btn btn-ghost btn-sm" title="Remove">🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
