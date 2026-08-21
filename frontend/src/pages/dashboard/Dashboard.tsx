import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEventos, confirmarAsistencia, getMiAsistencia } from '../../api/eventos'
import { getMisOportunidades } from '../../api/oportunidades'
import { getMisServicios } from '../../api/servicios'
import { useCargaConError } from '../../hooks/useCargaConError'
import EstadoSinConexion from '../../components/ui/EstadoSinConexion'
import {
  botonPrimario, badgePillStyle,
  COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE,
  CARD_SHADOW_REST, CARD_SHADOW_HOVER,
} from '../../styles/tokens'
import {
  Calendar, Clock, MapPin, Briefcase, Sparkles, Bell,
  CheckCircle2, XCircle, PlusCircle,
} from 'lucide-react'

type RespuestaAsistencia = 'si' | 'no' | null

interface Evento {
  id: number
  title: string
  date: string
  start_time: string
  end_time: string
  location: string
  hotel: string
  cupo_lleno?: boolean
  esta_vencido?: boolean
}

interface Servicio {
  id: number
  titulo: string
  categoria: string
  precio: number | null
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

// Respaldo por si el backend aún no manda esta_vencido
const esEventoFuturo = (evento: Evento): boolean => {
  if (typeof evento.esta_vencido === 'boolean') return !evento.esta_vencido
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return new Date(evento.date) >= hoy
}

const urgenciaColores: Record<string, [string, string]> = {
  alta: ['#fef2f2', '#ef4444'],
  media: ['#fffbeb', '#f59e0b'],
  baja: ['#f0fdf4', '#22c55e'],
}

// ---- Card con hover consistente con el resto de la app (Directorio) ----
function CardInteractiva({
  onClick, children, style,
}: { onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: '16px',
        border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST,
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER
        e.currentTarget.style.borderColor = COLOR_MARCA_CLARO
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = CARD_SHADOW_REST
        e.currentTarget.style.borderColor = COLOR_BORDE
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [proximoEvento, setProximoEvento] = useState<Evento | null>(null)
  const [misServicios, setMisServicios] = useState<Servicio[]>([])
  const [misOportunidades, setMisOportunidades] = useState<Oportunidad[]>([])
  const [asistencia, setAsistencia] = useState<RespuestaAsistencia>(null)
  const [enviandoAsistencia, setEnviandoAsistencia] = useState(false)
  const [errorAsistencia, setErrorAsistencia] = useState<string | null>(null)

  const { cargando, errorRed, ejecutar } = useCargaConError()

  const cargarDatos = () => ejecutar(async () => {
    const [eventos, servicios, oportunidades] = await Promise.all([
      getEventos(),
      getMisServicios(),
      getMisOportunidades(),
    ])

    const futuros = eventos
      .filter(esEventoFuturo)
      .sort((a: Evento, b: Evento) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (futuros.length > 0) {
      const evento = futuros[0]
      setProximoEvento(evento)

      try {
        const miAsistencia = await getMiAsistencia(evento.id)
        if (miAsistencia.status === 'confirmada') setAsistencia('si')
        else if (miAsistencia.status === 'cancelada') setAsistencia('no')
      } catch (err) {
        console.error('No se pudo cargar la asistencia previa', err)
      }
    }

    setMisServicios(servicios)
    setMisOportunidades(oportunidades)
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleAsistencia = async (valor: RespuestaAsistencia) => {
    if (!proximoEvento || !valor) return
    setErrorAsistencia(null)
    setEnviandoAsistencia(true)
    try {
      const res = await confirmarAsistencia(proximoEvento.id, valor)
      if (res.cupo_agotado) {
        setErrorAsistencia('El cupo para este evento se acaba de agotar. Intenta con otra respuesta.')
      } else {
        setAsistencia(valor)
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrorAsistencia('Este evento ya no tiene lugares disponibles.')
      } else {
        setErrorAsistencia('No se pudo guardar tu respuesta. Intenta de nuevo.')
      }
    } finally {
      setEnviandoAsistencia(false)
    }
  }

  const handleCambiarRespuesta = () => {
    setAsistencia(null)
    setErrorAsistencia(null)
  }

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Cargando panel...</p>
      </div>
    )
  }

  if (errorRed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '60px 20px' }}>
        <EstadoSinConexion
          onReintentar={cargarDatos}
          mensaje="No se pudieron cargar los datos. Revisa tu internet e intenta de nuevo."
        />
      </div>
    )
  }

