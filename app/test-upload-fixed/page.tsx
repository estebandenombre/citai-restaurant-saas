"use client"

import { useState } from 'react'
import { MenuItemImageUpload } from '@/components/menu/menu-item-image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestUploadFixedPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [cropData, setCropData] = useState<any>(null)

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Fixed Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemImageUpload
            imageUrl={imageUrl}
            onImageChange={(url) => {
              console.log('Image changed to:', url)
              setImageUrl(url)
            }}
            cropData={cropData}
            onCropDataChange={(data) => {
              console.log('Crop data changed to:', data)
              setCropData(data)
            }}
            restaurantId="test-restaurant-id"
            itemName="test dish"
          />
          
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Current State:</h3>
            <p><strong>Image URL:</strong> {imageUrl || 'None'}</p>
            <p><strong>Crop Data:</strong> {cropData ? JSON.stringify(cropData) : 'None'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

