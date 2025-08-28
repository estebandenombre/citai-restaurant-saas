"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingCart, Plus, Minus, Clock, Star } from "lucide-react"
import { FormattedPrice } from "@/components/ui/formatted-price"
import { CroppedDishImage } from "@/components/ui/cropped-image"
interface MenuItemProps {
  item: {
    id: string
    name: string
    description?: string
    price: number
    image_url?: string
    crop_data?: any
    is_featured?: boolean
    dietary_info?: string[]
    allergens?: string[]
    preparation_time?: number
  }
  restaurantId?: string
}

export default function MenuItem({ item, restaurantId }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const addToCart = (item: any, quantity: number, specialInstructions?: string) => {
    console.log('MenuItem addToCart called:', { item, quantity, specialInstructions })
    
    // Dispatch custom event
    const event = new CustomEvent('addToCart', {
      detail: { item, quantity, specialInstructions }
    })
    window.dispatchEvent(event)
  }

  const handleAddToCart = () => {
    console.log('Adding to cart:', {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      specialInstructions
    })
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url
    }, quantity, specialInstructions)
    
    // Reset form
    setQuantity(1)
    setSpecialInstructions('')
    setIsDialogOpen(false)
  }

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }



  return (
    <Card className="group relative overflow-hidden bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-xl h-full flex flex-col">

      {/* Dish Image */}
      {item.image_url && (
        <div className="relative overflow-hidden">
          <CroppedDishImage
            src={item.image_url}
            alt={item.name}
            cropData={item.crop_data}
            className="w-full h-48 group-hover:scale-105 transition-transform duration-300"
          />
          {item.is_featured && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-yellow-500 text-white border-0 shadow-sm">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>
      )}
      
      {/* Card Header */}
      <div className="p-5 pb-3 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors leading-tight">
              {item.name}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-slate-900">
              <FormattedPrice amount={item.price} className="text-xl font-bold text-slate-900" restaurantId={restaurantId} />
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Dietary Info & Allergens Row */}
        <div className="space-y-4">
          {/* Dietary Badges - Show All */}
          {item.dietary_info && item.dietary_info.filter((info: string) => info !== 'none').length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Dietary Information:</div>
              <div className="flex flex-wrap gap-1">
                {item.dietary_info
                  .filter((info: string) => info !== 'none')
                  .map((info: string) => (
                    <Badge 
                      key={info} 
                      variant="secondary" 
                      className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 rounded-md"
                    >
                      {info}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Allergens - Show All */}
          {item.allergens && item.allergens.filter((allergen: string) => allergen !== 'none').length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Allergens:</div>
              <div className="flex flex-wrap gap-1">
                {item.allergens
                  .filter((allergen: string) => allergen !== 'none')
                  .map((allergen: string) => (
                    <Badge 
                      key={allergen} 
                      variant="destructive" 
                      className="text-xs bg-red-50 text-red-700 border-red-200 px-2 py-0.5 rounded-md"
                    >
                      {allergen}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="px-5 pb-5 mt-auto">
        {/* Add to Cart Button */}
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-sm transition-all duration-200 hover:shadow-md font-medium py-2.5 rounded-lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>

      {/* Add to Cart Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add to Cart</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Item Info */}
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              {/* Item Image in Dialog */}
              {item.image_url && (
                <div className="mb-3">
                  <CroppedDishImage
                    src={item.image_url}
                    alt={item.name}
                    cropData={item.crop_data}
                    className="w-full h-32 rounded-lg"
                  />
                </div>
              )}
              <h3 className="font-semibold text-slate-900">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-slate-600 mt-1">{item.description}</p>
              )}
              <p className="text-lg font-bold text-slate-900 mt-2">
                <FormattedPrice amount={item.price} className="text-lg font-bold text-slate-900" restaurantId={restaurantId} />
              </p>
              
              {/* Complete Dietary Information */}
              {item.dietary_info && item.dietary_info.filter((info: string) => info !== 'none').length > 0 && (
                <div className="mt-3 text-left">
                  <div className="text-xs font-medium text-slate-600 mb-1">Dietary Information:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.dietary_info
                      .filter((info: string) => info !== 'none')
                      .map((info: string) => (
                        <Badge 
                          key={info} 
                          variant="secondary" 
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {info}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Complete Allergens Information */}
              {item.allergens && item.allergens.filter((allergen: string) => allergen !== 'none').length > 0 && (
                <div className="mt-3 text-left">
                  <div className="text-xs font-medium text-slate-600 mb-1">Allergens:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.allergens
                      .filter((allergen: string) => allergen !== 'none')
                      .map((allergen: string) => (
                        <Badge 
                          key={allergen} 
                          variant="destructive" 
                          className="text-xs bg-red-50 text-red-700 border-red-200"
                        >
                          {allergen}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Special Instructions (Optional) */}
            <div>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Special instructions (optional)"
                className="text-sm"
                rows={2}
              />
            </div>

            {/* Total */}
            <div className="text-center">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-xl font-bold text-slate-900">
                <FormattedPrice amount={item.price * quantity} className="text-xl font-bold text-slate-900" restaurantId={restaurantId} />
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-slate-900 hover:bg-slate-800"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 