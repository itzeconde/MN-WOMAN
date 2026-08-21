import { useState, useEffect, useMemo } from 'react'
import { getSolicitudes, accionSolicitud } from '../../api/usuarios'
import { paginacionBotonStyle, COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  Mail, Phone, Briefcase, MapPin, Clock, Calendar,
  Check, X, Inbox, Search, ChevronLeft, ChevronRight,
} from 'lucide-react'

interface Solicitud {
  id: number
  nombre_completo: string
  email: string
  phone: string
  company: string
  business_sector: string
  municipality: string
  years_leading: string
  profile_picture: string | null
  member_since: string
  status: string
  is_active: boolean
}

const SECTORES: Record<string, string> = {
  textil: 'Textil y Confección',
  arte: 'Arte y Diseño',
  logistica: 'Logística y Transporte',
  tecnologia: 'Tecnología e IT',
  financiero: 'Servicios Financieros',
  educacion: 'Educación',
  salud: 'Salud y Bienestar',
  agricultura: 'Agricultura Sostenible',
}

const MUNICIPIOS: Record<string, string> = {
  tlaxcala_centro: 'Tlaxcala Centro',
  apizaco: 'Apizaco',
  huamantla: 'Huamantla',
  chiautempan: 'Chiautempan',
  tlaxco: 'Tlaxco',
  zacatelco: 'Zacatelco',
}

const YEARS: Record<string, string> = {
  menos_1: 'Menos de 1 año',
  '1_3': '1 a 3 años',
  '3_5': '3 a 5 años',
  mas_5: 'Más de 5 años',
}

const tabs = [
  { key: 'pendiente', label: 'Pendientes', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'aprobada', label: 'Aprobadas', color: '#16a34a', bg: '#dcfce7' },
  { key: 'rechazada', label: 'Rechazadas', color: '#ef4444', bg: '#fee2e2' },
]

const COLOR_TEXTO_SUAVE = '#9ca3af'
const SOLICITUDES_POR_PAGINA = 8

