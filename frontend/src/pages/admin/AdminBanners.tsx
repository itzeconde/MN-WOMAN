import { useState, useEffect, useRef } from 'react'

const API_BASE = 'http://127.0.0.1:8000/api'

interface Banner {
  id: number
  titulo: string
  imagen_url: string | null
  url_destino: string
  activo: boolean
  fecha_inicio: string
  fecha_fin: string
  posicion: string
  posicion_display: string
  esta_vigente: boolean
  creado_en: string
}

const POSICIONES: Record<string, string> = {
  landing_pre_footer:      'Landing — Antes del Footer',
  landing_entre_secciones: 'Landing — Entre Secciones',
  directorio:              'Directorio de Miembros',
  dashboard:               'Dashboard / Home del Usuario',
  global:                  'Todas las Páginas',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid #e5e7eb', fontSize: '14px',
  boxSizing: 'border-box', color: '#111827', background: 'white',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px',
}

interface FormState {
  titulo: string
  url_destino: string
  activo: boolean
  fecha_inicio: string
  fecha_fin: string
  posicion: string
  imagen: File | null
}

const FORM_VACIO: FormState = {
  titulo: '', url_destino: '', activo: true,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: '', posicion: 'landing_pre_footer', imagen: null,
}

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
})

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Banner | null>(null)
  const [form, setForm] = useState<FormState>({ ...FORM_VACIO })
  const [previewImagen, setPreviewImagen] = useState<string>('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const cargarBanners = async () => {
    setCargando(true)
    try {
      const res = await fetch(`${API_BASE}/banners/admin/`, { headers: getHeaders() })
      const data = await res.json()
      setBanners(Array.isArray(data) ? data : (data.results ?? []))
    } catch {
      console.error('Error al cargar banners')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarBanners() }, [])

  const abrirCrear = () => {
    setEditando(null)
    setForm({ ...FORM_VACIO })
    setPreviewImagen('')
    setError('')
    setModalAbierto(true)
  }

  const abrirEditar = (banner: Banner) => {
    setEditando(banner)
    setForm({
      titulo:      banner.titulo,
      url_destino: banner.url_destino,
      activo:      banner.activo,
      fecha_inicio: banner.fecha_inicio,
      fecha_fin:   banner.fecha_fin,
      posicion:    banner.posicion,
      imagen:      null,
    })
    setPreviewImagen(banner.imagen_url || '')
    setError('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditando(null)
    setError('')
  }

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      setForm(f => ({ ...f, imagen: archivo }))
      setPreviewImagen(URL.createObjectURL(archivo))
    }
  }

  const handleGuardar = async () => {
    if (!form.titulo.trim())      { setError('El título es requerido.'); return }
    if (!form.url_destino.trim()) { setError('La URL de destino es requerida.'); return }
    if (!form.fecha_fin)          { setError('La fecha de fin es requerida.'); return }
    if (!editando && !form.imagen){ setError('La imagen es requerida.'); return }

    setGuardando(true)
    setError('')

    const fd = new FormData()
    fd.append('titulo',       form.titulo)
    fd.append('url_destino',  form.url_destino)
    fd.append('activo',       String(form.activo))
    fd.append('fecha_inicio', form.fecha_inicio)
    fd.append('fecha_fin',    form.fecha_fin)
    fd.append('posicion',     form.posicion)
    if (form.imagen) fd.append('imagen', form.imagen)

    try {
      const url    = editando ? `${API_BASE}/banners/admin/${editando.id}/` : `${API_BASE}/banners/admin/`
      const method = editando ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: getHeaders(), body: fd })

      if (!res.ok) {
        const err = await res.json()
        setError(JSON.stringify(err))
        return
      }

      await cargarBanners()
      cerrarModal()
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este banner?')) return
    await fetch(`${API_BASE}/banners/admin/${id}/`, { method: 'DELETE', headers: getHeaders() })
    await cargarBanners()
  }

  const handleToggleActivo = async (banner: Banner) => {
    const fd = new FormData()
    fd.append('activo', String(!banner.activo))
    await fetch(`${API_BASE}/banners/admin/${banner.id}/`, { method: 'PATCH', headers: getHeaders(), body: fd })
    await cargarBanners()
  }

  const badgeVigente = (banner: Banner) => {
    if (!banner.activo) return { label: 'Inactivo', bg: '#f3f4f6', color: '#9ca3af' }
    if (banner.esta_vigente) return { label: 'Activo', bg: '#dcfce7', color: '#16a34a' }
    return { label: 'Fuera de fecha', bg: '#fef9c3', color: '#ca8a04' }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
            Publicidad / Banners
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Gestiona los banners publicitarios que aparecen en la plataforma.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          style={{
            background: '#B66878', color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: '10px', fontWeight: '700',
            fontSize: '14px', cursor: 'pointer',
          }}
        >
          + Nuevo banner
        </button>
      </div>

      {/* Lista */}
      {cargando ? (
        <p style={{ color: '#9ca3af' }}>Cargando banners...</p>
      ) : banners.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px', background: 'white',
          borderRadius: '16px', border: '1px solid #f3f4f6',
        }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📢</p>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>No hay banners creados todavía.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {banners.map(banner => {
            const badge = badgeVigente(banner)
            return (
              <div
                key={banner.id}
                style={{
                  background: 'white', borderRadius: '16px', padding: '20px 24px',
                  border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '20px',
                }}
              >
                <div style={{
                  width: '80px', height: '80px', borderRadius: '10px',
                  overflow: 'hidden', flexShrink: 0, background: '#FDF0F2',
                  border: '1px solid #f3e8ea',
                }}>
                  {banner.imagen_url
                    ? <img src={banner.imagen_url} alt={banner.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📢</div>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>{banner.titulo}</p>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '2px 10px',
                      borderRadius: '20px', background: badge.bg, color: badge.color,
                    }}>{badge.label}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>
                    📍 {banner.posicion_display}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    🗓 {banner.fecha_inicio} → {banner.fecha_fin}
                    &nbsp;·&nbsp;
                    <a href={banner.url_destino} target="_blank" rel="noreferrer" style={{ color: '#B66878' }}>
                      {banner.url_destino}
                    </a>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleActivo(banner)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                      color: banner.activo ? '#ef4444' : '#16a34a',
                    }}
                  >
                    {banner.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => abrirEditar(banner)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(banner.id)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1px solid #fee2e2',
                      background: '#fff5f5', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#ef4444',
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '540px', maxHeight: '90vh',
            overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
              {editando ? 'Editar banner' : 'Nuevo banner'}
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>

              <div>
                <label style={labelStyle}>Título del banner</label>
                <input
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Banner de Ana García - Boutique Flores"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>URL de destino (página del anunciante)</label>
                <input
                  value={form.url_destino}
                  onChange={e => setForm(f => ({ ...f, url_destino: e.target.value }))}
                  placeholder="https://www.su-pagina.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>¿Dónde aparece?</label>
                <select
                  value={form.posicion}
                  onChange={e => setForm(f => ({ ...f, posicion: e.target.value }))}
                  style={inputStyle}
                >
                  {Object.entries(POSICIONES).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Fecha de inicio</label>
                  <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fecha de fin</label>
                  <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Imagen del banner</label>
                {previewImagen && (
                  <img
                    src={previewImagen}
                    alt="Preview"
                    style={{
                      width: '100%', height: '140px', objectFit: 'cover',
                      borderRadius: '10px', marginBottom: '10px',
                      border: '1px solid #f3e8ea',
                    }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label
                    htmlFor="banner-img"
                    style={{
                      background: '#B66878', color: 'white', padding: '8px 18px',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                    }}
                  >
                    {previewImagen ? 'Cambiar imagen' : 'Subir imagen'}
                  </label>
                  <input
                    id="banner-img"
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handleImagen}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>JPG, PNG. Máx 2MB.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="activo"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#B66878' }}
                />
                <label htmlFor="activo" style={{ ...labelStyle, margin: 0 }}>Banner activo</label>
              </div>

              {error && (
                <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={cerrarModal}
                style={{
                  padding: '10px 24px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                style={{
                  background: '#B66878', color: 'white', border: 'none',
                  padding: '10px 28px', borderRadius: '10px', fontWeight: '700',
                  fontSize: '14px', cursor: guardando ? 'not-allowed' : 'pointer',
                  opacity: guardando ? 0.7 : 1,
                }}
              >
                {guardando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Crear banner')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}