"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  X, 
  ChefHat, 
  Clock, 
  DollarSign, 
  Star, 
  AlertTriangle,
  CheckCircle,
  Save,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { MenuItemImageUpload } from "./menu-item-image-upload"
import { useI18n } from "@/components/i18n/i18n-provider"

interface Category {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
}

interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  allergens: string[] | null
  dietary_info: string[] | null
  ingredients: string[] | null
  preparation_time: number | null
  is_available: boolean
  is_featured: boolean
  display_order: number
}

interface MenuItemForm {
  name: string
  description: string
  price: string
  image_url: string | null
  crop_data: any
  category_id: string
  allergens: string[]
  dietary_info: string[]
  ingredients: string[]
  preparation_time: string
  is_available: boolean
  is_featured: boolean
}

interface AddMenuItemFormProps {
  restaurantId: string
  onSuccess: () => void
  onCancel: () => void
  editingItem?: MenuItem | null
}

export default function AddMenuItemForm({ restaurantId, onSuccess, onCancel, editingItem }: AddMenuItemFormProps) {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          requiredName: "El nombre es obligatorio",
          requiredPrice: "El precio es obligatorio",
          positivePrice: "El precio debe ser mayor que cero",
          requiredCategory: "La categoria es obligatoria",
          prepPositive: "El tiempo de preparacion debe ser un numero positivo",
          failedSave: "No se pudo guardar el item de menu",
          editTitle: "Editar item de menu",
          addTitle: "Anadir nuevo item de menu",
          editDesc: "Actualiza los detalles del item",
          addDesc: "Crea un nuevo item para tu restaurante",
          cancel: "Cancelar",
          name: "Nombre *",
          price: "Precio *",
          description: "Descripcion",
          category: "Categoria *",
          selectCategory: "Selecciona una categoria",
          prepTime: "Tiempo de preparacion (minutos)",
          commonAllergens: "Alergenos comunes",
          customAllergen: "Alergeno personalizado",
          selectedAllergens: "Alergenos seleccionados",
          dietaryOptions: "Opciones de dieta",
          customDietary: "Opcion de dieta personalizada",
          selectedDietary: "Opciones de dieta seleccionadas",
          addIngredient: "Anadir ingrediente",
          ingredientsList: "Lista de ingredientes",
          settings: "Ajustes",
          availableForOrder: "Disponible para pedir",
          featuredItem: "Item destacado",
          updateItem: "Actualizar item",
          addItem: "Anadir item",
          dishExample: "ej. Pizza margarita",
          describeDish: "Describe el plato...",
          addCustomAllergen: "Anadir alergeno personalizado...",
          addCustomDietary: "Anadir opcion de dieta...",
          addIngredientPlaceholder: "Anadir ingrediente...",
          allergensTitle: "Alergenos",
          allergensDesc: "Selecciona los alergenos que contiene este plato",
          dietaryTitle: "Informacion dietetica",
          dietaryDesc: "Selecciona las opciones dieteticas que aplican a este plato",
          ingredientsTitle: "Ingredientes",
          ingredientsDesc: "Lista los ingredientes principales de este plato",
          availableDesc: "Haz que este item este disponible para pedir",
          featuredDesc: "Destaca este item como especial o popular",
          saving: "Guardando...",
        }
      : {
          requiredName: "Name is required",
          requiredPrice: "Price is required",
          positivePrice: "Price must be a positive number",
          requiredCategory: "Category is required",
          prepPositive: "Preparation time must be a positive number",
          failedSave: "Failed to save menu item",
          editTitle: "Edit Menu Item",
          addTitle: "Add New Menu Item",
          editDesc: "Update the details of your menu item",
          addDesc: "Create a new menu item for your restaurant",
          cancel: "Cancel",
          name: "Name *",
          price: "Price *",
          description: "Description",
          category: "Category *",
          selectCategory: "Select a category",
          prepTime: "Preparation Time (minutes)",
          commonAllergens: "Common Allergens",
          customAllergen: "Custom Allergen",
          selectedAllergens: "Selected Allergens",
          dietaryOptions: "Dietary Options",
          customDietary: "Custom Dietary Option",
          selectedDietary: "Selected Dietary Options",
          addIngredient: "Add Ingredient",
          ingredientsList: "Ingredients List",
          settings: "Settings",
          availableForOrder: "Available for Order",
          featuredItem: "Featured Item",
          updateItem: "Update Item",
          addItem: "Add Item",
          dishExample: "e.g., Margherita Pizza",
          describeDish: "Describe your dish...",
          addCustomAllergen: "Add custom allergen...",
          addCustomDietary: "Add custom dietary option...",
          addIngredientPlaceholder: "Add ingredient...",
          allergensTitle: "Allergens",
          allergensDesc: "Select allergens that this dish contains",
          dietaryTitle: "Dietary Information",
          dietaryDesc: "Select dietary options that apply to this dish",
          ingredientsTitle: "Ingredients",
          ingredientsDesc: "List the main ingredients in this dish",
          availableDesc: "Make this item available for customers to order",
          featuredDesc: "Highlight this item as a special or popular dish",
          saving: "Saving...",
        }

  const COMMON_ALLERGENS =
    locale === "es-ES"
      ? ["Gluten", "Lacteos", "Huevos", "Pescado", "Marisco", "Frutos secos", "Cacahuetes", "Soja", "Trigo", "Sesamo", "Sulfitos", "Mostaza"]
      : ["Gluten", "Dairy", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Soy", "Wheat", "Sesame", "Sulfites", "Mustard"]

  const DIETARY_OPTIONS =
    locale === "es-ES"
      ? ["Vegetariano", "Vegano", "Sin gluten", "Sin lacteos", "Bajo en carbohidratos", "Keto", "Paleo", "Halal", "Kosher", "Organico", "Local"]
      : ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Low-Carb", "Keto", "Paleo", "Halal", "Kosher", "Organic", "Local"]
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [form, setForm] = useState<MenuItemForm>({
    name: '',
    description: '',
    price: '',
    image_url: null,
    crop_data: null,
    category_id: '',
    allergens: [],
    dietary_info: [],
    ingredients: [],
    preparation_time: '',
    is_available: true,
    is_featured: false
  })

  const [newAllergen, setNewAllergen] = useState('')
  const [newDietary, setNewDietary] = useState('')
  const [newIngredient, setNewIngredient] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  // Load editing item data when component mounts or editingItem changes
  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        description: editingItem.description || '',
        price: editingItem.price.toString(),
        image_url: editingItem.image_url,
        crop_data: editingItem.crop_data,
        category_id: editingItem.category_id || '',
        allergens: editingItem.allergens || [],
        dietary_info: editingItem.dietary_info || [],
        ingredients: editingItem.ingredients || [],
        preparation_time: editingItem.preparation_time?.toString() || '',
        is_available: editingItem.is_available,
        is_featured: editingItem.is_featured
      })
    }
  }, [editingItem])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim()) {
      newErrors.name = tx.requiredName
    }

    if (!form.price.trim()) {
      newErrors.price = tx.requiredPrice
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = tx.positivePrice
    }

    if (!form.category_id) {
      newErrors.category_id = tx.requiredCategory
    }

    if (form.preparation_time && (isNaN(Number(form.preparation_time)) || Number(form.preparation_time) < 0)) {
      newErrors.preparation_time = tx.prepPositive
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      if (editingItem) {
        // Update existing item
        const updateData = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          image_url: form.image_url,
          crop_data: form.crop_data,
          category_id: form.category_id || null,
          allergens: form.allergens.length > 0 ? form.allergens : null,
          dietary_info: form.dietary_info.length > 0 ? form.dietary_info : null,
          ingredients: form.ingredients.length > 0 ? form.ingredients : null,
          preparation_time: form.preparation_time ? Number(form.preparation_time) : null,
          is_available: form.is_available,
          is_featured: form.is_featured
        }

        const { error } = await supabase
          .from('menu_items')
          .update(updateData)
          .eq('id', editingItem.id)
          .eq('restaurant_id', restaurantId)

        if (error) throw error
      } else {
        // Create new item
        const insertData = {
          restaurant_id: restaurantId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          image_url: form.image_url,
          crop_data: form.crop_data,
          category_id: form.category_id || null,
          allergens: form.allergens.length > 0 ? form.allergens : null,
          dietary_info: form.dietary_info.length > 0 ? form.dietary_info : null,
          ingredients: form.ingredients.length > 0 ? form.ingredients : null,
          preparation_time: form.preparation_time ? Number(form.preparation_time) : null,
          is_available: form.is_available,
          is_featured: form.is_featured,
          display_order: 0
        }

        const { error } = await supabase
          .from('menu_items')
          .insert(insertData)

        if (error) throw error
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error saving menu item:', error)
      setErrors({ submit: error.message || tx.failedSave })
    } finally {
      setSaving(false)
    }
  }

  const addAllergen = () => {
    if (newAllergen.trim() && !form.allergens.includes(newAllergen.trim())) {
      setForm(prev => ({
        ...prev,
        allergens: [...prev.allergens, newAllergen.trim()]
      }))
      setNewAllergen('')
    }
  }

  const removeAllergen = (allergen: string) => {
    setForm(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }))
  }

  const addDietary = () => {
    if (newDietary.trim() && !form.dietary_info.includes(newDietary.trim())) {
      setForm(prev => ({
        ...prev,
        dietary_info: [...prev.dietary_info, newDietary.trim()]
      }))
      setNewDietary('')
    }
  }

  const removeDietary = (dietary: string) => {
    setForm(prev => ({
      ...prev,
      dietary_info: prev.dietary_info.filter(d => d !== dietary)
    }))
  }

  const addIngredient = () => {
    if (newIngredient.trim() && !form.ingredients.includes(newIngredient.trim())) {
      setForm(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }))
      setNewIngredient('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }))
  }

  const toggleCommonAllergen = (allergen: string) => {
    if (form.allergens.includes(allergen)) {
      removeAllergen(allergen)
    } else {
      setForm(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergen]
      }))
    }
  }

  const toggleDietaryOption = (dietary: string) => {
    if (form.dietary_info.includes(dietary)) {
      removeDietary(dietary)
    } else {
      setForm(prev => ({
        ...prev,
        dietary_info: [...prev.dietary_info, dietary]
      }))
    }
  }

  const handleImageChange = (imageUrl: string | null) => {
    setForm(prev => ({
      ...prev,
      image_url: imageUrl
    }))
  }

  const handleCropDataChange = (cropData: any) => {
    setForm(prev => ({
      ...prev,
      crop_data: cropData
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 mx-auto w-[98%] my-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {editingItem ? tx.editTitle : tx.addTitle}
          </h2>
          <p className="text-gray-600 mt-2">
            {editingItem ? tx.editDesc : tx.addDesc}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          {tx.cancel}
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">{tx.name}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={tx.dishExample}
                  className={`h-11 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">{tx.price}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className={`h-11 pl-10 ${errors.price ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">{tx.description}</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={tx.describeDish}
                rows={3}
                className="min-h-[80px]"
              />
            </div>

            {/* Dish Image Upload */}
            <MenuItemImageUpload
              imageUrl={form.image_url}
              onImageChange={handleImageChange}
              cropData={form.crop_data}
              onCropDataChange={handleCropDataChange}
              restaurantId={restaurantId}
              itemName={form.name || "dish"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">{tx.category}</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(value) => setForm(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger className={`h-11 ${errors.category_id ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={tx.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preparation_time" className="text-sm font-medium">{tx.prepTime}</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="preparation_time"
                    type="number"
                    min="0"
                    value={form.preparation_time}
                    onChange={(e) => setForm(prev => ({ ...prev, preparation_time: e.target.value }))}
                    placeholder="15"
                    className="h-11 pl-10"
                  />
                </div>
                {errors.preparation_time && <p className="text-red-500 text-sm mt-1">{errors.preparation_time}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {tx.allergensTitle}
            </CardTitle>
            <p className="text-sm text-gray-600">{tx.allergensDesc}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">{tx.commonAllergens}</Label>
              <div className="flex flex-wrap gap-3">
                {COMMON_ALLERGENS.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant={form.allergens.includes(allergen) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 text-sm ${
                      form.allergens.includes(allergen) 
                        ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' 
                        : 'hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => toggleCommonAllergen(allergen)}
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">{tx.customAllergen}</Label>
              <div className="flex gap-3">
                <Input
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder={tx.addCustomAllergen}
                  onKeyPress={(e) => e.key === 'Enter' && addAllergen()}
                  className="h-11"
                />
                <Button type="button" onClick={addAllergen} size="sm" className="h-11 px-4">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {form.allergens.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">{tx.selectedAllergens}</Label>
                <div className="flex flex-wrap gap-3">
                  {form.allergens.map((allergen) => (
                    <Badge key={allergen} variant="secondary" className="bg-red-50 text-red-700 px-3 py-1.5 text-sm">
                      {allergen}
                      <button
                        type="button"
                        onClick={() => removeAllergen(allergen)}
                        className="ml-2 hover:text-red-900 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dietary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {tx.dietaryTitle}
            </CardTitle>
            <p className="text-sm text-gray-600">{tx.dietaryDesc}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">{tx.dietaryOptions}</Label>
              <div className="flex flex-wrap gap-3">
                {DIETARY_OPTIONS.map((dietary) => (
                  <Badge
                    key={dietary}
                    variant={form.dietary_info.includes(dietary) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 text-sm ${
                      form.dietary_info.includes(dietary) 
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                        : 'hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => toggleDietaryOption(dietary)}
                  >
                    {dietary}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">{tx.customDietary}</Label>
              <div className="flex gap-3">
                <Input
                  value={newDietary}
                  onChange={(e) => setNewDietary(e.target.value)}
                  placeholder={tx.addCustomDietary}
                  onKeyPress={(e) => e.key === 'Enter' && addDietary()}
                  className="h-11"
                />
                <Button type="button" onClick={addDietary} size="sm" className="h-11 px-4">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {form.dietary_info.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">{tx.selectedDietary}</Label>
                <div className="flex flex-wrap gap-3">
                  {form.dietary_info.map((dietary) => (
                    <Badge key={dietary} variant="secondary" className="bg-green-50 text-green-700 px-3 py-1.5 text-sm">
                      {dietary}
                      <button
                        type="button"
                        onClick={() => removeDietary(dietary)}
                        className="ml-2 hover:text-green-900 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              {tx.ingredientsTitle}
            </CardTitle>
            <p className="text-sm text-gray-600">{tx.ingredientsDesc}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">{tx.addIngredient}</Label>
              <div className="flex gap-3">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder={tx.addIngredientPlaceholder}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  className="h-11"
                />
                <Button type="button" onClick={addIngredient} size="sm" className="h-11 px-4">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {form.ingredients.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">{tx.ingredientsList}</Label>
                <div className="flex flex-wrap gap-3">
                  {form.ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="outline" className="px-3 py-1.5 text-sm">
                      {ingredient}
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient)}
                        className="ml-2 hover:text-gray-900 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{tx.settings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="is_available" className="text-sm font-medium">{tx.availableForOrder}</Label>
                <p className="text-sm text-gray-600">{tx.availableDesc}</p>
              </div>
              <Switch
                id="is_available"
                checked={form.is_available}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_available: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="is_featured" className="text-sm font-medium">{tx.featuredItem}</Label>
                <p className="text-sm text-gray-600">{tx.featuredDesc}</p>
              </div>
              <Switch
                id="is_featured"
                checked={form.is_featured}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_featured: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel} className="h-11 px-6">
            {tx.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="h-11 px-6">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tx.saving}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? tx.updateItem : tx.addItem}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 