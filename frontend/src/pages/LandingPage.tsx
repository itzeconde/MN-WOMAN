import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, TrendingUp, Heart, Clock, MapPin, Calendar } from 'lucide-react'
import BannerSlot from '../components/BannerSlot'

const API_BASE = 'http://127.0.0.1:8000/api'

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
    <main style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        /* ── Responsive helpers ── */

        /* HERO */
        .hero-section {
          padding: 120px 64px;
          min-height: 88vh;
        }
        .hero-title { font-size: 58px; }
        .hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; }

        /* Section padding */
        .section-pad { padding: 96px 64px; }

        /* Grids */
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

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
        .cta-section { padding: 96px 64px; text-align: center; }
        .cta-title { font-size: 40px; }

        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          .hero-section { padding: 80px 32px; min-height: unset; }
          .hero-title { font-size: 42px; }
          .section-pad { padding: 64px 32px; }
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-3 { grid-template-columns: repeat(2, 1fr); }
          .cta-section { padding: 64px 32px; }
          .cta-title { font-size: 32px; }
          .colabs { gap: 28px; }
        }

        /* ── Mobile (≤ 600px) ── */
        @media (max-width: 600px) {
          .hero-section { padding: 56px 20px; }
          .hero-title { font-size: 32px; letter-spacing: -0.01em; }
          .hero-buttons { flex-direction: column; }
          .hero-buttons button { width: 100%; justify-content: center; }
          .section-pad { padding: 48px 20px; }
          .grid-4 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          .section-header { flex-direction: column; align-items: flex-start; }
          .section-header button, .section-header a { align-self: flex-start; }
          .cta-section { padding: 56px 20px; }
          .cta-title { font-size: 26px; }
          .colabs { gap: 20px; }
          .colabs-section { padding: 40px 20px; }
        }
      `}</style>

      {/* HERO */}
      <section className="hero-section" style={{
        background: 'linear-gradient(150deg, #fdf2f4 0%, #fce8f0 60%, #fdf6f8 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-80px', top: '10%',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'rgba(182, 104, 120, 0.06)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '80px', bottom: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'rgba(182, 104, 120, 0.04)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block',
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#B66878',
            background: 'rgba(182,104,120,0.1)', padding: '6px 14px',
            borderRadius: '100px', marginBottom: '28px',
          }}>
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
          <p style={{ fontSize: '17px', color: '#6b5b61', lineHeight: '1.75', margin: '0 0 44px', maxWidth: '540px' }}>
            Únete a la red de negocios más activa para mujeres emprendedoras y líderes.
            Potenciamos tu impacto profesional mediante recursos exclusivos y conexiones estratégicas.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/register')} style={{
              padding: '14px 32px', backgroundColor: '#B66878', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', letterSpacing: '0.01em',
            }}>
              Solicitar ingreso
            </button>
            <button onClick={() => navigate('/login')} style={{
              padding: '14px 32px', backgroundColor: 'transparent', color: '#B66878',
              border: '1.5px solid #B66878', borderRadius: '10px', fontSize: '15px',
              fontWeight: '600', cursor: 'pointer', letterSpacing: '0.01em',
            }}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="section-pad" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <span style={{
              fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#B66878',
            }}>
              Nuestra esencia
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#0f0a0b', margin: '12px 0 0', letterSpacing: '-0.02em' }}>
              4 Pilares
            </h2>
          </div>

          <div className="grid-4">
            {[
              { icon: <Shield size={20} color="#B66878" />, title: 'Liderazgo', desc: 'Potenciamos habilidades directivas y estratégicas para que tomes el control de tu destino empresarial.' },
              { icon: <Users size={20} color="#B66878" />, title: 'Conexión', desc: 'Creamos puentes reales entre profesionales, mentoras e inversoras de toda la región.' },
              { icon: <TrendingUp size={20} color="#B66878" />, title: 'Impulso', desc: 'Acceso a formación de vanguardia y recursos diseñados para el crecimiento personal.' },
              { icon: <Heart size={20} color="#B66878" />, title: 'Sororidad', desc: 'Fomentamos una cultura de apoyo mutuo y responsabilidad social entre nuestras miembros.' },
            ].map((pilar) => (
              <div key={pilar.title} style={{
                border: '1px solid #f0e6e9', borderRadius: '16px', padding: '36px 28px',
                background: '#fff', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#B66878', opacity: 0.6 }} />
                <div style={{
                  width: '48px', height: '48px', backgroundColor: '#FDF0F2',
                  borderRadius: '12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '20px',
                }}>
                  {pilar.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: '#0f0a0b', letterSpacing: '-0.01em' }}>
                  {pilar.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#7a6870', lineHeight: '1.65', margin: 0 }}>
                  {pilar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS */}
      {eventos.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
                  Agenda
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '10px 0 6px', letterSpacing: '-0.02em' }}>
                  Próximos Eventos
                </h2>
                <p style={{ fontSize: '15px', color: '#7a6870', margin: 0 }}>
                  Espacios para conectar, compartir y crecer juntas.
                </p>
              </div>
              <button onClick={() => navigate('/login')} style={{
                fontSize: '14px', color: '#B66878', fontWeight: '600',
                background: 'none', border: '1px solid #f0e6e9', borderRadius: '8px',
                padding: '8px 16px', cursor: 'pointer',
              }}>
                Ver todos →
              </button>
            </div>

            <div className="grid-3">
              {eventos.map(evento => (
                <div key={evento.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0e6e9' }}>
                  <div style={{ height: '168px', background: '#FDF0F2', overflow: 'hidden' }}>
                    {evento.cover_image
                      ? <img src={evento.cover_image} alt={evento.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>📅</div>
                    }
                  </div>
                  <div style={{ padding: '22px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f0a0b', margin: '0 0 14px', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                      {evento.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px' }}>
                      <span style={{ fontSize: '13px', color: '#7a6870', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <Calendar size={13} color="#B66878" /> {formatFecha(evento.date)}
                      </span>
                      <span style={{ fontSize: '13px', color: '#7a6870', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <Clock size={13} color="#B66878" /> {evento.start_time} – {evento.end_time}
                      </span>
                      {evento.hotel && (
                        <span style={{ fontSize: '13px', color: '#7a6870', display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <MapPin size={13} color="#B66878" /> {evento.hotel}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #f0e6e9' }}>
                      <span style={{ fontSize: '12px', color: '#b0a0a6' }}>{evento.total_asistentes} confirmadas</span>
                      <button onClick={() => navigate(`/eventos/${evento.id}`)} style={{ fontSize: '13px', color: '#B66878', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>
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

      {/* CURSOS */}
      {cursos.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '5px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.04em' }}>
                  Centro de Formación MN WOMAN
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '14px 0 6px', letterSpacing: '-0.02em' }}>
                  Impulsa tu <span style={{ color: '#B66878' }}>liderazgo</span>
                </h2>
                <p style={{ fontSize: '15px', color: '#7a6870', margin: 0 }}>
                  Programas especializados diseñados por y para mujeres.
                </p>
              </div>
              <button onClick={() => navigate('/login')} style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', background: 'none', border: '1px solid #f0e6e9', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                Ver todos los cursos →
              </button>
            </div>

            <div className="grid-4">
              {cursos.map(curso => (
                <div key={curso.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0e6e9' }}>
                  <div style={{ height: '130px', background: '#FDF0F2', overflow: 'hidden' }}>
                    {curso.thumbnail
                      ? <img src={curso.thumbnail} alt={curso.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎓</div>
                    }
                  </div>
                  <div style={{ padding: '18px' }}>
                    <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                      {curso.category}
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f0a0b', margin: '10px 0 4px', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                      {curso.title}
                    </p>
                    {curso.nombre_instructora && (
                      <p style={{ fontSize: '12px', color: '#b0a0a6', margin: '0 0 10px' }}>
                        Por {curso.nombre_instructora}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f0e6e9' }}>
                      <span style={{ fontSize: '12px', color: '#b0a0a6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#b0a0a6" /> {curso.duration_hours}h
                      </span>
                      <span style={{ fontSize: '11px', color: '#7a6870', background: '#faf8f9', padding: '3px 10px', borderRadius: '100px', border: '1px solid #f0e6e9' }}>
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

      {/* TEMAS DE INTERÉS */}
      {articles.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
                  Recursos
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '10px 0 6px', letterSpacing: '-0.02em' }}>
                  Temas de Interés
                </h2>
                <p style={{ fontSize: '15px', color: '#7a6870', margin: 0 }}>
                  Artículos seleccionados para tu crecimiento profesional y bienestar.
                </p>
              </div>
              <a href="/articulos" style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', textDecoration: 'none', border: '1px solid #f0e6e9', borderRadius: '8px', padding: '8px 16px' }}>
                Ver todos →
              </a>
            </div>

            <div className="grid-3">
              {articles.map(articulo => (
                <a key={articulo.id} href={articulo.external_url} target="_blank" rel="noreferrer" style={{
                  textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #f0e6e9',
                  borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ height: '168px', background: '#FDF0F2', overflow: 'hidden' }}>
                    {articulo.cover_image_url
                      ? <img src={articulo.cover_image_url} alt={articulo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🌸</div>
                    }
                  </div>
                  <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', width: 'fit-content' }}>
                      {articulo.category_display}
                    </span>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#0f0a0b', lineHeight: '1.5', flex: 1, margin: 0, letterSpacing: '-0.01em' }}>
                      {articulo.title}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f0e6e9' }}>
                      <span style={{ fontSize: '13px', color: '#B66878', fontWeight: '700' }}>Leer →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LÍNEA 911 */}
      {instituciones.length > 0 && (
        <section className="section-pad" style={{ backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div className="section-header">
              <div>
                <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878' }}>
                  Apoyo
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0a0b', margin: '10px 0 6px', letterSpacing: '-0.02em' }}>
                  Un Espacio para Apoyarte
                </h2>
                <p style={{ fontSize: '15px', color: '#7a6870', margin: 0 }}>
                  Instituciones y recursos disponibles para ti en Tlaxcala.
                </p>
              </div>
              <button onClick={() => navigate('/login')} style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', background: 'none', border: '1px solid #f0e6e9', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                Ver directorio completo →
              </button>
            </div>

            <div className="grid-4">
              {instituciones.map(inst => (
                <div key={inst.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f0e6e9' }}>
                  <div style={{ width: '44px', height: '44px', background: '#FDF0F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontSize: '18px', border: '1px solid #f0e6e9' }}>
                    🛡️
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f0a0b', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                    {inst.nombre}
                  </h3>
                  {inst.telefono  && <p style={{ fontSize: '13px', color: '#7a6870', margin: '0 0 5px' }}>📞 {inst.telefono}</p>}
                  {inst.horario   && <p style={{ fontSize: '13px', color: '#7a6870', margin: '0 0 5px' }}>🕐 {inst.horario}</p>}
                  {inst.direccion && <p style={{ fontSize: '12px', color: '#b0a0a6', margin: '6px 0 0' }}>📍 {inst.direccion}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BANNER */}
      <BannerSlot posicion="landing_pre_footer" titulo="Presencia" />

      {/* COLABORADORES */}
      <section className="colabs-section" style={{ padding: '52px 64px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#b0a0a6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px', fontWeight: '600' }}>
            Con el respaldo de
          </p>
          <div className="colabs">
            {['Revista Momento', 'Las Hijas de la Malinche', 'Festival Tlaxqui', 'Networking'].map(colab => (
              <span key={colab} style={{ fontSize: '15px', fontWeight: '600', color: '#d4c8cc', letterSpacing: '0.04em' }}>
                {colab}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ background: '#f5e8eb', borderTop: '1px solid #edd8de' }}>
        <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B66878', marginBottom: '20px', opacity: 0.8 }}>
          Únete hoy
        </span>
        <h2 className="cta-title" style={{ fontWeight: '800', color: '#2d1219', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          ¿Lista para transformar tu negocio?
        </h2>
        <p style={{ fontSize: '17px', color: '#7a4a54', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px', lineHeight: '1.65' }}>
          Forma parte de la comunidad que está cambiando el ecosistema empresarial.
        </p>
        <button onClick={() => navigate('/register')} style={{ padding: '15px 44px', backgroundColor: '#B66878', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.01em' }}>
          Solicitar ingreso
        </button>
      </section>

    </main>
  )
}

export default LandingPage