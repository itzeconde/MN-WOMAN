import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { updatePerfil, getPerfil } from '../../api/usuarios'

// ─── tipos ─────────────────────────────────────────────────────────────────────

interface PerfilForm {
  first_name: string
  last_name: string
  phone: string
  company: string
  business_sector: string
  location: string
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
  { val: '1_3',     label: '1 a 3' },
  { val: '3_5',     label: '3 a 5' },
  { val: 'mas_5',   label: 'Más de 5' },
]

const FORM_VACIO: PerfilForm = {
  first_name: '', last_name: '', phone: '', company: '',
  business_sector: '', location: '', years_leading: '',
  bio: '', linkedin: '', instagram: '', twitter: '', website: '',
}

// Nombres de campo → etiqueta legible, para mostrar errores del backend
// de forma entendible (ej. "phone" -> "Teléfono / WhatsApp") en vez del
// nombre técnico del modelo.
const ETIQUETAS_CAMPO: Record<string, string> = {
  first_name: 'Nombre',
  last_name: 'Apellido',
  phone: 'Teléfono / WhatsApp',
  company: 'Empresa',
  business_sector: 'Sector',
  location: 'Ubicación',
  years_leading: 'Años liderando tu negocio',
  bio: 'Trayectoria y visión',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  website: 'Sitio web',
  profile_picture: 'Foto de perfil',
}

// Convierte el objeto que regresa el backend (UserSerializer/PerfilSerializer)
// al shape del formulario. Se usa tanto al cargar el perfil como al guardar,
// para no repetir el mapeo dos veces y para que ambos casos queden idénticos.
const mapUsuarioAForm = (data: any): PerfilForm => ({
  first_name:      data.first_name      || '',
  last_name:       data.last_name        || '',
  phone:           data.phone            || '',
  company:         data.company          || '',
  business_sector: data.business_sector  || '',
  location:        data.location         || '',
  years_leading:   data.years_leading    || '',
  bio:             data.bio              || '',
  linkedin:        data.linkedin         || '',
  instagram:       data.instagram        || '',
  twitter:         data.twitter          || '',
  website:         data.website          || '',
})

// Convierte la respuesta de error de axios/DRF en un mensaje legible.
// DRF regresa algo como { phone: ["El teléfono debe tener 10 dígitos..."] }
// cuando falla la validación de un campo específico — este helper toma
// ese detalle en vez de mostrar siempre el mismo mensaje genérico.
const construirMensajeError = (err: any): string => {
  const detalle = err?.response?.data
  if (detalle && typeof detalle === 'object' && !Array.isArray(detalle)) {
    const primerCampo = Object.keys(detalle)[0]
    if (primerCampo) {
      const valor = detalle[primerCampo]
      const mensaje = Array.isArray(valor) ? valor[0] : String(valor)
      const etiqueta = ETIQUETAS_CAMPO[primerCampo] || primerCampo
      return `${etiqueta}: ${mensaje}`
    }
  }
  return 'Hubo un error al guardar los cambios. Intenta de nuevo.'
}

// ─── estilos ───────────────────────────────────────────────────────────────────
// Mismo lenguaje visual que el resto de la app: acento #B66878, bordes
// redondeados generosos, transiciones suaves y foco rosa en vez del azul
// por defecto del navegador.

const inputBaseStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: '10px',
  border: '1.5px solid #e5e7eb', fontSize: '14px',
  boxSizing: 'border-box', marginTop: '4px',
  background: 'white', color: '#111827',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: '600', color: '#6b7280',
}

const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: '18px', padding: '26px 24px',
  boxShadow: '0 1px 4px rgba(182,104,120,0.06)',
  border: '1px solid #f0e6e9', marginBottom: '20px',
}

const tituloSeccion: React.CSSProperties = {
  fontSize: '13px', fontWeight: '700', color: '#0f0a0b',
  marginBottom: '16px', borderBottom: '1px solid #f3e8ea',
  paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em',
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  padding: '5px 14px', borderRadius: '100px',
  background: '#fdf2f4', color: '#B66878',
  fontSize: '13px', fontWeight: '600', border: '1px solid #EFC3CA',
}

