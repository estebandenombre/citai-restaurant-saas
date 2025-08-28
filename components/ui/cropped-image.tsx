"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ImageCropData {
  x: number
  y: number
  scale: number
  rotation: number
}

interface CroppedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  cropData?: ImageCropData
}

export function CroppedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  priority = false,
  quality = 80,
  cropData
}: CroppedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">Image unavailable</div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
      
      {cropData ? (
        // Imagen con recorte aplicado usando img nativo
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            minWidth: '100%',
            minHeight: '100%',
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      ) : (
        // Imagen sin recorte usando Next.js Image
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          priority={priority}
          quality={quality}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}

// Componente específico para platos con recorte
export function CroppedDishImage({ 
  src, 
  alt, 
  className = "", 
  cropData 
}: { 
  src: string
  alt: string
  className?: string
  cropData?: ImageCropData
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: '100%', height: '192px' }}>
      {cropData ? (
        // Imagen con recorte aplicado
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        // Imagen sin recorte
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </div>
  )
}

// Componente para thumbnails con recorte
export function CroppedThumbnailImage({ 
  src, 
  alt, 
  className = "", 
  cropData 
}: { 
  src: string
  alt: string
  className?: string
  cropData?: ImageCropData
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: '64px', height: '64px' }}>
      {cropData ? (
        // Imagen con recorte aplicado
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        // Imagen sin recorte
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </div>
  )
}
