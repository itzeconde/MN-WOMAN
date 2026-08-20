import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServicios, getCategoriasServicios } from '../../api/servicios'
import type { Servicio, Categoria } from '../../api/servicios'
import { useCargaConError } from '../../hooks/useCargaConError'
import EstadoSinConexion from '../../components/ui/EstadoSinConexion'
import heroImg from '../../assets/hero-reuniones.png'
import { paginacionBotonStyle, COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  Search, Sparkles, ArrowRight,
  ChevronLeft, ChevronRight, Plus,
} from 'lucide-react'

const SERVICIOS_POR_PAGINA = 9

const PALETA: Record<string, { bg: string; color: string }> = {
  consultoria: { bg: '#eef2ff', color: '#6366f1' },
  marketing_branding: { bg: '#fdf4ff', color: '#a855f7' },
  tecnologia: { bg: '#eff6ff', color: '#3b82f6' },
  educacion: { bg: '#fff7ed', color: '#f97316' },
  salud_bienestar: { bg: '#f0fdf4', color: '#22c55e' },
  otro: { bg: '#f3f4f6', color: '#6b7280' },
}
const colorPorCategoria = (cat: string) => PALETA[cat] || PALETA.otro

// --- Franja decorativa del hero -------------------------------------------
// Mismo patrón que HeroIlustracion en Directorio.tsx: coloca tu archivo en
// src/assets/hero-servicios.png (o ajusta el import de arriba a la
// ruta/nombre real que uses).
function HeroIlustracion() {
  return (
    <div style={{
      position: 'relative', width: '320px', height: '240px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}55, transparent 70%)`,
      }} />
      <Sparkles size={20} color={COLOR_MARCA} style={{ position: 'absolute', top: '8px', left: '6px', opacity: 0.6 }} />
      <Sparkles size={16} color={COLOR_MARCA} style={{ position: 'absolute', bottom: '20px', right: '2px', opacity: 0.5 }} />
      <img
        src={heroImg}
        alt="Empresarias ofreciendo sus servicios"
        style={{
          position: 'relative', width: '280px', height: '280px',
          objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(182,104,120,0.25))',
        }}
      />
    </div>
  )
}

export default function Servicios() {
  const navigate = useNavigate()
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const { cargando, errorRed, ejecutar } = useCargaConError()

  useEffect(() => {
    getCategoriasServicios()
      .then((data) => setCategorias(data.categorias))
      .catch(console.error)
  }, [])

  const cargarServicios = () => ejecutar(async () => {
    const filtros: Record<string, string> = {}
    if (categoriaActiva) filtros.categoria = categoriaActiva
    const data = await getServicios(filtros)
    setServicios(data)
  })

  useEffect(() => {
    cargarServicios()
  }, [categoriaActiva])

  useEffect(() => {
    setPagina(1)
  }, [busqueda, categoriaActiva])

  const serviciosFiltrados = servicios.filter(
    (s) =>
      busqueda === '' ||
      s.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.nombre_proveedora.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.categoria_display.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(serviciosFiltrados.length / SERVICIOS_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const serviciosPagina = serviciosFiltrados.slice(
    (paginaSegura - 1) * SERVICIOS_POR_PAGINA,
    paginaSegura * SERVICIOS_POR_PAGINA
  )

  // Números de página con "..." cuando hay muchas páginas (igual que Directorio).
  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1])
    return Array.from(nums).filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b)
  }, [totalPaginas, paginaSegura])

  const irAPerfilProveedora = (proveedoraId: number) => navigate(`/directorio/${proveedoraId}`)

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
              Servicios profesionales
            </h1>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: COLOR_MARCA, margin: '0 0 12px', lineHeight: '1.25' }}>
              de nuestra comunidad
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
              Explora lo que ofrecen las empresarias de la red y encuentra justo lo que necesitas.
            </p>
            <button
              onClick={() => navigate('/servicios/nuevo')}
              style={{
                background: COLOR_MARCA, color: 'white', padding: '12px 24px',
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Plus size={16} /> Publicar mi servicio
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
            aria-label="Buscar servicios"
            placeholder="Buscar por servicio, categoría o nombre..."
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
        {categorias.length > 0 && (
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
            {categorias.map((cat) => (
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
        )}

        {/* RESULTADOS */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            Cargando servicios...
          </div>
        ) : errorRed ? (
          <EstadoSinConexion
            onReintentar={cargarServicios}
            mensaje="No pudimos cargar los servicios. Revisa tu internet e intenta de nuevo."
          />
        ) : servicios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>
              Aún no hay servicios publicados.
            </p>
            <button
              onClick={() => navigate('/servicios/nuevo')}
              style={{
                background: COLOR_MARCA, color: 'white', padding: '10px 24px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              }}
            >
              Sé la primera en publicar
            </button>
          </div>
        ) : serviciosFiltrados.length === 0 ? (
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
              {serviciosPagina.map((servicio) => {
                const colorCat = colorPorCategoria(servicio.categoria)
                const iniciales = servicio.nombre_proveedora
                  ? servicio.nombre_proveedora.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  : '?'

                return (
                  <div
                    key={servicio.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => irAPerfilProveedora(servicio.proveedora)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        irAPerfilProveedora(servicio.proveedora)
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
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: '600',
                      background: colorCat.bg, color: colorCat.color,
                      alignSelf: 'flex-start',
                    }}>
                      {servicio.categoria_display}
                    </span>

                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                        {servicio.titulo}
                      </h3>
                      <p style={{
                        color: '#6b7280', fontSize: '13px', lineHeight: '1.5',
                        display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                      }}>
                        {servicio.descripcion}
                      </p>
                    </div>

                    <div style={{ fontWeight: '700', fontSize: '15px', color: COLOR_MARCA }}>
                      {servicio.precio_personalizado
                        ? 'Consultar precio'
                        : servicio.precio != null
                          ? `Desde $${Number(servicio.precio).toLocaleString('es-MX')} MXN`
                          : 'Precio a convenir'}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: '12px', borderTop: `1px solid ${COLOR_BORDE}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, #f7d9de)`,
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '13px', fontWeight: '700',
                          color: COLOR_MARCA, flexShrink: 0,
                        }}>
                          {iniciales}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: 0 }}>
                            {servicio.nombre_proveedora}
                          </p>
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                            {new Date(servicio.creado_el).toLocaleDateString('es-MX', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
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