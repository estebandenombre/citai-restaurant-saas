"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedHeroImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fallbackSrc?: string
  width?: number
  height?: number
  quality?: number
}

export function OptimizedHeroImage({
  src,
  alt,
  className = "",
  priority = true,
  fallbackSrc = "/back_restaurant.png",
  width = 1920,
  height = 1080,
  quality = 95
}: OptimizedHeroImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)

  // Función para optimizar URL de Supabase
  const optimizeSupabaseUrl = (url: string): string => {
    if (!url || url.startsWith('data:') || url.startsWith('/')) return url

    try {
      // Verificar si es una URL de Supabase
      if (url.includes('supabase.co') && url.includes('storage')) {
        // Limpiar parámetros existentes si los hay
        let cleanUrl = url.replace(/\?.*$/, '') // Remover parámetros existentes
        
        // Agregar parámetros de optimización para máxima calidad
        const separator = cleanUrl.includes('?') ? '&' : '?'
        return `${cleanUrl}${separator}width=${width}&height=${height}&quality=${quality}&format=webp&fit=cover&gravity=center`
      }
      return url
    } catch (error) {
      console.warn('Error optimizing Supabase URL:', error)
      return url
    }
  }

  const optimizedSrc = optimizeSupabaseUrl(currentSrc)

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
    }
    setIsLoading(false)
  }

  // Si no hay src o hay error, mostrar placeholder
  if (!currentSrc || hasError) {
    return (
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-center">
          <div className="text-2xl mb-2">🍽️</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        className={`transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } object-cover`}
        priority={priority}
        sizes="100vw"
        quality={quality}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
      />
    </div>
  )
}

// Componente específico para imágenes de hero de restaurantes
export function OptimizedRestaurantHeroImage({ 
  src, 
  alt, 
  className = "" 
}: { 
  src: string
  alt: string
  className?: string 
}) {
  return (
    <OptimizedHeroImage
      src={src}
      alt={alt}
      className={`min-h-screen ${className}`}
      priority={true}
      fallbackSrc="/back_restaurant.png"
      width={1920}
      height={1080}
      quality={95}
    />
  )
}

// Componente para logos de restaurantes optimizados
export function OptimizedRestaurantLogo({ 
  src, 
  alt, 
  className = "",
  size = 120
}: { 
  src: string
  alt: string
  className?: string
  size?: number
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Asegurar que src no sea undefined o null
  const safeSrc = src || ""

  // Función para optimizar URL de Supabase para logos
  const optimizeLogoUrl = (url: string): string => {
    if (!url || url.startsWith('data:') || url.startsWith('/')) return url

    try {
      // Verificar si es una URL de Supabase
      if (url.includes('supabase.co') && url.includes('storage')) {
        // Agregar parámetros de optimización para logos
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}width=${size}&height=${size}&quality=95&format=webp&fit=cover&gravity=center`
      }
      return url
    } catch (error) {
      console.warn('Error optimizing logo URL:', error)
      return url
    }
  }

  const optimizedSrc = optimizeLogoUrl(safeSrc)

  // Si no hay src o hay error, mostrar placeholder
  if (!safeSrc || hasError) {
    return (
      <div 
        className={`bg-gray-200 rounded-2xl border-4 border-white/20 shadow-2xl flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-gray-500 text-2xl">🍽️</div>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {isLoading && (
        <Skeleton 
          className="rounded-2xl border-4 border-white/20 shadow-2xl" 
          style={{ width: size, height: size }}
        />
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-2xl border-4 border-white/20 shadow-2xl transition-opacity duration-300 object-cover ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={true}
        quality={95}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
      
      {/* Overlay sutil para mejorar la apariencia */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </div>
  )
}
