import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import emailjs from '@emailjs/browser'

function LandingPage() {
  const [proyectosPortafolio, setProyectosPortafolio] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user } = useAuth()
  const [enviando, setEnviando] = useState(false)
  const [mensajeEnviado, setMensajeEnviado] = useState(false)

  useEffect(() => {
    fetchProyectosPortafolio()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const fetchProyectosPortafolio = async () => {
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
      setProyectosPortafolio(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const enviarEmail = async (e) => {
    e.preventDefault()
    setEnviando(true)

    try {
      await emailjs.sendForm(
        'service_j5982ql',     // Tu Service ID
        'template_eyf00cs',    // Tu Template ID  
        e.target,
        'bxSpt7X6VH6baYFfr'    // Tu Public Key
      )
      
      setMensajeEnviado(true)
      e.target.reset()
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setMensajeEnviado(false)
      }, 5000)
      
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al enviar el mensaje. Por favor intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  const heroSlides = [
    {
      title: "ARQUITECTURA CONTEMPORÁNEA",
      subtitle: "Diseños únicos que transforman espacios",
      bg: "from-amber-900 via-amber-800 to-orange-900"
    },
    {
      title: "CONSTRUCCIÓN MODULAR",
      subtitle: "Eficiencia y sustentabilidad en cada proyecto",
      bg: "from-amber-800 via-orange-800 to-red-900"
    },
    {
      title: "DISEÑO PERSONALIZADO",
      subtitle: "Tu visión convertida en realidad arquitectónica",
      bg: "from-orange-900 via-amber-900 to-yellow-900"
    }
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation Premium */}
      <nav className="fixed w-full z-50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 via-amber-800/95 to-orange-900/95 backdrop-blur-md"></div>
        <div className="relative container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-wider">ARQZOY</div>
                <div className="text-xs text-amber-200 tracking-widest">ARQUITECTURA & DISEÑO</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-amber-100 hover:text-white transition-colors font-medium tracking-wide">INICIO</a>
              <a href="#servicios" className="text-amber-100 hover:text-white transition-colors font-medium tracking-wide">SERVICIOS</a>
              <a href="#portafolio" className="text-amber-100 hover:text-white transition-colors font-medium tracking-wide">PORTAFOLIO</a>
              <a href="#contacto" className="text-amber-100 hover:text-white transition-colors font-medium tracking-wide">CONTACTO</a>
              {user ? (
                <a href="/admin" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg font-medium tracking-wide">
                  ADMIN
                </a>
              ) : (
                <a href="/login" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg font-medium tracking-wide">
                  LOGIN
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Premium */}
      <section id="inicio" className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].bg} transition-all duration-1000`}></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        
        {/* Animated geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 border border-amber-400/30 rotate-45 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-orange-400/20 rotate-12 animate-bounce"></div>
          <div className="absolute bottom-32 left-20 w-40 h-40 border border-amber-300/20 -rotate-12"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-4xl">
            <div className="mb-6">
              <div className="inline-block px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-400/30 mb-4">
                <span className="text-amber-200 text-sm tracking-widest font-medium">ESTUDIO DE ARQUITECTURA</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="block">{heroSlides[currentSlide].title.split(' ')[0]}</span>
              <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {heroSlides[currentSlide].title.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-amber-100 mb-12 max-w-3xl leading-relaxed">
              {heroSlides[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href="#portafolio" 
                className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-center"
              >
                <span className="relative z-10">EXPLORAR PROYECTOS</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </a>
              <a
                href="#contacto"
                className="group border-2 border-amber-400 text-amber-100 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 relative overflow-hidden text-center"
              >
                <span className="relative z-10">SOLICITAR CONSULTA</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </a>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-amber-400 w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-amber-900 to-orange-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-300 mb-2">25+</div>
              <div className="text-amber-100 uppercase tracking-widest text-sm">Proyectos Completados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-300 mb-2">8</div>
              <div className="text-amber-100 uppercase tracking-widest text-sm">Años de Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-300 mb-2">100%</div>
              <div className="text-amber-100 uppercase tracking-widest text-sm">Clientes Satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-300 mb-2">15k+</div>
              <div className="text-amber-100 uppercase tracking-widest text-sm">M² Construidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Premium */}
      <section id="servicios" className="py-32 bg-gradient-to-b from-stone-50 to-amber-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-amber-500/10 rounded-full border border-amber-400/20 mb-6">
              <span className="text-amber-800 text-sm tracking-widest font-medium">NUESTROS SERVICIOS</span>
            </div>
            <h2 className="text-5xl font-bold text-amber-900 mb-6">ESPECIALIDADES</h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto">
              Ofrecemos soluciones arquitectónicas integrales con tecnología de vanguardia y diseño sustentable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">🏠</span>
                </div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Viviendas Modulares</h3>
                <p className="text-amber-700 mb-6 leading-relaxed">
                  Casas prefabricadas con diseño personalizado, construcción rápida y tecnología sustentable para el hogar del futuro.
                </p>
                <div className="border-t border-amber-200 pt-4">
                  <span className="text-amber-600 font-semibold text-sm tracking-wide">CONSTRUCCIÓN EFICIENTE</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">🏢</span>
                </div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Espacios Comerciales</h3>
                <p className="text-amber-700 mb-6 leading-relaxed">
                  Oficinas, locales y espacios comerciales que combinan funcionalidad, estética y tecnología de última generación.
                </p>
                <div className="border-t border-amber-200 pt-4">
                  <span className="text-amber-600 font-semibold text-sm tracking-wide">DISEÑO CORPORATIVO</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">🏘️</span>
                </div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Desarrollos Urbanos</h3>
                <p className="text-amber-700 mb-6 leading-relaxed">
                  Complejos habitacionales y desarrollos urbanos integrales con elementos prefabricados y planificación sustentable.
                </p>
                <div className="border-t border-amber-200 pt-4">
                  <span className="text-amber-600 font-semibold text-sm tracking-wide">PLANIFICACIÓN URBANA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Premium */}
      <section id="portafolio" className="py-32 bg-gradient-to-b from-amber-900 to-orange-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-amber-400/20 backdrop-blur-sm rounded-full border border-amber-400/30 mb-6">
              <span className="text-amber-200 text-sm tracking-widest font-medium">NUESTRO TRABAJO</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">PROYECTOS DESTACADOS</h2>
            <p className="text-xl text-amber-200 max-w-3xl mx-auto">
              Cada proyecto refleja nuestro compromiso con la excelencia, la innovación y la sustentabilidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proyectosPortafolio.map((proyecto, index) => (
              <div key={proyecto.id} className="group relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-2xl border border-amber-400/20 hover:border-amber-400/40 transition-all duration-500 transform hover:-translate-y-2">
                <div className="aspect-video bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-orange-600/30"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl text-white mb-2">🏗️</div>
                    <span className="text-amber-200 text-sm tracking-widest">MODELO 3D INTERACTIVO</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-amber-500/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-amber-200 text-xs tracking-widest">#{String(index + 1).padStart(2, '0')}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {proyecto.titulo}
                  </h3>
                  <p className="text-amber-200 mb-4 leading-relaxed text-sm">
                    {proyecto.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {proyecto.clientes?.tipo_proyecto}
                    </span>
                    <a 
                      href={`/cliente/${proyecto.url_privada}`}
                      className="text-amber-400 hover:text-white font-semibold text-sm tracking-wide group-hover:translate-x-1 transition-all inline-block"
                    >
                      VER PROYECTO →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <a
              href="/portafolio"
              className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-block"
            >
              <span className="relative z-10">VER PORTAFOLIO COMPLETO</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Premium - FORMULARIO CORREGIDO */}
      <section id="contacto" className="py-32 bg-gradient-to-b from-stone-50 to-amber-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-amber-500/10 rounded-full border border-amber-400/20 mb-6">
                <span className="text-amber-800 text-sm tracking-widest font-medium">CONTÁCTANOS</span>
              </div>
              
              <h2 className="text-5xl font-bold text-amber-900 mb-6 leading-tight">
                ¿Listo para tu próximo
                <span className="block text-orange-600">proyecto?</span>
              </h2>
              
              <p className="text-xl text-amber-700 mb-12 leading-relaxed">
                Transformemos juntos tu visión en una realidad arquitectónica excepcional. 
                Contactanos para una consulta personalizada y gratuita.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📧</span>
                  </div>
                  <div>
                    <div className="text-amber-900 font-semibold">Email</div>
                    <div className="text-amber-700">info@arqzoy.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📱</span>
                  </div>
                  <div>
                    <div className="text-amber-900 font-semibold">Teléfono</div>
                    <div className="text-amber-700">+595 973 645 330</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📍</span>
                  </div>
                  <div>
                    <div className="text-amber-900 font-semibold">Ubicación</div>
                    <div className="text-amber-700">Asunción, Paraguay</div>
                  </div>
                </div>
              </div>
            </div>

            {/* FORMULARIO COMPLETAMENTE CORREGIDO */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-amber-900 mb-6">Solicitar Cotización</h3>
              
              {mensajeEnviado && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ ¡Mensaje enviado exitosamente!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Te contactaremos desde info@arqzoy.com dentro de 24 horas.
                  </p>
                </div>
              )}
              
              <form onSubmit={enviarEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nombre Completo *
                  </label>
                  <input 
                    type="text" 
                    name="nombre"
                    placeholder="Ej: Juan Pérez"
                    className="w-full p-4 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-white text-amber-900 placeholder-amber-500"
                    required
                    disabled={enviando}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Correo Electrónico *
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="tu@email.com"
                    className="w-full p-4 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-white text-amber-900 placeholder-amber-500"
                    required
                    disabled={enviando}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Tipo de Proyecto *
                  </label>
                  <select 
                    name="tipo_proyecto"
                    className="w-full p-4 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-white text-amber-900"
                    required
                    disabled={enviando}
                  >
                    <option value="">Selecciona el tipo de proyecto</option>
                    <option value="Vivienda Residencial">🏠 Vivienda Residencial</option>
                    <option value="Espacio Comercial">🏢 Espacio Comercial</option>
                    <option value="Complejo Habitacional">🏘️ Complejo Habitacional</option>
                    <option value="Otro">⚡ Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Descripción del Proyecto *
                  </label>
                  <textarea 
                    name="descripcion"
                    placeholder="Cuéntanos sobre tu proyecto: ubicación, tamaño, características especiales, presupuesto estimado, etc."
                    rows="4"
                    className="w-full p-4 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-white text-amber-900 placeholder-amber-500 resize-none"
                    required
                    disabled={enviando}
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {enviando ? '📤 Enviando...' : '✨ Enviar Solicitud'}
                </button>
              </form>
              
              <p className="text-amber-600 text-sm mt-4 text-center">
                📧 Te responderemos desde <strong>info@arqzoy.com</strong> en menos de 24 horas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Premium */}
      <footer className="bg-gradient-to-r from-amber-900 to-orange-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-wider">ARQZOY</div>
                  <div className="text-xs text-amber-200 tracking-widest">ARQUITECTURA & DISEÑO</div>
                </div>
              </div>
              <p className="text-amber-200 leading-relaxed max-w-md">
                Transformamos ideas en espacios excepcionales a través de diseño innovador, 
                tecnología de vanguardia y construcción sustentable.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-amber-300">Servicios</h4>
              <ul className="space-y-2 text-amber-200">
                <li>Viviendas Modulares</li>
                <li>Espacios Comerciales</li>
                <li>Desarrollos Urbanos</li>
                <li>Consultoría Arquitectónica</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-amber-300">Contacto</h4>
              <ul className="space-y-2 text-amber-200">
                <li>info@arqzoy.com</li>
                <li>+595 973 645 330</li>
                <li>Asunción, Paraguay</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-amber-800 pt-8 text-center">
            <p className="text-amber-200">© 2025 ARQ.ZOY. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage