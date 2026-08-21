import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, TrendingUp, Heart, Clock, MapPin, Calendar } from 'lucide-react'
import BannerSlot from '../components/BannerSlot'
import api from '../api/axios'
import fotoPrincipal from '../assets/hero-1.jpg'
import fotoSecundaria from '../assets/hero-2.jpg'

const FOTO_PRINCIPAL = fotoPrincipal
const FOTO_SECUNDARIA = fotoSecundaria

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
  titulo: string
  descripcion: string
  categoria_display: string
  nivel_display: string
  duracion_horas: number
  imagen: string | null
  instructor: string | null
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
    // Artículos: los más recientes primero (id más alto = creado después)
    api.get('/articles/public/')
      .then(({ data }) => {
        const ordenados = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : []
        setArticles(ordenados.slice(0, 6))
      })
      .catch(() => {})

    // Eventos: el más próximo a suceder primero
    api.get('/eventos/public/')
      .then(({ data }) => {
        const ordenados = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          : []
        setEventos(ordenados.slice(0, 3))
      })
      .catch(() => {})

    // Cursos: los más recientes primero
    api.get('/cursos/')
      .then(({ data }) => {
        const ordenados = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : []
        setCursos(ordenados.slice(0, 4))
      })
      .catch(() => {})

    api.get('/linea911/public/')
      .then(({ data }) => setInstituciones(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {})
  }, [])

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  // Temas de Interés: el primero se vuelve la tarjeta grande, el resto va en la lista chica
  const articuloDestacado = articles[0]
  const articulosLista = articles.slice(1, 6)

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

        /* Temas de interés: tarjeta grande + lista chica */
        .articulos-notorio {
          display: flex;
          align-items: stretch;
          gap: 28px;
        }
        .articulo-destacado-grande {
          flex: 1.15 1 380px;
          min-height: 460px;
        }
        .articulos-lista-chica {
          flex: 1 1 340px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .articulo-chico-thumb {
          width: 76px;
          height: 76px;
          flex-shrink: 0;
        }
        .articulo-chico-titulo {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

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
          .articulos-notorio { flex-direction: column; }
          .articulo-destacado-grande { min-height: 320px; }
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
          .articulo-destacado-grande { min-height: 280px; }
          .articulo-chico-thumb { width: 64px; height: 64px; }
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
                    {curso.imagen
                      ? <img src={curso.imagen} alt={curso.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎓</div>
                    }
                  </div>
                  <div style={{ padding: '18px' }}>
                    <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
                      {curso.categoria_display}
                    </span>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f0a0b', margin: '10px 0 4px', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                      {curso.titulo}
                    </p>
                    {curso.instructor && (
                      <p style={{ fontSize: '14px', color: '#b0a0a6', margin: '0 0 10px' }}>
                        Por {curso.instructor}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f0e6e9' }}>
                      <span style={{ fontSize: '13px', color: '#b0a0a6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#b0a0a6" /> {curso.duracion_horas}h
                      </span>
                      <span style={{ fontSize: '12px', color: '#7a6870', background: '#faf8f9', padding: '3px 10px', borderRadius: '100px', border: '1px solid #f0e6e9' }}>
                        {curso.nivel_display}
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
      {articuloDestacado && (
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

            <div className="articulos-notorio">
              {/* Tarjeta grande: el artículo más reciente */}
              <a
                href={articuloDestacado.external_url}
                target="_blank"
                rel="noreferrer"
                className="card-hover articulo-destacado-grande"
                style={{
                  textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #f0e6e9',
                  borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}
              >
                <div style={{ flex: 1, background: '#FDF0F2', overflow: 'hidden', position: 'relative', minHeight: '220px' }}>
                  {articuloDestacado.cover_image_url
                    ? <img src={articuloDestacado.cover_image_url} alt={articuloDestacado.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>🌸</div>
                  }
                  <span style={{
                    position: 'absolute', top: '16px', left: '16px',
                    backgroundColor: '#fff', color: '#B66878', padding: '5px 14px',
                    borderRadius: '100px', fontSize: '13px', fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    {articuloDestacado.category_display}
                  </span>
                </div>
                <div style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: '#0f0a0b', lineHeight: '1.35', margin: 0, letterSpacing: '-0.01em' }}>
                    {articuloDestacado.title}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f0e6e9' }}>
                    <span style={{ fontSize: '14px', color: '#B66878', fontWeight: '700' }}>Leer artículo →</span>
                  </div>
                </div>
              </a>

              {/* Lista chica: el resto */}
              {articulosLista.length > 0 && (
                <div className="articulos-lista-chica">
                  {articulosLista.map(articulo => (
                    <a
                      key={articulo.id}
                      href={articulo.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="card-hover"
                      style={{
                        textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #f0e6e9',
                        borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', gap: '14px',
                      }}
                    >
                      <div className="articulo-chico-thumb" style={{ borderRadius: '10px', overflow: 'hidden', background: '#FDF0F2' }}>
                        {articulo.cover_image_url
                          ? <img src={articulo.cover_image_url} alt={articulo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🌸</div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#B66878', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {articulo.category_display}
                        </span>
                        <p className="articulo-chico-titulo" style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f0a0b', margin: '4px 0 0', lineHeight: '1.4' }}>
                          {articulo.title}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
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