import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCursos, type Curso } from '../../api/cursos'
import {
  paginacionBotonStyle, badgePillStyle,
  COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE,
  CARD_SHADOW_REST, CARD_SHADOW_HOVER,
} from '../../styles/tokens'

const CATEGORIAS = [
  { value: '', label: 'Todas' },
  { value: 'sensibilizacion', label: 'Sensibilización' },
  { value: 'academico', label: 'Programa Académico' },
  { value: 'liderazgo', label: 'Liderazgo y Negocios' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'otro', label: 'Otro' },
]

const NIVELES = [
  { value: '', label: 'Todos' },
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

const CURSOS_POR_PAGINA = 9

const Cursos = () => {
  const navigate = useNavigate()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [categoria, setCategoria] = useState('')
  const [nivel, setNivel] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    // Flag de cancelación: evita que una respuesta "vieja" (de un filtro anterior)
    // sobreescriba los datos de la petición más reciente si llega fuera de orden.
    let cancelado = false

    const filtros: Record<string, string> = {}
    if (categoria) filtros.categoria = categoria
    if (nivel) filtros.nivel = nivel

    setLoading(true)
    setError(false)
    getCursos(Object.keys(filtros).length ? filtros : undefined)
      .then(data => {
        if (cancelado) return
        setCursos(data)
        setPagina(1) // al cambiar filtros, siempre regresamos a la página 1
      })
      .catch(err => {
        if (cancelado) return
        console.error('Error al cargar cursos:', err)
        setError(true)
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [categoria, nivel])

  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  const cursosFiltrados = cursos.filter(c =>
    busqueda === '' ||
    c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.instructor ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(cursosFiltrados.length / CURSOS_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const cursosPagina = cursosFiltrados.slice(
    (paginaSegura - 1) * CURSOS_POR_PAGINA,
    paginaSegura * CURSOS_POR_PAGINA
  )

  // Números de página con "..." cuando hay muchas páginas (mismo patrón que Oportunidades.tsx)
  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1])
    return Array.from(nums).filter(n => n >= 1 && n <= totalPaginas).sort((a, b) => a - b)
  }, [totalPaginas, paginaSegura])

  const irAPagina = (p: number) => {
    setPagina(Math.min(Math.max(p, 1), totalPaginas))
    document.getElementById('cursos-grid-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .curso-card:hover .curso-img {
          transform: scale(1.05);
        }
        .curso-img {
          transition: transform 0.4s ease;
        }
        .curso-chip {
          transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
      `}</style>

      {/* HERO — mismo patrón de franja que Oportunidades.tsx */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 32px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: COLOR_MARCA }}>
            Centro de Formación MN WOMAN
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '10px 0 12px', lineHeight: '1.25' }}>
            Cursos y Programas
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0, maxWidth: '520px' }}>
            Programas especializados diseñados por y para mujeres líderes.
          </p>
          {!loading && !error && (
            <p style={{ fontSize: '13px', color: COLOR_MARCA, fontWeight: '700', margin: '16px 0 0' }}>
              {cursosFiltrados.length} {cursosFiltrados.length === 1 ? 'programa disponible' : 'programas disponibles'}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 40px' }}>

        {/* BUSCADOR */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            aria-label="Buscar cursos"
            placeholder="Buscar por título o instructor..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px',
              border: `1px solid ${COLOR_BORDE}`, fontSize: '14px',
              boxSizing: 'border-box' as const, outline: 'none', background: 'white',
            }}
          />
        </div>

        {/* CHIPS DE CATEGORÍA */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          {CATEGORIAS.map(c => (
            <button
              key={c.value}
              className="curso-chip"
              onClick={() => setCategoria(c.value)}
              aria-pressed={categoria === c.value}
              style={{
                padding: '9px 18px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                background: categoria === c.value ? COLOR_MARCA : 'white',
                color: categoria === c.value ? 'white' : '#374151',
                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                boxShadow: categoria === c.value ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ height: '1px', background: COLOR_BORDE, marginBottom: '16px' }} />

        {/* CHIPS DE NIVEL */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '32px', scrollbarWidth: 'none' }}>
          {NIVELES.map(n => (
            <button
              key={n.value}
              className="curso-chip"
              onClick={() => setNivel(n.value)}
              aria-pressed={nivel === n.value}
              style={{
                padding: '7px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                background: nivel === n.value ? '#374151' : 'white',
                color: nivel === n.value ? 'white' : '#6b7280',
                fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                boxShadow: nivel === n.value ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
              }}
            >
              {n.label}
            </button>
          ))}
        </div>

        <div id="cursos-grid-top" />

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ borderRadius: '16px', border: `1px solid ${COLOR_BORDE}`, overflow: 'hidden' }}>
                <div style={{ height: '170px', background: '#FDF0F2' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ width: '60%', height: '10px', background: '#FDF0F2', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ width: '85%', height: '14px', background: '#faf0f2', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <GraduationCap size={32} color={COLOR_MARCA_CLARO} style={{ marginBottom: '12px' }} />
            <p style={{ color: COLOR_MARCA, fontWeight: '700', margin: '0 0 4px' }}>No pudimos cargar los cursos</p>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Intenta recargar la página en unos momentos.</p>
          </div>
        ) : cursos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <GraduationCap size={32} color={COLOR_MARCA_CLARO} style={{ marginBottom: '12px' }} />
            <p style={{ color: '#111827', fontWeight: '700', margin: '0 0 4px' }}>Sin resultados</p>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>No hay cursos que coincidan con estos filtros.</p>
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <GraduationCap size={32} color={COLOR_MARCA_CLARO} style={{ marginBottom: '12px' }} />
            <p style={{ color: '#111827', fontWeight: '700', margin: '0 0 4px' }}>Sin resultados</p>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>No hay resultados para tu búsqueda o filtros actuales.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {cursosPagina.map(curso => {
                const nivelColor = NIVEL_COLOR[curso.nivel] ?? { bg: '#faf0f2', text: '#6b7280' }
                return (
                  <div
                    key={curso.id}
                    className="curso-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/cursos/${curso.id}`)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/cursos/${curso.id}`)
                      }
                    }}
                    style={{
                      background: 'white', borderRadius: '16px', overflow: 'hidden',
                      border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST,
                      cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER
                      e.currentTarget.style.borderColor = COLOR_MARCA_CLARO
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = CARD_SHADOW_REST
                      e.currentTarget.style.borderColor = COLOR_BORDE
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ height: '170px', background: '#FDF0F2', overflow: 'hidden', position: 'relative' }}>
                      {curso.imagen
                        ? (
                          <img
                            src={curso.imagen}
                            alt={curso.titulo}
                            className="curso-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => {
                              // Si la URL de la imagen falla (404, storage borrado, etc.),
                              // caemos al placeholder del emoji en vez de mostrar el ícono roto.
                              e.currentTarget.style.display = 'none'
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                        )
                        : null}
                      <div
                        style={{
                          display: curso.imagen ? 'none' : 'flex',
                          width: '100%', height: '100%',
                          alignItems: 'center', justifyContent: 'center', fontSize: '36px',
                        }}
                      >
                        🎓
                      </div>
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'rgba(17,24,39,0.55)', color: '#fff',
                        padding: '4px 9px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                        backdropFilter: 'blur(2px)',
                      }}>
                        <Clock size={11} color="#fff" /> {curso.duracion_horas != null ? `${curso.duracion_horas}h` : 'Duración N/D'}
                      </span>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={badgePillStyle('#FDF0F2', COLOR_MARCA)}>
                          {curso.categoria_display}
                        </span>
                        <span style={badgePillStyle(nivelColor.bg, nivelColor.text)}>
                          {curso.nivel_display}
                        </span>
                      </div>

                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '14px 0 4px', lineHeight: '1.4' }}>
                        {curso.titulo}
                      </p>
                      {curso.instructor && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
                          Por {curso.instructor}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '12px', borderTop: `1px solid ${COLOR_BORDE}`, marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', color: COLOR_MARCA, fontWeight: '700' }}>
                          Ver curso →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PAGINACIÓN — mismo componente/estilo que Oportunidades.tsx */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => irAPagina(paginaSegura - 1)}
                  disabled={paginaSegura === 1}
                  style={paginacionBotonStyle(false, paginaSegura === 1)}
                >
                  <ChevronLeft size={14} />
                </button>

                {numerosPagina.map((n, i) => {
                  const anterior = numerosPagina[i - 1]
                  const hayHueco = anterior !== undefined && n - anterior > 1
                  return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hayHueco && <span style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>}
                      <button onClick={() => irAPagina(n)} style={paginacionBotonStyle(n === paginaSegura, false)}>
                        {n}
                      </button>
                    </div>
                  )
                })}

                <button
                  onClick={() => irAPagina(paginaSegura + 1)}
                  disabled={paginaSegura === totalPaginas}
                  style={paginacionBotonStyle(false, paginaSegura === totalPaginas)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Cursos