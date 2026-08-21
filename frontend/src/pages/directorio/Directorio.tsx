import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDirectorio } from '../../api/usuarios'
import api from '../../api/axios'
import { useCargaConError } from '../../hooks/useCargaConError'
import EstadoSinConexion from '../../components/ui/EstadoSinConexion'
import { paginacionBotonStyle, badgePillStyle, COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  Building2, MapPin, BadgeCheck, Crown, ArrowRight,
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Heart, Sparkles,
} from 'lucide-react'
import heroImg from '../../assets/hero-directorio.png'

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
  is_verified: boolean
  is_founder: boolean
}

interface Banner {
  id: number
  titulo: string
  imagen_url: string | null
  url_destino: string
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

const USUARIAS_POR_PAGINA = 9

// --- Franja decorativa del hero -------------------------------------------
// Sustituir por tu propia ilustración/asset si ya tienen uno; esto es un
// placeholder hecho con formas + iconos para no depender de una imagen externa.
function HeroIlustracion() {
  return (
    <div className="directorio-hero-ilustracion" style={{
      position: 'relative', width: '260px', height: '190px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}55, transparent 70%)`,
      }} />
      <Sparkles size={18} color={COLOR_MARCA} style={{ position: 'absolute', top: '6px', left: '10px', opacity: 0.6 }} />
      <Sparkles size={14} color={COLOR_MARCA} style={{ position: 'absolute', bottom: '18px', right: '4px', opacity: 0.5 }} />
      {/* Coloca tu archivo en src/assets/hero-directorio.png (o ajusta el
          import de arriba a la ruta/nombre real que uses). */}
      <img
        src={heroImg}
        alt="Mujeres colaborando en la comunidad"
        style={{
          position: 'relative', width: '220px', height: '220px',
          objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(182,104,120,0.25))',
        }}
      />
    </div>
  )
}

function PanelFiltros({
  filtroMunicipio, setFiltroMunicipio, filtroFundadora, setFiltroFundadora, limpiarFiltros,
}: {
  filtroMunicipio: string
  setFiltroMunicipio: (v: string) => void
  filtroFundadora: boolean
  setFiltroFundadora: (v: boolean) => void
  limpiarFiltros: () => void
}) {
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '20px 24px',
      border: `1px solid ${COLOR_BORDE}`, boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '20px', marginBottom: '20px',
    }}>
      <div style={{ minWidth: '220px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Municipio</p>
        <input
          placeholder="Ej: Apizaco"
          value={filtroMunicipio}
          onChange={(e) => setFiltroMunicipio(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' as const }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280', paddingBottom: '10px' }}>
        <input type="checkbox" checked={filtroFundadora} onChange={(e) => setFiltroFundadora(e.target.checked)}
          style={{ accentColor: COLOR_MARCA }} />
        Solo Fundadoras
      </label>

      <button onClick={limpiarFiltros}
        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: COLOR_MARCA, cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
        Limpiar filtros
      </button>
    </div>
  )
}

