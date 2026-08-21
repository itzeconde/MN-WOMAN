import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, BookOpen, ExternalLink, BarChart3, User, Folder } from 'lucide-react'
import { getCurso, type Curso } from '../../api/cursos'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'

const DetalleCurso = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [curso, setCurso] = useState<Curso | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getCurso(Number(id))
      .then(setCurso)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: '#9ca3af' }}>Cargando curso...</p>
    </div>
  )

  if (notFound || !curso) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", gap: '16px' }}>
      <p style={{ color: '#9ca3af', fontSize: '16px' }}>Curso no encontrado.</p>
      <button onClick={() => navigate('/cursos')} style={{ fontSize: '14px', color: COLOR_MARCA, background: 'none', border: `1px solid ${COLOR_BORDE}`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600' }}>
        ← Volver a cursos
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* HERO — con formas decorativas sutiles para dar profundidad, sin saturar */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        {/* Formas decorativas de fondo */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-60px', width: '320px', height: '320px',
          borderRadius: '50%', background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}66, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '10%', width: '220px', height: '220px',
          borderRadius: '50%', background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}40, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '52px 20px 44px' }}>
          <span style={{
            display: 'inline-block', background: '#fff', color: COLOR_MARCA,
            padding: '5px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '700',
            letterSpacing: '0.02em', boxShadow: `inset 0 0 0 1px ${COLOR_BORDE}`, marginBottom: '20px',
          }}>
            {curso.categoria_display}
          </span>

          <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#111827', margin: '0 0 14px', lineHeight: '1.18', letterSpacing: '-0.02em', maxWidth: '760px' }}>
            {curso.titulo}
          </h1>

          {curso.instructor && (
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', borderRadius: '50%', background: COLOR_MARCA_CLARO,
              }}>
                <User size={12} color={COLOR_MARCA} />
              </span>
              Por <strong style={{ color: '#111827', fontWeight: '700' }}>{curso.instructor}</strong>
            </p>
          )}
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>

          {/* IMAGEN + DESCRIPCIÓN */}
          <div>
            {curso.imagen ? (
              <div style={{
                position: 'relative', borderRadius: '18px', overflow: 'hidden', marginBottom: '24px',
                boxShadow: '0 14px 30px -8px rgba(0,0,0,0.18)', height: '320px',
              }}>
                <img
                  src={curso.imagen}
                  alt={curso.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Insignia flotante con la duración, para reforzar la imagen como pieza informativa */}
                <div style={{
                  position: 'absolute', bottom: '16px', left: '16px',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(17,24,39,0.65)', backdropFilter: 'blur(4px)',
                  color: '#fff', padding: '7px 14px', borderRadius: '100px',
                  fontSize: '12px', fontWeight: '600',
                }}>
                  <Clock size={13} /> {curso.duracion_horas} horas · {curso.nivel_display}
                </div>
              </div>
            ) : (
              <div style={{
                position: 'relative', height: '240px', borderRadius: '18px', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                border: `1px solid ${COLOR_BORDE}`, background: '#fff',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}66, transparent 70%)`,
                }} />
                <BookOpen size={64} color={COLOR_MARCA} style={{ position: 'relative', opacity: 0.4 }} />
              </div>
            )}

            <div style={{
              background: '#fff', borderRadius: '18px', padding: '32px',
              border: `1px solid ${COLOR_BORDE}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ width: '4px', height: '20px', borderRadius: '4px', background: COLOR_MARCA }} />
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
                  Acerca de este curso
                </h2>
              </div>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.85', margin: 0, whiteSpace: 'pre-line' }}>
                {curso.descripcion || 'Sin descripción disponible.'}
              </p>
            </div>
          </div>

          {/* SIDEBAR — única fuente de verdad para nivel, duración, categoría e instructor */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{
              border: `1px solid ${COLOR_BORDE}`, borderRadius: '18px', padding: '26px',
              background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111827', margin: '0 0 18px' }}>
                Información del curso
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid #f3f4f6` }}>
                  <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #fdf2f4, #fce7ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BarChart3 size={16} color={COLOR_MARCA} />
                  </span>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Nivel</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>{curso.nivel_display}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid #f3f4f6` }}>
                  <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #fdf2f4, #fce7ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} color={COLOR_MARCA} />
                  </span>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Duración</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>{curso.duracion_horas} horas</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: curso.instructor ? `1px solid #f3f4f6` : 'none' }}>
                  <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #fdf2f4, #fce7ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Folder size={16} color={COLOR_MARCA} />
                  </span>
                  <div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Categoría</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>{curso.categoria_display}</p>
                  </div>
                </div>

                {curso.instructor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                    <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #fdf2f4, #fce7ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={16} color={COLOR_MARCA} />
                    </span>
                    <div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Instructor</p>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>{curso.instructor}</p>
                    </div>
                  </div>
                )}
              </div>

              {curso.link_externo ? (
                <>
                  <a
                    href={curso.link_externo}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%', padding: '15px', backgroundImage: `linear-gradient(135deg, ${COLOR_MARCA}, #c81f4a)`,
                      color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                      cursor: 'pointer', letterSpacing: '0.01em', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '8px',
                      textDecoration: 'none', boxSizing: 'border-box',
                      boxShadow: `0 8px 20px -6px ${COLOR_MARCA}99`,
                    }}
                  >
                    Ver curso <ExternalLink size={14} />
                  </a>
                  <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '12px 0 0' }}>
                    Se abre en el sitio del programa
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                  Este curso no tiene un enlace disponible por el momento.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DetalleCurso