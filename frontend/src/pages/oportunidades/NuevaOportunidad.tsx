import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicarOportunidad } from '../../api/oportunidades'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  MessageSquareText, Tag, Clock, Bookmark,
  Calendar, DollarSign, Lock, Send, Plus, X, ChevronDown, Lightbulb,
} from 'lucide-react'
import heroCrearImg from '../../assets/hero-directorio.png'

const CATEGORIAS = [
  { value: 'consultoria', label: 'Consultoría B2B' },
  { value: 'diseno', label: 'Diseño y Branding' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'suministros', label: 'Suministros' },
  { value: 'educacion', label: 'Educación' },
]

const URGENCIAS = [
  { value: 'baja', label: 'Flexible', hint: 'Sin fecha específica', color: '#22c55e' },
  { value: 'media', label: 'Próximamente', hint: 'En los próximos días', color: '#f59e0b' },
  { value: 'alta', label: 'Urgente', hint: 'Lo necesito cuanto antes', color: COLOR_MARCA },
]

const MAX_ETIQUETAS = 6

function formatFecha(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const fecha = new Date(y, m - 1, d)
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Ilustración del hero — mismo patrón que HeroIlustracion en Oportunidades.tsx
function HeroIlustracion() {
  return (
    <div style={{
      position: 'relative', width: '190px', height: '160px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}55, transparent 70%)`,
      }} />
      <img
        src={heroCrearImg}
        alt="Mujeres colaborando"
        style={{
          position: 'relative', width: '190px', height: '190px',
          objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(182,104,120,0.25))',
        }}
      />
    </div>
  )
}

