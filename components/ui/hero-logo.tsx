"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface HeroLogoProps {
  src: string
  alt: string
  size?: number
  className?: string
}

export function HeroLogo({ 
  src, 
  alt, 
  size = 120,
  className = "" 
}: HeroLogoProps) {
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
        // Limpiar parámetros existentes si los hay
        let cleanUrl = url.replace(/\?.*$/, '')
        
        // Agregar parámetros de optimización para logos
        const separator = cleanUrl.includes('?') ? '&' : '?'
        return `${cleanUrl}${separator}width=${size}&height=${size}&quality=95&format=webp&fit=cover&gravity=center`
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
        className={`bg-white/20 backdrop-blur-sm rounded-2xl border-4 border-white/30 shadow-2xl flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-white text-2xl">🍽️</div>
      </div>
    )
  }

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {isLoading && (
        <Skeleton 
          className="rounded-2xl border-4 border-white/20 shadow-2xl absolute inset-0" 
        />
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-2xl border-4 border-white/20 shadow-2xl transition-all duration-500 object-cover animate-logo-glow ${
          isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
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
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
      
      {/* Borde brillante sutil */}
      <div className="absolute inset-0 rounded-2xl border border-white/30 pointer-events-none" />
    </div>
  )
}
