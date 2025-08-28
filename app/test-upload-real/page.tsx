"use client"

import { useState } from 'react'
import { MenuItemImageUpload } from '@/components/menu/menu-item-image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestUploadRealPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [cropData, setCropData] = useState<any>(null)

  const resetImage = () => {
    setImageUrl(null)
    setCropData(null)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Real Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-4">
            <Button onClick={resetImage} variant="outline">
              Reset Image
            </Button>
            <div className="text-sm text-gray-600">
              Current Image URL: {imageUrl || 'None'}
            </div>
          </div>
          
          <div className="border-2 border-green-300 p-4 rounded">
            <h3 className="font-medium mb-2 text-green-600">Real Upload Component:</h3>
            <MenuItemImageUpload
              imageUrl={imageUrl}
              onImageChange={(url) => {
                console.log('🔄 Image changed to:', url)
                setImageUrl(url)
              }}
              cropData={cropData}
              onCropDataChange={(data) => {
                console.log('✂️ Crop data changed to:', data)
                setCropData(data)
              }}
              restaurantId="550e8400-e29b-41d4-a716-446655440001" // ID real de restaurante
              itemName="test dish"
            />
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Upload Info:</h3>
            <p><strong>Image URL:</strong> {imageUrl || 'None'}</p>
            <p><strong>URL Type:</strong> {imageUrl ? typeof imageUrl : 'N/A'}</p>
            <p><strong>Is Blob URL:</strong> {imageUrl ? imageUrl.startsWith('blob:') ? 'Yes (Temporary)' : 'No (Permanent)' : 'N/A'}</p>
            <p><strong>Is Supabase URL:</strong> {imageUrl ? imageUrl.includes('supabase.co') ? 'Yes' : 'No' : 'N/A'}</p>
            <p><strong>Crop Data:</strong> {cropData ? JSON.stringify(cropData) : 'None'}</p>
            {imageUrl && !imageUrl.startsWith('blob:') && (
              <div className="mt-2">
                <p><strong>Permanent Image Preview:</strong></p>
                <img 
                  src={imageUrl} 
                  alt="Permanent preview" 
                  className="w-32 h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

