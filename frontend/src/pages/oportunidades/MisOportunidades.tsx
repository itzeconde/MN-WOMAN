import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMisOportunidades, cerrarOportunidad } from '../../api/oportunidades'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import { Plus, Clock, Users, ArrowRight } from 'lucide-react'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'

interface Oportunidad {
  id: number
  titulo: string
  categoria: string
  urgencia: 'alta' | 'media' | 'baja'
  status: string
  vence_el: string
  total_postulaciones: number
  postulaciones_pendientes: number
  esta_vencida: boolean
}

const URGENCIA_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  alta: { bg: '#fef2f2', color: '#dc2626', label: 'Urgente' },
  media: { bg: '#fffbeb', color: '#d97706', label: 'Media' },
  baja: { bg: '#f0fdf4', color: '#16a34a', label: 'Baja' },
}

// Estado visual derivado: cerrada > vencida > activa.
// 'vencida' nunca se guarda en BD, siempre se calcula a partir de esta_vencida.
type EstadoVisual = 'activa' | 'vencida' | 'cerrada'

const ESTADO_STYLE: Record<EstadoVisual, { bg: string; color: string; label: string }> = {
  activa: { bg: '#f0fdf4', color: '#16a34a', label: 'Activa' },
  vencida: { bg: '#fff7ed', color: '#c2410c', label: 'Vencida' },
  cerrada: { bg: '#f3f4f6', color: '#6b7280', label: 'Cerrada' },
}

const getEstadoVisual = (o: Oportunidad): EstadoVisual => {
  if (o.status === 'cerrada') return 'cerrada'
  if (o.esta_vencida) return 'vencida'
  return 'activa'
}

const TABS: { key: EstadoVisual; label: string }[] = [
  { key: 'activa', label: 'Activas' },
  { key: 'vencida', label: 'Vencidas' },
  { key: 'cerrada', label: 'Cerradas' },
]

