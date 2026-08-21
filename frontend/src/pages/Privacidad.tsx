import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const SECCIONES = [
  { id: 'quienes-somos', label: '1. Quiénes somos' },
  { id: 'datos-por-modulo', label: '2. Qué datos recopilamos' },
  { id: 'finalidades', label: '3. Para qué los usamos' },
  { id: 'base-legal', label: '4. Base legal y consentimiento' },
  { id: 'visibilidad', label: '5. Visibilidad dentro de la Red' },
  { id: 'terceros', label: '6. Con quién compartimos' },
  { id: 'transferencias', label: '7. Transferencias internacionales' },
  { id: 'seguridad', label: '8. Cómo protegemos tus datos' },
  { id: 'conservacion', label: '9. Cuánto tiempo los conservamos' },
  { id: 'arco', label: '10. Tus derechos ARCO' },
  { id: 'cookies', label: '11. Cookies' },
  { id: 'linea911', label: '12. Recursos de apoyo (Línea 911)' },
  { id: 'menores', label: '13. Menores de edad' },
  { id: 'cambios', label: '14. Cambios a esta política' },
  { id: 'contacto', label: '15. Contacto' },
]

const MODULOS = [
  {
    modulo: 'Registro',
    datos: 'Nombre, apellido, correo, teléfono, contraseña, empresa, giro, ubicación, años liderando, usuario',
    finalidad: 'Crear tu cuenta y validar tu solicitud de ingreso',
    visibilidad: 'Privado hasta tu aprobación',
  },
  {
    modulo: 'Perfil / Directorio',
    datos: 'Los datos de registro, más foto y descripción de perfil (si los agregas)',
    finalidad: 'Mostrar tu perfil a otras integrantes para networking',
    visibilidad: 'Visible para integrantes aprobadas',
  },
  {
    modulo: 'Cursos',
    datos: 'Inscripción, avance y finalización de cursos',
    finalidad: 'Gestionar tu acceso e historial académico',
    visibilidad: 'Privado, uso administrativo',
  },
  {
    modulo: 'Eventos',
    datos: 'Registro y asistencia a eventos',
    finalidad: 'Confirmar tu lugar y enviarte recordatorios',
    visibilidad: 'Privado, salvo listas que el propio evento decida compartir',
  },
  {
    modulo: 'Oportunidades',
    datos: 'Lo que publiques al crear una oportunidad, o lo que envíes al postularte',
    finalidad: 'Conectar oferta y demanda dentro de la Red',
    visibilidad: 'Quien publica ve a quienes se postulan; la oportunidad es pública',
  },
  {
    modulo: 'Servicios',
    datos: 'Descripción de tu servicio, contacto y precio',
    finalidad: 'Promocionar tu servicio dentro de la Red',
    visibilidad: 'Público para integrantes de la Red',
  },
  {
    modulo: 'Línea 911',
    datos: 'Ninguno — es contenido informativo',
    finalidad: 'Brindarte información de apoyo y contactos de ayuda',
    visibilidad: 'No aplica, no se recopilan datos aquí',
  },
  {
    modulo: 'Panel administrativo',
    datos: 'Acceso a los datos anteriores, por personal autorizado',
    finalidad: 'Moderar solicitudes, contenido y operar la plataforma',
    visibilidad: 'Interno, solo equipo autorizado de MN WOMEN',
  },
]

