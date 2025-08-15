import { useState } from 'react'
import { supabase } from '../lib/supabase'

function SubidaArchivos({ proyectoId, onArchivoSubido }) {
  const [archivos, setArchivos] = useState([])
  const [tipoArchivo, setTipoArchivo] = useState('foto')
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState(0)

  const tiposArchivo = [
  { value: 'foto', label: '📸 Fotografía', formatos: '.jpg,.jpeg,.png,.webp' },
  { value: 'video', label: '🎬 Video', formatos: '.mp4,.mov,.avi,.webm' },
  { value: 'plano_2d', label: '📐 Plano 2D', formatos: '.dwg,.dxf,.pdf,.png,.jpg' },
  { value: 'documento', label: '📄 Documento', formatos: '.pdf,.doc,.docx,.txt' }
]

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setArchivos(files)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const subirArchivos = async () => {
    if (archivos.length === 0) {
      alert('Por favor selecciona al menos un archivo')
      return
    }

    setSubiendo(true)
    setProgreso(0)

    try {
      const archivoPromises = archivos.map(async (archivo, index) => {
        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const extension = archivo.name.split('.').pop()
        const nombreArchivo = `${proyectoId}/${tipoArchivo}/${timestamp}-${index}.${extension}`

        // Subir a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('arqzoy-archivos')
          .upload(nombreArchivo, archivo)

        if (uploadError) throw uploadError

        // Obtener URL pública del archivo
        const { data: { publicUrl } } = supabase.storage
          .from('arqzoy-archivos')
          .getPublicUrl(nombreArchivo)

        // Guardar referencia en la base de datos
        const { data: dbData, error: dbError } = await supabase
          .from('archivos')
          .insert([{
            proyecto_id: proyectoId,
            nombre: archivo.name,
            tipo: tipoArchivo,
            formato: extension,
            url_archivo: publicUrl,
            tamanio_mb: parseFloat((archivo.size / (1024 * 1024)).toFixed(2))
          }])
          .select()

        if (dbError) throw dbError

        // Actualizar progreso
        setProgreso(((index + 1) / archivos.length) * 100)

        return dbData[0]
      })

      const resultados = await Promise.all(archivoPromises)
      
      alert('✅ Archivos subidos exitosamente!')
      setArchivos([])
      onArchivoSubido && onArchivoSubido(resultados)

    } catch (error) {
      console.error('Error al subir archivos:', error)
      alert('❌ Error al subir archivos: ' + error.message)
    } finally {
      setSubiendo(false)
      setProgreso(0)
    }
  }

  const tipoSeleccionado = tiposArchivo.find(t => t.value === tipoArchivo)

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-accent-200">
      <h3 className="text-xl font-bold text-primary-900 mb-6 flex items-center">
        <span className="mr-3">📁</span>
        Subir Archivos
      </h3>

      {/* Selector de Tipo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-accent-700 mb-2">
          Tipo de Archivo
        </label>
        <select
          value={tipoArchivo}
          onChange={(e) => setTipoArchivo(e.target.value)}
          className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {tiposArchivo.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-accent-500 mt-1">
          Formatos soportados: {tipoSeleccionado?.formatos}
        </p>
      </div>

      {/* Selector de Archivos */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-accent-700 mb-2">
          Seleccionar Archivos
        </label>
        <input
          type="file"
          multiple
          accept={tipoSeleccionado?.formatos}
          onChange={handleFileSelect}
          className="w-full p-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={subiendo}
        />
      </div>

      {/* Vista Previa de Archivos */}
      {archivos.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-accent-700 mb-3">
            Archivos Seleccionados ({archivos.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {archivos.map((archivo, index) => (
              <div key={index} className="flex items-center justify-between bg-accent-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {tipoArchivo === 'modelo_3d' && '🎮'}
                    {tipoArchivo === 'plano_2d' && '📐'}
                    {tipoArchivo === 'foto' && '📸'}
                    {tipoArchivo === 'documento' && '📄'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-accent-900">{archivo.name}</div>
                    <div className="text-xs text-accent-600">{formatFileSize(archivo.size)}</div>
                  </div>
                </div>
                <button
                  onClick={() => setArchivos(archivos.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 text-sm"
                  disabled={subiendo}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Progreso */}
      {subiendo && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-accent-700 mb-2">
            <span>Subiendo archivos...</span>
            <span>{Math.round(progreso)}%</span>
          </div>
          <div className="w-full bg-accent-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Botón de Subida */}
      <button
        onClick={subirArchivos}
        disabled={archivos.length === 0 || subiendo}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {subiendo ? '📤 Subiendo...' : `📁 Subir ${archivos.length} Archivo${archivos.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  )
}

export default SubidaArchivos