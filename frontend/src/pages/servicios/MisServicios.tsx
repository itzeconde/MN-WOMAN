import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMisServicios, getCategoriasServicios,
  editarServicio, toggleActivoServicio,
} from '../../api/servicios'
import type { Servicio, Categoria } from '../../api/servicios'
import EstadoSinConexion from '../../components/ui/EstadoSinConexion'
import {
  botonPrimario, badgePillStyle,
  COLOR_MARCA, COLOR_MARCA_CLARO, COLOR_BORDE,
  CARD_SHADOW_REST, CARD_SHADOW_HOVER,
} from '../../styles/tokens'
import { Briefcase, Plus, Pencil, Power, X, Check } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
  fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const, width: '100%',
}

export default function MisServicios() {
  const navigate = useNavigate()
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [borrador, setBorrador] = useState<Partial<Servicio>>({})
  const [guardando, setGuardando] = useState(false)

  const cargar = async () => {
    setCargando(true)
    setError(false)
    try {
      const [s, c] = await Promise.all([getMisServicios(), getCategoriasServicios()])
      setServicios(s)
      setCategorias(c.categorias)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const iniciarEdicion = (s: Servicio) => {
    setEditandoId(s.id)
    setBorrador({
      titulo: s.titulo,
      descripcion: s.descripcion,
      categoria: s.categoria,
      categoria_otro: s.categoria_otro,
      precio: s.precio,
      precio_personalizado: s.precio_personalizado,
    })
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setBorrador({})
  }

  const guardarEdicion = async (id: number) => {
    setGuardando(true)
    try {
      const actualizado = await editarServicio(id, {
        titulo: borrador.titulo || '',
        descripcion: borrador.descripcion || '',
        categoria: borrador.categoria || 'otro',
        categoria_otro: borrador.categoria_otro || '',
        precio: borrador.precio_personalizado ? null : String(borrador.precio ?? ''),
        precio_personalizado: !!borrador.precio_personalizado,
      })
      setServicios((prev) => prev.map((s) => (s.id === id ? actualizado : s)))
      cancelarEdicion()
    } catch (err) {
      console.error(err)
      alert('No se pudo guardar el cambio. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const manejarToggle = async (id: number) => {
    try {
      const actualizado = await toggleActivoServicio(id)
      setServicios((prev) => prev.map((s) => (s.id === id ? actualizado : s)))
    } catch (err) {
      console.error(err)
      alert('No se pudo actualizar el estado del servicio.')
    }
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Cargando tus servicios...</p>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '60px 20px' }}>
      <EstadoSinConexion
        onReintentar={cargar}
        mensaje="No se pudieron cargar tus servicios. Revisa tu internet e intenta de nuevo."
      />
    </div>
  )

  const activos = servicios.filter((s) => s.activo).length

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 60px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={24} color={COLOR_MARCA} /> Mis servicios
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              {servicios.length === 0
                ? 'Aún no has publicado ningún servicio'
                : `${activos} de ${servicios.length} servicio${servicios.length !== 1 ? 's' : ''} activo${activos !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => navigate('/servicios/nuevo')} style={botonPrimario}>
            <Plus size={16} /> Publicar servicio
          </button>
        </div>

        {servicios.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '16px',
            border: `1.5px dashed ${COLOR_BORDE}`,
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#fdf2f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Briefcase size={22} color={COLOR_MARCA} />
            </div>
            <p style={{ color: '#111827', fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
              Aún no has publicado ningún servicio
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Publica el primero para que otras empresas puedan encontrarte.
            </p>
            <button onClick={() => navigate('/servicios/nuevo')} style={{ ...botonPrimario, margin: '0 auto' }}>
              <Plus size={16} /> Publicar servicio
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {servicios.map((s) => {
              const enEdicion = editandoId === s.id
              return (
                <div
                  key={s.id}
                  style={{
                    background: 'white', borderRadius: '16px', padding: '20px 24px',
                    border: `1px solid ${COLOR_BORDE}`, boxShadow: CARD_SHADOW_REST,
                    opacity: s.activo ? 1 : 0.65,
                    borderLeft: `4px solid ${s.activo ? COLOR_MARCA_CLARO : COLOR_BORDE}`,
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!enEdicion) { e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER; e.currentTarget.style.transform = 'translateY(-2px)' } }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = CARD_SHADOW_REST; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {enEdicion ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <input
                        value={borrador.titulo || ''}
                        onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
                        placeholder="Título"
                        style={inputStyle}
                      />
                      <textarea
                        value={borrador.descripcion || ''}
                        onChange={(e) => setBorrador({ ...borrador, descripcion: e.target.value })}
                        placeholder="Descripción"
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                      <select
                        value={borrador.categoria || ''}
                        onChange={(e) => setBorrador({ ...borrador, categoria: e.target.value })}
                        style={inputStyle}
                      >
                        {categorias.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      {borrador.categoria === 'otro' && (
                        <input
                          value={borrador.categoria_otro || ''}
                          onChange={(e) => setBorrador({ ...borrador, categoria_otro: e.target.value })}
                          placeholder="¿De qué trata tu servicio?"
                          style={inputStyle}
                        />
                      )}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={!!borrador.precio_personalizado}
                          onChange={(e) => setBorrador({ ...borrador, precio_personalizado: e.target.checked })}
                          style={{ accentColor: COLOR_MARCA }}
                        />
                        Precio personalizado (a convenir)
                      </label>
                      {!borrador.precio_personalizado && (
                        <input
                          type="number"
                          value={borrador.precio ?? ''}
                          onChange={(e) => setBorrador({ ...borrador, precio: Number(e.target.value) })}
                          placeholder="Precio en MXN"
                          style={inputStyle}
                        />
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => guardarEdicion(s.id)}
                          disabled={guardando}
                          style={{
                            background: COLOR_MARCA, color: 'white', padding: '8px 18px',
                            borderRadius: '8px', border: 'none', cursor: guardando ? 'default' : 'pointer',
                            fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                            opacity: guardando ? 0.7 : 1,
                          }}
                        >
                          <Check size={14} /> {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          style={{
                            background: 'white', color: '#6b7280', padding: '8px 18px',
                            borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer',
                            fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                          }}
                        >
                          <X size={14} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                            {s.titulo}
                          </h3>
                          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                            {s.categoria_display} · {s.precio_personalizado ? 'Precio personalizado' : `$${(s.precio ?? 0).toLocaleString('es-MX')} MXN`}
                          </p>
                        </div>
                        <span style={badgePillStyle(s.activo ? '#f0fdf4' : '#f3f4f6', s.activo ? '#16a34a' : '#6b7280')}>
                          {s.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        <button
                          onClick={() => iniciarEdicion(s)}
                          style={{
                            background: 'white', color: COLOR_MARCA, padding: '6px 16px',
                            borderRadius: '8px', border: `1px solid ${COLOR_MARCA_CLARO}`, cursor: 'pointer',
                            fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                          }}
                        >
                          <Pencil size={13} /> Editar
                        </button>
                        <button
                          onClick={() => manejarToggle(s.id)}
                          style={{
                            background: 'white', color: s.activo ? '#ef4444' : '#16a34a', padding: '6px 16px',
                            borderRadius: '8px', border: `1px solid ${s.activo ? '#fecaca' : '#bbf7d0'}`,
                            cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                          }}
                        >
                          <Power size={13} /> {s.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}