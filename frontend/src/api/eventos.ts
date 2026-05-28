import api from './axios'

// Usuario
export const getEventos = async () => {
  const { data } = await api.get('/eventos/')
  return data
}

export const getEvento = async (id: number) => {
  const { data } = await api.get(`/eventos/${id}/`)
  return data
}

export const confirmarAsistencia = async (id: number, respuesta: 'si' | 'no') => {
  const { data } = await api.post(`/eventos/${id}/asistencia/`, { asistencia: respuesta })
  return data
}

export const getMiAsistencia = async (id: number) => {
  const { data } = await api.get(`/eventos/${id}/mi-asistencia/`)
  return data
}

// Admin
export const adminCrearEvento = async (formData: FormData) => {
  const { data } = await api.post('/eventos/admin/crear/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export const adminEditarEvento = async (id: number, formData: FormData) => {
  const { data } = await api.patch(`/eventos/admin/${id}/editar/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export const adminEliminarEvento = async (id: number) => {
  await api.delete(`/eventos/admin/${id}/editar/`)
}

export const adminGetAsistentes = async (id: number) => {
  const { data } = await api.get(`/eventos/admin/${id}/asistentes/`)
  return data
}

export const adminActualizarAsistencia = async (eventoId: number, asistenciaId: number, status: string) => {
  const { data } = await api.patch(`/eventos/admin/${eventoId}/asistentes/`, {
    asistencia_id: asistenciaId,
    status
  })
  return data
}