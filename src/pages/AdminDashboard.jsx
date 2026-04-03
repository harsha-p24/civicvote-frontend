// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../utils/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [elections, setElections] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/elections'),
    ]).then(([s, e]) => {
      setStats(s.data)
      setElections(e.data)
      const active = e.data.find(el => el.status === 'active')
      if (active) return api.get(`/elections/${active.id}/results`).then(r => setResults(r.data.candidates || []))
    }).finally(() => setLoading(false))
  }, [])

  const metrics = stats ? [
    { label: 'Registered Voters', value: stats.totalVoters, color: '#0f2942' },
    { label: 'Votes Cast', value: stats.totalVotes, color: '#1D9E75' },
    { label: 'Duplicates Blocked', value: stats.duplicatesBlocked, color: '#E24B4A' },
    { label: 'Active Elections', value: stats.activeElections, color: '#BA7517' },
  ] : []

  const turnout = stats?.totalVoters > 0 ? Math.round((stats.totalVotes / stats.totalVoters) * 100) : 0
  const chartColors = ['#185FA5','#1D9E75','#3C3489','#993C1D','#BA7517']

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div className="page-content animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#0f2942' }}>Dashboard</h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Real-time election overview</div>
        </div>
        <Link to="/admin/elections" className="btn btn-primary btn-sm">+ New Election</Link>
      </div>

      {stats?.duplicatesBlocked > 0 && (
        <div className="alert alert-red" style={{ marginBottom: 20 }}>
          <span>⚠</span> <strong>{stats.duplicatesBlocked}</strong> duplicate vote attempt(s) have been detected and blocked. <Link to="/admin/audit" style={{ color: 'inherit', fontWeight: 600 }}>View audit log →</Link>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-label">{m.label}</div>
            <div className="metric-value" style={{ color: m.color }}>{m.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Turnout progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Voter Turnout</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1D9E75' }}>{turnout}%</span>
        </div>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${turnout}%`, background: '#1D9E75' }} />
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{stats?.totalVotes} of {stats?.totalVoters} registered voters have voted</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Live results chart */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Live Results</div>
          {results.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={results} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Votes']} labelFormatter={l => l} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="vote_count" radius={[4,4,0,0]}>
                  {results.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">📊</div><div>No votes cast yet</div></div>
          )}
        </div>

        {/* Elections */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Elections</div>
            <Link to="/admin/elections" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {elections.length > 0 ? elections.slice(0, 5).map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{e.ward} · {e.total_votes} votes</div>
              </div>
              <span className={`badge ${e.status === 'active' ? 'badge-green' : e.status === 'closed' ? 'badge-gray' : 'badge-blue'}`}>
                {e.status}
              </span>
            </div>
          )) : (
            <div className="empty-state"><div>No elections yet</div></div>
          )}
        </div>
      </div>
    </div>
  )
}
