// src/components/FingerprintScanner.jsx
import { useState } from 'react'
import { scanFingerprint, SCAN_STATES } from '../utils/fingerprint'

export default function FingerprintScanner({ onScan, disabled, label = 'Click to scan', size = 'md' }) {
  const [state, setState] = useState(SCAN_STATES.IDLE)
  const [message, setMessage] = useState(label)

  const dim = size === 'sm' ? 'w-28 h-32' : 'w-36 h-44'

  async function handleScan() {
    if (disabled || state === SCAN_STATES.SCANNING) return
    setState(SCAN_STATES.SCANNING)
    setMessage('Scanning...')
    try {
      const result = await scanFingerprint()
      setState(SCAN_STATES.SUCCESS)
      setMessage('Scan captured!')
      onScan && onScan(result.template)
      setTimeout(() => { setState(SCAN_STATES.IDLE); setMessage(label) }, 2000)
    } catch (err) {
      setState(SCAN_STATES.ERROR)
      setMessage('Scan failed')
      setTimeout(() => { setState(SCAN_STATES.IDLE); setMessage(label) }, 2000)
    }
  }

  const stateClass = {
    [SCAN_STATES.IDLE]: '',
    [SCAN_STATES.SCANNING]: 'scanning',
    [SCAN_STATES.SUCCESS]: 'success',
    [SCAN_STATES.ERROR]: 'error',
  }[state]

  const iconColor = state === SCAN_STATES.SUCCESS ? '#1D9E75' : state === SCAN_STATES.ERROR ? '#E24B4A' : '#94a3b8'

  return (
    <div
      className={`fp-scanner ${dim} ${stateClass} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onClick={handleScan}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleScan()}
    >
      <div className="scan-beam" />
      <FingerprintIcon color={iconColor} />
      <span style={{ fontSize: 12, color: iconColor, textAlign: 'center', lineHeight: 1.4, padding: '0 10px' }}>{message}</span>
    </div>
  )
}

function FingerprintIcon({ color }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <path d="M22 6C13.2 6 6 13.2 6 22s7.2 16 16 16 16-7.2 16-16S30.8 6 22 6z" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M22 11c-6.1 0-11 4.9-11 11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 15c-3.9 0-7 3.1-7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 19c-1.7 0-3 1.3-3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 11c6.1 0 11 4.9 11 11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 15c3.9 0 7 3.1 7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 19c1.7 0 3 1.3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="22" cy="22" r="1.5" fill={color}/>
    </svg>
  )
}
