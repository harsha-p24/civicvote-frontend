// src/pages/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    if (!username || !password) { toast.error('Enter username and password'); return }
    setLoading(true)
    try {
      await login(username, password)
      navigate('/admin')
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2942 0%, #1a3a5c 60%, #0d3d2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 4 }}>Civic<span style={{ color: '#1D9E75' }}>Vote</span></div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Admin Portal</div>
        </div>
        <form className="card" onSubmit={handleLogin}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Sign In</h2>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoFocus />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={loading}>
            {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In →'}
          </button>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>← Back to Voting</Link>
          </div>
        </form>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/setup" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>First time? Setup admin account →</Link>
        </div>
      </div>
    </div>
  )
}
