// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'

import VotingPage from './pages/VotingPage'
import VerifyPage from './pages/VerifyPage'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './pages/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminVoters from './pages/AdminVoters'
import AdminElections from './pages/AdminElections'
import AdminAudit from './pages/AdminAudit'
import SetupPage from './pages/SetupPage'

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="spinner spinner-dark" /></div>
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'DM Sans', fontSize: '14px', borderRadius: '10px' } }} />
        <Routes>
          {/* Public voting */}
          <Route path="/" element={<VotingPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/setup" element={<SetupPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="voters" element={<AdminVoters />} />
            <Route path="elections" element={<AdminElections />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
