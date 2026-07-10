import api from './axios'

export const login = async (username: string, password: string) => {
  const { data } = await api.post('/users/login/', { username, password })
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  return data
}

export const register = async (formData: Record<string, string>) => {
  const { data } = await api.post('/users/register/', formData)
  return data
}

export const logout = async () => {
  const refresh = localStorage.getItem('refresh_token')
  try {
    if (refresh) {
      await api.post('/users/logout/', { refresh })
    }
  } catch {
    // Si el backend no responde o el token ya expiró, igual limpiamos localmente.
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}