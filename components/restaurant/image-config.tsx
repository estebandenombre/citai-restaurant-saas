"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2,
  Eye,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { uploadImage, createImagePreview, validateImage } from '@/lib/image-upload'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'
import Image from 'next/image'

interface ImageConfigProps {
  logoUrl: string | null
  coverImageUrl: string | null
  onLogoChange: (url: string | null) => void
  onCoverImageChange: (url: string | null) => void
  restaurantId: string
}

export function ImageConfig({ 
  logoUrl, 
  coverImageUrl, 
  onLogoChange, 
  onCoverImageChange,
  restaurantId 
}: ImageConfigProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [logoUrlInput, setLogoUrlInput] = useState(logoUrl || '')
  const [coverUrlInput, setCoverUrlInput] = useState(coverImageUrl || '')
  
  const logoFileRef = useRef<HTMLInputElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true)
    try {
      const result = await uploadImage(file, restaurantId, 'logos')
      if (result.success && result.url) {
        onLogoChange(result.url)
        toast({
          title: "Logo uploaded successfully",
          description: "Your restaurant logo has been updated.",
        })
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload logo",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true)
    try {
      const result = await uploadImage(file, restaurantId, 'hero-images')
      if (result.success && result.url) {
        onCoverImageChange(result.url)
        toast({
          title: "Hero image uploaded successfully",
          description: "Your restaurant hero image has been updated.",
        })
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload hero image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading hero image:', error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUploadingCover(false)
    }
  }

  const handleFileSelect = async (file: File, type: 'logo' | 'cover') => {
    const validation = validateImage(file)
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    try {
      const preview = await createImagePreview(file)
      if (type === 'logo') {
        setLogoPreview(preview)
      } else {
        setCoverPreview(preview)
      }

      if (type === 'logo') {
        await handleLogoUpload(file)
      } else {
        await handleCoverUpload(file)
      }
    } catch (error) {
      console.error('Error handling file:', error)
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      })
    }
  }

  const handleLogoUrlChange = () => {
    if (logoUrlInput.trim()) {
      onLogoChange(logoUrlInput.trim())
      toast({
        title: "Logo URL updated",
        description: "Your restaurant logo URL has been updated.",
      })
    }
  }

  const handleCoverUrlChange = () => {
    if (coverUrlInput.trim()) {
      onCoverImageChange(coverUrlInput.trim())
      toast({
        title: "Hero image URL updated",
        description: "Your restaurant hero image URL has been updated.",
      })
    }
  }

  const removeLogo = () => {
    onLogoChange(null)
    setLogoPreview(null)
    setLogoUrlInput('')
    toast({
      title: "Logo removed",
      description: "Your restaurant logo has been removed.",
    })
  }

  const removeCoverImage = () => {
    onCoverImageChange(null)
    setCoverPreview(null)
    setCoverUrlInput('')
    toast({
      title: "Hero image removed",
      description: "Your restaurant hero image has been removed.",
    })
  }

  const currentLogoUrl = logoUrl || logoPreview
  const currentCoverUrl = coverImageUrl || coverPreview

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Images & Branding
        </CardTitle>
        <CardDescription>
          Upload your restaurant logo and hero background image for your landing page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">Restaurant Logo</Label>
            <Badge variant="secondary">Recommended: 200x200px</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label>Upload Logo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {currentLogoUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-24 h-24 mx-auto">
                      <Image
                        src={currentLogoUrl}
                        alt="Restaurant logo"
                        width={96}
                        height={96}
                        className="object-contain rounded-lg w-full h-full"
                      />
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => logoFileRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Change
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={removeLogo}
                        disabled={uploadingLogo}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => logoFileRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload Logo
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileSelect(file, 'logo')
                    }
                  }}
                />
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-3">
              <Label>Or use external URL</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="https://example.com/logo.png"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={handleLogoUrlChange}
                  disabled={!logoUrlInput.trim()}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter a direct link to your logo image
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Hero Background Image Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">Hero Background Image</Label>
            <Badge variant="secondary">Recommended: 1920x1080px</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hero Image Upload */}
            <div className="space-y-3">
              <Label>Upload Hero Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {currentCoverUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-32 mx-auto">
                      <Image
                        src={currentCoverUrl}
                        alt="Hero background"
                        width={400}
                        height={128}
                        className="object-cover rounded-lg w-full h-full"
                      />
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => coverFileRef.current?.click()}
                        disabled={uploadingCover}
                      >
                        {uploadingCover ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Change
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={removeCoverImage}
                        disabled={uploadingCover}
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
                        onClick={() => coverFileRef.current?.click()}
                        disabled={uploadingCover}
                      >
                        {uploadingCover ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload Hero Image
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileSelect(file, 'cover')
                    }
                  }}
                />
              </div>
            </div>

            {/* Hero Image URL */}
            <div className="space-y-3">
              <Label>Or use external URL</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="https://example.com/hero-image.jpg"
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={handleCoverUrlChange}
                  disabled={!coverUrlInput.trim()}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter a direct link to your hero background image
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {(currentLogoUrl || currentCoverUrl) && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="text-lg font-medium">Preview</Label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-3">
                  This is how your images will appear on your restaurant landing page:
                </div>
                <div className="space-y-4">
                  {currentLogoUrl && (
                    <div className="flex items-center space-x-3">
                      <Label className="text-sm font-medium w-20">Logo:</Label>
                      <div className="relative w-12 h-12">
                        <Image
                          src={currentLogoUrl}
                          alt="Logo preview"
                          width={48}
                          height={48}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                  {currentCoverUrl && (
                    <div className="flex items-center space-x-3">
                      <Label className="text-sm font-medium w-20">Hero Image:</Label>
                      <div className="relative w-32 h-20">
                        <Image
                          src={currentCoverUrl}
                          alt="Hero image preview"
                          width={128}
                          height={80}
                          className="object-cover rounded w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
