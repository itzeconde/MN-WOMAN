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

export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}