// Clase CSS global (definida abajo en <style>) para el foco rosa consistente
// en inputs, selects y textareas sin repetir onFocus/onBlur en cada campo.
const CAMPO_CLASS = 'campo-formulario'

// ─── subcomponentes (fuera de Perfil) ──────────────────────────────────────────
// IMPORTANTE: estos componentes viven fuera del componente Perfil a propósito.
// Si se definen dentro de la función Perfil, React los recrea como un tipo de
// componente nuevo en cada render, lo que fuerza a desmontar y volver a montar
// el <input> del DOM en cada tecla — y por eso el campo perdía el foco después
// de cada carácter. Al vivir afuera, React los reconoce como el mismo
// componente entre renders y el input conserva el foco normalmente.

const Campo = ({ label, valor }: { label: string; valor?: string }) => (
  <div style={{ marginBottom: '4px' }}>
    <p style={{ ...labelStyle, marginBottom: '2px' }}>{label}</p>
    <p style={{ fontSize: '15px', color: valor ? '#111827' : '#9ca3af', margin: 0, fontStyle: valor ? 'normal' : 'italic' }}>
      {valor || 'Sin capturar'}
    </p>
  </div>
)

const Avatar = ({ size = 90, previsualizacion, inicial }: { size?: number; previsualizacion: string; inicial: string }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: '#EFC3CA', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700',
    color: '#B66878', overflow: 'hidden', flexShrink: 0,
    border: '3px solid #B66878',
    boxShadow: '0 6px 16px rgba(182,104,120,0.15)',
  }}>
    {previsualizacion
      ? <img src={previsualizacion} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      : inicial || '?'
    }
  </div>
)

