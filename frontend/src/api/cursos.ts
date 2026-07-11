import api from './axios'

export interface Curso {
  id: number
  titulo: string
  descripcion: string
  imagen: string | null
  categoria: string
  categoria_display: string
  nivel: string
  nivel_display: string
  duracion_horas: number
  link_externo: string | null
  instructor: string | null
  fecha_creacion: string
}

// ---------- Público / usuarias ----------
// GET /api/cursos/  y  GET /api/cursos/<id>/  (según courses/urls.py: router_public)

export const getCursos = async (filtros?: Record<string, string>): Promise<Curso[]> => {
  const { data } = await api.get('/cursos/', { params: filtros })
  return data
}

export const getCurso = async (id: number): Promise<Curso> => {
  const { data } = await api.get(`/cursos/${id}/`)
  return data
}

// ---------- Admin (CRUD) ----------
// /api/admin/cursos/  (según courses/urls.py: router_admin)

export const getCursosAdmin = async (filtros?: Record<string, string>): Promise<Curso[]> => {
  const { data } = await api.get('/admin/cursos/', { params: filtros })
  return data
}

export const crearCurso = async (curso: FormData): Promise<Curso> => {
  const { data } = await api.post('/admin/cursos/', curso, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const editarCurso = async (id: number, curso: FormData): Promise<Curso> => {
  const { data } = await api.patch(`/admin/cursos/${id}/`, curso, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const eliminarCurso = async (id: number): Promise<void> => {
  await api.delete(`/admin/cursos/${id}/`)
}