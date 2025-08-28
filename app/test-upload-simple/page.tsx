"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestUploadSimplePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    console.log('File selected in simple test:', file)
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const tempUrl = URL.createObjectURL(file)
    setImageUrl(tempUrl)
    console.log('Image URL set:', tempUrl)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => fileRef.current?.click()}
            className="w-full"
          >
            Select Image
          </Button>
          
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              console.log('File input changed in simple test:', e.target.files)
              const file = e.target.files?.[0]
              if (file) {
                handleFileSelect(file)
              }
            }}
          />

          {imageUrl && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Selected Image:</h3>
              <img 
                src={imageUrl} 
                alt="Selected" 
                className="w-full max-w-md h-48 object-cover rounded"
              />
              <p className="text-sm text-gray-600 mt-2">URL: {imageUrl}</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <p><strong>Image URL:</strong> {imageUrl || 'None'}</p>
            <p><strong>File Input Ref:</strong> {fileRef.current ? 'Exists' : 'Not found'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

