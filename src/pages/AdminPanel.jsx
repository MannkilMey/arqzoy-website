import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import SubidaArchivos from '../components/SubidaArchivos'


function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)
  const [mostrarSubidaArchivos, setMostrarSubidaArchivos] = useState(false)

  // Estado para formularios
  const [nuevoCliente, setNuevoCliente] = useState({
  nombre: '', apellido: '', email: '', telefono: '', tipo_proyecto: '',
  referido: '', monto_abonado: '', fecha_inicio: '', fecha_entrega: ''
})

  const [nuevoProyecto, setNuevoProyecto] = useState({
    cliente_id: '', titulo: '', descripcion: '', mostrar_en_portafolio: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientesRes, proyectosRes] = await Promise.all([
      supabase.from('clientes').select('*, email, telefono').order('created_at', { ascending: false }),
        supabase.from('proyectos').select(`
          *,
          clientes (nombre, apellido)
        `).order('created_at', { ascending: false })
      ])

      if (clientesRes.error) throw clientesRes.error
      if (proyectosRes.error) throw proyectosRes.error

      setClientes(clientesRes.data)
      setProyectos(proyectosRes.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const agregarCliente = async (e) => {
  e.preventDefault()
  try {
    // Convertir fechas vacías a null
    const clienteData = {
      ...nuevoCliente,
      fecha_inicio: nuevoCliente.fecha_inicio || null,
      fecha_entrega: nuevoCliente.fecha_entrega || null,
      monto_abonado: nuevoCliente.monto_abonado ? parseFloat(nuevoCliente.monto_abonado) : 0
    }

    const { error } = await supabase
      .from('clientes')
      .insert([clienteData])

    if (error) throw error

    setNuevoCliente({
      nombre: '', apellido: '', email: '', telefono: '', tipo_proyecto: '',
      referido: '', monto_abonado: '', fecha_inicio: '', fecha_entrega: ''
    })
    fetchData()
    alert('✅ Cliente agregado exitosamente')
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al agregar cliente: ' + error.message)
  }
}

  const agregarProyecto = async (e) => {
    e.preventDefault()
    try {
      const urlPrivada = Math.random().toString(36).substring(2, 15)
      
      const { error } = await supabase
        .from('proyectos')
        .insert([{ ...nuevoProyecto, url_privada: urlPrivada }])

      if (error) throw error

      setNuevoProyecto({
        cliente_id: '', titulo: '', descripcion: '', mostrar_en_portafolio: false
      })
      fetchData()
      alert('✅ Proyecto agregado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al agregar proyecto')
    }
  }

  const togglePortafolio = async (proyectoId, currentValue) => {
    try {
      const { error } = await supabase
        .from('proyectos')
        .update({ mostrar_en_portafolio: !currentValue })
        .eq('id', proyectoId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    }
  }
  const cambiarEstadoProyecto = async (proyectoId, nuevoEstado) => {
  try {
    const { error } = await supabase
      .from('proyectos')
      .update({ estado: nuevoEstado })
      .eq('id', proyectoId)

    if (error) throw error
    fetchData()
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al cambiar estado: ' + error.message)
  }
}

  const totalIngresos = clientes.reduce((sum, c) => sum + (c.monto_abonado || 0), 0)
  const proyectosPublicos = proyectos.filter(p => p.mostrar_en_portafolio).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <div className="text-primary-900 mt-4">Cargando panel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-100">
      {/* Header Mejorado */}
      <header className="bg-gradient-to-r from-primary-900 to-primary-800 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
  <div>
    <h1 className="text-4xl font-bold mb-2">🏗️ Panel de Control</h1>
    <p className="text-primary-100">Gestión integral de proyectos arquitectónicos</p>
  </div>
  <div className="flex items-center space-x-4">
    <span className="text-primary-100">👤 {user?.email}</span>
    <button
      onClick={async () => {
        await signOut()
        navigate('/')
      }}
      className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300 border border-red-400/30 hover:border-red-400/50 text-red-200 hover:text-white"
    >
      🚪 Cerrar Sesión
    </button>
    <a 
      href="/" 
      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50"
    >
      ← Volver al Sitio
    </a>
  </div>
</div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs Mejoradas */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-2">
            <nav className="flex space-x-2">
              {[
                { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                { id: 'clientes', label: `👥 Clientes (${clientes.length})`, icon: '👥' },
                { id: 'proyectos', label: `📐 Proyectos (${proyectos.length})`, icon: '📐' },
                { id: 'configuracion', label: '⚙️ Configuración', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-lg transform scale-105'
                      : 'text-accent-600 hover:bg-accent-50 hover:text-primary-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Clientes</p>
                    <p className="text-3xl font-bold">{clientes.length}</p>
                  </div>
                  <div className="text-4xl opacity-80">👥</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Proyectos</p>
                    <p className="text-3xl font-bold">{proyectos.length}</p>
                  </div>
                  <div className="text-4xl opacity-80">📐</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">En Portafolio</p>
                    <p className="text-3xl font-bold">{proyectosPublicos}</p>
                  </div>
                  <div className="text-4xl opacity-80">👁️</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Ingresos Total</p>
                    <p className="text-2xl font-bold">${totalIngresos.toLocaleString()}</p>
                  </div>
                  <div className="text-4xl opacity-80">💰</div>
                </div>
              </div>
            </div>

            {/* Proyectos Recientes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-primary-900 mb-6 flex items-center">
                <span className="mr-3">🚀</span>
                Proyectos Recientes
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proyectos.slice(0, 3).map((proyecto) => (
                  <div key={proyecto.id} className="border border-accent-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-primary-900">{proyecto.titulo}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        proyecto.mostrar_en_portafolio 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {proyecto.mostrar_en_portafolio ? '👁️ Público' : '🔒 Privado'}
                      </span>
                    </div>
                    <p className="text-accent-700 text-sm mb-2">{proyecto.descripcion}</p>
                    <p className="text-xs text-accent-500">
                      {proyecto.clientes?.nombre} {proyecto.clientes?.apellido}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clientes Tab */}
        {activeTab === 'clientes' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario Agregar Cliente Mejorado */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-2xl font-bold text-primary-900 mb-6 flex items-center">
                  <span className="mr-3">➕</span>
                  Nuevo Cliente
                </h3>
                <form onSubmit={agregarCliente} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={nuevoCliente.nombre}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                      className="p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={nuevoCliente.apellido}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, apellido: e.target.value})}
                      className="p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <input
                    type="email"
                    placeholder="📧 Email"
                    value={nuevoCliente.email}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />

                  <input
                    type="tel"
                    placeholder="📱 Teléfono"
                    value={nuevoCliente.telefono}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                                    
                  <select
                    value={nuevoCliente.tipo_proyecto}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, tipo_proyecto: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">🏗️ Tipo de Proyecto</option>
                    <option value="Casa Residencial">🏠 Casa Residencial</option>
                    <option value="Oficina Comercial">🏢 Oficina Comercial</option>
                    <option value="Complejo Habitacional">🏘️ Complejo Habitacional</option>
                    <option value="Otro">⚡ Otro</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="👤 Referido por"
                    value={nuevoCliente.referido}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, referido: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  
                  <input
                    type="number"
                    placeholder="💰 Monto abonado"
                    value={nuevoCliente.monto_abonado}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, monto_abonado: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-1">📅 Inicio</label>
                      <input
                        type="date"
                        value={nuevoCliente.fecha_inicio}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, fecha_inicio: e.target.value})}
                        className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-accent-700 mb-1">🎯 Entrega</label>
                      <input
                        type="date"
                        value={nuevoCliente.fecha_entrega}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, fecha_entrega: e.target.value})}
                        className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ✨ Agregar Cliente
                  </button>
                </form>
              </div>
            </div>

            {/* Lista de Clientes Mejorada */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                  <h3 className="text-2xl font-bold flex items-center">
                    <span className="mr-3">👥</span>
                    Lista de Clientes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {clientes.map((cliente) => (
                      <div key={cliente.id} className="border border-accent-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-primary-300">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-primary-900 mb-1">
                              {cliente.nombre} {cliente.apellido}
                            </h4>
                            <p className="text-accent-600 mb-2">📧 {cliente.contacto}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                🏗️ {cliente.tipo_proyecto}
                              </span>
                              {cliente.referido && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                                  👤 {cliente.referido}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-600 font-semibold">💰 ${cliente.monto_abonado?.toLocaleString()}</span>
                              <span className="text-blue-600 font-semibold">⏱️ {cliente.duracion_dias} días</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proyectos Tab */}
        {activeTab === 'proyectos' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario Agregar Proyecto Mejorado */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-2xl font-bold text-primary-900 mb-6 flex items-center">
                  <span className="mr-3">📐</span>
                  Nuevo Proyecto
                </h3>
                <form onSubmit={agregarProyecto} className="space-y-4">
                  <select
                    value={nuevoProyecto.cliente_id}
                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, cliente_id: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">👤 Seleccionar Cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="🏗️ Título del proyecto"
                    value={nuevoProyecto.titulo}
                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, titulo: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                  
                  <textarea
                    placeholder="📝 Descripción del proyecto"
                    value={nuevoProyecto.descripcion}
                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}
                    rows="4"
                    className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  
                  <label className="flex items-center p-3 border border-accent-300 rounded-lg hover:bg-accent-50 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nuevoProyecto.mostrar_en_portafolio}
                      onChange={(e) => setNuevoProyecto({...nuevoProyecto, mostrar_en_portafolio: e.target.checked})}
                      className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-accent-300 rounded"
                    />
                    <span className="text-sm font-medium text-accent-700">👁️ Mostrar en portafolio público</span>
                  </label>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ✨ Crear Proyecto
                  </button>
                </form>
              </div>
            </div>
              {/* Lista de Proyectos Mejorada */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                    <h3 className="text-2xl font-bold flex items-center">
                      <span className="mr-3">📐</span>
                      Lista de Proyectos
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {proyectos.map((proyecto) => (
                        <div key={proyecto.id} className="border border-accent-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-primary-900 mb-2">{proyecto.titulo}</h4>
                              <p className="text-accent-700 mb-3">{proyecto.descripcion}</p>
                              <div className="space-y-2 mb-3">
                                <div className="text-sm text-accent-600">
                                  👤 <strong>Cliente:</strong> {proyecto.clientes?.nombre} {proyecto.clientes?.apellido}
                                </div>
                                <div className="text-sm text-accent-600 mb-2">
                                  🔗 <strong>URL privada:</strong> 
                                  <code className="ml-2 bg-accent-100 px-2 py-1 rounded text-primary-600">
                                    /cliente/{proyecto.url_privada}
                                  </code>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => {
                                      const url = `${window.location.origin}/cliente/${proyecto.url_privada}`
                                      navigator.clipboard.writeText(url)
                                      alert('✅ Link copiado al portapapeles!')
                                    }}
                                    className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                  >
                                    📋 Copiar Link
                                  </button>
                                  <a
                                    href={`/cliente/${proyecto.url_privada}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                                  >
                                    👁️ Vista Previa
                                  </a>
                                  <button
                                    onClick={() => {
                                      setProyectoSeleccionado(proyecto)
                                      setMostrarSubidaArchivos(true)
                                    }}
                                    className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                                  >
                                    📁 Gestionar Archivos
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => togglePortafolio(proyecto.id, proyecto.mostrar_en_portafolio)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                  proyecto.mostrar_en_portafolio
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                {proyecto.mostrar_en_portafolio ? '👁️ Público' : '🔒 Privado'}
                              </button>
                               
                                <select
                                  value={proyecto.estado || 'en_progreso'}
                                  onChange={(e) => cambiarEstadoProyecto(proyecto.id, e.target.value)}
                                  className="w-full px-3 py-1 text-xs border border-accent-300 rounded-full focus:ring-2 focus:ring-primary-500"
                                >
                                  <option value="en_progreso">🚧 En Progreso</option>
                                  <option value="revision">👀 En Revisión</option>
                                  <option value="completo">✅ Completo</option>
                                  <option value="pausado">⏸️ Pausado</option>
                                </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
                        </div>
                      )}

        {/* Configuración Tab */}
        {activeTab === 'configuracion' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-primary-900 mb-8 flex items-center">
                <span className="mr-3">⚙️</span>
                Configuración del Sistema
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">🔧 Configuración General</h4>
                    <p className="text-blue-700 mb-4">Ajusta los parámetros principales del sistema.</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Configurar
                    </button>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <h4 className="text-lg font-semibold text-green-900 mb-3">💾 Respaldo de Datos</h4>
                    <p className="text-green-700 mb-4">Crea una copia de seguridad de toda tu información.</p>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Crear Respaldo
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-900 mb-3">📊 Exportar Datos</h4>
                    <p className="text-purple-700 mb-4">Descarga reportes en diferentes formatos.</p>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Exportar
                    </button>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <h4 className="text-lg font-semibold text-orange-900 mb-3">🎨 Personalización</h4>
                    <p className="text-orange-700 mb-4">Modifica colores, logos y estilos del sitio.</p>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Personalizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
       )}
      </div>

      {/* Modal de Subida de Archivos */}
      {mostrarSubidaArchivos && proyectoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">📁 Gestionar Archivos</h3>
                  <p className="text-primary-100 mt-1">{proyectoSeleccionado.titulo}</p>
                </div>
                <button
                  onClick={() => {
                    setMostrarSubidaArchivos(false)
                    setProyectoSeleccionado(null)
                  }}
                  className="text-white hover:text-red-200 text-2xl transition-colors"
                >
                  ✖️
                </button>
              </div>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6">
              <SubidaArchivos 
                proyectoId={proyectoSeleccionado.id}
                onArchivoSubido={(archivos) => {
                  console.log('Archivos subidos:', archivos)
                  fetchData() // Actualizar la lista de proyectos
                }}
              />
              
              {/* Botón para cerrar */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setMostrarSubidaArchivos(false)
                    setProyectoSeleccionado(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel