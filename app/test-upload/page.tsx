"use client"

import { useState } from 'react'
import { MenuItemImageUpload } from '@/components/menu/menu-item-image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestUploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [cropData, setCropData] = useState<any>(null)

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Image Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemImageUpload
            imageUrl={imageUrl}
            onImageChange={setImageUrl}
            cropData={cropData}
            onCropDataChange={setCropData}
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

