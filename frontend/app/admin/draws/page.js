'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { formatCurrency, formatDate, getCurrentMonth } from '../../../lib/utils';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningDraw, setRunningDraw] = useState(false);
  const [drawMonth, setDrawMonth] = useState(getCurrentMonth());
  const [drawMode, setDrawMode] = useState('random');
  const [drawResult, setDrawResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [d, w] = await Promise.allSettled([api.getAdminDraws(), api.getPendingWinners()]);
        if (d.status === 'fulfilled') setDraws(d.value.draws || []);
        if (w.status === 'fulfilled') setWinners(w.value.winners || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleRunDraw(e) {
    e.preventDefault();
    setError('');
    setDrawResult(null);
    setRunningDraw(true);
    try {
      const result = await api.runDraw(drawMonth, drawMode);
      setDrawResult(result);
      const d = await api.getAdminDraws();
      setDraws(d.draws || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningDraw(false);
    }
  }

  async function handleVerify(winnerId, status) {
    try {
      await api.verifyWinner(winnerId, status);
      const w = await api.getPendingWinners();
      setWinners(w.winners || []);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🎲 Draw Management</h1>
        <p>Run monthly draws, view results, and verify winners.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Run Draw */}
        <div className="card card-glow">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Run Monthly Draw</h3>
          {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}
          
          <form onSubmit={handleRunDraw} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Month</label>
              <input type="month" className="input" value={drawMonth} onChange={(e) => setDrawMonth(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Mode</label>
              <select className="input" value={drawMode} onChange={(e) => setDrawMode(e.target.value)}>
                <option value="random">🎱 Random Lottery</option>
                <option value="weighted">🎯 Weighted (Score-based)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-gold" disabled={runningDraw}>
              {runningDraw ? <><span className="spinner spinner-sm"></span> Running Draw...</> : '🎰 Execute Draw'}
            </button>
          </form>

          {drawResult && (
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
              <h4 style={{ color: 'var(--color-gold-400)', marginBottom: 12 }}>✅ Draw Completed!</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {drawResult.winningNumbers?.map((n, i) => (
                  <div key={i} className="score-ball score-ball-jackpot">{n}</div>
                ))}
              </div>
              <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                <p>Entries: {drawResult.draw?.total_entries}</p>
                <p>5-match: {drawResult.distribution?.fiveMatchWinners || 0}</p>
                <p>4-match: {drawResult.distribution?.fourMatchWinners || 0}</p>
                <p>3-match: {drawResult.distribution?.threeMatchWinners || 0}</p>
                {drawResult.distribution?.jackpotRolledOver && (
                  <p className="text-gold" style={{ marginTop: 8 }}>💰 Jackpot rolled over!</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pending Winners */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Winner Verification</h3>
          {winners.filter(w => w.status === 'pending').length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div className="empty-icon">✅</div>
              <p className="text-muted">No pending verifications</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {winners.filter(w => w.status === 'pending').map((w) => (
                <div key={w.id} style={{
                  padding: '12px 14px', background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'
                }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{w.users?.full_name}</span>
                    <span className="badge badge-gold">{w.draw_results?.match_count}-match</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>
                    Prize: {formatCurrency(w.draw_results?.prize_amount || 0)} • 
                    {w.proof_url ? ' Proof submitted' : ' No proof yet'}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleVerify(w.id, 'verified')}>✓ Verify</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleVerify(w.id, 'rejected')}>✗ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Draw History */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-5)' }}>Draw History</h3>
        {draws.length === 0 ? (
          <p className="text-muted">No draws have been run yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Entries</th>
                  <th>Prize Pool</th>
                  <th>Rollover</th>
                  <th>Winning Numbers</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{formatDate(d.draw_month)}</td>
                    <td><span className="badge badge-info">{d.mode}</span></td>
                    <td><span className={`badge ${d.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                    <td>{d.total_entries}</td>
                    <td className="text-gold" style={{ fontWeight: 600 }}>{formatCurrency(d.prize_pool)}</td>
                    <td>{d.rollover_amount > 0 ? formatCurrency(d.rollover_amount) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {d.winning_numbers?.map((n, i) => (
                          <span key={i} className="score-ball" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>{n}</span>
                        ))}
                      </div>
                    </td>
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
