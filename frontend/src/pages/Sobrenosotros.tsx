import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── IMÁGENES LOCALES ────────────────────────────────────────────────────
// Cada persona tiene su propia foto. Guarda los archivos en src/assets/
// con estos nombres exactos (o cambia el import si les pusiste otro nombre).
import fotoOrigen from '../assets/foto-origen.jpeg'
import fotoGabriela from '../assets/Gabi Moreno.jpg'
import fotoIsis from '../assets/Isis.jpg'
import fotoMarisol from '../assets/Marisol Fernandez.jpg'
import fotoLaura from '../assets/Laura Silva.jpg'
import fotoRosario from '../assets/Rosario Texis.jpg'

const FOTO_ORIGEN = fotoOrigen

type Persona = {
  nombre: string
  rol: string
  foto: string
  frase: string
  semblanza: string
}

// ── FUNDADORA ───────────────────────────────────────────────────────────
// Solo va aquí la persona que es fundadora de MN WOMAN.
const FUNDADORA: Persona = {
  nombre: 'Marisol Fernández Muñoz',
  rol: 'Directora, Revista Momento',
  foto: fotoMarisol,
  frase: '',
  semblanza: `Marisol Fernández Muñoz es comunicóloga con más de 30 años de trayectoria en los medios de comunicación, destacándose por su compromiso con el periodismo, la comunicación estratégica y la generación de espacios de diálogo que impulsan el desarrollo empresarial, social y cultural.

Es directora general de Revista Momento, medio que se ha consolidado como una plataforma de difusión desde una línea editorial de hacer periodismo social, con ediciones especiales para mujeres, empresarios, jóvenes y enfocada a la salud, que transforman su entorno a través de la innovación, el liderazgo y la responsabilidad social. Bajo su dirección, la publicación ha alcanzado importantes reconocimientos, obteniendo 29 Premios Estatales de Periodismo, reflejo de la calidad, profesionalismo y compromiso editorial que distinguen a su equipo. Asimismo, ha sido nominada a la Presea Miguel N. Lira, uno de los máximos reconocimientos que distinguen la trayectoria y aportación al periodismo y la comunicación en Tlaxcala.

A lo largo de su carrera ha desarrollado proyectos editoriales, de comunicación institucional y producción de contenidos, construyendo puentes entre el sector empresarial, el gobierno, la academia y la sociedad civil. Su labor se distingue por dar voz a historias que inspiran, fortalecen el tejido social y generan un impacto positivo en la comunidad.

Actualmente es conductora y productora del podcast Las Hijas de la Malinche, un espacio que visibiliza las experiencias, retos y logros de mujeres que, desde distintos ámbitos, contribuyen a la construcción de una sociedad más equitativa, incluyente y participativa. Este espacio fue reconocido por la organización Mujeres en Consenso por su aportación a dar voz a las mujeres.

Convencida de que la comunicación es una herramienta para transformar realidades, Marisol Fernández Muñoz continúa impulsando iniciativas que fortalecen el liderazgo, promueven el emprendimiento, fomentan la libertad de expresión y generan alianzas estratégicas que contribuyen al desarrollo de Tlaxcala y de México.`,
}

