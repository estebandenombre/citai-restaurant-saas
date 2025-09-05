"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  Phone, 
  Clock, 
  Search,
  Send,
  User,
  Bot,
  RefreshCw,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

interface WhatsAppMessage {
  id: string
  message_type: string
  direction: 'inbound' | 'outbound'
  content: string
  created_at: string
  status: string
}

interface WhatsAppConversation {
  id: string
  customer_phone: string
  customer_name: string | null
  conversation_state: any
  is_active: boolean
  last_message_at: string
  created_at: string
  messages?: WhatsAppMessage[]
}

export function WhatsAppConversations() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const { restaurantId: userRestaurantId } = await getCurrentUserRestaurant()
      
      if (!userRestaurantId) {
                 toast({
           title: "Error",
           description: "Restaurant not found",
           variant: "destructive"
         })
        return
      }

      setRestaurantId(userRestaurantId)

      const { data: conversationsData, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('restaurant_id', userRestaurantId)
        .order('last_message_at', { ascending: false })

      if (error) {
        throw error
      }

      setConversations(conversationsData || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
             toast({
         title: "Error",
         description: "Error loading conversations",
         variant: "destructive"
       })
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      return messages || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  const selectConversation = async (conversation: WhatsAppConversation) => {
    try {
      const messages = await fetchConversationMessages(conversation.id)
      setSelectedConversation({
        ...conversation,
        messages
      })
    } catch (error) {
      console.error('Error selecting conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !restaurantId) return

    try {
      setSending(true)

      // Guardar mensaje en la base de datos
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: selectedConversation.id,
          restaurant_id: restaurantId,
          message_type: 'text',
          direction: 'outbound',
          content: newMessage,
          status: 'sent'
        })

      if (error) {
        throw error
      }

      // En producción, aquí se enviaría el mensaje real a WhatsApp
      console.log(`Enviando mensaje a ${selectedConversation.customer_phone}: ${newMessage}`)

      // Actualizar la conversación con el nuevo mensaje
      const updatedMessages = [
        ...(selectedConversation.messages || []),
        {
          id: `temp_${Date.now()}`,
          message_type: 'text',
          direction: 'outbound' as const,
          content: newMessage,
          created_at: new Date().toISOString(),
          status: 'sent'
        }
      ]

      setSelectedConversation({
        ...selectedConversation,
        messages: updatedMessages,
        last_message_at: new Date().toISOString()
      })

      setNewMessage("")

             toast({
         title: "Message sent",
         description: "Message has been sent successfully",
       })
    } catch (error) {
      console.error('Error sending message:', error)
             toast({
         title: "Error",
         description: "Error sending message",
         variant: "destructive"
       })
    } finally {
      setSending(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Formatear número de teléfono para mostrar
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

         if (diffInHours < 1) {
       return 'Now'
     } else if (diffInHours < 24) {
       return `${Math.floor(diffInHours)}h`
     } else {
       return date.toLocaleDateString()
     }
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.customer_phone.includes(searchTerm) ||
    (conversation.customer_name && conversation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversaciones de WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Lista de Conversaciones */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversaciones
          </CardTitle>
                     <CardDescription>
             {conversations.length} active conversation{conversations.length !== 1 ? 's' : ''}
           </CardDescription>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                             <Input
                 placeholder="Search by phone or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchConversations}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No conversations found' : 'No active conversations'}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {conversation.customer_name || formatPhoneNumber(conversation.customer_phone)}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.last_message_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-600 truncate">
                            {formatPhoneNumber(conversation.customer_phone)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${conversation.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                     <p className="text-xs text-gray-500">
                             {conversation.is_active ? 'Active' : 'Inactive'}
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat
            {selectedConversation && (
              <Badge variant="secondary">
                {selectedConversation.customer_name || formatPhoneNumber(selectedConversation.customer_phone)}
              </Badge>
            )}
          </CardTitle>
                     <CardDescription>
             {selectedConversation ? (
               <div className="flex items-center gap-4">
                 <span>Phone: {formatPhoneNumber(selectedConversation.customer_phone)}</span>
                 <span>•</span>
                 <span>Last message: {formatDate(selectedConversation.last_message_at)}</span>
               </div>
             ) : (
               'Select a conversation to view the chat'
             )}
           </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {selectedConversation ? (
            <div className="flex flex-col h-[500px]">
              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.direction === 'inbound' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.direction === 'outbound'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.direction === 'outbound' && (
                            <span className="text-xs opacity-70">
                              {message.status === 'sent' && <CheckCircle className="h-3 w-3" />}
                              {message.status === 'delivered' && <CheckCircle className="h-3 w-3" />}
                              {message.status === 'read' && <CheckCircle className="h-3 w-3" />}
                              {message.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                            </span>
                          )}
                        </div>
                      </div>

                      {message.direction === 'outbound' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input de mensaje */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                                     <Input
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                     placeholder="Type a message..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="icon"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                 <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
