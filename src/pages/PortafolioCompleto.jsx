import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function PortafolioCompleto() {
  const [proyectos, setProyectos] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchProyectos()
  }, [])

  const fetchProyectos = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          clientes (nombre, apellido, tipo_proyecto)
        `)
        .eq('mostrar_en_portafolio', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProyectos(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const tiposProyecto = ['todos', 'Casa Residencial', 'Oficina Comercial', 'Complejo Habitacional']
  
  const proyectosFiltrados = filtro === 'todos' 
    ? proyectos 
    : proyectos.filter(p => p.clientes?.tipo_proyecto === filtro)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <div className="text-amber-900 text-lg">Cargando portafolio...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 to-orange-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-wider">ARQZOY</div>
                <div className="text-xs text-amber-200 tracking-widest">ARQUITECTURA & DISEÑO</div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">Portafolio Completo</h1>
            <p className="text-xl text-amber-200 max-w-3xl mx-auto">
              Explora todos nuestros proyectos de arquitectura y construcción modular
            </p>
            
            {/* Estadísticas */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-300">{proyectos.length}</div>
                <div className="text-amber-200 text-sm">Proyectos Totales</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-300">
                  {proyectos.filter(p => p.clientes?.tipo_proyecto === 'Casa Residencial').length}
                </div>
                <div className="text-amber-200 text-sm">Viviendas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-300">
                  {proyectos.filter(p => p.clientes?.tipo_proyecto === 'Oficina Comercial').length}
                </div>
                <div className="text-amber-200 text-sm">Comerciales</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Panel de Admin (solo para usuarios logueados) */}
        {user && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-amber-900 flex items-center">
                <span className="mr-2">⚙️</span>
                Panel de Control del Portafolio
              </h3>
              <div className="flex gap-4">
                <a 
                  href="/admin" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📊 Ir a Admin
                </a>
                <a 
                  href="/" 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🏠 Inicio
                </a>
              </div>
            </div>
            <p className="text-amber-700 mt-2">
              Puedes gestionar los proyectos desde el panel de administración.
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-12 text-center">
          <div className="inline-flex bg-white rounded-lg shadow-md p-2 flex-wrap gap-2">
            {tiposProyecto.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filtro === tipo
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                {tipo === 'todos' ? '🏗️ Todos' : 
                 tipo === 'Casa Residencial' ? '🏠 Viviendas' :
                 tipo === 'Oficina Comercial' ? '🏢 Comerciales' : 
                 '🏘️ Complejos'}
              </button>
            ))}
          </div>
          <p className="text-amber-700 mt-4">
            Mostrando {proyectosFiltrados.length} de {proyectos.length} proyectos
          </p>
        </div>

        {/* Grid de Proyectos */}
        {proyectosFiltrados.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proyectosFiltrados.map((proyecto) => (
              <div key={proyecto.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Imagen placeholder */}
                <div className="h-64 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl">🏗️</span>
                    <p className="text-amber-800 font-medium mt-2">Proyecto Arquitectónico</p>
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-3">{proyecto.titulo}</h3>
                  <p className="text-amber-700 mb-4 leading-relaxed">{proyecto.descripcion}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                        {proyecto.clientes?.tipo_proyecto || 'Proyecto'}
                      </span>
                      <span className="text-sm text-amber-600">
                        {proyecto.clientes?.nombre} {proyecto.clientes?.apellido}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-amber-200">
                      <a
                        href={`/cliente/${proyecto.url_privada}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-800 font-semibold text-sm flex items-center justify-between group"
                      >
                        <span>Ver Proyecto Completo</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-2xl font-bold text-amber-900 mb-4">No hay proyectos en esta categoría</h3>
            <p className="text-amber-700 mb-8">
              {filtro === 'todos' 
                ? 'Aún no hay proyectos en el portafolio' 
                : `No hay proyectos de tipo "${filtro}" para mostrar`
              }
            </p>
            {user && (
              <a
                href="/admin"
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                📊 Ir al Panel de Admin
              </a>
            )}
          </div>
        )}

        {/* Botón Volver */}
        <div className="text-center mt-16">
          <a
            href="/"
            className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-semibold"
          >
            ← Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}

export default PortafolioCompleto