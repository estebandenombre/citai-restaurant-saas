interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  restaurantName: string
  orderType: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    specialInstructions?: string
  }>
  subtotal: number
  taxAmount: number
  deliveryFee: number
  totalAmount: number
  specialInstructions?: string
  tableNumber?: string
  pickupTime?: string
  address?: string
}

interface UpgradeRequestEmailData {
  userName: string
  userEmail: string
  currentPlan: string | null
  requestedPlan: string
  message: string | null
  requestDate: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

class EmailService {
  private apiKey: string
  private baseUrl: string = 'https://api.brevo.com/v3'

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || ''
  }

  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<EmailResponse> {
    // Validar que la API key esté configurada
    if (!this.apiKey) {
      console.error('❌ BREVO_API_KEY no está configurada en las variables de entorno')
      return {
        success: false,
        error: 'API key no configurada. Verifica la variable BREVO_API_KEY en .env.local'
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          to: [{ email: to }],
          sender: {
            name: 'Tably Restaurant',
            email: 'info@tably.digital'
          },
          subject: subject,
          htmlContent: htmlContent
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Brevo API Error:', data)
        return {
          success: false,
          error: data.message || 'Failed to send email'
        }
      }

      return {
        success: true,
        messageId: data.messageId
      }
    } catch (error) {
      console.error('Email service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  private generateUpgradeRequestEmailHTML(data: UpgradeRequestEmailData): string {
    const planNames: { [key: string]: string } = {
      'free-trial-plan': 'Free Trial',
      'starter-plan': 'Starter Plan',
      'growth-plan': 'Growth Plan',
      'multi-plan': 'Multi-Location Plan'
    }

    const currentPlanDisplay = data.currentPlan ? planNames[data.currentPlan] || data.currentPlan : 'No active plan'
    const requestedPlanDisplay = planNames[data.requestedPlan] || data.requestedPlan

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upgrade Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">🚀 Tably Upgrade Request</h1>
          <p style="color: white; text-align: center; margin: 10px 0 0 0; font-size: 16px;">New Plan Upgrade Request</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">New Upgrade Request</h2>
          <p style="margin: 0 0 20px 0; font-size: 16px;">A user has requested to upgrade their subscription plan.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <div style="margin-bottom: 15px;">
              <strong>User Name:</strong> <span style="color: #667eea; font-weight: bold;">${data.userName}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>User Email:</strong> <span style="color: #667eea; font-weight: bold;">${data.userEmail}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Current Plan:</strong> <span style="color: #667eea; font-weight: bold;">${currentPlanDisplay}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Requested Plan:</strong> <span style="color: #28a745; font-weight: bold; font-size: 18px;">${requestedPlanDisplay}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Request Date:</strong> <span style="color: #667eea; font-weight: bold;">${data.requestDate}</span>
            </div>
            ${data.message ? `
            <div style="margin-bottom: 15px;">
              <strong>Message:</strong>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 3px solid #667eea;">
                <p style="margin: 0; font-style: italic; color: #555;">"${data.message}"</p>
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745; margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; color: #155724;">📋 Next Steps</h3>
          <p style="margin: 0; color: #155724;">Please review this request and contact the user to process their upgrade.</p>
        </div>

        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This email was automatically sent by the Tably upgrade request system.
          </p>
        </div>
      </body>
      </html>
    `
  }

  private generateOrderEmailHTML(data: OrderEmailData): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold; color: #333;">${item.name}</div>
          ${item.specialInstructions ? `<div style="font-size: 12px; color: #666; font-style: italic;">Notes: ${item.specialInstructions}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${this.formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${this.formatCurrency(item.totalPrice)}</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">🍽️ ${data.restaurantName}</h1>
          <p style="color: white; text-align: center; margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">Hello ${data.customerName}!</h2>
          <p style="margin: 0 0 20px 0; font-size: 16px;">Thank you for your order. We have received your request and are processing it.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <div style="margin-bottom: 15px;">
              <strong>Order Number:</strong> <span style="color: #667eea; font-size: 18px; font-weight: bold;">#${data.orderNumber}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Order Type:</strong> 
              <span style="text-transform: capitalize; color: #667eea; font-weight: bold;">
                ${data.orderType === 'dine-in' ? 'Dine In' :
                  data.orderType === 'takeaway' ? 'Takeaway' :
                  data.orderType === 'delivery' ? 'Delivery' : data.orderType}
              </span>
            </div>
            ${data.tableNumber ? `<div style="margin-bottom: 15px;"><strong>Table Number:</strong> <span style="color: #667eea; font-weight: bold;">${data.tableNumber}</span></div>` : ''}
            ${data.pickupTime ? `<div style="margin-bottom: 15px;"><strong>Pickup Time:</strong> <span style="color: #667eea; font-weight: bold;">${data.pickupTime}</span></div>` : ''}
            ${data.address ? `<div style="margin-bottom: 15px;"><strong>Delivery Address:</strong> <span style="color: #667eea; font-weight: bold;">${data.address}</span></div>` : ''}
            ${data.specialInstructions ? `<div style="margin-bottom: 15px;"><strong>Special Instructions:</strong> <span style="color: #667eea; font-style: italic;">${data.specialInstructions}</span></div>` : ''}
          </div>
        </div>

        <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e9ecef;">
          <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">📋 Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: bold;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6; font-weight: bold;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div style="border-top: 1px solid #dee2e6; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>${this.formatCurrency(data.subtotal)}</span>
            </div>
            ${data.taxAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Tax:</span>
              <span>${this.formatCurrency(data.taxAmount)}</span>
            </div>
            ` : ''}
            ${data.deliveryFee > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Delivery Fee:</span>
              <span>${this.formatCurrency(data.deliveryFee)}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #667eea; padding-top: 10px; margin-top: 10px;">
              <span>Total:</span>
              <span style="color: #667eea;">${this.formatCurrency(data.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745; margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; color: #155724;">📞 Need Help?</h3>
          <p style="margin: 0; color: #155724;">If you have any questions about your order, please don't hesitate to contact us.</p>
        </div>

        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This email was automatically sent by the ordering system of ${data.restaurantName}.
          </p>
        </div>
      </body>
      </html>
    `
  }

  async sendUpgradeRequestNotification(data: UpgradeRequestEmailData): Promise<EmailResponse> {
    const subject = `New Upgrade Request - ${data.userName} (${data.userEmail})`
    const htmlContent = this.generateUpgradeRequestEmailHTML(data)
    
    return this.sendEmail('info@tably.digital', subject, htmlContent)
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<EmailResponse> {
    const subject = `Order Confirmation #${data.orderNumber} - ${data.restaurantName}`
    const htmlContent = this.generateOrderEmailHTML(data)
    
    return this.sendEmail(data.customerEmail, subject, htmlContent)
  }

  async sendOrderStatusUpdate(
    customerEmail: string, 
    customerName: string, 
    orderNumber: string, 
    restaurantName: string, 
    status: string
  ): Promise<EmailResponse> {
    const statusMessages = {
      'confirmed': 'Your order has been confirmed and is being prepared.',
      'preparing': 'Your order is being prepared in the kitchen.',
      'ready': 'Your order is ready! You can pick it up.',
      'delivered': 'Your order has been delivered. Enjoy your meal!',
      'cancelled': 'Your order has been cancelled. If you have any questions, please contact us.'
    }

    const subject = `Order Update #${orderNumber} - ${restaurantName}`
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">🍽️ ${restaurantName}</h1>
          <p style="color: white; text-align: center; margin: 10px 0 0 0; font-size: 16px;">Order Update</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">Hello ${customerName},</h2>
          <p style="margin: 0 0 20px 0; font-size: 16px;">${statusMessages[status as keyof typeof statusMessages] || 'Your order has been updated.'}</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <div style="margin-bottom: 15px;">
              <strong>Order Number:</strong> <span style="color: #667eea; font-size: 18px; font-weight: bold;">#${orderNumber}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Current Status:</strong> 
              <span style="text-transform: capitalize; color: #667eea; font-weight: bold;">
                ${status === 'confirmed' ? 'Confirmed' :
                  status === 'preparing' ? 'Preparing' :
                  status === 'ready' ? 'Ready' :
                  status === 'delivered' ? 'Delivered' :
                  status === 'cancelled' ? 'Cancelled' : status}
              </span>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This email was automatically sent by the ordering system of ${restaurantName}.
          </p>
        </div>
      </body>
      </html>
    `
    
    return this.sendEmail(customerEmail, subject, htmlContent)
  }
}

export const emailService = new EmailService()
