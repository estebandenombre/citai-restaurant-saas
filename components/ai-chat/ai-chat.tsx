"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Send, 
  User, 
  Loader2, 
  Clock,
  Lightbulb,
  X,
  MessageSquare
} from "lucide-react"
import { getCurrentUserRestaurant } from "@/lib/auth"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface RestaurantContext {
  id: string
  name: string
  stats: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
    completedOrders: number
    totalCustomers: number
    popularItems: Array<{ name: string; quantity: number }>
    recentOrders: Array<{ id: string; number: string; amount: number; status: string }>
  }
}

interface AIChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function AIChat({ isOpen, onToggle }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [restaurantContext, setRestaurantContext] = useState<RestaurantContext | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadRestaurantContext()
    }
  }, [isOpen])

  const loadRestaurantContext = async () => {
    try {
      const { restaurantId } = await getCurrentUserRestaurant()
      if (!restaurantId) return

      const response = await fetch(`/api/ai/context?restaurantId=${restaurantId}`)
      const context = await response.json()
      
      if (context.success) {
        setRestaurantContext(context.data)
        
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: `Hello, I'm your AI assistant for ${context.data.name}. I can help you with information about orders, sales, customers and more. How can I help you today?`,
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Error loading restaurant context:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          restaurantId: restaurantContext?.id,
          context: restaurantContext
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I had a problem processing your question: ${result.error || 'Unknown error'}. Could you try again?`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had a connection problem. Please check your internet connection and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          className="group relative w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-white/90"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Main icon - original colors */}
            <Image 
              src="/tably_logo.png" 
              alt="Tably" 
              width={28} 
              height={28}
              className="object-contain"
            />
            
            {/* Notification indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-white shadow-lg animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-ping opacity-75" />
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90" />
            </div>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px]">
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="flex-shrink-0 pb-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center backdrop-blur-sm border border-white/40 shadow-lg">
                  <Image 
                    src="/tably_logo.png" 
                    alt="Tably" 
                    width={24} 
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-white shadow-md animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg font-bold">AI Assistant</CardTitle>
                {restaurantContext && (
                  <div className="flex items-center space-x-2 text-xs opacity-90">
                    <Lightbulb className="h-3 w-3" />
                    <span className="font-medium">{restaurantContext.name}</span>
                    <span className="text-white/70">•</span>
                    <span className="text-white/70">Real-time insights</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-green-500/20 backdrop-blur-sm px-2 py-1 rounded-full border border-green-400/30">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Live</span>
              </div>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                          <Image 
                            src="/tably_logo.png" 
                            alt="Tably" 
                            width={16} 
                            height={16}
                            className="object-contain brightness-0 contrast-200"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm leading-relaxed">{message.content}</div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.role === 'assistant' && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-blue-600 font-semibold">AI Powered</span>
                          </>
                        )}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <User className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl p-3 border border-gray-100 max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                      <Image 
                        src="/tably_logo.png" 
                        alt="Tably" 
                        width={16} 
                        height={16}
                        className="object-contain brightness-0 contrast-200"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-700">Processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your restaurant operations, sales, or management..."
                className="flex-1 rounded-lg border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm shadow-sm text-sm py-2 px-3"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="sm"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 