import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicarServicio } from '../../api/servicios'

const CATEGORIAS = [
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'estrategia', label: 'Estrategia' },
  { value: 'branding', label: 'Branding' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'educacion', label: 'Educación' },
]

export default function NuevoServicio() {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    precio: '',
    precio_personalizado: false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo || !form.descripcion || !form.categoria) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }
    setCargando(true)
    setError('')
    try {
      await publicarServicio({
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        precio: form.precio_personalizado ? null : form.precio || null,
        precio_personalizado: form.precio_personalizado,
      })
      navigate('/servicios')
    } catch {
      setError('Hubo un error al publicar el servicio. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginTop: '4px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  }

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
    marginBottom: '20px',
  }

  const tituloSeccion: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '12px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/servicios')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: '14px', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
            }}
          >
            ← Volver a servicios
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
            Publicar Servicio
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Cuéntale a la red qué ofreces y cómo pueden contratarte.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Información básica */}
          <div style={cardStyle}>
            <h2 style={tituloSeccion}>📋 Información del Servicio</h2>
            <div style={{ display: 'grid', gap: '16px' }}>

              <div>
                <label style={labelStyle}>Título del servicio *</label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Mentoring Estratégico para CEOs"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Categoría *</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Descripción *</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe tu servicio, a quién va dirigido y qué resultados pueden esperar..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

            </div>
          </div>

          {/* Precio */}
          <div style={cardStyle}>
            <h2 style={tituloSeccion}>💰 Precio</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setForm({ ...form, precio_personalizado: false })}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: '1px solid',
                  borderColor: !form.precio_personalizado ? '#B66878' : '#e5e7eb',
                  background: !form.precio_personalizado ? '#fdf2f4' : 'white',
                  color: !form.precio_personalizado ? '#B66878' : '#374151',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                }}
              >
                Precio fijo
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, precio_personalizado: true, precio: '' })}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: '1px solid',
                  borderColor: form.precio_personalizado ? '#B66878' : '#e5e7eb',
                  background: form.precio_personalizado ? '#fdf2f4' : 'white',
                  color: form.precio_personalizado ? '#B66878' : '#374151',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                }}
              >
                Precio personalizado
              </button>
            </div>

            {!form.precio_personalizado && (
              <div>
                <label style={labelStyle}>Precio desde (MXN)</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <span style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: '#6b7280', fontSize: '14px',
                  }}>$</span>
                  <input
                    name="precio"
                    type="number"
                    min="0"
                    value={form.precio}
                    onChange={handleChange}
                    placeholder="4500"
                    style={{ ...inputStyle, paddingLeft: '28px', marginTop: 0 }}
                  />
                </div>
              </div>
            )}

            {form.precio_personalizado && (
              <p style={{ color: '#6b7280', fontSize: '13px', background: '#f9fafb', padding: '10px 14px', borderRadius: '8px' }}>
                Las interesadas te contactarán para conocer el precio según sus necesidades.
              </p>
            )}
          </div>

          {/* Tips */}
          <div style={{
            background: '#fdf2f4', borderRadius: '12px', padding: '16px 20px',
            marginBottom: '20px', borderLeft: '4px solid #B66878',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#B66878', marginBottom: '6px' }}>
              💡 Tips para un buen servicio
            </p>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#6b7280', fontSize: '13px', lineHeight: '1.8' }}>
              <li>Sé específica sobre los entregables y resultados</li>
              <li>Indica el tiempo de entrega o duración</li>
              <li>Menciona a quién va dirigido</li>
            </ul>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/servicios')}
              style={{
                background: 'white', color: '#6b7280', padding: '12px 24px',
                borderRadius: '10px', border: '1px solid #e5e7eb',
                cursor: 'pointer', fontWeight: '600', fontSize: '14px',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              style={{
                background: '#B66878', color: 'white', padding: '12px 32px',
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '15px',
                opacity: cargando ? 0.7 : 1,
              }}
            >
              {cargando ? 'Publicando...' : 'Publicar servicio'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}