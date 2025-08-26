"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Upload, 
  ChefHat, 
  Zap,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import AddMenuItemForm from "./add-menu-item-form"
import BulkAddMenuItems from "./bulk-add-menu-items"

interface MenuItemManagerProps {
  restaurantId: string
  onSuccess: () => void
  onBack: () => void
}

type ViewMode = 'select' | 'individual' | 'bulk'

export default function MenuItemManager({ restaurantId, onSuccess, onBack }: MenuItemManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('select')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSuccess = (message: string = 'Menu item created successfully!') => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage('')
      onSuccess()
    }, 2000)
  }

  const handleBack = () => {
    if (viewMode !== 'select') {
      setViewMode('select')
    } else {
      onBack()
    }
  }

  if (viewMode === 'individual') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Menu Item</h2>
            <p className="text-gray-600">Create a detailed menu item with all information</p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-700">{successMessage}</span>
            </div>
          </div>
        )}

        <AddMenuItemForm
          restaurantId={restaurantId}
          onSuccess={() => handleSuccess()}
          onCancel={handleBack}
        />
      </div>
    )
  }

  if (viewMode === 'bulk') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Add Menu Items</h2>
            <p className="text-gray-600">Add multiple items quickly with CSV import or manual entry</p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-700">{successMessage}</span>
            </div>
          </div>
        )}

        <BulkAddMenuItems
          restaurantId={restaurantId}
          onSuccess={() => handleSuccess('Menu items created successfully!')}
          onCancel={handleBack}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Menu Items</h1>
          <p className="text-gray-600 mt-2">Choose how you want to add items to your menu</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Individual Add */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setViewMode('individual')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ChefHat className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Individual Item</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Add one menu item with detailed information including allergens, dietary info, and ingredients.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Detailed information</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Allergens & dietary info</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Ingredients list</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setViewMode('individual')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Single Item
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Add */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setViewMode('bulk')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Bulk Add</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Add multiple menu items quickly using CSV import or manual entry for basic information.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>CSV import/export</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Multiple items at once</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Quick setup</span>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setViewMode('bulk')}>
              <Zap className="h-4 w-4 mr-2" />
              Bulk Add Items
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Tips for Adding Menu Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              <strong>Individual Add:</strong> Perfect for items with detailed information, allergens, or special dietary requirements.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              <strong>Bulk Add:</strong> Great for quickly adding many items or when you have a CSV file ready.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              <strong>Categories:</strong> Make sure you have categories set up first for better organization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 