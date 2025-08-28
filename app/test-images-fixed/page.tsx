"use client"

import { useState } from 'react'
import { MenuItemImageUpload } from '@/components/menu/menu-item-image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CroppedDishImage } from '@/components/ui/cropped-image'

export default function TestImagesFixedPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [cropData, setCropData] = useState<any>(null)

  const resetImage = () => {
    setImageUrl(null)
    setCropData(null)
  }

  const setTestImage = () => {
    setImageUrl('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop')
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Images Fixed Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-4">
            <Button onClick={resetImage} variant="outline">
              Reset Image
            </Button>
            <Button onClick={setTestImage} variant="outline">
              Set Test Image
            </Button>
            <div className="text-sm text-gray-600">
              Current Image URL: {imageUrl || 'None'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Component */}
            <div className="border-2 border-blue-300 p-4 rounded">
              <h3 className="font-medium mb-2 text-blue-600">Upload Component:</h3>
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
                restaurantId="550e8400-e29b-41d4-a716-446655440001"
                itemName="test dish"
              />
            </div>

            {/* Display Component */}
            <div className="border-2 border-green-300 p-4 rounded">
              <h3 className="font-medium mb-2 text-green-600">Display Component:</h3>
              {imageUrl ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">CroppedDishImage:</h4>
                    <CroppedDishImage
                      src={imageUrl}
                      alt="Test dish"
                      cropData={cropData}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Regular img tag:</h4>
                    <img 
                      src={imageUrl} 
                      alt="Test dish" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No image to display
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <p><strong>Image URL:</strong> {imageUrl || 'None'}</p>
            <p><strong>Crop Data:</strong> {cropData ? JSON.stringify(cropData) : 'None'}</p>
            <p><strong>URL Type:</strong> {imageUrl ? typeof imageUrl : 'N/A'}</p>
            <p><strong>Is Supabase URL:</strong> {imageUrl ? imageUrl.includes('supabase.co') ? 'Yes' : 'No' : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

