"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Bot, User, Sparkles } from "lucide-react"
import { AIChatGate } from "@/components/subscription/feature-gate"
import { PageHeader } from "@/components/ui/page-header"
import { useI18n } from "@/components/i18n/i18n-provider"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function AIAssistantPage() {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          title: "Asistente IA",
          subtitle: "Obtén ayuda e insights al instante de nuestro asistente IA",
          hello:
            "Hola. Soy tu asistente IA. Puedo ayudarte con menu, pedidos, clientes y mas. Que te gustaria saber?",
          chatTitle: "Asistente IA",
          chatDesc: "Preguntame cualquier cosa sobre la gestion de tu restaurante",
          askPlaceholder: "Preguntame lo que quieras sobre tu restaurante...",
          quickSuggestions: "Sugerencias rapidas",
          tryTopics: "Prueba preguntando sobre estos temas",
          suggestions: [
            "Como puedo optimizar los precios del menu?",
            "Cuales son mis productos mas vendidos?",
            "Como puedo reducir el desperdicio de comida?",
            "Cual es la mejor hora para lanzar promociones?",
            "Como puedo mejorar la satisfaccion de clientes?",
            "Que deberia pedir para inventario?",
          ],
          capabilities: "Capacidades de IA",
          capabilitiesDesc: "En que puedo ayudarte",
          capMenu: "Menu",
          capMenuDesc: "Optimizacion de precios, sugerencias de items",
          capOrders: "Pedidos",
          capOrdersDesc: "Analisis de tendencias, horas punta",
          capInventory: "Inventario",
          capInventoryDesc: "Gestion de stock, sugerencias de compra",
          capCustomers: "Clientes",
          capCustomersDesc: "Analisis de comportamiento, fidelizacion",
          capOperations: "Operaciones",
          capOperationsDesc: "Mejoras de eficiencia, optimizacion de costes",
          simResponse:
            "Entiendo que preguntas sobre \"{input}\". Esta es una respuesta simulada. En implementacion real, se conectaria a OpenAI o Claude para ayudarte mejor.",
        }
      : {
          title: "AI Assistant",
          subtitle: "Get instant help and insights from our AI assistant",
          hello:
            "Hello! I'm your AI assistant. I can help you with menu management, order optimization, customer insights, and much more. What would you like to know?",
          chatTitle: "AI Assistant",
          chatDesc: "Ask me anything about your restaurant management",
          askPlaceholder: "Ask me anything about your restaurant...",
          quickSuggestions: "Quick Suggestions",
          tryTopics: "Try asking about these topics",
          suggestions: [
            "How can I optimize my menu pricing?",
            "What are my best-selling items?",
            "How can I reduce food waste?",
            "What's the best time to offer promotions?",
            "How can I improve customer satisfaction?",
            "What should I order for inventory?",
          ],
          capabilities: "AI Capabilities",
          capabilitiesDesc: "What I can help you with",
          capMenu: "Menu",
          capMenuDesc: "Pricing optimization, item suggestions",
          capOrders: "Orders",
          capOrdersDesc: "Trend analysis, peak hour insights",
          capInventory: "Inventory",
          capInventoryDesc: "Stock management, ordering suggestions",
          capCustomers: "Customers",
          capCustomersDesc: "Behavior analysis, loyalty insights",
          capOperations: "Operations",
          capOperationsDesc: "Efficiency tips, cost optimization",
          simResponse:
            "I understand you're asking about \"{input}\". This is a simulated response. In a real implementation, this would connect to an AI service like OpenAI or Claude to provide intelligent assistance for your restaurant management needs.",
        }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: tx.hello,
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: tx.simResponse.replace("{input}", input),
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={tx.title}
        description={tx.subtitle}
      />

      <AIChatGate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  {tx.chatTitle}
                </CardTitle>
                <CardDescription>
                  {tx.chatDesc}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={tx.askPlaceholder}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-foreground" />
                  {tx.quickSuggestions}
                </CardTitle>
                <CardDescription>
                  {tx.tryTopics}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tx.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setInput(suggestion)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                    {suggestion}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tx.capabilities}</CardTitle>
                <CardDescription>
                  {tx.capabilitiesDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">{tx.capMenu}</Badge>
                  <span>{tx.capMenuDesc}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">{tx.capOrders}</Badge>
                  <span>{tx.capOrdersDesc}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">{tx.capInventory}</Badge>
                  <span>{tx.capInventoryDesc}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">{tx.capCustomers}</Badge>
                  <span>{tx.capCustomersDesc}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">{tx.capOperations}</Badge>
                  <span>{tx.capOperationsDesc}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AIChatGate>
    </div>
  )
}
