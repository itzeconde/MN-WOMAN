import api from './axios'

export interface Curso {
  id: number
  title: string
  description: string
  organizer: string
  category: string
  level: string
  modality: 'online' | 'presencial' | 'hibrido'
  location: string
  duration_hours: number
  is_free: boolean
  price: string | null
  external_url: string
  start_date: string | null
  end_date: string | null
  thumbnail: string | null
  is_active: boolean
  created_at: string
}

// ---------- Público / usuarias ----------

export const getCursos = async (filtros?: Record<string, string>) => {
  const { data } = await api.get('/cursos/', { params: filtros })
  return data
}

export const getCurso = async (id: number) => {
  const { data } = await api.get(`/cursos/${id}/`)
  return data
}

export const getCursosPublic = async () => {
  const { data } = await api.get('/cursos/public/')
  return data
}

// ---------- Admin (CRUD) ----------

export const getCursosAdmin = async (filtros?: Record<string, string>) => {
  const { data } = await api.get('/cursos/admin/cursos/', { params: filtros })
  return data
}

export const crearCurso = async (curso: FormData) => {
  const { data } = await api.post('/cursos/admin/cursos/', curso, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const editarCurso = async (id: number, curso: FormData) => {
  const { data } = await api.patch(`/cursos/admin/cursos/${id}/`, curso, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const eliminarCurso = async (id: number) => {
  await api.delete(`/cursos/admin/cursos/${id}/`)
}