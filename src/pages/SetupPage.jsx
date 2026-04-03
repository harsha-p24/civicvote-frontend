// src/pages/SetupPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function SetupPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSetup(e) {
    e.preventDefault()
    if (!username || password.length < 8) { toast.error('Username required and password must be 8+ chars'); return }
    setLoading(true)
    try {
      await api.post('/auth/setup', { username, password })
      toast.success('Admin account created!')
      navigate('/admin/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Setup failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2942 0%, #1a3a5c 60%, #0d3d2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 4 }}>Civic<span style={{ color: '#1D9E75' }}>Vote</span></div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>First-time Setup</div>
        </div>
        <form className="card" onSubmit={handleSetup}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Create Admin Account</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>This can only be done once. Disable this route after setup in production.</p>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoFocus />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Password (min 8 characters)</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-civic btn-lg" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={loading}>
            {loading ? <><div className="spinner" /> Creating...</> : 'Create Admin Account'}
          </button>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/admin/login" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Already have an account? Sign in →</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
