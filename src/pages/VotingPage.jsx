// src/pages/VotingPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { generateVoterTemplate } from '../utils/fingerprint'
import FingerprintScanner from '../components/FingerprintScanner'

const STEP = { IDENTIFY: 1, SELECT: 2, CONFIRM: 3, DONE: 4 }

export default function VotingPage() {
  const [step, setStep] = useState(STEP.IDENTIFY)
  const [elections, setElections] = useState([])
  const [selectedElection, setSelectedElection] = useState(null)
  const [voterId, setVoterId] = useState('')
  const [voter, setVoter] = useState(null)
  const [fpScanned, setFpScanned] = useState(false)
  const [fpTemplate, setFpTemplate] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [otp, setOtp] = useState(['','','','','',''])
  const [devOtp, setDevOtp] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [receipt, setReceipt] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    api.get('/elections').then(r => {
      const active = r.data.filter(e => e.status === 'active')
      setElections(active)
      if (active.length === 1) loadElection(active[0].id)
    }).catch(() => {})
  }, [])

  async function loadElection(id) {
    const r = await api.get(`/elections/${id}`)
    setSelectedElection(r.data)
  }

  async function handleFpScan(template) {
    setFpTemplate(template)
    setFpScanned(true)
  }

  async function verifyIdentity() {
    if (!voterId.trim()) { toast.error('Enter your Voter ID'); return }
    if (!fpScanned && !otpMode) { toast.error('Scan your fingerprint first'); return }
    if (!selectedElection) { toast.error('No active election found'); return }
    setVerifying(true)
    try {
      let voterData
      if (otpMode) {
        const otpStr = otp.join('')
        if (otpStr.length !== 6) { toast.error('Enter 6-digit OTP'); setVerifying(false); return }
        const r = await api.post('/otp/verify', { voterId, otp: otpStr, electionId: selectedElection.id })
        voterData = r.data.voter
      } else {
        const r = await api.post('/voters/verify-fingerprint', {
          voterId, fpTemplate1: fpTemplate, fpTemplate2: fpTemplate, fpTemplate3: fpTemplate,
          electionId: selectedElection.id
        })
        voterData = r.data.voter
      }
      setVoter(voterData)
      setStep(STEP.SELECT)
      toast.success(`Welcome, ${voterData.name}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed'
      if (err.response?.data?.isDuplicate) {
        toast.error('You have already voted in this election!', { duration: 6000 })
      } else {
        toast.error(msg)
      }
    } finally {
      setVerifying(false)
    }
  }

  async function sendOtp() {
    if (!voterId.trim()) { toast.error('Enter Voter ID first'); return }
    try {
      const r = await api.post('/otp/send', { voterId })
      toast.success(r.data.message)
      if (r.data.devOtp) { setDevOtp(r.data.devOtp); toast('Dev mode OTP: ' + r.data.devOtp, { icon: '🔑', duration: 8000 }) }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP')
    }
  }

  async function castVote() {
    if (!selectedCandidate || !voter || !selectedElection) return
    setLoading(true)
    try {
      const r = await api.post('/votes/cast', {
        electionId: selectedElection.id,
        voterId: voter.id,
        candidateId: selectedCandidate.id,
        authMethod: otpMode ? 'otp' : 'fingerprint',
      })
      setReceipt(r.data.receiptCode)
      setStep(STEP.DONE)
      toast.success('Vote cast successfully!')
    } catch (err) {
      if (err.response?.data?.isDuplicate) {
        toast.error('Duplicate vote detected and blocked!')
      } else {
        toast.error(err.response?.data?.error || 'Failed to cast vote')
      }
    } finally {
      setLoading(false)
    }
  }

  function resetAll() {
    setStep(STEP.IDENTIFY); setVoter(null); setVoterId(''); setFpScanned(false)
    setFpTemplate(''); setOtpMode(false); setOtp(['','','','','',''])
    setSelectedCandidate(null); setReceipt(''); setDevOtp('')
  }

  function otpChange(val, idx) {
    const next = [...otp]; next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-${idx+1}`)?.focus()
  }

  const stepNames = ['Identity', 'Select', 'Confirm', 'Done']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2942 0%, #1a3a5c 60%, #0d3d2a 100%)' }}>
      {/* Topbar */}
      <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'white', letterSpacing: '-0.5px' }}>
          Civic<span style={{ color: '#1D9E75' }}>Vote</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/verify" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>Verify Receipt</Link>
          <Link to="/admin" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', padding: '6px 14px', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
        {/* Election info */}
        {selectedElection && (
          <div style={{ textAlign: 'center', marginBottom: 28 }} className="animate-fade-in">
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Active Election</div>
            <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 700, color: 'white' }}>{selectedElection.title}</div>
            {selectedElection.ward && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{selectedElection.ward}</div>}
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
          {stepNames.map((name, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600,
                  background: i + 1 < step ? '#1D9E75' : i + 1 === step ? 'white' : 'rgba(255,255,255,0.12)',
                  color: i + 1 < step ? 'white' : i + 1 === step ? '#0f2942' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s',
                }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 10, color: i + 1 === step ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: i + 1 === step ? 600 : 400 }}>{name}</div>
              </div>
              {i < 3 && <div style={{ width: 48, height: 1, background: i + 1 < step ? '#1D9E75' : 'rgba(255,255,255,0.15)', margin: '0 4px', marginBottom: 20, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Identity */}
        {step === STEP.IDENTIFY && (
          <div className="card animate-fade-in">
            <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Verify Your Identity</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Enter your Voter ID and scan your fingerprint</p>

            {!selectedElection && (
              <div className="alert alert-warn" style={{ marginBottom: 16 }}>
                <span>⚠</span> No active election found. Contact your administrator.
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label className="label">Voter ID</label>
              <input className="input" placeholder="e.g. VID-2024-XXXXX" value={voterId} onChange={e => setVoterId(e.target.value)} onKeyDown={e => e.key === 'Enter' && verifyIdentity()} />
            </div>

            {!otpMode ? (
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <label className="label" style={{ textAlign: 'center', marginBottom: 12 }}>Fingerprint Verification</label>
                <FingerprintScanner
                  onScan={handleFpScan}
                  disabled={!voterId.trim()}
                  label={fpScanned ? '✓ Captured' : 'Tap to scan'}
                />
                {fpScanned && <div style={{ fontSize: 12, color: '#1D9E75', marginTop: 8, fontWeight: 500 }}>✓ Fingerprint captured</div>}
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label className="label">Enter OTP</label>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
                  {otp.map((d, i) => (
                    <input key={i} id={`otp-${i}`} className="otp-digit" maxLength={1} value={d} onChange={e => otpChange(e.target.value, i)} onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i-1}`)?.focus() }} />
                  ))}
                </div>
                <button className="btn btn-outline btn-sm" onClick={sendOtp} style={{ width: '100%', justifyContent: 'center' }}>Send OTP to registered mobile</button>
                {devOtp && <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 6 }}>Dev OTP: <strong>{devOtp}</strong></div>}
              </div>
            )}

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginBottom: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setOtpMode(!otpMode)} style={{ fontSize: 12 }}>
                {otpMode ? '← Use fingerprint instead' : 'Fingerprint not working? Use OTP'}
              </button>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={verifyIdentity}
              disabled={verifying || !selectedElection}
            >
              {verifying ? <><div className="spinner" /> Verifying...</> : 'Verify & Proceed →'}
            </button>
          </div>
        )}

        {/* Step 2 — Select candidate */}
        {step === STEP.SELECT && selectedElection && (
          <div className="animate-fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="alert alert-green">
                <span>✓</span> Verified as <strong>{voter?.name}</strong> — {voter?.ward}
              </div>
            </div>
            <div className="card">
              <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Select Candidate</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Choose your preferred candidate for {selectedElection.title}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {selectedElection.candidates?.map(c => (
                  <div key={c.id} className={`candidate-card ${selectedCandidate?.id === c.id ? 'selected' : ''}`} onClick={() => setSelectedCandidate(c)}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 10px', background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, fontFamily: 'Syne', color: c.color }}>
                      {c.initials || c.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.party}</div>
                    {selectedCandidate?.id === c.id && <div style={{ fontSize: 12, color: '#1D9E75', marginTop: 6, fontWeight: 600 }}>✓ Selected</div>}
                  </div>
                ))}
              </div>
              <button className="btn btn-civic btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { if (!selectedCandidate) { toast.error('Please select a candidate'); return } setStep(STEP.CONFIRM) }} disabled={!selectedCandidate}>
                Review Selection →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === STEP.CONFIRM && (
          <div className="card animate-fade-in">
            <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Confirm Your Vote</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>This action cannot be undone</p>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Your vote for</div>
              <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, color: '#0f2942' }}>{selectedCandidate?.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{selectedCandidate?.party}</div>
              <div className="divider" />
              <div style={{ fontSize: 12, color: '#64748b' }}>Voter: <strong>{voter?.name}</strong> — {selectedElection?.title}</div>
            </div>
            <div className="alert alert-warn" style={{ marginBottom: 20 }}>
              <span>⚠</span> Once submitted, your vote cannot be changed. Make sure your selection is correct.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(STEP.SELECT)}>← Change</button>
              <button className="btn btn-civic btn-lg" style={{ flex: 2, justifyContent: 'center' }} onClick={castVote} disabled={loading}>
                {loading ? <><div className="spinner" /> Submitting...</> : '✓ Cast My Vote'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === STEP.DONE && (
          <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🗳️</div>
            <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#1D9E75', marginBottom: 4 }}>Vote Recorded!</div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Your vote has been securely cast and recorded</p>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>Your Verification Receipt</div>
              <div className="receipt-code">{receipt}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Save this code to verify your vote was counted</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/verify" className="btn btn-outline">Verify Receipt</Link>
              <button className="btn btn-ghost" onClick={resetAll}>Vote Again (Demo)</button>
            </div>
          </div>
        )}

        {/* No active election fallback */}
        {elections.length === 0 && step === STEP.IDENTIFY && (
          <div className="card" style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>🗳️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 4 }}>No Active Elections</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Check back when an election is open, or contact your administrator.</div>
          </div>
        )}
      </div>
    </div>
  )
}
