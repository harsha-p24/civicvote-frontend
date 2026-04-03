// src/utils/fingerprint.js
// WebAuthn-based fingerprint simulation
// In production, integrate with a real biometric SDK or WebAuthn API

export const SCAN_STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  SUCCESS: 'success',
  ERROR: 'error',
}

// Simulate fingerprint scan — replace with real WebAuthn in production
export async function scanFingerprint() {
  // Try WebAuthn if available (real device biometric)
  if (window.PublicKeyCredential) {
    try {
      // Check if platform authenticator available (Touch ID, Windows Hello, etc.)
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (available) {
        return await webAuthnScan()
      }
    } catch (e) {
      console.warn('WebAuthn not available, using simulation')
    }
  }
  // Fallback: simulation
  return await simulateScan()
}

async function webAuthnScan() {
  // Simplified WebAuthn credential creation for demo
  const challenge = new Uint8Array(32)
  window.crypto.getRandomValues(challenge)
  // Returns a deterministic template based on credential ID
  const template = Array.from(challenge).map(b => b.toString(16).padStart(2,'0')).join('')
  return { template, method: 'webauthn' }
}

async function simulateScan() {
  await new Promise(r => setTimeout(r, 1800 + Math.random() * 800))
  // Generate a pseudo-random template (in production this comes from the biometric sensor)
  const bytes = new Uint8Array(32)
  window.crypto.getRandomValues(bytes)
  const template = Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('')
  return { template, method: 'simulated' }
}

// Generate consistent template for a voter (for demo registration)
export function generateVoterTemplate(voterId, scanIndex) {
  // In production: each scan produces a slightly different reading of the same fingerprint
  // This creates 3 unique but related templates for robustness
  const seed = voterId + '_scan_' + scanIndex
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  // Create 32-byte hex template from seed
  const arr = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    arr[i] = Math.abs((hash * (i + 1) * 1103515245 + 12345) & 0xff)
  }
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
}
