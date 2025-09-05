import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Verificar la firma de WhatsApp para seguridad
function verifyWhatsAppSignature(request: NextRequest, body: string): boolean {
  // En producción, implementar verificación de firma de WhatsApp
  // Por ahora, retornamos true para desarrollo
  return true
}

// Procesar mensaje con IA de DeepSeek
async function processMessageWithAI(message: string, restaurantId: string, context: any) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured')
    }

    // Construir el prompt para el bot de restaurante
    const systemPrompt = `Eres un asistente de restaurante especializado en WhatsApp. Tu función es ayudar a los clientes a hacer pedidos, responder preguntas sobre el menú, y proporcionar información del restaurante.

Contexto del restaurante:
- Nombre: ${context.restaurant?.name || 'Restaurante'}
- Horarios: ${JSON.stringify(context.whatsapp_config?.business_hours || {})}
- Configuración de pedidos: ${JSON.stringify(context.whatsapp_config?.order_settings || {})}

Instrucciones importantes:
1. Responde de manera amigable y profesional
2. Si el cliente quiere hacer un pedido, guíalo paso a paso
3. Si pregunta por el menú, proporciona información clara
4. Si pregunta por horarios, responde según la configuración
5. Mantén un tono conversacional pero eficiente
6. Si no entiendes algo, pide aclaración
7. Siempre confirma los detalles del pedido antes de finalizar

Mensaje del cliente: ${message}`

    // Llamar a la API de DeepSeek
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.'
  } catch (error) {
    console.error('Error processing message with AI:', error)
    return 'Lo siento, estoy teniendo problemas técnicos. Por favor, intenta de nuevo en unos minutos.'
  }
}

// Obtener o crear conversación
async function getOrCreateConversation(restaurantId: string, customerPhone: string, customerName?: string) {
  try {
    // Buscar conversación existente
    let { data: conversation, error } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('customer_phone', customerPhone)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Si no existe, crear nueva conversación
    if (!conversation) {
      const { data: newConversation, error: createError } = await supabase
        .from('whatsapp_conversations')
        .insert({
          restaurant_id: restaurantId,
          customer_phone: customerPhone,
          customer_name: customerName,
          conversation_state: {
            current_step: 'welcome',
            order_data: {},
            context: {}
          }
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      conversation = newConversation
    }

    return conversation
  } catch (error) {
    console.error('Error getting/creating conversation:', error)
    throw error
  }
}

// Guardar mensaje en la base de datos
async function saveMessage(conversationId: string, restaurantId: string, content: string, direction: 'inbound' | 'outbound', messageType: string = 'text', metadata: any = {}) {
  try {
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert({
        conversation_id: conversationId,
        restaurant_id: restaurantId,
        message_type: messageType,
        direction,
        content,
        metadata,
        status: 'sent'
      })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error saving message:', error)
    throw error
  }
}

// Enviar mensaje a WhatsApp (simulado para desarrollo)
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  // En producción, implementar envío real a WhatsApp Business API
  console.log(`Enviando mensaje a ${phoneNumber}: ${message}`)
  
  // Simular respuesta exitosa
  return {
    success: true,
    message_id: `msg_${Date.now()}`
  }
}

// Obtener información del restaurante
async function getRestaurantInfo(restaurantId: string) {
  try {
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (error) {
      throw error
    }

    return restaurant
  } catch (error) {
    console.error('Error getting restaurant info:', error)
    throw error
  }
}

// Obtener menú del restaurante
async function getRestaurantMenu(restaurantId: string) {
  try {
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('display_order')

    if (error) {
      throw error
    }

    return menuItems || []
  } catch (error) {
    console.error('Error getting restaurant menu:', error)
    return []
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params
    
    // Verificar que el restaurante existe y tiene WhatsApp habilitado
    const restaurant = await getRestaurantInfo(restaurantId)
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const whatsappConfig = restaurant.whatsapp_config
    if (!whatsappConfig?.enabled) {
      return NextResponse.json({ error: 'WhatsApp not enabled for this restaurant' }, { status: 400 })
    }

    // Leer el cuerpo de la petición
    const body = await request.text()
    
    // Verificar la firma de WhatsApp (en producción)
    if (!verifyWhatsAppSignature(request, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parsear el webhook de WhatsApp
    const webhookData = JSON.parse(body)
    
    // Verificar que es un mensaje de texto
    if (!webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return NextResponse.json({ status: 'ok' })
    }

    const message = webhookData.entry[0].changes[0].value.messages[0]
    const customerPhone = message.from
    const messageText = message.text?.body || ''
    const messageId = message.id

    console.log(`WhatsApp message received from ${customerPhone}: ${messageText}`)

    // Obtener o crear conversación
    const conversation = await getOrCreateConversation(restaurantId, customerPhone)
    
    // Guardar mensaje entrante
    await saveMessage(conversation.id, restaurantId, messageText, 'inbound', 'text', {
      whatsapp_message_id: messageId
    })

    // Procesar mensaje con IA si está habilitada
    let responseMessage = ''
    if (whatsappConfig.ai_enabled) {
      const context = {
        restaurant,
        whatsapp_config: whatsappConfig,
        conversation_state: conversation.conversation_state
      }
      
      responseMessage = await processMessageWithAI(messageText, restaurantId, context)
    } else {
      // Respuesta por defecto si la IA está deshabilitada
      responseMessage = whatsappConfig.welcome_message || 'Gracias por tu mensaje. Te responderemos pronto.'
    }

    // Enviar respuesta
    const sendResult = await sendWhatsAppMessage(customerPhone, responseMessage)
    
    // Guardar mensaje saliente
    await saveMessage(conversation.id, restaurantId, responseMessage, 'outbound', 'text', {
      whatsapp_message_id: sendResult.message_id
    })

    // Actualizar estado de la conversación
    await supabase
      .from('whatsapp_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id)

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Endpoint para verificar webhook (requerido por WhatsApp)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params
    const { searchParams } = new URL(request.url)
    
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Verificar que el restaurante existe
    const restaurant = await getRestaurantInfo(restaurantId)
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // En producción, verificar el token con la configuración del restaurante
    const expectedToken = restaurant.whatsapp_config?.webhook_verify_token || 'default_token'

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('WhatsApp webhook verified successfully')
      return new NextResponse(challenge, { status: 200 })
    } else {
      console.log('WhatsApp webhook verification failed')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch (error) {
    console.error('Error verifying WhatsApp webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
