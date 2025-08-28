"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CropData {
  x: number
  y: number
  scale: number
  rotation: number
}

export default function TestCropSimplePage() {
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, scale: 1, rotation: 0 })
  const [testImage] = useState('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop')

  const applyCrop = (newCrop: Partial<CropData>) => {
    setCropData(prev => ({ ...prev, ...newCrop }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Crop Simple</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Image */}
            <div>
              <h4 className="font-medium mb-2">Original</h4>
              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                <img 
                  src={testImage} 
                  alt="Original" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Cropped Image */}
            <div>
              <h4 className="font-medium mb-2">Cropped</h4>
              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                <img
                  src={testImage}
                  alt="Cropped"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Position (X, Y)</h5>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ x: cropData.x - 10 })}
                >
                  X -10
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ x: cropData.x + 10 })}
                >
                  X +10
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ y: cropData.y - 10 })}
                >
                  Y -10
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ y: cropData.y + 10 })}
                >
                  Y +10
                </Button>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Scale</h5>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ scale: Math.max(0.5, cropData.scale - 0.1) })}
                >
                  Zoom Out
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ scale: Math.min(3, cropData.scale + 0.1) })}
                >
                  Zoom In
                </Button>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Rotation</h5>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ rotation: cropData.rotation - 15 })}
                >
                  Rotate Left
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => applyCrop({ rotation: cropData.rotation + 15 })}
                >
                  Rotate Right
                </Button>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Reset</h5>
              <Button 
                variant="outline"
                onClick={() => setCropData({ x: 0, y: 0, scale: 1, rotation: 0 })}
              >
                Reset All
              </Button>
            </div>
          </div>

          {/* Current Values */}
          <div>
            <h5 className="font-medium mb-2">Current Values</h5>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(cropData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

