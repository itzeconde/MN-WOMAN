import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE,
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

// ── Mutex de refresh ─────────────────────────────────────────────────────
// Con ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION en el backend, cada
// refresh invalida el token anterior. Si dos peticiones truenan con 401 al
// mismo tiempo, sin este mutex cada una intentaría refrescar por su cuenta
// y la segunda fallaría porque el refresh token ya fue blacklisteado por
// la primera. Aquí se comparte una sola promesa de refresh en curso.
let refreshEnCurso: Promise<string> | null = null

function limpiarSesionYRedirigir() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

async function refrescarToken(): Promise<string> {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) {
    throw new Error('No hay refresh token')
  }
  const { data } = await axios.post(`${API_BASE}/users/token/refresh/`, { refresh })
  localStorage.setItem('access_token', data.access)
  return data.access
}

// Endpoints públicos donde un 401 es una respuesta normal (credenciales
// incorrectas), no un token expirado — aquí NUNCA se debe intentar refresh.
const RUTAS_SIN_REFRESH = [
  '/users/login/',
  '/users/register/',
  '/users/consultar-status/',
  '/users/token/refresh/',
]

function esRutaPublicaDeAuth(url?: string): boolean {
  if (!url) return false
  return RUTAS_SIN_REFRESH.some((ruta) => url.includes(ruta))
}

// Refrescar token si expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const esPublica = esRutaPublicaDeAuth(original?.url)

    if (error.response?.status === 401 && !original._retry && !esPublica) {
      original._retry = true

      try {
        // Si ya hay un refresh en curso, todos esperan el mismo resultado
        if (!refreshEnCurso) {
          refreshEnCurso = refrescarToken().finally(() => {
            refreshEnCurso = null
          })
        }
        const nuevoAccess = await refreshEnCurso
        original.headers.Authorization = `Bearer ${nuevoAccess}`
        return api(original)
      } catch {
        limpiarSesionYRedirigir()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api