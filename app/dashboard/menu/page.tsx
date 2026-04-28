"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, ChefHat, Eye, EyeOff, Star, Clock, DollarSign, Utensils } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { PageHeader } from "@/components/ui/page-header"
import { Loading } from "@/components/ui/loading"
import { FormattedPrice } from "@/components/ui/formatted-price"
import Image from "next/image"
import AddMenuItemForm from "@/components/menu/add-menu-item-form"
import { useI18n } from "@/components/i18n/i18n-provider"

interface Category {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  menu_items?: MenuItem[]
}

interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  crop_data: any
  allergens: string[] | null
  dietary_info: string[] | null
  ingredients: string[] | null
  preparation_time: number | null
  is_available: boolean
  is_featured: boolean
  display_order: number
}

export default function MenuPage() {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          loading: "Cargando menu...",
          stats: {
            totalCategories: "Total categorias",
            menuItems: "Items del menu",
            featuredItems: "Items destacados",
            highlighted: "Items destacados",
            avgPrice: "Precio medio",
            avgItemPrice: "Precio medio por item",
          },
          tabs: { byCategory: "Por categoria", allItems: "Todos los items" },
          emptyCategoriesTitle: "Aun no hay categorias",
          emptyCategoriesDesc: "Crea tu primera categoria para organizar el menu",
          inactive: "Inactivo",
          deleteCategory: "Eliminar categoria",
          cancel: "Cancelar",
          delete: "Eliminar",
          featured: "Destacado",
          unavailable: "No disponible",
          deleteMenuItem: "Eliminar item del menu",
          noItemsInCategory: "Aun no hay items en esta categoria",
          uncategorizedItems: "Items sin categoria",
          noMenuItemsYet: "Aun no hay items en el menu",
          addFirstItem: "Anade tu primer item para empezar",
          categoryName: "Nombre de categoria",
          descriptionOptional: "Descripcion (opcional)",
          available: "Disponible",
          categoryLabel: "Categoria",
          uncategorized: "Sin categoria",
          addCategory: "Anadir categoria",
          addItems: "Anadir items",
          addItem: "Anadir item",
          addMenuItem: "Anadir item del menu",
          editCategory: "Editar categoria",
          addNewCategory: "Anadir nueva categoria",
          updateCategoryInfo: "Actualizar informacion de la categoria",
          createCategoryHelp: "Crear una nueva categoria para los items del menu",
          create: "Crear",
          update: "Actualizar",
          confirmDeleteCategory: 'Seguro que quieres eliminar "{name}"? Esto tambien eliminara todos los items de esta categoria.',
          confirmDeleteItem: 'Seguro que quieres eliminar "{name}"?',
          statsAvailable: "disponibles",
          alertUpdated: "Item de menu actualizado correctamente",
          alertUpdateError: "Error al actualizar el item de menu. Intentalo de nuevo.",
        }
      : {
          loading: "Loading menu...",
          stats: {
            totalCategories: "Total Categories",
            menuItems: "Menu Items",
            featuredItems: "Featured Items",
            highlighted: "Highlighted items",
            avgPrice: "Avg. Price",
            avgItemPrice: "Average item price",
          },
          tabs: { byCategory: "By Category", allItems: "All Items" },
          emptyCategoriesTitle: "No categories yet",
          emptyCategoriesDesc: "Create your first category to organize your menu items",
          inactive: "Inactive",
          deleteCategory: "Delete Category",
          cancel: "Cancel",
          delete: "Delete",
          featured: "Featured",
          unavailable: "Unavailable",
          deleteMenuItem: "Delete Menu Item",
          noItemsInCategory: "No items in this category yet",
          uncategorizedItems: "Uncategorized Items",
          noMenuItemsYet: "No menu items yet",
          addFirstItem: "Add your first menu item to get started",
          categoryName: "Category Name",
          descriptionOptional: "Description (Optional)",
          available: "Available",
          categoryLabel: "Category",
          uncategorized: "Uncategorized",
          addCategory: "Add Category",
          addItems: "Add Items",
          addItem: "Add Item",
          addMenuItem: "Add Menu Item",
          editCategory: "Edit Category",
          addNewCategory: "Add New Category",
          updateCategoryInfo: "Update category information",
          createCategoryHelp: "Create a new category for your menu items",
          create: "Create",
          update: "Update",
          confirmDeleteCategory: 'Are you sure you want to delete "{name}"? This will also remove all menu items in this category.',
          confirmDeleteItem: 'Are you sure you want to delete "{name}"?',
          statsAvailable: "available",
          alertUpdated: "Menu item updated successfully!",
          alertUpdateError: "Error updating menu item. Please try again.",
        }

  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    is_active: true,
  })

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: null as string | null,
    crop_data: null as any,
    category_id: "uncategorized",
    allergens: "",
    dietary_info: "",
    ingredients: "",
    preparation_time: "",
    is_available: true,
    is_featured: false,
  })

  useEffect(() => {
    fetchMenuData()
  }, [])

  const fetchMenuData = async () => {
    try {
      const { restaurantId: userRestaurantId, restaurant: userRestaurant } = await getCurrentUserRestaurant()
      setRestaurant(userRestaurant)
      setRestaurantId(userRestaurantId)

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", userRestaurantId)
        .order("display_order")

      if (categoriesError) throw categoriesError

      // Fetch menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", userRestaurantId)
        .order("display_order")

      if (itemsError) throw itemsError

      setCategories(categoriesData || [])
      setMenuItems(itemsData || [])
    } catch (error) {
      console.error("Error fetching menu data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!restaurantId || !categoryForm.name.trim()) return

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          restaurant_id: restaurantId,
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || null,
          is_active: categoryForm.is_active,
          display_order: categories.length,
        })
        .select()
        .single()

      if (error) throw error

      setCategories([...categories, data])
      setCategoryForm({ name: "", description: "", is_active: true })
      setCategoryDialogOpen(false)
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) return

    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || null,
          is_active: categoryForm.is_active,
        })
        .eq("id", editingCategory.id)
        .eq("restaurant_id", restaurantId)
        .select()
        .single()

      if (error) throw error

      setCategories(categories.map((cat) => (cat.id === editingCategory.id ? data : cat)))
      setEditingCategory(null)
      setCategoryForm({ name: "", description: "", is_active: true })
      setCategoryDialogOpen(false)
    } catch (error) {
      console.error("Error updating category:", error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!restaurantId) return

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId)
        .eq("restaurant_id", restaurantId)

      if (error) throw error

      setCategories(categories.filter((cat) => cat.id !== categoryId))
      // Also remove menu items from this category
      setMenuItems(menuItems.filter((item) => item.category_id !== categoryId))
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleUpdateMenuItem = async () => {
    if (!editingItem || !itemForm.name.trim() || !itemForm.price) return

    try {
      const { data, error } = await supabase
        .from("menu_items")
        .update({
          category_id: itemForm.category_id === "uncategorized" ? null : itemForm.category_id,
          name: itemForm.name.trim(),
          description: itemForm.description.trim() || null,
          price: Number.parseFloat(itemForm.price),
          allergens: itemForm.allergens ? itemForm.allergens.split(",").map((s) => s.trim()) : null,
          dietary_info: itemForm.dietary_info ? itemForm.dietary_info.split(",").map((s) => s.trim()) : null,
          ingredients: itemForm.ingredients ? itemForm.ingredients.split(",").map((s) => s.trim()) : null,
          preparation_time: itemForm.preparation_time ? Number.parseInt(itemForm.preparation_time) : null,
          is_available: itemForm.is_available,
          is_featured: itemForm.is_featured,
        })
        .eq("id", editingItem.id)
        .eq("restaurant_id", restaurantId)
        .select()
        .single()

      if (error) throw error

      setMenuItems(menuItems.map((item) => (item.id === editingItem.id ? data : item)))
      
      // Reset form and close modal
      setEditingItem(null)
      setItemForm({
        name: "",
        description: "",
        price: "",
        category_id: "uncategorized",
        allergens: "",
        dietary_info: "",
        ingredients: "",
        preparation_time: "",
        is_available: true,
        is_featured: false,
      })
      setShowAddItemForm(false)
      
      // Show success message
      alert(tx.alertUpdated)
    } catch (error) {
      console.error("Error updating menu item:", error)
      alert(tx.alertUpdateError)
    }
  }

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!restaurantId) return

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", itemId).eq("restaurant_id", restaurantId)

      if (error) throw error

      setMenuItems(menuItems.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting menu item:", error)
    }
  }

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    if (!restaurantId) return

    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: isAvailable })
        .eq("id", itemId)
        .eq("restaurant_id", restaurantId)

      if (error) throw error

      setMenuItems(menuItems.map((item) => (item.id === itemId ? { ...item, is_available: isAvailable } : item)))
    } catch (error) {
      console.error("Error toggling item availability:", error)
    }
  }

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description || "",
        is_active: category.is_active,
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: "", description: "", is_active: true })
    }
    setCategoryDialogOpen(true)
  }

  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        image_url: item.image_url,
        crop_data: item.crop_data,
        category_id: item.category_id || "uncategorized",
        allergens: item.allergens?.join(", ") || "",
        dietary_info: item.dietary_info?.join(", ") || "",
        ingredients: item.ingredients?.join(", ") || "",
        preparation_time: item.preparation_time?.toString() || "",
        is_available: item.is_available,
        is_featured: item.is_featured,
      })
    } else {
      setEditingItem(null)
      setItemForm({
        name: "",
        description: "",
        price: "",
        image_url: null,
        crop_data: null,
        category_id: "uncategorized",
        allergens: "",
        dietary_info: "",
        ingredients: "",
        preparation_time: "",
        is_available: true,
        is_featured: false,
      })
    }
    setShowAddItemForm(true)
  }

  const closeItemDialog = () => {
    setShowAddItemForm(false)
    setEditingItem(null)
    setItemForm({
      name: "",
      description: "",
      price: "",
      image_url: null,
      crop_data: null,
      category_id: "uncategorized",
      allergens: "",
      dietary_info: "",
      ingredients: "",
      preparation_time: "",
      is_available: true,
      is_featured: false,
    })
  }

  const handleItemSuccess = () => {
    fetchMenuData() // Refresh the menu data
    setShowAddItemForm(false)
  }

  const getItemsByCategory = (categoryId: string | null) => {
    return menuItems.filter((item) => item.category_id === categoryId)
  }

  if (loading) {
    return <Loading text={tx.loading} />
  }

  return (
    <div className="space-y-6">
      {/* Minimalist Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-50 border border-orange-100 rounded-lg">
              <Utensils className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Menu
              </h1>
              <p className="text-gray-500 text-sm">
                Create and manage your restaurant's menu
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => openCategoryDialog()}
              variant="outline"
              className="border border-gray-200 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {tx.addCategory}
            </Button>
            <Button 
              onClick={() => openItemDialog()}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {tx.addItems}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.stats.totalCategories}</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">{categories.filter((c) => c.is_active).length} {tx.statsAvailable}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.stats.menuItems}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-muted-foreground">{menuItems.filter((i) => i.is_available).length} {tx.statsAvailable}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.stats.featuredItems}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.filter((i) => i.is_featured).length}</div>
            <p className="text-xs text-muted-foreground">{tx.stats.highlighted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.stats.avgPrice}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedPrice amount={menuItems.length > 0 ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length : 0} restaurantId={restaurantId || undefined} />
            </div>
            <p className="text-xs text-muted-foreground">{tx.stats.avgItemPrice}</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Content */}
      <Tabs defaultValue="by-category" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-category">{tx.tabs.byCategory}</TabsTrigger>
          <TabsTrigger value="all-items">{tx.tabs.allItems}</TabsTrigger>
        </TabsList>

        <TabsContent value="by-category" className="space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tx.emptyCategoriesTitle}</h3>
                <p className="text-gray-500 mb-4">{tx.emptyCategoriesDesc}</p>
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tx.addCategory}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{category.name}</span>
                          {!category.is_active && <Badge variant="secondary">{tx.inactive}</Badge>}
                        </CardTitle>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openCategoryDialog(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{tx.deleteCategory}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {tx.confirmDeleteCategory.replace("{name}", category.name)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{tx.cancel}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                {tx.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {getItemsByCategory(category.id).map((item) => (
                        <Card key={item.id} className="relative h-full">
                          <CardContent className="p-4 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                {item.is_featured && (
                                  <div className="flex items-center mt-1">
                                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                    <span className="text-xs text-yellow-600 font-medium">{tx.featured}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleItemAvailability(item.id, !item.is_available)}
                                  className="h-8 w-8 p-0"
                                >
                                  {item.is_available ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-lg font-bold text-green-600">
                                <FormattedPrice amount={item.price} restaurantId={restaurantId || undefined} />
                              </span>
                              {item.preparation_time && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {item.preparation_time}min
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-start mt-auto">
                              <div className="flex-1 min-w-0">
                                {/* Dietary Info Badges */}
                                {item.dietary_info && item.dietary_info.filter((info) => info !== 'none').length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {item.dietary_info
                                      .filter((info) => info !== 'none')
                                      .slice(0, 2)
                                      .map((info) => (
                                        <Badge key={info} variant="outline" className="text-xs px-2 py-0.5">
                                          {info}
                                        </Badge>
                                      ))}
                                    {item.dietary_info.filter((info) => info !== 'none').length > 2 && (
                                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                        +{item.dietary_info.filter((info) => info !== 'none').length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                {/* Allergens Badges */}
                                {item.allergens && item.allergens.filter((allergen) => allergen !== 'none').length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.allergens
                                      .filter((allergen) => allergen !== 'none')
                                      .slice(0, 1)
                                      .map((allergen) => (
                                        <Badge key={allergen} variant="destructive" className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border-red-200">
                                          {allergen}
                                        </Badge>
                                      ))}
                                    {item.allergens.filter((allergen) => allergen !== 'none').length > 1 && (
                                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                        +{item.allergens.filter((allergen) => allergen !== 'none').length - 1}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                {/* Unavailable Badge */}
                                {!item.is_available && (
                                  <div className="mt-2">
                                    <Badge variant="secondary" className="text-xs">{tx.unavailable}</Badge>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-1 ml-2 flex-shrink-0">
                                <Button variant="outline" size="sm" onClick={() => openItemDialog(item)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{tx.deleteMenuItem}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {tx.confirmDeleteItem.replace("{name}", item.name)}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{tx.cancel}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteMenuItem(item.id)}>
                                        {tx.delete}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {getItemsByCategory(category.id).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>{tx.noItemsInCategory}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => openItemDialog()}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          {tx.addItem}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Uncategorized Items */}
              {getItemsByCategory(null).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{tx.uncategorizedItems}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {getItemsByCategory(null).map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              <div className="flex items-center space-x-1">
                                {item.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleItemAvailability(item.id, !item.is_available)}
                                >
                                  {item.is_available ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-lg font-bold text-green-600">
                                <FormattedPrice amount={item.price} restaurantId={restaurantId || undefined} />
                              </span>
                              {item.preparation_time && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {item.preparation_time}min
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-xs text-gray-500">
                                {tx.categoryLabel}: {categories.find((c) => c.id === item.category_id)?.name || tx.uncategorized}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                {!item.is_available && <Badge variant="secondary">{tx.unavailable}</Badge>}
                                {item.dietary_info?.filter((info) => info !== 'none').map((info) => (
                                  <Badge key={info} variant="outline" className="text-xs">
                                    {info}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex space-x-1">
                                <Button variant="outline" size="sm" onClick={() => openItemDialog(item)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{tx.deleteMenuItem}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {tx.confirmDeleteItem.replace("{name}", item.name)}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{tx.cancel}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteMenuItem(item.id)}>
                                        {tx.delete}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="all-items" className="space-y-4">
          {menuItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tx.noMenuItemsYet}</h3>
                <p className="text-gray-500 mb-4">{tx.addFirstItem}</p>
                <Button onClick={() => openItemDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tx.addMenuItem}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item.id} className="h-full">
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* Header with name and status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                        {item.is_featured && (
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-yellow-600 font-medium">{tx.featured}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemAvailability(item.id, !item.is_available)}
                          className="h-8 w-8 p-0"
                        >
                          {item.is_available ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Dish Image */}
                    {item.image_url && (
                      <div className="mb-3">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    )}
                    
                    {/* Price and preparation time */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-green-600">
                        <FormattedPrice amount={item.price} restaurantId={restaurantId || undefined} />
                      </span>
                      {item.preparation_time && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.preparation_time}min
                        </div>
                      )}
                    </div>
                    
                    {/* Category */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500">
                        {tx.categoryLabel}: {categories.find((c) => c.id === item.category_id)?.name || tx.uncategorized}
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {/* Dietary Info Badges */}
                        {item.dietary_info && item.dietary_info.filter((info) => info !== 'none').length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.dietary_info
                              .filter((info) => info !== 'none')
                              .slice(0, 3)
                              .map((info) => (
                                <Badge key={info} variant="outline" className="text-xs px-2 py-0.5">
                                  {info}
                                </Badge>
                              ))}
                            {item.dietary_info.filter((info) => info !== 'none').length > 3 && (
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                +{item.dietary_info.filter((info) => info !== 'none').length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Allergens Badges */}
                        {item.allergens && item.allergens.filter((allergen) => allergen !== 'none').length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.allergens
                              .filter((allergen) => allergen !== 'none')
                              .slice(0, 2)
                              .map((allergen) => (
                                <Badge key={allergen} variant="destructive" className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border-red-200">
                                  {allergen}
                                </Badge>
                              ))}
                            {item.allergens.filter((allergen) => allergen !== 'none').length > 2 && (
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                +{item.allergens.filter((allergen) => allergen !== 'none').length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Unavailable Badge */}
                        {!item.is_available && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">{tx.unavailable}</Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-1 ml-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => openItemDialog(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{tx.deleteMenuItem}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {tx.confirmDeleteItem.replace("{name}", item.name)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{tx.cancel}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMenuItem(item.id)}>
                                {tx.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="rounded-2xl border-border bg-card shadow-[0_28px_70px_-30px_rgba(0,0,0,0.6)]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? tx.editCategory : tx.addNewCategory}</DialogTitle>
            <DialogDescription>
              {editingCategory ? tx.updateCategoryInfo : tx.createCategoryHelp}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">{tx.categoryName}</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Appetizers, Main Courses, Desserts"
              />
            </div>
            <div>
              <Label htmlFor="category-description">{tx.descriptionOptional}</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief description of this category"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="category-active"
                checked={categoryForm.is_active}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
              />
              <Label htmlFor="category-active">{tx.available}</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                {tx.cancel}
              </Button>
              <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                {editingCategory ? tx.update : tx.create} {tx.categoryLabel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Menu Item Form */}
      {showAddItemForm && restaurantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-[0_28px_70px_-30px_rgba(0,0,0,0.6)]">
            <AddMenuItemForm
              restaurantId={restaurantId}
              onSuccess={handleItemSuccess}
              onCancel={closeItemDialog}
              editingItem={editingItem}
            />
          </div>
        </div>
      )}
    </div>
  )
}
