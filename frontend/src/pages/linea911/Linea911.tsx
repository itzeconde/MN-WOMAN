import { useState } from 'react'
import { Heart, Shield, Scale, AlertTriangle, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'

const instituciones = [
  {
    nombre: 'INMUJERES Tlaxcala',
    descripcion: 'Instituto estatal que atiende casos de violencia de género, orientación legal y psicológica para mujeres.',
    quePasaCuando: 'Cuando llegas, una trabajadora social te recibe de forma confidencial y te orienta sin juzgarte.',
    telefono: '246 465 2960',
    horario: 'Lun-Vie: 8:00 - 17:00',
    direccion: 'Ex Fábrica de San Manuel, Tlaxcala',
  },
  {
    nombre: 'DIF Tlaxcala',
    descripcion: 'Desarrollo Integral de la Familia. Apoyo emocional, contención en crisis y acompañamiento familiar.',
    quePasaCuando: 'Puedes llegar sin cita. Te atienden psicólogas y trabajadoras sociales disponibles todo el día.',
    telefono: '246 465 0440',
    horario: 'Lun-Dom: 24 horas',
    direccion: 'Calle Morelos 4, Centro, Tlaxcala',
  },
  {
    nombre: 'Fiscalía General del Estado (FGE)',
    descripcion: 'Para denuncias formales de violencia, acoso o cualquier delito. Tu denuncia tiene validez legal.',
    quePasaCuando: 'Puedes denunciar de forma anónima si lo prefieres. Hay agentes especializadas en delitos contra mujeres.',
    telefono: '246 465 0500',
    horario: 'Emergencias: 24 horas',
    direccion: 'Libramiento Poniente s/n, Tlaxcala',
  },
  {
    nombre: 'Refugio Temporal La Esperanza',
    descripcion: 'Espacio seguro y confidencial para mujeres y sus hijos que necesitan salir de una situación de riesgo.',
    quePasaCuando: 'La ubicación es confidencial. El acceso es inmediato y no necesitas documentos para ingresar.',
    telefono: '246 123 4567',
    horario: 'Acceso inmediato 24/7',
    direccion: 'Ubicación confidencial (llama primero)',
  },
]

const situaciones = [
  {
    Icono: Shield,
    titulo: 'Violencia doméstica',
    descripcion: 'Maltrato físico, emocional o económico dentro del hogar.',
    instituciones: ['INMUJERES Tlaxcala', 'Refugio Temporal La Esperanza'],
    bg: '#f5f3fa', border: '#d9d0ea', icoBg: '#ebe6f5', icoColor: '#8a7aab', actBorder: '#8a7aab',
  },
  {
    Icono: Heart,
    titulo: 'Apoyo emocional',
    descripcion: 'Necesitas hablar con alguien o simplemente no estás bien.',
    instituciones: ['DIF Tlaxcala', 'INMUJERES Tlaxcala'],
    bg: '#fdf2f4', border: '#e8c3ca', icoBg: '#f7e1e5', icoColor: '#a8677a', actBorder: '#a8677a',
  },
  {
    Icono: Scale,
    titulo: 'Asesoría legal',
    descripcion: 'Dudas sobre tus derechos, una denuncia o protección jurídica.',
    instituciones: ['Fiscalía General del Estado (FGE)', 'INMUJERES Tlaxcala'],
    bg: '#f2f6f1', border: '#cddcc7', icoBg: '#e4ede0', icoColor: '#61885d', actBorder: '#61885d',
  },
  {
    Icono: AlertTriangle,
    titulo: 'Siento que hay peligro',
    descripcion: 'Sientes que estás en peligro o que algo puede escalar.',
    instituciones: ['Refugio Temporal La Esperanza', 'Fiscalía General del Estado (FGE)'],
    bg: '#faf4ed', border: '#e6cba9', icoBg: '#f3e5cf', icoColor: '#b17f4c', actBorder: '#b17f4c',
  },
]

export default function Linea911() {
  const [seleccionada, setSeleccionada] = useState<string | null>(null)

  const situacionActiva = situaciones.find((s) => s.titulo === seleccionada) || null

  const institucionesFiltradas = seleccionada
    ? instituciones.filter((inst) => situacionActiva?.instituciones.includes(inst.nombre))
    : instituciones

  // Color de acento por institución: si hay una situación seleccionada, todas
  // las tarjetas heredan su color; si no, cada institución usa el color de la
  // primera situación que la referencia (para que no todo se vea uniforme).
  const colorParaInstitucion = (nombre: string) => {
    if (situacionActiva) return situacionActiva
    return situaciones.find((s) => s.instituciones.includes(nombre)) || null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* ── HEADER — mismo patrón de franja con degradado que el resto del sitio, sin elementos decorativos: el tono aquí es de acompañamiento, no de promoción ── */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}`, padding: '64px 24px 56px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px',
            boxShadow: `inset 0 0 0 1px ${COLOR_BORDE}`,
          }}>
            <Heart size={22} color={COLOR_MARCA} fill={COLOR_MARCA} />
          </div>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 700,
            color: COLOR_MARCA, background: '#fff', padding: '5px 16px',
            borderRadius: '100px', marginBottom: '22px', letterSpacing: '0.05em',
            textTransform: 'uppercase', boxShadow: `inset 0 0 0 1px ${COLOR_BORDE}`,
          }}>
            Un espacio para apoyarte
          </span>
          <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#111827', margin: '0 0 18px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
            No estás sola.
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.75, margin: 0 }}>
            Este es un espacio de orientación para que encuentres el apoyo que necesitas.
            Aquí encontrarás instituciones reales en Tlaxcala que pueden acompañarte,
            con información clara sobre qué esperar cuando acudes a ellas.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '56px 24px' }}>

        {/* ── SELECTOR DE SITUACIÓN ── */}
        <div style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Cuéntanos un poco cómo te sientes
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px', lineHeight: 1.7 }}>
            No necesitas tener todo claro. Elige lo que más resuene contigo
            y te orientamos hacia las personas que pueden ayudarte.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
            {situaciones.map((s) => {
              const activa = seleccionada === s.titulo
              const Icono = s.Icono
              return (
                <div
                  key={s.titulo}
                  role="button"
                  tabIndex={0}
                  aria-pressed={activa}
                  onClick={() => setSeleccionada(activa ? null : s.titulo)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSeleccionada(activa ? null : s.titulo)
                    }
                  }}
                  style={{
                    background: s.bg,
                    border: `1.5px solid ${activa ? s.actBorder : s.border}`,
                    borderRadius: '16px',
                    padding: '22px 20px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                    boxShadow: activa ? `0 0 0 3px ${s.border}` : 'none',
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: s.icoBg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: '14px',
                  }}>
                    <Icono size={17} color={s.icoColor} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{s.titulo}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{s.descripcion}</p>
                </div>
              )
            })}
          </div>
          {seleccionada && (
            <button
              onClick={() => setSeleccionada(null)}
              style={{
                marginTop: '16px', background: 'none', border: 'none',
                color: COLOR_MARCA, fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0,
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              <ArrowLeft size={14} /> Ver todas las instituciones
            </button>
          )}
        </div>

        {/* ── INSTITUCIONES ── */}
        <div style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {seleccionada ? 'Instituciones recomendadas para ti' : 'Instituciones en Tlaxcala'}
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px' }}>
            Lugares reales, con personas reales. Sabemos que dar el primer paso es difícil,
            por eso te contamos qué pasa exactamente cuando acudes.
          </p>
          <div style={{ display: 'grid', gap: '18px' }}>
            {institucionesFiltradas.map((inst) => {
              const color = colorParaInstitucion(inst.nombre)
              const acento = color?.actBorder || COLOR_MARCA
              const acentoFondo = color?.icoBg || COLOR_MARCA_CLARO
              const acentoTexto = color?.icoColor || COLOR_MARCA
              return (
                <div
                  key={inst.nombre}
                  style={{
                    background: 'white', border: `1px solid ${COLOR_BORDE}`, borderRadius: '16px',
                    padding: '26px', borderTop: `3px solid ${acento}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{inst.nombre}</h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} /> {inst.horario}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={13} /> {inst.direccion}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px', lineHeight: 1.65 }}>
                    {inst.descripcion}
                  </p>
                  <div style={{
                    background: acentoFondo, borderLeft: `3px solid ${acento}`,
                    borderRadius: '0 8px 8px 0', padding: '14px 16px', marginBottom: '18px',
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: acentoTexto, margin: '0 0 5px' }}>
                      Qué pasa cuando llegas o llamas
                    </p>
                    <p style={{ fontSize: '13px', color: '#4b4b4b', margin: 0, lineHeight: 1.65 }}>
                      {inst.quePasaCuando}
                    </p>
                  </div>
                  <a
                    href={`tel:${inst.telefono}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      fontSize: '13px', fontWeight: 700, color: '#fff', background: acento,
                      textDecoration: 'none', border: 'none',
                      padding: '10px 20px', borderRadius: '10px',
                    }}
                  >
                    <Phone size={14} />
                    Llamar · {inst.telefono}
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CIERRE ── */}
        <div style={{ background: 'white', border: `1px solid ${COLOR_BORDE}`, borderRadius: '16px', padding: '36px', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: COLOR_MARCA_CLARO + '55',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <Heart size={19} color={COLOR_MARCA} fill={COLOR_MARCA} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>
            Buscar ayuda es un acto de valentía.
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.75, maxWidth: '480px', margin: '0 auto' }}>
            MN WOMAN está aquí para acompañarte en ese primer paso.
            No tienes que tener todo claro para pedir apoyo,
            basta con saber que algo no está bien.
          </p>
        </div>

      </div>
    </div>
  )
}