import { supabase } from './supabase'

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

export interface ImageValidationResult {
  isValid: boolean
  error?: string
}

export const validateImage = (file: File): ImageValidationResult => {
  // Verificar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no soportado. Solo se permiten: JPG, PNG, GIF, WebP'
    }
  }

  // Verificar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB'
    }
  }

  return { isValid: true }
}

export const optimizeImage = async (file: File, maxWidth: number = 1200): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Convertir a blob
      canvas.toBlob((blob) => {
        if (blob) {
          const optimizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(optimizedFile)
        } else {
          resolve(file) // Fallback al archivo original
        }
      }, file.type, 0.8) // Calidad 80%
    }

    img.src = URL.createObjectURL(file)
  })
}

export const uploadImage = async (
  file: File, 
  restaurantId: string, 
  folder: string = 'menu-items'
): Promise<ImageUploadResult> => {
  try {
    // Validar imagen
    const validation = validateImage(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Optimizar imagen si es necesario
    const optimizedFile = await optimizeImage(file)

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `${restaurantId}/${timestamp}-${randomId}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, optimizedFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return {
        success: false,
        error: 'Error al subir la imagen. Inténtalo de nuevo.'
      }
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl
    }

  } catch (error) {
    console.error('Error in uploadImage:', error)
    return {
      success: false,
      error: 'Error inesperado al subir la imagen'
    }
  }
}

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer la ruta del archivo de la URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(-2).join('/') // Obtener los últimos dos segmentos

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteImage:', error)
    return false
  }
}

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('No se pudo crear la vista previa'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

// Función para obtener dimensiones de imagen
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = URL.createObjectURL(file)
  })
}

// Función para verificar si una URL de imagen es válida
export const isValidImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return contentType?.startsWith('image/') || false
  } catch {
    return false
  }
}

