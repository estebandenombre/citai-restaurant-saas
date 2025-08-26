"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CalendarIcon, 
  Download, 
  FileText, 
  BarChart3, 
  FileSpreadsheet, 
  FileJson, 
  File,
  Settings,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { format as formatDate, parseISO, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

interface ExportReportProps {
  onExport: (format: string, dateRange: { from: Date; to: Date }, options: ExportOptions) => void
}

interface ExportOptions {
  includeCharts: boolean
  includeRawData: boolean
  includeInsights: boolean
  includeTopItems: boolean
  includeHourlyData: boolean
  includeCustomerData: boolean
}

export function ExportReport({ onExport }: ExportReportProps) {
  const [format, setFormat] = useState("pdf")
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date()
  })
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCharts: true,
    includeRawData: true,
    includeInsights: true,
    includeTopItems: true,
    includeHourlyData: false,
    includeCustomerData: false
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport(format, dateRange, exportOptions)
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    { value: "pdf", label: "PDF Report", icon: File, description: "Professional report with charts" },
    { value: "excel", label: "Excel Spreadsheet", icon: FileSpreadsheet, description: "Interactive data analysis" },
    { value: "csv", label: "CSV Data", icon: FileText, description: "Raw data for external tools" },
    { value: "json", label: "JSON Data", icon: FileJson, description: "API-ready data format" }
  ]

  const daysSelected = differenceInDays(dateRange.to, dateRange.from) + 1

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <span>Export Report</span>
        </CardTitle>
        <CardDescription>
          Generate comprehensive analytics reports with customizable options
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Report Format</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative p-4 border rounded-lg cursor-pointer transition-all",
                  format === option.value
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
                onClick={() => setFormat(option.value)}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    format === option.value ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    <option.icon className={cn(
                      "h-4 w-4",
                      format === option.value ? "text-blue-600" : "text-gray-600"
                    )} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{option.label}</h4>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  </div>
                  {format === option.value && (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Date Range Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Date Range</span>
            <Badge variant="secondary" className="text-xs">
              {daysSelected} days
            </Badge>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? formatDate(dateRange.from, "MMM dd, yyyy") : <span>Start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? formatDate(dateRange.to, "MMM dd, yyyy") : <span>End date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Separator />

        {/* Export Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Include in Report</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={exportOptions.includeCharts}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeCharts: checked as boolean }))
                  }
                />
                <label htmlFor="includeCharts" className="text-sm font-medium flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Charts & Visualizations</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRawData"
                  checked={exportOptions.includeRawData}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeRawData: checked as boolean }))
                  }
                />
                <label htmlFor="includeRawData" className="text-sm font-medium flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Raw Data</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInsights"
                  checked={exportOptions.includeInsights}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeInsights: checked as boolean }))
                  }
                />
                <label htmlFor="includeInsights" className="text-sm font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Performance Insights</span>
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTopItems"
                  checked={exportOptions.includeTopItems}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeTopItems: checked as boolean }))
                  }
                />
                <label htmlFor="includeTopItems" className="text-sm font-medium flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Top Performing Items</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHourlyData"
                  checked={exportOptions.includeHourlyData}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeHourlyData: checked as boolean }))
                  }
                />
                <label htmlFor="includeHourlyData" className="text-sm font-medium flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Hourly Breakdown</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCustomerData"
                  checked={exportOptions.includeCustomerData}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeCustomerData: checked as boolean }))
                  }
                />
                <label htmlFor="includeCustomerData" className="text-sm font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Customer Analytics</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={handleExport} 
            className="flex-1"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setDateRange({
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                to: new Date()
              })
              setExportOptions({
                includeCharts: true,
                includeRawData: true,
                includeInsights: true,
                includeTopItems: true,
                includeHourlyData: false,
                includeCustomerData: false
              })
            }}
          >
            Reset
          </Button>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900">Export Information</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• <strong>PDF:</strong> Professional reports with charts and insights</p>
                <p>• <strong>Excel:</strong> Interactive spreadsheets for data analysis</p>
                <p>• <strong>CSV:</strong> Raw data export for external tools</p>
                <p>• <strong>JSON:</strong> API-ready format for integrations</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickExportProps {
  onQuickExport: (period: string) => void
}

export function QuickExport({ onQuickExport }: QuickExportProps) {
  const quickPeriods = [
    { 
      label: "Today", 
      value: "today", 
      icon: Clock,
      description: "Current day data",
      color: "bg-green-100 text-green-700 border-green-200"
    },
    { 
      label: "This Week", 
      value: "week", 
      icon: TrendingUp,
      description: "Last 7 days",
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    { 
      label: "This Month", 
      value: "month", 
      icon: CalendarIcon,
      description: "Current month",
      color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    { 
      label: "Last 30 Days", 
      value: "30d", 
      icon: BarChart3,
      description: "Past 30 days",
      color: "bg-orange-100 text-orange-700 border-orange-200"
    },
    { 
      label: "Last 90 Days", 
      value: "90d", 
      icon: FileText,
      description: "Quarterly data",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200"
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Quick Export</span>
        </CardTitle>
        <CardDescription>
          Export pre-configured reports for common time periods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {quickPeriods.map((period) => (
            <Button
              key={period.value}
              variant="outline"
              className={cn(
                "h-auto p-4 justify-start",
                period.color
              )}
              onClick={() => onQuickExport(period.value)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="p-2 bg-white/50 rounded-lg">
                  <period.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{period.label}</div>
                  <div className="text-xs opacity-75">{period.description}</div>
                </div>
                <Download className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Tip:</p>
          <p>Quick exports use default settings and include all standard analytics data for the selected period.</p>
        </div>
      </CardContent>
    </Card>
  )
} 