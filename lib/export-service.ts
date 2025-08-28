import { pdfGenerator } from './pdf-generator'
import { format, parseISO } from 'date-fns'

// Dynamic import for XLSX to avoid SSR issues
let XLSX: any = null
if (typeof window !== 'undefined') {
  import('xlsx').then(module => {
    XLSX = module
  })
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

export class ExportService {
  
  /**
   * Format currency based on restaurant configuration
   */
  private static formatCurrency(amount: number, currencyConfig?: any, decimals: number = 2): string {
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
  
  /**
   * Export analytics data in PDF format
   */
  static exportToPDF(
    analyticsData: AnalyticsData,
    restaurantInfo: RestaurantInfo,
    dateRange: { from: Date; to: Date },
    options: ExportOptions
  ): Blob {
    try {
      const doc = pdfGenerator.generateReport(analyticsData, restaurantInfo, dateRange, options)
      const pdfBlob = doc.output('blob')
      return pdfBlob
    } catch (error) {
      console.error('PDF export error:', error)
      throw new Error('Failed to generate PDF report')
    }
  }

  /**
   * Export analytics data in Excel format
   */
  static async exportToExcel(
    analyticsData: AnalyticsData,
    restaurantInfo: RestaurantInfo,
    dateRange: { from: Date; to: Date },
    options: ExportOptions
  ): Promise<Blob> {
    try {
      // Validate input data
      if (!analyticsData) {
        throw new Error('Analytics data is required')
      }
      
      // Ensure XLSX is loaded
      if (!XLSX) {
        XLSX = await import('xlsx')
      }
      
      const workbook = XLSX.utils.book_new()
      
      // Executive Summary Sheet
      const summaryData = [
        ['Restaurant Analytics Report'],
        [''],
        ['Restaurant:', restaurantInfo.name],
        ['Report Period:', `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`],
        ['Generated:', format(new Date(), 'MMM dd, yyyy HH:mm')],
        [''],
        ['Key Metrics'],
        ['Metric', 'Value', 'Growth'],
        ['Total Revenue', this.formatCurrency(analyticsData.revenue.total || 0, restaurantInfo.currencyConfig), `${(analyticsData.revenue.growth || 0).toFixed(1)}%`],
        ['Total Orders', analyticsData.orders.total || 0, `${(analyticsData.orders.growth || 0).toFixed(1)}%`],
        ['Average Order Value', this.formatCurrency((analyticsData.revenue.total || 0) / (analyticsData.orders.total || 1), restaurantInfo.currencyConfig), ''],
        ['Total Customers', analyticsData.customers.total || 0, ''],
        ['New Customers', analyticsData.customers.new || 0, ''],
        ['Returning Customers', analyticsData.customers.returning || 0, ''],
        ['Customer Retention Rate', `${((analyticsData.customers.returning || 0) / (analyticsData.customers.total || 1) * 100).toFixed(1)}%`, '']
      ]
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary')
      
      // Top Items Sheet
      if (options.includeTopItems && analyticsData.topItems && analyticsData.topItems.length > 0) {
        const topItemsData = [
          ['Top Performing Items'],
          [''],
          ['Rank', 'Item Name', 'Quantity Sold', 'Revenue Generated', 'Average Price']
        ]
        
                 analyticsData.topItems.forEach((item, index) => {
           const quantity = item.quantity || 0
           const revenue = item.revenue || 0
           const name = item.name || 'Unknown Item'
           
           topItemsData.push([
             `#${index + 1}`,
             name,
             quantity.toString(),
             this.formatCurrency(revenue, restaurantInfo.currencyConfig),
             this.formatCurrency(quantity > 0 ? (revenue / quantity) : 0, restaurantInfo.currencyConfig)
           ])
         })
        
        const topItemsSheet = XLSX.utils.aoa_to_sheet(topItemsData)
        XLSX.utils.book_append_sheet(workbook, topItemsSheet, 'Top Items')
      }
      
      // Daily Trends Sheet
      if (analyticsData.salesByDay && analyticsData.salesByDay.length > 0) {
        const dailyData = [
          ['Daily Revenue Trends'],
          [''],
          ['Date', 'Revenue', 'Orders', 'Average Order Value']
        ]
        
                 analyticsData.salesByDay.forEach(day => {
           try {
             const parsedDate = parseISO(day.date)
             const revenue = day.revenue || 0
             const orders = day.orders || 0
             
                           if (isNaN(parsedDate.getTime())) {
                // If date is invalid, use the original string
                dailyData.push([
                  day.date,
                  this.formatCurrency(revenue, restaurantInfo.currencyConfig),
                  orders.toString(),
                  this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)
                ])
              } else {
                dailyData.push([
                  format(parsedDate, 'MMM dd, yyyy'),
                  this.formatCurrency(revenue, restaurantInfo.currencyConfig),
                  orders.toString(),
                  this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)
                ])
              }
                       } catch (error) {
              // Fallback to original date string if parsing fails
              const revenue = day.revenue || 0
              const orders = day.orders || 0
              dailyData.push([
                day.date,
                this.formatCurrency(revenue, restaurantInfo.currencyConfig),
                orders.toString(),
                this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)
              ])
            }
         })
        
        const dailySheet = XLSX.utils.aoa_to_sheet(dailyData)
        XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Trends')
      }
      
      // Hourly Analysis Sheet
      if (options.includeHourlyData && analyticsData.salesByHour && analyticsData.salesByHour.length > 0) {
        const hourlyData = [
          ['Hourly Performance Analysis'],
          [''],
          ['Hour', 'Revenue', 'Orders', 'Average Order Value']
        ]
        
                 analyticsData.salesByHour.forEach(hour => {
           const revenue = hour.revenue || 0
           const orders = hour.orders || 0
           const hourStr = hour.hour || 'Unknown'
           
                       hourlyData.push([
              hourStr,
              this.formatCurrency(revenue, restaurantInfo.currencyConfig),
              orders.toString(),
              this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)
            ])
         })
        
        const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData)
        XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Analysis')
      }
      
      // Category Performance Sheet
      if (analyticsData.categoryPerformance && analyticsData.categoryPerformance.length > 0) {
        const categoryData = [
          ['Category Performance'],
          [''],
          ['Category', 'Revenue', 'Orders', 'Revenue per Order']
        ]
        
                 analyticsData.categoryPerformance.forEach(category => {
           const revenue = category.revenue || 0
           const orders = category.orders || 0
           const categoryName = category.category || 'Unknown Category'
           
                       categoryData.push([
              categoryName,
              this.formatCurrency(revenue, restaurantInfo.currencyConfig),
              orders.toString(),
              this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)
            ])
         })
        
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Performance')
      }
      
      // Raw Data Sheet
      if (options.includeRawData) {
        const rawData = [
          ['Raw Data Summary'],
          [''],
          ['Revenue Data'],
          ['Metric', 'Value'],
          ['Total Revenue', this.formatCurrency(analyticsData.revenue.total || 0, restaurantInfo.currencyConfig)],
          ['Today\'s Revenue', this.formatCurrency(analyticsData.revenue.today || 0, restaurantInfo.currencyConfig)],
          ['This Week\'s Revenue', this.formatCurrency(analyticsData.revenue.thisWeek || 0, restaurantInfo.currencyConfig)],
          ['This Month\'s Revenue', this.formatCurrency(analyticsData.revenue.thisMonth || 0, restaurantInfo.currencyConfig)],
          ['Revenue Growth', analyticsData.revenue.growth || 0],
          [''],
          ['Order Data'],
          ['Metric', 'Value'],
          ['Total Orders', analyticsData.orders.total || 0],
          ['Today\'s Orders', analyticsData.orders.today || 0],
          ['This Week\'s Orders', analyticsData.orders.thisWeek || 0],
          ['This Month\'s Orders', analyticsData.orders.thisMonth || 0],
          ['Order Growth', analyticsData.orders.growth || 0]
        ]
        
        const rawSheet = XLSX.utils.aoa_to_sheet(rawData)
        XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Data')
      }
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
    } catch (error) {
      console.error('Excel export error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to generate Excel report: ${error.message}`)
      }
      throw new Error('Failed to generate Excel report')
    }
  }

  /**
   * Export analytics data in CSV format
   */
  static exportToCSV(
    analyticsData: AnalyticsData,
    restaurantInfo: RestaurantInfo,
    dateRange: { from: Date; to: Date },
    options: ExportOptions
  ): Blob {
    try {
      // Validate input data
      if (!analyticsData) {
        throw new Error('Analytics data is required')
      }
      
      let csvContent = ''
      
      // Header
      csvContent += `Restaurant Analytics Report\n`
      csvContent += `Restaurant: ${restaurantInfo.name}\n`
      csvContent += `Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}\n`
      csvContent += `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}\n\n`
      
      // Key Metrics
      csvContent += `Key Metrics\n`
      csvContent += `Metric,Value,Growth\n`
      csvContent += `Total Revenue,${this.formatCurrency(analyticsData.revenue.total || 0, restaurantInfo.currencyConfig)},${(analyticsData.revenue.growth || 0).toFixed(1)}%\n`
      csvContent += `Total Orders,${analyticsData.orders.total || 0},${(analyticsData.orders.growth || 0).toFixed(1)}%\n`
      csvContent += `Average Order Value,${this.formatCurrency((analyticsData.revenue.total || 0) / (analyticsData.orders.total || 1), restaurantInfo.currencyConfig)},\n`
      csvContent += `Total Customers,${analyticsData.customers.total || 0},\n`
      csvContent += `New Customers,${analyticsData.customers.new || 0},\n`
      csvContent += `Returning Customers,${analyticsData.customers.returning || 0},\n`
      csvContent += `Customer Retention Rate,${((analyticsData.customers.returning || 0) / (analyticsData.customers.total || 1) * 100).toFixed(1)}%,\n\n`
      
      // Top Items
      if (options.includeTopItems && analyticsData.topItems && analyticsData.topItems.length > 0) {
        csvContent += `Top Performing Items\n`
        csvContent += `Rank,Item Name,Quantity Sold,Revenue Generated,Average Price\n`
                 analyticsData.topItems.forEach((item, index) => {
           const quantity = item.quantity || 0
           const revenue = item.revenue || 0
           const name = item.name || 'Unknown Item'
           
           csvContent += `#${index + 1},${name},${quantity},${this.formatCurrency(revenue, restaurantInfo.currencyConfig)},${this.formatCurrency(quantity > 0 ? (revenue / quantity) : 0, restaurantInfo.currencyConfig)}\n`
         })
        csvContent += '\n'
      }
      
      // Daily Trends
      if (analyticsData.salesByDay && analyticsData.salesByDay.length > 0) {
        csvContent += `Daily Revenue Trends\n`
        csvContent += `Date,Revenue,Orders,Average Order Value\n`
                 analyticsData.salesByDay.forEach(day => {
           try {
             const parsedDate = parseISO(day.date)
             const revenue = day.revenue || 0
             const orders = day.orders || 0
             
             if (isNaN(parsedDate.getTime())) {
               // If date is invalid, use the original string
               csvContent += `${day.date},${this.formatCurrency(revenue, restaurantInfo.currencyConfig)},${orders},${this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)}\n`
             } else {
               csvContent += `${format(parsedDate, 'MMM dd, yyyy')},${this.formatCurrency(revenue, restaurantInfo.currencyConfig)},${orders},${this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)}\n`
             }
                        } catch (error) {
               // Fallback to original date string if parsing fails
               const revenue = day.revenue || 0
               const orders = day.orders || 0
               csvContent += `${day.date},${this.formatCurrency(revenue, restaurantInfo.currencyConfig)},${orders},${this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)}\n`
             }
         })
        csvContent += '\n'
      }
      
      // Hourly Analysis
      if (options.includeHourlyData && analyticsData.salesByHour && analyticsData.salesByHour.length > 0) {
        csvContent += `Hourly Performance Analysis\n`
        csvContent += `Hour,Revenue,Orders,Average Order Value\n`
                 analyticsData.salesByHour.forEach(hour => {
           const revenue = hour.revenue || 0
           const orders = hour.orders || 0
           const hourStr = hour.hour || 'Unknown'
           
                       csvContent += `${hourStr},${this.formatCurrency(revenue, restaurantInfo.currencyConfig)},${orders},${this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)}\n`
         })
        csvContent += '\n'
      }
      
      // Category Performance
      if (analyticsData.categoryPerformance && analyticsData.categoryPerformance.length > 0) {
        csvContent += `Category Performance\n`
        csvContent += `Category,Revenue,Orders,Revenue per Order\n`
                 analyticsData.categoryPerformance.forEach(category => {
           const revenue = category.revenue || 0
           const orders = category.orders || 0
           const categoryName = category.category || 'Unknown Category'
           
                       csvContent += `${categoryName},${this.formatCurrency(revenue, restaurantInfo.currencyConfig)},${orders},${this.formatCurrency(orders > 0 ? (revenue / orders) : 0, restaurantInfo.currencyConfig)}\n`
         })
        csvContent += '\n'
      }
      
      // Raw Data
      if (options.includeRawData) {
        csvContent += `Raw Data Summary\n`
        csvContent += `Revenue Data\n`
        csvContent += `Metric,Value\n`
                 csvContent += `Total Revenue,${this.formatCurrency(analyticsData.revenue.total || 0, restaurantInfo.currencyConfig)}\n`
                 csvContent += `Today's Revenue,${this.formatCurrency(analyticsData.revenue.today || 0, restaurantInfo.currencyConfig)}\n`
         csvContent += `This Week's Revenue,${this.formatCurrency(analyticsData.revenue.thisWeek || 0, restaurantInfo.currencyConfig)}\n`
         csvContent += `This Month's Revenue,${this.formatCurrency(analyticsData.revenue.thisMonth || 0, restaurantInfo.currencyConfig)}\n`
        csvContent += `Revenue Growth,${analyticsData.revenue.growth || 0}\n\n`
        
        csvContent += `Order Data\n`
        csvContent += `Metric,Value\n`
        csvContent += `Total Orders,${analyticsData.orders.total || 0}\n`
        csvContent += `Today's Orders,${analyticsData.orders.today || 0}\n`
        csvContent += `This Week's Orders,${analyticsData.orders.thisWeek || 0}\n`
        csvContent += `This Month's Orders,${analyticsData.orders.thisMonth || 0}\n`
        csvContent += `Order Growth,${analyticsData.orders.growth || 0}\n`
      }
      
      // Add BOM for proper UTF-8 encoding
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent
      return new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' })
      
    } catch (error) {
      console.error('CSV export error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to generate CSV report: ${error.message}`)
      }
      throw new Error('Failed to generate CSV report')
    }
  }

  /**
   * Export analytics data in JSON format
   */
  static exportToJSON(
    analyticsData: AnalyticsData,
    restaurantInfo: RestaurantInfo,
    dateRange: { from: Date; to: Date },
    options: ExportOptions
  ): Blob {
    try {
      // Validate input data
      if (!analyticsData) {
        throw new Error('Analytics data is required')
      }
      
      const jsonData = {
        metadata: {
          restaurant: restaurantInfo,
          dateRange: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
          },
          generated: new Date().toISOString(),
          exportOptions: options
        },
        analytics: analyticsData,
                 insights: this.generateInsights(analyticsData, restaurantInfo.currencyConfig)
      }
      
      const jsonString = JSON.stringify(jsonData, null, 2)
      return new Blob([jsonString], { type: 'application/json' })
      
    } catch (error) {
      console.error('JSON export error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to generate JSON report: ${error.message}`)
      }
      throw new Error('Failed to generate JSON report')
    }
  }

  /**
   * Generate insights from analytics data
   */
  private static generateInsights(analyticsData: AnalyticsData, currencyConfig?: any) {
    const insights = []
    
    // Revenue insights
    if (analyticsData.revenue.growth > 0) {
      insights.push({
        type: 'positive',
        category: 'revenue',
        message: `Revenue increased by ${analyticsData.revenue.growth.toFixed(1)}% compared to the previous period`,
        value: analyticsData.revenue.growth
      })
    } else if (analyticsData.revenue.growth < 0) {
      insights.push({
        type: 'negative',
        category: 'revenue',
        message: `Revenue decreased by ${Math.abs(analyticsData.revenue.growth).toFixed(1)}% compared to the previous period`,
        value: analyticsData.revenue.growth
      })
    }
    
    // Order insights
    if (analyticsData.orders.growth > 0) {
      insights.push({
        type: 'positive',
        category: 'orders',
        message: `Order volume increased by ${analyticsData.orders.growth.toFixed(1)}%`,
        value: analyticsData.orders.growth
      })
    }
    
    // Customer insights
    if (analyticsData.customers.new > 0) {
      insights.push({
        type: 'positive',
        category: 'customers',
        message: `${analyticsData.customers.new} new customers acquired during this period`,
        value: analyticsData.customers.new
      })
    }
    
         // Average order value
     const avgOrderValue = analyticsData.orders.total > 0 ? analyticsData.revenue.total / analyticsData.orders.total : 0
     insights.push({
       type: 'info',
       category: 'performance',
       message: `Average order value: ${this.formatCurrency(avgOrderValue, currencyConfig)}`,
       value: avgOrderValue
     })
    
    return insights
  }

  /**
   * Download file with proper filename
   */
  static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Generate filename based on format and date range
   */
  static generateFilename(
    fileFormat: string,
    restaurantName: string,
    dateRange: { from: Date; to: Date }
  ): string {
    const restaurantSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const dateRangeStr = `${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}`
    
    const extensions = {
      pdf: 'pdf',
      excel: 'xlsx',
      csv: 'csv',
      json: 'json'
    }
    
    return `${restaurantSlug}_analytics_${dateRangeStr}.${extensions[fileFormat as keyof typeof extensions]}`
  }
} 