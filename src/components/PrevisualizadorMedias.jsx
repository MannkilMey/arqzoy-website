import { useState } from 'react'

function PrevisualizadorMedias({ archivos }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [mediaActual, setMediaActual] = useState(null)
  const [indiceActual, setIndiceActual] = useState(0)

  // Filtrar solo fotos y videos
  const medias = archivos.filter(archivo => 
    archivo.tipo === 'foto' || 
    ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'].includes(archivo.formato.toLowerCase())
  )

  const abrirModal = (media, indice) => {
    setMediaActual(media)
    setIndiceActual(indice)
    setModalAbierto(true)
  }

  const siguiente = () => {
    const nuevoIndice = (indiceActual + 1) % medias.length
    setIndiceActual(nuevoIndice)
    setMediaActual(medias[nuevoIndice])
  }

  const anterior = () => {
    const nuevoIndice = indiceActual === 0 ? medias.length - 1 : indiceActual - 1
    setIndiceActual(nuevoIndice)
    setMediaActual(medias[nuevoIndice])
  }

  if (medias.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-semibold text-amber-900 mb-2">No hay fotos aún</h3>
        <p className="text-amber-700">Las fotos y videos aparecerán aquí cuando estén listos</p>
      </div>
    )
  }

  return (
    <>
      {/* Galería de Miniaturas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {medias.map((media, indice) => (
          <div 
            key={media.id}
            className="relative aspect-square bg-amber-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
            onClick={() => abrirModal(media, indice)}
          >
            {/* Miniatura */}
            {media.formato.toLowerCase().includes('mp4') || media.formato.toLowerCase().includes('mov') ? (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">▶️</div>
                  <p className="text-xs font-medium">VIDEO</p>
                </div>
              </div>
            ) : (
              <img 
                src={media.url_archivo}
                alt={media.nombre}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            )}
            
            {/* Overlay con info */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
              <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium truncate">{media.nombre}</p>
                <p className="text-xs opacity-90">{media.formato.toUpperCase()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Vista Completa */}
      {modalAbierto && mediaActual && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          {/* Botón Cerrar */}
          <button
            onClick={() => setModalAbierto(false)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-amber-300 transition-colors z-10"
          >
            ✖️
          </button>

          {/* Navegación */}
          {medias.length > 1 && (
            <>
              <button
                onClick={anterior}
                className="absolute left-4 text-white text-4xl hover:text-amber-300 transition-colors z-10"
              >
                ◀️
              </button>
              <button
                onClick={siguiente}
                className="absolute right-4 text-white text-4xl hover:text-amber-300 transition-colors z-10"
              >
                ▶️
              </button>
            </>
          )}

          {/* Contenido del Modal */}
          <div className="max-w-6xl max-h-[90vh] w-full">
            {mediaActual.formato.toLowerCase().includes('mp4') || mediaActual.formato.toLowerCase().includes('mov') ? (
              <video 
                src={mediaActual.url_archivo}
                controls
                className="w-full h-auto max-h-[80vh] rounded-lg"
                autoPlay
              />
            ) : (
              <img 
                src={mediaActual.url_archivo}
                alt={mediaActual.nombre}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            )}
            
            {/* Info del Media */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{mediaActual.nombre}</h3>
              <p className="text-amber-300">{indiceActual + 1} de {medias.length} • {mediaActual.formato.toUpperCase()} • {mediaActual.tamanio_mb} MB</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PrevisualizadorMedias