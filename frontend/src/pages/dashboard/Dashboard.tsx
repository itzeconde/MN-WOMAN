import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEventos, confirmarAsistencia } from '../../api/eventos'
import { getMisOportunidades } from '../../api/oportunidades'
import { getMisServicios } from '../../api/servicios'

interface Evento {
  id: number
  title: string
  date: string
  start_time: string
  end_time: string
  location: string
  hotel: string
}

interface Servicio {
  id: number
  titulo: string
  categoria: string
  precio: number
  precio_personalizado: boolean
}

interface Oportunidad {
  id: number
  titulo: string
  categoria: string
  urgencia: string
  presupuesto_min: number
  presupuesto_max: number
  vence_el: string
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [proximoEvento, setProximoEvento] = useState<Evento | null>(null)
  const [misServicios, setMisServicios] = useState<Servicio[]>([])
  const [misOportunidades, setMisOportunidades] = useState<Oportunidad[]>([])
  const [asistencia, setAsistencia] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [eventos, servicios, oportunidades] = await Promise.all([
          getEventos(),
          getMisServicios(),
          getMisOportunidades(),
        ])
        if (eventos.length > 0) setProximoEvento(eventos[0])
        setMisServicios(servicios)
        setMisOportunidades(oportunidades)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const handleAsistencia = async (valor: string) => {
    if (!proximoEvento) return
    try {
      await confirmarAsistencia(proximoEvento.id)
      setAsistencia(valor)
    } catch {
      setAsistencia(valor)
    }
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#B66878', fontWeight: '600' }}>Cargando...</p>
    </div>
  )

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Saludo */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
            Hola, {usuario?.first_name} 
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            {usuario?.company ? `${usuario.company} • ` : ''}Bienvenida a tu espacio empresarial
          </p>
        </div>

        {/* Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Servicios publicados', valor: misServicios.length, icono: '💼' },
            { label: 'Oportunidades activas', valor: misOportunidades.length, icono: '🚀' },
            { label: 'Próximo evento', valor: proximoEvento ? proximoEvento.date : 'Sin eventos', icono: '📅' },
          ].map((stat) => (
            <div key={stat.label} style={{ ...cardStyle, borderLeft: '4px solid #B66878' }}>
              <span style={{ fontSize: '24px' }}>{stat.icono}</span>
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '8px 0 4px' }}>{stat.valor}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Próximo evento */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>📅 Próximo Evento</h2>
            {proximoEvento ? (
              <>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', color: '#1f2937' }}>{proximoEvento.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📆 {proximoEvento.date}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>🕐 {proximoEvento.start_time} - {proximoEvento.end_time}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>📍 {proximoEvento.hotel || proximoEvento.location}</p>

                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>¿Vas a asistir?</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAsistencia('si')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid',
                      borderColor: asistencia === 'si' ? '#B66878' : '#e5e7eb',
                      background: asistencia === 'si' ? '#fdf2f4' : 'white',
                      color: asistencia === 'si' ? '#B66878' : '#374151',
                      cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                    }}>✓ Asistiré</button>
                  <button onClick={() => handleAsistencia('no')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid',
                      borderColor: asistencia === 'no' ? '#ef4444' : '#e5e7eb',
                      background: asistencia === 'no' ? '#fef2f2' : 'white',
                      color: asistencia === 'no' ? '#ef4444' : '#374151',
                      cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                    }}>✗ No asistiré</button>
                </div>
              </>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay eventos próximos por ahora.</p>
            )}
          </div>

          {/* Mis Servicios */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>💼 Mis Servicios</h2>
              <button onClick={() => navigate('/servicios')}
                style={{ background: 'none', border: 'none', color: '#B66878', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Ver todos →
              </button>
            </div>
            {misServicios.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {misServicios.slice(0, 3).map((s) => (
                  <div key={s.id} style={{ padding: '12px', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #EFC3CA' }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px', color: '#1f2937' }}>{s.titulo}</p>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>
                      {s.precio_personalizado ? 'Precio personalizado' : `$${s.precio} MXN`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Aún no tienes servicios publicados.</p>
                <button onClick={() => navigate('/servicios')}
                  style={{ background: '#B66878', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Publicar servicio
                </button>
              </div>
            )}
          </div>

          {/* Mis Oportunidades */}
          <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>🚀 Mis Oportunidades</h2>
              <button onClick={() => navigate('/oportunidades')}
                style={{ background: 'none', border: 'none', color: '#B66878', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Ver todas →
              </button>
            </div>
            {misOportunidades.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {misOportunidades.slice(0, 3).map((o) => (
                  <div key={o.id} style={{ padding: '12px', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #EFC3CA' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{o.titulo}</p>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                        background: o.urgencia === 'alta' ? '#fef2f2' : o.urgencia === 'media' ? '#fffbeb' : '#f0fdf4',
                        color: o.urgencia === 'alta' ? '#ef4444' : o.urgencia === 'media' ? '#f59e0b' : '#22c55e',
                      }}>{o.urgencia}</span>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>Vence: {o.vence_el}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Aún no tienes oportunidades publicadas.</p>
                <button onClick={() => navigate('/oportunidades')}
                  style={{ background: '#B66878', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Publicar oportunidad
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}