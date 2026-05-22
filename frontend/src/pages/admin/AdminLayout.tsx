import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.jpeg'

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { label: 'Dashboard', ruta: '/admin', icon: '📊', exact: true },
    { label: 'Eventos', ruta: '/admin/eventos', icon: '📅' },
    { label: 'Cursos', ruta: '/admin/cursos', icon: '🎓' },
    { label: 'Artículos', ruta: '/admin/articulos', icon: '📝' },
    { label: 'Solicitudes', ruta: '/admin/solicitudes', icon: '👥' },
    { label: 'Servicios', ruta: '/admin/servicios', icon: '🛍️' },
    { label: 'Oportunidades', ruta: '/admin/oportunidades', icon: '💼' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0, background: 'white',
        borderRight: '1px solid #f3f4f6', display: 'flex',
        flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <img src={logo} alt="MN WOMAN" style={{ height: '48px' }} />
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px', fontWeight: '600', letterSpacing: '0.05em' }}>
            PANEL ADMINISTRACIÓN
          </p>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {menuItems.map(item => (
            <NavLink key={item.ruta} to={item.ruta}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
                textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                color: isActive ? '#B66878' : '#374151',
                background: isActive ? '#fdf2f4' : 'transparent',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#EFC3CA', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#B66878'
            }}>
              {usuario?.first_name?.charAt(0) || 'A'}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {usuario?.first_name} {usuario?.last_name}
              </p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Administradora</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', borderRadius: '8px',
            border: '1px solid #fee2e2', background: '#fff5f5',
            color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}