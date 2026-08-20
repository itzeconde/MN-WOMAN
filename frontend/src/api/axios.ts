import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Sincronización entre pestañas ──────────────────────────────────────────
// Si el usuario tiene el sitio abierto en varias pestañas y una refresca el
// token, las demás deben enterarse del nuevo access token sin intentar
// refrescar por su cuenta (evita usar un refresh token ya blacklisteado
// por ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION).
const canal = 'BroadcastChannel' in window ? new BroadcastChannel('auth-sync') : null

function notificarNuevoToken(access: string) {
  canal?.postMessage({ tipo: 'token-actualizado', access })
}

function notificarLogout() {
  canal?.postMessage({ tipo: 'logout' })
}

if (canal) {
  canal.onmessage = (event) => {
    if (event.data?.tipo === 'token-actualizado') {
      // Otra pestaña ya refrescó: solo tomamos el valor, no repetimos el refresh.
      localStorage.setItem('access_token', event.data.access)
    }
    if (event.data?.tipo === 'logout' && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
}

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
  notificarLogout()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Distingue "no hay internet / el servidor no respondió" de "el servidor
// respondió y dijo que el token es inválido". Solo el segundo caso debe
// cerrar la sesión del usuario.
function esErrorDeRed(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

// Exportada para que los componentes puedan distinguir "sin conexión" de
// otros errores (ej. 404, 500) con `instanceof ErrorDeRed` y así no
// mostrar "no se encontraron resultados" cuando en realidad se cayó la red.
export class ErrorDeRed extends Error {
  constructor() {
    super('Sin conexión. Intenta de nuevo cuando recuperes internet.')
    this.name = 'ErrorDeRed'
  }
}

async function refrescarToken(): Promise<string> {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) {
    throw new Error('No hay refresh token')
  }

  let data
  try {
    const respuesta = await axios.post(`${API_BASE}/users/token/refresh/`, { refresh })
    data = respuesta.data
  } catch (err) {
    if (esErrorDeRed(err)) {
      // El backend no respondió por un problema de red: NO tratamos esto
      // como sesión inválida. Propagamos un error distinguible para que
      // el interceptor de respuesta no cierre la sesión del usuario.
      throw new ErrorDeRed()
    }
    // El backend respondió explícitamente (401/400): el refresh token
    // realmente es inválido o expiró. Esto sí amerita cerrar sesión.
    throw err
  }

  localStorage.setItem('access_token', data.access)
  // ROTATE_REFRESH_TOKENS=True: el backend blacklistea el refresh token usado
  // y regresa uno nuevo en `data.refresh`. Si no lo guardamos aquí, el próximo
  // intento de refresh usará el token viejo (ya blacklisteado) y fallará con 401.
  if (data.refresh) {
    localStorage.setItem('refresh_token', data.refresh)
  }
  notificarNuevoToken(data.access)
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

    // Si el fallo original fue por red (no llegó respuesta), no tiene caso
    // intentar refresh: tampoco va a poder llegar al servidor.
    if (esErrorDeRed(error)) {
      return Promise.reject(new ErrorDeRed())
    }

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
        return await api(original)
      } catch (errorRefresh) {
        if (errorRefresh instanceof ErrorDeRed) {
          // No cerramos sesión: el usuario simplemente perdió conexión.
          // La UI puede mostrar un mensaje de "sin conexión, reintenta".
          return Promise.reject(errorRefresh)
        }
        // El refresh token realmente es inválido/expiró: aquí sí cerramos sesión.
        limpiarSesionYRedirigir()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api