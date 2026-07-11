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
  proximo:    { label: 'Próximo',    color: '#B66878', bg: '#fdf2f4' },
  en_curso:   { label: '● En vivo',  color: '#16a34a', bg: '#dcfce7' },
  finalizado: { label: 'Finalizado', color: '#6b7280', bg: '#f3f4f6' },
}

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getEventos()
      .then(setEventos)
      .finally(() => setCargando(false))
  }, [])

  const parseFecha = (fecha: string) => new Date(fecha + 'T00:00:00')
  const diaNum = (fecha: string) => parseFecha(fecha).getDate()
  const mesAbrev = (fecha: string) => MESES[parseFecha(fecha).getMonth()]
  const formatFechaLarga = (fecha: string) =>
    parseFecha(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  const formatHora = (hora: string) => hora.slice(0, 5)

  const irADetalle = (id: number) => navigate(`/eventos/${id}`)
  const manejarTecla = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); irADetalle(id) }
  }

  const proximos = eventos.filter(e => e.status !== 'finalizado')
  const finalizados = eventos.filter(e => e.status === 'finalizado')

  const hoverOn = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(182,104,120,0.18)'
    e.currentTarget.style.transform = 'translateY(-2px)'
  }
  const hoverOff = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
    e.currentTarget.style.transform = 'translateY(0)'
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#B66878', fontWeight: '600' }}>Cargando eventos...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header — mismo patrón que el Dashboard */}
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
                  <div
                    key={evento.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => irADetalle(evento.id)}
                    onKeyDown={e => manejarTecla(e, evento.id)}
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                    style={{
                      background: 'white', borderRadius: '16px', overflow: 'hidden',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
                      borderLeft: '4px solid #B66878',
                      cursor: 'pointer', display: 'flex',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      outlineOffset: '2px',
                    }}
                  >
                    {/* Bloque de fecha */}
                    <div style={{
                      width: '86px', flexShrink: 0, background: '#fdf2f4',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '2px'
                    }}>
                      <span style={{ fontSize: '30px', fontWeight: '800', color: '#B66878', lineHeight: 1 }}>
                        {diaNum(evento.date)}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#B66878', letterSpacing: '0.04em' }}>
                        {mesAbrev(evento.date)}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '20px 24px', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{
                          background: cfg.bg, color: cfg.color,
                          fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px'
                        }}>
                          {cfg.label}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                        {evento.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '14px', lineHeight: '1.5' }}>
                        {evento.description?.slice(0, 120)}{evento.description && evento.description.length > 120 ? '...' : ''}
                      </p>

                      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
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

                    {/* Imagen */}
                    <div style={{
                      width: '180px', flexShrink: 0,
                      background: evento.cover_image ? 'none' : 'linear-gradient(135deg, #EFC3CA, #B66878)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                      {evento.cover_image
                        ? <img src={evento.cover_image} alt={evento.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '36px' }}>🌸</span>
                      }
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {finalizados.map(evento => (
                <div
                  key={evento.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => irADetalle(evento.id)}
                  onKeyDown={e => manejarTecla(e, evento.id)}
                  style={{
                    background: 'white', borderRadius: '12px', padding: '16px 20px',
                    border: '1px solid #f3f4f6', cursor: 'pointer', opacity: 0.85,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: '600', color: '#374151', fontSize: '15px', margin: '0 0 2px 0' }}>{evento.title}</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{formatFechaLarga(evento.date)} · {evento.total_asistentes} asistentes</p>
                  </div>
                  <span style={{ fontSize: '13px', color: '#B66878', fontWeight: '600', flexShrink: 0, marginLeft: '16px' }}>Ver →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {eventos.length === 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '36px', marginBottom: '8px' }}>📅</p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay eventos disponibles por el momento.</p>
          </div>
        )}

      </div>
    </div>
  )
}