function Banners() {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    api.get('/banners/public/', { params: { posicion: 'directorio' } })
      .then(({ data }) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  if (banners.length === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginTop: '32px' }}>
      {banners.map(banner => (
        <a key={banner.id} href={banner.url_destino} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            borderRadius: '14px', overflow: 'hidden', border: `1px solid ${COLOR_BORDE}`,
            boxShadow: '0 2px 8px rgba(182,104,120,0.1)', background: 'white',
          }}>
            {banner.imagen_url ? (
              <img src={banner.imagen_url} alt={banner.titulo} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{
                height: '120px', background: `linear-gradient(135deg, #FDF0F2, ${COLOR_MARCA_CLARO})`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '22px' }}>📢</span>
                <span style={{ fontSize: '12px', color: COLOR_MARCA, fontWeight: '700', textAlign: 'center', padding: '0 12px' }}>{banner.titulo}</span>
              </div>
            )}
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#111827', margin: 0 }}>{banner.titulo}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

export default function Directorio() {
  const navigate = useNavigate()
  const [usuarias, setUsuarias] = useState<Usuaria[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [filtroMunicipio, setFiltroMunicipio] = useState('')
  const [filtroFundadora, setFiltroFundadora] = useState(false)
  const [mostrarMasFiltros, setMostrarMasFiltros] = useState(false)
  const [pagina, setPagina] = useState(1)

  const { cargando, errorRed, ejecutar } = useCargaConError()

  const cargarDirectorio = () => ejecutar(async () => {
    const filtros: Record<string, string> = {}
    if (filtroSector) filtros.sector = filtroSector
    if (filtroFundadora) filtros.fundadora = 'true'
    const data = await getDirectorio(filtros)
    setUsuarias(data)
  })

  useEffect(() => {
    cargarDirectorio()
  }, [filtroSector, filtroFundadora])

  useEffect(() => {
    setPagina(1)
  }, [busqueda, filtroSector, filtroMunicipio, filtroFundadora])

  const usuariasFiltradas = usuarias.filter((u) => {
    const coincideBusqueda =
      u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.company?.toLowerCase().includes(busqueda.toLowerCase())

    const textoUbicacion = (municipios[u.location] || u.location || '').toLowerCase()
    const coincideMunicipio = !filtroMunicipio || textoUbicacion.includes(filtroMunicipio.toLowerCase())

    return coincideBusqueda && coincideMunicipio
  })

  const totalPaginas = Math.max(1, Math.ceil(usuariasFiltradas.length / USUARIAS_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const usuariasPagina = usuariasFiltradas.slice(
    (paginaSegura - 1) * USUARIAS_POR_PAGINA,
    paginaSegura * USUARIAS_POR_PAGINA
  )

  const limpiarFiltros = () => {
    setFiltroSector('')
    setFiltroMunicipio('')
    setFiltroFundadora(false)
    setBusqueda('')
  }

  // Números de página con "..." cuando hay muchas páginas.
  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1])
    return Array.from(nums).filter(n => n >= 1 && n <= totalPaginas).sort((a, b) => a - b)
  }, [totalPaginas, paginaSegura])

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .directorio-hero-pad { padding: 48px 20px 32px; }
        .directorio-body-pad { padding: 32px 20px 40px; }

        .directorio-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .directorio-mas-filtros-btn { padding: 13px 18px; }

        @media (max-width: 768px) {
          .directorio-hero-pad { padding: 32px 16px 24px; }
          .directorio-body-pad { padding: 24px 16px 32px; }
          .directorio-hero-ilustracion { display: none; }
        }

        @media (max-width: 480px) {
          .directorio-cards-grid { grid-template-columns: 1fr; gap: 14px; }
          .directorio-mas-filtros-btn { flex: 1; justify-content: center; padding: 13px 12px; }
        }
      `}</style>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div className="directorio-hero-pad" style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.25' }}>
              Directorio de mujeres
            </h1>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: COLOR_MARCA, margin: '0 0 12px', lineHeight: '1.25', display: 'flex', alignItems: 'center', gap: '10px' }}>
              que hacen crecer Tlaxcala <Heart size={22} color={COLOR_MARCA} fill={COLOR_MARCA_CLARO} />
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
              Conecta con emprendedoras, profesionales y empresas de nuestra comunidad.
            </p>
          </div>

          <HeroIlustracion />
        </div>
      </div>

      <div className="directorio-body-pad" style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* BUSCADOR + BOTON MAS FILTROS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Busca por nombre, negocio o servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px',
                border: `1px solid ${COLOR_BORDE}`, fontSize: '14px', boxSizing: 'border-box' as const,
                background: 'white',
              }}
            />
          </div>
          <button
            className="directorio-mas-filtros-btn"
            onClick={() => setMostrarMasFiltros(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              borderRadius: '12px', border: `1px solid ${mostrarMasFiltros ? COLOR_MARCA : COLOR_BORDE}`,
              background: mostrarMasFiltros ? '#fdf2f4' : 'white', color: COLOR_MARCA,
              fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={15} /> Más filtros
          </button>
        </div>

        {/* CHIPS DE SECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            <button
              onClick={() => setFiltroSector('')}
              style={{
                padding: '9px 18px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                background: filtroSector === '' ? COLOR_MARCA : 'white',
                color: filtroSector === '' ? 'white' : '#374151',
                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                boxShadow: filtroSector === '' ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
              }}
            >
              Todos
            </button>
            {Object.entries(sectores).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFiltroSector(filtroSector === val ? '' : val)}
                style={{
                  padding: '9px 18px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                  background: filtroSector === val ? COLOR_MARCA : 'white',
                  color: filtroSector === val ? 'white' : '#374151',
                  fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                  boxShadow: filtroSector === val ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mostrarMasFiltros && (
          <PanelFiltros
            filtroMunicipio={filtroMunicipio}
            setFiltroMunicipio={setFiltroMunicipio}
            filtroFundadora={filtroFundadora}
            setFiltroFundadora={setFiltroFundadora}
            limpiarFiltros={limpiarFiltros}
          />
        )}

        {/* RESULTADOS */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Cargando directorio...</div>
        ) : errorRed ? (
          <EstadoSinConexion
            onReintentar={cargarDirectorio}
            mensaje="No se pudo cargar el directorio. Revisa tu internet e intenta de nuevo."
          />
        ) : usuariasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No se encontraron resultados.</p>
            <p style={{ fontSize: '14px' }}>Intenta con otros filtros.</p>
          </div>
        ) : (
          <>
            <div className="directorio-cards-grid">
              {usuariasPagina.map((u) => (
                <div
                  key={u.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/directorio/${u.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/directorio/${u.id}`)
                    }
                  }}
                  style={{
                    background: 'white', borderRadius: '16px', padding: '20px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    border: `1px solid ${COLOR_BORDE}`,
                    cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
                    e.currentTarget.style.borderColor = COLOR_MARCA_CLARO
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                    e.currentTarget.style.borderColor = COLOR_BORDE
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, #f7d9de)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: '700', color: COLOR_MARCA,
                        overflow: 'hidden', border: '2px solid white',
                      }}>
                        {u.profile_picture
                          ? <img src={u.profile_picture} alt={u.nombre_completo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : u.nombre_completo.charAt(0)
                        }
                      </div>
                      {u.is_verified && (
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'white', borderRadius: '50%', padding: '1px', display: 'flex' }}>
                          <BadgeCheck size={14} color="#3b82f6" fill="#eff6ff" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827', margin: 0, lineHeight: '1.3' }}>
                        {u.nombre_completo}
                      </p>
                      <p style={{ color: COLOR_MARCA, fontSize: '13px', fontWeight: '600', margin: 0 }}>{u.company}</p>
                    </div>
                    {u.is_founder && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                        fontSize: '10px', fontWeight: '700', color: COLOR_MARCA,
                        background: '#fdf2f4', padding: '4px 8px', borderRadius: '20px',
                        border: '1px solid #f6dde2',
                      }}>
                        <Crown size={10} /> Fundadora
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {u.business_sector && (
                      <span style={badgePillStyle('#fdf8f9', '#8a5a63')}>
                        <Building2 size={11} style={{ marginRight: '4px', verticalAlign: '-2px' }} color={COLOR_MARCA} />
                        {sectores[u.business_sector] || u.business_sector}
                      </span>
                    )}
                    {u.location && (
                      <span style={badgePillStyle('#fdf8f9', '#8a5a63')}>
                        <MapPin size={11} style={{ marginRight: '4px', verticalAlign: '-2px' }} color={COLOR_MARCA} />
                        {municipios[u.location] || u.location}
                      </span>
                    )}
                  </div>

                  {u.bio && (
                    <p style={{
                      fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 16px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                    }}>
                      {u.bio}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: `1px solid ${COLOR_BORDE}` }}>
                    <span style={{ fontSize: '13px', color: COLOR_MARCA, fontWeight: '600' }}>Ver perfil</span>
                    <span style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: COLOR_MARCA,
                    }}>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
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
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  style={paginacionBotonStyle(false, paginaSegura === totalPaginas)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            <Banners />
          </>
        )}
      </div>
    </div>
  )
}