  const saludo = usuario?.first_name ? `Hola, ${usuario.first_name}` : 'Bienvenido/a'
  const totalPendientes = misOportunidades.reduce((acc, o) => acc + o.postulaciones_pendientes, 0)
  const cupoLlenoYaNoRespondio = proximoEvento?.cupo_lleno && asistencia === null

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .dashboard-header-pad { padding: 44px 20px 28px; }
        .dashboard-body-pad { padding: 28px 20px 40px; }

        .dashboard-resumen-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .dashboard-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .dashboard-evento-card { padding: 24px; }

        @media (max-width: 768px) {
          .dashboard-header-pad { padding: 32px 16px 22px; }
          .dashboard-body-pad { padding: 20px 16px 32px; }
          .dashboard-split-grid { grid-template-columns: 1fr; }
          .dashboard-evento-card { padding: 18px; }
        }

        @media (max-width: 480px) {
          .dashboard-resumen-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>

      {/* Franja superior suave, igual que en Directorio */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div className="dashboard-header-pad" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>
            {saludo}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
            {usuario?.company ? `${usuario.company} · ` : ''}Bienvenido/a a tu espacio empresarial
          </p>
        </div>
      </div>

      <div className="dashboard-body-pad" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Resumen */}
        <div className="dashboard-resumen-grid">
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST, borderLeft: `4px solid ${COLOR_MARCA}` }}>
            <Briefcase size={18} color={COLOR_MARCA} />
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '10px 0 2px' }}>{misServicios.length}</p>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Servicios publicados</p>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST, borderLeft: `4px solid ${COLOR_MARCA}` }}>
            <Sparkles size={18} color={COLOR_MARCA} />
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '10px 0 2px' }}>{misOportunidades.length}</p>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Oportunidades activas</p>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST, borderLeft: `4px solid ${COLOR_MARCA}` }}>
            <Calendar size={18} color={COLOR_MARCA} />
            <p style={{ fontSize: '19px', fontWeight: '800', color: '#111827', margin: '10px 0 2px' }}>
              {proximoEvento ? formatearFecha(proximoEvento.date) : 'Sin eventos'}
            </p>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Próximo evento</p>
          </div>

          {totalPendientes > 0 && (
            <CardInteractiva onClick={() => navigate('/mis-oportunidades')} style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
              <Bell size={18} color="#ef4444" />
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444', margin: '10px 0 2px' }}>{totalPendientes}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Postulación{totalPendientes !== 1 ? 'es' : ''} sin revisar</p>
            </CardInteractiva>
          )}
        </div>

        {/* Próximo evento */}
        <div className="dashboard-evento-card" style={{ background: 'white', borderRadius: '16px', border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Calendar size={17} color={COLOR_MARCA} /> Próximo evento
            </h2>
            <button onClick={() => navigate('/eventos')} style={{ background: 'none', border: 'none', color: COLOR_MARCA, cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              Ver todos →
            </button>
          </div>

          {proximoEvento ? (
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 260px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: '#111827' }}>{proximoEvento.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Calendar size={13} /> {formatearFecha(proximoEvento.date)}
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Clock size={13} /> {proximoEvento.start_time} - {proximoEvento.end_time}
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <MapPin size={13} /> {proximoEvento.hotel || proximoEvento.location}
                </p>
              </div>

              <div style={{ flex: '1 1 260px', minWidth: '240px' }}>
                {asistencia === null ? (
                  <>
                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>¿Vas a asistir?</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAsistencia('si')}
                        disabled={enviandoAsistencia || cupoLlenoYaNoRespondio}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px',
                          border: `1px solid ${cupoLlenoYaNoRespondio ? '#e5e7eb' : COLOR_MARCA}`,
                          background: cupoLlenoYaNoRespondio ? '#f3f4f6' : '#fdf2f4',
                          color: cupoLlenoYaNoRespondio ? '#9ca3af' : COLOR_MARCA,
                          cursor: cupoLlenoYaNoRespondio ? 'not-allowed' : 'pointer',
                          fontWeight: '600', fontSize: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                      >
                        {cupoLlenoYaNoRespondio ? 'Cupo lleno' : <><CheckCircle2 size={15} /> Asistiré</>}
                      </button>
                      <button
                        onClick={() => handleAsistencia('no')}
                        disabled={enviandoAsistencia}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb',
                          background: 'white', color: '#374151', cursor: 'pointer',
                          fontWeight: '600', fontSize: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                      >
                        <XCircle size={15} /> No asistiré
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '12px 14px', borderRadius: '8px',
                    background: asistencia === 'si' ? '#fdf2f4' : '#f9fafb',
                    border: `1px solid ${asistencia === 'si' ? COLOR_MARCA_CLARO : '#e5e7eb'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: asistencia === 'si' ? COLOR_MARCA : '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {asistencia === 'si' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                      {asistencia === 'si' ? 'Confirmaste tu asistencia' : 'Marcaste que no asistirás'}
                    </span>
                    <button onClick={handleCambiarRespuesta} style={{ background: 'none', border: 'none', color: COLOR_MARCA, cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                      Cambiar respuesta
                    </button>
                  </div>
                )}
                {errorAsistencia && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{errorAsistencia}</p>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay eventos próximos por ahora.</p>
          )}
        </div>

        <div className="dashboard-split-grid">

          {/* Mis Servicios */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Briefcase size={17} color={COLOR_MARCA} /> Mis servicios
              </h2>
              <button onClick={() => navigate('/mis-servicios')} style={{ background: 'none', border: 'none', color: COLOR_MARCA, cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Ver todos →
              </button>
            </div>
            {misServicios.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {misServicios.slice(0, 3).map((s) => (
                  <CardInteractiva key={s.id} style={{ padding: '12px', borderLeft: `3px solid ${COLOR_MARCA_CLARO}`, boxShadow: 'none' }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px', color: '#1f2937' }}>{s.titulo}</p>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>
                      {s.precio_personalizado || s.precio === null
                        ? 'Precio personalizado'
                        : `$${s.precio.toLocaleString('es-MX')} MXN`}
                    </p>
                  </CardInteractiva>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <PlusCircle size={20} color={COLOR_MARCA} style={{ marginBottom: '8px' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Aún no tienes servicios publicados.</p>
                <button onClick={() => navigate('/servicios')} style={{ ...botonPrimario, margin: '0 auto' }}>
                  Publicar servicio
                </button>
              </div>
            )}
          </div>

          {/* Mis Oportunidades */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Sparkles size={17} color={COLOR_MARCA} /> Mis oportunidades
              </h2>
              <button onClick={() => navigate('/mis-oportunidades')} style={{ background: 'none', border: 'none', color: COLOR_MARCA, cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Ver todas →
              </button>
            </div>
            {misOportunidades.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {misOportunidades.slice(0, 3).map((o) => {
                  const [bg, fg] = urgenciaColores[o.urgencia] || urgenciaColores.baja
                  return (
                    <CardInteractiva
                      key={o.id}
                      onClick={() => navigate(
                        o.postulaciones_pendientes > 0
                          ? `/oportunidades/${o.id}/postulaciones`
                          : `/oportunidades/${o.id}`
                      )}
                      style={{ padding: '12px', borderLeft: `3px solid ${COLOR_MARCA_CLARO}`, boxShadow: 'none', position: 'relative' }}
                    >
                      {o.postulaciones_pendientes > 0 && (
                        <span style={{ position: 'absolute', top: '10px', right: '10px', ...badgePillStyle('#fef2f2', '#ef4444'), padding: '2px 8px', fontSize: '11px' }}>
                          {o.postulaciones_pendientes} nueva{o.postulaciones_pendientes !== 1 ? 's' : ''}
                        </span>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingRight: o.postulaciones_pendientes > 0 ? '70px' : '0' }}>
                        <p style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{o.titulo}</p>
                        {o.postulaciones_pendientes === 0 && <span style={badgePillStyle(bg, fg)}>{o.urgencia}</span>}
                      </div>
                      <p style={{ color: '#6b7280', fontSize: '13px' }}>Vence: {formatearFecha(o.vence_el)}</p>
                    </CardInteractiva>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <PlusCircle size={20} color={COLOR_MARCA} style={{ marginBottom: '8px' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Aún no tienes oportunidades publicadas.</p>
                <button onClick={() => navigate('/oportunidades')} style={{ ...botonPrimario, margin: '0 auto' }}>
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