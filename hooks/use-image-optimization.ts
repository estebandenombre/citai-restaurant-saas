import { useState, useEffect, useCallback } from 'react'

interface UseImageOptimizationProps {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
}

interface OptimizedImageData {
  src: string
  alt: string
  sizes: string
  loading: 'lazy' | 'eager'
  quality: number
  format: 'webp' | 'avif' | 'auto'
}

export function useImageOptimization({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false
}: UseImageOptimizationProps): OptimizedImageData {
  const [isInView, setIsInView] = useState(priority)
  const [imageFormat, setImageFormat] = useState<'webp' | 'avif' | 'auto'>('auto')

  // Detectar soporte de formatos modernos
  useEffect(() => {
    const checkWebPSupport = async () => {
      const webpSupported = await new Promise<boolean>((resolve) => {
        const webp = new Image()
        webp.onload = webp.onerror = () => {
          resolve(webp.height === 2)
        }
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
      })

      const avifSupported = await new Promise<boolean>((resolve) => {
        const avif = new Image()
        avif.onload = avif.onerror = () => {
          resolve(avif.height === 1)
        }
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
      })

      if (avifSupported) {
        setImageFormat('avif')
      } else if (webpSupported) {
        setImageFormat('webp')
      } else {
        setImageFormat('auto')
      }
    }

    checkWebPSupport()
  }, [])

  // Intersection Observer para lazy loading
  const imageRef = useCallback((node: HTMLImageElement | null) => {
    if (node && !priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      )

      observer.observe(node)
      return () => observer.disconnect()
    }
  }, [priority])

  // Optimizar URL de imagen
  const optimizeImageUrl = useCallback((url: string): string => {
    if (!url || url.startsWith('data:')) return url

    try {
      const urlObj = new URL(url)
      
      // Si es una imagen de Supabase, agregar parámetros de optimización
      if (urlObj.hostname.includes('supabase.co')) {
        const params = new URLSearchParams(urlObj.search)
        params.set('width', '400')
        params.set('quality', '80')
        if (imageFormat !== 'auto') {
          params.set('format', imageFormat)
        }
        urlObj.search = params.toString()
        return urlObj.toString()
      }

      return url
    } catch {
      return url
    }
  }, [imageFormat])

  return {
    src: isInView ? optimizeImageUrl(src) : '',
    alt,
    sizes,
    loading: priority ? 'eager' : 'lazy',
    quality: 80,
    format: imageFormat
  }
}

// Hook para precargar imágenes importantes
export function useImagePreload(src: string, priority: boolean = false) {
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)

      return () => {
        document.head.removeChild(link)
      }
    }
  }, [src, priority])
}

// Hook para detectar si una imagen está cargada
export function useImageLoaded(src: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setHasError(true)
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { isLoaded, hasError }
}

