import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, TrendingUp, Heart, Clock, MapPin, Calendar } from 'lucide-react'
import BannerSlot from '../components/BannerSlot'

const API_BASE = 'http://127.0.0.1:8000/api'

// ── Imágenes del hero ──
// Reemplaza estas 2 URLs por tus fotos reales cuando las tengas.
// FOTO_PRINCIPAL: foto grande, formato cuadrado/vertical, recorte "blob" orgánico.
// FOTO_SECUNDARIA: foto chica, se muestra en círculo, sobrepuesta a la principal.
const FOTO_PRINCIPAL = 'https://scontent.fpbc4-1.fna.fbcdn.net/v/t39.30808-6/686915631_122240814806263222_7699288192315071541_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=101&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=iUBVIL5exyoQ7kNvwFLd4aM&_nc_oc=AdpoRTcxMqrwBiiLufB7njNC3BYec_Y834o7Ue4Yv26WugRWt_9XOEG0EPW2KAksCG0iBS8euaI8eKRpZLeKJO6l&_nc_zt=23&_nc_ht=scontent.fpbc4-1.fna&_nc_gid=MZeC1AK4FwMmqp6Fuuobgw&_nc_ss=7d289&oh=00_AQCne1CX_LTrjEzLImBnoHAcArSAdgAEpLOj7YcGp2p8Jg&oe=6A5CC8AA'
const FOTO_SECUNDARIA = 'https://scontent.fpbc4-1.fna.fbcdn.net/v/t39.30808-6/561244963_122215161728263222_1523564337223235152_n.jpg?stp=dst-jpg_tt6&cstp=mx940x788&ctp=s940x788&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=eAQQtC7TMLMQ7kNvwFys5lR&_nc_oc=AdqQ7yzCCux4ul2nOBiIGMgyyzXGUFfjqApeeitvUIdfA5jS1AeuWJ6KFYvKn5urueCadF0X9O6lW4g4AXQ-beXt&_nc_zt=23&_nc_ht=scontent.fpbc4-1.fna&_nc_gid=UjmAYMYo59y762HpP5Y4hg&_nc_ss=7d289&oh=00_AQDRw74DlwyCZBvE_efLu9Fk53nJ5_effAs6xV0G0hnYAQ&oe=6A5CA569'

interface Article {
  id: number
  title: string
  cover_image_url: string | null
  external_url: string
  category_display: string
}

interface Evento {
  id: number
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  hotel: string
  cover_image: string | null
  total_asistentes: number
}

interface Curso {
  id: number
  title: string
  description: string
  category: string
  level: string
  duration_hours: number
  thumbnail: string | null
  nombre_instructora: string | null
  total_inscritas: number
}

interface Institucion {
  id: number
  nombre: string
  telefono: string
  horario: string
  direccion: string
}

