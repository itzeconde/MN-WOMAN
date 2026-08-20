import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPerfilPublico } from '../../api/usuarios'
import { getServicios } from '../../api/servicios'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  Building2, MapPin, Calendar, Clock, Phone,
  Link, Camera, AtSign, Globe,
  BadgeCheck, Crown, Target, Wrench,
} from 'lucide-react'

interface Usuaria {
  id: number
  nombre_completo: string
  company: string
  role: string
  business_sector: string
  location: string
  years_leading: string
  bio: string
  profile_picture: string
  linkedin: string
  instagram: string
  twitter: string
  website: string
  phone: string
  is_verified: boolean
  is_founder: boolean
  member_since: string
}

interface Servicio {
  id: number
  proveedora: number
  nombre_proveedora: string
  titulo: string
  descripcion: string
  categoria: string
  precio: number | null
  precio_personalizado: boolean
  activo: boolean
  creado_el: string
}

const sectores: Record<string, string> = {
  textil: 'Textil y Confección',
  arte: 'Arte y Diseño',
  logistica: 'Logística y Transporte',
  tecnologia: 'Tecnología e IT',
  financiero: 'Servicios Financieros',
  educacion: 'Educación',
  salud: 'Salud y Bienestar',
  agricultura: 'Agricultura Sostenible',
}

const municipios: Record<string, string> = {
  tlaxcala_centro: 'Tlaxcala Centro',
  apizaco: 'Apizaco',
  huamantla: 'Huamantla',
  chiautempan: 'Chiautempan',
  tlaxco: 'Tlaxco',
  zacatelco: 'Zacatelco',
}

const yearsLeading: Record<string, string> = {
  menos_1: 'Menos de 1 año',
  '1_3': '1 a 3 años',
  '3_5': '3 a 5 años',
  mas_5: 'Más de 5 años',
}

// Cuántos servicios se muestran antes de tener que darle a "Ver todos".
// Si en algún momento quieren otro número, solo se cambia esta constante.
const LIMITE_SERVICIOS_VISIBLES = 3

// Limpia el teléfono capturado (quita espacios, guiones, paréntesis, etc.)
// y arma el link tel: con lada de México (+52). Si el número ya trae lada
// (empieza con 52 y tiene más de 10 dígitos), no la duplica.
function buildTelLink(phone: string): string | null {
  if (!phone) return null
  const soloDigitos = phone.replace(/\D/g, '')
  if (soloDigitos.length < 10) return null // dato incompleto o basura, mejor no ofrecer el botón

  const tieneLada = soloDigitos.length > 10 && soloDigitos.startsWith('52')
  const numeroFinal = tieneLada ? soloDigitos : `52${soloDigitos}`
  return `tel:+${numeroFinal}`
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  border: `1px solid ${COLOR_BORDE}`,
}