export default function AdminSolicitudes() {
  const [tabActiva, setTabActiva] = useState('pendiente')
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [seleccionada, setSeleccionada] = useState<Solicitud | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [modalRechazo, setModalRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [solicitudArechazar, setSolicitudArechazar] = useState<number | null>(null)

  useEffect(() => { cargar() }, [tabActiva])
  useEffect(() => { setPagina(1) }, [busqueda, tabActiva])

  const cargar = async () => {
    setCargando(true)
    setSeleccionada(null)
    try {
      const data = await getSolicitudes(tabActiva)
      setSolicitudes(data.results ?? data)
    } finally {
      setCargando(false)
    }
  }

  const handleAprobar = async (id: number) => {
    if (!confirm('¿Aprobar esta solicitud?')) return
    setProcesando(true)
    try {
      await accionSolicitud(id, 'aprobar')
      setSolicitudes(prev => prev.filter(s => s.id !== id))
      setSeleccionada(null)
    } finally {
      setProcesando(false)
    }
  }

  const abrirModalRechazo = (id: number) => {
    setSolicitudArechazar(id)
    setMotivoRechazo('')
    setModalRechazo(true)
  }

  const handleRechazar = async () => {
    if (!solicitudArechazar) return
    setProcesando(true)
    try {
      await accionSolicitud(solicitudArechazar, 'rechazar', motivoRechazo)
      setSolicitudes(prev => prev.filter(s => s.id !== solicitudArechazar))
      setSeleccionada(null)
      setModalRechazo(false)
    } finally {
      setProcesando(false)
    }
  }

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

  const iniciales = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  // ── Búsqueda y paginación ──
  const solicitudesFiltradas = solicitudes.filter((s) =>
    busqueda === '' ||
    s.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.company.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(solicitudesFiltradas.length / SOLICITUDES_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const solicitudesPagina = solicitudesFiltradas.slice(
    (paginaSegura - 1) * SOLICITUDES_POR_PAGINA,
    paginaSegura * SOLICITUDES_POR_PAGINA
  )

  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1])
    return Array.from(nums).filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b)
  }, [totalPaginas, paginaSegura])

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        /* Grid principal: lista + panel de detalle.
           El número de columnas viene de --cols (dinámico, según si hay
           una solicitud seleccionada). En móvil el panel se apila debajo
           de la lista en vez de exprimirse en una columna de 380px fija. */
        .solicitudes-grid {
          display: grid;
          grid-template-columns: var(--cols, 1fr);
          gap: 20px;
        }
        .panel-detalle {
          position: sticky;
          top: 20px;
        }

        @media (max-width: 860px) {
          .solicitudes-grid {
            grid-template-columns: 1fr !important;
          }
          .panel-detalle {
            position: static;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto', padding: '40px 20px 28px',
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.25 }}>
            Solicitudes de <span style={{ color: COLOR_MARCA }}>Ingreso</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: '8px 0 0' }}>
            Revisa y gestiona las solicitudes de nuevas miembras.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 40px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setTabActiva(tab.key)} style={{
              padding: '8px 20px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              background: tabActiva === tab.key ? tab.bg : 'white',
              color: tabActiva === tab.key ? tab.color : '#6b7280',
              border: tabActiva === tab.key ? `1px solid ${tab.color}30` : `1px solid ${COLOR_BORDE}`,
              transition: 'all 0.15s',
            }}>
              {tab.label}
              {tabActiva === tab.key && solicitudes.length > 0 && (
                <span style={{
                  marginLeft: '6px', background: tab.color, color: 'white',
                  borderRadius: '20px', padding: '1px 7px', fontSize: '11px'
                }}>{solicitudes.length}</span>
              )}
            </button>
          ))}
        </div>

        <div
          className="solicitudes-grid"
          style={{ '--cols': seleccionada ? '1fr 380px' : '1fr' } as React.CSSProperties}
        >

          {/* Lista */}
          <div>
            {!cargando && solicitudes.length > 0 && (
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  aria-label="Buscar solicitudes"
                  placeholder="Buscar por nombre, empresa o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px',
                    border: `1px solid ${COLOR_BORDE}`, fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none', background: 'white',
                  }}
                />
              </div>
            )}

            {cargando ? (
              <p style={{ color: COLOR_TEXTO_SUAVE, padding: '40px', textAlign: 'center', fontSize: '13px' }}>Cargando...</p>
            ) : solicitudes.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                textAlign: 'center', padding: '80px 24px', background: 'white',
                borderRadius: '16px', border: `1px solid ${COLOR_BORDE}`,
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Inbox size={22} color={COLOR_MARCA} />
                </div>
                <p style={{ color: COLOR_TEXTO_SUAVE, fontSize: '14px', margin: 0 }}>No hay solicitudes {tabActiva}s.</p>
              </div>
            ) : solicitudesFiltradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ color: COLOR_TEXTO_SUAVE, fontSize: '14px' }}>No hay solicitudes que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {solicitudesPagina.map(s => (
                  <div key={s.id} onClick={() => setSeleccionada(s)} style={{
                    background: 'white', borderRadius: '14px', padding: '16px 20px',
                    border: seleccionada?.id === s.id ? `1.5px solid ${COLOR_MARCA}` : `1px solid ${COLOR_BORDE}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                      background: s.profile_picture ? 'none' : `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, ${COLOR_MARCA})`,
                      overflow: 'hidden', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white'
                    }}>
                      {s.profile_picture
                        ? <img src={s.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : iniciales(s.nombre_completo)
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <p style={{ fontWeight: '700', color: '#111827', fontSize: '14px', margin: '0 0 2px 0' }}>
                        {s.nombre_completo}
                      </p>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                        {s.company} · {SECTORES[s.business_sector] || s.business_sector}
                      </p>
                    </div>
                    <p style={{ fontSize: '12px', color: COLOR_TEXTO_SUAVE, flexShrink: 0 }}>
                      {formatFecha(s.member_since)}
                    </p>
                    {tabActiva === 'pendiente' && (
                      <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleAprobar(s.id)} disabled={procesando} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '8px', border: '1px solid #dcfce7',
                          background: '#f0fdf4', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#16a34a'
                        }}><Check size={13} /> Aprobar</button>
                        <button onClick={() => abrirModalRechazo(s.id)} disabled={procesando} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '8px', border: '1px solid #fee2e2',
                          background: '#fff5f5', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#ef4444'
                        }}><X size={13} /> Rechazar</button>
                      </div>
                    )}
                  </div>
                ))}

                {totalPaginas > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={paginaSegura === 1}
                      style={paginacionBotonStyle(false, paginaSegura === 1)}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {numerosPagina.map((n, i) => {
                      const anterior = numerosPagina[i - 1]
                      const hayHueco = anterior !== undefined && n - anterior > 1
                      return (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {hayHueco && <span style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>}
                          <button onClick={() => setPagina(n)} style={paginacionBotonStyle(n === paginaSegura, false)}>
                            {n}
                          </button>
                        </div>
                      )
                    })}

                    <button
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      disabled={paginaSegura === totalPaginas}
                      style={paginacionBotonStyle(false, paginaSegura === totalPaginas)}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel detalle */}
          {seleccionada && (
            <div className="panel-detalle" style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              border: `1px solid ${COLOR_BORDE}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              height: 'fit-content',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 12px',
                  background: seleccionada.profile_picture ? 'none' : `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, ${COLOR_MARCA})`,
                  overflow: 'hidden', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'white'
                }}>
                  {seleccionada.profile_picture
                    ? <img src={seleccionada.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : iniciales(seleccionada.nombre_completo)
                  }
                </div>
                <p style={{ fontWeight: '800', color: '#111827', fontSize: '16px', margin: '0 0 4px 0' }}>
                  {seleccionada.nombre_completo}
                </p>
                <p style={{ fontSize: '13px', color: COLOR_MARCA, fontWeight: '600', margin: 0 }}>
                  {seleccionada.company}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { Icono: Mail, label: 'Email', value: seleccionada.email },
                  { Icono: Phone, label: 'Teléfono', value: seleccionada.phone || 'No proporcionado' },
                  { Icono: Briefcase, label: 'Sector', value: SECTORES[seleccionada.business_sector] || seleccionada.business_sector },
                  { Icono: MapPin, label: 'Municipio', value: MUNICIPIOS[seleccionada.municipality] || seleccionada.municipality },
                  { Icono: Clock, label: 'Años liderando', value: YEARS[seleccionada.years_leading] || seleccionada.years_leading },
                  { Icono: Calendar, label: 'Registro', value: formatFecha(seleccionada.member_since) },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', gap: '10px', padding: '8px 12px',
                    background: '#f9fafb', borderRadius: '8px', alignItems: 'flex-start'
                  }}>
                    <item.Icono size={14} color={COLOR_TEXTO_SUAVE} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '11px', color: COLOR_TEXTO_SUAVE, margin: '0 0 1px 0', fontWeight: '600' }}>{item.label}</p>
                      <p style={{ fontSize: '13px', color: '#111827', margin: 0, fontWeight: '500' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {tabActiva === 'pendiente' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => handleAprobar(seleccionada.id)} disabled={procesando} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '12px', borderRadius: '10px', border: 'none',
                    background: '#16a34a', color: 'white', cursor: 'pointer',
                    fontWeight: '700', fontSize: '14px'
                  }}><Check size={14} /> Aprobar solicitud</button>
                  <button onClick={() => abrirModalRechazo(seleccionada.id)} disabled={procesando} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '12px', borderRadius: '10px', border: '1px solid #fee2e2',
                    background: '#fff5f5', color: '#ef4444', cursor: 'pointer',
                    fontWeight: '700', fontSize: '14px'
                  }}><X size={14} /> Rechazar solicitud</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal rechazo */}
      {modalRechazo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '480px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
              Rechazar solicitud
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Escribe el motivo del rechazo. La usuaria lo verá cuando intente iniciar sesión.
            </p>
            <textarea
              value={motivoRechazo}
              onChange={e => setMotivoRechazo(e.target.value)}
              placeholder="Ej. Tu perfil no cumple con los requisitos de membresía por..."
              rows={4}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: `1px solid ${COLOR_BORDE}`, fontSize: '14px',
                resize: 'vertical', boxSizing: 'border-box', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setModalRechazo(false)} disabled={procesando} style={{
                padding: '10px 20px', borderRadius: '10px', border: `1px solid ${COLOR_BORDE}`,
                background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151',
                opacity: procesando ? 0.6 : 1,
              }}>Cancelar</button>
              <button onClick={handleRechazar} disabled={procesando} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: '#ef4444', color: 'white', cursor: 'pointer',
                fontWeight: '700', fontSize: '14px', opacity: procesando ? 0.7 : 1,
              }}>
                {procesando ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}