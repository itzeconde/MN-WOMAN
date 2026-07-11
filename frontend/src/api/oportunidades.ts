import api from './axios'

export const getOportunidades = async (filtros?: Record<string, string>) => {
  const { data } = await api.get('/oportunidades/', { params: filtros })
  return data
}

export const getOportunidad = async (id: number) => {
  const { data } = await api.get(`/oportunidades/${id}/`)
  return data
}

export const publicarOportunidad = async (formData: Record<string, unknown>) => {
  const { data } = await api.post('/oportunidades/publicar/', formData)
  return data
}

export const postularse = async (id: number, mensaje: string) => {
  const { data } = await api.post(`/oportunidades/${id}/postularse/`, { mensaje })
  return data
}
export const getMisOportunidades = async () => {
  const { data } = await api.get("/oportunidades/mis-oportunidades/")
  return data
}

export const getPostulacionesRecibidas = async (id: number) => {
  const { data } = await api.get(`/oportunidades/${id}/postulaciones/`)
  return data
}

export const cerrarOportunidad = async (id: number) => {
  const { data } = await api.patch(`/oportunidades/${id}/cerrar/`, {})
  return data
}
