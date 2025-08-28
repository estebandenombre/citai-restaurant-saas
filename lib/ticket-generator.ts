import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface OrderItem {
  name: string
  quantity: number
  price: number
  total: number
  notes?: string
}

export interface CustomerInfo {
  name: string
  phone: string
  email: string
  table_number?: string
  pickup_time?: string
  address?: string
  order_type: string
  special_instructions?: string
}

export interface RestaurantInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  currency?: string
  currencySymbol?: string
  currencyPosition?: 'before' | 'after'
}

export interface OrderData {
  orderNumber: string
  orderDate: string
  restaurant: RestaurantInfo
  customer: CustomerInfo
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  deliveryFee: number
  totalAmount: number
  paymentMethod?: string
  paymentStatus?: string
}

export class TicketGenerator {
  static generateOrderTicket(orderData: OrderData): jsPDF {
    const doc = new jsPDF()
    
    // Set document properties
    doc.setProperties({
      title: `Order #${orderData.orderNumber}`,
      subject: `Order from ${orderData.restaurant.name}`,
      author: orderData.restaurant.name,
      creator: 'Restaurant SaaS'
    })

    // Header
    this.addHeader(doc, orderData.restaurant)
    
    // Order information
    this.addOrderInfo(doc, orderData)
    
    // Customer information
    this.addCustomerInfo(doc, orderData.customer)
    
    // Items table
    this.addItemsTable(doc, orderData.items, orderData.restaurant)
    
    // Totals
    this.addTotals(doc, orderData)
    
    // Footer
    this.addFooter(doc, orderData.restaurant)
    
    return doc
  }

