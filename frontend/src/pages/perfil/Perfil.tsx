import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { updatePerfil, getPerfil } from '../../api/usuarios'

// ─── tipos ────────────────────────────────────────────────────────────────────

interface PerfilForm {
  first_name: string
  last_name: string
  phone: string
  company: string
  business_sector: string
  municipality: string
  years_leading: string
  bio: string
  linkedin: string
  instagram: string
  twitter: string
  website: string
}

const SECTORES: Record<string, string> = {
  textil: 'Textil y Confección',
  arte: 'Arte y Diseño',
  logistica: 'Logística y Transporte',
  tecnologia: 'Tecnología e IT',
  financiero: 'Servicios Financieros',
  educacion: 'Educación',
  salud: 'Salud y Bienestar',
  agricultura: 'Agricultura Sostenible',
}

const MUNICIPIOS: Record<string, string> = {
  tlaxcala_centro: 'Tlaxcala Centro',
  apizaco: 'Apizaco',
  huamantla: 'Huamantla',
  chiautempan: 'Chiautempan',
  tlaxco: 'Tlaxco',
  zacatelco: 'Zacatelco',
}

const ANIOS: { val: string; label: string }[] = [
  { val: 'menos_1', label: 'Menos de 1' },
  { val: '1_3', label: '1 a 3' },
  { val: '3_5', label: '3 a 5' },
  { val: 'mas_5', label: 'Más de 5' },
]

const FORM_VACIO: PerfilForm = {
  first_name: '', last_name: '', phone: '', company: '',
  business_sector: '', municipality: '', years_leading: '',
  bio: '', linkedin: '', instagram: '', twitter: '', website: '',
}

// ─── estilos reutilizables ────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '14px',
  boxSizing: 'border-box',
  marginTop: '4px',
  background: 'white',
  color: '#111827',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#6b7280',
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
  fontSize: '14px',
  fontWeight: '700',
  color: '#111827',
  marginBottom: '16px',
  borderBottom: '1px solid #f3f4f6',
  paddingBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

// ─── componente auxiliar: campo de solo lectura ───────────────────────────────

const Campo = ({ label, valor }: { label: string; valor?: string }) => (
  <div style={{ marginBottom: '4px' }}>
    <p style={{ ...labelStyle, marginBottom: '2px' }}>{label}</p>
    <p style={{ fontSize: '15px', color: valor ? '#111827' : '#9ca3af', margin: 0, fontStyle: valor ? 'normal' : 'italic' }}>
      {valor || 'Sin capturar'}
    </p>
  </div>
)

// ─── componente principal ─────────────────────────────────────────────────────

