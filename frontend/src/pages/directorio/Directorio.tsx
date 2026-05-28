import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDirectorio } from '../../api/usuarios'

const API_BASE = 'http://127.0.0.1:8000/api'

interface Usuaria {
  id: number
  nombre_completo: string
  company: string
  role: string
  business_sector: string
  municipality: string
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

function SidebarBanners() {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/banners/public/?posicion=directorio`)
      .then(r => r.json())
      .then(d => setBanners(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  if (banners.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '1px', background: '#f3e8ea' }} />
        <p style={{ fontSize: '10px', color: '#B66878', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '600', margin: 0 }}>
          Destacadas
        </p>
        <div style={{ flex: 1, height: '1px', background: '#f3e8ea' }} />
      </div>

      {banners.map(banner => (
        <a
          key={banner.id}
          href={banner.url_destino}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div
            style={{
              borderRadius: '14px', overflow: 'hidden',
              border: '1px solid #f3e8ea',
              boxShadow: '0 2px 8px rgba(182,104,120,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              background: 'white',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(182,104,120,0.2)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(182,104,120,0.1)'
            }}
          >
            {banner.imagen_url ? (
              <img
                src={banner.imagen_url}
                alt={banner.titulo}
                style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                height: '140px', background: 'linear-gradient(135deg, #FDF0F2, #f9d0d8)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '24px' }}>📢</span>
                <span style={{ fontSize: '12px', color: '#B66878', fontWeight: '700', textAlign: 'center', padding: '0 12px' }}>
                  {banner.titulo}
                </span>
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
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [filtroMunicipio, setFiltroMunicipio] = useState('')
  const [filtroFundadora, setFiltroFundadora] = useState(false)

  useEffect(() => {
    cargarDirectorio()
  }, [filtroSector, filtroMunicipio, filtroFundadora])

  const cargarDirectorio = async () => {
    setCargando(true)
    try {
      const filtros: Record<string, string> = {}
      if (filtroSector) filtros.sector = filtroSector
      if (filtroMunicipio) filtros.municipio = filtroMunicipio
      if (filtroFundadora) filtros.fundadora = 'true'
      const data = await getDirectorio(filtros)
      setUsuarias(data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const usuariasFiltradas = usuarias.filter((u) =>
    u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.company?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const limpiarFiltros = () => {
    setFiltroSector('')
    setFiltroMunicipio('')
    setFiltroFundadora(false)
    setBusqueda('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            Directorio de Miembras
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Encuentra colaboradoras, mentoras y socias comerciales en Tlaxcala.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* Sidebar — filtros + banners */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Filtros */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>🔍 Filtros</h2>

              <input
                placeholder="Buscar líder o empresa..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box' as const }}
              />

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Sector de Negocio</p>
                {Object.entries(sectores).map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>
                    <input type="radio" name="sector" value={val}
                      checked={filtroSector === val}
                      onChange={() => setFiltroSector(filtroSector === val ? '' : val)}
                      style={{ accentColor: '#B66878' }} />
                    {label}
                  </label>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Municipio</p>
                {Object.entries(municipios).map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>
                    <input type="radio" name="municipio" value={val}
                      checked={filtroMunicipio === val}
                      onChange={() => setFiltroMunicipio(filtroMunicipio === val ? '' : val)}
                      style={{ accentColor: '#B66878' }} />
                    {label}
                  </label>
                ))}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                <input type="checkbox" checked={filtroFundadora} onChange={(e) => setFiltroFundadora(e.target.checked)}
                  style={{ accentColor: '#B66878' }} />
                Solo Fundadoras
              </label>

              <button onClick={limpiarFiltros}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#B66878', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Limpiar filtros
              </button>
            </div>

            {/* Banners sidebar */}
            <SidebarBanners />

          </div>

          {/* Grid de usuarias */}
          <div>
            {cargando ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Cargando directorio...</div>
            ) : usuariasFiltradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No se encontraron resultados.</p>
                <p style={{ fontSize: '14px' }}>Intenta con otros filtros.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {usuariasFiltradas.map((u) => (
                  <div key={u.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: '#EFC3CA', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#B66878',
                        flexShrink: 0, overflow: 'hidden'
                      }}>
                        {u.profile_picture
                          ? <img src={u.profile_picture} alt={u.nombre_completo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : u.nombre_completo.charAt(0)
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <p style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>{u.nombre_completo}</p>
                          {u.is_verified && <span style={{ fontSize: '14px' }}>✓</span>}
                        </div>
                        <p style={{ color: '#B66878', fontSize: '13px', fontWeight: '500' }}>{u.company}</p>
                      </div>
                      {u.is_founder && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: '#fdf2f4', color: '#B66878', fontWeight: '600', flexShrink: 0 }}>
                          Fundadora
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gap: '4px', marginBottom: '14px' }}>
                      {u.business_sector && (
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>🏢 {sectores[u.business_sector] || u.business_sector}</p>
                      )}
                      {u.municipality && (
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>📍 {municipios[u.municipality] || u.municipality}</p>
                      )}
                      {u.years_leading && (
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>⏱ {u.years_leading} años liderando</p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/directorio/${u.id}`)}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                        Ver perfil
                      </button>
                      <button
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#B66878', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        Conectar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}