export default function NuevaOportunidad() {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [urgencia, setUrgencia] = useState('alta')
  const [venceEl, setVenceEl] = useState('')
  const [presupuestoMin, setPresupuestoMin] = useState('')
  const [presupuestoMax, setPresupuestoMax] = useState('')

  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [mostrarInputEtiqueta, setMostrarInputEtiqueta] = useState(false)
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('')

  const agregarEtiqueta = () => {
    const valor = nuevaEtiqueta.trim()
    if (valor && !etiquetas.includes(valor) && etiquetas.length < MAX_ETIQUETAS) {
      setEtiquetas([...etiquetas, valor])
    }
    setNuevaEtiqueta('')
    setMostrarInputEtiqueta(false)
  }

  const quitarEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.filter((e) => e !== etiqueta))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titulo.trim() || !descripcion.trim() || !categoria || !venceEl) {
      setError('Por favor completa el servicio que buscas, la categoría y la fecha límite.')
      return
    }
    if (presupuestoMin && presupuestoMax && Number(presupuestoMin) > Number(presupuestoMax)) {
      setError('El presupuesto mínimo no puede ser mayor que el máximo.')
      return
    }

    setCargando(true)
    setError('')
    try {
      await publicarOportunidad({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        urgencia,
        presupuesto_min: presupuestoMin ? Number(presupuestoMin) : null,
        presupuesto_max: presupuestoMax ? Number(presupuestoMax) : null,
        etiquetas: etiquetas.join(', '),
        vence_el: venceEl,
      })
      navigate('/oportunidades')
    } catch (err: any) {
      // Mismo patrón que NuevoServicio: intentamos primero un error de campo
      // específico (ej. serializer.is_valid() fallido en 'vence_el'), luego
      // {detail} (permisos/ValidationError de vista), y solo al final el
      // mensaje genérico.
      const detalle =
        err?.response?.data?.vence_el?.[0] ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Hubo un error al publicar la oportunidad. Intenta de nuevo.'
      setError(detalle)
    } finally {
      setCargando(false)
    }
  }

  // ---- estilos ----

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: `1px solid ${COLOR_BORDE}`,
  }

  const iconBadge: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#fdf2f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const cardHeader = (icon: React.ReactNode, titulo: string, subtitulo?: string) => (
    <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
      <div style={iconBadge}>{icon}</div>
      <div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>{titulo}</p>
        {subtitulo && (
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '2px 0 0' }}>{subtitulo}</p>
        )}
      </div>
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${COLOR_BORDE}`,
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: 'white',
    fontFamily: 'inherit',
    color: '#111827',
  }

  const chipTag: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#f3f4f6', color: '#374151',
    padding: '7px 8px 7px 14px', borderRadius: '20px',
    fontSize: '13px', fontWeight: '600',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{
          maxWidth: '1040px', margin: '0 auto', padding: '32px 24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>
              Crear oportunidad
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Cuéntale a la red qué necesitas y encuentra a la persona ideal para apoyarte.
            </p>
          </div>

          <HeroIlustracion />
        </div>
      </div>

      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '28px 24px 40px' }}>
        <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '20px' }}>

          {/* Servicio buscado */}
          <div style={cardStyle}>
            {cardHeader(
              <MessageSquareText size={18} color={COLOR_MARCA} />,
              '¿Qué servicio estás buscando? *',
              'Describe claramente lo que necesitas, el objetivo y qué esperas lograr.'
            )}

            <div style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: `1px solid ${COLOR_BORDE}` }}>
              <label htmlFor="titulo" style={labelStyle}>
                <Bookmark size={13} color={COLOR_MARCA} /> Título *
              </label>
              <input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Busco apoyo para manejar redes sociales"
                maxLength={200}
                required
                style={inputStyle}
              />
            </div>

            <label style={labelStyle}>
              <MessageSquareText size={13} color={COLOR_MARCA} /> Descripción *
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Necesito apoyo para manejar las redes sociales de mi negocio..."
              rows={4}
              maxLength={1000}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <p style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af', margin: '6px 0 0' }}>
              {descripcion.length}/1000 caracteres
            </p>
          </div>

          {/* Categoría + Urgencia */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            <div style={cardStyle}>
              {cardHeader(<Bookmark size={18} color={COLOR_MARCA} />, '¿En qué categoría se encuentra tu necesidad? *')}
              <div style={{ position: 'relative' }}>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: '36px' }}
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  color="#9ca3af"
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
              </div>
            </div>

            <div style={cardStyle}>
              {cardHeader(<Clock size={18} color={COLOR_MARCA} />, '¿Qué tan pronto necesitas el servicio? *')}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {URGENCIAS.map((u) => {
                  const activa = urgencia === u.value
                  return (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUrgencia(u.value)}
                      aria-pressed={activa}
                      style={{
                        flex: '1 1 0', minWidth: '110px', textAlign: 'left',
                        padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
                        background: activa ? COLOR_MARCA : 'white',
                        border: activa ? `1.5px solid ${COLOR_MARCA}` : `1px solid ${COLOR_BORDE}`,
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: activa ? 'white' : u.color, display: 'inline-block',
                        }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: activa ? 'white' : '#111827' }}>
                          {u.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: activa ? 'rgba(255,255,255,0.85)' : '#9ca3af', margin: 0 }}>
                        {u.hint}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Etiquetas + Fecha límite */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            <div style={cardStyle}>
              {cardHeader(<Tag size={18} color={COLOR_MARCA} />, 'Etiquetas', `Agrega palabras clave que describan tu necesidad (máx. ${MAX_ETIQUETAS}).`)}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {etiquetas.map((etq) => (
                  <span key={etq} style={chipTag}>
                    {etq}
                    <button
                      type="button"
                      onClick={() => quitarEtiqueta(etq)}
                      aria-label={`Quitar etiqueta ${etq}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}

                {mostrarInputEtiqueta ? (
                  <input
                    autoFocus
                    value={nuevaEtiqueta}
                    onChange={(e) => setNuevaEtiqueta(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); agregarEtiqueta() }
                      if (e.key === 'Escape') { setMostrarInputEtiqueta(false); setNuevaEtiqueta('') }
                    }}
                    onBlur={agregarEtiqueta}
                    placeholder="Nueva etiqueta"
                    maxLength={30}
                    style={{ ...inputStyle, width: '140px', padding: '8px 12px', marginTop: 0 }}
                  />
                ) : (
                  etiquetas.length < MAX_ETIQUETAS && (
                    <button
                      type="button"
                      onClick={() => setMostrarInputEtiqueta(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                        background: 'white', border: `1px dashed ${COLOR_BORDE}`,
                        color: '#374151', fontSize: '13px', fontWeight: '600',
                      }}
                    >
                      <Plus size={13} /> Agregar etiqueta
                    </button>
                  )
                )}
              </div>
            </div>

            <div style={cardStyle}>
              {cardHeader(<Calendar size={18} color={COLOR_MARCA} />, 'Fecha límite *', 'Selecciona la fecha en la que necesitas que esté resuelto.')}
              <div style={{ position: 'relative' }}>
                {venceEl && (
                  <div style={{
                    ...inputStyle,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color={COLOR_MARCA} />
                      {formatFecha(venceEl)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVenceEl('')}
                      aria-label="Quitar fecha"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
                <input
                  type="date"
                  value={venceEl}
                  onChange={(e) => setVenceEl(e.target.value)}
                  required
                  style={venceEl ? { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' } : inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Presupuesto */}
          <div style={cardStyle}>
            {cardHeader(<DollarSign size={18} color={COLOR_MARCA} />, 'Presupuesto aproximado (MXN)', 'Indica el rango que tienes en mente. Puedes dejarlo vacío si prefieres definirlo después.')}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 140px' }}>
                <label htmlFor="presupuestoMin" style={{ ...labelStyle, marginBottom: '6px' }}>Mínimo</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: '#6b7280', fontSize: '14px',
                  }}>$</span>
                  <input
                    id="presupuestoMin"
                    type="number"
                    min="0"
                    step="1"
                    value={presupuestoMin}
                    onChange={(e) => setPresupuestoMin(e.target.value)}
                    placeholder="0"
                    style={{ ...inputStyle, paddingLeft: '30px' }}
                  />
                </div>
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label htmlFor="presupuestoMax" style={{ ...labelStyle, marginBottom: '6px' }}>Máximo</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: '#6b7280', fontSize: '14px',
                  }}>$</span>
                  <input
                    id="presupuestoMax"
                    type="number"
                    min="0"
                    step="1"
                    value={presupuestoMax}
                    onChange={(e) => setPresupuestoMax(e.target.value)}
                    placeholder="A convenir"
                    style={{ ...inputStyle, paddingLeft: '30px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div style={{
            background: '#fdf2f4', borderRadius: '14px', padding: '18px 22px',
            border: '1px solid #f6dde2', borderLeft: `4px solid ${COLOR_MARCA}`,
          }}>
            <p style={{
              fontSize: '13px', fontWeight: '700', color: COLOR_MARCA, marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Lightbulb size={14} /> Tips para una buena oportunidad
            </p>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#6b7280', fontSize: '13px', lineHeight: '1.9' }}>
              <li>Sé específica sobre lo que necesitas y el resultado esperado</li>
              <li>Indica un presupuesto realista para atraer propuestas serias</li>
              <li>Agrega etiquetas para que te encuentren más fácil</li>
            </ul>
          </div>

          {error && (
            <p role="alert" style={{
              color: '#ef4444', fontSize: '14px', margin: 0,
              background: '#fef2f2', padding: '10px 14px', borderRadius: '10px',
            }}>
              {error}
            </p>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#f3f4f6', borderRadius: '12px',
              padding: '12px 16px', flex: '1 1 320px',
            }}>
              <Lock size={15} color={COLOR_MARCA} />
              <span style={{ fontSize: '13px', color: '#4b5563' }}>
                Tu información está protegida y será tratada con confidencialidad.
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={cargando}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: COLOR_MARCA, color: 'white', padding: '14px 28px',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px',
                  opacity: cargando ? 0.7 : 1,
                  boxShadow: `0 4px 14px ${COLOR_MARCA_CLARO}50`,
                }}
              >
                <Send size={15} />
                {cargando ? 'Publicando...' : 'Publicar oportunidad'}
              </button>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0' }}>
                Tu oportunidad será visible para toda la comunidad
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}