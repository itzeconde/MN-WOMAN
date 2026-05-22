import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPerfilPublico } from '../../api/usuarios'

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
  linkedin: string
  instagram: string
  twitter: string
  website: string
  is_verified: boolean
  is_founder: boolean
  member_since: string
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

export default function PerfilPublico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [usuaria, setUsuaria] = useState<Usuaria | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getPerfilPublico(Number(id))
        setUsuaria(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#B66878', fontWeight: '600' }}>Cargando perfil...</p>
    </div>
  )

  if (!usuaria) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: '#6b7280' }}>Perfil no encontrado.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Botón volver */}
        <button onClick={() => navigate('/directorio')}
          style={{ background: 'none', border: 'none', color: '#B66878', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '24px', padding: 0 }}>
          ← Volver al directorio
        </button>

        {/* Header perfil */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>

            {/* Avatar */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: '#EFC3CA', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '36px', fontWeight: '700',
              color: '#B66878', flexShrink: 0, overflow: 'hidden'
            }}>
              {usuaria.profile_picture
                ? <img src={usuaria.profile_picture} alt={usuaria.nombre_completo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : usuaria.nombre_completo.charAt(0)
              }
            </div>

            {/* Info principal */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{usuaria.nombre_completo}</h1>
                {usuaria.is_verified && <span style={{ fontSize: '16px' }} title="Verificada">✅</span>}
                {usuaria.is_founder && (
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#fdf2f4', color: '#B66878', fontWeight: '600' }}>
                    Fundadora
                  </span>
                )}
              </div>
              <p style={{ color: '#B66878', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{usuaria.company}</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {usuaria.business_sector && (
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>🏢 {sectores[usuaria.business_sector] || usuaria.business_sector}</p>
                )}
                {usuaria.municipality && (
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>📍 {municipios[usuaria.municipality] || usuaria.municipality}</p>
                )}
                {usuaria.member_since && (
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>📅 Miembra desde {new Date(usuaria.member_since).getFullYear()}</p>
                )}
              </div>
            </div>

            {/* Botón conectar */}
            <button style={{ background: '#B66878', color: 'white', padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>
              Conectar
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

          {/* Bio */}
          {usuaria.bio && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>🎯 Trayectoria y Visión</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.7' }}>{usuaria.bio}</p>
            </div>
          )}

          {/* Redes y datos */}
          <div style={{ display: 'grid', gap: '16px' }}>

            {/* Conexión profesional */}
            {(usuaria.linkedin || usuaria.instagram || usuaria.twitter || usuaria.website) && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>🔗 Conexión Profesional</h2>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {usuaria.linkedin && (
                    <a href={usuaria.linkedin} target="_blank" rel="noreferrer"
                      style={{ fontSize: '14px', color: '#B66878', textDecoration: 'none' }}>
                      💼 LinkedIn
                    </a>
                  )}
                  {usuaria.instagram && (
                    <a href={`https://instagram.com/${usuaria.instagram}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: '14px', color: '#B66878', textDecoration: 'none' }}>
                      📸 @{usuaria.instagram}
                    </a>
                  )}
                  {usuaria.twitter && (
                    <a href={`https://twitter.com/${usuaria.twitter}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: '14px', color: '#B66878', textDecoration: 'none' }}>
                      🐦 @{usuaria.twitter}
                    </a>
                  )}
                  {usuaria.website && (
                    <a href={usuaria.website} target="_blank" rel="noreferrer"
                      style={{ fontSize: '14px', color: '#B66878', textDecoration: 'none' }}>
                      🌐 {usuaria.website}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Años liderando */}
            {usuaria.years_leading && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>⏱ Experiencia</h2>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{usuaria.years_leading} años liderando su negocio</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}