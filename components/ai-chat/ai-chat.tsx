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
          className="group relative h-14 w-14 rounded-2xl border border-border bg-card shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md"
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <Image
              src="/tably_logo.png"
              alt="Tably"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-600" />
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              Assistant
            </div>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 h-[500px] w-96 max-w-[calc(100vw-2rem)]">
      <Card className="flex h-full flex-col overflow-hidden border-border/90 bg-card shadow-lg">
        <CardHeader className="flex-shrink-0 border-b border-border bg-muted/30 pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
                <Image
                  src="/tably_logo.png"
                  alt="Tably"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate font-display text-lg font-medium">Assistant</CardTitle>
                {restaurantContext && (
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <Lightbulb className="h-3 w-3 shrink-0" />
                    <span className="truncate font-medium text-foreground">{restaurantContext.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="hidden rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
                live
              </span>
              <Button onClick={onToggle} variant="ghost" size="icon" className="h-8 w-8">
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
                  className={`max-w-[85%] rounded-xl border p-3 ${
                    message.role === "user"
                      ? "border-border bg-foreground text-background"
                      : "border-border/80 bg-card text-foreground"
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
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm leading-relaxed">{message.content}</div>
                      <div
                        className={`flex items-center gap-2 font-mono text-[11px] ${
                          message.role === "user" ? "text-background/70" : "text-muted-foreground"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span className="tabular-nums">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="shrink-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-muted">
                          <User className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl border border-border/80 bg-card p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-border">
                      <Image
                        src="/tably_logo.png"
                        alt="Tably"
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Thinking…</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border bg-muted/20 p-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about sales, staff, or tonight’s service…"
                className="min-h-10 flex-1 text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 