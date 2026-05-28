import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvento, confirmarAsistencia, getMiAsistencia } from '../../api/eventos'

interface AgendaItem {
  id: number
  title: string
  nombre_ponente: string | null
  room: string
  start_time: string
  is_current: boolean
}

interface Evento {
  id: number
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  hotel: string
  status: 'proximo' | 'en_curso' | 'finalizado'
  cover_image: string | null
  total_asistentes: number
  referral_goal: number
  agenda: AgendaItem[]
}

const statusConfig = {
  proximo: { label: 'Próximo Evento', color: '#6366f1', bg: '#eef2ff' },
  en_curso: { label: 'En Curso', color: '#16a34a', bg: '#dcfce7' },
  finalizado: { label: 'Finalizado', color: '#6b7280', bg: '#f3f4f6' },
}

export default function DetalleEvento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [miAsistencia, setMiAsistencia] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [errorCupo, setErrorCupo] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [ev, asistencia] = await Promise.all([
          getEvento(Number(id)),
          getMiAsistencia(Number(id)),
        ])
        setEvento(ev)
        setMiAsistencia(asistencia.status)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  const handleConfirmar = async () => {
    setConfirmando(true)
    setErrorCupo(false)
    try {
      // ✅ Se pasa 'si' como segundo argumento
      const res = await confirmarAsistencia(Number(id), 'si')
      setMiAsistencia(res.status)
      if (evento && res.status === 'confirmada') {
        setEvento({ ...evento, total_asistentes: evento.total_asistentes + 1 })
      }
    } catch (err: any) {
      // Cupo agotado (409)
      if (err?.response?.data?.cupo_agotado) {
        setErrorCupo(true)
      }
      console.error(err)
    } finally {
      setConfirmando(false)
    }
  }

  const handleCancelar = async () => {
    setConfirmando(true)
    try {
      // ✅ 'no' para cancelar asistencia
      const res = await confirmarAsistencia(Number(id), 'no')
      setMiAsistencia(res.status)
      if (evento) {
        setEvento({ ...evento, total_asistentes: Math.max(0, evento.total_asistentes - 1) })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmando(false)
    }
  }

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatHora = (hora: string) => hora.slice(0, 5)

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#6b7280' }}>Cargando evento...</p>
    </div>
  )

  if (!evento) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Evento no encontrado.</p>
    </div>
  )

  const cfg = statusConfig[evento.status]
  const porcentajeMeta = Math.min((evento.total_asistentes / evento.referral_goal) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* Cover */}
      <div style={{
        height: '260px', position: 'relative', overflow: 'hidden',
        background: evento.cover_image ? 'none' : 'linear-gradient(135deg, #EFC3CA 0%, #B66878 100%)',
      }}>
        {evento.cover_image && (
          <img src={evento.cover_image} alt={evento.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: '24px', left: '48px', right: '48px' }}>
          <span style={{
            background: cfg.bg, color: cfg.color,
            fontSize: '12px', fontWeight: '700', padding: '4px 12px',
            borderRadius: '20px', marginBottom: '10px', display: 'inline-block'
          }}>{cfg.label}</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: 0 }}>
            {evento.title}
          </h1>
        </div>
        <button onClick={() => navigate('/eventos')}
          style={{
            position: 'absolute', top: '20px', left: '48px',
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
            backdropFilter: 'blur(4px)'
          }}>← Volver</button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

          {/* Columna izquierda */}
          <div>
            <div style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              border: '1px solid #f3f4f6', marginBottom: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>FECHA</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                    📅 {formatFecha(evento.date)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>HORARIO</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    🕐 {formatHora(evento.start_time)} - {formatHora(evento.end_time)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>LUGAR</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    📍 {evento.hotel || evento.location}
                  </p>
                </div>
              </div>
              {evento.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                  {evento.description}
                </p>
              )}
            </div>

            {/* Agenda */}
            {evento.agenda.length > 0 && (
              <div style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                  📋 Agenda del Día
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {evento.agenda.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                          background: item.is_current ? '#B66878' : '#e5e7eb',
                          border: item.is_current ? '2px solid #B66878' : '2px solid #e5e7eb',
                        }} />
                        {i < evento.agenda.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: '#f3f4f6', minHeight: '32px' }} />
                        )}
                      </div>
                      <div style={{
                        flex: 1,
                        background: item.is_current ? '#fdf2f4' : 'transparent',
                        borderRadius: item.is_current ? '8px' : '0',
                        padding: item.is_current ? '8px 12px' : '0 0 20px 0',
                        marginBottom: item.is_current ? '12px' : '0',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#B66878' }}>
                            {formatHora(item.start_time)}
                          </span>
                          {item.is_current && (
                            <span style={{ fontSize: '11px', background: '#B66878', color: 'white', padding: '1px 8px', borderRadius: '10px', fontWeight: '600' }}>
                              EN CURSO
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 2px 0' }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                          {item.nombre_ponente && `👤 ${item.nombre_ponente}`}
                          {item.nombre_ponente && item.room && ' · '}
                          {item.room && `📍 ${item.room}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Card de asistencia */}
            <div style={{
              background: 'white', borderRadius: '16px', padding: '20px',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                👥 Asistencia
              </h3>

              {/* Barra de meta */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Confirmadas</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                    {evento.total_asistentes} / {evento.referral_goal}
                  </span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    background: 'linear-gradient(90deg, #EFC3CA, #B66878)',
                    width: `${porcentajeMeta}%`, transition: 'width 0.5s ease'
                  }} />
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  {porcentajeMeta.toFixed(0)}% de la meta alcanzada
                </p>
              </div>

              {/* Error cupo agotado */}
              {errorCupo && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: '10px',
                  padding: '10px 14px', marginBottom: '12px',
                  fontSize: '13px', color: '#ef4444', fontWeight: '600'
                }}>
                  😔 Este evento ya no tiene cupo disponible.
                </div>
              )}

              {/* Botones según estado */}
              {evento.status !== 'finalizado' && (
                miAsistencia === 'confirmada' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      background: '#dcfce7', borderRadius: '10px', padding: '12px',
                      textAlign: 'center', color: '#16a34a', fontWeight: '600', fontSize: '14px'
                    }}>
                      ✓ Asistencia confirmada
                    </div>
                    <button onClick={handleCancelar} disabled={confirmando} style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      background: 'white', color: '#6b7280', border: '1px solid #e5e7eb',
                      cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                    }}>
                      {confirmando ? 'Cancelando...' : 'Cancelar asistencia'}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleConfirmar} disabled={confirmando} style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: '#B66878', color: 'white', border: 'none',
                    cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                  }}>
                    {confirmando ? 'Confirmando...' : '✓ Confirmar Asistencia'}
                  </button>
                )
              )}
            </div>

            {/* Info de fecha/lugar */}
            <div style={{
              background: 'linear-gradient(135deg, #B66878, #8B3E52)',
              borderRadius: '16px', padding: '20px', color: 'white'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', opacity: 0.8, marginBottom: '8px' }}>
                📅 {formatFecha(evento.date).toUpperCase()}
              </p>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{evento.hotel || evento.location}</p>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>
                {formatHora(evento.start_time)} - {formatHora(evento.end_time)}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}