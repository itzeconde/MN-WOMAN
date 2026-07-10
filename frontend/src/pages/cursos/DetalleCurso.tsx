import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, Users, ArrowLeft, BookOpen } from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8000/api'

interface Curso {
  id: number
  title: string
  description: string
  category: string
  level: string
  duration_hours: number
  thumbnail: string | null
  nombre_instructora: string | null
  total_inscritas: number
}

const nivelLabel: Record<string, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

const DetalleCurso = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [curso, setCurso] = useState<Curso | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/cursos/${id}/`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => { if (d) setCurso(d) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: '#b0a0a6' }}>Cargando curso...</p>
    </div>
  )

  if (notFound || !curso) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", gap: '16px' }}>
      <p style={{ color: '#b0a0a6', fontSize: '16px' }}>Curso no encontrado.</p>
      <button onClick={() => navigate('/cursos')} style={{ fontSize: '14px', color: '#B66878', background: 'none', border: '1px solid #f0e6e9', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600' }}>
        ← Volver a cursos
      </button>
    </div>
  )

  return (
    <main style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", backgroundColor: '#fff', minHeight: '100vh' }}>

      {/* HEADER */}
      <section style={{ padding: '72px 64px 56px', background: 'linear-gradient(150deg, #fdf2f4 0%, #fce8f0 60%, #fdf6f8 100%)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <button onClick={() => navigate('/cursos')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: '#B66878', fontWeight: '600',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginBottom: '32px',
          }}>
            <ArrowLeft size={14} /> Volver a cursos
          </button>

          <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
            {curso.category}
          </span>

          <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#0f0a0b', margin: '16px 0 12px', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
            {curso.title}
          </h1>

          {curso.nombre_instructora && (
            <p style={{ fontSize: '15px', color: '#7a6870', margin: '0 0 28px' }}>
              Por <strong style={{ color: '#0f0a0b' }}>{curso.nombre_instructora}</strong>
            </p>
          )}

          {/* CHIPS DE INFO */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #f0e6e9', borderRadius: '100px', padding: '7px 16px' }}>
              <Clock size={13} color="#B66878" />
              <span style={{ fontSize: '13px', color: '#7a6870', fontWeight: '600' }}>{curso.duration_hours} horas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #f0e6e9', borderRadius: '100px', padding: '7px 16px' }}>
              <BookOpen size={13} color="#B66878" />
              <span style={{ fontSize: '13px', color: '#7a6870', fontWeight: '600' }}>{nivelLabel[curso.level] || curso.level}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #f0e6e9', borderRadius: '100px', padding: '7px 16px' }}>
              <Users size={13} color="#B66878" />
              <span style={{ fontSize: '13px', color: '#7a6870', fontWeight: '600' }}>{curso.total_inscritas} inscritas</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section style={{ padding: '56px 64px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '48px', alignItems: 'start' }}>

          {/* DESCRIPCIÓN */}
          <div>
            {curso.thumbnail && (
              <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '36px', border: '1px solid #f0e6e9' }}>
                <img src={curso.thumbnail} alt={curso.title} style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f0a0b', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
              Acerca de este curso
            </h2>
            <p style={{ fontSize: '15px', color: '#5a4a50', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-line' }}>
              {curso.description || 'Sin descripción disponible.'}
            </p>
          </div>

          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ border: '1px solid #f0e6e9', borderRadius: '20px', padding: '28px', background: '#fff' }}>
              <div style={{ position: 'relative', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0e6e9' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#B66878', borderRadius: '3px 3px 0 0', opacity: 0.7 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#b0a0a6' }}>Nivel</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f0a0b' }}>{nivelLabel[curso.level] || curso.level}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#b0a0a6' }}>Duración</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f0a0b' }}>{curso.duration_hours} horas</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#b0a0a6' }}>Categoría</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f0a0b' }}>{curso.category}</span>
                </div>
                {curso.nombre_instructora && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#b0a0a6' }}>Instructora</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f0a0b' }}>{curso.nombre_instructora}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#b0a0a6' }}>Inscritas</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f0a0b' }}>{curso.total_inscritas}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', padding: '14px', backgroundColor: '#B66878',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}>
                Inscribirme al curso
              </button>
              <p style={{ fontSize: '12px', color: '#b0a0a6', textAlign: 'center', margin: '12px 0 0' }}>
                Necesitas una cuenta para inscribirte
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

export default DetalleCurso