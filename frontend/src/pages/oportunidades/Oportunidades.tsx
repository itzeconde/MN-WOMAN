import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOportunidades } from '../../api/oportunidades'

interface Oportunidad {
  id: number
  publicada_por: number
  publicada_por_nombre: string
  titulo: string
  descripcion: string
  categoria: string
  urgencia: 'alta' | 'media' | 'baja'
  status: string
  presupuesto_min: number | null
  presupuesto_max: number | null
  etiquetas: string
  vence_el: string
  total_postulaciones: number
  creada_el: string
}

const CATEGORIAS = [
  { value: 'consultoria', label: 'Consultoría B2B' },
  { value: 'diseno', label: 'Diseño y Branding' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'suministros', label: 'Suministros' },
  { value: 'educacion', label: 'Educación' },
]

const URGENCIA_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  alta: { bg: '#fef2f2', color: '#dc2626', label: 'Urgente' },
  media: { bg: '#fffbeb', color: '#d97706', label: 'Media' },
  baja: { bg: '#f0fdf4', color: '#16a34a', label: 'Baja' },
}

const PALETA = [
  { bg: '#eef2ff', color: '#6366f1' },
  { bg: '#fdf4ff', color: '#a855f7' },
  { bg: '#eff6ff', color: '#3b82f6' },
  { bg: '#fdf2f4', color: '#B66878' },
  { bg: '#f0fdf4', color: '#22c55e' },
  { bg: '#fff7ed', color: '#f97316' },
]

const colorPorCategoria = (cat: string) => {
  const idx = cat.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETA.length
  return PALETA[idx]
}

const labelCategoria = (value: string) =>
  CATEGORIAS.find((c) => c.value === value)?.label || value

export default function Oportunidades() {
  const navigate = useNavigate()
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const filtros: Record<string, string> = {}
        if (categoriaActiva) filtros.categoria = categoriaActiva
        const data = await getOportunidades(filtros)
        setOportunidades(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [categoriaActiva])

  const oportunidadesFiltradas = oportunidades.filter(
    (o) =>
      busqueda === '' ||
      o.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.publicada_por_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.etiquetas.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '32px', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
              Oportunidades
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>
              Colaboraciones y proyectos publicados por la red
            </p>
          </div>
          <button
            onClick={() => navigate('/oportunidades/nueva')}
            style={{
              background: '#B66878', color: 'white', padding: '12px 24px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            + Publicar oportunidad
          </button>
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar por título, etiqueta o quién publica..."
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
          <button
            onClick={() => setCategoriaActiva('')}
            style={{
              padding: '7px 16px', borderRadius: '20px', border: '1px solid',
              borderColor: categoriaActiva === '' ? '#B66878' : '#e5e7eb',
              background: categoriaActiva === '' ? '#fdf2f4' : 'white',
              color: categoriaActiva === '' ? '#B66878' : '#6b7280',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500',
            }}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoriaActiva(cat.value === categoriaActiva ? '' : cat.value)}
              style={{
                padding: '7px 16px', borderRadius: '20px', border: '1px solid',
                borderColor: categoriaActiva === cat.value ? '#B66878' : '#e5e7eb',
                background: categoriaActiva === cat.value ? '#fdf2f4' : 'white',
                color: categoriaActiva === cat.value ? '#B66878' : '#6b7280',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de oportunidades */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            Cargando oportunidades...
          </div>
        ) : oportunidadesFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>
              No se encontraron oportunidades.
            </p>
            <button
              onClick={() => navigate('/oportunidades/nueva')}
              style={{
                background: '#B66878', color: 'white', padding: '10px 24px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Sé la primera en publicar
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {oportunidadesFiltradas.map((op) => {
              const colorCat = colorPorCategoria(op.categoria)
              const urgencia = URGENCIA_STYLE[op.urgencia]
              const iniciales = op.publicada_por_nombre
                .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

              return (
                <div
                  key={op.id}
                  onClick={() => navigate(`/oportunidades/${op.id}`)}
                  style={{
                    background: 'white', borderRadius: '16px', padding: '24px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    cursor: 'pointer', transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
                >
                  {/* Categoría + urgencia */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: '600',
                      background: colorCat.bg, color: colorCat.color,
                    }}>
                      {labelCategoria(op.categoria)}
                    </span>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: '700',
                      background: urgencia.bg, color: urgencia.color,
                    }}>
                      {urgencia.label}
                    </span>
                  </div>

                  {/* Título y descripción */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                      {op.titulo}
                    </h3>
                    <p style={{
                      color: '#6b7280', fontSize: '13px', lineHeight: '1.5',
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {op.descripcion}
                    </p>
                  </div>

                  {/* Presupuesto */}
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#B66878' }}>
                    {op.presupuesto_min && op.presupuesto_max
                      ? `$${Number(op.presupuesto_min).toLocaleString('es-MX')} - $${Number(op.presupuesto_max).toLocaleString('es-MX')} MXN`
                      : 'Presupuesto a convenir'}
                  </div>

                  {/* Footer: publicada_por + vence + postulaciones */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '12px', borderTop: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                          {op.publicada_por_nombre}
                        </p>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Vence: {new Date(op.vence_el).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
                      {op.total_postulaciones} postulación{op.total_postulaciones !== 1 ? 'es' : ''}
                    </span>
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