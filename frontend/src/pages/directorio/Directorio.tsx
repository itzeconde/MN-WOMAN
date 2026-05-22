import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDirectorio } from '../../api/usuarios'

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

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>

          {/* Filtros */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', height: 'fit-content' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>🔍 Filtros</h2>

            {/* Búsqueda */}
            <input
              placeholder="Buscar líder o empresa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box' as const }}
            />

            {/* Sector */}
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

            {/* Municipio */}
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

            {/* Fundadoras */}
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
                    
                    {/* Header tarjeta */}
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

                    {/* Info */}
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

                    {/* Botones */}
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