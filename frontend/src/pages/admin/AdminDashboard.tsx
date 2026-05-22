export default function AdminDashboard() {
  const cards = [
    { icon: '📅', label: 'Eventos', ruta: '/admin/eventos' },
    { icon: '🎓', label: 'Cursos', ruta: '/admin/cursos' },
    { icon: '👥', label: 'Solicitudes pendientes', ruta: '/admin/solicitudes' },
    { icon: '📝', label: 'Artículos', ruta: '/admin/articulos' },
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
          <a key={card.ruta} href={card.ruta} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}>
              <p style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{card.label}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
