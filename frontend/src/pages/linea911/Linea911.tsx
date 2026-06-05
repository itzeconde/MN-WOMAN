import { useState } from 'react'

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
    icono: 'ti-shield',
    titulo: 'Violencia doméstica',
    descripcion: 'Maltrato físico, emocional o económico dentro del hogar.',
    instituciones: ['INMUJERES Tlaxcala', 'Refugio Temporal La Esperanza'],
    bg: '#f3f0ff', border: '#c4b5fd', icoBg: '#ede9fe', icoColor: '#7c3aed', actBorder: '#7c3aed',
  },
  {
    icono: 'ti-heart',
    titulo: 'Apoyo emocional',
    descripcion: 'Necesitas hablar con alguien o simplemente no estás bien.',
    instituciones: ['DIF Tlaxcala', 'INMUJERES Tlaxcala'],
    bg: '#fff0f6', border: '#f9a8d4', icoBg: '#fce7f3', icoColor: '#be185d', actBorder: '#be185d',
  },
  {
    icono: 'ti-scale',
    titulo: 'Asesoría legal',
    descripcion: 'Dudas sobre tus derechos, una denuncia o protección jurídica.',
    instituciones: ['Fiscalía General del Estado (FGE)', 'INMUJERES Tlaxcala'],
    bg: '#f0fdf4', border: '#86efac', icoBg: '#dcfce7', icoColor: '#15803d', actBorder: '#15803d',
  },
  {
    icono: 'ti-alert-triangle',
    titulo: 'Estoy en riesgo ahora',
    descripcion: 'Sientes que estás en peligro o que algo puede escalar.',
    instituciones: ['Refugio Temporal La Esperanza', 'Fiscalía General del Estado (FGE)'],
    bg: '#fff7ed', border: '#fdba74', icoBg: '#ffedd5', icoColor: '#c2410c', actBorder: '#c2410c',
  },
]

export default function Linea911() {
  const [seleccionada, setSeleccionada] = useState<string | null>(null)

  const institucionesFiltradas = seleccionada
    ? instituciones.filter((inst) =>
        situaciones.find((s) => s.titulo === seleccionada)?.instituciones.includes(inst.nombre)
      )
    : instituciones

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: '12px', fontWeight: 600,
            color: '#B66878', background: '#fdf2f4', padding: '4px 14px',
            borderRadius: '20px', marginBottom: '20px', letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Un espacio para apoyarte
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
            No estás sola.
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.7 }}>
            Este es un espacio de orientación para que encuentres el apoyo que necesitas.
            Aquí encontrarás instituciones reales en Tlaxcala que pueden acompañarte,
            con información clara sobre qué esperar cuando acudes a ellas.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Cuéntanos un poco cómo te sientes
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.7 }}>
            No necesitas tener todo claro. Elige lo que más resuene contigo
            y te orientamos hacia las personas que pueden ayudarte.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
            {situaciones.map((s) => {
              const activa = seleccionada === s.titulo
              return (
                <div
                  key={s.titulo}
                  onClick={() => setSeleccionada(activa ? null : s.titulo)}
                  style={{
                    background: s.bg,
                    border: `1.5px solid ${activa ? s.actBorder : s.border}`,
                    borderRadius: '14px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: activa ? `0 0 0 3px ${s.border}` : 'none',
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: s.icoBg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '17px', color: s.icoColor,
                    marginBottom: '12px',
                  }}>
                    <i className={`ti ${s.icono}`} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '5px' }}>{s.titulo}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{s.descripcion}</p>
                </div>
              )
            })}
          </div>
          {seleccionada && (
            <button
              onClick={() => setSeleccionada(null)}
              style={{
                marginTop: '14px', background: 'none', border: 'none',
                color: '#B66878', fontSize: '13px', cursor: 'pointer', padding: 0,
              }}
            >
              ← Ver todas las instituciones
            </button>
          )}
        </div>

        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            {seleccionada ? 'Instituciones recomendadas para ti' : 'Instituciones en Tlaxcala'}
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Lugares reales, con personas reales. Sabemos que dar el primer paso es difícil,
            por eso te contamos qué pasa exactamente cuando acudes.
          </p>
          <div style={{ display: 'grid', gap: '16px' }}>
            {institucionesFiltradas.map((inst) => (
              <div
                key={inst.nombre}
                style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{inst.nombre}</h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ti ti-clock" style={{ fontSize: '13px' }} /> {inst.horario}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ti ti-map-pin" style={{ fontSize: '13px' }} /> {inst.direccion}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.6 }}>
                  {inst.descripcion}
                </p>
                <div style={{
                  background: '#fdf2f4', borderLeft: '3px solid #B66878',
                  borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: '16px',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#B66878', marginBottom: '4px' }}>
                    Que pasa cuando llegas o llamas
                  </p>
                  <p style={{ fontSize: '13px', color: '#7c3d4a', lineHeight: 1.6 }}>
                    {inst.quePasaCuando}
                  </p>
                </div>
                <a
                  href={`tel:${inst.telefono}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: 600, color: '#B66878',
                    textDecoration: 'none', border: '1px solid #B66878',
                    padding: '8px 16px', borderRadius: '8px',
                  }}
                >
                  <i className="ti ti-phone" style={{ fontSize: '14px' }} />
                  {inst.telefono}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: '#fdf2f4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '20px', color: '#B66878',
          }}>
            <i className="ti ti-heart" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
            Buscar ayuda es un acto de valentía.
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>
            MN WOMAN está aquí para acompañarte en ese primer paso.
            No tienes que tener todo claro para pedir apoyo,
            basta con saber que algo no está bien.
          </p>
        </div>

      </div>
    </div>
  )
}