import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getPerfil } from '../api/usuarios'
import { logout as logoutApi } from '../api/auth'

interface Usuario {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  status: 'pendiente' | 'aprobada' | 'rechazada'
  rechazo_motivo: string
  company: string
  profile_picture: string
  is_verified: boolean
}

interface AuthContextType {
  usuario: Usuario | null
  cargando: boolean
  login: (access: string, refresh: string) => Promise<Usuario>
  logout: () => void
  estaAutenticado: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      getPerfil()
        .then(setUsuario)
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setCargando(false))
    } else {
      setCargando(false)
    }
  }, [])

  const login = async (access: string, refresh: string): Promise<Usuario> => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    const perfil = await getPerfil()
    setUsuario(perfil)
    return perfil
  }

  const logout = () => {
    logoutApi()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      login,
      logout,
      estaAutenticado: !!usuario
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}