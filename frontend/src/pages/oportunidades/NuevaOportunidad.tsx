import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicarOportunidad } from '../../api/oportunidades'

const CATEGORIAS = [
  { value: 'consultoria', label: 'Consultoría B2B' },
  { value: 'diseno', label: 'Diseño y Branding' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'suministros', label: 'Suministros' },
  { value: 'educacion', label: 'Educación' },
]

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '10px',
  border: '1px solid #e5e7eb', fontSize: '14px',
  boxSizing: 'border-box' as const, outline: 'none', marginTop: '6px',
}

const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#111827' }

export default function NuevaOportunidad() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    titulo: '', descripcion: '', categoria: 'consultoria', urgencia: 'media',
    presupuesto_min: '', presupuesto_max: '', etiquetas: '', vence_el: '',
  })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.titulo || !form.descripcion || !form.vence_el) {
      setError('Completa título, descripción y fecha límite.')
      return
    }

    setEnviando(true)
    try {
      const payload = {
        ...form,
        presupuesto_min: form.presupuesto_min ? Number(form.presupuesto_min) : null,
        presupuesto_max: form.presupuesto_max ? Number(form.presupuesto_max) : null,
      }
      const nueva = await publicarOportunidad(payload)
      navigate(`/oportunidades/${nueva.id}`)
    } catch {
      setError('Ocurrió un error al publicar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
          Publicar una oportunidad
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
          Comparte un proyecto o colaboración con la red MN WOMAN.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Título *</label>
            <input name="titulo" value={form.titulo} onChange={handleChange} style={inputStyle} placeholder="Ej. Busco diseñadora para rebranding" />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Descripción *</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe el proyecto o colaboración..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} style={inputStyle}>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Urgencia</label>
              <select name="urgencia" value={form.urgencia} onChange={handleChange} style={inputStyle}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Presupuesto mínimo (MXN)</label>
              <input type="number" name="presupuesto_min" value={form.presupuesto_min} onChange={handleChange} style={inputStyle} placeholder="Opcional" />
            </div>
            <div>
              <label style={labelStyle}>Presupuesto máximo (MXN)</label>
              <input type="number" name="presupuesto_max" value={form.presupuesto_max} onChange={handleChange} style={inputStyle} placeholder="Opcional" />
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Etiquetas</label>
            <input name="etiquetas" value={form.etiquetas} onChange={handleChange} style={inputStyle} placeholder="Separadas por coma, ej. diseño, urgente, remoto" />
          </div>

          <div style={{ marginBottom: '26px' }}>
            <label style={labelStyle}>Fecha límite *</label>
            <input type="date" name="vence_el" value={form.vence_el} onChange={handleChange} style={inputStyle} />
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
          )}

          <button type="submit" disabled={enviando} style={{
            width: '100%', padding: '14px', backgroundColor: '#B66878', color: '#fff',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
            cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.7 : 1,
          }}>
            {enviando ? 'Publicando...' : 'Publicar oportunidad'}
          </button>
        </form>
      </div>
    </div>
  )
}