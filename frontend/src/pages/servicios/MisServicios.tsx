import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMisServicios, getCategoriasServicios,
  editarServicio, toggleActivoServicio,
} from '../../api/servicios'
import type { Servicio, Categoria } from '../../api/servicios'

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
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Cargando...</div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: '#ef4444', marginBottom: '12px' }}>No se pudieron cargar tus servicios.</p>
      <button onClick={cargar} style={{
        background: '#B66878', color: 'white', padding: '10px 24px',
        borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
      }}>
        Reintentar
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>Mis Servicios</h1>
          <button
            onClick={() => navigate('/servicios/nuevo')}
            style={{
              background: '#B66878', color: 'white', padding: '10px 20px',
              borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
            }}
          >
            + Publicar servicio
          </button>
        </div>

        {servicios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
            <p style={{ color: '#6b7280' }}>Aún no has publicado ningún servicio.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {servicios.map((s) => (
              <div key={s.id} style={{
                background: 'white', borderRadius: '16px', padding: '20px 24px',
                border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                opacity: s.activo ? 1 : 0.6,
              }}>
                {editandoId === s.id ? (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <input
                      value={borrador.titulo || ''}
                      onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
                      placeholder="Título"
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                    />
                    <textarea
                      value={borrador.descripcion || ''}
                      onChange={(e) => setBorrador({ ...borrador, descripcion: e.target.value })}
                      placeholder="Descripción"
                      rows={3}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', resize: 'vertical' }}
                    />
                    <select
                      value={borrador.categoria || ''}
                      onChange={(e) => setBorrador({ ...borrador, categoria: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}
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
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                      />
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                      <input
                        type="checkbox"
                        checked={!!borrador.precio_personalizado}
                        onChange={(e) => setBorrador({ ...borrador, precio_personalizado: e.target.checked })}
                      />
                      Precio personalizado (a convenir)
                    </label>
                    {!borrador.precio_personalizado && (
                      <input
                        type="number"
                        value={borrador.precio ?? ''}
                        onChange={(e) => setBorrador({ ...borrador, precio: Number(e.target.value) })}
                        placeholder="Precio en MXN"
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                      />
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={() => guardarEdicion(s.id)}
                        disabled={guardando}
                        style={{
                          background: '#B66878', color: 'white', padding: '8px 18px',
                          borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                        }}
                      >
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        style={{
                          background: 'white', color: '#6b7280', padding: '8px 18px',
                          borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                          {s.titulo}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                          {s.categoria_display} · {s.precio_personalizado ? 'Precio personalizado' : `$${(s.precio ?? 0).toLocaleString('es-MX')} MXN`}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                        background: s.activo ? '#f0fdf4' : '#f3f4f6',
                        color: s.activo ? '#16a34a' : '#6b7280',
                      }}>
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => iniciarEdicion(s)}
                        style={{
                          background: 'white', color: '#B66878', padding: '6px 16px',
                          borderRadius: '8px', border: '1px solid #EFC3CA', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => manejarToggle(s.id)}
                        style={{
                          background: 'white', color: s.activo ? '#ef4444' : '#16a34a', padding: '6px 16px',
                          borderRadius: '8px', border: `1px solid ${s.activo ? '#fecaca' : '#bbf7d0'}`,
                          cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                        }}
                      >
                        {s.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}