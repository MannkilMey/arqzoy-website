import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function PortafolioDisenos() {
  const [disenos, setDisenos] = useState([])
  const [disenosFiltrados, setDisenosFiltrados] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDisenos()
  }, [])

  useEffect(() => {
    if (filtro === 'todos') {
      setDisenosFiltrados(disenos)
    } else {
      setDisenosFiltrados(disenos.filter(d => d.categoria === filtro))
    }
  }, [disenos, filtro])

  const fetchDisenos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('portafolio_designs')
        .select('*')
        .eq('mostrar_publico', true)
        .order('orden_display', { ascending: false })

      if (error) throw error
      setDisenos(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorias = [
    { value: 'todos', label: '🎨 Todos los Diseños', count: disenos.length },
    { value: 'arquitectura', label: '🏠 Arquitectura', count: disenos.filter(d => d.categoria === 'arquitectura').length },
    { value: 'interiores', label: '🪑 Interiores', count: disenos.filter(d => d.categoria === 'interiores').length },
    { value: 'muebles', label: '🛋️ Muebles', count: disenos.filter(d => d.categoria === 'muebles').length }
  ]

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
            <h1 className="text-5xl font-bold mb-4">Portafolio de Diseños</h1>
            <p className="text-xl text-amber-200 max-w-3xl mx-auto">
              Explora nuestra colección de diseños arquitectónicos, interiores y muebles personalizados
            </p>
            
            {/* Estadísticas */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-300">{disenos.length}</div>
                <div className="text-amber-200 text-sm">Diseños Totales</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-300">
                  {disenos.filter(d => d.categoria === 'arquitectura').length}
                </div>
                <div className="text-amber-200 text-sm">Arquitectura</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-300">5</div>
                <div className="text-amber-200 text-sm">Años Experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Filtros */}
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Filtrar por Categoría</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categorias.map((categoria) => (
                <button
                  key={categoria.value}
                  onClick={() => setFiltro(categoria.value)}
                  className={`p-4 rounded-lg font-medium transition-all duration-300 text-left ${
                    filtro === categoria.value
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{categoria.label}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      filtro === categoria.value ? 'bg-white/20' : 'bg-amber-200'
                    }`}>
                      {categoria.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Diseños */}
        {disenosFiltrados.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {disenosFiltrados.map((diseno) => (
              <div key={diseno.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Imagen del Diseño */}
                <div className="h-64 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center overflow-hidden">
                  {diseno.imagen_principal ? (
                    <img 
                      src={diseno.imagen_principal}
                      alt={diseno.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl">
                        {diseno.categoria === 'arquitectura' && '🏠'}
                        {diseno.categoria === 'interiores' && '🪑'}
                        {diseno.categoria === 'muebles' && '🛋️'}
                      </span>
                      <p className="text-amber-800 font-medium mt-2 capitalize">{diseno.categoria}</p>
                    </div>
                  )}
                </div>
                
                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-3">{diseno.titulo}</h3>
                  <p className="text-amber-700 mb-4 leading-relaxed">
                    {diseno.descripcion || 'Diseño personalizado que combina funcionalidad y estética moderna.'}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 capitalize">
                        {diseno.categoria}
                      </span>
                      <span className="text-sm text-amber-600 font-semibold">
                        {diseno.año_diseno}
                      </span>
                    </div>
                    
                    {diseno.cliente_tipo && (
                      <div className="text-sm text-amber-600 flex items-center">
                        <span className="mr-2">🏢</span>
                        <span className="capitalize">{diseno.cliente_tipo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-amber-900 mb-4">No hay diseños en esta categoría</h3>
            <p className="text-amber-700 mb-8">
              {filtro === 'todos' 
                ? 'Aún no hay diseños en el portafolio' 
                : `No hay diseños de tipo "${filtro}" para mostrar`
              }
            </p>
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

export default PortafolioDisenos