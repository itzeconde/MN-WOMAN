import { useState, useEffect, type ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvento, confirmarAsistencia, getMiAsistencia } from '../../api/eventos'
import { useCargaConError } from '../../hooks/useCargaConError'
import EstadoSinConexion from '../../components/ui/EstadoSinConexion'
import heroReunionesImg from '../../assets/hero-reuniones.png'
import { Sparkles } from 'lucide-react'


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
  cupo_lleno: boolean
  costo: number | null
  agenda: AgendaItem[]
}

// Ícono con fondo circular rosa, para reemplazar los emojis por un acabado
// consistente en cualquier navegador/sistema operativo.
function IconoCampo({ path, size = 20 }: { path: ReactNode; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color: '#B66878', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
      </svg>
    </span>
  )
}

const IconoCalendario = <IconoCampo path={<>
  <rect x="3" y="4" width="18" height="18" rx="2" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
</>} />

const IconoReloj = <IconoCampo path={<>
  <circle cx="12" cy="12" r="9" />
  <polyline points="12 7 12 12 15 15" />
</>} />

const IconoPin = <IconoCampo path={<>
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
  <circle cx="12" cy="10" r="3" />
</>} />

const IconoEtiqueta = <IconoCampo path={<>
  <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.2L3.2 9.59A2 2 0 0 0 3.83 11l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
  <circle cx="8.5" cy="8.5" r="1.5" />
</>} />

const IconoGrupo = <IconoCampo path={<>
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
</>} />

// Mismos colores que la lista de Eventos, para consistencia
const statusConfig = {
  proximo:    { label: 'Próximo Evento', color: '#B66878', bg: '#fdf2f4' },
  en_curso:   { label: '● En Curso',     color: '#16a34a', bg: '#dcfce7' },
  finalizado: { label: 'Finalizado',     color: '#6b7280', bg: '#f3f4f6' },
}

