"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  special_instructions?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number, specialInstructions?: string) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateSpecialInstructions: (itemId: string, instructions: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
  restaurantId: string
}

export function CartProvider({ children, restaurantId }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${restaurantId}`)
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [restaurantId])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(cartItems))
  }, [cartItems, restaurantId])

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number, specialInstructions?: string) => {
    console.log('Context addToCart called with:', { item, quantity, specialInstructions })
    setCartItems(prev => {
      console.log('Previous cart items:', prev)
      const existingItem = prev.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        const updated = prev.map(cartItem =>
          cartItem.id === item.id
            ? { 
                ...cartItem, 
                quantity: cartItem.quantity + quantity,
                special_instructions: specialInstructions || cartItem.special_instructions
              }
            : cartItem
        )
        console.log('Updated existing item:', updated)
        return updated
      }
      const newCart = [...prev, { ...item, quantity, special_instructions: specialInstructions }]
      console.log('Added new item:', newCart)
      return newCart
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, special_instructions: instructions } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem(`cart_${restaurantId}`)
  }

  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0)

  const getSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  const getTax = () => getSubtotal() * 0.08 // 8% tax

  const getTotal = () => getSubtotal() + getTax()

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateSpecialInstructions,
    clearCart,
    getTotalItems,
    getSubtotal,
    getTax,
    getTotal
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 