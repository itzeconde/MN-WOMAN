import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEventos, confirmarAsistencia } from '../../api/eventos'
import { getMisOportunidades } from '../../api/oportunidades'
import { getMisServicios } from '../../api/servicios'

type RespuestaAsistencia = 'si' | 'no' | null

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
  total_postulaciones: number
  postulaciones_pendientes: number
}

const formatearFecha = (fecha: string): string => {
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return fecha
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  } as React.CSSProperties,

  btnAsistencia: (activo: boolean, colorActivo: string): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid',
    borderColor: activo ? colorActivo : '#e5e7eb',
    background: activo ? (colorActivo === '#B66878' ? '#fdf2f4' : '#fef2f2') : 'white',
    color: activo ? colorActivo : '#374151',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  }),

  btnPrimario: {
    background: '#B66878',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  } as React.CSSProperties,

  btnTexto: {
    background: 'none',
    border: 'none',
    color: '#B66878',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  } as React.CSSProperties,

  badgeUrgencia: (urgencia: string): React.CSSProperties => ({
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '20px',
    background:
      urgencia === 'alta' ? '#fef2f2' :
      urgencia === 'media' ? '#fffbeb' : '#f0fdf4',
    color:
      urgencia === 'alta' ? '#ef4444' :
      urgencia === 'media' ? '#f59e0b' : '#22c55e',
  }),
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [proximoEvento, setProximoEvento] = useState<Evento | null>(null)
  const [misServicios, setMisServicios] = useState<Servicio[]>([])
  const [misOportunidades, setMisOportunidades] = useState<Oportunidad[]>([])
  const [asistencia, setAsistencia] = useState<RespuestaAsistencia>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [errorAsistencia, setErrorAsistencia] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [eventos, servicios, oportunidades] = await Promise.all([
          getEventos(),
          getMisServicios(),
          getMisOportunidades(),
        ])

        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const futuros = eventos
          .filter((e: Evento) => new Date(e.date) >= hoy)
          .sort(
            (a: Evento, b: Evento) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        if (futuros.length > 0) setProximoEvento(futuros[0])

        setMisServicios(servicios)
        setMisOportunidades(oportunidades)
      } catch (err) {
        console.error(err)
        setErrorCarga('No se pudieron cargar los datos. Por favor, intenta de nuevo.')
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const handleAsistencia = async (valor: RespuestaAsistencia) => {
    if (!proximoEvento || !valor) return
    setErrorAsistencia(null)
    try {
      const res = await confirmarAsistencia(proximoEvento.id, valor)
      setAsistencia(valor)

      if (res.cupo_agotado) {
        setErrorAsistencia('El cupo para este evento está agotado.')
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrorAsistencia('Este evento ya no tiene lugares disponibles.')
      } else {
        setErrorAsistencia('No se pudo guardar tu respuesta. Intenta de nuevo.')
      }
    }
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#B66878', fontWeight: '600' }}>Cargando...</p>
    </div>
  )

  if (errorCarga) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', gap: '12px' }}>
      <p style={{ color: '#ef4444', fontWeight: '600' }}>{errorCarga}</p>
      <button onClick={() => window.location.reload()} style={styles.btnPrimario}>
        Reintentar
      </button>
    </div>
  )

  const saludo = usuario?.first_name
    ? `Hola, ${usuario.first_name}`
    : 'Bienvenido/a'

  const totalPendientes = misOportunidades.reduce(
    (acc, o) => acc + o.postulaciones_pendientes, 0
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Saludo */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
            {saludo}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            {usuario?.company ? `${usuario.company} • ` : ''}Bienvenido/a a tu espacio empresarial
          </p>
        </div>

        {/* Resumen */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: totalPendientes > 0 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          gap: '16px', marginBottom: '28px'
        }}>
          {[
            { label: 'Servicios publicados', valor: misServicios.length, icono: '💼' },
            { label: 'Oportunidades activas', valor: misOportunidades.length, icono: '🚀' },
            {
              label: 'Próximo evento',
              valor: proximoEvento ? formatearFecha(proximoEvento.date) : 'Sin eventos',
              icono: '📅',
            },
          ].map((stat) => (
            <div key={stat.label} style={{ ...styles.card, borderLeft: '4px solid #B66878' }}>
              <span style={{ fontSize: '24px' }}>{stat.icono}</span>
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '8px 0 4px' }}>{stat.valor}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</p>
            </div>
          ))}

          {totalPendientes > 0 && (
            <div
              onClick={() => navigate('/oportunidades')}
              style={{ ...styles.card, borderLeft: '4px solid #ef4444', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '24px' }}>🔔</span>
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444', margin: '8px 0 4px' }}>{totalPendientes}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Postulación{totalPendientes !== 1 ? 'es' : ''} sin revisar</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Próximo evento */}
          <div style={styles.card}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>📅 Próximo Evento</h2>
            {proximoEvento ? (
              <>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', color: '#1f2937' }}>{proximoEvento.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📆 {formatearFecha(proximoEvento.date)}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>🕐 {proximoEvento.start_time} - {proximoEvento.end_time}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>📍 {proximoEvento.hotel || proximoEvento.location}</p>

                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>¿Vas a asistir?</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleAsistencia('si')}
                    style={styles.btnAsistencia(asistencia === 'si', '#B66878')}
                  >
                    ✓ Asistiré
                  </button>
                  <button
                    onClick={() => handleAsistencia('no')}
                    style={styles.btnAsistencia(asistencia === 'no', '#ef4444')}
                  >
                    ✗ No asistiré
                  </button>
                </div>
                {errorAsistencia && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{errorAsistencia}</p>
                )}
              </>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay eventos próximos por ahora.</p>
            )}
          </div>

          {/* Mis Servicios */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>💼 Mis Servicios</h2>
              <button onClick={() => navigate('/servicios')} style={styles.btnTexto}>
                Ver todos →
              </button>
            </div>
            {misServicios.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {misServicios.slice(0, 3).map((s) => (
                  <div key={s.id} style={{ padding: '12px', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #EFC3CA' }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px', color: '#1f2937' }}>{s.titulo}</p>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>
                      {s.precio_personalizado ? 'Precio personalizado' : `$${s.precio.toLocaleString('es-MX')} MXN`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Aún no tienes servicios publicados.</p>
                <button onClick={() => navigate('/servicios')} style={styles.btnPrimario}>
                  Publicar servicio
                </button>
              </div>
            )}
          </div>

          {/* Mis Oportunidades */}
          <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>🚀 Mis Oportunidades</h2>
              <button onClick={() => navigate('/oportunidades')} style={styles.btnTexto}>
                Ver todas →
              </button>
            </div>
            {misOportunidades.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {misOportunidades.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    onClick={() => navigate(
                      o.postulaciones_pendientes > 0
                        ? `/oportunidades/${o.id}/postulaciones`
                        : `/oportunidades/${o.id}`
                    )}
                    style={{
                      padding: '12px', background: '#f9fafb', borderRadius: '10px',
                      borderLeft: '3px solid #EFC3CA', cursor: 'pointer', position: 'relative',
                    }}
                  >
                    {o.postulaciones_pendientes > 0 && (
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: '#ef4444', color: 'white', fontSize: '11px',
                        fontWeight: '700', borderRadius: '20px', padding: '2px 8px',
                      }}>
                        {o.postulaciones_pendientes} nueva{o.postulaciones_pendientes !== 1 ? 's' : ''}
                      </span>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingRight: o.postulaciones_pendientes > 0 ? '70px' : '0' }}>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{o.titulo}</p>
                      <span style={styles.badgeUrgencia(o.urgencia)}>{o.urgencia}</span>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>Vence: {formatearFecha(o.vence_el)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Aún no tienes oportunidades publicadas.</p>
                <button onClick={() => navigate('/oportunidades')} style={styles.btnPrimario}>
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