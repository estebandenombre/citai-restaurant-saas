"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Move, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  X,
  Download,
  Upload
} from 'lucide-react'

interface ImageCropData {
  x: number
  y: number
  scale: number
  rotation: number
}

interface ImageCropperProps {
  src: string
  alt: string
  onCropChange: (cropData: ImageCropData) => void
  initialCrop?: ImageCropData
  aspectRatio?: number
  onSave?: (cropData: ImageCropData) => void
  onCancel?: () => void
}

export function ImageCropper({
  src,
  alt,
  onCropChange,
  initialCrop,
  aspectRatio = 16/9,
  onSave,
  onCancel
}: ImageCropperProps) {
  const [cropData, setCropData] = useState<ImageCropData>(
    initialCrop || { x: 0, y: 0, scale: 1, rotation: 0 }
  )
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - cropData.x, y: e.clientY - cropData.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    e.preventDefault()
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    
    const newCropData = { ...cropData, x: newX, y: newY }
    setCropData(newCropData)
    onCropChange(newCropData)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleScaleChange = (value: number[]) => {
    const newCropData = { ...cropData, scale: value[0] }
    setCropData(newCropData)
    onCropChange(newCropData)
  }

  const handleRotationChange = (value: number[]) => {
    const newCropData = { ...cropData, rotation: value[0] }
    setCropData(newCropData)
    onCropChange(newCropData)
  }

  const resetCrop = () => {
    const resetData = { x: 0, y: 0, scale: 1, rotation: 0 }
    setCropData(resetData)
    onCropChange(resetData)
  }

  const handleSave = () => {
    onSave?.(cropData)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="h-5 w-5" />
          Ajustar Recorte de Imagen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
                 {/* Image Cropping Area */}
         <div className="relative bg-gray-100 rounded-lg overflow-hidden">
           <div 
             ref={containerRef}
             className="relative w-full h-64 overflow-hidden"
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
           >
             <img
               ref={imageRef}
               src={src}
               alt={alt}
               className="absolute cursor-move select-none"
               style={{
                 transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
                 transformOrigin: 'center',
                 maxWidth: 'none',
                 maxHeight: 'none',
                 width: '100%',
                 height: '100%',
                 objectFit: 'cover'
               }}
               onMouseDown={handleMouseDown}
               draggable={false}
             />
             
             {/* Crop Overlay */}
             <div className="absolute inset-0 pointer-events-none">
               {/* Overlay oscuro */}
               <div className="absolute inset-0 bg-black bg-opacity-40" />
               
               {/* Área de recorte transparente */}
               <div 
                 className="absolute inset-4 bg-transparent border-2 border-white border-dashed shadow-lg"
                 style={{ 
                   aspectRatio,
                   boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)'
                 }}
               />
               
               {/* Guías de recorte */}
               <div className="absolute inset-4 pointer-events-none">
                 <div className="absolute top-1/2 left-0 right-0 h-px bg-white opacity-50" style={{ transform: 'translateY(-50%)' }} />
                 <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white opacity-50" style={{ transform: 'translateX(-50%)' }} />
               </div>
             </div>
           </div>
         </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Scale Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ZoomIn className="h-4 w-4" />
              Zoom: {Math.round(cropData.scale * 100)}%
            </div>
            <Slider
              value={[cropData.scale]}
              onValueChange={handleScaleChange}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <RotateCcw className="h-4 w-4" />
              Rotación: {cropData.rotation}°
            </div>
            <Slider
              value={[cropData.rotation]}
              onValueChange={handleRotationChange}
              min={-180}
              max={180}
              step={1}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={resetCrop}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetear
            </Button>
            
            <div className="flex-1" />
            
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Guardar Recorte
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook para manejar el recorte de imágenes
export function useImageCrop() {
  const [cropData, setCropData] = useState<ImageCropData>({ x: 0, y: 0, scale: 1, rotation: 0 })
  const [isCropping, setIsCropping] = useState(false)

  const startCrop = () => setIsCropping(true)
  const cancelCrop = () => setIsCropping(false)
  
  const saveCrop = (newCropData: ImageCropData) => {
    setCropData(newCropData)
    setIsCropping(false)
  }

  return {
    cropData,
    isCropping,
    startCrop,
    cancelCrop,
    saveCrop
  }
}
