import { useNavigate } from 'react-router-dom'
import { Users, Sparkles, Handshake } from 'lucide-react'

const SobreNosotros = () => {
  const navigate = useNavigate()

  return (
    <main style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        .section-pad { padding: 96px 64px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
          justify-content: center;
          gap: 24px;
        }
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(182, 104, 120, 0.12);
          border-color: #edd8de;
        }

        @media (max-width: 900px) {
          .section-pad { padding: 64px 32px; }
          .grid-2 { grid-template-columns: 1fr; }
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
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
            Nuestro origen
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 24px', letterSpacing: '-0.02em' }}>
            Nacimos escuchando a las mujeres de Tlaxcala
          </h2>
          <p style={{ fontSize: '15px', color: '#7a6870', lineHeight: '1.8', margin: '0 0 20px', maxWidth: '760px' }}>
            MN WOMAN surgió de un diagnóstico realizado con más de 70 mujeres de la red de
            Revista Momento, cuyas respuestas definieron los módulos que hoy forman la
            plataforma: directorio, reuniones y eventos, servicios, oportunidades, cursos,
            línea de apoyo 911 y temas de interés.
          </p>
          <p style={{ fontSize: '15px', color: '#7a6870', lineHeight: '1.8', margin: 0, maxWidth: '760px' }}>
            Pensamos esta red como una evolución del modelo tradicional de networking,
            diseñada exclusivamente para mujeres emprendedoras, profesionales y académicas
            de la región.
          </p>
        </div>
      </section>

      {/* ── QUIÉNES IMPULSAN LA RED ── */}
      <section className="section-pad" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
              Comunidad
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 10px', letterSpacing: '-0.02em' }}>
              Quiénes impulsan la red
            </h2>
            <p style={{ fontSize: '15px', color: '#7a6870', margin: '0 auto', maxWidth: '560px' }}>
              MN WOMAN es posible gracias a las organizaciones y aliadas que respaldan
              este proyecto desde su origen.
            </p>
          </div>

          <div className="grid-3">
            {[
              { icon: <Handshake size={20} color="#B66878" />, title: 'Revista Momento', desc: 'Socio estratégico de lanzamiento y origen del diagnóstico que dio forma a la red.' },
              { icon: <Users size={20} color="#B66878" />, title: 'Las Hijas de la Malinche', desc: 'Colectivo aliado que impulsa el liderazgo femenino en Tlaxcala.' },
              { icon: <Sparkles size={20} color="#B66878" />, title: 'Festival Tlaxqui', desc: 'Espacio cultural colaborador en la difusión y visibilidad de la red.' },
            ].map((item) => (
              <div key={item.title} className="card-hover" style={{ border: '1px solid #f0e6e9', borderRadius: '16px', padding: '32px 26px', background: '#fff', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#FDF0F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: '#0f0a0b', letterSpacing: '-0.01em' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#7a6870', lineHeight: '1.6', margin: 0 }}>
                  {item.desc}
                </p>
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
    </main>
  )
}

export default SobreNosotros