// ── ALIADAS ─────────────────────────────────────────────────────────────
// Agrega, quita o edita libremente a las personas de este arreglo.
// La cuadrícula se acomoda sola sin importar cuántas sean (1, 2, 3, 5, etc).
const ALIADAS: Persona[] = [
  {
    nombre: 'Gabriela Moreno Carpinteyro',
    rol: 'Médica Pediatra, Especialista en Salud Pública',
    foto: fotoGabriela,
    frase: '',
    semblanza: `Médica especialista en Pediatría, con una sólida trayectoria de más de tres décadas en los ámbitos de la salud pública, la administración hospitalaria, la gestión de servicios médicos y la seguridad hospitalaria. Cuenta con formación especializada en Administración de Hospitales, Control Interno, Administración y Gestión de Riesgos, Auditoría en Instituciones de Salud con Normas Internacionales, así como en Verificación Sanitaria de Bancos de Sangre. Asimismo, está certificada por la Universidad de las Américas Puebla en el desarrollo de habilidades gerenciales y de liderazgo.

A lo largo de su trayectoria profesional, ha desempeñado diversos cargos directivos y médicos de alta responsabilidad. Fue Subdirectora General Médica del ISSSTEP y, previamente, Subdirectora Administrativa del Hospital de Especialidades de la misma institución.

También se desempeñó como Directora del Hospital Regional "Lic. Emilio Sánchez Piedras", en Tzompantepec, Tlaxcala, durante seis años, donde contribuyó al fortalecimiento de la operación y la gestión hospitalaria.

Fue pionera del Programa de Trasplantes en Tlaxcala, impulsando la creación del Consejo Estatal de Trasplantes y contribuyendo a la realización del primer trasplante renal en el estado.`,
  },
  {
    nombre: 'Diana Isis Flores Gutiérrez',
    rol: 'Titular del Programa STEM, SEP Tlaxcala',
    foto: fotoIsis,
    frase: '',
    semblanza: `Titular del programa STEM en la Secretaría de Educación Pública del Estado.

Finalista del Premio Docentes Extraordinarios National Teacher Prize México 2020, distinción que reconoce a docentes con prácticas innovadoras y de alto impacto.

Representó a Tlaxcala y a México durante la COP28, celebrada en Emiratos Árabes Unidos, donde estableció vínculos con organismos y fundaciones de prestigio internacional. De ese trabajo surgieron alianzas con Siemens Stiftung, Fundación Robotix y Fundación Televisa la Red STEM Latinoamérica, mismas que han fortalecido el desarrollo de programas orientados a la educación STEM en nuestro estado.

Como resultado de estos esfuerzos, Tlaxcala se consolidó como el primer estado del país en asumirse como Territorio STEM, impulsando políticas y estrategias para fortalecer la enseñanza de la ciencia, la tecnología, la ingeniería y las matemáticas. Destacan particularmente las Olimpiadas STEM, en las que actualmente participan cientos de niñas, niños y jóvenes, existiendo ya compromisos institucionales que requieren continuidad las Misiones Internacionales STEM, que han permitido que niñas, niños y jóvenes puedan viajar a países de Latinoamérica a presentar proyectos STEM que realizan en sus comunidades.`,
  },
  {
    nombre: 'Laura Lizbeth Silva Delgado',
    rol: 'Coordinadora Hospitalaria de Donación de Órganos y Trasplantes',
    foto: fotoLaura,
    frase: '',
    semblanza: `Médico Cirujano por la Universidad Autónoma de Guerrero.

Formación como Coordinadora Hospitalaria de Donación de Órganos y Tejidos con Fines de Trasplante por la UNAM y el Centro Nacional de Trasplantes.

Diplomado en "Comunicación en situaciones críticas" por la UNAM.

Doctorado "Honoris Causa" por el Claustro Doctoral Iberoamericano, Guadalajara, Jalisco, en 2019.

Cargos:
• Coordinadora Hospitalaria de Donación de Órganos y Trasplantes de 2015 a 2025
• Jefa de Arbitraje Médico en la Comisión Estatal de Arbitraje Médico de Tlaxcala, 2022-2023
• Actualmente adscrita a la Unidad Médica IMSS Bienestar Santorum`,
  },
  {
    nombre: 'Rosario Texis',
    rol: 'Académica, investigadora y activista tlaxcalteca',
    foto: fotoRosario,
    frase: '',
    semblanza: `María del Rosario Texis Zúñiga es una destacada académica, investigadora y activista tlaxcalteca cuya trayectoria se ha construido desde la educación, la investigación y la defensa de los derechos de las mujeres, niñas y adolescentes.
Es Licenciada en Trabajo Social, Maestra en Ciencias Sociales y Doctora en Educación por la Universidad Autónoma de Tlaxcala, además de contar con una especialidad en sexología educativa. Su experiencia profesional y académica se ha enfocado particularmente en los estudios de género, la violencia sexual, los derechos sexuales y reproductivos, así como en la educación y la salud socioemocional.
Desde hace más de dos décadas ha participado activamente en la promoción y defensa de los derechos sexuales y reproductivos en Tlaxcala. Es directora y representante estatal de la Red por los Derechos Sexuales y Reproductivos en México (DDESER), organización desde la cual ha impulsado acciones de información, acompañamiento, capacitación e incidencia social para mujeres y jóvenes.
Su trabajo también ha tenido una importante dimensión académica. Como docente de la Universidad Autónoma de Tlaxcala, ha participado en proyectos de investigación, formación y vinculación relacionados con género, violencia, embarazo infantil, derechos humanos y educación. Asimismo, ha colaborado en espacios nacionales e internacionales de análisis y discusión sobre estas problemáticas.
Uno de los ejes más importantes de su trayectoria ha sido la prevención y atención de la violencia sexual contra niñas y adolescentes, así como la construcción de herramientas educativas que permitan transformar las condiciones que generan desigualdad y violencia. Su trabajo ha buscado llevar estos temas a las comunidades y generar redes de acompañamiento y prevención.
Rosario Texis se ha distinguido también por su participación constante en el debate público en Tlaxcala, particularmente en torno a los derechos de las mujeres y el derecho a decidir. Su labor combina la investigación académica con el activismo y la incidencia social, convirtiéndola en una de las voces referentes en el estado en materia de género y derechos sexuales y reproductivos.
Más que una trayectoria académica, la historia de Rosario Texis representa una vida dedicada a transformar realidades: desde las aulas, la investigación y la sociedad civil, ha trabajado para que las mujeres, niñas y adolescentes conozcan, ejerzan y defiendan sus derechos.`,
  },
]

