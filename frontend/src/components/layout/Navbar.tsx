import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.jpeg'

const Navbar = () => {
  const { usuario, estaAutenticado, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  // Cerrar menú móvil al redimensionar a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuMovilAbierto(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Evitar scroll cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = menuMovilAbierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuMovilAbierto])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuMovilAbierto(false)
  }

  const irAPerfil = (editar = false) => {
    navigate('/perfil', { state: { editar } })
    setMenuAbierto(false)
    setMenuMovilAbierto(false)
  }

  const enlacesMiembro = [
    { label: 'Inicio', ruta: '/dashboard' },
    { label: 'Directorio', ruta: '/directorio' },
    { label: 'Reuniones', ruta: '/eventos' },
    { label: 'Servicios', ruta: '/servicios' },
    { label: 'Oportunidades', ruta: '/oportunidades' },
    { label: 'Cursos', ruta: '/cursos' },
    { label: 'Línea 911', ruta: '/linea911' },
    { label: 'Temas de Interés', ruta: '/articulos' },
  ]

  const enlacesPublicos = [
    { label: 'Cursos', ruta: '/cursos' },
    { label: 'Línea 911', ruta: '/linea911' },
    { label: 'Temas de Interés', ruta: '/articulos' },
  ]

  const enlaces = estaAutenticado ? enlacesMiembro : enlacesPublicos

  return (
    <>
      <style>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 48px;
          border-bottom: 1px solid #f3e8ea;
          background-color: #fff;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .navbar-links {
          display: flex;
          list-style: none;
          gap: 28px;
          margin: 0;
          padding: 0;
        }

        .navbar-auth {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px;
        }

        .hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: #374151;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.abierto span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger.abierto span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.abierto span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Menú móvil overlay */
        .menu-movil {
          display: none;
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 99;
          flex-direction: column;
          padding: 24px;
          overflow-y: auto;
          border-top: 1px solid #f3e8ea;
        }

        .menu-movil.visible {
          display: flex;
        }

        .menu-movil-links {
          list-style: none;
          margin: 0 0 24px 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-movil-links a {
          display: block;
          padding: 12px 16px;
          text-decoration: none;
          color: #374151;
          font-size: 15px;
          font-weight: 500;
          border-radius: 10px;
          transition: background 0.15s;
        }

        .menu-movil-links a:hover {
          background: #fdf2f4;
          color: #B66878;
        }

        .menu-movil-auth {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #f3e8ea;
          padding-top: 20px;
        }

        .menu-movil-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fdf2f4;
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .avatar-movil {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #EFC3CA;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #B66878;
          overflow: hidden;
          border: 2px solid #B66878;
          flex-shrink: 0;
        }

        .btn-movil {
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 15px;
          color: #374151;
          border-radius: 10px;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-movil:hover {
          background: #f9fafb;
        }

        .btn-movil.logout {
          color: #ef4444;
        }

        @media (max-width: 767px) {
          .navbar {
            padding: 12px 20px;
          }

          .navbar-links {
            display: none;
          }

          .navbar-auth {
            display: none;
          }

          .hamburger {
            display: flex;
          }
        }
      `}</style>

      <nav className="navbar">
        {/* Logo */}
        <Link to="/" onClick={() => setMenuMovilAbierto(false)}>
          <img src={logo} alt="MN WOMAN" style={{ height: '55px', cursor: 'pointer' }} />
        </Link>

        {/* Links desktop */}
        <ul className="navbar-links">
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

        {/* Auth desktop */}
        <div className="navbar-auth">
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

        {/* Botón hamburguesa (solo móvil) */}
        <button
          className={`hamburger ${menuMovilAbierto ? 'abierto' : ''}`}
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Menú móvil */}
      <div className={`menu-movil ${menuMovilAbierto ? 'visible' : ''}`}>
        <ul className="menu-movil-links">
          {enlaces.map(item => (
            <li key={item.ruta}>
              <Link to={item.ruta} onClick={() => setMenuMovilAbierto(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="menu-movil-auth">
          {estaAutenticado ? (
            <>
              <div className="menu-movil-user">
                <div className="avatar-movil">
                  {usuario?.profile_picture
                    ? <img src={usuario.profile_picture} alt="perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : usuario?.first_name?.charAt(0) || '?'
                  }
                </div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827', margin: 0 }}>
                    {usuario?.first_name} {usuario?.last_name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>
                    {usuario?.company}
                  </p>
                </div>
              </div>
              <button className="btn-movil" onClick={() => irAPerfil(false)}>👤 Mi Perfil</button>
              <button className="btn-movil" onClick={() => irAPerfil(true)}>✏️ Editar Perfil</button>
              <button className="btn-movil logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('/login'); setMenuMovilAbierto(false) }}
                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #B66878', backgroundColor: 'transparent', color: '#B66878', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { navigate('/register'); setMenuMovilAbierto(false) }}
                style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#B66878', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </>
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