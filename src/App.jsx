import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import ProyectoPrivado from './pages/ProyectoPrivado'
import PortafolioCompleto from './pages/PortafolioCompleto'
import PortafolioDisenos from './pages/PortafolioDisenos'


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="/portafolio-disenos" element={<PortafolioDisenos />} />
          <Route path="/cliente/:urlPrivada" element={<ProyectoPrivado />} />
          <Route path="/portafolio" element={<PortafolioCompleto />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App