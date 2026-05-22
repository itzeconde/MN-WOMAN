import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEventos } from '../../api/eventos'

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
}

const statusConfig = {
  proximo: { label: 'Próximo', color: '#6366f1', bg: '#eef2ff' },
  en_curso: { label: 'En Curso', color: '#16a34a', bg: '#dcfce7' },
  finalizado: { label: 'Finalizado', color: '#6b7280', bg: '#f3f4f6' },
}

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getEventos()
      .then(setEventos)
      .finally(() => setCargando(false))
  }, [])

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatHora = (hora: string) => hora.slice(0, 5)

  const proximos = eventos.filter(e => e.status !== 'finalizado')
  const finalizados = eventos.filter(e => e.status === 'finalizado')

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#6b7280' }}>Cargando eventos...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
            Reuniones
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Conecta, comparte metas y fortalece la red de empresarias de Tlaxcala.
          </p>
        </div>

        {/* Próximos eventos */}
        {proximos.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              📅 Próximos Encuentros
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {proximos.map(evento => {
                const cfg = statusConfig[evento.status]
                return (
                  <div key={evento.id}
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                    style={{
                      background: 'white', borderRadius: '16px', overflow: 'hidden',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
                      cursor: 'pointer', display: 'flex', transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
                  >
                    {/* Imagen */}
                    <div style={{
                      width: '200px', flexShrink: 0,
                      background: evento.cover_image ? 'none' : 'linear-gradient(135deg, #EFC3CA, #B66878)',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {evento.cover_image
                        ? <img src={evento.cover_image} alt={evento.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🌸</div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ padding: '20px 24px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{
                          background: cfg.bg, color: cfg.color,
                          fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px'
                        }}>{cfg.label}</span>
                        {evento.status === 'en_curso' && (
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>● En vivo</span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                        {evento.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '14px', lineHeight: '1.5' }}>
                        {evento.description?.slice(0, 120)}{evento.description?.length > 120 ? '...' : ''}
                      </p>

                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>
                          📅 {formatFecha(evento.date)}
                        </span>
                        <span style={{ fontSize: '13px', color: '#374151' }}>
                          🕐 {formatHora(evento.start_time)} - {formatHora(evento.end_time)}
                        </span>
                        <span style={{ fontSize: '13px', color: '#374151' }}>
                          📍 {evento.hotel || evento.location}
                        </span>
                        <span style={{ fontSize: '13px', color: '#374151' }}>
                          👥 {evento.total_asistentes} confirmadas
                        </span>
                      </div>
                    </div>

                    {/* Flecha */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px', color: '#B66878', fontSize: '20px' }}>
                      →
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Finalizados */}
        {finalizados.length > 0 && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              ✅ Encuentros Pasados
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {finalizados.map(evento => (
                <div key={evento.id}
                  onClick={() => navigate(`/eventos/${evento.id}`)}
                  style={{
                    background: 'white', borderRadius: '12px', padding: '16px 20px',
                    border: '1px solid #f3f4f6', cursor: 'pointer', opacity: 0.8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>{evento.title}</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}>{formatFecha(evento.date)} · {evento.total_asistentes} asistentes</p>
                  </div>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>Ver →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {eventos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📅</p>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>No hay eventos disponibles por el momento.</p>
          </div>
        )}

      </div>
    </div>
  )
}