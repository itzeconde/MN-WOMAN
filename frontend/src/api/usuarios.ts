import api from './axios'

export const getPerfil = async () => {
  const { data } = await api.get('/users/profile/')
  return data
}

export const updatePerfil = async (formData: FormData) => {
  const { data } = await api.patch('/users/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getDirectorio = async (filtros?: Record<string, string>) => {
  const { data } = await api.get('/users/directorio/', { params: filtros })
  return data
}

export const getPerfilPublico = async (id: number) => {
  const { data } = await api.get(`/users/directorio/${id}/`)
  return data
}

export const consultarStatus = async (username: string, password: string) => {
  const { data } = await api.post('/users/consultar-status/', { username, password })
  return data
}

// ── ADMIN ──────────────────────────────────────────

export const getSolicitudes = async (status: string = 'pendiente') => {
  const { data } = await api.get('/users/admin/solicitudes/', { params: { status } })
  return data
}

export const accionSolicitud = async (id: number, accion: 'aprobar' | 'rechazar', motivo: string = '') => {
  const { data } = await api.post(`/users/admin/solicitudes/${id}/accion/`, { accion, motivo })
  return data
}

export const getUsuariosAdmin = async (search?: string) => {
  const { data } = await api.get('/users/admin/usuarios/', { params: { search } })
  return data
}

export const toggleUsuario = async (id: number) => {
  const { data } = await api.post(`/users/admin/usuarios/${id}/toggle/`)
  return data
}