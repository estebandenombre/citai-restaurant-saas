import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, restaurantId, context } = await request.json()

    if (!message || !restaurantId || !context) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Verificar que tenemos la API key
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 })
    }

    // Construir el prompt con contexto del restaurante
    const systemPrompt = `You are an AI assistant specialized in restaurant management. You must respond in a professional, clear and helpful manner, based solely on the provided data.

Restaurant context:
- Name: ${context.name}
- Total orders: ${context.stats.totalOrders}
- Total revenue: $${context.stats.totalRevenue.toLocaleString()}
- Average order value: $${context.stats.averageOrderValue.toFixed(2)}
- Pending orders: ${context.stats.pendingOrders}
- Completed orders: ${context.stats.completedOrders}
- Unique customers: ${context.stats.totalCustomers}

Best-selling products:
${context.stats.popularItems.map((item: any, index: number) => `${index + 1}. ${item.name}: ${item.quantity} units`).join('\n')}

Recent orders:
${context.stats.recentOrders.map((order: any) => `- Order #${order.number}: $${order.amount} (${order.status})`).join('\n')}

Important instructions:
1. Respond in English in a professional and clear manner
2. DO NOT use emojis or special characters
3. Base your responses ONLY on the provided data
4. If there is insufficient data, indicate it clearly
5. Maintain a professional but accessible tone
6. Do not invent information that is not in the data
7. Use real numbers and statistics from the provided data
8. Be concise but informative
9. If there are no popular products or insufficient data, say so clearly

User question: ${message}`

    // Llamar a la API de DeepSeek usando fetch
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('DeepSeek API error:', errorData)
      return NextResponse.json({ 
        error: 'Error communicating with AI service',
        details: errorData
      }, { status: 500 })
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json({ error: 'Invalid response from AI service' }, { status: 500 })
    }

    const aiResponse = data.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error: any) {
    console.error('AI Chat error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 