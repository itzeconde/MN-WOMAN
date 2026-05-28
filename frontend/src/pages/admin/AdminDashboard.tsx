import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const cards = [
    { icon: '📅', label: 'Eventos',               ruta: '/admin/eventos' },
    { icon: '🎓', label: 'Cursos',                ruta: '/admin/cursos' },
    { icon: '👥', label: 'Solicitudes pendientes', ruta: '/admin/solicitudes' },
    { icon: '📝', label: 'Artículos',             ruta: '/admin/articulos' },
    { icon: '📢', label: 'Publicidad / Banners',  ruta: '/admin/banners' },
  ]

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
        Bienvenida, Administradora
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Gestiona todos los contenidos de la plataforma MN WOMAN.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {cards.map(card => (
          <div
            key={card.ruta}
            onClick={() => navigate(card.ruta)}
            style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(182,104,120,0.18)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}
          >
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', margin: 0 }}>{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}