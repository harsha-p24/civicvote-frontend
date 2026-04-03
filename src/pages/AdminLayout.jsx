// src/pages/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { to: '/admin/elections', label: 'Elections', icon: '🗳' },
  { to: '/admin/voters', label: 'Voters', icon: '👤' },
  { to: '/admin/audit', label: 'Audit Log', icon: '📋' },
]

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="layout">
      <div className="sidebar">
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: '-0.5px' }}>
            Civic<span style={{ color: '#1D9E75' }}>Vote</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 }}>Admin Console</div>
        </div>
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '8px 14px', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Signed in as</div>
            <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{admin?.username}</div>
          </div>
          <button className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }} onClick={handleLogout}>
            <span>↩</span> Sign Out
          </button>
        </div>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}
