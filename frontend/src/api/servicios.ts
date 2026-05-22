import api from './axios'

export const getServicios = async (filtros?: Record<string, string>) => {
  const { data } = await api.get('/servicios/', { params: filtros })
  return data
}

export const getServicio = async (id: number) => {
  const { data } = await api.get(`/servicios/${id}/`)
  return data
}

export const publicarServicio = async (formData: Record<string, unknown>) => {
  const { data } = await api.post('/servicios/publicar/', formData)
  return data
}
export const getMisServicios = async () => {
  const { data } = await api.get("/servicios/mis-servicios/")
  return data
}
