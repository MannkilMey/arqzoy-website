import { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, useProgress, Html } from '@react-three/drei'

// Loader con progreso real
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-amber-800 font-medium">Cargando modelo 3D...</p>
        <div className="w-48 bg-amber-200 rounded-full h-2 mt-2">
          <div 
            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-amber-600 text-sm mt-1">{Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

// Modelo optimizado
function Modelo3D({ url }) {
  const { scene } = useGLTF(url)
  
  // Optimizar el modelo al cargarse
  useState(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Optimizar materiales
        if (child.material) {
          child.material.needsUpdate = false
        }
        // Optimizar geometría
        if (child.geometry) {
          child.geometry.computeBoundingBox()
          child.geometry.computeBoundingSphere()
        }
      }
    })
  }, [scene])
  
  return (
    <Center>
      <primitive object={scene} scale={1} />
    </Center>
  )
}

function Visualizador3D({ 
  archivoUrl, 
  titulo = "Modelo 3D", 
  altura = "500px",
  mostrarControles = true
}) {
  return (
    <div className="relative w-full bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl overflow-hidden border border-amber-200">
      {/* Header del Visualizador */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎮</span>
            <div>
              <h3 className="font-bold text-lg">{titulo}</h3>
              <p className="text-amber-100 text-sm">Modelo 3D Interactivo</p>
            </div>
          </div>
          {mostrarControles && (
            <div className="text-amber-100 text-xs">
              <div>🖱️ Click y arrastra para rotar</div>
              <div>⚲ Scroll para zoom</div>
            </div>
          )}
        </div>
      </div>

      {/* Visualizador Canvas Optimizado */}
      <div style={{ height: altura }} className="relative">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 75 }}
          style={{ background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)' }}
          gl={{ 
            antialias: false, // Desactivar antialiasing para mejor performance
            alpha: false,
            powerPreference: "high-performance"
          }}
          performance={{ min: 0.5 }}
        >
          {/* Iluminación Optimizada */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
          />

          {/* Controles Optimizados */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={0.5}
            maxDistance={50}
            wheelSpeed={3}
            rotateSpeed={1}
            zoomSpeed={3}
          />

          {/* Modelo 3D con Loader Mejorado */}
          <Suspense fallback={<Loader />}>
            <Modelo3D url={archivoUrl} />
          </Suspense>
        </Canvas>
      </div>

      {/* Footer con información */}
      <div className="bg-amber-100 p-3 text-center">
        <p className="text-amber-800 text-sm">
          <span className="font-medium">💡 Tip:</span> Usa el mouse para explorar el modelo en 360°
        </p>
      </div>
    </div>
  )
}

// Precargar el modelo para mejor performance
useGLTF.preload = (url) => useGLTF(url)

export default Visualizador3D