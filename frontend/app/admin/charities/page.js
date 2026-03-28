'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '', website: '' });
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  async function fetchCharities() {
    try {
      const data = await api.getCharities();
      setCharities(data.charities || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.updateCharity({ id: editing, ...formData });
      } else {
        await api.createCharity(formData);
      }
      setFormData({ name: '', description: '', website: '' });
      setEditing(null);
      await fetchCharities();
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    if (!confirm('Deactivate this charity?')) return;
    try {
      await api.deleteCharity(id);
      await fetchCharities();
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(charity) {
    setEditing(charity.id);
    setFormData({ name: charity.name, description: charity.description || '', website: charity.website || '' });
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🏛️ Charity Management</h1>
        <p>Add, edit, and manage charities available on the platform.</p>
      </div>

      <div className="grid-2">
        <div className="card card-glow">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>{editing ? 'Edit Charity' : 'Add New Charity'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Charity Name</label>
              <input type="text" className="input" placeholder="e.g. Golf for Good Foundation" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea className="input" rows={3} placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ resize: 'vertical', minHeight: 80 }} />
            </div>
            <div className="input-group">
              <label>Website URL</label>
              <input type="url" className="input" placeholder="https://example.org" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? <span className="spinner spinner-sm"></span> : editing ? 'Update Charity' : '+ Add Charity'}
              </button>
              {editing && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setFormData({name:'',description:'',website:''}); }}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-5)' }}>Active Charities ({charities.length})</h3>
          {charities.length === 0 ? (
            <p className="text-muted">No charities added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {charities.map((c, i) => (
                <div key={c.id} style={{
                  padding: '14px 16px', background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'
                }}>
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{['🌍','🏌️','🎖️','⭐','🕊️'][i%5]} {c.name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)} title="Edit">✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)} title="Deactivate">🗑️</button>
                    </div>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{c.description?.slice(0, 80)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
