"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  X, 
  Upload, 
  Download,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Copy,
  Trash2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/components/i18n/i18n-provider"

interface Category {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
}

interface BulkMenuItem {
  name: string
  description: string
  price: string
  category_id: string
  preparation_time: string
  is_available: boolean
  is_featured: boolean
}

interface BulkAddMenuItemsProps {
  restaurantId: string
  onSuccess: () => void
  onCancel: () => void
}

const SAMPLE_CSV = `Name,Description,Price,Category,Preparation Time (min),Available,Featured
Margherita Pizza,Classic pizza with tomato sauce and mozzarella,16.99,Main Courses,20,true,true
Caesar Salad,Fresh romaine lettuce with Caesar dressing,12.99,Appetizers,10,true,false
Tiramisu,Italian dessert with coffee and mascarpone,9.99,Desserts,5,true,true`

export default function BulkAddMenuItems({ restaurantId, onSuccess, onCancel }: BulkAddMenuItemsProps) {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          requiredName: "El nombre es obligatorio",
          requiredPrice: "El precio es obligatorio",
          pricePositive: "El precio debe ser mayor que cero",
          requiredCategory: "La categoria es obligatoria",
          header: "Anadir items en bloque",
          subtitle: "Anade varios platos al menu rapidamente",
          cancel: "Cancelar",
          importExport: "Opciones de importar/exportar",
          loadSample: "Cargar ejemplo",
          exportCsv: "Exportar CSV",
          importCsv: "Importar CSV",
          csvData: "Datos CSV (pega aqui tu CSV)",
          csvPlaceholder: "Pega aqui los datos CSV...",
          successCreated: "Se han creado {count} items del menu",
          item: "Item",
          available: "Disponible",
          featured: "Destacado",
          name: "Nombre *",
          dishName: "Nombre del plato",
          price: "Precio *",
          category: "Categoria *",
          selectCategory: "Seleccionar categoria",
          prepTime: "Tiempo de preparacion (minutos)",
          description: "Descripcion",
          describeDish: "Describe el plato...",
          addAnother: "Anadir otro item",
          creating: "Creando items...",
          createN: "Crear {count} items",
        }
      : {
          requiredName: "Name is required",
          requiredPrice: "Price is required",
          pricePositive: "Price must be a positive number",
          requiredCategory: "Category is required",
          header: "Bulk Add Menu Items",
          subtitle: "Add multiple dishes to your menu quickly",
          cancel: "Cancel",
          importExport: "Import/Export Options",
          loadSample: "Load Sample",
          exportCsv: "Export CSV",
          importCsv: "Import CSV",
          csvData: "CSV Data (Paste your CSV here)",
          csvPlaceholder: "Paste CSV data here...",
          successCreated: "Successfully created {count} menu items!",
          item: "Item",
          available: "Available",
          featured: "Featured",
          name: "Name *",
          dishName: "Dish name",
          price: "Price *",
          category: "Category *",
          selectCategory: "Select category",
          prepTime: "Preparation Time (minutes)",
          description: "Description",
          describeDish: "Describe the dish...",
          addAnother: "Add Another Item",
          creating: "Creating Items...",
          createN: "Create {count} Items",
        }
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<BulkMenuItem[]>([
    {
      name: '',
      description: '',
      price: '',
      category_id: '',
      preparation_time: '',
      is_available: true,
      is_featured: false
    }
  ])
  const [csvData, setCsvData] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successCount, setSuccessCount] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const addItem = () => {
    setItems(prev => [...prev, {
      name: '',
      description: '',
      price: '',
      category_id: '',
      preparation_time: '',
      is_available: true,
      is_featured: false
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof BulkMenuItem, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const validateItems = () => {
    const newErrors: Record<string, string> = {}
    
    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`${index}-name`] = tx.requiredName
      }
      if (!item.price.trim()) {
        newErrors[`${index}-price`] = tx.requiredPrice
      } else if (isNaN(Number(item.price)) || Number(item.price) <= 0) {
        newErrors[`${index}-price`] = tx.pricePositive
      }
      if (!item.category_id) {
        newErrors[`${index}-category`] = tx.requiredCategory
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateItems()) return

    setSaving(true)
    setSuccessCount(0)

    try {
      const validItems = items.filter(item => 
        item.name.trim() && item.price.trim() && item.category_id
      )

      for (const item of validItems) {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            restaurant_id: restaurantId,
            name: item.name.trim(),
            description: item.description.trim() || null,
            price: Number(item.price),
            category_id: item.category_id,
            preparation_time: item.preparation_time ? Number(item.preparation_time) : null,
            is_available: item.is_available,
            is_featured: item.is_featured,
            display_order: 0
          })

        if (error) {
          console.error(`Error creating item ${item.name}:`, error)
        } else {
          setSuccessCount(prev => prev + 1)
        }
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error creating menu items:', error)
      setErrors({ submit: error.message })
    } finally {
      setSaving(false)
    }
  }

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const data = lines.slice(1)

    const parsedItems: BulkMenuItem[] = data.map(line => {
      const values = line.split(',').map(v => v.trim())
      const item: any = {
        name: values[0] || '',
        description: values[1] || '',
        price: values[2] || '',
        category_id: '',
        preparation_time: values[4] || '',
        is_available: values[5] === 'true',
        is_featured: values[6] === 'true'
      }

      // Find category by name
      const categoryName = values[3] || ''
      const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
      item.category_id = category?.id || ''

      return item
    })

    setItems(parsedItems)
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Description', 'Price', 'Category', 'Preparation Time (min)', 'Available', 'Featured']
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.name,
        item.description,
        item.price,
        categories.find(c => c.id === item.category_id)?.name || '',
        item.preparation_time,
        item.is_available,
        item.is_featured
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'menu-items.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{tx.header}</h2>
          <p className="text-gray-600 mt-1">{tx.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {tx.cancel}
          </Button>
        </div>
      </div>

      {/* CSV Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>{tx.importExport}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => setCsvData(SAMPLE_CSV)}>
              <Copy className="h-4 w-4 mr-2" />
              {tx.loadSample}
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              {tx.exportCsv}
            </Button>
            <Button variant="outline" onClick={() => parseCSV(csvData)}>
              <Upload className="h-4 w-4 mr-2" />
              {tx.importCsv}
            </Button>
          </div>
          
          <div>
            <Label>{tx.csvData}</Label>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder={tx.csvPlaceholder}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">{errors.submit}</span>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-700">{tx.successCreated.replace("{count}", String(successCount))}</span>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tx.item} {index + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={(checked) => updateItem(index, 'is_available', checked)}
                  />
                  <span className="text-sm text-gray-600">{tx.available}</span>
                  <Switch
                    checked={item.is_featured}
                    onCheckedChange={(checked) => updateItem(index, 'is_featured', checked)}
                  />
                  <span className="text-sm text-gray-600">{tx.featured}</span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>{tx.name}</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder={tx.dishName}
                    className={errors[`${index}-name`] ? 'border-red-500' : ''}
                  />
                  {errors[`${index}-name`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`${index}-name`]}</p>
                  )}
                </div>

                <div>
                  <Label>{tx.price}</Label>
                  <Input
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    placeholder="0.00"
                    className={errors[`${index}-price`] ? 'border-red-500' : ''}
                  />
                  {errors[`${index}-price`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`${index}-price`]}</p>
                  )}
                </div>

                <div>
                  <Label>{tx.category}</Label>
                  <Select value={item.category_id} onValueChange={(value) => updateItem(index, 'category_id', value)}>
                    <SelectTrigger className={errors[`${index}-category`] ? 'border-red-500' : ''}>
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
                  {errors[`${index}-category`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`${index}-category`]}</p>
                  )}
                </div>

                <div>
                  <Label>{tx.prepTime}</Label>
                  <Input
                    value={item.preparation_time}
                    onChange={(e) => updateItem(index, 'preparation_time', e.target.value)}
                    placeholder="15"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <Label>{tx.description}</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder={tx.describeDish}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Item Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          {tx.addAnother}
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          {tx.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tx.creating}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {tx.createN.replace("{count}", String(items.length))}
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 