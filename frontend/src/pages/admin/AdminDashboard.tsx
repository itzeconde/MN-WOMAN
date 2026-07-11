import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSolicitudes } from '../../api/usuarios'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [pendientes, setPendientes] = useState<number>(0)
  const [cargandoBadge, setCargandoBadge] = useState(true)

  useEffect(() => {
    cargarPendientes()

    // Opcional: refresca el contador cada 2 minutos sin que la admin recargue la página
    const intervalo = setInterval(cargarPendientes, 2 * 60 * 1000)
    return () => clearInterval(intervalo)
  }, [])

  const cargarPendientes = async () => {
    try {
      const data = await getSolicitudes('pendiente')
      const lista = data.results ?? data
      setPendientes(lista.length)
    } catch {
      // si falla, simplemente no mostramos badge, no rompemos el dashboard
    } finally {
      setCargandoBadge(false)
    }
  }

  const cards = [
    { icon: '📅', label: 'Eventos',               ruta: '/admin/eventos' },
    { icon: '🎓', label: 'Cursos',                ruta: '/admin/cursos' },
    { icon: '👥', label: 'Solicitudes pendientes', ruta: '/admin/solicitudes', badge: pendientes },
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

      {!cargandoBadge && pendientes > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fffbeb', border: '1px solid #f59e0b30',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '24px'
        }}>
          <span style={{ fontSize: '18px' }}>🔔</span>
          <p style={{ fontSize: '14px', color: '#92400e', margin: 0, fontWeight: '600' }}>
            Tienes {pendientes} {pendientes === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'} por revisar
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {cards.map(card => (
          <div
            key={card.ruta}
            onClick={() => navigate(card.ruta)}
            style={{
              position: 'relative',
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
            {!!card.badge && card.badge > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#ef4444', color: 'white',
                borderRadius: '20px', minWidth: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '800', padding: '0 6px',
                boxShadow: '0 2px 6px rgba(239,68,68,0.4)'
              }}>
                {card.badge}
              </span>
            )}
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', margin: 0 }}>{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}