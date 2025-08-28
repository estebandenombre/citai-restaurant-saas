"use client"

import { useState } from 'react'
import { MenuItemImageUpload } from '@/components/menu/menu-item-image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestUploadDebugPage() {
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
          <CardTitle>Debug Upload Test</CardTitle>
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
            restaurantId="test-restaurant-id"
            itemName="test dish"
          />
          
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <p><strong>Image URL:</strong> {imageUrl || 'None'}</p>
            <p><strong>Crop Data:</strong> {cropData ? JSON.stringify(cropData) : 'None'}</p>
            <p><strong>Image URL Type:</strong> {imageUrl ? typeof imageUrl : 'N/A'}</p>
            <p><strong>Image URL Length:</strong> {imageUrl ? imageUrl.length : 0}</p>
            {imageUrl && (
              <div className="mt-2">
                <p><strong>Image Preview:</strong></p>
                <img 
                  src={imageUrl} 
                  alt="Debug preview" 
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

