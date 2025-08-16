import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import SubidaArchivos from '../components/SubidaArchivos'
import SubidaImagenesDiseno from '../components/SubidaImagenesDiseno'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [disenosPortafolio, setDisenosPortafolio] = useState([])
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
  // Estado para diseños de portafolio
const [nuevoDiseno, setNuevoDiseno] = useState({
  titulo: '',
  descripcion: '',
  categoria: '',
  año_diseno: new Date().getFullYear(),
  cliente_tipo: '',
  mostrar_publico: true,
  orden_display: 0,
  tags: []
})

const [mostrarModalDiseno, setMostrarModalDiseno] = useState(false)
const [disenoEditando, setDisenoEditando] = useState(null)
const [modoEdicion, setModoEdicion] = useState(false)

  useEffect(() => {
  fetchData()
  fetchDisenosPortafolio()
  fetchPerfilPersonal()
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
  const fetchDisenosPortafolio = async () => {
  try {
    const { data, error } = await supabase
      .from('portafolio_designs')
      .select('*')
      .order('orden_display', { ascending: false })

    if (error) throw error
    setDisenosPortafolio(data || [])
  } catch (error) {
    console.error('Error:', error)
  }
}
const fetchPerfilPersonal = async () => {
  try {
    const { data, error } = await supabase
      .from('perfil_personal')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (data) {
      setPerfilPersonal(data)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
const subirFotoPerfil = async (e) => {
  const archivo = e.target.files[0]
  if (!archivo) return

  try {
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `perfil/foto-perfil-${timestamp}.${extension}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('arqzoy-archivos')
      .upload(nombreArchivo, archivo)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('arqzoy-archivos')
      .getPublicUrl(nombreArchivo)

    setPerfilPersonal({...perfilPersonal, foto_perfil: publicUrl})
    alert('✅ Foto subida exitosamente!')
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al subir foto: ' + error.message)
  }
}

const guardarPerfil = async (e) => {
  e.preventDefault()
  try {
    const { error } = await supabase
      .from('perfil_personal')
      .upsert([perfilPersonal])

    if (error) throw error

    fetchPerfilPersonal()
    setEditandoPerfil(false)
    alert('✅ Perfil actualizado exitosamente')
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al actualizar perfil: ' + error.message)
  }
}
const agregarDiseno = async (e) => {
  e.preventDefault()
  try {
    const { error } = await supabase
      .from('portafolio_designs')
      .insert([nuevoDiseno])

    if (error) throw error

    setNuevoDiseno({
      titulo: '',
      descripcion: '',
      categoria: '',
      año_diseno: new Date().getFullYear(),
      cliente_tipo: '',
      mostrar_publico: true,
      orden_display: 0,
      tags: []
    })
    
    fetchDisenosPortafolio()
    setMostrarModalDiseno(false)
    alert('✅ Diseño agregado exitosamente')
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al agregar diseño: ' + error.message)
  }
}
const editarDiseno = async (e) => {
  e.preventDefault()
  try {
    const { error } = await supabase
      .from('portafolio_designs')
      .update(nuevoDiseno)
      .eq('id', disenoEditando.id)

    if (error) throw error

    fetchDisenosPortafolio()
    setMostrarModalDiseno(false)
    setModoEdicion(false)
    setDisenoEditando(null)
    alert('✅ Diseño actualizado exitosamente')
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al actualizar diseño: ' + error.message)
  }
}

const eliminarDiseno = async (disenoId) => {
  if (!confirm('¿Estás segura de eliminar este diseño? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    const { error } = await supabase
      .from('portafolio_designs')
      .delete()
      .eq('id', disenoId)

    if (error) throw error

    fetchDisenosPortafolio()
    alert('✅ Diseño eliminado exitosamente')
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al eliminar diseño: ' + error.message)
  }
}

const abrirEdicion = (diseno) => {
  setDisenoEditando(diseno)
  setNuevoDiseno({
    titulo: diseno.titulo,
    descripcion: diseno.descripcion || '',
    categoria: diseno.categoria,
    año_diseno: diseno.año_diseno,
    cliente_tipo: diseno.cliente_tipo || '',
    mostrar_publico: diseno.mostrar_publico,
    orden_display: diseno.orden_display || 0,
    tags: diseno.tags || []
  })
  setModoEdicion(true)
  setMostrarModalDiseno(true)
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
// Estado para perfil personal
const [perfilPersonal, setPerfilPersonal] = useState({
  foto_perfil: '',
  titulo_profesional: 'Arquitecta & Diseñadora',
  descripcion_personal: '',
  años_experiencia: 5,
  proyectos_completados: 25,
  especializaciones: []
})
const [editandoPerfil, setEditandoPerfil] = useState(false)

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
                { id: 'perfil', label: '👤 Mi Perfil', icon: '👤' },
                { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                { id: 'clientes', label: `👥 Clientes (${clientes.length})`, icon: '👥' },
                { id: 'proyectos', label: `📐 Proyectos (${proyectos.length})`, icon: '📐' },
                { id: 'portafolio', label: `🎨 Portafolio (${disenosPortafolio.length})`, icon: '🎨' },
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
                      {/* Portafolio Tab */}
                        {activeTab === 'portafolio' && (
                          <div className="space-y-8">
                            {/* Header del Portafolio */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                              <div className="flex justify-between items-center mb-6">
                                <div>
                                  <h3 className="text-2xl font-bold text-primary-900 flex items-center">
                                    <span className="mr-3">🎨</span>
                                    Gestión de Portafolio Público
                                  </h3>
                                  <p className="text-accent-700 mt-2">
                                    Administra los diseños que se muestran en tu portafolio público (independiente de proyectos de clientes)
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                                  <div className="text-2xl font-bold">{disenosPortafolio.length}</div>
                                  <div className="text-sm">Diseños Totales</div>
                                </div>
                              </div>
                              
                              {/* Stats rápidos */}
                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                  <div className="text-blue-800 font-semibold">🏠 Arquitectura</div>
                                  <div className="text-blue-600">{disenosPortafolio.filter(d => d.categoria === 'arquitectura').length} diseños</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <div className="text-green-800 font-semibold">🪑 Interiores</div>
                                  <div className="text-green-600">{disenosPortafolio.filter(d => d.categoria === 'interiores').length} diseños</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                  <div className="text-orange-800 font-semibold">🛋️ Muebles</div>
                                  <div className="text-orange-600">{disenosPortafolio.filter(d => d.categoria === 'muebles').length} diseños</div>
                                </div>
                              </div>
                            </div>

                            {/* Mensaje si no hay diseños */}
                            {disenosPortafolio.length === 0 ? (
                              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">🎨</div>
                                <h3 className="text-2xl font-bold text-primary-900 mb-4">¡Comienza tu Portafolio!</h3>
                                <p className="text-accent-700 mb-6 max-w-md mx-auto">
                                  Agrega tus primeros diseños arquitectónicos, de interiores o muebles para mostrar tu trabajo al mundo.
                                </p>
                                <button 
                                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
                                  onClick={() => setMostrarModalDiseno(true)}
                                >
                                  ✨ Agregar Primer Diseño
                                </button>
                              </div>
                            ) : (
                              /* Lista de diseños existentes */
                              <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                  <h4 className="text-xl font-bold text-primary-900">Tus Diseños</h4>
                                  <button 
                                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
                                    onClick={() => setMostrarModalDiseno(true)}
                                  >
                                    ➕ Agregar Diseño
                                  </button>
                                </div>
                                
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {disenosPortafolio.map((diseno) => (
                                    <div key={diseno.id} className="border border-accent-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                      {/* Imagen del diseño */}
                                        <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-200 flex items-center justify-center overflow-hidden">
                                          {diseno.imagen_principal ? (
                                            <img 
                                              src={diseno.imagen_principal}
                                              alt={diseno.titulo}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="text-center">
                                              <span className="text-4xl">
                                                {diseno.categoria === 'arquitectura' && '🏠'}
                                                {diseno.categoria === 'interiores' && '🪑'}
                                                {diseno.categoria === 'muebles' && '🛋️'}
                                              </span>
                                              <p className="text-accent-700 font-medium mt-2 capitalize">{diseno.categoria}</p>
                                              <p className="text-accent-500 text-xs mt-1">Sin imagen</p>
                                            </div>
                                          )}
                                        </div>
                                      
                                      {/* Contenido */}
                                      <div className="p-4">
                                        <h5 className="font-semibold text-primary-900 mb-2">{diseno.titulo}</h5>
                                        <p className="text-accent-600 text-sm mb-3 line-clamp-2">{diseno.descripcion}</p>
                                        
                                        <div className="flex justify-between items-center">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            diseno.mostrar_publico 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {diseno.mostrar_publico ? '👁️ Público' : '🔒 Oculto'}
                                          </span>
                                          
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => abrirEdicion(diseno)}
                                              className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                              ✏️ Editar
                                            </button>
                                            <button 
                                              onClick={() => eliminarDiseno(diseno.id)}
                                              className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                              🗑️ Eliminarx
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
        {/* Perfil Tab */}
{activeTab === 'perfil' && (
  <div className="space-y-8">
    {/* Header del Perfil */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-primary-900 flex items-center">
            <span className="mr-3">👤</span>
            Mi Perfil Profesional
          </h3>
          <p className="text-accent-700 mt-2">
            Administra tu información personal que aparece en el sitio web
          </p>
        </div>
        <button
          onClick={() => setEditandoPerfil(!editandoPerfil)}
          className={`px-4 py-2 rounded-lg transition-all ${
            editandoPerfil 
              ? 'bg-gray-500 hover:bg-gray-600 text-white' 
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {editandoPerfil ? '❌ Cancelar' : '✏️ Editar Perfil'}
        </button>
      </div>
    </div>

    {/* Vista/Edición del Perfil */}
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Foto de Perfil */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-xl font-bold text-primary-900 mb-6">📸 Foto de Perfil</h4>
        
        <div className="text-center">
          <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-accent-200 flex items-center justify-center">
            {perfilPersonal.foto_perfil ? (
              <img 
                src={perfilPersonal.foto_perfil}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <span className="text-6xl">👤</span>
                <p className="text-accent-700 font-medium mt-2">Sin foto</p>
              </div>
            )}
          </div>
          
          {editandoPerfil && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={subirFotoPerfil}
                className="hidden"
                id="foto-perfil-upload"
              />
              <label
                htmlFor="foto-perfil-upload"
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-all inline-block"
              >
                📁 Cambiar Foto
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Información del Perfil */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-xl font-bold text-primary-900 mb-6">📝 Información Personal</h4>
        
        {editandoPerfil ? (
          <form onSubmit={guardarPerfil} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Título Profesional
              </label>
              <input
                type="text"
                value={perfilPersonal.titulo_profesional}
                onChange={(e) => setPerfilPersonal({...perfilPersonal, titulo_profesional: e.target.value})}
                className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Descripción Personal
              </label>
              <textarea
                value={perfilPersonal.descripcion_personal}
                onChange={(e) => setPerfilPersonal({...perfilPersonal, descripcion_personal: e.target.value})}
                rows="6"
                className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Cuéntanos sobre ti, tu experiencia y especialidades..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  Años de Experiencia
                </label>
                <input
                  type="number"
                  value={perfilPersonal.años_experiencia}
                  onChange={(e) => setPerfilPersonal({...perfilPersonal, años_experiencia: parseInt(e.target.value)})}
                  className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  Proyectos Completados
                </label>
                <input
                  type="number"
                  value={perfilPersonal.proyectos_completados}
                  onChange={(e) => setPerfilPersonal({...perfilPersonal, proyectos_completados: parseInt(e.target.value)})}
                  className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setEditandoPerfil(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-lg transition-all"
              >
                💾 Guardar Cambios
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-accent-600">Título</h5>
              <p className="text-lg text-primary-900">{perfilPersonal.titulo_profesional}</p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-accent-600">Descripción</h5>
              <p className="text-primary-700 leading-relaxed">
                {perfilPersonal.descripcion_personal || 'Sin descripción'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-800 font-semibold text-lg">{perfilPersonal.años_experiencia}</div>
                <div className="text-blue-600 text-sm">Años Experiencia</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-800 font-semibold text-lg">{perfilPersonal.proyectos_completados}</div>
                <div className="text-green-600 text-sm">Proyectos</div>
              </div>
            </div>
          </div>
        )}
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
      {/* Modal de Agregar Diseño */}
        {mostrarModalDiseno && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">🎨 {modoEdicion ? 'Editar' : 'Agregar'} Diseño</h3>
                    <p className="text-purple-100 mt-1">
                      {modoEdicion ? 'Actualizar diseño existente' : 'Nuevo diseño arquitectónico, interior o mueble'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMostrarModalDiseno(false)
                      setModoEdicion(false)
                      setDisenoEditando(null)
                      setNuevoDiseno({
                        titulo: '',
                        descripcion: '',
                        categoria: '',
                        año_diseno: new Date().getFullYear(),
                        cliente_tipo: '',
                        mostrar_publico: true,
                        orden_display: 0,
                        tags: []
                      })
                    }}
                    className="text-white hover:text-red-200 text-2xl transition-colors"
                  >
                    ✖️
                  </button>
                </div>
              </div>
      
      {/* Contenido del Modal */}
      <div className="p-6">
        {/* Formulario */}
        <form onSubmit={modoEdicion ? editarDiseno : agregarDiseno} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                🏷️ Título del Diseño *
              </label>
              <input
                type="text"
                value={nuevoDiseno.titulo}
                onChange={(e) => setNuevoDiseno({...nuevoDiseno, titulo: e.target.value})}
                className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Casa Moderna Minimalista"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                📂 Categoría *
              </label>
              <select
                value={nuevoDiseno.categoria}
                onChange={(e) => setNuevoDiseno({...nuevoDiseno, categoria: e.target.value})}
                className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="arquitectura">🏠 Arquitectura</option>
                <option value="interiores">🪑 Interiores</option>
                <option value="muebles">🛋️ Muebles</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              📝 Descripción
            </label>
            <textarea
              value={nuevoDiseno.descripcion}
              onChange={(e) => setNuevoDiseno({...nuevoDiseno, descripcion: e.target.value})}
              rows="3"
              className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Describe las características principales del diseño..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                📅 Año de Diseño
              </label>
              <input
                type="number"
                value={nuevoDiseno.año_diseno}
                onChange={(e) => setNuevoDiseno({...nuevoDiseno, año_diseno: parseInt(e.target.value)})}
                className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="2020"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                🏢 Tipo de Cliente
              </label>
              <select
                value={nuevoDiseno.cliente_tipo}
                onChange={(e) => setNuevoDiseno({...nuevoDiseno, cliente_tipo: e.target.value})}
                className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar tipo</option>
                <option value="residencial">🏠 Residencial</option>
                <option value="comercial">🏢 Comercial</option>
                <option value="conceptual">💡 Conceptual</option>
              </select>
            </div>
          </div>

          <label className="flex items-center p-3 border border-accent-300 rounded-lg hover:bg-accent-50 transition-all cursor-pointer">
            <input
              type="checkbox"
              checked={nuevoDiseno.mostrar_publico}
              onChange={(e) => setNuevoDiseno({...nuevoDiseno, mostrar_publico: e.target.checked})}
              className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-accent-700">👁️ Mostrar en portafolio público</span>
          </label>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setMostrarModalDiseno(false)
                setModoEdicion(false)
                setDisenoEditando(null)
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-lg transition-all"
            >
              {modoEdicion ? '💾 Actualizar Diseño' : '✨ Agregar Diseño'}
            </button>
          </div>
        </form>

        {/* Sección de imagen (solo en modo edición) */}
        {modoEdicion && disenoEditando && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="text-lg font-semibold text-primary-900 mb-4">🖼️ Imagen del Diseño</h4>
            <SubidaImagenesDiseno 
              disenoId={disenoEditando.id}
              onImagenSubida={(url) => {
                fetchDisenosPortafolio()
              }}
            />
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  )
}

export default AdminPanel