import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOportunidades } from '../../api/oportunidades'
import { paginacionBotonStyle, COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  Search, Plus, Clock, Users, ArrowRight,
  ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react'
import heroImg from '../../assets/hero-reuniones.png'

interface Oportunidad {
  id: number
  publicada_por: number
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
  creada_el: string
}

const CATEGORIAS = [
  { value: 'consultoria', label: 'Consultoría B2B' },
  { value: 'diseno', label: 'Diseño y Branding' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'suministros', label: 'Suministros' },
  { value: 'educacion', label: 'Educación' },
]

const URGENCIA_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  alta: { bg: '#fef2f2', color: '#dc2626', label: 'Urgente' },
  media: { bg: '#fffbeb', color: '#d97706', label: 'Media' },
  baja: { bg: '#f0fdf4', color: '#16a34a', label: 'Baja' },
}

const PALETA = [
  { bg: '#eef2ff', color: '#6366f1' },
  { bg: '#fdf4ff', color: '#a855f7' },
  { bg: '#eff6ff', color: '#3b82f6' },
  { bg: '#fdf2f4', color: COLOR_MARCA },
  { bg: '#f0fdf4', color: '#22c55e' },
  { bg: '#fff7ed', color: '#f97316' },
]

const colorPorCategoria = (cat: string) => {
  const idx = cat.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETA.length
  return PALETA[idx]
}

const labelCategoria = (value: string) =>
  CATEGORIAS.find((c) => c.value === value)?.label || value

const OPORTUNIDADES_POR_PAGINA = 9

// --- Franja decorativa del hero -------------------------------------------
// Mismo patrón que HeroIlustracion en Directorio.tsx / Servicios.tsx.
// Coloca tu archivo en src/assets/hero-oportunidades.png (o ajusta el
// import de arriba a la ruta/nombre real que uses).
function HeroIlustracion() {
  return (
    <div style={{
      position: 'relative', width: '260px', height: '190px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}55, transparent 70%)`,
      }} />
      <Sparkles size={18} color={COLOR_MARCA} style={{ position: 'absolute', top: '6px', left: '10px', opacity: 0.6 }} />
      <Sparkles size={14} color={COLOR_MARCA} style={{ position: 'absolute', bottom: '18px', right: '4px', opacity: 0.5 }} />
      <img
        src={heroImg}
        alt="Mujeres colaborando en proyectos"
        style={{
          position: 'relative', width: '220px', height: '220px',
          objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(182,104,120,0.25))',
        }}
      />
    </div>
  )
}

export default function Oportunidades() {
  const navigate = useNavigate()
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const filtros: Record<string, string> = {}
        if (categoriaActiva) filtros.categoria = categoriaActiva
        const data = await getOportunidades(filtros)
        setOportunidades(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [categoriaActiva])

  useEffect(() => {
    setPagina(1)
  }, [busqueda, categoriaActiva])

  const oportunidadesFiltradas = oportunidades.filter(
    (o) =>
      busqueda === '' ||
      o.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.publicada_por_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.etiquetas.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(oportunidadesFiltradas.length / OPORTUNIDADES_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const oportunidadesPagina = oportunidadesFiltradas.slice(
    (paginaSegura - 1) * OPORTUNIDADES_POR_PAGINA,
    paginaSegura * OPORTUNIDADES_POR_PAGINA
  )

  // Números de página con "..." cuando hay muchas páginas (mismo patrón que Directorio/Servicios).
  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1])
    return Array.from(nums).filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b)
  }, [totalPaginas, paginaSegura])

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.25' }}>
              Oportunidades
            </h1>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: COLOR_MARCA, margin: '0 0 12px', lineHeight: '1.25' }}>
              de colaboración
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
              Proyectos y colaboraciones publicadas por la red. Encuentra tu próximo reto.
            </p>
            <button
              onClick={() => navigate('/oportunidades/nueva')}
              style={{
                background: COLOR_MARCA, color: 'white', padding: '12px 24px',
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Plus size={16} /> Publicar oportunidad
            </button>
          </div>

          <HeroIlustracion />
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 40px' }}>

        {/* BUSCADOR */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            aria-label="Buscar oportunidades"
            placeholder="Buscar por título, etiqueta o quién publica..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px',
              border: `1px solid ${COLOR_BORDE}`, fontSize: '14px',
              boxSizing: 'border-box' as const, outline: 'none', background: 'white',
            }}
          />
        </div>

        {/* CHIPS DE CATEGORIA */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '28px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCategoriaActiva('')}
            aria-pressed={categoriaActiva === ''}
            style={{
              padding: '9px 18px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
              background: categoriaActiva === '' ? COLOR_MARCA : 'white',
              color: categoriaActiva === '' ? 'white' : '#374151',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer',
              boxShadow: categoriaActiva === '' ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
            }}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoriaActiva(cat.value === categoriaActiva ? '' : cat.value)}
              aria-pressed={categoriaActiva === cat.value}
              style={{
                padding: '9px 18px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                background: categoriaActiva === cat.value ? COLOR_MARCA : 'white',
                color: categoriaActiva === cat.value ? 'white' : '#374151',
                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                boxShadow: categoriaActiva === cat.value ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* RESULTADOS */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            Cargando oportunidades...
          </div>
        ) : oportunidades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>
              Aún no hay oportunidades publicadas.
            </p>
            <button
              onClick={() => navigate('/oportunidades/nueva')}
              style={{
                background: COLOR_MARCA, color: 'white', padding: '10px 24px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              }}
            >
              Sé la primera en publicar
            </button>
          </div>
        ) : oportunidadesFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              No hay resultados para tu búsqueda o filtro actual.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {oportunidadesPagina.map((op) => {
                const colorCat = colorPorCategoria(op.categoria)
                const urgencia = URGENCIA_STYLE[op.urgencia]
                const iniciales = op.publicada_por_nombre
                  ? op.publicada_por_nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  : '?'

                return (
                  <div
                    key={op.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/oportunidades/${op.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/oportunidades/${op.id}`)
                      }
                    }}
                    style={{
                      background: 'white', borderRadius: '16px', padding: '24px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${COLOR_BORDE}`,
                      display: 'flex', flexDirection: 'column', gap: '12px',
                      transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s', cursor: 'pointer',
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
                    {/* Categoría + urgencia */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: '600',
                        background: colorCat.bg, color: colorCat.color,
                      }}>
                        {labelCategoria(op.categoria)}
                      </span>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap',
                        background: urgencia.bg, color: urgencia.color,
                      }}>
                        {urgencia.label}
                      </span>
                    </div>

                    {/* Título y descripción */}
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                        {op.titulo}
                      </h3>
                      <p style={{
                        color: '#6b7280', fontSize: '13px', lineHeight: '1.5',
                        display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                      }}>
                        {op.descripcion}
                      </p>
                    </div>

                    {/* Presupuesto */}
                    <div style={{ fontWeight: '700', fontSize: '15px', color: COLOR_MARCA }}>
                      {op.presupuesto_min && op.presupuesto_max
                        ? `$${Number(op.presupuesto_min).toLocaleString('es-MX')} - $${Number(op.presupuesto_max).toLocaleString('es-MX')} MXN`
                        : 'Presupuesto a convenir'}
                    </div>

                    {/* Footer: publicada_por + vence + postulaciones */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: '12px', borderTop: `1px solid ${COLOR_BORDE}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, #f7d9de)`,
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '13px', fontWeight: '700',
                          color: COLOR_MARCA, flexShrink: 0,
                        }}>
                          {iniciales}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: '13px', fontWeight: '600', color: '#374151', margin: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {op.publicada_por_nombre}
                          </p>
                          <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                            <Clock size={11} /> Vence {new Date(op.vence_el).toLocaleDateString('es-MX', {
                              day: 'numeric', month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', fontWeight: '600', flexShrink: 0 }}>
                        <Users size={12} /> {op.total_postulaciones}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: COLOR_MARCA, flexShrink: 0,
                      }}>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PAGINACION */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
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
                      <button onClick={() => setPagina(n)} style={paginacionBotonStyle(n === paginaSegura, false)}>
                        {n}
                      </button>
                    </div>
                  )
                })}

                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
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