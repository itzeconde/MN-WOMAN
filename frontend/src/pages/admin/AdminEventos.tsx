import { useState, useEffect } from 'react'
import { adminCrearEvento, adminEditarEvento, adminEliminarEvento, getEventos } from '../../api/eventos'

interface Evento {
  id: number
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  hotel: string
  status: 'proximo' | 'en_curso' | 'finalizado'
  cover_image: string | null
  total_asistentes: number
  referral_goal: number
}

const statusConfig = {
  proximo: { label: 'Próximo', color: '#6366f1', bg: '#eef2ff' },
  en_curso: { label: 'En Curso', color: '#16a34a', bg: '#dcfce7' },
  finalizado: { label: 'Finalizado', color: '#6b7280', bg: '#f3f4f6' },
}

const formInicial = {
  title: '',
  description: '',
  date: '',
  start_time: '',
  end_time: '',
  location: '',
  hotel: '',
  status: 'proximo',
  referral_goal: '100',
}

export default function AdminEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)
  const [form, setForm] = useState(formInicial)
  const [imagen, setImagen] = useState<File | null>(null)
  const [previsualizacion, setPrevisualizacion] = useState<string>('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarEventos()
  }, [])

  const cargarEventos = async () => {
    try {
      const data = await getEventos()
      setEventos(data)
    } finally {
      setCargando(false)
    }
  }

  const abrirCrear = () => {
    setEventoEditando(null)
    setForm(formInicial)
    setImagen(null)
    setPrevisualizacion('')
    setError('')
    setModalAbierto(true)
  }

  const abrirEditar = (evento: Evento) => {
    setEventoEditando(evento)
    setForm({
      title: evento.title,
      description: evento.description,
      date: evento.date,
      start_time: evento.start_time.slice(0, 5),
      end_time: evento.end_time.slice(0, 5),
      location: evento.location,
      hotel: evento.hotel,
      status: evento.status,
      referral_goal: String(evento.referral_goal),
    })
    setImagen(null)
    setPrevisualizacion(evento.cover_image || '')
    setError('')
    setModalAbierto(true)
  }

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      setImagen(archivo)
      setPrevisualizacion(URL.createObjectURL(archivo))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    setGuardando(true)
    setError('')
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      if (imagen) formData.append('cover_image', imagen)

      if (eventoEditando) {
        const actualizado = await adminEditarEvento(eventoEditando.id, formData)
        setEventos(eventos.map(e => e.id === eventoEditando.id ? actualizado : e))
      } else {
        const nuevo = await adminCrearEvento(formData)
        setEventos([nuevo, ...eventos])
      }
      setModalAbierto(false)
    } catch {
      setError('Error al guardar el evento. Revisa los campos.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este evento?')) return
    await adminEliminarEvento(id)
    setEventos(eventos.filter(e => e.id !== id))
  }

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: '4px',
    display: 'block' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
              Panel de Eventos
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Crea y gestiona los encuentros de la red.
            </p>
          </div>
          <button onClick={abrirCrear} style={{
            background: '#B66878', color: 'white', padding: '10px 24px',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: '700', fontSize: '14px'
          }}>
            + Nuevo Evento
          </button>
        </div>

        {/* Lista */}
        {cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        ) : eventos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📅</p>
            <p style={{ color: '#6b7280' }}>No hay eventos. ¡Crea el primero!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {eventos.map(evento => {
              const cfg = statusConfig[evento.status]
              return (
                <div key={evento.id} style={{
                  background: 'white', borderRadius: '14px', padding: '20px 24px',
                  border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                  {/* Cover mini */}
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '10px', flexShrink: 0,
                    background: evento.cover_image ? 'none' : 'linear-gradient(135deg, #EFC3CA, #B66878)',
                    overflow: 'hidden'
                  }}>
                    {evento.cover_image
                      ? <img src={evento.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🌸</div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        background: cfg.bg, color: cfg.color,
                        fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px'
                      }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontWeight: '700', color: '#111827', fontSize: '15px', margin: '0 0 2px 0' }}>{evento.title}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                      📅 {formatFecha(evento.date)} · 📍 {evento.hotel || evento.location} · 👥 {evento.total_asistentes} confirmadas
                    </p>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => abrirEditar(evento)} style={{
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151'
                    }}>✏️ Editar</button>
                    <button onClick={() => handleEliminar(evento.id)} style={{
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #fee2e2',
                      background: '#fff5f5', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#ef4444'
                    }}>🗑️ Eliminar</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '620px', maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                {eventoEditando ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <button onClick={() => setModalAbierto(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Imagen */}
              <div>
                <label style={labelStyle}>Imagen de portada</label>
                <div style={{
                  border: '2px dashed #e5e7eb', borderRadius: '12px',
                  padding: '16px', textAlign: 'center', cursor: 'pointer',
                  background: '#f9fafb', position: 'relative', overflow: 'hidden',
                  height: previsualizacion ? 'auto' : '100px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {previsualizacion
                    ? <img src={previsualizacion} alt="preview"
                        style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover', width: '100%' }} />
                    : <p style={{ color: '#9ca3af', fontSize: '14px' }}>📷 Haz clic para subir imagen</p>
                  }
                  <input type="file" accept="image/*" onChange={handleImagen}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>

              {/* Título */}
              <div>
                <label style={labelStyle}>Título del evento</label>
                <input name="title" value={form.title} onChange={handleChange}
                  placeholder="Ej. Cumbre de Liderazgo Femenino" style={inputStyle} />
              </div>

              {/* Descripción */}
              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Describe el evento..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>

              {/* Fecha y horas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Fecha</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hora inicio</label>
                  <input type="time" name="start_time" value={form.start_time} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hora fin</label>
                  <input type="time" name="end_time" value={form.end_time} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              {/* Lugar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Ubicación</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="Ej. Tlaxcala Centro" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hotel / Venue</label>
                  <input name="hotel" value={form.hotel} onChange={handleChange}
                    placeholder="Ej. Hotel Posada San Francisco" style={inputStyle} />
                </div>
              </div>

              {/* Status y meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                    <option value="proximo">Próximo</option>
                    <option value="en_curso">En Curso</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Meta de asistentes</label>
                  <input type="number" name="referral_goal" value={form.referral_goal} onChange={handleChange}
                    min="1" style={inputStyle} />
                </div>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

              {/* Botones */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setModalAbierto(false)} style={{
                  padding: '10px 24px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151'
                }}>Cancelar</button>
                <button onClick={handleGuardar} disabled={guardando} style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: '#B66878', color: 'white', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px'
                }}>
                  {guardando ? 'Guardando...' : eventoEditando ? 'Guardar cambios' : 'Crear evento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}