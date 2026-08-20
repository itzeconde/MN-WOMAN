import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPostulacionesRecibidas, getOportunidad, responderPostulacion } from '../../api/oportunidades'
import { Check, X } from 'lucide-react'

interface Postulacion {
  id: number
  postulante_nombre: string
  postulante_correo: string
  mensaje: string
  status: 'pendiente' | 'aceptada' | 'rechazada'
  postulada_el: string
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pendiente: { bg: '#fffbeb', color: '#d97706' },
  aceptada: { bg: '#f0fdf4', color: '#16a34a' },
  rechazada: { bg: '#fef2f2', color: '#dc2626' },
}

export default function PostulacionesRecibidas() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [tituloOportunidad, setTituloOportunidad] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [respondiendoId, setRespondiendoId] = useState<number | null>(null)
  const [erroresPorPostulacion, setErroresPorPostulacion] = useState<Record<number, string>>({})

  useEffect(() => {
    const cargar = async () => {
      try {
        const [postData, opData] = await Promise.all([
          getPostulacionesRecibidas(Number(id)),
          getOportunidad(Number(id)),
        ])
        setPostulaciones(postData)
        setTituloOportunidad(opData.titulo)
      } catch {
        setError('No se pudieron cargar las postulaciones. Verifica que esta oportunidad sea tuya.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  const manejarResponder = async (postulacionId: number, nuevoStatus: 'aceptada' | 'rechazada') => {
    setRespondiendoId(postulacionId)
    setErroresPorPostulacion((prev) => {
      const copia = { ...prev }
      delete copia[postulacionId]
      return copia
    })
    try {
      await responderPostulacion(postulacionId, nuevoStatus)
      setPostulaciones((prev) =>
        prev.map((p) => (p.id === postulacionId ? { ...p, status: nuevoStatus } : p))
      )
    } catch (err: any) {
      // Mismo patrón que NuevoServicio/NuevaOportunidad: campo específico →
      // detail → string plano → genérico. Aquí "status" es el campo que
      // valida el backend (ej. si ya fue respondida antes).
      const detalle =
        err?.response?.data?.status?.[0] ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'No se pudo registrar tu respuesta. Intenta de nuevo.'
      setErroresPorPostulacion((prev) => ({ ...prev, [postulacionId]: detalle }))
    } finally {
      setRespondiendoId(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => navigate(`/oportunidades/${id}`)} style={{
          fontSize: '13px', color: '#B66878', fontWeight: '600',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '24px',
        }}>
          ← Volver a la oportunidad
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
          Postulaciones recibidas
        </h1>
        {tituloOportunidad && (
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
            Para: <strong style={{ color: '#111827' }}>{tituloOportunidad}</strong>
          </p>
        )}

        {cargando ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: '#dc2626', textAlign: 'center', padding: '40px' }}>{error}</p>
        ) : postulaciones.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Aún no has recibido postulaciones para esta oportunidad.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {postulaciones.map((p) => {
              const st = STATUS_STYLE[p.status]
              const iniciales = p.postulante_nombre
                .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              const errorPostulacion = erroresPorPostulacion[p.id]

              return (
                <div key={p.id} style={{
                  background: 'white', borderRadius: '14px', padding: '20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#EFC3CA', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '13px', fontWeight: '700',
                        color: '#B66878', flexShrink: 0,
                      }}>
                        {iniciales}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>
                          {p.postulante_nombre}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                          {p.postulante_correo}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '4px 10px',
                      borderRadius: '20px', background: st.bg, color: st.color,
                      textTransform: 'capitalize',
                    }}>
                      {p.status}
                    </span>
                  </div>

                  {p.mensaje && (
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 10px' }}>
                      {p.mensaje}
                    </p>
                  )}

                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
                    Postulada el {new Date(p.postulada_el).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>

                  {p.status === 'pendiente' && (
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                      <button
                        onClick={() => manejarResponder(p.id, 'aceptada')}
                        disabled={respondiendoId === p.id}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: '#f0fdf4', color: '#16a34a', padding: '9px 14px',
                          borderRadius: '8px', border: '1px solid #bbf7d0', cursor: 'pointer',
                          fontWeight: '700', fontSize: '13px',
                          opacity: respondiendoId === p.id ? 0.6 : 1,
                        }}
                      >
                        <Check size={14} /> Aceptar
                      </button>
                      <button
                        onClick={() => manejarResponder(p.id, 'rechazada')}
                        disabled={respondiendoId === p.id}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: '#fef2f2', color: '#dc2626', padding: '9px 14px',
                          borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer',
                          fontWeight: '700', fontSize: '13px',
                          opacity: respondiendoId === p.id ? 0.6 : 1,
                        }}
                      >
                        <X size={14} /> Rechazar
                      </button>
                    </div>
                  )}

                  {errorPostulacion && (
                    <p style={{
                      color: '#dc2626', fontSize: '12px', marginTop: '10px', marginBottom: 0,
                      background: '#fef2f2', padding: '8px 10px', borderRadius: '8px',
                    }}>
                      {errorPostulacion}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}