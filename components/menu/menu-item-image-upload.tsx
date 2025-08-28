"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2,
  Trash2,
  Eye,
  Crop
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ImageCropper } from '@/components/ui/image-cropper'
import Image from 'next/image'
import { uploadImage, createImagePreview, validateImage } from '@/lib/image-upload'

interface MenuItemImageUploadProps {
  imageUrl: string | null
  onImageChange: (url: string | null) => void
  restaurantId: string
  itemName?: string
  cropData?: any
  onCropDataChange?: (cropData: any) => void
}

export function MenuItemImageUpload({ 
  imageUrl, 
  onImageChange, 
  restaurantId,
  itemName = "menu item",
  cropData,
  onCropDataChange
}: MenuItemImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState(imageUrl || '')
  const [showCropper, setShowCropper] = useState(false)
  
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Sincronizar imageUrlInput cuando cambie imageUrl
  useEffect(() => {
    if (imageUrl) {
      setImageUrlInput(imageUrl)
    }
  }, [imageUrl])

  const handleImageUpload = async (file: File) => {
    console.log('Starting upload for file:', file.name)
    setUploading(true)
    try {
      // Crear preview temporal para mostrar inmediatamente
      const preview = await createImagePreview(file)
      setImagePreview(preview)
      
      // Subir imagen real a Supabase
      const result = await uploadImage(file, restaurantId, 'menu-items')
      if (result.success && result.url) {
        console.log('Upload successful, URL:', result.url)
        
        // Actualizar con la URL real de Supabase
        setImagePreview(null) // Limpiar preview temporal
        setImageUrlInput(result.url)
        onImageChange(result.url)
        
        toast({
          title: "Image uploaded successfully",
          description: `Your ${itemName} image has been updated.`,
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setImagePreview(null) // Limpiar preview temporal en caso de error
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    console.log('File selected in MenuItemImageUpload:', file)
    
    // Validación completa
    const validation = validateImage(file)
    if (!validation.isValid) {
      console.log('Validation failed:', validation.error)
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    console.log('File validation passed, uploading...')
    try {
      await handleImageUpload(file)
    } catch (error) {
      console.error('Error handling file:', error)
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      })
    }
  }

  const handleImageUrlChange = () => {
    if (imageUrlInput.trim()) {
      onImageChange(imageUrlInput.trim())
      toast({
        title: "Image URL updated",
        description: `Your ${itemName} image URL has been updated.`,
      })
    }
  }

  const removeImage = () => {
    onImageChange(null)
    setImagePreview(null)
    setImageUrlInput('')
    toast({
      title: "Image removed",
      description: `Your ${itemName} image has been removed.`,
    })
  }

  const currentImageUrl = imageUrl || imagePreview

  // Debug logs
  console.log('🔍 MenuItemImageUpload Debug:', {
    imageUrl,
    imagePreview,
    currentImageUrl,
    imageUrlInput,
    uploading,
    showCropper
  })

  const handleCropSave = (newCropData: any) => {
    onCropDataChange?.(newCropData)
    setShowCropper(false)
    toast({
      title: "Recorte guardado",
      description: "El recorte de la imagen se ha guardado correctamente.",
    })
  }

  const handleCropCancel = () => {
    setShowCropper(false)
  }

  if (showCropper && currentImageUrl) {
    return (
      <ImageCropper
        src={currentImageUrl}
        alt={itemName}
        onCropChange={() => {}}
        initialCrop={cropData}
        onSave={handleCropSave}
        onCancel={handleCropCancel}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Dish Image</Label>
        <Badge variant="secondary">Recommended: 400x300px</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload */}
        <div className="space-y-3">
          <Label>Upload Image</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            {currentImageUrl ? (
              <div className="space-y-3">
                <div className="relative w-full h-32 mx-auto">
                  {cropData ? (
                    <img
                      src={currentImageUrl}
                      alt="Dish image"
                      className="w-full h-full object-cover rounded-lg"
                      style={{
                        transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
                        transformOrigin: 'center',
                      }}
                    />
                  ) : (
                    <img
                      src={currentImageUrl}
                      alt="Dish image"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log('Change button clicked, fileRef:', fileRef.current)
                      fileRef.current?.click()
                    }}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Change
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCropper(true)}
                    disabled={uploading || !currentImageUrl}
                  >
                    <Crop className="h-4 w-4" />
                    Crop
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeImage}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('Upload button clicked, fileRef:', fileRef.current)
                      fileRef.current?.click()
                    }}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Image
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                console.log('File input changed:', e.target.files)
                const file = e.target.files?.[0]
                if (file) {
                  handleFileSelect(file)
                } else {
                  console.log('No file selected')
                }
              }}
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-3">
          <Label>Or use external URL</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="https://example.com/dish-image.jpg"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
            />
            <Button
              size="sm"
              onClick={handleImageUrlChange}
              disabled={!imageUrlInput.trim()}
            >
              Save
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter a direct link to your dish image
          </p>
        </div>
      </div>

      {/* Preview Section */}
      {currentImageUrl && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-3">
              This is how your dish image will appear on your menu:
            </div>
            <div className="relative w-32 h-24">
              <Image
                src={currentImageUrl}
                alt="Dish preview"
                fill
                className="object-cover rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