const LandingPage = () => {
  const navigate = useNavigate()
  const [articles, setArticles]           = useState<Article[]>([])
  const [eventos, setEventos]             = useState<Evento[]>([])
  const [cursos, setCursos]               = useState<Curso[]>([])
  const [instituciones, setInstituciones] = useState<Institucion[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/articles/public/`).then(r => r.json()).then(d => setArticles(Array.isArray(d) ? d.slice(0, 6) : [])).catch(() => {})
    fetch(`${API_BASE}/eventos/public/`).then(r => r.json()).then(d => setEventos(Array.isArray(d) ? d.slice(0, 3) : [])).catch(() => {})
    fetch(`${API_BASE}/cursos/public/`).then(r => r.json()).then(d => setCursos(Array.isArray(d) ? d.slice(0, 4) : [])).catch(() => {})
    fetch(`${API_BASE}/linea911/public/`).then(r => r.json()).then(d => setInstituciones(Array.isArray(d) ? d.slice(0, 4) : [])).catch(() => {})
  }, [])

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  const nivelLabel: Record<string, string> = {
    basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado',
  }

  return (
    <main style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", backgroundColor: '#FBF8F4' }}>
      <style>{`
        /* ── Responsive helpers ── */

        /* HERO */
        .hero-section { padding: 110px 64px 90px; min-height: 86vh; }
        .hero-title { font-size: 56px; }
        .hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-grid { flex-wrap: wrap; }

        /* Section padding */
        .section-pad { padding: 96px 64px; }

        /* Grids */
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .grid-pilares { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr; gap: 20px; }

        /* Section header row */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 48px;
          flex-wrap: wrap;
          gap: 16px;
        }

        /* Colaboradores */
        .colabs { display: flex; justify-content: center; align-items: center; gap: 48px; flex-wrap: wrap; }

        /* CTA */
        .cta-section { padding: 100px 64px; text-align: center; }
        .cta-title { font-size: 40px; }

        /* Hover consistente para todas las cards */
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(182, 104, 120, 0.14);
          border-color: #edd8de;
        }
        .pilar-card:hover .pilar-icon-wrap { background-color: #B66878; }
        .pilar-card:hover .pilar-icon-wrap svg { stroke: #fff !important; }

        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          .hero-section { padding: 72px 32px; min-height: unset; }
          .hero-title { font-size: 42px; }
          .hero-grid { flex-direction: column-reverse; text-align: left; }
          .hero-illustration { max-width: 300px !important; margin-bottom: 20px; }
          .section-pad { padding: 64px 32px; }
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-3 { grid-template-columns: repeat(2, 1fr); }
          .grid-2 { grid-template-columns: 1fr; }
          .grid-pilares { grid-template-columns: repeat(2, 1fr); }
          .cta-section { padding: 72px 32px; }
          .cta-title { font-size: 32px; }
          .colabs { gap: 28px; }
        }

        /* ── Mobile (≤ 600px) ── */
        @media (max-width: 600px) {
          .hero-section { padding: 52px 20px 40px; }
          .hero-title { font-size: 32px; letter-spacing: -0.01em; }
          .hero-buttons { flex-direction: column; }
          .hero-buttons button { width: 100%; justify-content: center; }
          .hero-illustration { max-width: 240px !important; }
          .section-pad { padding: 48px 20px; }
          .grid-4 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          .grid-pilares { grid-template-columns: 1fr; }
          .section-header { flex-direction: column; align-items: flex-start; }
          .section-header button, .section-header a { align-self: flex-start; }
          .cta-section { padding: 56px 20px; }
          .cta-title { font-size: 27px; }
          .colabs { gap: 20px; }
          .colabs-section { padding: 40px 20px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        background: 'linear-gradient(150deg, #fdf2f4 0%, #fce8f0 55%, #fbf8f4 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-80px', top: '8%',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'rgba(182, 104, 120, 0.06)', pointerEvents: 'none',
        }} />

        <div className="hero-grid" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', maxWidth: '1220px', margin: '0 auto', gap: '40px',
          position: 'relative', zIndex: 1,
        }}>
          {/* ── Columna texto ── */}
          <div style={{ maxWidth: '600px', flex: '1 1 480px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: '600', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#B66878',
              background: 'rgba(182,104,120,0.1)', padding: '6px 14px',
              borderRadius: '100px', marginBottom: '28px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A15A', display: 'inline-block' }} />
              Red de negocios para mujeres
            </span>
            <h1 className="hero-title" style={{
              fontWeight: '800', lineHeight: '1.1',
              color: '#0f0a0b', letterSpacing: '-0.02em', margin: '0 0 28px',
            }}>
              Mujeres que lideran,{' '}
              <span style={{ color: '#B66878' }}>conectan</span>{' '}
              y transforman el ecosistema.
            </h1>
            <p style={{ fontSize: '19px', color: '#6b5b61', lineHeight: '1.75', margin: '0 0 40px', maxWidth: '540px' }}>
              Únete a la red de negocios más activa para mujeres emprendedoras y líderes.
              Potenciamos tu impacto profesional mediante recursos exclusivos y conexiones estratégicas.
            </p>
            <div className="hero-buttons" style={{ marginBottom: '40px' }}>
              <button onClick={() => navigate('/register')} style={{
                padding: '14px 32px', backgroundColor: '#B66878', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '600',
                cursor: 'pointer', letterSpacing: '0.01em',
              }}>
                Solicitar ingreso
              </button>
              <button onClick={() => navigate('/login')} style={{
                padding: '14px 32px', backgroundColor: 'transparent', color: '#B66878',
                border: '1.5px solid #B66878', borderRadius: '10px', fontSize: '17px',
                fontWeight: '600', cursor: 'pointer', letterSpacing: '0.01em',
              }}>
                Iniciar sesión
              </button>
            </div>
          </div>

          {/* ── Columna imagen: collage de fotos ── */}
          <div className="hero-illustration" style={{ flex: '1 1 400px', maxWidth: '420px', width: '100%', position: 'relative' }}>
            {/* halo suave detrás de la foto */}
            <div style={{
              position: 'absolute', top: '-20px', left: '-20px', right: '20px', bottom: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(160deg, #fce3e8, #f8d3db)',
              zIndex: 0,
            }} />

            {/* foto principal, circular */}
            <div style={{
              position: 'relative', zIndex: 1, width: '100%', aspectRatio: '1 / 1',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 24px 50px rgba(182,104,120,0.22)',
            }}>
              <img
                src={FOTO_PRINCIPAL}
                alt="Miembro de la red MN WOMAN"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* foto secundaria, circular, sobrepuesta */}
            <div style={{
              position: 'absolute', zIndex: 2, bottom: '-6%', left: '-8%',
              width: '34%', aspectRatio: '1 / 1', borderRadius: '50%',
              overflow: 'hidden', border: '5px solid #fff',
              boxShadow: '0 12px 28px rgba(0,0,0,0.14)',
            }}>
              <img
                src={FOTO_SECUNDARIA}
                alt="Miembro de la red MN WOMAN"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* tarjeta flotante */}
            <div style={{
              position: 'absolute', zIndex: 2, top: '8%', right: '-10%',
              background: '#fff', borderRadius: '14px', padding: '12px 16px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: '10px',
              maxWidth: '190px',
            }}>
              <span style={{
                width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#FDF0F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Users size={16} color="#B66878" />
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#3a2c30', lineHeight: '1.3' }}>
                Comunidad activa en Tlaxcala
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── hilo conector: transición hero → pilares ── */}
      <div style={{ position: 'relative', height: '0', overflow: 'visible' }} aria-hidden="true">
        <svg width="100%" height="60" style={{ position: 'relative', top: '-30px', display: 'block' }} preserveAspectRatio="none" viewBox="0 0 1200 60">
          <path d="M0 30 C 300 0, 900 60, 1200 30" stroke="#B66878" strokeOpacity="0.18" strokeWidth="2" fill="none" strokeDasharray="1 10" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── PILARES ── */}
      <section className="section-pad" style={{ backgroundColor: '#fff', position: 'relative' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px', maxWidth: '560px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
              Nuestra esencia
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 0', letterSpacing: '-0.02em' }}>
              Cuatro pilares que sostienen la red
            </h2>
          </div>

          <div className="grid-pilares">
            {[
              { icon: <Shield size={22} color="#B66878" />, title: 'Liderazgo', desc: 'Potenciamos habilidades directivas y estratégicas para que tomes el control de tu destino empresarial.', feature: true },
              { icon: <Users size={20} color="#B66878" />, title: 'Conexión', desc: 'Creamos puentes reales entre profesionales, mentoras e inversoras de toda la región.' },
              { icon: <TrendingUp size={20} color="#B66878" />, title: 'Impulso', desc: 'Acceso a formación de vanguardia y recursos diseñados para el crecimiento personal.' },
              { icon: <Heart size={20} color="#B66878" />, title: 'Sororidad', desc: 'Fomentamos una cultura de apoyo mutuo y responsabilidad social entre nuestras miembros.' },
            ].map((pilar) => (
              <div key={pilar.title} className="card-hover pilar-card" style={{
                border: pilar.feature ? '1px solid #f0d9df' : '1px solid #f0e6e9',
                borderRadius: '18px',
                padding: pilar.feature ? '40px 32px' : '32px 26px',
                background: pilar.feature ? 'linear-gradient(160deg, #FDF0F2 0%, #fff 70%)' : '#fff',
                position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: pilar.feature ? '#C9A15A' : '#B66878', opacity: 0.55 }} />
                <div className="pilar-icon-wrap" style={{
                  width: pilar.feature ? '54px' : '46px', height: pilar.feature ? '54px' : '46px',
                  backgroundColor: '#FDF0F2', borderRadius: '13px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '22px',
                  transition: 'background-color 0.2s ease',
                }}>
                  {pilar.icon}
                </div>
                <h3 style={{ fontSize: pilar.feature ? '19px' : '17px', fontWeight: '700', marginBottom: '10px', color: '#0f0a0b', letterSpacing: '-0.01em' }}>
                  {pilar.title}
                </h3>
                <p style={{ fontSize: '15.5px', color: '#7a6870', lineHeight: '1.65', margin: 0 }}>
                  {pilar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRÓXIMOS EVENTOS ── */}
      {eventos.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fdf6f8' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
                  Agenda
                </span>
                <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 8px', letterSpacing: '-0.02em' }}>
                  Próximos eventos
                </h2>
                <p style={{ fontSize: '17px', color: '#7a6870', margin: 0 }}>
                  Espacios para conectar, compartir y crecer juntas.
                </p>
              </div>
              <button onClick={() => navigate('/login')} style={{
                fontSize: '15px', color: '#B66878', fontWeight: '700',
                background: '#fff', border: '1.5px solid #B66878', borderRadius: '10px',
                padding: '10px 20px', cursor: 'pointer',
              }}>
                Ver todos →
              </button>
            </div>

            <div className="grid-3">
              {eventos.map(evento => (
                <div key={evento.id} className="card-hover" style={{ background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #f0e6e9' }}>
                  <div style={{ height: '200px', background: '#FDF0F2', overflow: 'hidden', position: 'relative' }}>
                    {evento.cover_image
                      ? <img src={evento.cover_image} alt={evento.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>📅</div>
                    }
                    <div style={{
                      position: 'absolute', top: '14px', left: '14px',
                      background: '#fff', borderRadius: '10px', padding: '8px 14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#B66878', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {new Date(evento.date).toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f0a0b', lineHeight: '1.1' }}>
                        {new Date(evento.date).getDate()}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0f0a0b', margin: '0 0 16px', lineHeight: '1.35', letterSpacing: '-0.01em' }}>
                      {evento.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '15px', color: '#5c4c52', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#B66878" /> {formatFecha(evento.date)}
                      </span>
                      <span style={{ fontSize: '15px', color: '#5c4c52', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#B66878" /> {evento.start_time} – {evento.end_time}
                      </span>
                      {evento.hotel && (
                        <span style={{ fontSize: '15px', color: '#5c4c52', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} color="#B66878" /> {evento.hotel}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f0e6e9' }}>
                      <span style={{ fontSize: '14px', color: '#b0a0a6', fontWeight: '500' }}>{evento.total_asistentes} confirmadas</span>
                      <button onClick={() => navigate(`/eventos/${evento.id}`)} style={{
                        fontSize: '13px', color: '#fff', fontWeight: '700', background: '#B66878',
                        border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                      }}>
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CURSOS ── */}
      {cursos.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '5px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.04em' }}>
                  Centro de Formación MN WOMAN
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '14px 0 6px', letterSpacing: '-0.02em' }}>
                  Impulsa tu <span style={{ color: '#B66878' }}>liderazgo</span>
                </h2>
                <p style={{ fontSize: '17px', color: '#7a6870', margin: 0 }}>
                  Programas especializados diseñados por y para mujeres.
                </p>
              </div>
              <button onClick={() => navigate('/cursos')} style={{ fontSize: '15px', color: '#B66878', fontWeight: '600', background: 'none', border: '1px solid #f0e6e9', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                Ver todos los cursos →
              </button>
            </div>

            <div className="grid-4">
              {cursos.map(curso => (
                <div key={curso.id} className="card-hover" style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f0e6e9', cursor: 'pointer' }}
                  onClick={() => navigate(`/cursos/${curso.id}`)}>
                  <div style={{ height: '130px', background: '#FDF0F2', overflow: 'hidden' }}>
                    {curso.thumbnail
                      ? <img src={curso.thumbnail} alt={curso.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎓</div>
                    }
                  </div>
                  <div style={{ padding: '18px' }}>
                    <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
                      {curso.category}
                    </span>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f0a0b', margin: '10px 0 4px', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                      {curso.title}
                    </p>
                    {curso.nombre_instructora && (
                      <p style={{ fontSize: '14px', color: '#b0a0a6', margin: '0 0 10px' }}>
                        Por {curso.nombre_instructora}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f0e6e9' }}>
                      <span style={{ fontSize: '13px', color: '#b0a0a6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#b0a0a6" /> {curso.duration_hours}h
                      </span>
                      <span style={{ fontSize: '12px', color: '#7a6870', background: '#faf8f9', padding: '3px 10px', borderRadius: '100px', border: '1px solid #f0e6e9' }}>
                        {nivelLabel[curso.level] || curso.level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TEMAS DE INTERÉS ── */}
      {articles.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fdf6f8' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
                  Recursos
                </span>
                <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 8px', letterSpacing: '-0.02em' }}>
                  Temas de interés
                </h2>
                <p style={{ fontSize: '17px', color: '#7a6870', margin: 0 }}>
                  Artículos seleccionados para tu crecimiento profesional y bienestar.
                </p>
              </div>
              <a href="/articulos" style={{ fontSize: '15px', color: '#B66878', fontWeight: '700', textDecoration: 'none', border: '1.5px solid #B66878', borderRadius: '10px', padding: '10px 20px' }}>
                Ver todos →
              </a>
            </div>

            <div className="grid-3">
              {articles.map(articulo => (
                <a key={articulo.id} href={articulo.external_url} target="_blank" rel="noreferrer" className="card-hover" style={{
                  textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #f0e6e9',
                  borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ height: '190px', background: '#FDF0F2', overflow: 'hidden', position: 'relative' }}>
                    {articulo.cover_image_url
                      ? <img src={articulo.cover_image_url} alt={articulo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>🌸</div>
                    }
                    <span style={{
                      position: 'absolute', top: '14px', left: '14px',
                      backgroundColor: '#fff', color: '#B66878', padding: '5px 14px',
                      borderRadius: '100px', fontSize: '13px', fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}>
                      {articulo.category_display}
                    </span>
                  </div>
                  <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    <p style={{ fontSize: '17px', fontWeight: '700', color: '#0f0a0b', lineHeight: '1.4', flex: 1, margin: 0, letterSpacing: '-0.01em' }}>
                      {articulo.title}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f0e6e9' }}>
                      <span style={{ fontSize: '14px', color: '#B66878', fontWeight: '700' }}>Leer artículo →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LÍNEA 911 ── */}
      {instituciones.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
                  Apoyo
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '10px 0 6px', letterSpacing: '-0.02em' }}>
                  Un espacio para apoyarte
                </h2>
                <p style={{ fontSize: '17px', color: '#7a6870', margin: 0 }}>
                  Instituciones y recursos disponibles para ti en Tlaxcala.
                </p>
              </div>
              <button onClick={() => navigate('/login')} style={{ fontSize: '15px', color: '#B66878', fontWeight: '600', background: 'none', border: '1px solid #f0e6e9', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                Ver directorio completo →
              </button>
            </div>

            <div className="grid-4">
              {instituciones.map(inst => (
                <div key={inst.id} className="card-hover" style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f0e6e9' }}>
                  <div style={{ width: '44px', height: '44px', background: '#FDF0F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontSize: '18px', border: '1px solid #f0e6e9' }}>
                    🛡️
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f0a0b', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                    {inst.nombre}
                  </h3>
                  {inst.telefono  && <p style={{ fontSize: '15px', color: '#7a6870', margin: '0 0 5px' }}>📞 {inst.telefono}</p>}
                  {inst.horario   && <p style={{ fontSize: '15px', color: '#7a6870', margin: '0 0 5px' }}>🕐 {inst.horario}</p>}
                  {inst.direccion && <p style={{ fontSize: '14px', color: '#b0a0a6', margin: '6px 0 0' }}>📍 {inst.direccion}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BANNER ── */}
      <BannerSlot posicion="landing_pre_footer" titulo="Presencia" />

      {/* ── COLABORADORES ── */}
      <section className="colabs-section" style={{ padding: '52px 64px', backgroundColor: '#fdf6f8' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#b0a0a6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px', fontWeight: '600' }}>
            Con el respaldo de
          </p>
          <div className="colabs">
            {['Revista Momento', 'Las Hijas de la Malinche', 'Festival Tlaxqui', 'Networking'].map((colab, i, arr) => (
              <span key={colab} style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                <span style={{ fontSize: '17px', fontWeight: '600', color: '#c9b6bb', letterSpacing: '0.04em' }}>
                  {colab}
                </span>
                {i < arr.length - 1 && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C9A15A', opacity: 0.5, display: 'inline-block' }} />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" style={{
        background: 'linear-gradient(150deg, #f5e8eb 0%, #f0dde2 100%)',
        borderTop: '1px solid #edd8de', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: '-60px', top: '-60px', width: '220px', height: '220px',
          borderRadius: '50%', background: 'rgba(201,161,90,0.06)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'inline-block', fontSize: '13px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878', marginBottom: '20px', opacity: 0.85 }}>
            Únete hoy
          </span>
          <h2 className="cta-title" style={{ fontWeight: '800', color: '#2d1219', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            ¿Lista para transformar tu negocio?
          </h2>
          <p style={{ fontSize: '19px', color: '#7a4a54', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px', lineHeight: '1.65' }}>
            Forma parte de la comunidad que está cambiando el ecosistema empresarial.
          </p>
          <button onClick={() => navigate('/register')} style={{ padding: '15px 44px', backgroundColor: '#B66878', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.01em' }}>
            Solicitar ingreso
          </button>
        </div>
      </section>

    </main>
  )
}

export default LandingPage