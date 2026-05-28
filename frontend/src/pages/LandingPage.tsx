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
  const [articles, setArticles]         = useState<Article[]>([])
  const [eventos, setEventos]           = useState<Evento[]>([])
  const [cursos, setCursos]             = useState<Curso[]>([])
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
    <main>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #fdf0f2 0%, #fce7f0 100%)',
        padding: '100px 48px', minHeight: '90vh',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: '650px' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.2', color: '#111827' }}>
            Mujeres que lideran,{' '}
            <span style={{ color: '#B66878' }}>conectan y transforman</span>{' '}
            el ecosistema.
          </h1>
          <p style={{ marginTop: '24px', fontSize: '18px', color: '#6b7280', lineHeight: '1.7' }}>
            Únete a la red de negocios más activa para mujeres emprendedoras y líderes.
            Potenciamos tu impacto profesional mediante recursos exclusivos y conexiones estratégicas.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <button onClick={() => navigate('/register')} style={{
              padding: '14px 32px', backgroundColor: '#B66878', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
            }}>Solicitar ingreso</button>
            <button onClick={() => navigate('/login')} style={{
              padding: '14px 32px', backgroundColor: 'transparent', color: '#B66878',
              border: '1px solid #B66878', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
            }}>Iniciar sesión</button>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section style={{ padding: '80px 48px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Nuestros 4 Pilares</h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '48px', maxWidth: '500px', lineHeight: '1.6' }}>
            Fundamentamos nuestra comunidad en valores sólidos que impulsan el éxito individual y colectivo.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { icon: <Shield size={24} color="#B66878" />, title: 'Liderazgo',   desc: 'Potenciamos habilidades directivas y estratégicas para que tomes el control de tu destino empresarial.' },
              { icon: <Users size={24} color="#B66878" />,  title: 'Conexión',    desc: 'Creamos puentes reales entre profesionales, mentoras e inversoras de toda la región.' },
              { icon: <TrendingUp size={24} color="#B66878" />, title: 'Impulso', desc: 'Acceso a formación de vanguardia y recursos diseñados para el impulso personal de las mujeres.' },
              { icon: <Heart size={24} color="#B66878" />,  title: 'Solidaridad', desc: 'Fomentamos una cultura de apoyo mutuo y responsabilidad social entre nuestras miembros.' },
            ].map(pilar => (
              <div key={pilar.title} style={{ border: '1px solid #f3e8ea', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#FDF0F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {pilar.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>{pilar.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>{pilar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER — entre secciones (después de pilares) */}
      <BannerSlot posicion="landing_entre_secciones" titulo="Patrocinadores" />

      {/* PRÓXIMOS EVENTOS */}
      {eventos.length > 0 && (
        <section style={{ padding: '80px 48px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Próximos Eventos</h2>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>Espacios para conectar, compartir y crecer juntas.</p>
              </div>
              <button onClick={() => navigate('/login')} style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver todos →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {eventos.map(evento => (
                <div key={evento.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3e8ea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ height: '160px', background: '#FDF0F2', overflow: 'hidden' }}>
                    {evento.cover_image
                      ? <img src={evento.cover_image} alt={evento.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📅</div>
                    }
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 12px', lineHeight: '1.4' }}>{evento.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color="#B66878" /> {formatFecha(evento.date)}
                      </span>
                      <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} color="#B66878" /> {evento.start_time} – {evento.end_time}
                      </span>
                      {evento.hotel && (
                        <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} color="#B66878" /> {evento.hotel}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3e8ea' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{evento.total_asistentes} confirmadas</span>
                      <button onClick={() => navigate('/login')} style={{ fontSize: '13px', color: '#B66878', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>
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
        <section style={{ padding: '80px 48px', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  Centro de Formación MN WOMAN
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginTop: '12px', marginBottom: '8px' }}>
                  Impulsa tu <span style={{ color: '#B66878' }}>liderazgo</span>
                </h2>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>Programas especializados diseñados por y para mujeres.</p>
              </div>
              <button onClick={() => navigate('/login')} style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver todos los cursos →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {cursos.map(curso => (
                <div key={curso.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3e8ea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ height: '130px', background: '#FDF0F2', overflow: 'hidden' }}>
                    {curso.thumbnail
                      ? <img src={curso.thumbnail} alt={curso.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🎓</div>
                    }
                  </div>
                  <div style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                      {curso.category}
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '8px 0', lineHeight: '1.4' }}>{curso.title}</p>
                    {curso.nombre_instructora && (
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>Por {curso.nombre_instructora}</p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f3e8ea' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#9ca3af" /> {curso.duration_hours}h
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280', background: '#f9fafb', padding: '2px 8px', borderRadius: '20px' }}>
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
        <section style={{ padding: '80px 48px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Temas de Interés</h2>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>Artículos seleccionados para tu crecimiento profesional y bienestar.</p>
              </div>
              <a href="/articulos" style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', textDecoration: 'none' }}>Ver todos →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {articles.map(articulo => (
                <a key={articulo.id} href={articulo.external_url} target="_blank" rel="noreferrer" style={{
                  textDecoration: 'none', backgroundColor: '#fff', border: '1px solid #f3e8ea',
                  borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ height: '160px', background: '#FDF0F2', overflow: 'hidden' }}>
                    {articulo.cover_image_url
                      ? <img src={articulo.cover_image_url} alt={articulo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🌸</div>
                    }
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <span style={{ backgroundColor: '#FDF0F2', color: '#B66878', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', width: 'fit-content' }}>
                      {articulo.category_display}
                    </span>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: '1.5', flex: 1 }}>{articulo.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f3e8ea' }}>
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
        <section style={{ padding: '80px 48px', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Un Espacio para Apoyarte</h2>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>Instituciones y recursos disponibles para ti en Tlaxcala.</p>
              </div>
              <button onClick={() => navigate('/login')} style={{ fontSize: '14px', color: '#B66878', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver directorio completo →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {instituciones.map(inst => (
                <div key={inst.id} style={{ background: '#FDF0F2', borderRadius: '16px', padding: '24px', border: '1px solid #f3e8ea' }}>
                  <div style={{ width: '44px', height: '44px', background: '#B66878', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '20px' }}>🛡️</div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>{inst.nombre}</h3>
                  {inst.telefono && <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>📞 {inst.telefono}</p>}
                  {inst.horario  && <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>🕐 {inst.horario}</p>}
                  {inst.direccion && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>📍 {inst.direccion}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BANNER — antes del footer */}
      <BannerSlot posicion="landing_pre_footer" titulo="Presencia" />

      {/* COLABORADORES */}
      <section style={{ padding: '48px', backgroundColor: '#fff', borderTop: '1px solid #f3e8ea' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '32px', fontWeight: '500' }}>Con el respaldo de</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {['Revista Momento', 'Las Hijas de la Malinche', 'Festival Tlaxqui', 'Networking'].map(colab => (
              <span key={colab} style={{ fontSize: '16px', fontWeight: '600', color: '#d1d5db', letterSpacing: '0.05em' }}>{colab}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: 'rgb(225, 157, 171)', padding: '80px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>¿Lista para transformar tu negocio?</h2>
        <p style={{ fontSize: '18px', color: '#fce7f0', marginBottom: '32px' }}></p>
        <button onClick={() => navigate('/register')} style={{
          padding: '14px 40px', backgroundColor: '#fff', color: '#B66878',
          border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
        }}>Solicitar ingreso</button>
      </section>

    </main>
  )
}

export default LandingPage