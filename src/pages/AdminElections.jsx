// src/pages/AdminElections.jsx
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const COLORS = ['#185FA5','#1D9E75','#3C3489','#993C1D','#BA7517','#E24B4A']

export default function AdminElections() {
  const [elections, setElections] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', ward: '', startTime: '', endTime: '' })
  const [candidates, setCandidates] = useState([{ name: '', party: '', initials: '', color: COLORS[0] }, { name: '', party: '', initials: '', color: COLORS[1] }])
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const r = await api.get('/elections')
      setElections(r.data)
      for (const e of r.data) {
        if (e.status !== 'upcoming') {
          api.get(`/elections/${e.id}/results`).then(res => setResults(prev => ({ ...prev, [e.id]: res.data }))).catch(() => {})
        }
      }
    } catch { toast.error('Failed to load elections') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function addCandidate() {
    setCandidates(prev => [...prev, { name: '', party: '', initials: '', color: COLORS[prev.length % COLORS.length] }])
  }

  function updateCandidate(i, field, val) {
    setCandidates(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }

  function removeCandidate(i) {
    if (candidates.length <= 2) { toast.error('At least 2 candidates required'); return }
    setCandidates(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleCreate() {
    if (!form.title || !form.ward) { toast.error('Title and ward required'); return }
    if (candidates.some(c => !c.name || !c.party)) { toast.error('Fill all candidate details'); return }
    setSubmitting(true)
    try {
      await api.post('/elections', {
        ...form,
        candidates: candidates.map(c => ({ ...c, initials: c.initials || c.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() }))
      })
      toast.success('Election created!')
      setShowForm(false)
      setForm({ title: '', description: '', ward: '', startTime: '', endTime: '' })
      setCandidates([{ name: '', party: '', initials: '', color: COLORS[0] }, { name: '', party: '', initials: '', color: COLORS[1] }])
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create election')
    } finally { setSubmitting(false) }
  }
async function handleDelete(id, title) {
  if (!window.confirm(`Delete "${title}"? This will remove all votes and candidates. This cannot be undone.`)) return;
  try {
    await api.delete(`/elections/${id}`);
    toast.success('Election deleted');
    load();
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to delete');
  }
}
  async function updateStatus(id, status) {
    try {
      await api.patch(`/elections/${id}/status`, { status })
      toast.success(`Election ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    }
  }

  const statusColor = { upcoming: 'badge-blue', active: 'badge-green', closed: 'badge-gray' }

  return (
    <div className="page-content animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#0f2942' }}>Elections</h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{elections.length} total</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Create Election'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: 24, border: '1.5px solid #e2e8f0' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Create New Election</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label">Election Title *</label>
              <input className="input" placeholder="Ward 14 Mayoral Election 2024" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Ward / Constituency *</label>
              <input className="input" placeholder="Ward 14 — Koramangala" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Description</label>
            <textarea className="input textarea" placeholder="Election description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label className="label">Start Time</label>
              <input className="input" type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input className="input" type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>

          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Candidates</div>
            <button className="btn btn-outline btn-sm" onClick={addCandidate}>+ Add Candidate</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {candidates.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 40px 32px', gap: 10, alignItems: 'end' }}>
                <div>
                  {i === 0 && <label className="label">Full Name</label>}
                  <input className="input" placeholder="Candidate name" value={c.name} onChange={e => updateCandidate(i, 'name', e.target.value)} />
                </div>
                <div>
                  {i === 0 && <label className="label">Party</label>}
                  <input className="input" placeholder="Party name" value={c.party} onChange={e => updateCandidate(i, 'party', e.target.value)} />
                </div>
                <div>
                  {i === 0 && <label className="label">Initials</label>}
                  <input className="input" placeholder="AB" maxLength={2} value={c.initials} onChange={e => updateCandidate(i, 'initials', e.target.value.toUpperCase())} />
                </div>
                <div>
                  {i === 0 && <label className="label">Color</label>}
                  <input type="color" value={c.color} onChange={e => updateCandidate(i, 'color', e.target.value)} style={{ width: 40, height: 38, border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 3 }} />
                </div>
                <div style={{ paddingBottom: 2 }}>
                  {i === 0 && <div style={{ height: 21 }} />}
                  <button className="btn btn-ghost btn-sm" onClick={() => removeCandidate(i)} style={{ padding: '8px', color: '#E24B4A' }}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? <><div className="spinner" /> Creating...</> : 'Create Election'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
      ) : elections.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🗳️</div><div>No elections yet. Create your first one.</div></div></div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {elections.map(e => {
            const res = results[e.id]
            const total = res?.totalVotes || 0
            const winner = res?.candidates?.[0]
            return (
              <div key={e.id} className="card card-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{e.ward} · {e.candidate_count} candidates · {total} votes cast</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge ${statusColor[e.status]}`}>{e.status}</span>
                    {e.status === 'upcoming' && <button className="btn btn-civic btn-sm" onClick={() => updateStatus(e.id, 'active')}>Open</button>}
                    {e.status === 'active' && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(e.id, 'closed')}>Close</button>}
		    <button className="btn btn-sm" onClick={() => handleDelete(e.id, e.title)} style={{color:'#E24B4A',borderColor:'#E24B4A'}}>Delete</button>
   </div>
                </div>
                {res?.candidates && res.candidates.length > 0 && (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {res.candidates.map((c, i) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name} <span style={{ fontSize: 11, color: '#94a3b8' }}>— {c.party}</span></span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.vote_count} {total > 0 && <span style={{ fontWeight: 400, color: '#94a3b8' }}>({Math.round(c.vote_count/total*100)}%)</span>}</span>
                          </div>
                          <div className="progress"><div className="progress-fill" style={{ width: `${total ? c.vote_count/total*100 : 0}%`, background: c.color }} /></div>
                        </div>
                        {i === 0 && total > 0 && <span className="badge badge-green" style={{ fontSize: 10 }}>Leading</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
