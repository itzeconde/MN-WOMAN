import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServicios } from '../../api/servicios'

interface Servicio {
  id: number
  proveedora: number
  nombre_proveedora: string
  titulo: string
  descripcion: string
  categoria: string
  precio: number | null
  precio_personalizado: boolean
  activo: boolean
  creado_el: string
}

const CATEGORIAS = [
  { value: '', label: 'Todas' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'estrategia', label: 'Estrategia' },
  { value: 'branding', label: 'Branding' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'educacion', label: 'Educación' },
]

const COLORES_CATEGORIA: Record<string, { bg: string; color: string }> = {
  consultoria: { bg: '#eef2ff', color: '#6366f1' },
  workshop:    { bg: '#fdf4ff', color: '#a855f7' },
  estrategia:  { bg: '#eff6ff', color: '#3b82f6' },
  branding:    { bg: '#fdf2f4', color: '#B66878' },
  tecnologia:  { bg: '#f0fdf4', color: '#22c55e' },
  marketing:   { bg: '#fff7ed', color: '#f97316' },
  educacion:   { bg: '#fefce8', color: '#eab308' },
}

export default function Servicios() {
  const navigate = useNavigate()
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const filtros: Record<string, string> = {}
        if (categoriaActiva) filtros.categoria = categoriaActiva
        const data = await getServicios(filtros)
        setServicios(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [categoriaActiva])

  const serviciosFiltrados = servicios.filter((s) =>
    busqueda === '' ||
    s.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.nombre_proveedora.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
              Servicios Profesionales
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>
              Explora lo que ofrecen las empresarias de la red
            </p>
          </div>
          <button
            onClick={() => navigate('/servicios/nuevo')}
            style={{
              background: '#B66878', color: 'white', padding: '12px 24px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            + Publicar mi servicio
          </button>
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar por servicio o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px',
              border: '1px solid #e5e7eb', fontSize: '14px',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        {/* Filtros de categoría */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoriaActiva(cat.value)}
              style={{
                padding: '7px 16px', borderRadius: '20px', border: '1px solid',
                borderColor: categoriaActiva === cat.value ? '#B66878' : '#e5e7eb',
                background: categoriaActiva === cat.value ? '#fdf2f4' : 'white',
                color: categoriaActiva === cat.value ? '#B66878' : '#6b7280',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                transition: 'all 0.15s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de servicios */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Cargando servicios...</div>
        ) : serviciosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>
              No se encontraron servicios.
            </p>
            <button
              onClick={() => navigate('/servicios/nuevo')}
              style={{
                background: '#B66878', color: 'white', padding: '10px 24px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Sé la primera en publicar
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {serviciosFiltrados.map((servicio) => {
              const colorCat = COLORES_CATEGORIA[servicio.categoria] || { bg: '#f3f4f6', color: '#6b7280' }
              const iniciales = servicio.nombre_proveedora
                .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

              return (
                <div
                  key={servicio.id}
                  style={{
                    background: 'white', borderRadius: '16px', padding: '24px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    transition: 'box-shadow 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
                >
                  {/* Categoría */}
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600',
                    background: colorCat.bg, color: colorCat.color,
                    alignSelf: 'flex-start',
                  }}>
                    {CATEGORIAS.find(c => c.value === servicio.categoria)?.label || servicio.categoria}
                  </span>

                  {/* Título y descripción */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                      {servicio.titulo}
                    </h3>
                    <p style={{
                      color: '#6b7280', fontSize: '13px', lineHeight: '1.5',
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {servicio.descripcion}
                    </p>
                  </div>

                  {/* Precio */}
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#B66878' }}>
                    {servicio.precio_personalizado
                      ? 'Consultar precio'
                      : servicio.precio
                        ? `Desde $${Number(servicio.precio).toLocaleString('es-MX')} MXN`
                        : 'Precio a convenir'}
                  </div>

                  {/* Proveedora */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    paddingTop: '12px', borderTop: '1px solid #f3f4f6',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: '#EFC3CA', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '13px', fontWeight: '700',
                      color: '#B66878', flexShrink: 0,
                    }}>
                      {iniciales}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                        {servicio.nombre_proveedora}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(servicio.creado_el).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}