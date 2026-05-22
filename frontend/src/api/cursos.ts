import api from './axios'

export const getCursos = async (filtros?: Record<string, string>) => {
  const { data } = await api.get('/cursos/', { params: filtros })
  return data
}

export const getCurso = async (id: number) => {
  const { data } = await api.get(`/cursos/${id}/`)
  return data
}

export const inscribirse = async (id: number) => {
  const { data } = await api.post(`/cursos/${id}/inscribirse/`)
  return data
}

export const getMisCursos = async () => {
  const { data } = await api.get('/cursos/mis-cursos/')
  return data
}