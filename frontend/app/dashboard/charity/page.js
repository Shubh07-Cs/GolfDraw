'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';

export default function CharityPage() {
  const [charities, setCharities] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [totalDonated, setTotalDonated] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [charityData, contribData] = await Promise.allSettled([
          api.getCharities(),
          api.getMyContributions(),
        ]);
        if (charityData.status === 'fulfilled') setCharities(charityData.value.charities || []);
        if (contribData.status === 'fulfilled') {
          setContributions(contribData.value.contributions || []);
          setTotalDonated(contribData.value.total_donated || '0.00');
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleSelect(charityId) {
    setSelecting(charityId);
    setSuccess('');
    try {
      const data = await api.selectCharity(charityId);
      setSuccess(`Charity selected! ${formatCurrency(data.contribution.amount)} will be donated this month.`);
      const contribData = await api.getMyContributions();
      setContributions(contribData.contributions || []);
      setTotalDonated(contribData.total_donated || '0.00');
    } catch (err) {
      alert(err.message);
    } finally {
      setSelecting(null);
    }
  }

  // Current month's selection
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const currentContrib = contributions.find(c => c.month === currentMonth);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Charities</h1></div>
        <div className="grid-3">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 250 }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>💝 Support a Charity</h1>
        <p>Choose a charity to support this month. 10% of your subscription (£1.00) goes directly to your chosen cause.</p>
      </div>

      {/* Total donated banner */}
      <div className="card card-glow" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Total Donations</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-400)' }}>
            {formatCurrency(parseFloat(totalDonated))}
          </div>
        </div>
        {currentContrib && (
          <div className="badge badge-success" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            ✓ This month: {currentContrib.charities?.name}
          </div>
        )}
      </div>

      {success && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80', padding: '14px 18px', borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)', fontSize: '0.9rem'
        }}>{success}</div>
      )}

      {/* Charity Cards */}
      <div className="grid-3">
        {charities.map((charity, i) => {
          const isSelected = currentContrib?.charity_id === charity.id;
          return (
            <div key={charity.id} className={`card card-interactive animate-slide-up`}
              style={{
                animationDelay: `${i * 0.08}s`,
                borderColor: isSelected ? 'var(--color-emerald-500)' : undefined,
                boxShadow: isSelected ? 'var(--shadow-glow)' : undefined
              }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                {['🌍', '🏌️', '🎖️', '⭐', '🕊️'][i % 5]}
              </div>
              <h4 style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>{charity.name}</h4>
              <p className="text-secondary" style={{ fontSize: '0.85rem', textAlign: 'center', marginBottom: 'var(--space-5)', lineHeight: 1.6 }}>
                {charity.description}
              </p>
              {charity.website && (
                <p style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                  <a href={charity.website} target="_blank" rel="noopener noreferrer" className="text-accent" style={{ fontSize: '0.8rem' }}>
                    Visit Website ↗
                  </a>
                </p>
              )}
              <button
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%' }}
                onClick={() => handleSelect(charity.id)}
                disabled={selecting === charity.id || isSelected}
              >
                {selecting === charity.id ? <span className="spinner spinner-sm"></span> : 
                 isSelected ? '✓ Selected This Month' : 'Support This Charity'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Contribution History */}
      {contributions.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-8)' }}>
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Donation History</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Charity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td>{formatDate(c.month)}</td>
                    <td>{c.charities?.name || 'Unknown'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-emerald-400)' }}>
                      {formatCurrency(c.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