export default function PerfilPublico() {
  const { id } = useParams()
  const [usuaria, setUsuaria] = useState<Usuaria | null>(null)
  const [cargando, setCargando] = useState(true)
  const [serviciosProveedora, setServiciosProveedora] = useState<Servicio[]>([])
  const [cargandoServicios, setCargandoServicios] = useState(true)
  const [mostrarTodosServicios, setMostrarTodosServicios] = useState(false)

  useEffect(() => {
    let cancelado = false

    const cargar = async () => {
      setCargando(true)
      try {
        const data = await getPerfilPublico(Number(id))
        if (!cancelado) setUsuaria(data)
      } catch (err) {
        if (!cancelado) console.error('Error al cargar el perfil público:', err)
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()

    return () => {
      cancelado = true
    }
  }, [id])

  // Servicios que ofrece esta proveedora. Va en un efecto aparte porque es
  // una petición independiente del perfil: si falla, no debe tumbar la vista
  // del perfil que sí cargó bien.
  useEffect(() => {
    let cancelado = false

    const cargarServicios = async () => {
      setCargandoServicios(true)
      try {
        // NOTA: requiere que el backend soporte filtrar /api/servicios/
        // por ?proveedora=<id>. Si el endpoint aún no lo soporta, hay que
        // agregar ese filtro en el ViewSet de Django (get_queryset filtrando
        // por proveedora_id, o vía django-filter). Como red de seguridad,
        // aquí también filtramos en el cliente por si el backend ignora
        // el parámetro y regresa todos los servicios.
        const data = await getServicios({ proveedora: String(id) })
        const soloDeEstaProveedora = data.filter(
          (s: Servicio) => s.proveedora === Number(id) && s.activo
        )
        if (!cancelado) setServiciosProveedora(soloDeEstaProveedora)
      } catch (err) {
        if (!cancelado) console.error('Error al cargar servicios de la proveedora:', err)
      } finally {
        if (!cancelado) setCargandoServicios(false)
      }
    }
    cargarServicios()

    return () => {
      cancelado = true
    }
  }, [id])

  // Reinicia el "ver todos" si cambiamos de perfil (evita que quede expandido
  // al navegar de un perfil a otro sin recargar la página).
  useEffect(() => {
    setMostrarTodosServicios(false)
  }, [id])

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: COLOR_MARCA, fontWeight: '600' }}>Cargando perfil...</p>
    </div>
  )

  if (!usuaria) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#6b7280' }}>Perfil no encontrado.</p>
    </div>
  )

  const telLink = buildTelLink(usuaria.phone)

  const hayMasServicios = serviciosProveedora.length > LIMITE_SERVICIOS_VISIBLES
  const serviciosVisibles = mostrarTodosServicios
    ? serviciosProveedora
    : serviciosProveedora.slice(0, LIMITE_SERVICIOS_VISIBLES)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* Fondo con degradado sutil solo detrás del header, sin repetir el
          hero grande de Directorio/Servicios para no saturar esta vista. */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 24px' }}>

          {/* Header perfil */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${COLOR_BORDE}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>

              {/* Avatar */}
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, #f7d9de)`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '36px', fontWeight: '700',
                color: COLOR_MARCA, flexShrink: 0, overflow: 'hidden'
              }}>
                {usuaria.profile_picture
                  ? (
                    <img
                      src={usuaria.profile_picture}
                      alt={usuaria.nombre_completo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        // Si la foto de perfil falla (404, storage borrado, etc.),
                        // caemos a la inicial del nombre en vez del ícono roto.
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  )
                  : null}
                <span style={{
                  display: usuaria.profile_picture ? 'none' : 'flex',
                  width: '100%', height: '100%',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {usuaria.nombre_completo?.charAt(0) || '?'}
                </span>
              </div>

              {/* Info principal */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>{usuaria.nombre_completo}</h1>
                  {usuaria.is_verified && <BadgeCheck size={18} color="#3b82f6" fill="#eff6ff" />}
                  {usuaria.is_founder && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: '700', color: COLOR_MARCA,
                      background: '#fdf2f4', padding: '4px 10px', borderRadius: '20px',
                      border: '1px solid #f6dde2',
                    }}>
                      <Crown size={11} /> Fundadora
                    </span>
                  )}
                </div>
                <p style={{ color: COLOR_MARCA, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{usuaria.company}</p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: telLink ? '16px' : 0 }}>
                  {usuaria.business_sector && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      <Building2 size={13} color={COLOR_MARCA} /> {sectores[usuaria.business_sector] || usuaria.business_sector}
                    </p>
                  )}
                  {usuaria.location && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      <MapPin size={13} color={COLOR_MARCA} /> {municipios[usuaria.location] || usuaria.location}
                    </p>
                  )}
                  {usuaria.member_since && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      <Calendar size={13} color={COLOR_MARCA} /> Miembra desde {new Date(usuaria.member_since).getFullYear()}
                    </p>
                  )}
                </div>

                {/* Botón principal de contacto por llamada */}
                {telLink && (
                  <a
                    href={telLink}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      background: COLOR_MARCA, color: 'white', textDecoration: 'none',
                      fontSize: '14px', fontWeight: '700', padding: '10px 20px',
                      borderRadius: '10px', boxShadow: `0 4px 14px ${COLOR_MARCA_CLARO}80`,
                    }}
                  >
                    <Phone size={14} /> Conectar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

          <div style={{ display: 'grid', gap: '24px' }}>

            {/* Bio */}
            {usuaria.bio && (
              <div style={cardStyle}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                  <Target size={16} color={COLOR_MARCA} /> Trayectoria y Visión
                </h2>
                <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>{usuaria.bio}</p>
              </div>
            )}

            {/* Servicios que ofrece */}
            {!cargandoServicios && serviciosProveedora.length > 0 && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    <Wrench size={16} color={COLOR_MARCA} /> Servicios que ofrece
                  </h2>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                    {serviciosProveedora.length} {serviciosProveedora.length === 1 ? 'servicio' : 'servicios'}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '14px' }}>
                  {serviciosVisibles.map((servicio) => (
                    <div
                      key={servicio.id}
                      style={{
                        border: `1px solid ${COLOR_BORDE}`, borderRadius: '12px', padding: '16px',
                        display: 'flex', flexDirection: 'column', gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>
                          {servicio.titulo}
                        </h3>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: COLOR_MARCA, whiteSpace: 'nowrap' }}>
                          {servicio.precio_personalizado
                            ? 'Consultar'
                            : servicio.precio != null
                              ? `$${Number(servicio.precio).toLocaleString('es-MX')} MXN`
                              : 'A convenir'}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                        {servicio.descripcion}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '600', color: COLOR_MARCA,
                          textTransform: 'capitalize',
                        }}>
                          {servicio.categoria}
                        </span>
                        {telLink && (
                          <a
                            href={telLink}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '12px', fontWeight: '600', color: COLOR_MARCA,
                              textDecoration: 'none', border: `1px solid ${COLOR_MARCA_CLARO}`,
                              borderRadius: '8px', padding: '4px 10px',
                            }}
                          >
                            <Phone size={11} /> Llamar para consultar
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {hayMasServicios && (
                  <button
                    onClick={() => setMostrarTodosServicios((v) => !v)}
                    style={{
                      display: 'block', width: '100%', marginTop: '14px',
                      background: '#fdf2f4', color: COLOR_MARCA, border: `1px solid ${COLOR_MARCA_CLARO}`,
                      borderRadius: '10px', padding: '10px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '700',
                    }}
                  >
                    {mostrarTodosServicios
                      ? 'Ver menos'
                      : `Ver los ${serviciosProveedora.length} servicios`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Redes y datos */}
          <div style={{ display: 'grid', gap: '16px' }}>

            {/* Conexión profesional */}
            {(usuaria.linkedin || usuaria.instagram || usuaria.twitter || usuaria.website) && (
              <div style={{ ...cardStyle, padding: '20px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                  Conexión Profesional
                </h2>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {usuaria.linkedin && (
                    <a href={usuaria.linkedin} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: COLOR_MARCA, textDecoration: 'none', wordBreak: 'break-word' }}>
                      <Link size={14} /> LinkedIn
                    </a>
                  )}
                  {usuaria.instagram && (
                    <a href={`https://instagram.com/${usuaria.instagram}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: COLOR_MARCA, textDecoration: 'none', wordBreak: 'break-word' }}>
                      <Camera size={14} /> @{usuaria.instagram}
                    </a>
                  )}
                  {usuaria.twitter && (
                    <a href={`https://twitter.com/${usuaria.twitter}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: COLOR_MARCA, textDecoration: 'none', wordBreak: 'break-word' }}>
                      <AtSign size={14} /> @{usuaria.twitter}
                    </a>
                  )}
                  {usuaria.website && (
                    <a href={usuaria.website} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: COLOR_MARCA, textDecoration: 'none', wordBreak: 'break-word' }}>
                      <Globe size={14} /> {usuaria.website}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Años liderando */}
            {usuaria.years_leading && (
              <div style={{ ...cardStyle, padding: '20px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                  <Clock size={14} color={COLOR_MARCA} /> Experiencia
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{yearsLeading[usuaria.years_leading] || usuaria.years_leading} liderando su negocio</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}