import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format, parseISO } from 'date-fns'

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface AnalyticsData {
  revenue: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    growth: number
  }
  orders: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    growth: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  topItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  salesByDay: Array<{
    date: string
    revenue: number
    orders: number
  }>
  salesByHour: Array<{
    hour: string
    revenue: number
    orders: number
  }>
  categoryPerformance: Array<{
    category: string
    revenue: number
    orders: number
  }>
}

interface ExportOptions {
  includeCharts: boolean
  includeRawData: boolean
  includeInsights: boolean
  includeTopItems: boolean
  includeHourlyData: boolean
  includeCustomerData: boolean
}

interface RestaurantInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  currencyConfig?: {
    currency: string
    position: 'before' | 'after'
  }
}

export class ProfessionalPDFGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private pageWidth: number
  private margin: number = 20
  private lineHeight: number = 7
  private sectionSpacing: number = 15

  /**
   * Format currency based on restaurant configuration
   */
  private formatCurrency(amount: number, currencyConfig?: any, decimals: number = 2): string {
    if (!currencyConfig) {
      return `$${amount.toFixed(decimals)}`
    }

    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'MXN': '$',
      'BRL': 'R$'
    }

    const symbol = symbols[currencyConfig.currency] || '$'
    const formattedAmount = amount.toFixed(decimals)
    
    if (currencyConfig.position === 'after') {
      return `${formattedAmount}${symbol}`
    } else {
      return `${symbol}${formattedAmount}`
    }
  }

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
  }

  private addHeader(restaurantInfo: RestaurantInfo, dateRange: { from: Date; to: Date }) {
    // Logo placeholder (you can add actual logo)
    this.doc.setFillColor(59, 130, 246) // Blue
    this.doc.rect(0, 0, this.pageWidth, 40, 'F')
    
    // Restaurant name
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(restaurantInfo.name, this.margin, 25)
    
    // Report title
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Analytics Report', this.margin, 35)
    
    // Date range
    this.doc.setFontSize(10)
    this.doc.text(
      `Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`,
      this.pageWidth - this.margin, 25, { align: 'right' }
    )
    
    // Generated date
    this.doc.text(
      `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
      this.pageWidth - this.margin, 30, { align: 'right' }
    )
    
    this.currentY = 50
  }

  private addSectionTitle(title: string, fontSize: number = 16) {
    this.checkPageBreak(20)
    
    this.doc.setTextColor(59, 130, 246) // Blue
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    
    // Underline
    this.doc.setDrawColor(59, 130, 246)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2)
    
    this.currentY += 10
  }

  private addSubsectionTitle(title: string) {
    this.checkPageBreak(15)
    
    this.doc.setTextColor(75, 85, 99) // Gray
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    
    this.currentY += 8
  }

  private addMetricCard(title: string, value: string, subtitle?: string, color: string = '#1f2937') {
    this.checkPageBreak(25)
    
    // Card background
    this.doc.setFillColor(249, 250, 251) // Light gray
    this.doc.roundedRect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 20, 3, 3, 'F')
    
    // Border
    this.doc.setDrawColor(229, 231, 235)
    this.doc.setLineWidth(0.5)
    this.doc.roundedRect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 20, 3, 3, 'S')
    
    // Title
    this.doc.setTextColor(107, 114, 128) // Gray
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(title, this.margin + 5, this.currentY + 2)
    
    // Value - convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [31, 41, 55]
    }
    const [r, g, b] = hexToRgb(color)
    this.doc.setTextColor(r, g, b)
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(value, this.margin + 5, this.currentY + 12)
    
    // Subtitle
    if (subtitle) {
      this.doc.setTextColor(107, 114, 128)
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(subtitle, this.margin + 5, this.currentY + 18)
    }
    
    this.currentY += 25
  }

  private addTable(headers: string[], data: any[][], title?: string) {
    if (title) {
      this.addSubsectionTitle(title)
    }
    
    this.checkPageBreak(data.length * 8 + 20)
    
    // Create a simple text-based table
    this.addSimpleTable(headers, data)
  }

  private addSimpleTable(headers: string[], data: any[][]) {
    // Simple fallback table using text
    this.doc.setTextColor(75, 85, 99)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    
    // Headers
    this.doc.setFont('helvetica', 'bold')
    headers.forEach((header, index) => {
      this.doc.text(header, this.margin + (index * 40), this.currentY)
    })
    
    this.currentY += 8
    
    // Data rows
    this.doc.setFont('helvetica', 'normal')
    data.forEach(row => {
      row.forEach((cell, index) => {
        this.doc.text(cell.toString(), this.margin + (index * 40), this.currentY)
      })
      this.currentY += 6
    })
    
    this.currentY += 10
  }

  private addInsights(analyticsData: AnalyticsData, currencyConfig?: any) {
    this.addSectionTitle('Performance Insights')
    
    const insights = this.generateInsights(analyticsData, currencyConfig)
    
    insights.forEach(insight => {
      this.checkPageBreak(15)
      
      // Insight icon - convert color array to RGB parameters
      const [r, g, b] = insight.color
      this.doc.setFillColor(r, g, b)
      this.doc.circle(this.margin + 5, this.currentY + 3, 2, 'F')
      
      // Insight text
      this.doc.setTextColor(75, 85, 99)
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(insight.text, this.margin + 15, this.currentY + 5)
      
      this.currentY += 12
    })
  }

  private generateInsights(analyticsData: AnalyticsData, currencyConfig?: any) {
    const insights = []
    
    // Revenue insights
    if (analyticsData.revenue.growth > 0) {
      insights.push({
        text: `Revenue increased by ${analyticsData.revenue.growth.toFixed(1)}% compared to the previous period`,
        color: [34, 197, 94] // Green
      })
    } else if (analyticsData.revenue.growth < 0) {
      insights.push({
        text: `Revenue decreased by ${Math.abs(analyticsData.revenue.growth).toFixed(1)}% compared to the previous period`,
        color: [239, 68, 68] // Red
      })
    }
    
    // Order insights
    if (analyticsData.orders.growth > 0) {
      insights.push({
        text: `Order volume increased by ${analyticsData.orders.growth.toFixed(1)}%`,
        color: [34, 197, 94] // Green
      })
    }
    
    // Customer insights
    if (analyticsData.customers.new > 0) {
      insights.push({
        text: `${analyticsData.customers.new} new customers acquired during this period`,
        color: [59, 130, 246] // Blue
      })
    }
    
    // Average order value
    const avgOrderValue = analyticsData.orders.total > 0 ? analyticsData.revenue.total / analyticsData.orders.total : 0
    insights.push({
      text: `Average order value: ${this.formatCurrency(avgOrderValue, currencyConfig)}`,
      color: [168, 85, 247] // Purple
    })
    
    return insights
  }

  private addTopItems(analyticsData: AnalyticsData, currencyConfig?: any) {
    if (analyticsData.topItems.length === 0) return
    
    this.addSectionTitle('Top Performing Items')
    
    const headers = ['Rank', 'Item Name', 'Quantity Sold', 'Revenue Generated', 'Avg. Price']
    const data = analyticsData.topItems.map((item, index) => [
      `#${index + 1}`,
      item.name,
      item.quantity.toString(),
      this.formatCurrency(item.revenue, currencyConfig),
      this.formatCurrency(item.revenue / item.quantity, currencyConfig)
    ])
    
    this.addTable(headers, data)
  }

  private addHourlyAnalysis(analyticsData: AnalyticsData, currencyConfig?: any) {
    if (analyticsData.salesByHour.length === 0) return
    
    this.addSectionTitle('Hourly Performance Analysis')
    
    const headers = ['Hour', 'Revenue', 'Orders', 'Avg. Order Value']
    const data = analyticsData.salesByHour.map(hour => [
      hour.hour,
      this.formatCurrency(hour.revenue, currencyConfig),
      hour.orders.toString(),
      this.formatCurrency(hour.revenue / hour.orders, currencyConfig)
    ])
    
    this.addTable(headers, data)
  }

  private addCategoryPerformance(analyticsData: AnalyticsData, currencyConfig?: any) {
    if (analyticsData.categoryPerformance.length === 0) return
    
    this.addSectionTitle('Category Performance')
    
    const headers = ['Category', 'Revenue', 'Orders', 'Revenue per Order']
    const data = analyticsData.categoryPerformance.map(category => [
      category.category,
      this.formatCurrency(category.revenue, currencyConfig),
      category.orders.toString(),
      this.formatCurrency(category.revenue / category.orders, currencyConfig)
    ])
    
    this.addTable(headers, data)
  }

  private addDailyTrends(analyticsData: AnalyticsData, currencyConfig?: any) {
    if (analyticsData.salesByDay.length === 0) return
    
    this.addSectionTitle('Daily Revenue Trends')
    
    const headers = ['Date', 'Revenue', 'Orders', 'Avg. Order Value']
    const data = analyticsData.salesByDay.map(day => {
      // Try to parse the date safely
      let formattedDate = day.date
      try {
        // Try parsing as ISO string first
        const parsedDate = parseISO(day.date)
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = format(parsedDate, 'MMM dd')
        } else {
          // If ISO parsing fails, try parsing as a regular date string
          const fallbackDate = new Date(day.date)
          if (!isNaN(fallbackDate.getTime())) {
            formattedDate = format(fallbackDate, 'MMM dd')
          }
        }
      } catch (error) {
        // If all parsing fails, use the original string
        console.warn('Failed to parse date:', day.date, error)
        formattedDate = day.date
      }
      
      return [
        formattedDate,
        this.formatCurrency(day.revenue, currencyConfig),
        day.orders.toString(),
        this.formatCurrency(day.revenue / day.orders, currencyConfig)
      ]
    })
    
    this.addTable(headers, data)
  }

  private addCustomerAnalytics(analyticsData: AnalyticsData) {
    this.addSectionTitle('Customer Analytics')
    
    // Customer metrics
    this.addMetricCard(
      'Total Customers',
      analyticsData.customers.total.toString(),
      'Unique customers during period'
    )
    
    this.addMetricCard(
      'New Customers',
      analyticsData.customers.new.toString(),
      'First-time customers',
      '#10b981' // Green
    )
    
    this.addMetricCard(
      'Returning Customers',
      analyticsData.customers.returning.toString(),
      'Repeat customers',
      '#3b82f6' // Blue
    )
    
    const retentionRate = analyticsData.customers.total > 0 
      ? (analyticsData.customers.returning / analyticsData.customers.total * 100).toFixed(1)
      : '0.0'
    
    this.addMetricCard(
      'Customer Retention Rate',
      `${retentionRate}%`,
      'Percentage of returning customers',
      '#8b5cf6' // Purple
    )
  }

  private addRawData(analyticsData: AnalyticsData, options: ExportOptions, currencyConfig?: any) {
    if (!options.includeRawData) return
    
    this.addSectionTitle('Raw Data Summary')
    
    this.addSubsectionTitle('Revenue Data')
    const revenueData = [
      ['Metric', 'Value'],
      ['Total Revenue', this.formatCurrency(analyticsData.revenue.total, currencyConfig)],
      ['Today\'s Revenue', this.formatCurrency(analyticsData.revenue.today, currencyConfig)],
      ['This Week\'s Revenue', this.formatCurrency(analyticsData.revenue.thisWeek, currencyConfig)],
      ['This Month\'s Revenue', this.formatCurrency(analyticsData.revenue.thisMonth, currencyConfig)],
      ['Revenue Growth', `${analyticsData.revenue.growth.toFixed(1)}%`]
    ]
    this.addTable(['Metric', 'Value'], revenueData.slice(1))
    
    this.addSubsectionTitle('Order Data')
    const orderData = [
      ['Total Orders', analyticsData.orders.total.toString()],
      ['Today\'s Orders', analyticsData.orders.today.toString()],
      ['This Week\'s Orders', analyticsData.orders.thisWeek.toString()],
      ['This Month\'s Orders', analyticsData.orders.thisMonth.toString()],
      ['Order Growth', `${analyticsData.orders.growth.toFixed(1)}%`]
    ]
    this.addTable(['Metric', 'Value'], orderData)
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      
      // Footer line
      this.doc.setDrawColor(229, 231, 235)
      this.doc.setLineWidth(0.5)
      this.doc.line(this.margin, 280, this.pageWidth - this.margin, 280)
      
      // Page number
      this.doc.setTextColor(107, 114, 128)
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth / 2, 285, { align: 'center' })
      
      // Confidential notice
      this.doc.setFontSize(8)
      this.doc.text('Confidential - For internal use only', this.margin, 285)
      
      // Generated by
      this.doc.text('Generated by Tably Analytics', this.pageWidth - this.margin, 285, { align: 'right' })
    }
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > 270) {
      this.doc.addPage()
      this.currentY = 20
    }
  }

  public generateReport(
    analyticsData: AnalyticsData,
    restaurantInfo: RestaurantInfo,
    dateRange: { from: Date; to: Date },
    options: ExportOptions
  ): jsPDF {
    // Reset document
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.currentY = 20
    
    // Add header
    this.addHeader(restaurantInfo, dateRange)
    
    // Executive Summary
    this.addSectionTitle('Executive Summary')
    
    // Key metrics in a grid
    const metricsPerRow = 2
    const metricWidth = (this.pageWidth - 2 * this.margin - (metricsPerRow - 1) * 10) / metricsPerRow
    
    // Revenue metrics
    this.addMetricCard(
      'Total Revenue',
      this.formatCurrency(analyticsData.revenue.total, restaurantInfo.currencyConfig),
      `${analyticsData.revenue.growth >= 0 ? '+' : ''}${analyticsData.revenue.growth.toFixed(1)}% vs previous period`,
      analyticsData.revenue.growth >= 0 ? '#10b981' : '#ef4444'
    )
    
    this.addMetricCard(
      'Total Orders',
      analyticsData.orders.total.toLocaleString(),
      `${analyticsData.orders.growth >= 0 ? '+' : ''}${analyticsData.orders.growth.toFixed(1)}% vs previous period`,
      analyticsData.orders.growth >= 0 ? '#10b981' : '#ef4444'
    )
    
    this.addMetricCard(
      'Average Order Value',
      this.formatCurrency(analyticsData.revenue.total / analyticsData.orders.total, restaurantInfo.currencyConfig),
      'Revenue per order'
    )
    
    this.addMetricCard(
      'Total Customers',
      analyticsData.customers.total.toString(),
      `${analyticsData.customers.new} new, ${analyticsData.customers.returning} returning`
    )
    
    // Insights
    if (options.includeInsights) {
      this.addInsights(analyticsData, restaurantInfo.currencyConfig)
    }
    
    // Top performing items
    if (options.includeTopItems) {
      this.addTopItems(analyticsData, restaurantInfo.currencyConfig)
    }
    
    // Hourly analysis
    if (options.includeHourlyData) {
      this.addHourlyAnalysis(analyticsData, restaurantInfo.currencyConfig)
    }
    
    // Category performance
    this.addCategoryPerformance(analyticsData, restaurantInfo.currencyConfig)
    
    // Daily trends
    this.addDailyTrends(analyticsData, restaurantInfo.currencyConfig)
    
    // Customer analytics
    if (options.includeCustomerData) {
      this.addCustomerAnalytics(analyticsData)
    }
    
    // Raw data
    this.addRawData(analyticsData, options, restaurantInfo.currencyConfig)
    
    // Footer
    this.addFooter()
    
    return this.doc
  }
}

export const pdfGenerator = new ProfessionalPDFGenerator() 