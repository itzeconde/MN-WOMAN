import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, GraduationCap, SlidersHorizontal } from 'lucide-react'
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

// Color por nivel, para que el ojo distinga la dificultad de un vistazo
const NIVEL_COLOR: Record<string, { bg: string; text: string }> = {
  basico: { bg: '#eef7ee', text: '#3f8a4a' },
  intermedio: { bg: '#fdf3e6', text: '#c07a1f' },
  avanzado: { bg: '#fdecee', text: '#c23f52' },
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
      <style>{`
        .curso-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .curso-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(182, 104, 120, 0.14);
          border-color: #edd8de;
        }
        .curso-card:hover .curso-img {
          transform: scale(1.05);
        }
        .curso-img {
          transition: transform 0.4s ease;
        }
        .curso-filtro-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23B66878' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 34px;
        }
        .curso-filtro-select:focus {
          outline: none;
          border-color: #B66878;
          box-shadow: 0 0 0 3px rgba(182, 104, 120, 0.12);
        }
        @media (max-width: 700px) {
          .curso-hero-pad { padding: 56px 24px 36px !important; }
          .curso-body-pad { padding: 32px 24px 56px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="curso-hero-pad"
        style={{
          padding: '80px 64px 48px',
          background: 'linear-gradient(150deg, #fdf2f4 0%, #fce8f0 60%, #fdf6f8 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', right: '-90px', top: '-60px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'rgba(182, 104, 120, 0.06)', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
            Centro de Formación MN WOMAN
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>
            Cursos y Programas
          </h1>
          <p style={{ fontSize: '16px', color: '#7a6870', margin: 0, lineHeight: '1.7', maxWidth: '520px' }}>
            Programas especializados diseñados por y para mujeres líderes.
          </p>
          {!loading && !error && (
            <p style={{ fontSize: '13px', color: '#B66878', fontWeight: '700', margin: '20px 0 0' }}>
              {cursos.length} {cursos.length === 1 ? 'programa disponible' : 'programas disponibles'}
            </p>
          )}
        </div>
      </section>

      <section className="curso-body-pad" style={{ padding: '48px 64px 64px', maxWidth: '1120px', margin: '0 auto' }}>

        {/* Filtros */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
          background: '#fdf8f9', border: '1px solid #f0e6e9', borderRadius: '14px',
          padding: '14px 18px', marginBottom: '32px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#B66878', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <SlidersHorizontal size={13} color="#B66878" /> Filtrar
          </span>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="curso-filtro-select"
            style={{ padding: '9px 34px 9px 14px', borderRadius: '9px', border: '1px solid #e5d3d8', fontSize: '13px', color: '#0f0a0b', background: '#fff', cursor: 'pointer' }}
          >
            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select
            value={nivel}
            onChange={e => setNivel(e.target.value)}
            className="curso-filtro-select"
            style={{ padding: '9px 34px 9px 14px', borderRadius: '9px', border: '1px solid #e5d3d8', fontSize: '13px', color: '#0f0a0b', background: '#fff', cursor: 'pointer' }}
          >
            {NIVELES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
          {(categoria || nivel) && (
            <button
              onClick={() => { setCategoria(''); setNivel('') }}
              style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '600', color: '#B66878', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ borderRadius: '16px', border: '1px solid #f0e6e9', overflow: 'hidden' }}>
                <div style={{ height: '150px', background: '#fdf2f4' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ width: '60%', height: '10px', background: '#fdf2f4', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ width: '85%', height: '14px', background: '#faf0f2', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fdf8f9', borderRadius: '16px', border: '1px solid #f0e6e9' }}>
            <GraduationCap size={32} color="#d99aa6" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#B66878', fontWeight: '700', margin: '0 0 4px' }}>No pudimos cargar los cursos</p>
            <p style={{ color: '#9a7880', fontSize: '13px', margin: 0 }}>Intenta recargar la página en unos momentos.</p>
          </div>
        ) : cursos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fdf8f9', borderRadius: '16px', border: '1px solid #f0e6e9' }}>
            <GraduationCap size={32} color="#d99aa6" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#0f0a0b', fontWeight: '700', margin: '0 0 4px' }}>Sin resultados</p>
            <p style={{ color: '#9a7880', fontSize: '13px', margin: 0 }}>No hay cursos que coincidan con estos filtros.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {cursos.map(curso => {
              const nivelColor = NIVEL_COLOR[curso.nivel] ?? { bg: '#faf0f2', text: '#7a6870' }
              return (
                <div
                  key={curso.id}
                  className="curso-card"
                  style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0e6e9', cursor: 'pointer', position: 'relative' }}
                  onClick={() => navigate(`/cursos/${curso.id}`)}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #B66878, #d4889a)', zIndex: 2 }} />

                  <div style={{ height: '150px', background: '#FDF0F2', overflow: 'hidden', position: 'relative' }}>
                    {curso.imagen
                      ? <img src={curso.imagen} alt={curso.titulo} className="curso-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🎓</div>
                    }
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'rgba(15,10,11,0.55)', color: '#fff',
                      padding: '4px 9px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                      backdropFilter: 'blur(2px)',
                    }}>
                      <Clock size={11} color="#fff" /> {curso.duracion_horas}h
                    </span>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                        {curso.categoria_display}
                      </span>
                      <span style={{ backgroundColor: nivelColor.bg, color: nivelColor.text, padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                        {curso.nivel_display}
                      </span>
                    </div>

                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#0f0a0b', margin: '14px 0 4px', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                      {curso.titulo}
                    </p>
                    {curso.instructor && (
                      <p style={{ fontSize: '12px', color: '#b0a0a6', margin: '0 0 12px' }}>
                        Por {curso.instructor}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f0e6e9', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#B66878', fontWeight: '700' }}>
                        Ver curso →
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Cursos