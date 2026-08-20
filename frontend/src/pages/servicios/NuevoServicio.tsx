import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicarServicio, getCategoriasServicios } from '../../api/servicios'
import type { Categoria } from '../../api/servicios'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  Briefcase, Tag, FileText, DollarSign,
  Lightbulb, Check, Lock, Send, Loader2,
  Megaphone, Code2, GraduationCap, HeartPulse, Sparkles,
} from 'lucide-react'
import heroCrearImg from '../../assets/hero-directorio.png'

const AYUDA_CATEGORIA: Record<string, string> = {
  consultoria: 'Estrategia de negocio, asesoría, gestión, finanzas',
  marketing_branding: 'Publicidad, redes sociales, logotipos, identidad de marca',
  tecnologia: 'Desarrollo web, apps, soporte técnico, automatización',
  educacion: 'Clases particulares, tutorías, capacitación, mentoría',
  salud_bienestar: 'Nutrición, psicología, terapias, fitness',
  otro: '¿No encaja en las anteriores? Cuéntanos de qué se trata',
}

const ICONO_CATEGORIA: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  consultoria: Briefcase,
  marketing_branding: Megaphone,
  tecnologia: Code2,
  educacion: GraduationCap,
  salud_bienestar: HeartPulse,
  otro: Sparkles,
}

// Ilustración del hero — mismo patrón que HeroIlustracion en NuevaOportunidad.tsx
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

