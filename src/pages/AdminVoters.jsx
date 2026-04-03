// src/pages/AdminVoters.jsx
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { generateVoterTemplate } from '../utils/fingerprint'

export default function AdminVoters() {
  const [voters, setVoters] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ voterId: '', name: '', ward: '', phone: '' })
  const [scanCount, setScanCount] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [templates, setTemplates] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/voters', { params: { search, limit: 100 } })
      setVoters(r.data.voters)
      setTotal(r.data.total)
    } catch { toast.error('Failed to load voters') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  async function simulateScan() {
    if (scanning || scanCount >= 3) return
    if (!form.voterId) { toast.error('Enter Voter ID first'); return }
    setScanning(true)
    await new Promise(r => setTimeout(r, 1800))
    const t = generateVoterTemplate(form.voterId, scanCount + 1)
    setTemplates(prev => [...prev, t])
    setScanCount(prev => prev + 1)
    setScanning(false)
    toast.success(`Scan ${scanCount + 1}/3 captured`)
  }

  async function handleRegister() {
    if (!form.voterId || !form.name || !form.ward) { toast.error('Fill all required fields'); return }
    if (scanCount < 3) { toast.error('Complete all 3 fingerprint scans'); return }
    setSubmitting(true)
    try {
      await api.post('/voters/register', {
        voterId: form.voterId, name: form.name, ward: form.ward, phone: form.phone,
        fpTemplate1: templates[0], fpTemplate2: templates[1], fpTemplate3: templates[2],
      })
      toast.success('Voter registered successfully')
      setForm({ voterId: '', name: '', ward: '', phone: '' })
      setScanCount(0); setTemplates([]); setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="page-content animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#0f2942' }}>Voters</h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{total} registered</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Register Voter'}
        </button>
      </div>

      {/* Registration form */}
      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: 24, border: '1.5px solid #e2e8f0' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>New Voter Registration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="label">Voter ID *</label>
                  <input className="input" placeholder="VID-2024-XXXXX" value={form.voterId} onChange={e => setForm(f => ({ ...f, voterId: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="label">Ward / Constituency *</label>
                  <input className="input" placeholder="Ward 14" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Mobile (for OTP)</label>
                  <input className="input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <label className="label" style={{ textAlign: 'center' }}>Fingerprint Enrollment (3 scans required)</label>
              <div
                className={`fp-scanner w-36 h-36 ${scanning ? 'scanning' : scanCount === 3 ? 'success' : ''}`}
                onClick={simulateScan}
                style={{ cursor: scanCount >= 3 || scanning ? 'default' : 'pointer' }}
              >
                <div className="scan-beam" />
                <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
                  <path d="M22 6C13.2 6 6 13.2 6 22s7.2 16 16 16 16-7.2 16-16S30.8 6 22 6z" stroke={scanCount===3?'#1D9E75':'#94a3b8'} strokeWidth="1.5" fill="none"/>
                  <path d="M22 11c-6.1 0-11 4.9-11 11" stroke={scanCount===3?'#1D9E75':'#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M22 15c-3.9 0-7 3.1-7 7" stroke={scanCount===3?'#1D9E75':'#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M22 11c6.1 0 11 4.9 11 11" stroke={scanCount===3?'#1D9E75':'#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M22 15c3.9 0 7 3.1 7 7" stroke={scanCount===3?'#1D9E75':'#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 12, color: scanCount === 3 ? '#1D9E75' : '#94a3b8' }}>
                  {scanning ? 'Scanning...' : scanCount === 3 ? '✓ All 3 done' : `Scan ${scanCount + 1}/3`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 32, height: 6, borderRadius: 3, background: i < scanCount ? '#1D9E75' : '#e2e8f0', transition: 'background 0.3s' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setScanCount(0); setTemplates([]); setForm({ voterId:'', name:'', ward:'', phone:'' }) }}>Cancel</button>
            <button className="btn btn-civic" onClick={handleRegister} disabled={submitting || scanCount < 3}>
              {submitting ? <><div className="spinner" /> Registering...</> : 'Register Voter'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input className="input" placeholder="Search by name or voter ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Voter ID</th><th>Name</th><th>Ward</th><th>Phone</th><th>Voted</th><th>Dup. Attempts</th><th>Registered</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading...</td></tr>
              ) : voters.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">👤</div><div>No voters found</div></div></td></tr>
              ) : voters.map(v => (
                <tr key={v.id}>
                  <td><code style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{v.voter_id}</code></td>
                  <td style={{ fontWeight: 500 }}>{v.name}</td>
                  <td>{v.ward}</td>
                  <td style={{ color: '#64748b' }}>{v.phone || '—'}</td>
                  <td><span className={`badge ${v.has_voted ? 'badge-green' : 'badge-gray'}`}>{v.has_voted ? 'Voted' : 'Pending'}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    {v.dup_attempts > 0 ? <span className="badge badge-red">{v.dup_attempts}</span> : <span style={{ color: '#94a3b8' }}>0</span>}
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(v.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
