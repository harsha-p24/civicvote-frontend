// src/pages/VerifyPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function verify() {
    if (!code.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await api.get(`/votes/verify/${code.trim()}`)
      setResult(r.data)
    } catch (err) {
      setError(err.response?.status === 404 ? 'Receipt code not found. Please check and try again.' : 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2942 0%, #1a3a5c 60%, #0d3d2a 100%)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'white' }}>Civic<span style={{ color: '#1D9E75' }}>Vote</span></div>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>← Back to Voting</Link>
      </div>
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>Verify Your Vote</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Enter your receipt code to confirm your vote was counted</div>
        </div>
        <div className="card">
          <label className="label">Receipt Code</label>
          <input className="input" placeholder="RC-XXXXXXXX-XXXXXX" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && verify()} style={{ fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 12 }} />
          <button className="btn btn-civic" style={{ width: '100%', justifyContent: 'center' }} onClick={verify} disabled={loading || !code.trim()}>
            {loading ? <><div className="spinner" /> Verifying...</> : 'Verify Receipt'}
          </button>

          {error && <div className="alert alert-red" style={{ marginTop: 16 }}><span>✕</span> {error}</div>}

          {result && (
            <div style={{ marginTop: 20, animation: 'fadeIn 0.3s ease' }}>
              <div className="alert alert-green" style={{ marginBottom: 16 }}><span>✓</span> Vote verified and confirmed</div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['Election', result.election_title], ['Ward', result.ward], ['Candidate', result.candidate_name], ['Party', result.party], ['Auth Method', result.auth_method], ['Cast At', new Date(result.cast_at).toLocaleString('en-IN')]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#0f2942' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
