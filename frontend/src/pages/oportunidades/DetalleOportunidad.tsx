import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOportunidad, postularse, cerrarOportunidad } from '../../api/oportunidades'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  ArrowRight, Briefcase, FileText, DollarSign,
  Users, Calendar, MessageSquare,
} from 'lucide-react'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'

interface Oportunidad {
  id: number
  publicada_por_nombre: string
  titulo: string
  descripcion: string
  categoria: string
  urgencia: 'alta' | 'media' | 'baja'
  status: string
  presupuesto_min: number | null
  presupuesto_max: number | null
  etiquetas: string
  vence_el: string
  total_postulaciones: number
  es_propia: boolean
  ya_postulada: boolean
  esta_vencida: boolean
}

const CATEGORIA_LABELS: Record<string, string> = {
  consultoria: 'Consultoría B2B',
  diseno: 'Diseño y Branding',
  tecnologia: 'Tecnología',
  marketing: 'Marketing Digital',
  suministros: 'Suministros',
  educacion: 'Educación',
}

const URGENCIA_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  alta: { bg: '#fef2f2', color: '#dc2626', label: 'Urgente' },
  media: { bg: '#fffbeb', color: '#d97706', label: 'Media' },
  baja: { bg: '#f0fdf4', color: '#16a34a', label: 'Baja' },
}

