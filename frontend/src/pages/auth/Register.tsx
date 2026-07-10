import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../../api/auth'

export default function Register() {
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    company: '',
    business_sector: '',
    location: '',
    years_leading: '',
  })

  // ── Preview del username (solo visual) ──────────────────────────────────
  // El backend genera el username real a partir de first_name/last_name;
  // esto es únicamente para que la usuaria vea cómo va a quedar antes de
  // confirmar. No se envía como dato editable.
  const [usernamePreview, setUsernamePreview] = useState('')

  useEffect(() => {
    const nombre = form.first_name.trim().replace(/\s+/g, '')
    const apellido = form.last_name.trim().replace(/\s+/g, '')
    const sugerido = `MNW_${nombre}${apellido}`
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
      .replace(/[^a-zA-Z0-9_]/g, '')
    setUsernamePreview(sugerido || 'MNW_...')
  }, [form.first_name, form.last_name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Limpiar error del campo al editar
    if (errors[name]) setErrors(prev => { const c = { ...prev }; delete c[name]; return c })
  }

  // ── Validación local por paso ──────────────────────────────────────────────
  const validarPaso = (): Record<string, string> => {
    const e: Record<string, string> = {}

    if (paso === 1) {
      if (!form.first_name.trim()) e.first_name = 'El nombre es obligatorio'
      if (!form.last_name.trim()) e.last_name = 'El apellido es obligatorio'
      if (!form.email.trim()) {
        e.email = 'El correo es obligatorio'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        e.email = 'Ingresa un correo válido'
      }
      if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s|-/g, ''))) {
        e.phone = 'El teléfono debe tener 10 dígitos'
      }
      if (!form.password) {
        e.password = 'La contraseña es obligatoria'
      } else if (form.password.length < 8) {
        e.password = 'Mínimo 8 caracteres'
      } else if (!/[A-Z]/.test(form.password)) {
        e.password = 'Debe contener al menos una mayúscula'
      } else if (!/[0-9]/.test(form.password)) {
        e.password = 'Debe contener al menos un número'
      }
    }

    if (paso === 2) {
      if (!form.business_sector.trim()) e.business_sector = 'Indica el giro de tu negocio'
      if (!form.location.trim()) e.location = 'Indica tu ciudad o municipio'
      if (!form.years_leading) e.years_leading = 'Selecciona los años liderando'
    }

    return e
  }

  const siguientePaso = () => {
    const e = validarPaso()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setPaso(paso + 1)
  }

  const anteriorPaso = () => { setErrors({}); setPaso(paso - 1) }

  // ── Submit con manejo de errores del backend por campo ────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setErrors({})
    try {
      await register(form)
      setPaso(4)
    } catch (err: any) {
      // El backend devuelve {field: ["mensaje"]} o {detail: "..."}
      if (err?.response) {
        const data = err.response.data
        const mapped: Record<string, string> = {}

        const campoLabel: Record<string, string> = {
          email: 'Correo',
          phone: 'Teléfono',
          password: 'Contraseña',
          first_name: 'Nombre',
          last_name: 'Apellido',
        }

        for (const [campo, mensajes] of Object.entries(data)) {
          const msg = Array.isArray(mensajes) ? mensajes[0] : mensajes as string
          // Traducir mensajes comunes de Django
          if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('ya existe')) {
            mapped[campo] = `${campoLabel[campo] ?? campo} ya está en uso`
          } else if (msg.toLowerCase().includes('unique')) {
            mapped[campo] = `${campoLabel[campo] ?? campo} ya está registrado`
          } else {
            mapped[campo] = msg
          }
        }

        if (Object.keys(mapped).length > 0) {
          setErrors(mapped)
          // Si el error es del paso 1, regresar al paso 1 automáticamente
          const camposPaso1 = ['first_name', 'last_name', 'email', 'phone', 'password']
          if (Object.keys(mapped).some(k => camposPaso1.includes(k))) {
            setPaso(1)
          } else {
            setPaso(2)
          }
        } else if (data.detail) {
          setErrors({ general: data.detail })
        } else {
          setErrors({ general: 'Hubo un error al registrarte. Verifica tus datos.' })
        }
      } else {
        setErrors({ general: 'No se pudo conectar con el servidor.' })
      }
    } finally {
      setCargando(false)
    }
  }

  const pasos = ['Datos Personales', 'Tu Empresa', 'Confirmar']

  // ── Estilos ───────────────────────────────────────────────────────────────
  const inputStyle = (campo: string) => ({
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: `1.5px solid ${errors[campo] ? '#f87171' : '#e5e7eb'}`,
    marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' as const,
    outline: 'none', background: errors[campo] ? '#fff5f5' : 'white',
    transition: 'border-color 0.2s',
  })

  const labelStyle = { fontSize: '13px', fontWeight: '600' as const, color: '#374151' }
  const errorText = (campo: string) =>
    errors[campo] ? <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>{errors[campo]}</p> : null

  const btnPrimary = {
    background: '#B66878', color: 'white', padding: '10px 24px',
    borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontWeight: '700' as const, fontSize: '14px',
  }
  const btnSecondary = {
    background: 'white', color: '#6b7280', padding: '10px 24px',
    borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '14px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', textAlign: 'center', color: '#1f2937' }}>
        Únete a nuestra Red de Liderazgo
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px', textAlign: 'center', fontSize: '14px', maxWidth: '480px' }}>
        Estás a pocos pasos de transformar tu visión empresarial y conectar con las mujeres más influyentes.
      </p>

      {/* Indicador de pasos */}
      {paso < 4 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px' }}>
          {pasos.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: paso > i + 1 ? '#f4f1f1' : paso === i + 1 ? '#B66878' : '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: paso >= i + 1 ? 'white' : '#9ca3af', fontWeight: '700', fontSize: '14px',
                  boxShadow: paso === i + 1 ? '0 0 0 4px rgba(182,104,120,0.2)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {paso > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '11px', color: paso === i + 1 ? '#B66878' : '#9ca3af', fontWeight: paso === i + 1 ? '700' : '400', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < pasos.length - 1 && (
                <div style={{ width: '60px', height: '2px', background: paso > i + 1 ? '#B66878' : '#e5e7eb', margin: '0 8px', marginBottom: '18px', transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', padding: '36px 40px', width: '100%', maxWidth: '580px', boxShadow: '0 4px 24px rgba(182,104,120,0.1)' }}>

        {/* Error general */}
        {errors.general && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '14px' }}>
            ⚠️ {errors.general}
          </div>
        )}

        {/* ── PASO 1 ── */}
        {paso === 1 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>Paso 1: Información Personal</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '13px' }}>Cuéntanos quién eres.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input name="first_name" placeholder="Valentina" onChange={handleChange} value={form.first_name} style={inputStyle('first_name')} />
                {errorText('first_name')}
              </div>
              <div>
                <label style={labelStyle}>Apellido *</label>
                <input name="last_name" placeholder="Sánchez" onChange={handleChange} value={form.last_name} style={inputStyle('last_name')} />
                {errorText('last_name')}
              </div>
              <div>
                <label style={labelStyle}>Correo Electrónico *</label>
                <input name="email" type="email" placeholder="valentina@empresa.com" onChange={handleChange} value={form.email} style={inputStyle('email')} />
                {errorText('email')}
              </div>
              <div>
                <label style={labelStyle}>Teléfono / WhatsApp</label>
                <input name="phone" placeholder="2461234567" onChange={handleChange} value={form.phone} style={inputStyle('phone')} maxLength={15} />
                {errorText('phone')}
              </div>

              {/* Usuario — solo lectura, generado por el backend */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>
                  Tu usuario será
                  <span style={{ fontWeight: '400', color: '#9ca3af', marginLeft: '6px', fontSize: '12px' }}>
                    (se genera automáticamente a partir de tu nombre)
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    readOnly
                    value={usernamePreview}
                    style={{
                      ...inputStyle('username_preview'),
                      paddingLeft: '36px',
                      background: '#f9fafb',
                      color: '#6b7280',
                      cursor: 'not-allowed',
                    }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#B66878', fontSize: '14px', pointerEvents: 'none', marginTop: '2px' }}>@</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>
                  Si ya existe, se le agregará un número automáticamente
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Contraseña *</label>
                <input name="password" type="password" placeholder="Mínimo 8 caracteres, una mayúscula y un número" onChange={handleChange} value={form.password} style={inputStyle('password')} />
                {errorText('password')}
                {/* Barra de fuerza */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4].map(n => {
                        const strength =
                          (form.password.length >= 8 ? 1 : 0) +
                          (/[A-Z]/.test(form.password) ? 1 : 0) +
                          (/[0-9]/.test(form.password) ? 1 : 0) +
                          (/[^a-zA-Z0-9]/.test(form.password) ? 1 : 0)
                        const color = strength >= 4 ? '#9ae7b6' : strength >= 3 ? '#84cc16' : strength >= 2 ? '#f59e0b' : '#ef4444'
                        return <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: n <= strength ? color : '#e5e7eb', transition: 'background 0.3s' }} />
                      })}
                    </div>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      {(() => {
                        const s = (form.password.length >= 8 ? 1 : 0) + (/[A-Z]/.test(form.password) ? 1 : 0) + (/[0-9]/.test(form.password) ? 1 : 0) + (/[^a-zA-Z0-9]/.test(form.password) ? 1 : 0)
                        return s >= 4 ? '🔐 Contraseña muy segura' : s >= 3 ? '🔑 Contraseña segura' : s >= 2 ? '⚠️ Contraseña regular' : '❌ Contraseña débil'
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button type="button" onClick={siguientePaso} style={btnPrimary}>
                Siguiente →
              </button>
            </div>
          </>
        )}

        {/* ── PASO 2 ── */}
        {paso === 2 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>Paso 2: Tu Empresa</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '13px' }}>Cuéntanos sobre tu negocio.</p>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre de tu Empresa</label>
                <input name="company" placeholder="Ej. Liderazgo Textil S.A." onChange={handleChange} value={form.company} style={inputStyle('company')} />
                {errorText('company')}
              </div>

              {/* Campo libre para giro */}
              <div>
                <label style={labelStyle}>Giro / Sector de Negocio *</label>
                <input
                  name="business_sector"
                  placeholder="Ej. Diseño de moda, Consultoría financiera, Agricultura..."
                  onChange={handleChange}
                  value={form.business_sector}
                  style={inputStyle('business_sector')}
                  maxLength={100}
                />
                {errorText('business_sector')}
                <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>Descríbelo con tus propias palabras</p>
              </div>

              {/* Campo libre para ubicación */}
              <div>
                <label style={labelStyle}>Ciudad / Municipio / Estado *</label>
                <input
                  name="location"
                  placeholder="Ej. Apizaco, Tlaxcala · Ciudad de México · Puebla..."
                  onChange={handleChange}
                  value={form.location}
                  style={inputStyle('location')}
                  maxLength={120}
                />
                {errorText('location')}
                <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>No tienes que ser de Tlaxcala para unirte 🌸</p>
              </div>

              <div>
                <label style={labelStyle}>Años liderando tu negocio *</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {[['menos_1', 'Menos de 1 año'], ['1_3', '1 a 3 años'], ['3_5', '3 a 5 años'], ['mas_5', 'Más de 5 años']].map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => { setForm(prev => ({ ...prev, years_leading: val })); setErrors(prev => { const c = { ...prev }; delete c.years_leading; return c }) }}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: '1.5px solid',
                        borderColor: form.years_leading === val ? '#B66878' : '#e5e7eb',
                        background: form.years_leading === val ? '#FDF0F2' : 'white',
                        color: form.years_leading === val ? '#B66878' : '#374151',
                        cursor: 'pointer', fontSize: '13px', fontWeight: form.years_leading === val ? '700' : '400',
                        transition: 'all 0.2s',
                      }}>{label}</button>
                  ))}
                </div>
                {errorText('years_leading')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button type="button" onClick={anteriorPaso} style={btnSecondary}>← Anterior</button>
              <button type="button" onClick={siguientePaso} style={btnPrimary}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ── PASO 3 ── */}
        {paso === 3 && (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>Paso 3: Confirma tu registro</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '13px' }}>Revisa tu información antes de enviar.</p>

            <div style={{ background: '#FDF0F2', borderRadius: '12px', padding: '20px', display: 'grid', gap: '10px', fontSize: '14px' }}>
              {[
                ['Nombre', `${form.first_name} ${form.last_name}`],
                ['Usuario', `@${usernamePreview}`],
                ['Email', form.email],
                ['Teléfono', form.phone || 'No proporcionado'],
                ['Empresa', form.company || 'No proporcionada'],
                ['Giro / Sector', form.business_sector],
                ['Ubicación', form.location],
                ['Años liderando', {
                  menos_1: 'Menos de 1 año', '1_3': '1 a 3 años',
                  '3_5': '3 a 5 años', mas_5: 'Más de 5 años'
                }[form.years_leading] ?? 'No seleccionado'],
              ].map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#B66878', fontWeight: '700', minWidth: '120px', fontSize: '13px' }}>{k as string}</span>
                  <span style={{ color: '#374151' }}>{v as string}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px', textAlign: 'center' }}>
              Tu solicitud será revisada por el equipo de MN WOMAN antes de ser aprobada.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button type="button" onClick={anteriorPaso} style={btnSecondary}>← Anterior</button>
              <button type="submit" disabled={cargando} style={{ ...btnPrimary, opacity: cargando ? 0.7 : 1 }}>
                {cargando ? '⏳ Enviando...' : '✓ Confirmar y unirme'}
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 4 — Éxito ── */}
        {paso === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '52px', marginBottom: '16px' }}>🌸</p>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
              ¡Solicitud enviada!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', maxWidth: '340px', margin: '0 auto 24px' }}>
              Tu solicitud ha sido recibida. El equipo de MN WOMAN la revisará y te notificará cuando sea aprobada.
            </p>
            <Link to="/login" style={{
              display: 'inline-block', background: '#B66878', color: 'white',
              padding: '12px 28px', borderRadius: '10px', textDecoration: 'none',
              fontWeight: '700', fontSize: '14px',
            }}>
              Ir al inicio de sesión
            </Link>
          </div>
        )}
      </div>

      {paso < 4 && (
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#B66878', fontWeight: '600' }}>Inicia sesión</Link>
        </p>
      )}
    </div>
  )
}