export default function DetalleEvento() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [evento, setEvento] = useState<Evento | null>(null)
  const [miAsistencia, setMiAsistencia] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [errorCupo, setErrorCupo] = useState(false)

  const { estaAutenticado: autenticado } = useAuth()
  const { cargando, errorRed, ejecutar } = useCargaConError()

  const cargarEvento = () => ejecutar(async () => {
    // getEvento y getMiAsistencia se resuelven por separado: si falla
    // getMiAsistencia (p. ej. el usuario nunca interactuó con este evento
    // y el backend responde 404), eso no debe tumbar el detalle del evento,
    // que sí cargó bien. Antes ambas iban en un solo Promise.all y un
    // fallo en cualquiera de las dos hacía ver "Evento no encontrado".
    const ev = await getEvento(Number(id))
    setEvento(ev)

    if (autenticado) {
      try {
        const asistencia = await getMiAsistencia(Number(id))
        setMiAsistencia(asistencia.status)
      } catch (err: any) {
        // 404 = no hay registro de asistencia previo. Es el caso normal
        // para cualquier usuario que no ha confirmado nada todavía, no
        // un error real, así que no lo mandamos a consola.
        if (err?.response?.status !== 404) {
          console.error(err)
        }
      }
    }
  })

  useEffect(() => { cargarEvento() }, [id])

  const handleConfirmar = async () => {
    setConfirmando(true)
    setErrorCupo(false)
    try {
      const res = await confirmarAsistencia(Number(id), 'si')
      setMiAsistencia(res.status)
      if (evento && res.status === 'confirmada') {
        setEvento({ ...evento, total_asistentes: evento.total_asistentes + 1 })
      }
    } catch (err: any) {
      if (err?.response?.data?.cupo_agotado) setErrorCupo(true)
      console.error(err)
    } finally {
      setConfirmando(false)
    }
  }

  const handleCancelar = async () => {
    setConfirmando(true)
    try {
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

  const formatCosto = (costo: number | null) => {
    if (costo == null || costo === 0) return 'Gratuito'
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(costo)
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#6b7280' }}>Cargando evento...</p>
    </div>
  )

  if (errorRed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <EstadoSinConexion
        onReintentar={cargarEvento}
        mensaje="No se pudo cargar este evento. Revisa tu internet e intenta de nuevo."
      />
    </div>
  )

  if (!evento) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Evento no encontrado.</p>
    </div>
  )

  const cfg = statusConfig[evento.status]
  const tieneMeta = !!evento.referral_goal && evento.referral_goal > 0
  const porcentajeMeta = tieneMeta
    ? Math.min((evento.total_asistentes / evento.referral_goal) * 100, 100)
    : 0

  // El botón de confirmar solo se deshabilita por cupo lleno cuando el
  // usuario todavía no tiene una asistencia confirmada. Si ya confirmó,
  // no aplica (puede seguir viendo su confirmación / cancelarla).
  const sinCupo = evento.cupo_lleno && miAsistencia !== 'confirmada'

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .detalle-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        .detalle-hero-grid { display: grid; grid-template-columns: 1fr 400px; gap: 28px; align-items: center; }
        @media (max-width: 760px) {
          .detalle-grid { grid-template-columns: 1fr; }
          .detalle-hero-grid { grid-template-columns: 1fr; }
          .detalle-hero-img { height: 240px !important; order: -1; }
          .detalle-info-row { grid-template-columns: 1fr !important; row-gap: 16px !important; }
          .detalle-hero-title { font-size: 30px !important; }
        }
      `}</style>

      {/* Hero — mismo tratamiento que el hero de la lista de Eventos, con
          estrellitas dispersas (a juego con las de la ilustración) y una
          entrada de título más suave: kicker arriba + subtítulo con
          fecha/lugar debajo, en vez de saltar directo del badge a un
          título grande y negro. */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <Sparkles size={16} color="#B66878" style={{ position: 'absolute', top: '22px', left: '32%', opacity: 0.4 }} />
        <Sparkles size={12} color="#B66878" style={{ position: 'absolute', top: '60%', left: '46%', opacity: 0.3 }} />
        <Sparkles size={20} color="#EFC3CA" style={{ position: 'absolute', bottom: '18px', left: '6%', opacity: 0.5 }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '34px 20px 28px', position: 'relative' }}>
          <div className="detalle-hero-grid">
            <div>
              <span style={{
                background: cfg.bg, color: cfg.color,
                fontSize: '12px', fontWeight: '700', padding: '5px 14px',
                borderRadius: '20px', marginBottom: '16px', display: 'inline-block',
              }}>
                {cfg.label}
              </span>

              <h1 className="detalle-hero-title" style={{
                fontSize: '34px', fontWeight: '700', color: '#1f2937',
                margin: 0, lineHeight: '1.2', letterSpacing: '-0.3px',
              }}>
                {evento.title}
              </h1>
            </div>

            {/* Ilustración decorativa del hero (estática, no la portada del evento) */}
            <div className="detalle-hero-img" style={{
              position: 'relative', height: '320px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle, #EFC3CA55, transparent 70%)',
              }} />
              <Sparkles size={20} color="#B66878" style={{ position: 'absolute', top: '10px', left: '4px', opacity: 0.6 }} />
              <Sparkles size={16} color="#B66878" style={{ position: 'absolute', bottom: '18px', right: '0px', opacity: 0.5 }} />
              <img
                src={heroReunionesImg}
                alt="Mujeres conversando en una reunión"
                style={{
                  position: 'relative', width: '320px', height: '320px',
                  objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(182,104,120,0.25))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 60px' }}>
        <div className="detalle-grid">

          {/* Columna izquierda */}
          <div>
            <div style={{
              background: 'white', borderRadius: '16px', padding: '22px',
              border: '1px solid #f3f4f6', marginBottom: '18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '22px' }}>
                Información del evento
              </h2>
              <div className="detalle-info-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '40px', rowGap: '22px', marginBottom: '18px', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {IconoCalendario}
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', fontWeight: '600' }}>FECHA</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                      {formatFecha(evento.date)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {IconoReloj}
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', fontWeight: '600' }}>HORARIO</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      {formatHora(evento.start_time)} - {formatHora(evento.end_time)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {IconoPin}
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', fontWeight: '600' }}>LUGAR</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                      {evento.hotel || evento.location}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.hotel || evento.location)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#B66878', fontWeight: '600', textDecoration: 'none' }}
                    >
                      Ver en mapa
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {IconoEtiqueta}
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', fontWeight: '600' }}>COSTO</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: (evento.costo == null || evento.costo === 0) ? '#16a34a' : '#111827', marginBottom: '2px' }}>
                      {formatCosto(evento.costo)}
                    </p>
                    {(evento.costo == null || evento.costo === 0) && (
                      <span style={{
                        fontSize: '11px', fontWeight: '600', color: '#16a34a',
                        background: '#dcfce7', padding: '2px 8px', borderRadius: '10px', display: 'inline-block'
                      }}>
                        Evento abierto al público
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* El conteo de confirmados/meta vive únicamente en la tarjeta
                  de Asistencia (columna derecha), para no duplicar el dato. */}
            </div>

            {/* Mapa — le da peso a la columna izquierda y complementa el dato de LUGAR */}
            <div style={{
              background: 'white', borderRadius: '16px', overflow: 'hidden',
              border: '1px solid #f3f4f6', marginBottom: '18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <iframe
                title="Ubicación del evento"
                src={`https://www.google.com/maps?q=${encodeURIComponent(evento.hotel || evento.location)}&output=embed`}
                width="100%"
                height="220"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Descripción */}
            {evento.description && (
              <div style={{
                background: 'white', borderRadius: '16px', padding: '22px',
                border: '1px solid #f3f4f6', marginBottom: '18px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>
                  Descripción
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
                  {evento.description}
                </p>
              </div>
            )}

            {/* Agenda */}
            {evento.agenda.length > 0 && (
              <div style={{
                background: 'white', borderRadius: '16px', padding: '22px',
                border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '18px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                  📋 Agenda del Día
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {evento.agenda.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '11px', height: '11px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                          background: item.is_current ? '#B66878' : '#e5e7eb',
                          border: item.is_current ? '2px solid #B66878' : '2px solid #e5e7eb',
                        }} />
                        {i < evento.agenda.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: '#f3f4f6', minHeight: '28px' }} />
                        )}
                      </div>
                      <div style={{
                        flex: 1,
                        background: item.is_current ? '#fdf2f4' : 'transparent',
                        borderRadius: item.is_current ? '8px' : '0',
                        padding: item.is_current ? '8px 12px' : '0 0 18px 0',
                        marginBottom: item.is_current ? '10px' : '0',
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
          <div>
            {/* Portada grande estilo póster, como en el diseño de referencia.
                Solo se muestra si hay imagen y es distinta de la del hero,
                o simplemente reutiliza la misma portada en formato vertical. */}
            {evento.cover_image && (
              <div style={{
                borderRadius: '20px', overflow: 'hidden', marginBottom: '18px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
              }}>
                <img src={evento.cover_image} alt={evento.title}
                  style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
            )}

            {/* Asistencia — única dueña del conteo/barra de meta */}
            <div style={{
              background: 'white', borderRadius: '16px', padding: '20px',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              position: 'sticky', top: '20px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {IconoGrupo} Asistencia
              </h3>

              {tieneMeta ? (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Confirmados</span>
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
              ) : (
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                  {evento.total_asistentes} {evento.total_asistentes === 1 ? 'confirmada' : 'confirmadas'}
                </p>
              )}

              {!autenticado ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', margin: '0 0 4px' }}>
                    Inicia sesión para confirmar tu asistencia
                  </p>
                  <button onClick={() => navigate('/login', { state: { redirect: `/eventos/${id}` } })} style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: '#B66878', color: 'white', border: 'none',
                    cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                  }}>
                    Iniciar sesión
                  </button>
                  <button onClick={() => navigate('/register')} style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    background: 'white', color: '#B66878', border: '1.5px solid #B66878',
                    cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                  }}>
                    Solicitar ingreso
                  </button>
                </div>
              ) : evento.status !== 'finalizado' && (
                <>
                  {errorCupo && (
                    <div style={{
                      background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: '10px',
                      padding: '10px 14px', marginBottom: '12px',
                      fontSize: '13px', color: '#ef4444', fontWeight: '600'
                    }}>
                      Este evento ya no tiene cupo disponible.
                    </div>
                  )}
                  {miAsistencia === 'confirmada' ? (
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={handleConfirmar}
                        disabled={confirmando || sinCupo}
                        style={{
                          width: '100%', padding: '12px', borderRadius: '10px',
                          background: sinCupo ? '#e5e7eb' : '#B66878',
                          color: sinCupo ? '#9ca3af' : 'white',
                          border: 'none',
                          cursor: sinCupo ? 'not-allowed' : 'pointer',
                          fontWeight: '700', fontSize: '14px'
                        }}
                      >
                        {sinCupo ? 'Cupo lleno' : confirmando ? 'Confirmando...' : '✓ Confirmar asistencia'}
                      </button>
                      {sinCupo && !errorCupo && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                          Este evento alcanzó su límite de asistentes.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}