export default function Privacidad() {
  const [activa, setActiva] = useState(SECCIONES[0].id)
  const refs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiva(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )
    SECCIONES.forEach(({ id }) => {
      const el = refs.current[id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const irA = (id: string) => {
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Estilos ───────────────────────────────────────────────────────────
  const h2 = { fontSize: '19px', fontWeight: '800' as const, color: '#1f2937', marginBottom: '10px', letterSpacing: '-0.01em' }
  const p = { color: '#4b5563', fontSize: '14.5px', lineHeight: '1.75', marginBottom: '12px' }
  const li = { color: '#4b5563', fontSize: '14.5px', lineHeight: '1.75', marginBottom: '7px' }
  const subhead = { ...p, fontWeight: 700 as const, color: '#374151', marginBottom: '6px' }
  const seccionStyle = { paddingTop: '8px', marginBottom: '40px', scrollMarginTop: '32px' }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap');
        .privacidad-serif { font-family: 'Fraunces', Georgia, serif; }
        .privacidad-nav a { transition: color 0.15s, border-color 0.15s; }
        .privacidad-tabla { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .privacidad-tabla th { text-align: left; color: #B66878; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; padding: 10px 12px; border-bottom: 2px solid #f4d6db; }
        .privacidad-tabla td { padding: 12px; border-bottom: 1px solid #f0f0f0; color: #4b5563; vertical-align: top; line-height: 1.5; }
        .privacidad-tabla tr:last-child td { border-bottom: none; }
        @media (max-width: 860px) {
          .privacidad-sidebar { display: none; }
        }
      `}</style>

      {/* Encabezado */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #fafafa 100%)', borderBottom: '1px solid #f4d6db', padding: '56px 24px 40px' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: '#B66878', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
            MN WOMEN · Documento legal
          </p>
          <h1 className="privacidad-serif" style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 700, color: '#1f2937', marginBottom: '10px', lineHeight: 1.1 }}>
            Política de Privacidad
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Última actualización: [fecha]</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8a4a56', background: '#fff', border: '1px solid #f4d6db', borderRadius: '999px', padding: '3px 10px' }}>
              Borrador — pendiente de revisión por abogado
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '48px', alignItems: 'start' }}>

        {/* Navegación lateral */}
        <nav className="privacidad-sidebar" style={{ position: 'sticky', top: '32px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => { e.preventDefault(); irA(s.id) }}
              style={{
                fontSize: '13px', padding: '7px 0 7px 12px', textDecoration: 'none',
                color: activa === s.id ? '#B66878' : '#9ca3af',
                fontWeight: activa === s.id ? 700 : 400,
                borderLeft: `2px solid ${activa === s.id ? '#B66878' : '#e5e7eb'}`,
              }}
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Contenido */}
        <div>
          <p style={p}>
            En <strong>MN WOMEN</strong> ("nosotros", "la Red", "la Plataforma") valoramos tu confianza y nos
            comprometemos a proteger los datos personales que nos compartes. Esta política explica qué
            información recopilamos en cada parte de la Plataforma, para qué la usamos, quién puede verla y
            qué derechos tienes sobre ella, de conformidad con la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
          </p>

          <div style={{ background: '#FDF0F2', border: '1px solid #f4d6db', borderRadius: '12px', padding: '16px 18px', marginBottom: '32px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#8a4a56', marginBottom: '8px' }}>⚠️ Nota para el equipo de MN WOMEN</p>
            <p style={{ fontSize: '13px', color: '#8a4a56', lineHeight: '1.65', marginBottom: 0 }}>
              Este documento es una plantilla redactada con IA como punto de partida, no asesoría legal
              formal. Antes de publicarlo: (1) sustituyan los campos entre corchetes [ ] cuando tengan razón
              social y domicilio fiscal definidos, (2) confirmen qué proveedores externos usan (analítica,
              correo, pagos) para completar la sección 6, y (3) pidan a un abogado especializado en
              protección de datos que lo revise.
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#B66878', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Resumen rápido
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li style={li}>No vendemos tus datos personales a nadie.</li>
              <li style={li}>Tu perfil (nombre, empresa, giro, ubicación) es visible para otras integrantes aprobadas, como parte del propósito de networking de la Red.</li>
              <li style={li}>Tu contraseña siempre está cifrada; nadie en el equipo puede verla.</li>
              <li style={li}>Puedes pedir acceder, corregir o eliminar tus datos cuando quieras.</li>
              <li style={li}>La sección "Línea 911" es solo informativa: no recopila datos ahí.</li>
            </ul>
          </div>

          <section id="quienes-somos" ref={(el) => { refs.current['quienes-somos'] = el }} style={seccionStyle}>
            <h2 style={h2}>1. Quiénes somos</h2>
            <p style={p}>
              MN WOMEN es una red de liderazgo empresarial para mujeres <strong>[en proceso de constitución
              legal formal — se actualizará esta sección con razón social, RFC y domicilio fiscal en cuanto
              estén definidos]</strong>. Mientras tanto, puedes contactarnos como responsables del tratamiento
              de tus datos en <strong>[correo de contacto / privacidad@mnwomen.com]</strong>.
            </p>
          </section>

          <section id="datos-por-modulo" ref={(el) => { refs.current['datos-por-modulo'] = el }} style={seccionStyle}>
            <h2 style={h2}>2. Qué datos recopilamos, por módulo</h2>
            <p style={p}>
              No todos los datos se recopilan en un solo lugar. Esta tabla resume qué información se genera
              en cada parte de la Plataforma, para qué la usamos y quién puede verla:
            </p>
            <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: '10px' }}>
              <table className="privacidad-tabla">
                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th>Datos</th>
                    <th>Finalidad</th>
                    <th>Visibilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULOS.map((m) => (
                    <tr key={m.modulo}>
                      <td style={{ fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{m.modulo}</td>
                      <td>{m.datos}</td>
                      <td>{m.finalidad}</td>
                      <td>{m.visibilidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ ...p, marginTop: '12px' }}>
              No solicitamos ni recopilamos datos personales sensibles (origen étnico, salud, creencias
              religiosas, preferencias sexuales, etc.) en ningún formulario de la Plataforma.
            </p>
          </section>

          <section id="finalidades" ref={(el) => { refs.current['finalidades'] = el }} style={seccionStyle}>
            <h2 style={h2}>3. Para qué usamos tus datos</h2>
            <p style={subhead}>Finalidades primarias (necesarias para el servicio):</p>
            <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px' }}>
              <li style={li}>Crear y administrar tu cuenta y perfil dentro de la Red</li>
              <li style={li}>Validar tu solicitud de ingreso y comunicarte su estatus</li>
              <li style={li}>Conectarte con otras integrantes según giro, ubicación o intereses</li>
              <li style={li}>Operar cursos, eventos, oportunidades y servicios en los que participes</li>
              <li style={li}>Enviarte comunicaciones operativas relacionadas con tu cuenta</li>
            </ul>
            <p style={subhead}>Finalidades secundarias (puedes oponerte a estas):</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li style={li}>Enviarte boletines, invitaciones a eventos o contenido relevante</li>
              <li style={li}>Elaborar estadísticas internas de forma agregada y anónima</li>
              <li style={li}>Mejorar la Plataforma y su experiencia de uso</li>
            </ul>
            <p style={{ ...p, marginTop: '12px' }}>
              Si no deseas que tus datos se usen para las finalidades secundarias, escríbenos a
              <strong> [correo de contacto]</strong> indicándolo.
            </p>
          </section>

          <section id="base-legal" ref={(el) => { refs.current['base-legal'] = el }} style={seccionStyle}>
            <h2 style={h2}>4. Base legal y tu consentimiento</h2>
            <p style={p}>
              Tratamos tus datos con base en el consentimiento que otorgas al marcar la casilla de aceptación
              durante el registro, y en la necesidad de usar tus datos para prestarte el servicio que
              solicitas (crear tu cuenta, mostrarte en el directorio, gestionar tu participación en cursos,
              eventos, oportunidades y servicios). Puedes retirar tu consentimiento en cualquier momento,
              conforme a la sección 10 (Derechos ARCO), aunque esto podría implicar que ya no puedas usar
              algunas funciones de la Plataforma.
            </p>
          </section>

          <section id="visibilidad" ref={(el) => { refs.current['visibilidad'] = el }} style={seccionStyle}>
            <h2 style={h2}>5. Visibilidad de tu información dentro de la Red</h2>
            <p style={p}>
              Parte del valor de MN WOMEN es conectar mujeres líderes entre sí, así que algunos de tus datos
              se muestran a otras integrantes:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li style={li}><strong>Directorio:</strong> tu nombre, usuario, empresa, giro y ubicación son visibles para integrantes con cuenta aprobada.</li>
              <li style={li}><strong>Oportunidades:</strong> si publicas una oportunidad, es visible públicamente dentro de la Red; si te postulas a una, quien la publicó puede ver los datos que enviaste en tu postulación.</li>
              <li style={li}><strong>Servicios:</strong> si publicas un servicio, su descripción, contacto y precio son visibles para integrantes de la Red.</li>
            </ul>
            <p style={{ ...p, marginTop: '12px' }}>
              Tu contraseña nunca es visible para nadie, incluido el equipo de MN WOMEN.
            </p>
          </section>

          <section id="terceros" ref={(el) => { refs.current['terceros'] = el }} style={seccionStyle}>
            <h2 style={h2}>6. Con quién compartimos tus datos fuera de la Red</h2>
            <p style={p}>No vendemos tus datos personales. Podemos compartir información limitada en los siguientes casos:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li style={li}><strong>Proveedores de servicios</strong> que usamos para operar la Plataforma, como hosting, envío de correos o herramientas de analítica <strong>[completar con los proveedores específicos que utilicen, p. ej. Google Analytics, SendGrid, AWS]</strong>, siempre bajo acuerdos de confidencialidad.</li>
              <li style={li}><strong>Por obligación legal</strong>, si una autoridad competente lo requiere conforme a la ley aplicable.</li>
            </ul>
          </section>

          <section id="transferencias" ref={(el) => { refs.current['transferencias'] = el }} style={seccionStyle}>
            <h2 style={h2}>7. Transferencias internacionales de datos</h2>
            <p style={p}>
              Si alguno de nuestros proveedores tecnológicos (por ejemplo, de hosting o correo electrónico)
              opera fuera de México, tus datos podrán transferirse a esos países únicamente para las
              finalidades descritas en esta política, y siempre bajo estándares de protección adecuados
              conforme a la LFPDPPP.
            </p>
          </section>

          <section id="seguridad" ref={(el) => { refs.current['seguridad'] = el }} style={seccionStyle}>
            <h2 style={h2}>8. Cómo protegemos tus datos</h2>
            <p style={p}>
              Tu contraseña se almacena siempre cifrada; ningún miembro del equipo puede verla en texto
              plano. Aplicamos medidas técnicas y administrativas razonables para proteger tu información
              contra pérdida, uso indebido o acceso no autorizado. Aun así, te recomendamos no compartir tu
              contraseña con nadie ni reutilizarla en otras plataformas.
            </p>
          </section>

          <section id="conservacion" ref={(el) => { refs.current['conservacion'] = el }} style={seccionStyle}>
            <h2 style={h2}>9. Cuánto tiempo conservamos tus datos</h2>
            <p style={p}>
              Conservamos tus datos mientras tu cuenta esté activa en la Plataforma. Si solicitas la
              cancelación de tu cuenta, eliminaremos o anonimizaremos tus datos, salvo que exista una
              obligación legal de conservarlos por más tiempo.
            </p>
          </section>

          <section id="arco" ref={(el) => { refs.current['arco'] = el }} style={seccionStyle}>
            <h2 style={h2}>10. Tus derechos ARCO</h2>
            <p style={p}>
              Tienes derecho a <strong>A</strong>cceder, <strong>R</strong>ectificar, <strong>C</strong>ancelar
              u <strong>O</strong>ponerte al tratamiento de tus datos personales, así como a revocar tu
              consentimiento en cualquier momento. Para ejercer estos derechos, envía una solicitud a
              <strong> [correo de contacto]</strong> indicando:
            </p>
            <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
              <li style={li}>Tu nombre completo y correo registrado</li>
              <li style={li}>El derecho que deseas ejercer</li>
              <li style={li}>Una descripción clara de tu solicitud</li>
            </ul>
            <p style={p}>Responderemos en un plazo máximo de 20 días hábiles, conforme a la LFPDPPP.</p>
          </section>

          <section id="cookies" ref={(el) => { refs.current['cookies'] = el }} style={seccionStyle}>
            <h2 style={h2}>11. Cookies y tecnologías similares</h2>
            <p style={p}>
              Si la Plataforma utiliza cookies u otras tecnologías de rastreo (por ejemplo, para analítica de
              uso), el detalle específico se documentará en un Aviso de Cookies independiente
              <strong> [pendiente, completar cuando se confirme el uso de herramientas de analítica]</strong>.
            </p>
          </section>

          <section id="linea911" ref={(el) => { refs.current['linea911'] = el }} style={seccionStyle}>
            <h2 style={h2}>12. Recursos de apoyo (Línea 911)</h2>
            <p style={p}>
              La sección "Línea 911" que se muestra tras completar tu registro es contenido informativo
              (directorio de contactos y recursos de ayuda) — no recopilamos ningún dato personal en esa
              sección. Si en el futuro se agrega ahí algún formulario de contacto o reporte, actualizaremos
              esta política y solicitaremos el consentimiento adicional correspondiente antes de activarlo.
            </p>
          </section>

          <section id="menores" ref={(el) => { refs.current['menores'] = el }} style={seccionStyle}>
            <h2 style={h2}>13. Menores de edad</h2>
            <p style={p}>
              MN WOMEN está dirigida a mujeres mayores de 18 años que lideran o desean liderar un negocio. No
              recopilamos intencionalmente datos de menores de edad.
            </p>
          </section>

          <section id="cambios" ref={(el) => { refs.current['cambios'] = el }} style={seccionStyle}>
            <h2 style={h2}>14. Cambios a esta política</h2>
            <p style={p}>
              Podemos actualizar esta política para reflejar cambios legales, operativos o tecnológicos.
              Notificaremos cambios relevantes a través de la Plataforma o por correo electrónico, e
              indicaremos la fecha de la última actualización al inicio de este documento. Al marcar la
              casilla de aceptación durante el registro, confirmas que has leído y aceptas esta política.
            </p>
          </section>

          <section id="contacto" ref={(el) => { refs.current['contacto'] = el }} style={{ ...seccionStyle, marginBottom: 0 }}>
            <h2 style={h2}>15. Contacto</h2>
            <div style={{ background: '#FDF0F2', borderRadius: '12px', padding: '20px 22px' }}>
              <p style={{ ...p, marginBottom: 0, color: '#5c3a41' }}>
                Si tienes dudas sobre esta política o el manejo de tus datos, escríbenos a
                <strong> [correo de contacto / privacidad@mnwomen.com]</strong>.
              </p>
            </div>
          </section>

          <Link to="/register" style={{ display: 'inline-block', marginTop: '12px', color: '#B66878', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
            ← Volver al registro
          </Link>
        </div>
      </div>
    </div>
  )
}