const VistaLectura = ({ form, previsualizacion }: { form: PerfilForm; previsualizacion: string }) => (
  <>
    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '24px' }}>
      <Avatar size={90} previsualizacion={previsualizacion} inicial={form.first_name?.charAt(0) || '?'} />
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f0a0b', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          {form.first_name || form.last_name
            ? `${form.first_name} ${form.last_name}`
            : 'Sin nombre capturado'}
        </h2>
        {form.company && (
          <p style={{ fontSize: '15px', color: '#7a6870', margin: '0 0 8px' }}>
            {form.company}
            {form.business_sector && ` · ${SECTORES[form.business_sector] ?? form.business_sector}`}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {form.location && (
            <span style={badgeStyle}>📍 {MUNICIPIOS[form.location] ?? form.location}</span>
          )}
          {form.years_leading && (
            <span style={badgeStyle}>
              🕐 {ANIOS.find(a => a.val === form.years_leading)?.label} años
            </span>
          )}
        </div>
      </div>
    </div>

    {form.bio && (
      <div style={cardStyle}>
        <h3 style={tituloSeccion}>🎯 Trayectoria y visión</h3>
        <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{form.bio}</p>
      </div>
    )}

    <div style={cardStyle}>
      <h3 style={tituloSeccion}>📞 Contacto</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Campo label="Teléfono / WhatsApp" valor={form.phone} />
        <Campo label="Sitio web" valor={form.website} />
      </div>
    </div>

    <div style={cardStyle}>
      <h3 style={tituloSeccion}>🔗 Conexión profesional</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Campo label="LinkedIn"    valor={form.linkedin} />
        <Campo label="Instagram"   valor={form.instagram} />
        <Campo label="Twitter / X" valor={form.twitter} />
      </div>
    </div>
  </>
)

interface VistaEdicionProps {
  form: PerfilForm
  previsualizacion: string
  error: string
  cargando: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onFoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAnioClick: (val: string) => void
  onCancelar: () => void
  onSubmit: (e: React.FormEvent) => void
}

const VistaEdicion = ({
  form, previsualizacion, error, cargando,
  onChange, onFoto, onAnioClick, onCancelar, onSubmit,
}: VistaEdicionProps) => (
  <form onSubmit={onSubmit}>

    {/* Foto */}
    <div style={cardStyle}>
      <h3 style={tituloSeccion}>📸 Foto de Perfil</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Avatar size={90} previsualizacion={previsualizacion} inicial={form.first_name?.charAt(0) || '?'} />
        <div>
          <label htmlFor="foto" style={{
            display: 'inline-block',
            background: '#B66878', color: 'white', padding: '9px 22px',
            borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
            transition: 'background 0.15s ease',
          }}>
            Subir foto
          </label>
          <input id="foto" type="file" accept="image/*" onChange={onFoto} style={{ display: 'none' }} />
          <p style={{ color: '#9a7880', fontSize: '13px', marginTop: '8px' }}>JPG, PNG. Máximo 2MB.</p>
        </div>
      </div>
    </div>

    {/* Datos personales */}
    <div style={cardStyle}>
      <h3 style={tituloSeccion}>👤 Datos Personales</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input name="first_name" value={form.first_name} onChange={onChange} className={CAMPO_CLASS} style={inputBaseStyle} />
        </div>
        <div>
          <label style={labelStyle}>Apellido</label>
          <input name="last_name" value={form.last_name} onChange={onChange} className={CAMPO_CLASS} style={inputBaseStyle} />
        </div>
        <div>
          <label style={labelStyle}>Teléfono / WhatsApp</label>
          <input name="phone" value={form.phone} onChange={onChange} placeholder="246 123 4567" className={CAMPO_CLASS} style={inputBaseStyle} />
          <p style={{ fontSize: '12px', color: '#9a7880', marginTop: '4px' }}>
            10 dígitos, con o sin lada 52. Puedes escribir espacios o guiones, se limpian solos.
          </p>
        </div>
      </div>
    </div>

    {/* Empresa */}
    <div style={cardStyle}>
      <h3 style={tituloSeccion}>🏢 Mi Empresa</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nombre de la Empresa</label>
          <input name="company" value={form.company} onChange={onChange} className={CAMPO_CLASS} style={inputBaseStyle} />
        </div>
        <div>
          <label style={labelStyle}>Sector</label>
          <select name="business_sector" value={form.business_sector} onChange={onChange} className={CAMPO_CLASS} style={inputBaseStyle}>
            <option value="">Selecciona un sector</option>
            {Object.entries(SECTORES).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ubicación</label>
          <select name="location" value={form.location} onChange={onChange} className={CAMPO_CLASS} style={inputBaseStyle}>
            <option value="">Selecciona un municipio</option>
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
                onClick={() => onAnioClick(val)}
                style={{
                  padding: '9px 18px', borderRadius: '100px', border: '1.5px solid',
                  borderColor: form.years_leading === val ? '#B66878' : '#e5e7eb',
                  background: form.years_leading === val ? '#fdf2f4' : 'white',
                  color: form.years_leading === val ? '#B66878' : '#374151',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                  transition: 'all 0.15s ease',
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
      <textarea name="bio" value={form.bio} onChange={onChange}
        placeholder="Describe tu trayectoria, visión y lo que ofreces a la red..."
        rows={4} className={CAMPO_CLASS} style={{ ...inputBaseStyle, resize: 'vertical' }}
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
              onChange={onChange}
              placeholder={placeholder}
              className={CAMPO_CLASS}
              style={inputBaseStyle}
            />
          </div>
        ))}
      </div>
    </div>

    {error && (
      <div style={{
        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
        padding: '12px 16px', marginBottom: '16px',
      }}>
        <p style={{ color: '#dc2626', fontSize: '14px', margin: 0, fontWeight: '500' }}>
          ⚠️ {error}
        </p>
      </div>
    )}

    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
      <button type="button" onClick={onCancelar}
        style={{
          padding: '12px 24px', borderRadius: '10px', border: '1px solid #e5e7eb',
          background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '15px',
          color: '#374151', transition: 'background 0.15s ease',
        }}>
        Cancelar
      </button>
      <button type="submit" disabled={cargando}
        style={{
          background: '#B66878', color: 'white', padding: '12px 32px', borderRadius: '10px',
          border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px',
          opacity: cargando ? 0.7 : 1, transition: 'opacity 0.15s ease',
        }}>
        {cargando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  </form>
)

// ─── componente principal ──────────────────────────────────────────────────────

export default function Perfil() {
  const location = useLocation()

  const [modoEdicion, setModoEdicion] = useState<boolean>(
    (location.state as { editar?: boolean } | null)?.editar ?? false
  )
  const [cargando, setCargando]       = useState(false)
  const [guardado, setGuardado]       = useState(false)
  const [error, setError]             = useState('')
  const [fotoPerfil, setFotoPerfil]   = useState<File | null>(null)
  const [previsualizacion, setPrevisualizacion] = useState<string>('')
  const [form, setForm]               = useState<PerfilForm>({ ...FORM_VACIO })
  const [formGuardado, setFormGuardado] = useState<PerfilForm>({ ...FORM_VACIO })

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getPerfil()
        const parsed = mapUsuarioAForm(data)
        setForm(parsed)
        setFormGuardado(parsed)
        if (data.profile_picture) setPrevisualizacion(data.profile_picture)
      } catch (err) {
        console.error(err)
      }
    }
    cargar()
  }, [])

  // Cada vez que aparece el mensaje de éxito, se oculta solo después de unos
  // segundos para que no se quede pegado indefinidamente en pantalla.
  useEffect(() => {
    if (!guardado) return
    const timer = setTimeout(() => setGuardado(false), 5000)
    return () => clearTimeout(timer)
  }, [guardado])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleAnioClick = (val: string) => setForm(prev => ({ ...prev, years_leading: val }))

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      setFotoPerfil(archivo)
      setPrevisualizacion(URL.createObjectURL(archivo))
    }
  }

  const handleCancelar = () => {
    setForm({ ...formGuardado })
    setFotoPerfil(null)
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

      // updatePerfil ya regresa la instancia guardada real (PerfilSerializer
      // serializa el objeto después del save en BD), así que se usa esa
      // respuesta como fuente de verdad en vez de asumir que se guardó
      // exactamente lo que se mandó.
      const actualizado = await updatePerfil(formData)
      const parsed = mapUsuarioAForm(actualizado)

      setForm(parsed)
      setFormGuardado(parsed)
      setFotoPerfil(null)
      if (actualizado.profile_picture) setPrevisualizacion(actualizado.profile_picture)

      setGuardado(true)
      setModoEdicion(false)

      // El botón de guardar está al fondo del formulario; sin este scroll
      // el mensaje de confirmación queda arriba, fuera de vista, y parece
      // que nunca aparece.
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setError(construirMensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        .${CAMPO_CLASS}:focus {
          border-color: #B66878 !important;
          box-shadow: 0 0 0 3px rgba(182,104,120,0.12);
        }
        .${CAMPO_CLASS}::placeholder {
          color: #c4b6ba;
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f0a0b', marginBottom: '4px', letterSpacing: '-0.01em' }}>Mi Perfil</h1>
            <p style={{ color: '#7a6870', fontSize: '15px', margin: 0 }}>
              {modoEdicion
                ? 'Edita tu información y guarda los cambios.'
                : 'Tu información visible en la red de empresarias.'}
            </p>
          </div>
          {!modoEdicion && (
            <button
              onClick={() => setModoEdicion(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid #EFC3CA', background: 'white',
                cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                color: '#B66878', boxShadow: '0 1px 3px rgba(182,104,120,0.08)',
                transition: 'background 0.15s ease',
              }}
            >
              ✏️ Editar perfil
            </button>
          )}
        </div>

        {guardado && !modoEdicion && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
            padding: '12px 16px', marginBottom: '16px',
          }}>
            <p style={{ color: '#16a34a', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              ✓ Perfil actualizado correctamente.
            </p>
          </div>
        )}

        {modoEdicion
          ? (
            <VistaEdicion
              form={form}
              previsualizacion={previsualizacion}
              error={error}
              cargando={cargando}
              onChange={handleChange}
              onFoto={handleFoto}
              onAnioClick={handleAnioClick}
              onCancelar={handleCancelar}
              onSubmit={handleSubmit}
            />
          )
          : <VistaLectura form={form} previsualizacion={previsualizacion} />
        }
      </div>
    </div>
  )
}