"use client"

import Image from "next/image"

interface MinimalHeroImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fallbackSrc?: string
}

export function MinimalHeroImage({
  src,
  alt,
  className = "",
  priority = true,
  fallbackSrc = "/back_restaurant.png"
}: MinimalHeroImageProps) {
  const imageSrc = src || fallbackSrc

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        sizes="100vw"
        quality={90}
      />
    </div>
  )
}

// Componente específico para imágenes de hero de restaurantes
export function MinimalRestaurantHeroImage({ 
  src, 
  alt, 
  className = "" 
}: { 
  src: string
  alt: string
  className?: string 
}) {
  return (
    <MinimalHeroImage
      src={src}
      alt={alt}
      className={`min-h-screen ${className}`}
      priority={true}
      fallbackSrc="/back_restaurant.png"
    />
  )
}

// Componente para logos de restaurantes mínimos
export function MinimalRestaurantLogo({ 
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
  if (!src) {
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
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-2xl border-4 border-white/20 shadow-2xl"
        priority={true}
        quality={95}
      />
      
      {/* Overlay sutil para mejorar la apariencia */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </div>
  )
}