export default function NuevoServicio() {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [sugerenciasOtro, setSugerenciasOtro] = useState<string[]>([])

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    categoria_otro: '',
    precio: '',
    precio_personalizado: false,
  })

  useEffect(() => {
    getCategoriasServicios()
      .then((data) => {
        setCategorias(data.categorias)
        setSugerenciasOtro(data.sugerencias_otro || [])
      })
      .catch(console.error)
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.titulo.trim() || !form.descripcion.trim() || !form.categoria) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }
    if (form.categoria === 'otro' && !form.categoria_otro.trim()) {
      setError('Cuéntanos de qué trata tu servicio en el campo de categoría.')
      return
    }

    setCargando(true)
    setError('')
    try {
      await publicarServicio({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria,
        categoria_otro: form.categoria === 'otro' ? form.categoria_otro.trim() : '',
        precio: form.precio_personalizado ? null : form.precio || null,
        precio_personalizado: form.precio_personalizado,
      })
      navigate('/servicios')
    } catch (err: any) {
      const detalle =
        err?.response?.data?.categoria_otro?.[0] ||
        err?.response?.data?.detail ||
        'Hubo un error al publicar el servicio. Intenta de nuevo.'
      setError(detalle)
    } finally {
      setCargando(false)
    }
  }

  // ---- estilos ----

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '20px',
    padding: '26px',
    boxShadow: '0 1px 3px rgba(17,24,39,0.05), 0 10px 26px -16px rgba(17,24,39,0.14)',
    border: `1px solid ${COLOR_BORDE}`,
  }

  const iconBadge: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#fdf2f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const cardHeader = (icon: React.ReactNode, titulo: string, subtitulo?: string) => (
    <div style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
      <div style={iconBadge}>{icon}</div>
      <div>
        <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.1px' }}>{titulo}</p>
        {subtitulo && (
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '3px 0 0', lineHeight: '1.4' }}>{subtitulo}</p>
        )}
      </div>
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${COLOR_BORDE}`,
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: 'white',
    fontFamily: 'inherit',
    color: '#111827',
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
      <style>{`
        @keyframes ns-fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ns-card { animation: ns-fadeUp .45s ease both; }
        .ns-input:focus, .ns-textarea:focus {
          border-color: ${COLOR_MARCA} !important;
          box-shadow: 0 0 0 3px ${COLOR_MARCA_CLARO}55;
        }
        .ns-chip { transition: transform .12s ease, background .15s ease, box-shadow .15s ease; }
        .ns-chip:hover { transform: translateY(-1px); }
        .ns-chip:focus-visible,
        .ns-toggle:focus-visible,
        .ns-submit:focus-visible,
        .ns-input:focus-visible,
        .ns-textarea:focus-visible {
          outline: 2px solid ${COLOR_MARCA};
          outline-offset: 2px;
        }
        .ns-toggle { transition: background .15s ease, color .15s ease, box-shadow .15s ease; }
        .ns-submit { transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease; }
        .ns-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px -6px ${COLOR_MARCA_CLARO};
        }
        @keyframes ns-spin { to { transform: rotate(360deg); } }
        .ns-spin { animation: ns-spin .8s linear infinite; }
        @media (min-width: 720px) {
          .ns-grid-2 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)',
        borderBottom: `1px solid ${COLOR_BORDE}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-60px', right: '10%', width: '220px', height: '220px',
          borderRadius: '50%', background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}30, transparent 72%)`,
        }} />
        <div style={{
          maxWidth: '1040px', margin: '0 auto', padding: '32px 24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
          position: 'relative',
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <span style={{
              display: 'inline-block', fontSize: '12px', fontWeight: '700', color: COLOR_MARCA,
              background: 'white', padding: '5px 12px', borderRadius: '999px', marginBottom: '10px',
              border: `1px solid #f6dde2`,
            }}>
              Nuevo servicio
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
              Publicar <span style={{ color: COLOR_MARCA }}>servicio</span>
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0, maxWidth: '420px' }}>
              Cuéntale a la red qué ofreces y cómo pueden contratarte.
            </p>
          </div>

          <HeroIlustracion />
        </div>
      </div>

      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '28px 24px 40px' }}>
        <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '20px' }}>

          {/* Información del servicio */}
          <div style={cardStyle} className="ns-card">
            {cardHeader(
              <Briefcase size={18} color={COLOR_MARCA} />,
              '¿Qué servicio estás ofreciendo?',
              'Describe claramente qué incluye, a quién va dirigido y qué resultados pueden esperar.'
            )}

            <div style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: `1px solid ${COLOR_BORDE}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="titulo" style={labelStyle}>
                  <Briefcase size={13} color={COLOR_MARCA} /> Título del servicio *
                </label>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{form.titulo.length}/200</span>
              </div>
              <input
                id="titulo"
                name="titulo"
                className="ns-input"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej: Mentoring Estratégico para CEOs"
                maxLength={200}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label htmlFor="descripcion" style={labelStyle}>
                <FileText size={13} color={COLOR_MARCA} /> Descripción *
              </label>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{form.descripcion.length}/1000</span>
            </div>
            <textarea
              id="descripcion"
              name="descripcion"
              className="ns-textarea"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe tu servicio, a quién va dirigido y qué resultados pueden esperar..."
              rows={4}
              maxLength={1000}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Categoría + Precio */}
          <div className="ns-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>

            <div style={cardStyle} className="ns-card">
              {cardHeader(<Tag size={18} color={COLOR_MARCA} />, '¿En qué categoría se encuentra tu servicio?')}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categorias.map((cat) => {
                  const activa = form.categoria === cat.value
                  const Icono = ICONO_CATEGORIA[cat.value] || Sparkles
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      className="ns-chip"
                      onClick={() => setForm({ ...form, categoria: cat.value })}
                      aria-pressed={activa}
                      style={{
                        padding: '9px 16px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                        background: activa ? COLOR_MARCA : 'white',
                        color: activa ? 'white' : '#374151',
                        fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                        boxShadow: activa ? 'none' : `inset 0 0 0 1px ${COLOR_BORDE}`,
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {activa ? <Check size={12} /> : <Icono size={13} color="#9ca3af" />}
                      {cat.label}
                    </button>
                  )
                })}
              </div>
              {form.categoria && AYUDA_CATEGORIA[form.categoria] && (
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: '10px 0 0' }}>
                  {AYUDA_CATEGORIA[form.categoria]}
                </p>
              )}

              {form.categoria === 'otro' && (
                <div style={{ marginTop: '14px' }}>
                  <label htmlFor="categoria_otro" style={labelStyle}>¿De qué trata tu servicio? *</label>
                  <input
                    id="categoria_otro"
                    name="categoria_otro"
                    className="ns-input"
                    list="sugerencias-otro"
                    value={form.categoria_otro}
                    onChange={handleChange}
                    placeholder="Ej: Repostería, fotografía de producto..."
                    maxLength={80}
                    required
                    style={inputStyle}
                  />
                  <datalist id="sugerencias-otro">
                    {sugerenciasOtro.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            <div style={cardStyle} className="ns-card">
              {cardHeader(<DollarSign size={18} color={COLOR_MARCA} />, '¿Cómo quieres mostrar tu precio?')}

              <div style={{
                display: 'inline-flex', gap: '4px', marginBottom: '16px', padding: '4px',
                background: '#f3f4f6', borderRadius: '24px', width: '100%',
              }}>
                <button
                  type="button"
                  className="ns-toggle"
                  onClick={() => setForm({ ...form, precio_personalizado: false })}
                  aria-pressed={!form.precio_personalizado}
                  style={{
                    flex: 1, padding: '8px 14px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                    background: !form.precio_personalizado ? 'white' : 'transparent',
                    color: !form.precio_personalizado ? COLOR_MARCA : '#6b7280',
                    fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    boxShadow: !form.precio_personalizado ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Precio fijo
                </button>
                <button
                  type="button"
                  className="ns-toggle"
                  onClick={() => setForm({ ...form, precio_personalizado: true, precio: '' })}
                  aria-pressed={form.precio_personalizado}
                  style={{
                    flex: 1, padding: '8px 14px', borderRadius: '20px', border: 'none', whiteSpace: 'nowrap',
                    background: form.precio_personalizado ? 'white' : 'transparent',
                    color: form.precio_personalizado ? COLOR_MARCA : '#6b7280',
                    fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    boxShadow: form.precio_personalizado ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Personalizado
                </button>
              </div>

              {!form.precio_personalizado ? (
                <div>
                  <label htmlFor="precio" style={labelStyle}>Precio desde (MXN)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: '#6b7280', fontSize: '14px',
                    }}>$</span>
                    <input
                      id="precio"
                      name="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      className="ns-input"
                      value={form.precio}
                      onChange={handleChange}
                      placeholder="4500"
                      style={{ ...inputStyle, paddingLeft: '30px' }}
                    />
                  </div>
                </div>
              ) : (
                <p style={{
                  color: '#6b7280', fontSize: '13px', background: '#f9fafb', margin: 0,
                  padding: '12px 14px', borderRadius: '10px', border: `1px solid ${COLOR_BORDE}`,
                }}>
                  Las interesadas te contactarán para conocer el precio según sus necesidades.
                </p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            background: '#fdf2f4', borderRadius: '14px', padding: '18px 22px',
            border: '1px solid #f6dde2', borderLeft: `4px solid ${COLOR_MARCA}`,
          }} className="ns-card">
            <p style={{
              fontSize: '13px', fontWeight: '700', color: COLOR_MARCA, marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Lightbulb size={14} /> Tips para un buen servicio
            </p>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#6b7280', fontSize: '13px', lineHeight: '1.9' }}>
              <li>Sé específica sobre los entregables y resultados</li>
              <li>Indica el tiempo de entrega o duración</li>
              <li>Menciona a quién va dirigido</li>
            </ul>
          </div>

          {error && (
            <p role="alert" style={{
              color: '#ef4444', fontSize: '14px', margin: 0,
              background: '#fef2f2', padding: '10px 14px', borderRadius: '10px',
              border: '1px solid #fecaca',
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
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'white', borderRadius: '14px',
              padding: '12px 16px', flex: '1 1 320px',
              border: `1px solid ${COLOR_BORDE}`,
            }}>
              <div style={{ ...iconBadge, width: '32px', height: '32px', borderRadius: '9px' }}>
                <Lock size={14} color={COLOR_MARCA} />
              </div>
              <span style={{ fontSize: '13px', color: '#4b5563' }}>
                Tu información está protegida y será tratada con confidencialidad.
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={cargando}
                className="ns-submit"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: COLOR_MARCA, color: 'white', padding: '14px 28px',
                  borderRadius: '10px', border: 'none', cursor: cargando ? 'default' : 'pointer',
                  fontWeight: '700', fontSize: '14px',
                  opacity: cargando ? 0.75 : 1,
                  boxShadow: `0 4px 14px ${COLOR_MARCA_CLARO}60`,
                }}
              >
                {cargando ? <Loader2 size={15} className="ns-spin" /> : <Send size={15} />}
                {cargando ? 'Publicando...' : 'Publicar servicio'}
              </button>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0' }}>
                Tu servicio será visible para toda la comunidad
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}