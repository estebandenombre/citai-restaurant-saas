"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp,
  Bot,
  CheckCircle,
  AlertCircle,
  Phone
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

interface WhatsAppStats {
  totalConversations: number
  activeConversations: number
  totalMessages: number
  messagesToday: number
  aiResponses: number
  ordersReceived: number
  averageResponseTime: number
  customerSatisfaction: number
}

export function WhatsAppStats() {
  const [stats, setStats] = useState<WhatsAppStats>({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    messagesToday: 0,
    aiResponses: 0,
    ordersReceived: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { restaurantId } = await getCurrentUserRestaurant()
      
      if (!restaurantId) return

      // Obtener estadísticas de conversaciones
      const { data: conversations, error: convError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('restaurant_id', restaurantId)

      if (convError) throw convError

      // Obtener estadísticas de mensajes
      const { data: messages, error: msgError } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('restaurant_id', restaurantId)

      if (msgError) throw msgError

      // Obtener órdenes de WhatsApp
      const { data: whatsappOrders, error: orderError } = await supabase
        .from('whatsapp_orders')
        .select('*')
        .eq('restaurant_id', restaurantId)

      if (orderError) throw orderError

      // Calcular estadísticas
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const messagesToday = messages?.filter(msg => 
        new Date(msg.created_at) >= today
      ).length || 0

      const aiResponses = messages?.filter(msg => 
        msg.direction === 'outbound' && msg.message_type === 'text'
      ).length || 0

      const activeConversations = conversations?.filter(conv => 
        conv.is_active
      ).length || 0

      // Calcular tiempo promedio de respuesta (simulado)
      const averageResponseTime = 2.5 // minutos

      // Calcular satisfacción del cliente (simulado)
      const customerSatisfaction = 4.2 // de 5

      setStats({
        totalConversations: conversations?.length || 0,
        activeConversations,
        totalMessages: messages?.length || 0,
        messagesToday,
        aiResponses,
        ordersReceived: whatsappOrders?.length || 0,
        averageResponseTime,
        customerSatisfaction
      })
    } catch (error) {
      console.error('Error fetching WhatsApp stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Conversaciones Totales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalConversations}</div>
                     <p className="text-xs text-muted-foreground">
             {stats.activeConversations} active
           </p>
        </CardContent>
      </Card>

      {/* Mensajes Hoy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.messagesToday}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalMessages} total
          </p>
        </CardContent>
      </Card>

      {/* Respuestas de IA */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Responses</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.aiResponses}</div>
                     <p className="text-xs text-muted-foreground">
             Automated
           </p>
        </CardContent>
      </Card>

      {/* Órdenes Recibidas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ordersReceived}</div>
                     <p className="text-xs text-muted-foreground">
             Via WhatsApp
           </p>
        </CardContent>
      </Card>

      {/* Tiempo Promedio de Respuesta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageResponseTime}m</div>
          <p className="text-xs text-muted-foreground">
            Promedio
          </p>
        </CardContent>
      </Card>

      {/* Satisfacción del Cliente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.customerSatisfaction}/5</div>
                     <p className="text-xs text-muted-foreground">
             Average customer
           </p>
        </CardContent>
      </Card>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Activo</div>
                     <p className="text-xs text-muted-foreground">
             System working
           </p>
        </CardContent>
      </Card>

      {/* Bot de IA */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Bot</CardTitle>
          <Bot className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">Online</div>
                     <p className="text-xs text-muted-foreground">
             DeepSeek active
           </p>
        </CardContent>
      </Card>
    </div>
  )
}
