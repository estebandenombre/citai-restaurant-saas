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
      return { status: "out-of-stock", color: "bg-red-100 text-red-800", label: "Out of Stock" }
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: "low-stock", color: "bg-yellow-100 text-yellow-800", label: "Low Stock" }
    } else {
      return { status: "in-stock", color: "bg-green-100 text-green-800", label: "In Stock" }
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
    return <Loading text="Loading inventory..." />
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
                Inventory
              </h1>
              <p className="text-gray-500 text-sm">
                Monitor and manage your restaurant's inventory
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => openItemDialog()}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getLowStockCount()}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getOutOfStockCount()}</div>
            <p className="text-xs text-muted-foreground">Items completely out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <FormattedPrice amount={getTotalValue()} restaurantId={restaurantId || undefined} />
            </div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by item name or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Stock Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
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
                {inventoryItems.length === 0 ? "No inventory items yet" : "No items found"}
              </h3>
              <p className="text-gray-500 mb-4">
                {inventoryItems.length === 0
                  ? "Add your first inventory item to get started"
                  : "Try adjusting your filters"}
              </p>
              {inventoryItems.length === 0 && (
                <Button onClick={() => openItemDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
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
                            <span className="font-medium">Current Stock:</span>
                            <p className="text-lg font-bold text-gray-900">
                              {item.current_stock} {item.unit}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium">Minimum Stock:</span>
                            <p>
                              {item.minimum_stock} {item.unit}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium">Cost per Unit:</span>
                            <p>
                              {item.cost_per_unit ? (
                                <FormattedPrice amount={item.cost_per_unit} restaurantId={restaurantId || undefined} />
                              ) : "Not set"}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium">Supplier:</span>
                            <p>{item.supplier || "Not specified"}</p>
                          </div>
                        </div>

                        {item.last_restocked && (
                          <div className="mt-2 text-xs text-gray-500">
                            <Calendar className="inline w-3 h-3 mr-1" />
                            Last restocked: {new Date(item.last_restocked).toLocaleDateString()}
                          </div>
                        )}

                        {item.cost_per_unit && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-green-600">
                              Total Value: <FormattedPrice amount={item.current_stock * item.cost_per_unit} restaurantId={restaurantId || undefined} />
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
                          Restock
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
                              <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update inventory item information" : "Add a new item to your inventory"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g., Tomatoes, Flour, Olive Oil"
                />
              </div>
              <div>
                <Label htmlFor="item-unit">Unit</Label>
                <Select value={itemForm.unit} onValueChange={(value) => setItemForm({ ...itemForm, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="l">Liters (l)</SelectItem>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="cans">Cans</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-stock">Current Stock</Label>
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
                <Label htmlFor="minimum-stock">Minimum Stock</Label>
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
                <Label htmlFor="cost-per-unit">Cost per Unit ($)</Label>
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
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={itemForm.supplier}
                  onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingItem ? handleUpdateItem : handleCreateItem}>
                {editingItem ? "Update" : "Add"} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add stock to "{restockingItem?.name}" - Current: {restockingItem?.current_stock} {restockingItem?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restock-quantity">Quantity to Add</Label>
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
              <Label htmlFor="restock-cost">Cost per Unit ($)</Label>
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
              <Label htmlFor="restock-supplier">Supplier</Label>
              <Input
                id="restock-supplier"
                value={restockForm.supplier}
                onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>

            <div>
              <Label htmlFor="restock-notes">Notes (Optional)</Label>
              <Textarea
                id="restock-notes"
                value={restockForm.notes}
                onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                placeholder="Any additional notes about this restock"
              />
            </div>

            {restockForm.quantity && restockingItem && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>New Stock Level:</strong>{" "}
                  {restockingItem.current_stock + Number.parseFloat(restockForm.quantity)} {restockingItem.unit}
                </p>
                {restockForm.cost_per_unit && (
                  <p className="text-sm text-blue-800">
                    <strong>Total Cost:</strong> $
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
              <Button onClick={handleRestock}>Restock Item</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
