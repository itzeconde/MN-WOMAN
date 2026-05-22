import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Directorio from './pages/directorio/Directorio'
import PerfilPublico from './pages/directorio/PerfilPublico'
import Cursos from './pages/cursos/Cursos'
import DetalleCurso from './pages/cursos/DetalleCurso'
import Eventos from './pages/eventos/Eventos'
import DetalleEvento from './pages/eventos/DetalleEvento'
import Oportunidades from './pages/oportunidades/Oportunidades'
import Servicios from './pages/servicios/Servicios'
import NuevoServicio from './pages/servicios/NuevoServicio'
import Linea911 from './pages/linea911/Linea911'
import Perfil from './pages/perfil/Perfil'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEventos from './pages/admin/AdminEventos'
import AdminSolicitudes from './pages/admin/AdminSolicitudes'
import AdminArticulos from './pages/admin/articulos'
import Articulos from './pages/articulos/Articulos'

// Solo redirige si está autenticado y aprobado — pendientes/rechazadas ven la landing
function RutaLanding({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div>Cargando...</div>
  if (usuario?.role === 'administrador') return <Navigate to="/admin" />
  if (usuario?.status === 'aprobada') return <Navigate to="/dashboard" />
  return <>{children}</>
}

// Rutas que requieren login Y estar aprobada
function RutaPrivada({ children }: { children: React.ReactNode }) {
  const { estaAutenticado, cargando, usuario } = useAuth()
  if (cargando) return <div>Cargando...</div>
  if (!estaAutenticado) return <Navigate to="/login" />
  if (usuario?.status === 'pendiente' || usuario?.status === 'rechazada') return <Navigate to="/login" />
  return <>{children}</>
}

// Rutas públicas — redirige si ya está autenticado
function RutaPublica({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div>Cargando...</div>
  if (!usuario) return <>{children}</>
  return usuario.role === 'administrador'
    ? <Navigate to="/admin" />
    : <Navigate to="/dashboard" />
}

function RutaAdmin({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div>Cargando...</div>
  return usuario?.role === 'administrador' ? <>{children}</> : <Navigate to="/dashboard" />
}

// Páginas semi-públicas: visibles sin login, pero con contenido limitado
function RutaSemiPublica({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>

      {/* Landing — redirige si ya está aprobada */}
      <Route path="/" element={
        <RutaLanding>
          <Navbar />
          <LandingPage />
          <Footer />
        </RutaLanding>
      } />

      <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
      <Route path="/register" element={<RutaPublica><Register /></RutaPublica>} />

      {/* Panel Admin */}
      <Route path="/admin" element={<RutaAdmin><AdminLayout /></RutaAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="eventos" element={<AdminEventos />} />
        <Route path="solicitudes" element={<AdminSolicitudes />} />
        <Route path="articulos" element={<AdminArticulos />} />
      </Route>

      {/* Páginas accesibles SIN login (cursos, linea911, artículos) */}
      <Route path="/cursos" element={
        <>
          <Navbar />
          <RutaSemiPublica><Cursos /></RutaSemiPublica>
          <Footer />
        </>
      } />
      <Route path="/linea911" element={
        <>
          <Navbar />
          <RutaSemiPublica><Linea911 /></RutaSemiPublica>
          <Footer />
        </>
      } />
      <Route path="/articulos" element={
        <>
          <Navbar />
          <RutaSemiPublica><Articulos /></RutaSemiPublica>
          <Footer />
        </>
      } />

      {/* Rutas privadas con Navbar */}
      <Route path="/*" element={
        <>
          <Navbar />
          <Routes>
            <Route path="/dashboard" element={<RutaPrivada><Dashboard /></RutaPrivada>} />
            <Route path="/directorio" element={<RutaPrivada><Directorio /></RutaPrivada>} />
            <Route path="/directorio/:id" element={<RutaPrivada><PerfilPublico /></RutaPrivada>} />
            <Route path="/cursos/:id" element={<RutaPrivada><DetalleCurso /></RutaPrivada>} />
            <Route path="/eventos" element={<RutaPrivada><Eventos /></RutaPrivada>} />
            <Route path="/eventos/:id" element={<RutaPrivada><DetalleEvento /></RutaPrivada>} />
            <Route path="/oportunidades" element={<RutaPrivada><Oportunidades /></RutaPrivada>} />
            <Route path="/servicios" element={<RutaPrivada><Servicios /></RutaPrivada>} />
            <Route path="/servicios/nuevo" element={<RutaPrivada><NuevoServicio /></RutaPrivada>} />
            <Route path="/perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />
          </Routes>
          <Footer />
        </>
      } />

    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App