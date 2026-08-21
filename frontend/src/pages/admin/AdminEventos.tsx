import { useState, useEffect, useMemo } from 'react'
import {
  adminCrearEvento, adminEditarEvento, adminEliminarEvento, getEventos,
  adminGetAsistentes, adminActualizarAsistencia
} from '../../api/eventos'
import { paginacionBotonStyle, COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE } from '../../styles/tokens'
import {
  Search, Plus, Calendar, MapPin, Users, Pencil, Trash2, X,
  Check, CheckCircle2, XCircle, Clock3, ChevronLeft, ChevronRight, ImagePlus,
} from 'lucide-react'

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
  costo: number | null
}

interface Asistente {
  id: number
  nombre: string
  empresa: string
  foto: string | null
  status: 'confirmed' | 'declined' | 'pending'
  registered_at: string
}

const statusConfig = {
  proximo:    { label: 'Próximo',    color: '#6366f1', bg: '#eef2ff' },
  en_curso:   { label: 'En Curso',   color: '#16a34a', bg: '#dcfce7' },
  finalizado: { label: 'Finalizado', color: '#6b7280', bg: '#f3f4f6' },
}

const asistenciaConfig = {
  confirmed: { label: 'Sí asiste',  color: '#16a34a', bg: '#dcfce7', Icono: CheckCircle2 },
  declined:  { label: 'No asiste',  color: '#ef4444', bg: '#fee2e2', Icono: XCircle },
  pending:   { label: 'Pendiente',  color: '#d97706', bg: '#fef3c7', Icono: Clock3 },
}

const formInicial = {
  title: '', description: '', date: '', start_time: '', end_time: '',
  location: '', hotel: '', status: 'proximo', referral_goal: '100', costo: '',
}

const EVENTOS_POR_PAGINA = 6

