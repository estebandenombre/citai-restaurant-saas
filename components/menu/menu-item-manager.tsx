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
import { useI18n } from "@/components/i18n/i18n-provider"

interface MenuItemManagerProps {
  restaurantId: string
  onSuccess: () => void
  onBack: () => void
}

type ViewMode = 'select' | 'individual' | 'bulk'

export default function MenuItemManager({ restaurantId, onSuccess, onBack }: MenuItemManagerProps) {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          createdOne: "Item del menu creado correctamente",
          createdMany: "Items del menu creados correctamente",
          back: "Volver",
          backToMenu: "Volver al menu",
          addMenuItem: "Anadir item de menu",
          addMenuItemDesc: "Crea un item con toda la informacion",
          bulkAddTitle: "Anadir items en bloque",
          bulkAddDesc: "Anade varios items rapidamente con CSV o manual",
          addMenuItems: "Anadir items al menu",
          chooseHow: "Elige como quieres anadir items al menu",
          individualItem: "Item individual",
          individualDesc: "Anade un item con informacion detallada incluyendo alergenos, dieta e ingredientes.",
          detailedInfo: "Informacion detallada",
          allergensDiet: "Alergenos y dieta",
          ingredientsList: "Lista de ingredientes",
          addSingle: "Anadir item individual",
          bulkAdd: "Anadir en bloque",
          bulkDesc: "Anade multiples items con import CSV o entrada manual para datos basicos.",
          csvImport: "Importar/exportar CSV",
          multipleAtOnce: "Varios items a la vez",
          quickSetup: "Configuracion rapida",
          bulkAddItems: "Anadir items en bloque",
          tipsTitle: "Consejos para anadir items",
          tip1: "Individual: ideal para items con detalles, alergenos o requisitos especiales.",
          tip2: "Bloque: ideal para cargar muchos items rapido o desde CSV.",
          tip3: "Categorias: crea categorias primero para mejor organizacion.",
        }
      : {
          createdOne: "Menu item created successfully!",
          createdMany: "Menu items created successfully!",
          back: "Back",
          backToMenu: "Back to Menu",
          addMenuItem: "Add Menu Item",
          addMenuItemDesc: "Create a detailed menu item with all information",
          bulkAddTitle: "Bulk Add Menu Items",
          bulkAddDesc: "Add multiple items quickly with CSV import or manual entry",
          addMenuItems: "Add Menu Items",
          chooseHow: "Choose how you want to add items to your menu",
          individualItem: "Individual Item",
          individualDesc: "Add one menu item with detailed information including allergens, dietary info, and ingredients.",
          detailedInfo: "Detailed information",
          allergensDiet: "Allergens & dietary info",
          ingredientsList: "Ingredients list",
          addSingle: "Add Single Item",
          bulkAdd: "Bulk Add",
          bulkDesc: "Add multiple menu items quickly using CSV import or manual entry for basic information.",
          csvImport: "CSV import/export",
          multipleAtOnce: "Multiple items at once",
          quickSetup: "Quick setup",
          bulkAddItems: "Bulk Add Items",
          tipsTitle: "Tips for Adding Menu Items",
          tip1: "Individual Add: perfect for items with detailed information, allergens, or special dietary requirements.",
          tip2: "Bulk Add: great for quickly adding many items or when you have a CSV file ready.",
          tip3: "Categories: make sure you have categories set up first for better organization.",
        }
  const [viewMode, setViewMode] = useState<ViewMode>('select')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSuccess = (message: string = tx.createdOne) => {
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
            {tx.back}
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tx.addMenuItem}</h2>
            <p className="text-gray-600">{tx.addMenuItemDesc}</p>
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
            {tx.back}
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tx.bulkAddTitle}</h2>
            <p className="text-gray-600">{tx.bulkAddDesc}</p>
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
          onSuccess={() => handleSuccess(tx.createdMany)}
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
            {tx.backToMenu}
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{tx.addMenuItems}</h1>
          <p className="text-gray-600 mt-2">{tx.chooseHow}</p>
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
            <CardTitle className="text-xl">{tx.individualItem}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {tx.individualDesc}
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{tx.detailedInfo}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{tx.allergensDiet}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{tx.ingredientsList}</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setViewMode('individual')}>
              <Plus className="h-4 w-4 mr-2" />
              {tx.addSingle}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Add */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setViewMode('bulk')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">{tx.bulkAdd}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {tx.bulkDesc}
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{tx.csvImport}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{tx.multipleAtOnce}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{tx.quickSetup}</span>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setViewMode('bulk')}>
              <Zap className="h-4 w-4 mr-2" />
              {tx.bulkAddItems}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 {tx.tipsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              {tx.tip1}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              {tx.tip2}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              {tx.tip3}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 