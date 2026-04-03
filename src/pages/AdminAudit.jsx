// src/pages/AdminAudit.jsx
import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const EVENT_COLORS = {
  VOTE_CAST: '#1D9E75',
  VOTER_REGISTERED: '#185FA5',
  DUPLICATE_VOTE_BLOCKED: '#E24B4A',
  DUPLICATE_REGISTRATION: '#E24B4A',
  DUPLICATE_FINGERPRINT: '#E24B4A',
  AUTH_FAIL: '#BA7517',
  OTP_VERIFIED: '#1D9E75',
  OTP_SENT: '#185FA5',
  ADMIN_LOGIN: '#3C3489',
  ELECTION_CREATED: '#185FA5',
  ELECTION_STATUS_CHANGE: '#BA7517',
  VOTER_VERIFIED: '#1D9E75',
  FP_MISMATCH: '#E24B4A',
  SYSTEM: '#64748b',
}

export default function AdminAudit() {
  const [logs, setLogs] = useState([])
  const [duplicates, setDuplicates] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    Promise.all([
      api.get('/admin/audit', { params: { limit: 200 } }),
      api.get('/admin/duplicates'),
    ]).then(([a, d]) => {
      setLogs(a.data.logs)
      setTotal(a.data.total)
      setDuplicates(d.data)
    }).catch(() => toast.error('Failed to load audit log'))
    .finally(() => setLoading(false))
  }, [])

  const filtered = tab === 'all' ? logs : tab === 'duplicates' ? logs.filter(l => l.event_type.includes('DUPLICATE') || l.event_type.includes('FAIL')) : tab === 'votes' ? logs.filter(l => l.event_type.includes('VOTE')) : logs

  function exportLog() {
    const csv = 'Time,Event,Description,Actor,IP,Hash\n' + logs.map(l =>
      `"${new Date(l.created_at).toLocaleString('en-IN')}","${l.event_type}","${l.description || ''}","${l.actor || ''}","${l.ip_address || ''}","${l.event_hash}"`
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click()
    toast.success('Audit log exported')
  }

  return (
    <div className="page-content animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#0f2942' }}>Audit Log</h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Tamper-proof cryptographic event history · {total} events</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportLog}>Export CSV</button>
      </div>

      {duplicates.length > 0 && (
        <div className="alert alert-red" style={{ marginBottom: 20 }}>
          <span>⚠</span> <strong>{duplicates.length}</strong> duplicate vote attempt(s) detected and blocked. Review below.
        </div>
      )}

      <div className="tab-bar">
        {[['all','All Events'], ['votes','Votes'], ['duplicates','⚠ Alerts'], ['admin','Admin']].map(([k, label]) => (
          <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {/* Duplicate table if on alerts tab */}
      {tab === 'duplicates' && duplicates.length > 0 && (
        <div className="card" style={{ marginBottom: 20, border: '1.5px solid #FCEBEB' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#7f1d1d' }}>⚠ Blocked Duplicate Attempts</div>
          <table className="table">
            <thead><tr><th>Voter</th><th>Voter ID</th><th>Election</th><th>Type</th><th>IP</th><th>Time</th></tr></thead>
            <tbody>
              {duplicates.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.voter_name}</td>
                  <td><code style={{ fontSize: 11 }}>{d.voter_id}</code></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{d.election_title || '—'}</td>
                  <td><span className="badge badge-red">{d.attempt_type}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#64748b' }}>{d.ip_address}</td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(d.attempted_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div>No events found</div></div>
        ) : (
          <div style={{ padding: '0 0' }}>
            {filtered.map((log, i) => {
              const color = EVENT_COLORS[log.event_type] || '#64748b'
              const isAlert = log.event_type.includes('DUPLICATE') || log.event_type.includes('FAIL') || log.event_type.includes('MISMATCH')
              return (
                <div key={log.id} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f8fafc', background: isAlert ? '#fffbfb' : 'white', transition: 'background 0.1s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginTop: 4, flexShrink: 0 }} />
                    {i < filtered.length - 1 && <div style={{ width: 1, flex: 1, background: '#f1f5f9', marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color, background: color + '15', padding: '1px 7px', borderRadius: 4, fontFamily: 'JetBrains Mono', letterSpacing: 0.3 }}>{log.event_type}</span>
                      {log.actor && <span style={{ fontSize: 11, color: '#94a3b8' }}>by {log.actor}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#1e293b' }}>{log.description}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(log.created_at).toLocaleString('en-IN')}</span>
                      {log.ip_address && <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{log.ip_address}</span>}
                      <span style={{ fontSize: 10, color: '#cbd5e1', fontFamily: 'JetBrains Mono' }} title="Cryptographic hash">#{log.event_hash?.slice(0,12)}...</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