export default function DetalleOportunidad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [oportunidad, setOportunidad] = useState<Oportunidad | null>(null)
  const [cargando, setCargando] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [postulada, setPostulada] = useState(false)
  const [error, setError] = useState('')
  const [cerrando, setCerrando] = useState(false)
  const [modalCerrarAbierto, setModalCerrarAbierto] = useState(false)

  useEffect(() => {
    getOportunidad(Number(id))
      .then((data) => {
        setOportunidad(data)
        setPostulada(data.ya_postulada)
      })
      .catch(() => setNotFound(true))
      .finally(() => setCargando(false))
  }, [id])

  const handlePostular = async () => {
    setError('')
    setEnviando(true)
    try {
      await postularse(Number(id), mensaje)
      setPostulada(true)
    } catch (err: any) {
      const detalle = err?.response?.data?.detail || err?.response?.data?.[0]
      setError(detalle || 'No se pudo enviar tu postulación. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const handleCerrar = async () => {
    setCerrando(true)
    try {
      const actualizada = await cerrarOportunidad(Number(id))
      setOportunidad(actualizada)
      setModalCerrarAbierto(false)
    } catch {
      setError('No se pudo cerrar la oportunidad. Intenta de nuevo.')
    } finally {
      setCerrando(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: `1px solid ${COLOR_BORDE}`,
    marginBottom: '20px',
  }

  const tituloSeccion: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${COLOR_BORDE}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  if (cargando) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Cargando oportunidad...</p>
    </div>
  )

  if (notFound || !oportunidad) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Oportunidad no encontrada.</p>
      <button
        onClick={() => navigate('/oportunidades')}
        style={{
          fontSize: '14px', color: COLOR_MARCA, background: 'white',
          border: `1px solid ${COLOR_BORDE}`, borderRadius: '8px',
          padding: '8px 16px', cursor: 'pointer', fontWeight: '600',
        }}
      >
        Ver todas las oportunidades
      </button>
    </div>
  )

  const urgencia = URGENCIA_STYLE[oportunidad.urgencia]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* HERO — mismo patrón que NuevaOportunidad.tsx */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px 32px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '600', background: '#fdf2f4', color: COLOR_MARCA,
            }}>
              {CATEGORIA_LABELS[oportunidad.categoria] || oportunidad.categoria}
            </span>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '700', background: urgencia.bg, color: urgencia.color,
            }}>
              {urgencia.label}
            </span>
            {oportunidad.status === 'cerrada' && (
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '700', background: '#f3f4f6', color: '#6b7280',
              }}>
                Cerrada
              </span>
            )}
            {oportunidad.status !== 'cerrada' && oportunidad.esta_vencida && (
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '700', background: '#fef2f2', color: '#dc2626',
              }}>
                Vencida
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 10px', lineHeight: '1.3' }}>
            {oportunidad.titulo}
          </h1>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              Publicado por <strong style={{ color: '#111827' }}>{oportunidad.publicada_por_nombre}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} /> Vence el {new Date(oportunidad.vence_el).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 20px 40px' }}>

        <div style={cardStyle}>
          <h2 style={tituloSeccion}><FileText size={15} color={COLOR_MARCA} /> Descripción</h2>
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
            {oportunidad.descripcion}
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={tituloSeccion}><DollarSign size={15} color={COLOR_MARCA} /> Presupuesto</h2>
          <p style={{ fontWeight: '700', fontSize: '18px', color: COLOR_MARCA, margin: 0 }}>
            {oportunidad.presupuesto_min && oportunidad.presupuesto_max
              ? `$${Number(oportunidad.presupuesto_min).toLocaleString('es-MX')} - $${Number(oportunidad.presupuesto_max).toLocaleString('es-MX')} MXN`
              : 'A convenir'}
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={tituloSeccion}><Briefcase size={15} color={COLOR_MARCA} /> {oportunidad.es_propia ? 'Gestionar oportunidad' : 'Postularme'}</h2>

          {oportunidad.es_propia ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate(`/oportunidades/${id}/postulaciones`)}
                style={{
                  background: '#fdf2f4', color: COLOR_MARCA, borderRadius: '10px', padding: '14px 16px',
                  border: 'none', cursor: 'pointer', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={13} /> <strong style={{ color: COLOR_MARCA }}>{oportunidad.total_postulaciones}</strong> postulación{oportunidad.total_postulaciones !== 1 ? 'es' : ''} recibida{oportunidad.total_postulaciones !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ver postulaciones <ArrowRight size={13} />
                </span>
              </button>

              {oportunidad.status === 'activa' && (
                <button
                  onClick={() => setModalCerrarAbierto(true)}
                  disabled={cerrando}
                  style={{
                    width: '100%', padding: '12px', backgroundColor: 'white', color: '#dc2626',
                    border: '1px solid #fecaca', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                    cursor: cerrando ? 'default' : 'pointer', opacity: cerrando ? 0.6 : 1,
                  }}>
                  Cerrar oportunidad
                </button>
              )}

              {error && <p style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center', margin: 0 }}>{error}</p>}
            </div>
          ) : oportunidad.status === 'cerrada' ? (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', margin: 0 }}>
              Esta oportunidad ya fue cerrada por quien la publicó.
            </p>
          ) : oportunidad.esta_vencida ? (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', margin: 0 }}>
              Esta oportunidad ya venció y ya no acepta postulaciones.
            </p>
          ) : postulada ? (
            <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px', margin: 0 }}>
              ✓ Ya te postulaste a esta oportunidad. La publicante podrá revisar tu mensaje y contactarte.
            </p>
          ) : (
            <>
              <label style={{
                fontSize: '13px', fontWeight: '700', color: '#374151', display: 'flex',
                alignItems: 'center', gap: '6px', marginBottom: '8px',
              }}>
                <MessageSquare size={13} color={COLOR_MARCA} /> Cuéntale por qué eres una buena opción
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
                placeholder="Describe tu experiencia relevante y por qué te interesa este proyecto..."
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  border: `1px solid ${COLOR_BORDE}`, fontSize: '14px', resize: 'vertical',
                  boxSizing: 'border-box', outline: 'none', marginBottom: '12px', fontFamily: 'inherit',
                }}
              />
              {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
              <button
                onClick={handlePostular}
                disabled={enviando}
                style={{
                  width: '100%', padding: '14px', backgroundColor: COLOR_MARCA, color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                  cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.7 : 1,
                  boxShadow: `0 4px 14px ${COLOR_MARCA_CLARO}80`,
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar postulación'}
              </button>
            </>
          )}
        </div>
      </div>

      <ModalConfirmacion
        abierto={modalCerrarAbierto}
        titulo="¿Cerrar esta oportunidad?"
        mensaje="Ya no aceptará nuevas postulaciones. Podrás seguir respondiendo a las que ya recibiste."
        textoConfirmar="Sí, cerrar"
        variante="peligro"
        cargando={cerrando}
        onConfirmar={handleCerrar}
        onCancelar={() => setModalCerrarAbierto(false)}
      />
    </div>
  )
}