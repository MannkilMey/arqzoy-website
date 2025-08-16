import { useState } from 'react'
import { supabase } from '../lib/supabase'

function SubidaImagenesDiseno({ disenoId, onImagenSubida }) {
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState(0)

  const subirImagen = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    setSubiendo(true)
    setProgreso(0)

    try {
      // Generar nombre único
      const timestamp = Date.now()
      const extension = archivo.name.split('.').pop()
      const nombreArchivo = `portafolio/${disenoId}/${timestamp}.${extension}`

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('arqzoy-archivos')
        .upload(nombreArchivo, archivo)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('arqzoy-archivos')
        .getPublicUrl(nombreArchivo)

      // Actualizar diseño con imagen principal
      const { error: updateError } = await supabase
        .from('portafolio_designs')
        .update({ imagen_principal: publicUrl })
        .eq('id', disenoId)

      if (updateError) throw updateError

      alert('✅ Imagen subida exitosamente!')
      onImagenSubida && onImagenSubida(publicUrl)
      
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al subir imagen: ' + error.message)
    } finally {
      setSubiendo(false)
      setProgreso(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">🖼️</div>
        <h4 className="text-lg font-semibold text-purple-900 mb-2">Imagen Principal</h4>
        <p className="text-purple-700 mb-4">Selecciona la imagen representativa del diseño</p>
        
        <input
          type="file"
          accept="image/*"
          onChange={subirImagen}
          disabled={subiendo}
          className="hidden"
          id="imagen-upload"
        />
        
        <label
          htmlFor="imagen-upload"
          className={`inline-block px-6 py-3 rounded-lg cursor-pointer transition-all ${
            subiendo 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          {subiendo ? '📤 Subiendo...' : '📁 Seleccionar Imagen'}
        </label>
        
        {subiendo && (
          <div className="mt-4">
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubidaImagenesDiseno