import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { consultarStatus } from '../../api/usuarios'

export default function Login() {
  const navigate = useNavigate()
  const { login: doLogin } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username) return setError('El usuario es obligatorio')
    if (!form.password) return setError('La contraseña es obligatoria')
    setCargando(true)
    setError('')
    try {
      const statusData = await consultarStatus(form.username, form.password)

      if (statusData.status === 'pendiente') {
        setError('Tu solicitud está en revisión. Te contactaremos cuando sea aprobada.')
        return
      }
      if (statusData.status === 'rechazada') {
        const motivo = statusData.rechazo_motivo
          ? `Tu solicitud no fue aprobada. Motivo: ${statusData.rechazo_motivo}`
          : 'Tu solicitud no fue aprobada. Contacta a MN WOMAN para más información.'
        setError(motivo)
        return
      }

      const data = await login(form.username, form.password)
      const perfil = await doLogin(data.access, data.refresh)
      if (perfil.role === 'administrador') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Bienvenida de vuelta</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Inicia sesión en tu cuenta de MN WOMAN</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Usuario</label>
            <input name="username" placeholder="Ej. valentina_s" onChange={handleChange} value={form.username}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' as const }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Contraseña</label>
            <input name="password" type="password" placeholder="Tu contraseña" onChange={handleChange} value={form.password}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' as const }} />
          </div>

          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: '8px',
              padding: '12px', marginBottom: '12px'
            }}>
              <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={cargando}
            style={{ width: '100%', background: '#6366f1', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: '#6366f1', fontWeight: '500' }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  )
}