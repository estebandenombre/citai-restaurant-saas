"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ImageDebugProps {
  src: string
  alt: string
  className?: string
}

export function ImageDebug({ src, alt, className = "" }: ImageDebugProps) {
  const [imageInfo, setImageInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const analyzeImage = async () => {
      if (!src) return

      try {
        setLoading(true)
        setError(null)

        // Crear una imagen temporal para analizar
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        
        img.onload = () => {
          setImageInfo({
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
            url: src,
            isSupabase: src.includes('supabase.co'),
            hasOptimization: src.includes('width=') && src.includes('quality='),
            optimizationParams: {
              width: src.match(/width=([^&]+)/)?.[1] || 'Not found',
              height: src.match(/height=([^&]+)/)?.[1] || 'Not found',
              quality: src.match(/quality=([^&]+)/)?.[1] || 'Not found',
              format: src.match(/format=([^&]+)/)?.[1] || 'Not found',
              fit: src.match(/fit=([^&]+)/)?.[1] || 'Not found',
              gravity: src.match(/gravity=([^&]+)/)?.[1] || 'Not found'
            }
          })
          setLoading(false)
        }

        img.onerror = () => {
          setError('Failed to load image')
          setLoading(false)
        }

        img.src = src
      } catch (err) {
        setError('Error analyzing image')
        setLoading(false)
      }
    }

    analyzeImage()
  }, [src])

  if (loading) {
    return (
      <div className={`border-2 border-dashed border-gray-300 p-4 ${className}`}>
        <div className="text-sm text-gray-500">Analyzing image...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`border-2 border-dashed border-red-300 p-4 ${className}`}>
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className={`border-2 border-dashed border-blue-300 p-4 ${className}`}>
      <div className="text-sm font-semibold mb-2">Image Debug Info:</div>
      
      {imageInfo && (
        <div className="space-y-2 text-xs">
          <div><strong>URL:</strong> {imageInfo.url}</div>
          <div><strong>Natural Size:</strong> {imageInfo.naturalWidth} × {imageInfo.naturalHeight}</div>
          <div><strong>Aspect Ratio:</strong> {imageInfo.aspectRatio}</div>
          <div><strong>Is Supabase:</strong> {imageInfo.isSupabase ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Has Optimization:</strong> {imageInfo.hasOptimization ? '✅ Yes' : '❌ No'}</div>
          
          {imageInfo.hasOptimization && (
            <div className="mt-2">
              <div className="font-semibold">Optimization Parameters:</div>
              <div className="ml-2 space-y-1">
                <div>Width: {imageInfo.optimizationParams.width}</div>
                <div>Height: {imageInfo.optimizationParams.height}</div>
                <div>Quality: {imageInfo.optimizationParams.quality}</div>
                <div>Format: {imageInfo.optimizationParams.format}</div>
                <div>Fit: {imageInfo.optimizationParams.fit}</div>
                <div>Gravity: {imageInfo.optimizationParams.gravity}</div>
              </div>
            </div>
          )}
          
          {!imageInfo.hasOptimization && imageInfo.isSupabase && (
            <div className="text-orange-600 font-semibold">
              ⚠️ This Supabase image needs optimization!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente para mostrar la imagen original vs optimizada
export function ImageComparison({ src, alt, className = "" }: ImageDebugProps) {
  const [showOptimized, setShowOptimized] = useState(true)

  // Función para optimizar URL
  const optimizeUrl = (url: string): string => {
    if (!url || !url.includes('supabase.co')) return url
    
    // Limpiar parámetros existentes
    let cleanUrl = url.replace(/\?.*$/, '')
    
    // Agregar parámetros de optimización
    return `${cleanUrl}?width=1920&height=1080&quality=95&format=webp&fit=cover&gravity=center`
  }

  const originalUrl = src
  const optimizedUrl = optimizeUrl(src)

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setShowOptimized(false)}
          className={`px-3 py-1 rounded text-sm ${
            !showOptimized ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Original
        </button>
        <button
          onClick={() => setShowOptimized(true)}
          className={`px-3 py-1 rounded text-sm ${
            showOptimized ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Optimized
        </button>
      </div>

      <div className="relative">
        <Image
          src={showOptimized ? optimizedUrl : originalUrl}
          alt={`${alt} (${showOptimized ? 'Optimized' : 'Original'})`}
          width={800}
          height={450}
          className="w-full h-auto rounded-lg"
        />
        
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {showOptimized ? 'Optimized' : 'Original'}
        </div>
      </div>

      <ImageDebug src={showOptimized ? optimizedUrl : originalUrl} alt={alt} />
    </div>
  )
}
