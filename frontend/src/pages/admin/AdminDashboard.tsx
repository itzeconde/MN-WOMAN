import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSolicitudes } from '../../api/usuarios'
import { COLOR_MARCA, COLOR_BORDE } from '../../styles/tokens'
import { Users, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [pendientes, setPendientes] = useState<number>(0)
  const [cargandoBadge, setCargandoBadge] = useState(true)
  const [errorPendientes, setErrorPendientes] = useState(false)

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
      setErrorPendientes(false)
    } catch (err) {
      console.error('No se pudo cargar el conteo de solicitudes pendientes', err)
      setErrorPendientes(true)
      // no rompemos el resto del dashboard, solo no mostramos el badge
    } finally {
      setCargandoBadge(false)
    }
  }

  const irA = (ruta: string) => navigate(ruta)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* ENCABEZADO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.25' }}>
            Bienvenida, <span style={{ color: COLOR_MARCA }}>Administradora</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: '8px 0 0' }}>
            Esto es lo que necesita tu atención hoy. Usa el menú para gestionar el resto de la plataforma.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px 40px' }}>

        {/* SOLICITUDES PENDIENTES — la única métrica real que tenemos hoy.
            Cuando existan endpoints de conteo para eventos, cursos o artículos
            (ej. getEventosProximos, getCursosActivos), se puede agregar cada
            uno como una card más dentro de este mismo grid. */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          <div
            role="button"
            tabIndex={0}
            className="foco-visible"
            onClick={() => irA('/admin/solicitudes')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                irA('/admin/solicitudes')
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
              background: 'white', borderRadius: '16px', padding: '22px',
              border: `1px solid ${cargandoBadge || errorPendientes ? COLOR_BORDE : pendientes > 0 ? '#fde68a' : COLOR_BORDE}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(182,104,120,0.15)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
              background: pendientes > 0 ? '#fef3c7' : '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cargandoBadge ? (
                <Users size={22} color="#9ca3af" />
              ) : pendientes > 0 ? (
                <Users size={22} color="#d97706" />
              ) : (
                <CheckCircle2 size={22} color="#16a34a" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {cargandoBadge ? (
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, fontWeight: '600' }}>Cargando...</p>
              ) : errorPendientes ? (
                <>
                  <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: '700' }}>Solicitudes</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '2px 0 0' }}>No se pudo actualizar el contador</p>
                </>
              ) : pendientes > 0 ? (
                <>
                  <p style={{ fontSize: '24px', color: '#111827', margin: 0, fontWeight: '800', lineHeight: 1 }}>{pendientes}</p>
                  <p style={{ fontSize: '13px', color: '#92400e', margin: '4px 0 0', fontWeight: '600' }}>
                    {pendientes === 1 ? 'solicitud pendiente por revisar' : 'solicitudes pendientes por revisar'}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: '700' }}>Solicitudes al día</p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '2px 0 0' }}>No hay nada pendiente por revisar</p>
                </>
              )}
            </div>

            {errorPendientes ? (
              <AlertCircle size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
            ) : (
              <ArrowRight size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
            )}
          </div>
        </div>
      </div>

      <style>{`
        .foco-visible:focus-visible {
          outline: 2px solid ${COLOR_MARCA};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}