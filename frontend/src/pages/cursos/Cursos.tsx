import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { getCursos, type Curso } from '../../api/cursos'

const CATEGORIAS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'sensibilizacion', label: 'Formación en Sensibilización' },
  { value: 'academico', label: 'Programa Académico' },
  { value: 'liderazgo', label: 'Liderazgo y Negocios' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'otro', label: 'Otro' },
]

const NIVELES = [
  { value: '', label: 'Todos los niveles' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
]

const selectStyle = {
  padding: '8px 14px', borderRadius: '8px', border: '1px solid #f0e6e9',
  fontSize: '13px', color: '#0f0a0b', background: '#fff', cursor: 'pointer'
}

const Cursos = () => {
  const navigate = useNavigate()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [categoria, setCategoria] = useState('')
  const [nivel, setNivel] = useState('')

  useEffect(() => {
    const filtros: Record<string, string> = {}
    if (categoria) filtros.categoria = categoria
    if (nivel) filtros.nivel = nivel

    setLoading(true)
    setError(false)
    getCursos(Object.keys(filtros).length ? filtros : undefined)
      .then(setCursos)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [categoria, nivel])

  return (
    <main style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", backgroundColor: '#fff', minHeight: '100vh' }}>
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

      <section style={{ padding: '48px 64px 64px', maxWidth: '1120px', margin: '0 auto' }}>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} style={selectStyle}>
            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={nivel} onChange={e => setNivel(e.target.value)} style={selectStyle}>
            {NIVELES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={{ color: '#b0a0a6', textAlign: 'center' }}>Cargando cursos...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#B66878', fontWeight: '600', marginBottom: '4px' }}>No pudimos cargar los cursos.</p>
            <p style={{ color: '#b0a0a6', fontSize: '13px' }}>Intenta recargar la página en unos momentos.</p>
          </div>
        ) : cursos.length === 0 ? (
          <p style={{ color: '#b0a0a6', textAlign: 'center' }}>
            No hay cursos que coincidan con estos filtros.
          </p>
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