import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPostulacionesRecibidas, getOportunidad, responderPostulacion } from '../../api/oportunidades'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import { ArrowLeft, Check, X, Users, Inbox, AlertCircle, Mail } from 'lucide-react'

interface Postulacion {
  id: number
  postulante_nombre: string
  postulante_correo: string
  mensaje: string
  status: 'pendiente' | 'aceptada' | 'rechazada'
  postulada_el: string
}

type Filtro = 'todas' | 'pendiente' | 'aceptada' | 'rechazada'

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pendiente: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pendiente' },
  aceptada: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Aceptada' },
  rechazada: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Rechazada' },
}

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aceptada', label: 'Aceptadas' },
  { value: 'rechazada', label: 'Rechazadas' },
]

export default function PostulacionesRecibidas() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [tituloOportunidad, setTituloOportunidad] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [respondiendoId, setRespondiendoId] = useState<number | null>(null)
  const [erroresPorPostulacion, setErroresPorPostulacion] = useState<Record<number, string>>({})
  const [filtro, setFiltro] = useState<Filtro>('todas')

  useEffect(() => {
    const cargar = async () => {
      try {
        const [postData, opData] = await Promise.all([
          getPostulacionesRecibidas(Number(id)),
          getOportunidad(Number(id)),
        ])
        setPostulaciones(postData)
        setTituloOportunidad(opData.titulo)
      } catch {
        setError('No se pudieron cargar las postulaciones. Verifica que esta oportunidad sea tuya.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  const manejarResponder = async (postulacionId: number, nuevoStatus: 'aceptada' | 'rechazada') => {
    setRespondiendoId(postulacionId)
    setErroresPorPostulacion((prev) => {
      const copia = { ...prev }
      delete copia[postulacionId]
      return copia
    })
    try {
      await responderPostulacion(postulacionId, nuevoStatus)
      setPostulaciones((prev) =>
        prev.map((p) => (p.id === postulacionId ? { ...p, status: nuevoStatus } : p))
      )
    } catch (err: any) {
      // Mismo patrón que NuevoServicio/NuevaOportunidad: campo específico →
      // detail → string plano → genérico. Aquí "status" es el campo que
      // valida el backend (ej. si ya fue respondida antes).
      const detalle =
        err?.response?.data?.status?.[0] ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'No se pudo registrar tu respuesta. Intenta de nuevo.'
      setErroresPorPostulacion((prev) => ({ ...prev, [postulacionId]: detalle }))
    } finally {
      setRespondiendoId(null)
    }
  }

  // Conteos por estado — funcionan como el "hero" de esta pantalla: lo primero
  // que se quiere saber al entrar no es una ilustración, es cuántas postulaciones
  // hay y en qué estado están.
  const conteos = useMemo(() => {
    return {
      todas: postulaciones.length,
      pendiente: postulaciones.filter((p) => p.status === 'pendiente').length,
      aceptada: postulaciones.filter((p) => p.status === 'aceptada').length,
      rechazada: postulaciones.filter((p) => p.status === 'rechazada').length,
    }
  }, [postulaciones])

  const postulacionesFiltradas = useMemo(() => {
    if (filtro === 'todas') return postulaciones
    return postulaciones.filter((p) => p.status === filtro)
  }, [postulaciones, filtro])

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 28px' }}>
          <button
            onClick={() => navigate(`/oportunidades/${id}`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: COLOR_MARCA, fontWeight: '700',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '20px',
            }}
          >
            <ArrowLeft size={14} /> Volver a la oportunidad
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.25' }}>
                Postulaciones recibidas
              </h1>
              {tituloOportunidad && (
                <p style={{ fontSize: '15px', color: '#6b7280', margin: '6px 0 0' }}>
                  Para: <strong style={{ color: COLOR_MARCA }}>{tituloOportunidad}</strong>
                </p>
              )}
            </div>

            {!cargando && !error && postulaciones.length > 0 && (
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, #f7d9de)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Users size={26} color={COLOR_MARCA} />
              </div>
            )}
          </div>

          {/* CONTEOS POR ESTADO */}
          {!cargando && !error && postulaciones.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '10px', marginTop: '28px',
            }}>
              {(['pendiente', 'aceptada', 'rechazada'] as const).map((estado) => {
                const st = STATUS_STYLE[estado]
                return (
                  <div key={estado} style={{
                    background: 'white', borderRadius: '12px', padding: '14px 16px',
                    border: `1px solid ${COLOR_BORDE}`,
                  }}>
                    <p style={{ fontSize: '24px', fontWeight: '800', color: st.color, margin: 0, lineHeight: 1 }}>
                      {conteos[estado]}
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '4px 0 0' }}>
                      {st.label}{conteos[estado] !== 1 ? 's' : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 20px 40px' }}>

        {cargando ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '60px' }}>Cargando...</p>
        ) : error ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            background: 'white', borderRadius: '16px', padding: '48px 24px', textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <AlertCircle size={28} color="#dc2626" />
            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0, maxWidth: '360px' }}>{error}</p>
          </div>
        ) : postulaciones.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            background: 'white', borderRadius: '16px', padding: '56px 24px', textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Inbox size={22} color={COLOR_MARCA} />
            </div>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Aún no has recibido postulaciones para esta oportunidad.
            </p>
          </div>
        ) : (
          <>
            {/* CHIPS DE FILTRO */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px', scrollbarWidth: 'none' }}>
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFiltro(f.value)}
                  aria-pressed={filtro === f.value}
                  style={{
                    padding: '9px 18px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                    background: filtro === f.value ? COLOR_MARCA : 'white',
                    color: filtro === f.value ? 'white' : '#374151',
                    fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    boxShadow: filtro === f.value ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
                  }}
                >
                  {f.label}
                  {f.value !== 'todas' && (
                    <span style={{ marginLeft: '6px', opacity: 0.75 }}>
                      {conteos[f.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {postulacionesFiltradas.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: '16px', padding: '48px 24px', textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  No hay postulaciones {filtro !== 'todas' ? STATUS_STYLE[filtro].label.toLowerCase() + 's' : ''} por aquí.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {postulacionesFiltradas.map((p) => {
                  const st = STATUS_STYLE[p.status]
                  const iniciales = p.postulante_nombre
                    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  const errorPostulacion = erroresPorPostulacion[p.id]

                  return (
                    <div
                      key={p.id}
                      style={{
                        background: 'white', borderRadius: '16px', padding: '22px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        border: `1px solid ${COLOR_BORDE}`,
                        borderLeft: `3px solid ${st.color}`,
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, #f7d9de)`,
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '14px', fontWeight: '700',
                            color: COLOR_MARCA,
                          }}>
                            {iniciales}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>
                              {p.postulante_nombre}
                            </p>
                            <p style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '13px', color: '#9ca3af', margin: '2px 0 0',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              <Mail size={11} /> {p.postulante_correo}
                            </p>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px', fontWeight: '700', padding: '5px 12px', flexShrink: 0,
                          borderRadius: '20px', background: st.bg, color: st.color,
                          border: `1px solid ${st.border}`,
                        }}>
                          {st.label}
                        </span>
                      </div>

                      {p.mensaje && (
                        <p style={{
                          fontSize: '14px', color: '#374151', lineHeight: '1.6',
                          margin: '0 0 12px', background: '#f9fafb', borderRadius: '10px', padding: '12px 14px',
                        }}>
                          {p.mensaje}
                        </p>
                      )}

                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 14px' }}>
                        Postulada el {new Date(p.postulada_el).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>

                      {p.status === 'pendiente' && (
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: `1px solid ${COLOR_BORDE}` }}>
                          <button
                            onClick={() => manejarResponder(p.id, 'aceptada')}
                            disabled={respondiendoId === p.id}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              background: '#f0fdf4', color: '#16a34a', padding: '10px 14px',
                              borderRadius: '10px', border: '1px solid #bbf7d0', cursor: 'pointer',
                              fontWeight: '700', fontSize: '13px',
                              opacity: respondiendoId === p.id ? 0.6 : 1,
                            }}
                          >
                            <Check size={14} /> Aceptar
                          </button>
                          <button
                            onClick={() => manejarResponder(p.id, 'rechazada')}
                            disabled={respondiendoId === p.id}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              background: '#fef2f2', color: '#dc2626', padding: '10px 14px',
                              borderRadius: '10px', border: '1px solid #fecaca', cursor: 'pointer',
                              fontWeight: '700', fontSize: '13px',
                              opacity: respondiendoId === p.id ? 0.6 : 1,
                            }}
                          >
                            <X size={14} /> Rechazar
                          </button>
                        </div>
                      )}

                      {errorPostulacion && (
                        <p style={{
                          color: '#dc2626', fontSize: '12px', marginTop: '10px', marginBottom: 0,
                          background: '#fef2f2', padding: '8px 10px', borderRadius: '8px',
                        }}>
                          {errorPostulacion}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}