export default function Perfil() {
  const location = useLocation()

  // Si viene desde Navbar con { state: { editar: true } } abre directo en edición
  const [modoEdicion, setModoEdicion] = useState<boolean>(
    (location.state as { editar?: boolean } | null)?.editar ?? false
  )

  const [cargando, setCargando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [previsualizacion, setPrevisualizacion] = useState<string>('')

  const [form, setForm] = useState<PerfilForm>({ ...FORM_VACIO })
  // Copia para restaurar si el usuario cancela
  const [formGuardado, setFormGuardado] = useState<PerfilForm>({ ...FORM_VACIO })

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getPerfil()
        const parsed: PerfilForm = {
          first_name:      data.first_name      || '',
          last_name:       data.last_name        || '',
          phone:           data.phone            || '',
          company:         data.company          || '',
          business_sector: data.business_sector  || '',
          municipality:    data.municipality     || '',
          years_leading:   data.years_leading    || '',
          bio:             data.bio              || '',
          linkedin:        data.linkedin         || '',
          instagram:       data.instagram        || '',
          twitter:         data.twitter          || '',
          website:         data.website          || '',
        }
        setForm(parsed)
        setFormGuardado(parsed)
        if (data.profile_picture) setPrevisualizacion(data.profile_picture)
      } catch (err) {
        console.error(err)
      }
    }
    cargar()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      setFotoPerfil(archivo)
      setPrevisualizacion(URL.createObjectURL(archivo))
    }
  }

  const handleCancelar = () => {
    setForm({ ...formGuardado })   // restaura cambios no guardados
    setError('')
    setModoEdicion(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setGuardado(false)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      if (fotoPerfil) formData.append('profile_picture', fotoPerfil)
      await updatePerfil(formData)
      setFormGuardado({ ...form })  // actualiza la copia de referencia
      setGuardado(true)
      setModoEdicion(false)
    } catch {
      setError('Hubo un error al guardar los cambios.')
    } finally {
      setCargando(false)
    }
  }

  // ─── avatar ────────────────────────────────────────────────────────────────

  const Avatar = ({ size = 90 }: { size?: number }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#EFC3CA', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700',
      color: '#B66878', overflow: 'hidden', flexShrink: 0,
      border: '3px solid #B66878',
    }}>
      {previsualizacion
        ? <img src={previsualizacion} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : form.first_name?.charAt(0) || '?'
      }
    </div>
  )

  // ─── vista solo lectura ────────────────────────────────────────────────────

  const VistaLectura = () => (
    <>
      {/* Hero del perfil */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Avatar size={90} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>
            {form.first_name || form.last_name
              ? `${form.first_name} ${form.last_name}`
              : 'Sin nombre capturado'}
          </h2>
          {form.company && (
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 8px' }}>
              {form.company}
              {form.business_sector && ` · ${SECTORES[form.business_sector] ?? form.business_sector}`}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {form.municipality && (
              <span style={badgeStyle}>📍 {MUNICIPIOS[form.municipality] ?? form.municipality}</span>
            )}
            {form.years_leading && (
              <span style={badgeStyle}>
                🕐 {ANIOS.find(a => a.val === form.years_leading)?.label} años
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {form.bio && (
        <div style={cardStyle}>
          <h3 style={tituloSeccion}>🎯 Trayectoria y visión</h3>
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>
            {form.bio}
          </p>
        </div>
      )}

      {/* Contacto */}
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>📞 Contacto</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Campo label="Teléfono / WhatsApp" valor={form.phone} />
          <Campo label="Sitio web" valor={form.website} />
        </div>
      </div>

      {/* Redes */}
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>🔗 Conexión profesional</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Campo label="LinkedIn" valor={form.linkedin} />
          <Campo label="Instagram" valor={form.instagram} />
          <Campo label="Twitter / X" valor={form.twitter} />
        </div>
      </div>
    </>
  )

  // ─── vista edición ─────────────────────────────────────────────────────────

  const VistaEdicion = () => (
    <form onSubmit={handleSubmit}>

      {/* Foto */}
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>📸 Foto de Perfil</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Avatar size={90} />
          <div>
            <label htmlFor="foto" style={{
              background: '#B66878', color: 'white', padding: '8px 20px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            }}>
              Subir foto
            </label>
            <input id="foto" type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>JPG, PNG. Máximo 2MB.</p>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>👤 Datos Personales</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Apellido</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Teléfono / WhatsApp</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="246 123 4567" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Empresa */}
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>🏢 Mi Empresa</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Nombre de la Empresa</label>
            <input name="company" value={form.company} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sector</label>
            <select name="business_sector" value={form.business_sector} onChange={handleChange} style={inputStyle}>
              <option value="">Selecciona un sector</option>
              {Object.entries(SECTORES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Municipio</label>
            <select name="municipality" value={form.municipality} onChange={handleChange} style={inputStyle}>
              <option value="">Selecciona tu municipio</option>
              {Object.entries(MUNICIPIOS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Años liderando tu negocio</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
              {ANIOS.map(({ val, label }) => (
                <button key={val} type="button"
                  onClick={() => setForm({ ...form, years_leading: val })}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid',
                    borderColor: form.years_leading === val ? '#B66878' : '#e5e7eb',
                    background: form.years_leading === val ? '#fdf2f4' : 'white',
                    color: form.years_leading === val ? '#B66878' : '#374151',
                    cursor: 'pointer', fontSize: '14px',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>🎯 Trayectoria y Visión</h3>
        <label style={labelStyle}>Cuéntanos sobre ti y tu negocio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange}
          placeholder="Describe tu trayectoria, visión y lo que ofreces a la red..."
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Redes */}
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>🔗 Conexión Profesional</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { name: 'linkedin',  label: 'LinkedIn',    placeholder: 'https://linkedin.com/in/tu-perfil' },
            { name: 'instagram', label: 'Instagram',   placeholder: '@tu_usuario' },
            { name: 'twitter',   label: 'Twitter / X', placeholder: '@tu_usuario' },
            { name: 'website',   label: 'Sitio Web',   placeholder: 'https://tu-sitio.com' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name}
                value={form[name as keyof PerfilForm]}
                onChange={handleChange}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {error   && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" onClick={handleCancelar}
          style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '15px', color: '#374151' }}>
          Cancelar
        </button>
        <button type="submit" disabled={cargando}
          style={{ background: '#B66878', color: 'white', padding: '12px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px', opacity: cargando ? 0.7 : 1 }}>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
              Mi Perfil
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              {modoEdicion
                ? 'Edita tu información y guarda los cambios.'
                : 'Tu información visible en la red de empresarias.'}
            </p>
          </div>

          {/* Botón de acción principal */}
          {!modoEdicion ? (
            <button
              onClick={() => setModoEdicion(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              ✏️ Editar perfil
            </button>
          ) : null}
        </div>

        {/* Mensaje de éxito (fuera del form, persiste al volver a vista) */}
        {guardado && !modoEdicion && (
          <p style={{ color: '#22c55e', fontSize: '14px', marginBottom: '16px' }}>
            ✓ Perfil actualizado correctamente.
          </p>
        )}

        {modoEdicion ? <VistaEdicion /> : <VistaLectura />}

      </div>
    </div>
  )
}

// ─── estilos locales ──────────────────────────────────────────────────────────

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 12px',
  borderRadius: '20px',
  background: '#fdf2f4',
  color: '#B66878',
  fontSize: '13px',
  fontWeight: '500',
  border: '1px solid #EFC3CA',
}