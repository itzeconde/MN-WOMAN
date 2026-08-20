import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEventos } from '../../api/eventos'
import { useCargaConError } from '../../hooks/useCargaConError'
import EstadoSinConexion from '../../components/ui/EstadoSinConexion'
import { COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import { Search, Calendar, Clock, MapPin, Users, Bookmark, ChevronDown, Heart } from 'lucide-react'
import heroReunionesImg from '../../assets/hero-reuniones.png'

interface Evento {
  id: number
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  hotel: string
  status: 'proximo' | 'en_curso' | 'finalizado'
  cover_image: string | null
  total_asistentes: number
  referral_goal: number
}

const statusConfig = {
  proximo:    { label: 'Próximo',    color: '#B66878', bg: '#fdf2f4' },
  en_curso:   { label: '● En vivo',  color: '#16a34a', bg: '#dcfce7' },
  finalizado: { label: 'Finalizado', color: '#6b7280', bg: '#f3f4f6' },
}

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const EVENTOS_POR_TANDA = 3

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [visiblesProximos, setVisiblesProximos] = useState(EVENTOS_POR_TANDA)
  const [visiblesFinalizados, setVisiblesFinalizados] = useState(EVENTOS_POR_TANDA)
  const [guardados, setGuardados] = useState<Set<number>>(new Set())
  const navigate = useNavigate()
  const { cargando, errorRed, ejecutar } = useCargaConError()

  const cargarEventos = () => ejecutar(async () => {
    const data = await getEventos()
    setEventos(data)
  })

  useEffect(() => { cargarEventos() }, [])
  useEffect(() => {
    setVisiblesProximos(EVENTOS_POR_TANDA)
    setVisiblesFinalizados(EVENTOS_POR_TANDA)
  }, [busqueda])

  const parseFecha = (fecha: string) => new Date(fecha + 'T00:00:00')
  const diaNum = (fecha: string) => parseFecha(fecha).getDate()
  const mesAbrev = (fecha: string) => MESES[parseFecha(fecha).getMonth()]
  const formatHora = (hora: string) => hora.slice(0, 5)

  // El backend ya calcula el status real según fecha/hora (ver EventoSerializer.get_status),
  // así que aquí solo confiamos en lo que llega. Este helper queda como defensa extra por
  // si en algún momento se sirve una respuesta cacheada desactualizada.
  const statusEfectivo = (evento: Evento): Evento['status'] => {
    if (evento.status !== 'proximo') return evento.status
    const finEvento = new Date(`${evento.date}T${evento.end_time || '23:59:59'}`)
    return finEvento.getTime() < Date.now() ? 'finalizado' : evento.status
  }

  const irADetalle = (id: number) => navigate(`/eventos/${id}`)
  const manejarTecla = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); irADetalle(id) }
  }

  const alternarGuardado = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setGuardados(prev => {
      const copia = new Set(prev)
      copia.has(id) ? copia.delete(id) : copia.add(id)
      return copia
    })
  }

  const eventosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return eventos
    return eventos.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.hotel?.toLowerCase().includes(q)
    )
  }, [eventos, busqueda])

  const ordenPrioridad = { en_curso: 0, proximo: 1, finalizado: 2 }
  const proximos = eventosFiltrados
    .filter(e => statusEfectivo(e) !== 'finalizado')
    .sort((a, b) => {
      const diffPrioridad = ordenPrioridad[statusEfectivo(a)] - ordenPrioridad[statusEfectivo(b)]
      if (diffPrioridad !== 0) return diffPrioridad
      return a.date.localeCompare(b.date)
    })

  const finalizados = eventosFiltrados
    .filter(e => statusEfectivo(e) === 'finalizado')
    .sort((a, b) => b.date.localeCompare(a.date))

  const proximosVisibles = proximos.slice(0, visiblesProximos)
  const finalizadosVisibles = finalizados.slice(0, visiblesFinalizados)

  const TarjetaEvento = ({ evento, atenuada }: { evento: Evento; atenuada?: boolean }) => {
    const cfg = statusConfig[statusEfectivo(evento)]
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => irADetalle(evento.id)}
        onKeyDown={e => manejarTecla(e, evento.id)}
        onFocus={e => { e.currentTarget.style.outline = `2px solid ${COLOR_MARCA}` }}
        onBlur={e => { e.currentTarget.style.outline = 'none' }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(182,104,120,0.14)'
          e.currentTarget.style.borderColor = COLOR_MARCA_CLARO
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
          e.currentTarget.style.borderColor = COLOR_BORDE
        }}
        style={{
          background: 'white', borderRadius: '18px', overflow: 'hidden',
          border: `1px solid ${COLOR_BORDE}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer', display: 'flex', alignItems: 'stretch',
          transition: 'box-shadow 0.2s, border-color 0.2s', outlineOffset: '2px',
          opacity: atenuada ? 0.85 : 1,
        }}
      >
        {/* Bloque de fecha */}
        <div style={{
          width: '96px', flexShrink: 0, background: '#fdf2f4',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
        }}>
          <span style={{ fontSize: '32px', fontWeight: '800', color: COLOR_MARCA, lineHeight: 1 }}>
            {diaNum(evento.date)}
          </span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: COLOR_MARCA, letterSpacing: '0.05em' }}>
            {mesAbrev(evento.date)}
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: '20px 24px', flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'inline-block', background: cfg.bg, color: cfg.color,
            fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginBottom: '10px',
          }}>
            {cfg.label}
          </span>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
            {evento.title}
          </h3>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px', lineHeight: '1.5' }}>
            {evento.description?.slice(0, 140)}{evento.description && evento.description.length > 140 ? '...' : ''}
          </p>

          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#374151' }}>
              <Clock size={13} color={COLOR_MARCA} /> {formatHora(evento.start_time)} - {formatHora(evento.end_time)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#374151' }}>
              <MapPin size={13} color={COLOR_MARCA} /> {evento.hotel || evento.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#374151' }}>
              <Users size={13} color={COLOR_MARCA} /> {evento.total_asistentes} confirmadas
            </span>
          </div>
        </div>

        {/* Portada */}
        <div style={{
          width: '160px', flexShrink: 0, margin: '14px 14px 14px 0', borderRadius: '12px', overflow: 'hidden',
          background: evento.cover_image ? 'none' : `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, ${COLOR_MARCA})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {evento.cover_image
            ? <img src={evento.cover_image} alt={evento.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <span style={{ fontSize: '32px' }}>🌸</span>
          }
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0 20px 0 4px', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); irADetalle(evento.id) }}
            style={{
              padding: '9px 18px', borderRadius: '20px', border: `1.5px solid ${COLOR_MARCA}`,
              background: 'white', color: COLOR_MARCA, fontWeight: '700', fontSize: '13px',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Ver detalles
          </button>
          <button
            onClick={(e) => alternarGuardado(e, evento.id)}
            aria-label="Guardar evento"
            style={{
              width: '34px', height: '34px', borderRadius: '50%', border: `1px solid ${COLOR_BORDE}`,
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Bookmark size={14} color={COLOR_MARCA} fill={guardados.has(evento.id) ? COLOR_MARCA : 'none'} />
          </button>
        </div>
      </div>
    )
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <p style={{ color: COLOR_MARCA, fontWeight: '600' }}>Cargando eventos...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.25' }}>
              Reuniones
            </h1>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: COLOR_MARCA, margin: '2px 0 12px', lineHeight: '1.3', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              Conecta, comparte metas y fortalece la red de empresarias de Tlaxcala. <Heart size={20} color={COLOR_MARCA} fill={COLOR_MARCA_CLARO} />
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Consulta los próximos encuentros, talleres y actividades de la comunidad.
            </p>
          </div>

          <div style={{
            position: 'relative', width: '320px', height: '240px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle, ${COLOR_MARCA_CLARO}55, transparent 70%)`,
            }} />
            {/* Coloca tu imagen en src/assets/hero-reuniones.png (o ajusta el import de arriba) */}
            <img
              src={heroReunionesImg}
              alt="Mujeres conversando en una reunión"
              style={{
                position: 'relative', width: '280px', height: '280px',
                objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(182,104,120,0.25))',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 48px' }}>

        {/* Buscador */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Buscar reunión, taller o actividad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '15px 16px 15px 44px', borderRadius: '14px',
              border: `1px solid ${COLOR_BORDE}`, fontSize: '14px', boxSizing: 'border-box' as const,
              background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          />
        </div>

        {errorRed ? (
          <EstadoSinConexion
            onReintentar={cargarEventos}
            mensaje="No se pudo cargar la lista de eventos. Revisa tu internet e intenta de nuevo."
          />
        ) : eventosFiltrados.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', border: `1px solid ${COLOR_BORDE}` }}>
            <p style={{ fontSize: '36px', marginBottom: '8px' }}>📅</p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              {busqueda ? 'No se encontraron eventos con esa búsqueda.' : 'No hay eventos disponibles por el momento.'}
            </p>
          </div>
        ) : (
          <>
            {/* Próximos encuentros */}
            {proximos.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <span style={{
                    width: '30px', height: '30px', borderRadius: '9px', background: '#fdf2f4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Calendar size={15} color={COLOR_MARCA} />
                  </span>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    Próximos Encuentros
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {proximosVisibles.map(evento => (
                    <TarjetaEvento key={evento.id} evento={evento} />
                  ))}
                </div>

                {visiblesProximos < proximos.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <button
                      onClick={() => setVisiblesProximos(v => v + EVENTOS_POR_TANDA)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px',
                        borderRadius: '20px', border: `1px solid ${COLOR_BORDE}`, background: 'white',
                        color: '#374151', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                      }}
                    >
                      Ver más encuentros <ChevronDown size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Encuentros pasados */}
            {finalizados.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <span style={{
                    width: '30px', height: '30px', borderRadius: '9px', background: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Calendar size={15} color="#6b7280" />
                  </span>
                  <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    Encuentros Pasados
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {finalizadosVisibles.map(evento => (
                    <TarjetaEvento key={evento.id} evento={evento} atenuada />
                  ))}
                </div>

                {visiblesFinalizados < finalizados.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <button
                      onClick={() => setVisiblesFinalizados(v => v + EVENTOS_POR_TANDA)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px',
                        borderRadius: '20px', border: `1px solid ${COLOR_BORDE}`, background: 'white',
                        color: '#374151', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                      }}
                    >
                      Ver más encuentros pasados <ChevronDown size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}