export default function MisOportunidades() {
  const navigate = useNavigate()
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [cargando, setCargando] = useState(true)
  const [cerrandoId, setCerrandoId] = useState<number | null>(null)
  const [tabActiva, setTabActiva] = useState<EstadoVisual>('activa')

  // Estado del modal de confirmación al cerrar una oportunidad.
  const [oportunidadAConfirmar, setOportunidadAConfirmar] = useState<Oportunidad | null>(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const data = await getMisOportunidades()
      setOportunidades(data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const pedirConfirmacionCerrar = (o: Oportunidad) => {
    setOportunidadAConfirmar(o)
  }

  const confirmarCierre = async () => {
    if (!oportunidadAConfirmar) return
    const id = oportunidadAConfirmar.id
    setCerrandoId(id)
    try {
      await cerrarOportunidad(id)
      setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'cerrada' } : o)))
      setOportunidadAConfirmar(null)
    } catch (err) {
      console.error(err)
      alert('No se pudo cerrar la oportunidad.')
    } finally {
      setCerrandoId(null)
    }
  }

  const grupos = useMemo(() => {
    const base: Record<EstadoVisual, Oportunidad[]> = { activa: [], vencida: [], cerrada: [] }
    for (const o of oportunidades) {
      base[getEstadoVisual(o)].push(o)
    }
    return base
  }, [oportunidades])

  // Si la tab activa se queda sin elementos (ej. justo cerraste la última "activa"),
  // no dejamos al usuario viendo una tab vacía sin razón aparente: caemos a la primera que sí tenga contenido.
  useEffect(() => {
    if (grupos[tabActiva].length === 0) {
      const conContenido = TABS.find((t) => grupos[t.key].length > 0)
      if (conContenido) setTabActiva(conContenido.key)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oportunidades])

  const itemsTab = grupos[tabActiva]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>

        {/* HEADER COMPACTO */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          gap: '20px', flexWrap: 'wrap', marginBottom: '24px',
        }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>
              Mis oportunidades
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Da seguimiento a lo que has publicado y a quién se ha postulado.
            </p>
          </div>
          <button
            onClick={() => navigate('/oportunidades/nueva')}
            style={{
              background: COLOR_MARCA, color: 'white', padding: '11px 20px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={16} /> Publicar oportunidad
          </button>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            Cargando tus oportunidades...
          </div>
        ) : oportunidades.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px', background: 'white',
            borderRadius: '16px', border: `1px solid ${COLOR_BORDE}`,
          }}>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>
              Aún no has publicado ninguna oportunidad.
            </p>
            <button
              onClick={() => navigate('/oportunidades/nueva')}
              style={{
                background: COLOR_MARCA, color: 'white', padding: '10px 24px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              }}
            >
              Publicar la primera
            </button>
          </div>
        ) : (
          <>
            {/* TABS CON CONTADOR */}
            <div style={{
              display: 'flex', gap: '4px', borderBottom: `1px solid ${COLOR_BORDE}`,
              marginBottom: '24px',
            }}>
              {TABS.map(({ key, label }) => {
                const count = grupos[key].length
                if (count === 0) return null
                const activa = tabActiva === key

                return (
                  <button
                    key={key}
                    onClick={() => setTabActiva(key)}
                    style={{
                      padding: '10px 18px', border: 'none', background: 'transparent',
                      cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                      color: activa ? COLOR_MARCA : '#9ca3af',
                      borderBottom: activa ? `2px solid ${COLOR_MARCA}` : '2px solid transparent',
                      marginBottom: '-1px', transition: 'color 0.15s',
                    }}
                  >
                    {label} <span style={{ opacity: 0.7 }}>({count})</span>
                  </button>
                )
              })}
            </div>

            {/* GRID DE LA TAB SELECCIONADA */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {itemsTab.map((o) => {
                const urgencia = URGENCIA_STYLE[o.urgencia]
                const estado = ESTADO_STYLE[getEstadoVisual(o)]
                const puedeCerrar = o.status !== 'cerrada' && !o.esta_vencida

                return (
                  <div
                    key={o.id}
                    style={{
                      background: 'white', borderRadius: '16px', padding: '24px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${COLOR_BORDE}`,
                      display: 'flex', flexDirection: 'column', gap: '12px',
                      transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
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
                    {/* Urgencia + estado */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: '600',
                        background: urgencia.bg, color: urgencia.color,
                      }}>
                        {urgencia.label}
                      </span>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap',
                        background: estado.bg, color: estado.color,
                      }}>
                        {estado.label}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                      {o.titulo}
                    </h3>

                    {/* Vence + postulaciones */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: '12px', borderTop: `1px solid ${COLOR_BORDE}`,
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
                        <Clock size={12} /> Vence {new Date(o.vence_el).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
                        <Users size={12} /> {o.total_postulaciones}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(
                          o.postulaciones_pendientes > 0
                            ? `/oportunidades/${o.id}/postulaciones`
                            : `/oportunidades/${o.id}`
                        )}
                        style={{
                          flex: 1, background: '#fdf2f4', color: COLOR_MARCA, padding: '9px 14px',
                          borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontWeight: '700', fontSize: '13px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                      >
                        Ver postulaciones
                        {o.postulaciones_pendientes > 0 && (
                          <span style={{
                            background: '#ef4444', color: 'white',
                            fontSize: '11px', fontWeight: '700', borderRadius: '20px', padding: '1px 7px',
                          }}>
                            {o.postulaciones_pendientes}
                          </span>
                        )}
                        <ArrowRight size={13} />
                      </button>
                      {puedeCerrar && (
                        <button
                          onClick={() => pedirConfirmacionCerrar(o)}
                          style={{
                            background: 'white', color: '#ef4444', padding: '9px 14px',
                            borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer',
                            fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap',
                          }}
                        >
                          Cerrar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <ModalConfirmacion
        abierto={oportunidadAConfirmar !== null}
        titulo="¿Cerrar esta oportunidad?"
        mensaje={
          oportunidadAConfirmar
            ? `"${oportunidadAConfirmar.titulo}" ya no aceptará nuevas postulaciones. Podrás seguir respondiendo a las que ya recibiste.`
            : ''
        }
        textoConfirmar="Sí, cerrar"
        variante="peligro"
        cargando={cerrandoId !== null}
        onConfirmar={confirmarCierre}
        onCancelar={() => setOportunidadAConfirmar(null)}
      />
    </div>
  )
}