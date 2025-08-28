"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface SimpleImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
}

export function SimpleImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  priority = false,
  quality = 80
}: SimpleImageProps) {
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
    <div className={`relative ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
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
    </div>
  )
}

// Predefined image components for different use cases
export function DishImageSimple({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <SimpleImage
      src={src}
      alt={alt}
      width={400}
      height={192}
      className={`object-cover rounded-lg ${className}`}
      quality={80}
    />
  )
}

export function ThumbnailImageSimple({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <SimpleImage
      src={src}
      alt={alt}
      width={64}
      height={64}
      className={`object-cover rounded-lg ${className}`}
      quality={70}
    />
  )
}

export function HeroImageSimple({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <SimpleImage
      src={src}
      alt={alt}
      width={1200}
      height={600}
      className={`object-cover ${className}`}
      quality={85}
      priority
    />
  )
}
