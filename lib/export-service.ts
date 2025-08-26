import { pdfGenerator } from './pdf-generator'
import * as XLSX from 'xlsx'
import { format, parseISO } from 'date-fns'

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
}

export class ExportService {
  
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
        ['Total Revenue', `$${analyticsData.revenue.total.toFixed(2)}`, `${analyticsData.revenue.growth.toFixed(1)}%`],
        ['Total Orders', analyticsData.orders.total, `${analyticsData.orders.growth.toFixed(1)}%`],
        ['Average Order Value', `$${(analyticsData.revenue.total / analyticsData.orders.total).toFixed(2)}`, ''],
        ['Total Customers', analyticsData.customers.total, ''],
        ['New Customers', analyticsData.customers.new, ''],
        ['Returning Customers', analyticsData.customers.returning, ''],
        ['Customer Retention Rate', `${(analyticsData.customers.returning / analyticsData.customers.total * 100).toFixed(1)}%`, '']
      ]
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary')
      
      // Top Items Sheet
      if (options.includeTopItems && analyticsData.topItems.length > 0) {
        const topItemsData = [
          ['Top Performing Items'],
          [''],
          ['Rank', 'Item Name', 'Quantity Sold', 'Revenue Generated', 'Average Price']
        ]
        
        analyticsData.topItems.forEach((item, index) => {
          topItemsData.push([
            `#${index + 1}`,
            item.name,
            item.quantity.toString(),
            `$${item.revenue.toFixed(2)}`,
            `$${(item.revenue / item.quantity).toFixed(2)}`
          ])
        })
        
        const topItemsSheet = XLSX.utils.aoa_to_sheet(topItemsData)
        XLSX.utils.book_append_sheet(workbook, topItemsSheet, 'Top Items')
      }
      
      // Daily Trends Sheet
      if (analyticsData.salesByDay.length > 0) {
        const dailyData = [
          ['Daily Revenue Trends'],
          [''],
          ['Date', 'Revenue', 'Orders', 'Average Order Value']
        ]
        
        analyticsData.salesByDay.forEach(day => {
          dailyData.push([
            format(parseISO(day.date), 'MMM dd, yyyy'),
            day.revenue.toString(),
            day.orders.toString(),
            (day.orders > 0 ? (day.revenue / day.orders) : 0).toString()
          ])
        })
        
        const dailySheet = XLSX.utils.aoa_to_sheet(dailyData)
        XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Trends')
      }
      
      // Hourly Analysis Sheet
      if (options.includeHourlyData && analyticsData.salesByHour.length > 0) {
        const hourlyData = [
          ['Hourly Performance Analysis'],
          [''],
          ['Hour', 'Revenue', 'Orders', 'Average Order Value']
        ]
        
        analyticsData.salesByHour.forEach(hour => {
          hourlyData.push([
            hour.hour,
            hour.revenue.toString(),
            hour.orders.toString(),
            (hour.orders > 0 ? (hour.revenue / hour.orders) : 0).toString()
          ])
        })
        
        const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData)
        XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Analysis')
      }
      
      // Category Performance Sheet
      if (analyticsData.categoryPerformance.length > 0) {
        const categoryData = [
          ['Category Performance'],
          [''],
          ['Category', 'Revenue', 'Orders', 'Revenue per Order']
        ]
        
        analyticsData.categoryPerformance.forEach(category => {
          categoryData.push([
            category.category,
            category.revenue.toString(),
            category.orders.toString(),
            (category.orders > 0 ? (category.revenue / category.orders) : 0).toString()
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
          ['Total Revenue', analyticsData.revenue.total],
          ['Today\'s Revenue', analyticsData.revenue.today],
          ['This Week\'s Revenue', analyticsData.revenue.thisWeek],
          ['This Month\'s Revenue', analyticsData.revenue.thisMonth],
          ['Revenue Growth', analyticsData.revenue.growth],
          [''],
          ['Order Data'],
          ['Metric', 'Value'],
          ['Total Orders', analyticsData.orders.total],
          ['Today\'s Orders', analyticsData.orders.today],
          ['This Week\'s Orders', analyticsData.orders.thisWeek],
          ['This Month\'s Orders', analyticsData.orders.thisMonth],
          ['Order Growth', analyticsData.orders.growth]
        ]
        
        const rawSheet = XLSX.utils.aoa_to_sheet(rawData)
        XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Data')
      }
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
    } catch (error) {
      console.error('Excel export error:', error)
      throw new Error('Failed to generate Excel report')
    }
  }

  /**
   * Export analytics data in CSV format
   */
  static async exportToCSV(
    analyticsData: AnalyticsData,
    restaurantInfo: RestaurantInfo,
    dateRange: { from: Date; to: Date },
    options: ExportOptions
  ): Promise<Blob> {
    try {
      let csvContent = ''
      
      // Header
      csvContent += `Restaurant Analytics Report\n`
      csvContent += `Restaurant: ${restaurantInfo.name}\n`
      csvContent += `Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}\n`
      csvContent += `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}\n\n`
      
      // Key Metrics
      csvContent += `Key Metrics\n`
      csvContent += `Metric,Value,Growth\n`
      csvContent += `Total Revenue,$${analyticsData.revenue.total.toFixed(2)},${analyticsData.revenue.growth.toFixed(1)}%\n`
      csvContent += `Total Orders,${analyticsData.orders.total},${analyticsData.orders.growth.toFixed(1)}%\n`
      csvContent += `Average Order Value,$${(analyticsData.revenue.total / analyticsData.orders.total).toFixed(2)},\n`
      csvContent += `Total Customers,${analyticsData.customers.total},\n`
      csvContent += `New Customers,${analyticsData.customers.new},\n`
      csvContent += `Returning Customers,${analyticsData.customers.returning},\n`
      csvContent += `Customer Retention Rate,${(analyticsData.customers.returning / analyticsData.customers.total * 100).toFixed(1)}%,\n\n`
      
      // Top Items
      if (options.includeTopItems && analyticsData.topItems.length > 0) {
        csvContent += `Top Performing Items\n`
        csvContent += `Rank,Item Name,Quantity Sold,Revenue Generated,Average Price\n`
        analyticsData.topItems.forEach((item, index) => {
          csvContent += `#${index + 1},${item.name},${item.quantity},$${item.revenue.toFixed(2)},$${(item.revenue / item.quantity).toFixed(2)}\n`
        })
        csvContent += '\n'
      }
      
      // Daily Trends
      if (analyticsData.salesByDay.length > 0) {
        csvContent += `Daily Revenue Trends\n`
        csvContent += `Date,Revenue,Orders,Average Order Value\n`
        analyticsData.salesByDay.forEach(day => {
          csvContent += `${format(parseISO(day.date), 'MMM dd, yyyy')},${day.revenue},${day.orders},${day.orders > 0 ? (day.revenue / day.orders) : 0}\n`
        })
        csvContent += '\n'
      }
      
      // Hourly Analysis
      if (options.includeHourlyData && analyticsData.salesByHour.length > 0) {
        csvContent += `Hourly Performance Analysis\n`
        csvContent += `Hour,Revenue,Orders,Average Order Value\n`
        analyticsData.salesByHour.forEach(hour => {
          csvContent += `${hour.hour},${hour.revenue},${hour.orders},${hour.orders > 0 ? (hour.revenue / hour.orders) : 0}\n`
        })
        csvContent += '\n'
      }
      
      // Category Performance
      if (analyticsData.categoryPerformance.length > 0) {
        csvContent += `Category Performance\n`
        csvContent += `Category,Revenue,Orders,Revenue per Order\n`
        analyticsData.categoryPerformance.forEach(category => {
          csvContent += `${category.category},${category.revenue},${category.orders},${category.orders > 0 ? (category.revenue / category.orders) : 0}\n`
        })
        csvContent += '\n'
      }
      
      // Raw Data
      if (options.includeRawData) {
        csvContent += `Raw Data Summary\n`
        csvContent += `Revenue Data\n`
        csvContent += `Metric,Value\n`
        csvContent += `Total Revenue,${analyticsData.revenue.total}\n`
        csvContent += `Today's Revenue,${analyticsData.revenue.today}\n`
        csvContent += `This Week's Revenue,${analyticsData.revenue.thisWeek}\n`
        csvContent += `This Month's Revenue,${analyticsData.revenue.thisMonth}\n`
        csvContent += `Revenue Growth,${analyticsData.revenue.growth}\n\n`
        
        csvContent += `Order Data\n`
        csvContent += `Metric,Value\n`
        csvContent += `Total Orders,${analyticsData.orders.total}\n`
        csvContent += `Today's Orders,${analyticsData.orders.today}\n`
        csvContent += `This Week's Orders,${analyticsData.orders.thisWeek}\n`
        csvContent += `This Month's Orders,${analyticsData.orders.thisMonth}\n`
        csvContent += `Order Growth,${analyticsData.orders.growth}\n`
      }
      
      return new Blob([csvContent], { type: 'text/csv' })
      
    } catch (error) {
      console.error('CSV export error:', error)
      throw new Error('Failed to generate CSV report')
    }
  }

  /**
   * Export analytics data in JSON format
   */
  static async exportToJSON(
    analyticsData: AnalyticsData,
    restaurantInfo: RestaurantInfo,
    dateRange: { from: Date; to: Date },
    options: ExportOptions
  ): Promise<Blob> {
    try {
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
        insights: this.generateInsights(analyticsData)
      }
      
      const jsonString = JSON.stringify(jsonData, null, 2)
      return new Blob([jsonString], { type: 'application/json' })
      
    } catch (error) {
      console.error('JSON export error:', error)
      throw new Error('Failed to generate JSON report')
    }
  }

  /**
   * Generate insights from analytics data
   */
  private static generateInsights(analyticsData: AnalyticsData) {
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
      message: `Average order value: $${avgOrderValue.toFixed(2)}`,
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