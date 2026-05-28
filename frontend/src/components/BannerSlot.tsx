import { useEffect, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000/api'

interface Banner {
  id: number
  titulo: string
  imagen_url: string | null
  url_destino: string
  posicion: string
}

interface Props {
  posicion: string
  titulo?: string  // Texto del separador, ej: "Presencia" o "Patrocinadores"
}

const cardHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px)'
    e.currentTarget.style.boxShadow = '0 8px 30px rgba(182,104,120,0.25)'
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = '0 4px 20px rgba(182,104,120,0.15)'
  },
}

export default function BannerSlot({ posicion, titulo = 'Presencia' }: Props) {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/banners/public/?posicion=${posicion}`)
      .then(r => r.json())
      .then(d => setBanners(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [posicion])

  if (banners.length === 0) return null

  return (
    <section style={{
      padding: '48px 24px',
      background: 'linear-gradient(135deg, #fff5f7 0%, #fdf0f2 100%)',
      borderTop: '2px solid #f3e8ea',
      borderBottom: '2px solid #f3e8ea',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Separador con título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #e8b4bc)' }} />
          <p style={{
            fontSize: '10px', color: '#B66878', letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: '600', margin: 0,
          }}>
            {titulo}
          </p>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #e8b4bc)' }} />
        </div>

        {/* Grid de banners */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
          {banners.map(banner => (
            <a
              key={banner.id}
              href={banner.url_destino}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(182,104,120,0.15)',
                transition: 'transform 0.25s, box-shadow 0.25s',
                border: '1px solid #f3e8ea',
                display: 'block',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
              {...cardHover}
            >
              {banner.imagen_url ? (
                <img
                  src={banner.imagen_url}
                  alt={banner.titulo}
                  style={{ height: '240px', width: '200px', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  height: '240px', width: '200px',
                  background: 'linear-gradient(135deg, #FDF0F2, #f9d0d8)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  <div style={{ fontSize: '28px' }}>📢</div>
                  <div style={{
                    fontSize: '13px', color: '#B66878', fontWeight: '700',
                    textAlign: 'center', padding: '0 12px',
                  }}>
                    {banner.titulo}
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}