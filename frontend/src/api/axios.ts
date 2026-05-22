import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Agregar token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refrescar token si expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        const { data } = await axios.post('http://127.0.0.1:8000/api/users/token/refresh/', {
          refresh,
        })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      }
    }
    return Promise.reject(error)
  }
)

export default api