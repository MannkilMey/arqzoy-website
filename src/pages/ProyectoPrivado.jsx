import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PrevisualizadorMedias from '../components/PrevisualizadorMedias'

function ProyectoPrivado() {
  const { urlPrivada } = useParams()
  const [proyecto, setProyecto] = useState(null)
  const [archivos, setArchivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProyecto()
  }, [urlPrivada])

  const fetchProyecto = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar proyecto por URL privada
      const { data: proyectoData, error: proyectoError } = await supabase
        .from('proyectos')
        .select(`
          *,
          clientes (*)
        `)
        .eq('url_privada', urlPrivada)
        .single()

      if (proyectoError) {
        if (proyectoError.code === 'PGRST116') {
          setError('Proyecto no encontrado. Verifica el enlace.')
        } else {
          throw proyectoError
        }
        return
      }

      setProyecto(proyectoData)

      // Buscar archivos del proyecto
      const { data: archivosData, error: archivosError } = await supabase
        .from('archivos')
        .select('*')
        .eq('proyecto_id', proyectoData.id)
        .order('created_at', { ascending: false })

      if (archivosError) throw archivosError
      setArchivos(archivosData || [])

    } catch (error) {
      console.error('Error:', error)
      setError('Error al cargar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <div className="text-amber-900 text-lg">Cargando tu proyecto...</div>
        </div>
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-amber-900 mb-4">Proyecto No Encontrado</h1>
          <p className="text-amber-700 mb-6">{error}</p>
          <a 
            href="/" 
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header Privado */}
      <header className="bg-gradient-to-r from-amber-900 to-orange-900 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-2xl font-bold tracking-wider">ARQZOY</span>
              </div>
              <div className="text-amber-200 text-sm">Portal Privado del Cliente</div>
            </div>
            <a 
              href="/" 
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300 border border-white/30"
            >
              🏠 Sitio Principal
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Info del Cliente */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                👋 Hola, {proyecto.clientes?.nombre} {proyecto.clientes?.apellido}
              </h1>
              <p className="text-amber-700">Aquí está toda la información de tu proyecto</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-amber-600">Tipo de Proyecto</div>
              <div className="text-lg font-semibold text-amber-900">{proyecto.clientes?.tipo_proyecto}</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-2xl mb-2">💰</div>
              <div className="text-blue-900 font-semibold">Monto Abonado</div>
              <div className="text-blue-700">${proyecto.clientes?.monto_abonado?.toLocaleString()}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="text-green-600 text-2xl mb-2">📅</div>
              <div className="text-green-900 font-semibold">Fecha de Inicio</div>
              <div className="text-green-700">{new Date(proyecto.clientes?.fecha_inicio).toLocaleDateString()}</div>
            </div>
            
            <div className={`p-6 rounded-lg border ${
              proyecto.estado === 'completo' 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
            }`}>
              <div className={`text-2xl mb-2 ${proyecto.estado === 'completo' ? 'text-green-600' : 'text-orange-600'}`}>
                {proyecto.estado === 'completo' && '✅'}
                {proyecto.estado === 'en_progreso' && '🚧'}
                {proyecto.estado === 'revision' && '👀'}
                {proyecto.estado === 'pausado' && '⏸️'}
              </div>
              <div className={`font-semibold ${proyecto.estado === 'completo' ? 'text-green-900' : 'text-orange-900'}`}>
                Estado del Proyecto
              </div>
              <div className={`capitalize ${proyecto.estado === 'completo' ? 'text-green-700' : 'text-orange-700'}`}>
                {proyecto.estado?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del Proyecto */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            <span className="mr-3">📐</span>
            {proyecto.titulo}
          </h2>
          
          <div className="prose max-w-none">
            <p className="text-amber-700 text-lg leading-relaxed mb-6">
              {proyecto.descripcion}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">📊 Estado del Proyecto</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-700">Estado:</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {proyecto.estado === 'en_progreso' ? 'En Progreso' : proyecto.estado}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Duración:</span>
                  <span className="text-amber-900 font-semibold">{proyecto.clientes?.duracion_dias} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Fecha de Creación:</span>
                  <span className="text-amber-900">{new Date(proyecto.fecha_creacion).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">📞 Información de Contacto</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-orange-700">Email:</span>
                  <span className="text-orange-900">{proyecto.clientes?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Teléfono:</span>
                  <span className="text-orange-900">{proyecto.clientes?.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Referido por:</span>
                  <span className="text-orange-900">{proyecto.clientes?.referido || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Archivos del Proyecto */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
              <span className="mr-3">📁</span>
              Archivos del Proyecto
            </h2>
            
            {archivos.length > 0 ? (
              <div className="space-y-8">
                {/* Galería de Fotos y Videos */}
                {archivos.filter(archivo => 
                  archivo.tipo === 'foto' || 
                  ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'].includes(archivo.formato.toLowerCase())
                ).length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center">
                      <span className="mr-2">📸</span>
                      Galería de Fotos y Videos
                    </h3>
                    <PrevisualizadorMedias archivos={archivos} />
                  </div>
                )}

                {/* Otros Archivos */}
                {archivos.filter(archivo => 
                  archivo.tipo !== 'foto' && 
                  !['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'].includes(archivo.formato.toLowerCase())
                ).length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center">
                      <span className="mr-2">📄</span>
                      Documentos y Planos
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {archivos.filter(archivo => 
                        archivo.tipo !== 'foto' && 
                        !['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'].includes(archivo.formato.toLowerCase())
                      ).map((archivo) => (
                        <div key={archivo.id} className="border border-amber-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="text-center mb-4">
                            <div className="text-4xl mb-2">
                              {archivo.tipo === 'modelo_3d' && '🎮'}
                              {archivo.tipo === 'plano_2d' && '📐'}
                              {archivo.tipo === 'documento' && '📄'}
                              {!['modelo_3d', 'plano_2d', 'documento'].includes(archivo.tipo) && '📎'}
                            </div>
                            <h3 className="font-semibold text-amber-900">{archivo.nombre}</h3>
                            <p className="text-amber-600 text-sm">{archivo.formato.toUpperCase()}</p>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-amber-700">Tipo:</span>
                              <span className="text-amber-900 capitalize">{archivo.tipo.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-amber-700">Tamaño:</span>
                              <span className="text-amber-900">{archivo.tamanio_mb} MB</span>
                            </div>
                          </div>
                          
                          {proyecto.estado === 'completo' ? (
                            <a
                              href={archivo.url_archivo}
                              download={archivo.nombre}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-center"
                            >
                              ✅ Descargar
                            </a>
                          ) : (
                            <div className="w-full mt-4 bg-gray-300 text-gray-600 py-2 rounded-lg text-center cursor-not-allowed">
                              🔒 Disponible cuando esté completo
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-amber-900 mb-2">No hay archivos aún</h3>
                <p className="text-amber-700">Los archivos de tu proyecto aparecerán aquí cuando estén listos</p>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}

export default ProyectoPrivado