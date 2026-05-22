import api from './axios'

export const getInstituciones = async () => {
  const { data } = await api.get('/linea911/instituciones/')
  return data
}

export const solicitarApoyo = async (formData: Record<string, string>) => {
  const { data } = await api.post('/linea911/solicitar/', formData)
  return data
}