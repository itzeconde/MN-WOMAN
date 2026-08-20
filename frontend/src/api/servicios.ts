import api from './axios'

export interface Categoria {
  value: string
  label: string
}

export interface CategoriasResponse {
  categorias: Categoria[]
  sugerencias_otro: string[]
}

export interface Servicio {
  id: number
  proveedora: number
  nombre_proveedora: string
  titulo: string
  descripcion: string
  categoria: string
  categoria_otro: string
  categoria_display: string
  precio: number | null
  precio_personalizado: boolean
  activo: boolean
  creado_el: string
}

export interface NuevoServicioPayload {
  titulo: string
  descripcion: string
  categoria: string
  categoria_otro: string
  precio: string | null
  precio_personalizado: boolean
}

export interface ServicioEditPayload {
  titulo: string
  descripcion: string
  categoria: string
  categoria_otro: string
  precio: string | null
  precio_personalizado: boolean
}

export const getServicios = async (filtros?: Record<string, string>): Promise<Servicio[]> => {
  const { data } = await api.get('/servicios/', { params: filtros })
  return data
}

export const getServicio = async (id: number): Promise<Servicio> => {
  const { data } = await api.get(`/servicios/${id}/`)
  return data
}

export const publicarServicio = async (formData: NuevoServicioPayload): Promise<Servicio> => {
  const { data } = await api.post('/servicios/publicar/', formData)
  return data
}

export const getMisServicios = async (): Promise<Servicio[]> => {
  const { data } = await api.get('/servicios/mis-servicios/')
  return data
}

export const getCategoriasServicios = async (): Promise<CategoriasResponse> => {
  const { data } = await api.get('/servicios/categorias/')
  return data
}

export const editarServicio = async (id: number, payload: ServicioEditPayload): Promise<Servicio> => {
  const { data } = await api.patch(`/servicios/${id}/editar/`, payload)
  return data
}

export const toggleActivoServicio = async (id: number): Promise<Servicio> => {
  const { data } = await api.patch(`/servicios/${id}/toggle-activo/`)
  return data
}