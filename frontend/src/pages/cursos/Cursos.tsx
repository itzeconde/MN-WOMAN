import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, BookOpen } from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8000/api'

interface Curso {
  id: number
  titulo: string
  descripcion: string
  imagen: string | null
  categoria: string
  categoria_display: string
  nivel: string
  nivel_display: string
  duracion_horas: number
  link_externo: string | null
  instructor: string | null
  fecha_creacion: string
}

const Cursos = () => {
  const navigate = useNavigate()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/cursos/`)
      .then(r => r.json())
      .then(d => setCursos(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* HEADER */}
      <section style={{ padding: '80px 64px 48px', background: 'linear-gradient(150deg, #fdf2f4 0%, #fce8f0 60%, #fdf6f8 100%)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
            Centro de Formación MN WOMAN
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>
            Cursos y Programas
          </h1>
          <p style={{ fontSize: '16px', color: '#7a6870', margin: 0, lineHeight: '1.7' }}>
            Programas especializados diseñados por y para mujeres líderes.
          </p>
        </div>
      </section>

      {/* LISTADO */}
      <section style={{ padding: '64px', maxWidth: '1120px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ color: '#b0a0a6', textAlign: 'center' }}>Cargando cursos...</p>
        ) : cursos.length === 0 ? (
          <p style={{ color: '#b0a0a6', textAlign: 'center' }}>No hay cursos disponibles por el momento.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {cursos.map(curso => (
              <div key={curso.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0e6e9', cursor: 'pointer' }}
                onClick={() => navigate(`/cursos/${curso.id}`)}>
                <div style={{ height: '150px', background: '#FDF0F2', overflow: 'hidden' }}>
                  {curso.imagen
                    ? <img src={curso.imagen} alt={curso.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🎓</div>
                  }
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                    {curso.categoria_display}
                  </span>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#0f0a0b', margin: '12px 0 4px', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                    {curso.titulo}
                  </p>
                  {curso.instructor && (
                    <p style={{ fontSize: '12px', color: '#b0a0a6', margin: '0 0 12px' }}>
                      Por {curso.instructor}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f0e6e9' }}>
                    <span style={{ fontSize: '12px', color: '#b0a0a6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="#b0a0a6" /> {curso.duracion_horas}h
                    </span>
                    <span style={{ fontSize: '11px', color: '#7a6870', background: '#faf8f9', padding: '3px 10px', borderRadius: '100px', border: '1px solid #f0e6e9' }}>
                      {curso.nivel_display}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Cursos