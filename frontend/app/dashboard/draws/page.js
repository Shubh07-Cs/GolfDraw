'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';

export default function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wins, setWins] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [drawData, winsData] = await Promise.allSettled([
          api.getDrawResults(),
          api.getMyWins(),
        ]);
        if (drawData.status === 'fulfilled') setDraws(drawData.value.draws || []);
        if (winsData.status === 'fulfilled') setWins(winsData.value.wins || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Draw Results</h1></div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 200 }}></div>
          <div className="skeleton" style={{ height: 200 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🎰 Draw Results</h1>
        <p>View past monthly draws, winning numbers, and your match history.</p>
      </div>

      {/* My Wins */}
      {wins.length > 0 && (
        <div className="card card-gold" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🏆 My Wins</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {wins.map((win) => (
              <div key={win.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'rgba(245, 158, 11, 0.08)',
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <div>
                  <span style={{ fontWeight: 600 }}>
                    {win.draw_results?.match_count}-match winner
                  </span>
                  <span className="text-muted" style={{ marginLeft: 8 }}>
                    {win.draw_results?.draws?.draw_month ? formatDate(win.draw_results.draws.draw_month) : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-gold-400)' }}>
                    {formatCurrency(win.draw_results?.prize_amount || 0)}
                  </span>
                  <span className={`badge ${
                    win.status === 'verified' ? 'badge-success' : 
                    win.status === 'rejected' ? 'badge-error' : 'badge-warning'
                  }`}>{win.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draw History */}
      {draws.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎲</div>
            <h3>No draws yet</h3>
            <p>Monthly draws will appear here once they are completed by the admin.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {draws.map((draw) => (
            <div key={draw.id} className="card">
              <div className="flex-between" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3>{formatDate(draw.draw_month)}</h3>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span className="badge badge-emerald">{draw.mode} mode</span>
                    <span className="badge badge-success">{draw.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: '0.85rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-muted">Prize Pool</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-gold-400)' }}>{formatCurrency(draw.prize_pool)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-muted">Entries</div>
                    <div style={{ fontWeight: 700 }}>{draw.total_entries}</div>
                  </div>
                </div>
              </div>

              {/* Winning Numbers */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>Winning Numbers</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {draw.winning_numbers?.map((num, i) => (
                    <div key={i} className="score-ball score-ball-jackpot">{num}</div>
                  ))}
                </div>
              </div>

              {/* Winners */}
              {draw.draw_results && draw.draw_results.filter(r => r.match_count >= 3).length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>Winners</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {draw.draw_results
                      .filter(r => r.match_count >= 3)
                      .sort((a, b) => b.match_count - a.match_count)
                      .map((result) => (
                        <div key={result.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', background: 'var(--color-bg-elevated)',
                          borderRadius: 'var(--radius-sm)', fontSize: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{result.match_count === 5 ? '🥇' : result.match_count === 4 ? '🥈' : '🥉'}</span>
                            <span>{result.users?.full_name || 'Anonymous'}</span>
                            <span className="badge badge-emerald">{result.match_count} matches</span>
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--color-gold-400)' }}>
                            {formatCurrency(result.prize_amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Rollover info */}
              {draw.rollover_amount > 0 && (
                <div style={{
                  marginTop: 'var(--space-4)', padding: '10px 14px',
                  background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.15)', fontSize: '0.85rem'
                }}>
                  💰 <span className="text-gold" style={{ fontWeight: 600 }}>
                    {formatCurrency(draw.rollover_amount)}
                  </span> rolled over to next month's jackpot!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