  private static addHeader(doc: jsPDF, restaurant: RestaurantInfo) {
    // Restaurant name
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(restaurant.name, 105, 20, { align: 'center' })
    
    // Restaurant details
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    let yPosition = 30
    if (restaurant.address) {
      doc.text(restaurant.address, 105, yPosition, { align: 'center' })
      yPosition += 5
    }
    if (restaurant.phone) {
      doc.text(`Phone: ${restaurant.phone}`, 105, yPosition, { align: 'center' })
      yPosition += 5
    }
    if (restaurant.email) {
      doc.text(`Email: ${restaurant.email}`, 105, yPosition, { align: 'center' })
      yPosition += 5
    }
    
    // Separator line
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition + 5, 190, yPosition + 5)
  }

  private static addOrderInfo(doc: jsPDF, orderData: OrderData) {
    let yPosition = 50
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDER DETAILS', 20, yPosition)
    
    yPosition += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    doc.text(`Order Number: ${orderData.orderNumber}`, 20, yPosition)
    yPosition += 5
    doc.text(`Date: ${orderData.orderDate}`, 20, yPosition)
    yPosition += 5
    doc.text(`Order Type: ${orderData.customer.order_type}`, 20, yPosition)
    yPosition += 5
    
    if (orderData.paymentMethod) {
      doc.text(`Payment Method: ${orderData.paymentMethod}`, 20, yPosition)
      yPosition += 5
    }
    
    if (orderData.paymentStatus) {
      doc.text(`Payment Status: ${orderData.paymentStatus}`, 20, yPosition)
      yPosition += 5
    }
    
    yPosition += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition, 190, yPosition)
  }

  private static addCustomerInfo(doc: jsPDF, customer: CustomerInfo) {
    let yPosition = 90
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CUSTOMER INFORMATION', 20, yPosition)
    
    yPosition += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    doc.text(`Name: ${customer.name}`, 20, yPosition)
    yPosition += 5
    doc.text(`Phone: ${customer.phone}`, 20, yPosition)
    yPosition += 5
    
    if (customer.email) {
      doc.text(`Email: ${customer.email}`, 20, yPosition)
      yPosition += 5
    }
    
    if (customer.table_number) {
      doc.text(`Table: ${customer.table_number}`, 20, yPosition)
      yPosition += 5
    }
    
    if (customer.pickup_time) {
      doc.text(`Pickup Time: ${customer.pickup_time}`, 20, yPosition)
      yPosition += 5
    }
    
    if (customer.address) {
      doc.text(`Address: ${customer.address}`, 20, yPosition)
      yPosition += 5
    }
    
    if (customer.special_instructions) {
      doc.text(`Special Instructions: ${customer.special_instructions}`, 20, yPosition)
      yPosition += 5
    }
    
    yPosition += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition, 190, yPosition)
  }

  private static addItemsTable(doc: jsPDF, items: OrderItem[], restaurant: RestaurantInfo) {
    let yPosition = 140
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDER ITEMS', 20, yPosition)
    
    yPosition += 10
    
    // Get currency symbol and position
    const currencySymbol = restaurant.currencySymbol || '$'
    const position = restaurant.currencyPosition || 'before'
    
    // Helper function to format currency
    const formatCurrency = (amount: number) => {
      return position === 'after'
        ? `${amount.toFixed(2)}${currencySymbol}`
        : `${currencySymbol}${amount.toFixed(2)}`
    }
    
    // Prepare table data
    const tableData = items.map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.total),
      item.notes || ''
    ])
    
    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [['Item', 'Qty', 'Price', 'Total', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Item name
        1: { cellWidth: 20, halign: 'center' }, // Quantity
        2: { cellWidth: 25, halign: 'right' }, // Price
        3: { cellWidth: 25, halign: 'right' }, // Total
        4: { cellWidth: 40 } // Notes
      }
    })
  }

  private static addTotals(doc: jsPDF, orderData: OrderData) {
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    
    let yPosition = finalY
    
    // Get currency symbol and position
    const currencySymbol = orderData.restaurant.currencySymbol || '$'
    const position = orderData.restaurant.currencyPosition || 'before'
    
    // Helper function to format currency
    const formatCurrency = (amount: number) => {
      return position === 'after'
        ? `${amount.toFixed(2)}${currencySymbol}`
        : `${currencySymbol}${amount.toFixed(2)}`
    }
    
    // Subtotal
    doc.text('Subtotal:', 140, yPosition)
    doc.text(formatCurrency(orderData.subtotal), 190, yPosition, { align: 'right' })
    yPosition += 5
    
    // Tax
    if (orderData.taxAmount > 0) {
      doc.text('Tax:', 140, yPosition)
      doc.text(formatCurrency(orderData.taxAmount), 190, yPosition, { align: 'right' })
      yPosition += 5
    }
    
    // Delivery fee
    if (orderData.deliveryFee > 0) {
      doc.text('Delivery Fee:', 140, yPosition)
      doc.text(formatCurrency(orderData.deliveryFee), 190, yPosition, { align: 'right' })
      yPosition += 5
    }
    
    // Total
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 140, yPosition)
    doc.text(formatCurrency(orderData.totalAmount), 190, yPosition, { align: 'right' })
    
    // Separator line
    yPosition += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(140, yPosition, 190, yPosition)
  }

  private static addFooter(doc: jsPDF, restaurant: RestaurantInfo) {
    const pageHeight = doc.internal.pageSize.height
    let yPosition = pageHeight - 30
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    
    doc.text('Thank you for your order!', 105, yPosition, { align: 'center' })
    yPosition += 5
    doc.text('Please keep this receipt for your records.', 105, yPosition, { align: 'center' })
    yPosition += 5
    doc.text(`Generated by ${restaurant.name}`, 105, yPosition, { align: 'center' })
  }

  static downloadTicket(orderData: OrderData, filename?: string) {
    const doc = this.generateOrderTicket(orderData)
    const defaultFilename = `order-${orderData.orderNumber}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename || defaultFilename)
  }

  static getTicketAsBlob(orderData: OrderData): Blob {
    const doc = this.generateOrderTicket(orderData)
    return doc.output('blob')
  }
}