const SobreNosotros = () => {
  const navigate = useNavigate()
  const [personaActiva, setPersonaActiva] = useState<Persona | null>(null)

  return (
    <main style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        .section-pad { padding: 96px 64px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .grid-3 {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px;
        }
        .persona-card {
          flex: 0 1 300px;
        }
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(182, 104, 120, 0.12);
          border-color: #edd8de;
        }

        /* ── Fundadora: tarjeta destacada ── */
        .fundadora-card {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 52px;
          align-items: center;
          background: #fff;
          border: 1px solid #f0e6e9;
          border-radius: 28px;
          padding: 48px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .fundadora-card:hover {
          box-shadow: 0 20px 44px rgba(182, 104, 120, 0.16);
          transform: translateY(-2px);
        }
        .fundadora-quote-mark {
          position: absolute;
          top: -54px;
          right: 28px;
          font-size: 220px;
          line-height: 1;
          font-family: Georgia, 'Times New Roman', serif;
          color: #B66878;
          opacity: 0.07;
          pointer-events: none;
          user-select: none;
        }
        .fundadora-photo-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 4 / 5;
          box-shadow: 0 24px 48px rgba(182, 104, 120, 0.2);
          z-index: 1;
        }
        .fundadora-photo-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .fundadora-content { position: relative; z-index: 1; }
        .fundadora-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #B66878;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          margin-top: 22px;
        }
        .fundadora-cta svg { transition: transform 0.2s ease; }
        .fundadora-card:hover .fundadora-cta svg { transform: translateX(4px); }

        /* ── Aliadas: cuadrícula de tarjetas ── */
        .aliadas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 28px;
        }
        .aliada-card {
          background: #fff;
          border: 1px solid #f0e6e9;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .aliada-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(182, 104, 120, 0.14);
          border-color: #edd8de;
        }
        .aliada-photo-wrap {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #FDF0F2;
        }
        .aliada-photo-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          object-position: center 18%;
          transition: transform 0.45s ease;
        }
        .aliada-card:hover .aliada-photo-wrap img { transform: scale(1.06); }
        .aliada-numeral {
          position: absolute;
          top: 14px; left: 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #fff;
          background: rgba(15, 10, 11, 0.38);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 100px;
        }
        .aliada-body { padding: 20px 22px 24px; }

        @media (max-width: 900px) {
          .fundadora-card { grid-template-columns: 1fr; padding: 36px 24px; text-align: center; }
          .fundadora-photo-wrap { max-width: 260px; margin: 0 auto; }
          .fundadora-content { text-align: center; }
        }

        .origen-grid { display: flex; align-items: center; gap: 56px; }
        .origen-text { flex: 1 1 420px; }
        .origen-media { flex: 1 1 280px; max-width: 300px; position: relative; }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 10, 11, 0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; z-index: 1000;
        }
        .modal-content {
          background: #fff; borderRadius: 20px; max-width: 640px; width: 100%;
          max-height: 85vh; overflow-y: auto; position: relative;
          border-radius: 20px;
        }

        @media (max-width: 900px) {
          .section-pad { padding: 64px 32px; }
          .grid-2 { grid-template-columns: 1fr; }
          .origen-grid { flex-direction: column-reverse; }
          .origen-media { max-width: 220px; }
        }
        @media (max-width: 600px) {
          .section-pad { padding: 48px 20px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="section-pad" style={{
        background: 'linear-gradient(150deg, #fdf2f4 0%, #fce8f0 60%, #fdf6f8 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-80px', top: '-40px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'rgba(182, 104, 120, 0.06)', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block',
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#B66878',
            background: 'rgba(182,104,120,0.1)', padding: '6px 14px',
            borderRadius: '100px', marginBottom: '24px',
          }}>
            Sobre Nosotros
          </span>
          <h1 style={{
            fontSize: '44px', fontWeight: '800', lineHeight: '1.15',
            color: '#0f0a0b', letterSpacing: '-0.02em', margin: '0 0 20px',
          }}>
            Una red construida <span style={{ color: '#B66878' }}>por y para</span> mujeres de Tlaxcala
          </h1>
          <p style={{ fontSize: '17px', color: '#6b5b61', lineHeight: '1.75', margin: '0 auto', maxWidth: '560px' }}>
            MN WOMAN nació para conectar, impulsar y visibilizar a mujeres emprendedoras,
            profesionales y académicas, creando un espacio de crecimiento colectivo en Tlaxcala.
          </p>
        </div>
      </section>

      {/* ── MISIÓN Y VISIÓN ── */}
      <section
        className="section-pad"
        style={{
          background: 'linear-gradient(160deg, #fdf2f4 0%, #fff 50%, #fce8f0 100%)',
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#B66878',
            }}
          >
            Propósito
          </span>

          <h2
            style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#0f0a0b',
              margin: '12px 0 40px',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          >
            Nuestra Misión y Visión
          </h2>

          <div className="grid-2">

            {/* MISIÓN */}
            <div
              style={{
                borderRadius: '18px',
                padding: '28px 24px',
                border: '1px solid #f0e6e9',
                background: '#fff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #B66878, #d4889a)',
                }}
              />

              <div
                style={{
                  width: '46px',
                  height: '46px',
                  background: '#FDF0F2',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  border: '1px solid #f0e6e9',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B66878"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#B66878',
                }}
              >
                Misión
              </span>

              <h3
                style={{
                  fontSize: '21px',
                  fontWeight: '800',
                  color: '#0f0a0b',
                  margin: '8px 0 12px',
                  letterSpacing: '-0.02em',
                }}
              >
                Lo que hacemos hoy
              </h3>

              <p
                style={{
                  fontSize: '16px',
                  color: '#7a6870',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Conectar, impulsar y visibilizar a las mujeres emprendedoras y líderes
                de Tlaxcala, brindándoles una plataforma de networking, formación y
                recursos estratégicos para fortalecer su impacto profesional y
                personal.
              </p>

              <div
                style={{
                  marginTop: '18px',
                  padding: '12px 16px',
                  background: '#fdf8f9',
                  borderLeft: '3px solid #B66878',
                  borderRadius: '0 10px 10px 0',
                }}
              >
                <p
                  style={{
                    fontSize: '15px',
                    color: '#9a7880',
                    lineHeight: '1.5',
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  Creemos que cuando una mujer crece, toda su comunidad crece con ella.
                </p>
              </div>
            </div>

            {/* VISIÓN */}
            <div
              style={{
                borderRadius: '18px',
                padding: '28px 24px',
                border: '1px solid #f0e6e9',
                background: '#fff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #B66878, #d4889a)',
                }}
              />

              <div
                style={{
                  width: '46px',
                  height: '46px',
                  background: '#FDF0F2',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  border: '1px solid #f0e6e9',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B66878"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#B66878',
                }}
              >
                Visión
              </span>

              <h3
                style={{
                  fontSize: '21px',
                  fontWeight: '800',
                  color: '#0f0a0b',
                  margin: '8px 0 12px',
                  letterSpacing: '-0.02em',
                }}
              >
                Lo que construimos juntas
              </h3>

              <p
                style={{
                  fontSize: '16px',
                  color: '#7a6870',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Construir la red empresarial de networking más solida y confiable de México, con empresarias comprometidas, para transformar el ecosistema empresarial mediante la sororidad, la innovación y el liderazgo femenino.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── ORIGEN ── */}
      <section className="section-pad" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div className="origen-grid">
            <div className="origen-text">
              <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
                Nuestro origen
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 24px', letterSpacing: '-0.02em' }}>
                Nacimos escuchando a las mujeres de Tlaxcala
              </h2>
              <p style={{ fontSize: '15px', color: '#7a6870', lineHeight: '1.8', margin: '0 0 20px', maxWidth: '560px' }}>
                MN WOMAN surgió de un diagnóstico realizado con más de 70 mujeres de la red de
                Revista Momento, cuyas respuestas definieron los módulos que hoy forman la
                plataforma: directorio, reuniones y eventos, servicios, oportunidades, cursos,
                línea de apoyo 911 y temas de interés.
              </p>
              <p style={{ fontSize: '15px', color: '#7a6870', lineHeight: '1.8', margin: 0, maxWidth: '560px' }}>
                Pensamos esta red como una evolución del modelo tradicional de networking,
                diseñada exclusivamente para mujeres emprendedoras, profesionales y académicas
                de la región.
              </p>
            </div>

            <div className="origen-media">
              {/* halo detrás de la foto */}
              <div style={{
                position: 'absolute', top: '-16px', left: '-16px', right: '16px', bottom: '16px',
                borderRadius: '50%',
                background: 'linear-gradient(160deg, #fce3e8, #f8d3db)',
                zIndex: 0,
              }} />
              <div style={{
                position: 'relative', zIndex: 1, width: '100%', aspectRatio: '1 / 1',
                borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 20px 44px rgba(182,104,120,0.2)',
              }}>
                <img
                  src={FOTO_ORIGEN}
                  alt="Diagnóstico con mujeres de Tlaxcala"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
                />
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* ── FUNDADORA ── */}
      <section className="section-pad" style={{ backgroundColor: '#fdf6f8' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
              Nuestra raíz
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 10px', letterSpacing: '-0.02em' }}>
              La fundadora de MN WOMAN
            </h2>
            <p style={{ fontSize: '15px', color: '#7a6870', margin: '0 auto', maxWidth: '560px' }}>
              Toca la tarjeta para conocer su semblanza completa.
            </p>
          </div>

          <div
            className="fundadora-card"
            onClick={() => setPersonaActiva(FUNDADORA)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPersonaActiva(FUNDADORA) } }}
          >
            <span className="fundadora-quote-mark">”</span>

            <div className="fundadora-photo-wrap">
              <img
                src={FUNDADORA.foto}
                alt={FUNDADORA.nombre}
                style={{ objectPosition: 'center 15%' }}
              />
            </div>

            <div className="fundadora-content">
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B66878' }}>
                Fundadora de MN WOMAN
              </span>
              <h3 style={{ fontSize: '27px', fontWeight: '800', color: '#0f0a0b', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                {FUNDADORA.nombre}
              </h3>
              <p style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', margin: '0 0 18px' }}>
                {FUNDADORA.rol}
              </p>
              <p style={{ fontSize: '15px', color: '#7a6870', lineHeight: '1.8', margin: 0, maxWidth: '540px' }}>
                {FUNDADORA.semblanza.split('\n\n')[0]}
              </p>
              <button
                className="fundadora-cta"
                onClick={(e) => { e.stopPropagation(); setPersonaActiva(FUNDADORA) }}
              >
                Leer su historia completa
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALIADAS ── */}
      <section className="section-pad" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
              Nuestras raíces
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 10px', letterSpacing: '-0.02em' }}>
              Las aliadas que impulsaron a MN WOMAN
            </h2>
            <p style={{ fontSize: '15px', color: '#7a6870', margin: '0 auto', maxWidth: '560px' }}>
              Mujeres comprometidas con Tlaxcala que acompañaron el nacimiento de este proyecto.
              Toca una tarjeta para conocer su semblanza completa.
            </p>
          </div>

          <div className="aliadas-grid">
            {ALIADAS.map((persona, idx) => (
              <div
                key={persona.nombre}
                className="aliada-card"
                onClick={() => setPersonaActiva(persona)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPersonaActiva(persona) } }}
              >
                <div className="aliada-photo-wrap">
                  <span className="aliada-numeral">{String(idx + 1).padStart(2, '0')}</span>
                  <img src={persona.foto} alt={persona.nombre} />
                </div>
                <div className="aliada-body">
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#0f0a0b', letterSpacing: '-0.01em' }}>
                    {persona.nombre}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#B66878', fontWeight: '600', margin: 0 }}>
                    {persona.rol}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <p style={{ fontSize: '14px', color: '#9a7880', marginBottom: '20px' }}>
              Sé de las primeras en formar parte de esta red.
            </p>
            <button onClick={() => navigate('/register')} style={{
              padding: '14px 36px', backgroundColor: '#B66878', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer', letterSpacing: '0.01em',
            }}>
              Solicitar ingreso
            </button>
          </div>
        </div>
      </section>

      {/* ── MODAL DE SEMBLANZA ── */}
      {personaActiva && (
        <div
          className="modal-overlay"
          onClick={() => setPersonaActiva(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPersonaActiva(null)}
              aria-label="Cerrar"
              style={{
                position: 'absolute', top: '16px', right: '16px',
                width: '34px', height: '34px', borderRadius: '50%',
                border: 'none', background: '#f3f4f6', color: '#6b7280',
                fontSize: '18px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', zIndex: 2,
              }}
            >
              ×
            </button>

            <div style={{ padding: '36px 32px 32px', textAlign: 'center' }}>
              <div style={{
                width: '132px', height: '132px', borderRadius: '50%', margin: '0 auto 18px',
                overflow: 'hidden', border: '3px solid #FDF0F2',
                boxShadow: '0 6px 16px rgba(182,104,120,0.15)',
              }}>
                <img
                  src={personaActiva.foto}
                  alt={personaActiva.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', display: 'block' }}
                />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f0a0b', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                {personaActiva.nombre}
              </h3>
              <p style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', margin: '0 0 24px' }}>
                {personaActiva.rol}
              </p>

              <div style={{ textAlign: 'left' }}>
                {personaActiva.semblanza.split('\n\n').map((parrafo, i) => (
                  <p key={i} style={{ fontSize: '14.5px', color: '#4b3f43', lineHeight: '1.75', margin: '0 0 16px', whiteSpace: 'pre-line' }}>
                    {parrafo}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default SobreNosotros