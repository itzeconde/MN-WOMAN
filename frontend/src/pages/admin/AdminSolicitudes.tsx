import { useState, useEffect } from 'react'
import { getSolicitudes, accionSolicitud } from '../../api/usuarios'

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

export default function AdminSolicitudes() {
  const [tabActiva, setTabActiva] = useState('pendiente')
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [cargando, setCargando] = useState(true)
  const [seleccionada, setSeleccionada] = useState<Solicitud | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [modalRechazo, setModalRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [solicitudArechazar, setSolicitudArechazar] = useState<number | null>(null)

  useEffect(() => { cargar() }, [tabActiva])

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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
            Solicitudes de Ingreso
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Revisa y gestiona las solicitudes de nuevas miembras.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setTabActiva(tab.key)} style={{
              padding: '8px 20px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              background: tabActiva === tab.key ? tab.bg : 'white',
              color: tabActiva === tab.key ? tab.color : '#6b7280',
              border: tabActiva === tab.key ? `1px solid ${tab.color}30` : '1px solid #e5e7eb',
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

        <div style={{ display: 'grid', gridTemplateColumns: seleccionada ? '1fr 380px' : '1fr', gap: '20px' }}>

          {/* Lista */}
          <div>
            {cargando ? (
              <p style={{ color: '#6b7280', padding: '40px', textAlign: 'center' }}>Cargando...</p>
            ) : solicitudes.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>📭</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay solicitudes {tabActiva}s</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {solicitudes.map(s => (
                  <div key={s.id} onClick={() => setSeleccionada(s)} style={{
                    background: 'white', borderRadius: '14px', padding: '16px 20px',
                    border: seleccionada?.id === s.id ? '1.5px solid #B66878' : '1px solid #f3f4f6',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                      background: s.profile_picture ? 'none' : 'linear-gradient(135deg, #EFC3CA, #B66878)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white'
                    }}>
                      {s.profile_picture
                        ? <img src={s.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : iniciales(s.nombre_completo)
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', color: '#111827', fontSize: '14px', margin: '0 0 2px 0' }}>
                        {s.nombre_completo}
                      </p>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                        {s.company} · {SECTORES[s.business_sector] || s.business_sector}
                      </p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>
                      {formatFecha(s.member_since)}
                    </p>
                    {tabActiva === 'pendiente' && (
                      <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleAprobar(s.id)} disabled={procesando} style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: '#dcfce7', color: '#16a34a', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '700'
                        }}>✓ Aprobar</button>
                        <button onClick={() => abrirModalRechazo(s.id)} disabled={procesando} style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: '#fee2e2', color: '#ef4444', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '700'
                        }}>✕ Rechazar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel detalle */}
          {seleccionada && (
            <div style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              height: 'fit-content', position: 'sticky', top: '20px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 12px',
                  background: seleccionada.profile_picture ? 'none' : 'linear-gradient(135deg, #EFC3CA, #B66878)',
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
                <p style={{ fontSize: '13px', color: '#B66878', fontWeight: '600', margin: 0 }}>
                  {seleccionada.company}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { icon: '📧', label: 'Email', value: seleccionada.email },
                  { icon: '📱', label: 'Teléfono', value: seleccionada.phone || 'No proporcionado' },
                  { icon: '📂', label: 'Sector', value: SECTORES[seleccionada.business_sector] || seleccionada.business_sector },
                  { icon: '📍', label: 'Municipio', value: MUNICIPIOS[seleccionada.municipality] || seleccionada.municipality },
                  { icon: '⏱️', label: 'Años liderando', value: YEARS[seleccionada.years_leading] || seleccionada.years_leading },
                  { icon: '📅', label: 'Registro', value: formatFecha(seleccionada.member_since) },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', gap: '10px', padding: '8px 12px',
                    background: '#f9fafb', borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 1px 0', fontWeight: '600' }}>{item.label}</p>
                      <p style={{ fontSize: '13px', color: '#111827', margin: 0, fontWeight: '500' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {tabActiva === 'pendiente' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => handleAprobar(seleccionada.id)} disabled={procesando} style={{
                    padding: '12px', borderRadius: '10px', border: 'none',
                    background: '#16a34a', color: 'white', cursor: 'pointer',
                    fontWeight: '700', fontSize: '14px'
                  }}>✓ Aprobar solicitud</button>
                  <button onClick={() => abrirModalRechazo(seleccionada.id)} disabled={procesando} style={{
                    padding: '12px', borderRadius: '10px', border: '1px solid #fee2e2',
                    background: '#fff5f5', color: '#ef4444', cursor: 'pointer',
                    fontWeight: '700', fontSize: '14px'
                  }}>✕ Rechazar solicitud</button>
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
                border: '1px solid #e5e7eb', fontSize: '14px',
                resize: 'vertical', boxSizing: 'border-box', outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setModalRechazo(false)} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb',
                background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151'
              }}>Cancelar</button>
              <button onClick={handleRechazar} disabled={procesando} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: '#ef4444', color: 'white', cursor: 'pointer',
                fontWeight: '700', fontSize: '14px'
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