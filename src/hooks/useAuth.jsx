// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const username = localStorage.getItem('adminUsername')
    if (token && username) setAdmin({ username })
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('adminToken', res.data.token)
    localStorage.setItem('adminUsername', res.data.username)
    setAdmin({ username: res.data.username })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
