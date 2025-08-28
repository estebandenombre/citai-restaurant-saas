"use client"

import { useState } from 'react'
import { ImageCropper, useImageCrop } from '@/components/ui/image-cropper'
import { CroppedDishImage } from '@/components/ui/cropped-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestCropPage() {
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop')
  const [cropData, setCropData] = useState<any>(null)
  const [showCropper, setShowCropper] = useState(false)

  const handleCropSave = (newCropData: any) => {
    setCropData(newCropData)
    setShowCropper(false)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
  }

  if (showCropper) {
    return (
      <div className="container mx-auto p-6">
        <ImageCropper
          src={imageUrl}
          alt="Test image"
          onCropChange={() => {}}
          initialCrop={cropData}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Image Cropping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          
          <Button onClick={() => setShowCropper(true)}>
            Open Cropper
          </Button>
        </CardContent>
      </Card>

      {cropData && (
        <Card>
          <CardHeader>
            <CardTitle>Crop Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(cropData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Original</h4>
              <img 
                src={imageUrl} 
                alt="Original" 
                className="w-full h-48 object-cover rounded"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Cropped</h4>
              <CroppedDishImage
                src={imageUrl}
                alt="Cropped"
                cropData={cropData}
                className="w-full h-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

