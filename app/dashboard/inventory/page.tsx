"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Edit, Trash2, Package, AlertTriangle, DollarSign, Search, RefreshCw, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { Loading } from "@/components/ui/loading"
import { PageHeader } from "@/components/ui/page-header"
import { FormattedPrice } from "@/components/ui/formatted-price"
import { useI18n } from "@/components/i18n/i18n-provider"

interface InventoryItem {
  id: string
  restaurant_id: string
  name: string
  unit: string
  current_stock: number
  minimum_stock: number
  cost_per_unit: number | null
  supplier: string | null
  last_restocked: string | null
  created_at: string
  updated_at: string
}

export default function InventoryPage() {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          loading: "Cargando inventario...",
          title: "Inventario",
          subtitle: "Controla y gestiona el inventario del restaurante",
          addItem: "Anadir articulo",
          totalItems: "Total articulos",
          itemsInInventory: "Articulos en inventario",
          lowStockAlerts: "Alertas de stock bajo",
          needRestock: "Articulos para reponer",
          outOfStock: "Sin stock",
          outItems: "Articulos agotados",
          totalValue: "Valor total",
          currentValue: "Valor actual de inventario",
          filters: "Filtros",
          searchItems: "Buscar articulos",
          searchPh: "Buscar por nombre o proveedor...",
          stockStatus: "Estado de stock",
          allItems: "Todos",
          inStock: "En stock",
          lowStock: "Stock bajo",
          noItemsYet: "Todavia no hay articulos",
          noItemsFound: "No se encontraron articulos",
          addFirst: "Anade tu primer articulo para empezar",
          adjustFilters: "Prueba a cambiar los filtros",
          currentStock: "Stock actual",
          minimumStock: "Stock minimo",
          costPerUnit: "Coste por unidad",
          supplier: "Proveedor",
          notSet: "No definido",
          notSpecified: "No especificado",
          lastRestocked: "Ultima reposicion",
          totalValueItem: "Valor total",
          restock: "Reponer",
          deleteTitle: "Eliminar articulo",
          deleteDesc: "¿Seguro que quieres eliminar \"{name}\"? Esta accion no se puede deshacer.",
          cancel: "Cancelar",
          delete: "Eliminar",
          editTitle: "Editar articulo de inventario",
          addTitle: "Anadir nuevo articulo de inventario",
          editDesc: "Actualiza la informacion del articulo",
          addDesc: "Anade un nuevo articulo al inventario",
          itemName: "Nombre del articulo",
          unit: "Unidad",
          kilograms: "Kilogramos (kg)",
          grams: "Gramos (g)",
          liters: "Litros (l)",
          milliliters: "Mililitros (ml)",
          pieces: "Piezas (pcs)",
          boxes: "Cajas",
          cans: "Latas",
          bottles: "Botellas",
          supplierName: "Nombre del proveedor",
          update: "Actualizar",
          add: "Anadir",
          itemWord: "articulo",
          restockTitle: "Reponer articulo",
          quantityToAdd: "Cantidad a anadir",
          notesOptional: "Notas (opcional)",
          notesPlaceholder: "Cualquier nota adicional sobre esta reposicion",
          newStockLevel: "Nuevo nivel de stock",
          totalCost: "Coste total",
          restockItem: "Reponer articulo",
        }
      : {
          loading: "Loading inventory...",
          title: "Inventory",
          subtitle: "Monitor and manage your restaurant's inventory",
          addItem: "Add Item",
          totalItems: "Total Items",
          itemsInInventory: "Items in inventory",
          lowStockAlerts: "Low Stock Alerts",
          needRestock: "Items need restocking",
          outOfStock: "Out of Stock",
          outItems: "Items completely out",
          totalValue: "Total Value",
          currentValue: "Current inventory value",
          filters: "Filters",
          searchItems: "Search Items",
          searchPh: "Search by item name or supplier...",
          stockStatus: "Stock Status",
          allItems: "All Items",
          inStock: "In Stock",
          lowStock: "Low Stock",
          noItemsYet: "No inventory items yet",
          noItemsFound: "No items found",
          addFirst: "Add your first inventory item to get started",
          adjustFilters: "Try adjusting your filters",
          currentStock: "Current Stock",
          minimumStock: "Minimum Stock",
          costPerUnit: "Cost per Unit",
          supplier: "Supplier",
          notSet: "Not set",
          notSpecified: "Not specified",
          lastRestocked: "Last restocked",
          totalValueItem: "Total Value",
          restock: "Restock",
          deleteTitle: "Delete Inventory Item",
          deleteDesc: "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
          cancel: "Cancel",
          delete: "Delete",
          editTitle: "Edit Inventory Item",
          addTitle: "Add New Inventory Item",
          editDesc: "Update inventory item information",
          addDesc: "Add a new item to your inventory",
          itemName: "Item Name",
          unit: "Unit",
          kilograms: "Kilograms (kg)",
          grams: "Grams (g)",
          liters: "Liters (l)",
          milliliters: "Milliliters (ml)",
          pieces: "Pieces (pcs)",
          boxes: "Boxes",
          cans: "Cans",
          bottles: "Bottles",
          supplierName: "Supplier name",
          update: "Update",
          add: "Add",
          itemWord: "Item",
          restockTitle: "Restock Item",
          quantityToAdd: "Quantity to Add",
          notesOptional: "Notes (Optional)",
          notesPlaceholder: "Any additional notes about this restock",
          newStockLevel: "New Stock Level",
          totalCost: "Total Cost",
          restockItem: "Restock Item",
        }
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null)

  // Form states
  const [itemForm, setItemForm] = useState({
    name: "",
    unit: "kg",
    current_stock: "",
    minimum_stock: "",
    cost_per_unit: "",
    supplier: "",
  })

  const [restockForm, setRestockForm] = useState({
    quantity: "",
    cost_per_unit: "",
    supplier: "",
    notes: "",
  })

  useEffect(() => {
    fetchInventoryData()
  }, [])

  useEffect(() => {
    filterItems()
  }, [inventoryItems, searchTerm, statusFilter])

  const fetchInventoryData = async () => {
    try {
      const { restaurantId: userRestaurantId, restaurant: userRestaurant } = await getCurrentUserRestaurant()
      setRestaurant(userRestaurant)
      setRestaurantId(userRestaurantId)

      // Fetch inventory items
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("restaurant_id", userRestaurantId)
        .order("name")

      if (error) throw error
      setInventoryItems(data || [])
    } catch (error) {
      console.error("Error fetching inventory data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = inventoryItems

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "low-stock") {
        filtered = filtered.filter((item) => item.current_stock <= item.minimum_stock)
      } else if (statusFilter === "out-of-stock") {
        filtered = filtered.filter((item) => item.current_stock === 0)
      } else if (statusFilter === "in-stock") {
        filtered = filtered.filter((item) => item.current_stock > item.minimum_stock)
      }
    }

    setFilteredItems(filtered)
  }

  const handleCreateItem = async () => {
    if (!restaurantId || !itemForm.name.trim()) return

    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .insert({
          restaurant_id: restaurantId,
          name: itemForm.name.trim(),
          unit: itemForm.unit,
          current_stock: Number.parseFloat(itemForm.current_stock) || 0,
          minimum_stock: Number.parseFloat(itemForm.minimum_stock) || 0,
          cost_per_unit: itemForm.cost_per_unit ? Number.parseFloat(itemForm.cost_per_unit) : null,
          supplier: itemForm.supplier.trim() || null,
        })
        .select()
        .single()

      if (error) throw error

      setInventoryItems([...inventoryItems, data])
      setItemForm({
        name: "",
        unit: "kg",
        current_stock: "",
        minimum_stock: "",
        cost_per_unit: "",
        supplier: "",
      })
      setItemDialogOpen(false)
    } catch (error) {
      console.error("Error creating inventory item:", error)
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !itemForm.name.trim()) return

    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .update({
          name: itemForm.name.trim(),
          unit: itemForm.unit,
          current_stock: Number.parseFloat(itemForm.current_stock) || 0,
          minimum_stock: Number.parseFloat(itemForm.minimum_stock) || 0,
          cost_per_unit: itemForm.cost_per_unit ? Number.parseFloat(itemForm.cost_per_unit) : null,
          supplier: itemForm.supplier.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingItem.id)
        .eq("restaurant_id", restaurantId)
        .select()
        .single()

      if (error) throw error

      setInventoryItems(inventoryItems.map((item) => (item.id === editingItem.id ? data : item)))
      setEditingItem(null)
      setItemForm({
        name: "",
        unit: "kg",
        current_stock: "",
        minimum_stock: "",
        cost_per_unit: "",
        supplier: "",
      })
      setItemDialogOpen(false)
    } catch (error) {
      console.error("Error updating inventory item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!restaurantId) return

    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", itemId)
        .eq("restaurant_id", restaurantId)

      if (error) throw error

      setInventoryItems(inventoryItems.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting inventory item:", error)
    }
  }

  const handleRestock = async () => {
    if (!restockingItem || !restockForm.quantity) return

    try {
      const newStock = restockingItem.current_stock + Number.parseFloat(restockForm.quantity)
      const newCostPerUnit = restockForm.cost_per_unit
        ? Number.parseFloat(restockForm.cost_per_unit)
        : restockingItem.cost_per_unit

      const { data, error } = await supabase
        .from("inventory_items")
        .update({
          current_stock: newStock,
          cost_per_unit: newCostPerUnit,
          supplier: restockForm.supplier.trim() || restockingItem.supplier,
          last_restocked: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", restockingItem.id)
        .eq("restaurant_id", restaurantId)
        .select()
        .single()

      if (error) throw error

      setInventoryItems(inventoryItems.map((item) => (item.id === restockingItem.id ? data : item)))
      setRestockingItem(null)
      setRestockForm({
        quantity: "",
        cost_per_unit: "",
        supplier: "",
        notes: "",
      })
      setRestockDialogOpen(false)
    } catch (error) {
      console.error("Error restocking item:", error)
    }
  }

  const openItemDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        name: item.name,
        unit: item.unit,
        current_stock: item.current_stock.toString(),
        minimum_stock: item.minimum_stock.toString(),
        cost_per_unit: item.cost_per_unit?.toString() || "",
        supplier: item.supplier || "",
      })
    } else {
      setEditingItem(null)
      setItemForm({
        name: "",
        unit: "kg",
        current_stock: "",
        minimum_stock: "",
        cost_per_unit: "",
        supplier: "",
      })
    }
    setItemDialogOpen(true)
  }

  const openRestockDialog = (item: InventoryItem) => {
    setRestockingItem(item)
    setRestockForm({
      quantity: "",
      cost_per_unit: item.cost_per_unit?.toString() || "",
      supplier: item.supplier || "",
      notes: "",
    })
    setRestockDialogOpen(true)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return { status: "out-of-stock", color: "bg-red-100 text-red-800", label: tx.outOfStock }
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: "low-stock", color: "bg-yellow-100 text-yellow-800", label: tx.lowStock }
    } else {
      return { status: "in-stock", color: "bg-green-100 text-green-800", label: tx.inStock }
    }
  }

  const getTotalValue = () => {
    return inventoryItems.reduce((total, item) => {
      return total + item.current_stock * (item.cost_per_unit || 0)
    }, 0)
  }

  const getLowStockCount = () => {
    return inventoryItems.filter((item) => item.current_stock <= item.minimum_stock).length
  }

  const getOutOfStockCount = () => {
    return inventoryItems.filter((item) => item.current_stock === 0).length
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
            <div className="flex items-center justify-center w-10 h-10 bg-teal-50 border border-teal-100 rounded-lg">
              <Package className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {tx.title}
              </h1>
              <p className="text-gray-500 text-sm">
                {tx.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => openItemDialog()}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {tx.addItem}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.totalItems}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">{tx.itemsInInventory}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.lowStockAlerts}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getLowStockCount()}</div>
            <p className="text-xs text-muted-foreground">{tx.needRestock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.outOfStock}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getOutOfStockCount()}</div>
            <p className="text-xs text-muted-foreground">{tx.outItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.totalValue}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <FormattedPrice amount={getTotalValue()} restaurantId={restaurantId || undefined} />
            </div>
            <p className="text-xs text-muted-foreground">{tx.currentValue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tx.filters}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">{tx.searchItems}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder={tx.searchPh}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">{tx.stockStatus}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={tx.allItems} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tx.allItems}</SelectItem>
                  <SelectItem value="in-stock">{tx.inStock}</SelectItem>
                  <SelectItem value="low-stock">{tx.lowStock}</SelectItem>
                  <SelectItem value="out-of-stock">{tx.outOfStock}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {inventoryItems.length === 0 ? tx.noItemsYet : tx.noItemsFound}
              </h3>
              <p className="text-gray-500 mb-4">
                {inventoryItems.length === 0
                  ? tx.addFirst
                  : tx.adjustFilters}
              </p>
              {inventoryItems.length === 0 && (
                <Button onClick={() => openItemDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tx.addItem}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item)
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">{tx.currentStock}:</span>
                            <p className="text-lg font-bold text-gray-900">
                              {item.current_stock} {item.unit}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium">{tx.minimumStock}:</span>
                            <p>
                              {item.minimum_stock} {item.unit}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium">{tx.costPerUnit}:</span>
                            <p>
                              {item.cost_per_unit ? (
                                <FormattedPrice amount={item.cost_per_unit} restaurantId={restaurantId || undefined} />
                              ) : tx.notSet}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium">{tx.supplier}:</span>
                            <p>{item.supplier || tx.notSpecified}</p>
                          </div>
                        </div>

                        {item.last_restocked && (
                          <div className="mt-2 text-xs text-gray-500">
                            <Calendar className="inline w-3 h-3 mr-1" />
                            {tx.lastRestocked}: {new Date(item.last_restocked).toLocaleDateString(locale === "es-ES" ? "es-ES" : "en-US")}
                          </div>
                        )}

                        {item.cost_per_unit && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-green-600">
                              {tx.totalValueItem}: <FormattedPrice amount={item.current_stock * item.cost_per_unit} restaurantId={restaurantId || undefined} />
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRestockDialog(item)}
                          className="bg-transparent"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {tx.restock}
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => openItemDialog(item)}>
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
                              <AlertDialogTitle>{tx.deleteTitle}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {tx.deleteDesc.replace("{name}", item.name)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{tx.cancel}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>{tx.delete}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-border bg-card shadow-[0_28px_70px_-30px_rgba(0,0,0,0.6)]">
          <DialogHeader>
            <DialogTitle>{editingItem ? tx.editTitle : tx.addTitle}</DialogTitle>
            <DialogDescription>
              {editingItem ? tx.editDesc : tx.addDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name">{tx.itemName}</Label>
                <Input
                  id="item-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g., Tomatoes, Flour, Olive Oil"
                />
              </div>
              <div>
                <Label htmlFor="item-unit">{tx.unit}</Label>
                <Select value={itemForm.unit} onValueChange={(value) => setItemForm({ ...itemForm, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">{tx.kilograms}</SelectItem>
                    <SelectItem value="g">{tx.grams}</SelectItem>
                    <SelectItem value="l">{tx.liters}</SelectItem>
                    <SelectItem value="ml">{tx.milliliters}</SelectItem>
                    <SelectItem value="pcs">{tx.pieces}</SelectItem>
                    <SelectItem value="boxes">{tx.boxes}</SelectItem>
                    <SelectItem value="cans">{tx.cans}</SelectItem>
                    <SelectItem value="bottles">{tx.bottles}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-stock">{tx.currentStock}</Label>
                <Input
                  id="current-stock"
                  type="number"
                  step="0.01"
                  value={itemForm.current_stock}
                  onChange={(e) => setItemForm({ ...itemForm, current_stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minimum-stock">{tx.minimumStock}</Label>
                <Input
                  id="minimum-stock"
                  type="number"
                  step="0.01"
                  value={itemForm.minimum_stock}
                  onChange={(e) => setItemForm({ ...itemForm, minimum_stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost-per-unit">{tx.costPerUnit} ($)</Label>
                <Input
                  id="cost-per-unit"
                  type="number"
                  step="0.01"
                  value={itemForm.cost_per_unit}
                  onChange={(e) => setItemForm({ ...itemForm, cost_per_unit: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="supplier">{tx.supplier}</Label>
                <Input
                  id="supplier"
                  value={itemForm.supplier}
                  onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
                  placeholder={tx.supplierName}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingItem ? handleUpdateItem : handleCreateItem}>
                {editingItem ? tx.update : tx.add} {tx.itemWord}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="rounded-2xl border-border bg-card shadow-[0_28px_70px_-30px_rgba(0,0,0,0.6)]">
          <DialogHeader>
            <DialogTitle>{tx.restockTitle}</DialogTitle>
            <DialogDescription>
              Add stock to "{restockingItem?.name}" - Current: {restockingItem?.current_stock} {restockingItem?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restock-quantity">{tx.quantityToAdd}</Label>
              <Input
                id="restock-quantity"
                type="number"
                step="0.01"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="restock-cost">{tx.costPerUnit} ($)</Label>
              <Input
                id="restock-cost"
                type="number"
                step="0.01"
                value={restockForm.cost_per_unit}
                onChange={(e) => setRestockForm({ ...restockForm, cost_per_unit: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="restock-supplier">{tx.supplier}</Label>
              <Input
                id="restock-supplier"
                value={restockForm.supplier}
                onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>

            <div>
              <Label htmlFor="restock-notes">{tx.notesOptional}</Label>
              <Textarea
                id="restock-notes"
                value={restockForm.notes}
                onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                placeholder={tx.notesPlaceholder}
              />
            </div>

            {restockForm.quantity && restockingItem && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{tx.newStockLevel}:</strong>{" "}
                  {restockingItem.current_stock + Number.parseFloat(restockForm.quantity)} {restockingItem.unit}
                </p>
                {restockForm.cost_per_unit && (
                  <p className="text-sm text-blue-800">
                    <strong>{tx.totalCost}:</strong> $
                    {(Number.parseFloat(restockForm.quantity) * Number.parseFloat(restockForm.cost_per_unit)).toFixed(
                      2,
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRestockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRestock}>{tx.restockItem}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
