import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.jpeg'

const Navbar = () => {
  const { usuario, estaAutenticado, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const irAPerfil = (editar = false) => {
    navigate('/perfil', { state: { editar } })
    setMenuAbierto(false)
  }

  // Links para miembros aprobados
  const enlacesMiembro = [
    { label: 'Dashboard', ruta: '/dashboard' },
    { label: 'Directorio', ruta: '/directorio' },
    { label: 'Reuniones', ruta: '/eventos' },
    { label: 'Servicios', ruta: '/servicios' },
    { label: 'Oportunidades', ruta: '/oportunidades' },
    { label: 'Cursos', ruta: '/cursos' },
    { label: 'Línea 911', ruta: '/linea911' },
    { label: 'Temas de Interés', ruta: '/articulos' },
  ]

  // Links visibles para visitantes (no autenticados) en la landing
  const enlacesPublicos = [
    { label: 'Cursos', ruta: '/cursos' },
    { label: 'Línea 911', ruta: '/linea911' },
    { label: 'Temas de Interés', ruta: '/articulos' },
  ]

  const enlaces = estaAutenticado ? enlacesMiembro : enlacesPublicos

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 48px',
      borderBottom: '1px solid #f3e8ea',
      backgroundColor: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>

      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="MN WOMAN" style={{ height: '55px', cursor: 'pointer' }} />
      </Link>

      {/* Links */}
      <ul style={{ display: 'flex', listStyle: 'none', gap: '28px', margin: 0, padding: 0 }}>
        {enlaces.map(item => (
          <li key={item.ruta}>
            <Link to={item.ruta} style={{
              textDecoration: 'none',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
            }}>{item.label}</Link>
          </li>
        ))}
      </ul>

      {/* Auth */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {estaAutenticado ? (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#EFC3CA', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                fontSize: '16px', fontWeight: '700', color: '#B66878',
                overflow: 'hidden', border: '2px solid #B66878',
              }}
            >
              {usuario?.profile_picture
                ? <img src={usuario.profile_picture} alt="perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : usuario?.first_name?.charAt(0) || '?'
              }
            </div>

            {menuAbierto && (
              <div style={{
                position: 'absolute', right: 0, top: '48px',
                background: 'white', borderRadius: '12px', padding: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #f3f4f6',
                minWidth: '180px', zIndex: 200,
              }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', marginBottom: '4px' }}>
                  <p style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: 0 }}>
                    {usuario?.first_name} {usuario?.last_name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                    {usuario?.company}
                  </p>
                </div>
                <button onClick={() => irAPerfil(false)} style={menuItemStyle}>👤 Mi Perfil</button>
                <button onClick={() => irAPerfil(true)} style={menuItemStyle}>✏️ Editar Perfil</button>
                <button onClick={handleLogout} style={{ ...menuItemStyle, color: '#ef4444' }}>🚪 Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #B66878', backgroundColor: 'transparent', color: '#B66878', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#B66878', color: 'white', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

const menuItemStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
  borderRadius: '8px',
}

export default Navbar