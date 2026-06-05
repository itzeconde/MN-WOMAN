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
  titulo?: string
}

const cardHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px)'
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
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
      backgroundColor: '#fff',
      borderTop: '1px solid #f0e6e9',
      borderBottom: '1px solid #f0e6e9',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Separador con título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ flex: 1, height: '1px', background: '#f0e6e9' }} />
          <p style={{
            fontSize: '10px', color: '#B66878', letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: '600', margin: 0,
          }}>
            {titulo}
          </p>
          <div style={{ flex: 1, height: '1px', background: '#f0e6e9' }} />
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
                border: '1px solid #f0e6e9',
                transition: 'transform 0.25s, box-shadow 0.25s',
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
                  background: '#faf8f9',
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