export default function AdminEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  // Modal crear/editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)
  const [form, setForm] = useState(formInicial)
  // Cierre manual: es la ÚNICA forma en que el admin puede forzar el estado.
  // El backend recalcula 'proximo'/'en_curso' solo, con la fecha/hora real
  // del evento (ver EventoSerializer.get_status). El único valor que el
  // backend respeta tal cual, sin recalcular, es 'finalizado' — por eso el
  // resto de estados NO se editan a mano, solo se muestran como lectura.
  const [cierreManual, setCierreManual] = useState(false)
  const [imagen, setImagen] = useState<File | null>(null)
  const [previsualizacion, setPrevisualizacion] = useState<string>('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Modal asistentes
  const [modalAsistentes, setModalAsistentes] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null)
  const [asistentes, setAsistentes] = useState<Asistente[]>([])
  const [cargandoAsistentes, setCargandoAsistentes] = useState(false)
  const [filtro, setFiltro] = useState<'todos' | 'confirmed' | 'declined' | 'pending'>('todos')
  const [actualizando, setActualizando] = useState<number | null>(null)

  useEffect(() => { cargarEventos() }, [])
  useEffect(() => { setPagina(1) }, [busqueda])

  const cargarEventos = async () => {
    try {
      const data = await getEventos()
      setEventos(data)
    } finally {
      setCargando(false)
    }
  }

  // ── Búsqueda y paginación ──
  const eventosFiltrados = eventos.filter((e) =>
    busqueda === '' ||
    e.title.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.location.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.hotel.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(eventosFiltrados.length / EVENTOS_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const eventosPagina = eventosFiltrados.slice(
    (paginaSegura - 1) * EVENTOS_POR_PAGINA,
    paginaSegura * EVENTOS_POR_PAGINA
  )

  const numerosPagina = useMemo(() => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const nums = new Set([1, 2, totalPaginas - 1, totalPaginas, paginaSegura - 1, paginaSegura, paginaSegura + 1])
    return Array.from(nums).filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b)
  }, [totalPaginas, paginaSegura])

  // ── Asistentes ──
  const abrirAsistentes = async (evento: Evento) => {
    setEventoSeleccionado(evento)
    setAsistentes([])
    setFiltro('todos')
    setModalAsistentes(true)
    setCargandoAsistentes(true)
    try {
      const data = await adminGetAsistentes(evento.id)
      setAsistentes(data.map((a: Asistente) => ({ ...a, status: normalizarStatus(a.status) })))
    } catch {
      setAsistentes([])
    } finally {
      setCargandoAsistentes(false)
    }
  }

  const handleCambiarStatus = async (asistente: Asistente, nuevoStatus: string) => {
    if (!eventoSeleccionado) return
    setActualizando(asistente.id)
    try {
      await adminActualizarAsistencia(eventoSeleccionado.id, asistente.id, nuevoStatus)
      setAsistentes(prev =>
        prev.map(a => a.id === asistente.id ? { ...a, status: nuevoStatus as Asistente['status'] } : a)
      )
    } finally {
      setActualizando(null)
    }
  }

  // ── Crear / Editar ──
  const abrirCrear = () => {
    setEventoEditando(null)
    setForm(formInicial)
    setCierreManual(false)
    setImagen(null)
    setPrevisualizacion('')
    setError('')
    setModalAbierto(true)
  }

  const abrirEditar = (evento: Evento) => {
    setEventoEditando(evento)
    setForm({
      title: evento.title, description: evento.description, date: evento.date,
      start_time: evento.start_time.slice(0, 5), end_time: evento.end_time.slice(0, 5),
      location: evento.location, hotel: evento.hotel, status: evento.status,
      referral_goal: String(evento.referral_goal),
      costo: evento.costo != null ? String(evento.costo) : '',
    })
    setCierreManual(evento.status === 'finalizado')
    setImagen(null)
    setPrevisualizacion(evento.cover_image || '')
    setError('')
    setModalAbierto(true)
  }

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) { setImagen(archivo); setPrevisualizacion(URL.createObjectURL(archivo)) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    setGuardando(true); setError('')
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'status') return // el status se maneja aparte, vía cierreManual
        // Si costo está vacío, enviarlo como vacío (el backend lo interpretará como null/gratuito)
        formData.append(k, v)
      })
      // Único valor de status que el backend respeta sin recalcular es
      // 'finalizado'. Cualquier otro caso mandamos 'proximo' para que el
      // serializer lo recalcule libremente según fecha/hora real.
      formData.append('status', cierreManual ? 'finalizado' : 'proximo')

      if (imagen) formData.append('cover_image', imagen)
      if (eventoEditando) {
        const actualizado = await adminEditarEvento(eventoEditando.id, formData)
        setEventos(eventos.map(e => e.id === eventoEditando.id ? actualizado : e))
      } else {
        const nuevo = await adminCrearEvento(formData)
        setEventos([nuevo, ...eventos])
      }
      setModalAbierto(false)
    } catch {
      setError('Error al guardar el evento. Revisa los campos.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este evento?')) return
    await adminEliminarEvento(id)
    setEventos(eventos.filter(e => e.id !== id))
  }

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatCosto = (costo: number | null) => {
    if (costo == null || costo === 0) return 'Gratuito'
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(costo)
  }

  const normalizarStatus = (s: string): Asistente['status'] => {
    const map: Record<string, Asistente['status']> = {
      si: 'confirmed', confirmed: 'confirmed', yes: 'confirmed', confirmada: 'confirmed',
      no: 'declined',  declined: 'declined', cancelada: 'declined',
      pending: 'pending', pendiente: 'pending',
    }
    return map[s] ?? 'pending'
  }

  const contarPor = (s: string) => asistentes.filter(a => a.status === s).length
  const asistentesFiltrados = filtro === 'todos' ? asistentes : asistentes.filter(a => a.status === filtro)

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #e5e7eb', fontSize: '14px',
    boxSizing: 'border-box' as const, outline: 'none',
  }
  const labelStyle = {
    fontSize: '13px', fontWeight: '600' as const, color: '#374151',
    marginBottom: '4px', display: 'block' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-overlay { padding: 20px; }
        .modal-card { padding: 32px; border-radius: 20px; }

        @media (max-width: 480px) {
          .form-grid-3, .form-grid-2 { grid-template-columns: 1fr; }
          .modal-overlay { padding: 0; align-items: flex-end !important; }
          .modal-card {
            padding: 20px; border-radius: 16px 16px 0 0;
            max-height: 92vh !important; max-width: 100% !important;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
      <div style={{ background: 'linear-gradient(180deg, #FDF0F2 0%, #f9fafb 100%)', borderBottom: `1px solid ${COLOR_BORDE}` }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: '1.25' }}>
              Panel de <span style={{ color: COLOR_MARCA }}>Eventos</span>
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: '8px 0 0' }}>
              Crea y gestiona los encuentros de la red.
            </p>
          </div>
          <button onClick={abrirCrear} style={{
            background: COLOR_MARCA, color: 'white', padding: '12px 22px',
            borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          }}>
            <Plus size={16} /> Nuevo evento
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px 40px' }}>

        {/* BUSCADOR */}
        {!cargando && eventos.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              aria-label="Buscar eventos"
              placeholder="Buscar por título, ubicación o lugar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%', padding: '13px 14px 13px 40px', borderRadius: '12px',
                border: `1px solid ${COLOR_BORDE}`, fontSize: '14px',
                boxSizing: 'border-box' as const, outline: 'none', background: 'white',
              }}
            />
          </div>
        )}

        {/* Lista eventos */}
        {cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        ) : eventos.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            textAlign: 'center', padding: '80px 24px', background: 'white',
            borderRadius: '16px', border: `1px solid ${COLOR_BORDE}`,
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar size={22} color={COLOR_MARCA} />
            </div>
            <p style={{ color: '#6b7280', margin: 0 }}>No hay eventos. ¡Crea el primero!</p>
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>No hay eventos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {eventosPagina.map(evento => {
                const cfg = statusConfig[evento.status]
                return (
                  <div key={evento.id} style={{
                    background: 'white', borderRadius: '14px', padding: '20px 24px',
                    border: `1px solid ${COLOR_BORDE}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '10px', flexShrink: 0,
                      background: evento.cover_image ? 'none' : `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, ${COLOR_MARCA})`,
                      overflow: 'hidden'
                    }}>
                      {evento.cover_image
                        ? <img src={evento.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={22} color="white" />
                          </div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
                          {cfg.label}
                        </span>
                        <span style={{
                          background: (evento.costo == null || evento.costo === 0) ? '#f0fdf4' : '#fef9ec',
                          color: (evento.costo == null || evento.costo === 0) ? '#16a34a' : '#92400e',
                          fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                        }}>
                          {formatCosto(evento.costo)}
                        </span>
                      </div>
                      <p style={{ fontWeight: '700', color: '#111827', fontSize: '15px', margin: '0 0 4px 0' }}>{evento.title}</p>
                      <p style={{
                        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                        fontSize: '13px', color: '#6b7280', margin: 0,
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {formatFecha(evento.date)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {evento.hotel || evento.location}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} /> {evento.total_asistentes} confirmadas
                        </span>
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                      <button onClick={() => abrirAsistentes(evento)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #dcfce7',
                        background: '#f0fdf4', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#16a34a'
                      }}><Users size={13} /> Asistentes</button>
                      <button onClick={() => abrirEditar(evento)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb',
                        background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151'
                      }}><Pencil size={13} /> Editar</button>
                      <button onClick={() => handleEliminar(evento.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #fee2e2',
                        background: '#fff5f5', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#ef4444'
                      }}><Trash2 size={13} /> Eliminar</button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PAGINACION */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '28px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  style={paginacionBotonStyle(false, paginaSegura === 1)}
                >
                  <ChevronLeft size={14} />
                </button>

                {numerosPagina.map((n, i) => {
                  const anterior = numerosPagina[i - 1]
                  const hayHueco = anterior !== undefined && n - anterior > 1
                  return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hayHueco && <span style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>}
                      <button onClick={() => setPagina(n)} style={paginacionBotonStyle(n === paginaSegura, false)}>
                        {n}
                      </button>
                    </div>
                  )
                })}

                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  style={paginacionBotonStyle(false, paginaSegura === totalPaginas)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal Asistentes ── */}
      {modalAsistentes && eventoSeleccionado && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="modal-card" style={{
            background: 'white',
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0',
                }}>
                  <Users size={18} color={COLOR_MARCA} /> Asistentes
                </h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{eventoSeleccionado.title}</p>
              </div>
              <button onClick={() => setModalAsistentes(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            {cargandoAsistentes ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>Cargando asistentes...</p>
            ) : (
              <>
                <div className="form-grid-3" style={{ marginBottom: '20px' }}>
                  {(['confirmed', 'declined', 'pending'] as const).map(s => {
                    const cfg = asistenciaConfig[s]
                    const count = contarPor(s)
                    const activo = filtro === s
                    const IconoEstado = cfg.Icono
                    return (
                      <button key={s} onClick={() => setFiltro(activo ? 'todos' : s)} style={{
                        background: activo ? cfg.bg : 'white',
                        border: `2px solid ${activo ? cfg.color : '#e5e7eb'}`,
                        borderRadius: '12px', padding: '14px 12px',
                        cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.15s'
                      }}>
                        <IconoEstado size={20} color={cfg.color} style={{ marginBottom: '4px' }} />
                        <p style={{ fontSize: '24px', fontWeight: '800', color: cfg.color, margin: '0 0 2px 0' }}>{count}</p>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, fontWeight: '600' }}>{cfg.label}</p>
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    {filtro === 'todos'
                      ? `Total: ${asistentes.length} persona${asistentes.length !== 1 ? 's' : ''}`
                      : `${asistenciaConfig[filtro].label}: ${asistentesFiltrados.length}`}
                  </p>
                  {filtro !== 'todos' && (
                    <button onClick={() => setFiltro('todos')} style={{
                      fontSize: '12px', color: COLOR_MARCA, background: 'none',
                      border: 'none', cursor: 'pointer', fontWeight: '600'
                    }}>Ver todos</button>
                  )}
                </div>

                {asistentesFiltrados.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '14px' }}>
                    {asistentes.length === 0 ? 'Nadie se ha registrado aún.' : 'Sin resultados para este filtro.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {asistentesFiltrados.map(a => {
                      const cfg = asistenciaConfig[a.status] ?? asistenciaConfig['pending']
                      const ocupado = actualizando === a.id
                      return (
                        <div key={a.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 14px', borderRadius: '10px',
                          background: '#f9fafb', border: '1px solid #f3f4f6',
                          opacity: ocupado ? 0.6 : 1
                        }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${COLOR_MARCA_CLARO}, ${COLOR_MARCA})`,
                            overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: '700', color: 'white'
                          }}>
                            {a.foto
                              ? <img src={a.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : (a.nombre?.charAt(0)?.toUpperCase() || '?')
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: '600', color: '#111827', fontSize: '14px', margin: '0 0 1px 0' }}>
                              {a.nombre || 'Sin nombre'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                              {a.empresa || '—'}
                            </p>
                          </div>
                          <select
                            value={a.status}
                            disabled={ocupado}
                            onChange={e => handleCambiarStatus(a, e.target.value)}
                            style={{
                              background: cfg.bg, color: cfg.color,
                              border: `1px solid ${cfg.color}`,
                              borderRadius: '20px', padding: '4px 10px',
                              fontSize: '11px', fontWeight: '700',
                              cursor: ocupado ? 'wait' : 'pointer', outline: 'none',
                              flexShrink: 0
                            }}
                          >
                            <option value="confirmed">Sí asiste</option>
                            <option value="declined">No asiste</option>
                            <option value="pending">Pendiente</option>
                          </select>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Crear/Editar ── */}
      {modalAbierto && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="modal-card" style={{
            background: 'white',
            width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>
                {eventoEditando ? 'Editar evento' : 'Nuevo evento'}
              </h2>
              <button onClick={() => setModalAbierto(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Imagen de portada</label>
                <div style={{
                  border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '16px',
                  textAlign: 'center', cursor: 'pointer', background: '#f9fafb',
                  position: 'relative', overflow: 'hidden',
                  height: previsualizacion ? 'auto' : '100px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {previsualizacion
                    ? <img src={previsualizacion} alt="preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover', width: '100%' }} />
                    : <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                        <ImagePlus size={16} /> Haz clic para subir imagen
                      </p>
                  }
                  <input type="file" accept="image/*" onChange={handleImagen}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
                {/* El título y badge de estado se dibujan encima de esta imagen
                    automáticamente en la vista pública. Si la imagen ya trae
                    texto propio, se va a ver encimado con ese título — por eso
                    la nota de abajo. */}
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px', lineHeight: '1.5' }}>
                  Usa una imagen sin texto — el título del evento se agrega
                  automáticamente encima. Tamaño recomendado: 1600×500px (horizontal).
                </p>
              </div>

              <div>
                <label style={labelStyle}>Título del evento</label>
                <input name="title" value={form.title} onChange={handleChange}
                  placeholder="Ej. Cumbre de Liderazgo Femenino" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Describe el evento..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>

              <div className="form-grid-3">
                <div>
                  <label style={labelStyle}>Fecha</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hora inicio</label>
                  <input type="time" name="start_time" value={form.start_time} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hora fin</label>
                  <input type="time" name="end_time" value={form.end_time} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label style={labelStyle}>Ubicación</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="Ej. Tlaxcala Centro" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Lugar</label>
                  <input name="hotel" value={form.hotel} onChange={handleChange}
                    placeholder="Ej. Hotel Posada San Francisco" style={inputStyle} />
                </div>
              </div>

              <div className="form-grid-3">
                <div>
                  <label style={labelStyle}>
                    Estado{' '}
                    <span style={{ color: '#9ca3af', fontWeight: '400' }}>(automático)</span>
                  </label>
                  {/* Solo lectura: el backend calcula 'proximo'/'en_curso' según
                      fecha/hora real del evento (ver EventoSerializer.get_status).
                      Mostramos aquí lo que ya trae el evento; si es nuevo, mostramos
                      'Próximo' porque aún no existe fecha guardada para comparar. */}
                  <div style={{
                    ...inputStyle,
                    display: 'flex', alignItems: 'center',
                    background: '#f9fafb', color: '#6b7280', cursor: 'default',
                  }}>
                    <span style={{
                      background: statusConfig[(eventoEditando?.status ?? 'proximo')].bg,
                      color: statusConfig[(eventoEditando?.status ?? 'proximo')].color,
                      fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                    }}>
                      {statusConfig[(eventoEditando?.status ?? 'proximo')].label}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Meta de asistentes</label>
                  <input type="number" name="referral_goal" value={form.referral_goal} onChange={handleChange}
                    min="10" style={inputStyle} />
                  {/* Antes el mínimo era 1: con pocos confirmados el % se disparaba
                      a "100% de la meta" casi de inmediato (ej. 3/1). 10 evita
                      metas irreales por error de captura. */}
                </div>
                <div>
                  <label style={labelStyle}>
                    Costo{' '}
                    <span style={{ color: '#9ca3af', fontWeight: '400' }}>(MXN)</span>
                  </label>
                  <input
                    type="number"
                    name="costo"
                    value={form.costo}
                    onChange={handleChange}
                    min="0"
                    placeholder="0 = Gratuito"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Único control real sobre el estado: cerrar el evento antes de
                  tiempo (ej. se canceló). El backend respeta 'finalizado' sin
                  recalcularlo; cualquier otro valor lo vuelve a calcular solo. */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                padding: '12px 14px', borderRadius: '10px',
                background: cierreManual ? '#f3f4f6' : '#f9fafb',
                border: `1px solid ${cierreManual ? '#d1d5db' : '#e5e7eb'}`,
              }}>
                <input
                  type="checkbox"
                  checked={cierreManual}
                  onChange={(e) => setCierreManual(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: COLOR_MARCA, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: '#374151' }}>
                  <strong>Cerrar evento manualmente</strong> — úsalo solo si se canceló o se
                  terminó antes de tiempo. Si no lo marcas, el estado se calcula solo según la fecha.
                </span>
              </label>

              {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setModalAbierto(false)} style={{
                  padding: '10px 24px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#374151'
                }}>Cancelar</button>
                <button onClick={handleGuardar} disabled={guardando} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: COLOR_MARCA, color: 'white', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px', opacity: guardando ? 0.7 : 1,
                }}>
                  {!guardando && <Check size={14} />}
                  {guardando ? 'Guardando...' : eventoEditando ? 'Guardar cambios' : 'Crear evento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}