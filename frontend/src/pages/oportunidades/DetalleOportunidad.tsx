import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOportunidad, postularse, cerrarOportunidad } from '../../api/oportunidades'

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
    if (!confirm('¿Seguro que quieres cerrar esta oportunidad? Ya no aparecerá disponible para postulaciones.')) return
    setCerrando(true)
    try {
      const actualizada = await cerrarOportunidad(Number(id))
      setOportunidad(actualizada)
    } catch {
      setError('No se pudo cerrar la oportunidad. Intenta de nuevo.')
    } finally {
      setCerrando(false)
    }
  }

  if (cargando) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Cargando oportunidad...</p>
    </div>
  )

  if (notFound || !oportunidad) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Oportunidad no encontrada.</p>
      <button onClick={() => navigate('/oportunidades')} style={{ fontSize: '14px', color: '#B66878', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600' }}>
        ← Volver a oportunidades
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => navigate('/oportunidades')} style={{
          fontSize: '13px', color: '#B66878', fontWeight: '600',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '24px',
        }}>
          ← Volver a oportunidades
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '600', background: '#fdf2f4', color: '#B66878',
            }}>
              {CATEGORIA_LABELS[oportunidad.categoria] || oportunidad.categoria}
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

          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '14px 0 8px' }}>
            {oportunidad.titulo}
          </h1>

          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            Publicado por <strong style={{ color: '#111827' }}>{oportunidad.publicada_por_nombre}</strong> · Vence el{' '}
            {new Date(oportunidad.vence_el).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>
            Descripción
          </h2>
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '24px', whiteSpace: 'pre-line' }}>
            {oportunidad.descripcion}
          </p>

          <div style={{ fontWeight: '700', fontSize: '16px', color: '#B66878', marginBottom: '24px' }}>
            {oportunidad.presupuesto_min && oportunidad.presupuesto_max
              ? `$${Number(oportunidad.presupuesto_min).toLocaleString('es-MX')} - $${Number(oportunidad.presupuesto_max).toLocaleString('es-MX')} MXN`
              : 'Presupuesto a convenir'}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', marginBottom: '24px' }} />

          {oportunidad.es_propia ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onClick={() => navigate(`/oportunidades/${id}/postulaciones`)}
                style={{
                  background: '#f9fafb', borderRadius: '10px', padding: '16px',
                  textAlign: 'center', cursor: 'pointer', border: '1px solid #f3f4f6',
                }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Esta es tu publicación · <strong style={{ color: '#B66878' }}>{oportunidad.total_postulaciones}</strong> postulación{oportunidad.total_postulaciones !== 1 ? 'es' : ''} recibida{oportunidad.total_postulaciones !== 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: '12px', color: '#B66878', fontWeight: '600', margin: '6px 0 0' }}>
                  Ver postulaciones →
                </p>
              </div>

              {oportunidad.status === 'activa' && (
                <button
                  onClick={handleCerrar}
                  disabled={cerrando}
                  style={{
                    width: '100%', padding: '12px', backgroundColor: 'white', color: '#dc2626',
                    border: '1px solid #fecaca', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                    cursor: cerrando ? 'default' : 'pointer', opacity: cerrando ? 0.6 : 1,
                  }}>
                  {cerrando ? 'Cerrando...' : 'Cerrar oportunidad'}
                </button>
              )}

              {error && <p style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
            </div>
          ) : oportunidad.status === 'cerrada' ? (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
              Esta oportunidad ya fue cerrada por quien la publicó.
            </p>
          ) : oportunidad.esta_vencida ? (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
              Esta oportunidad ya venció y ya no acepta postulaciones.
            </p>
          ) : postulada ? (
            <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>
              ✓ Ya te postulaste a esta oportunidad. La publicante podrá revisar tu mensaje y contactarte.
            </p>
          ) : (
            <>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '8px' }}>
                Postularme a esta oportunidad
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
                placeholder="Cuéntale por qué eres una buena opción para este proyecto..."
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid #e5e7eb', fontSize: '14px', resize: 'vertical',
                  boxSizing: 'border-box', outline: 'none', marginBottom: '12px',
                }}
              />
              {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
              <button
                onClick={handlePostular}
                disabled={enviando}
                style={{
                  width: '100%', padding: '14px', backgroundColor: '#B66878', color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                  cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.7 : 1,
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar postulación'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}