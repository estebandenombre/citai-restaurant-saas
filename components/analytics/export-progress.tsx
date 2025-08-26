"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  CalendarIcon
} from "lucide-react"
import { format as formatDate } from "date-fns"

interface ExportProgressProps {
  isVisible: boolean
  progress: number
  status: "preparing" | "processing" | "generating" | "completed" | "error"
  format: string
  fileName?: string
  onClose: () => void
}

export function ExportProgress({ 
  isVisible, 
  progress, 
  status, 
  format, 
  fileName, 
  onClose 
}: ExportProgressProps) {
  const [showDownload, setShowDownload] = useState(false)

  useEffect(() => {
    if (status === "completed") {
      setShowDownload(true)
    }
  }, [status])

  if (!isVisible) return null

  const getStatusIcon = () => {
    switch (status) {
      case "preparing":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "processing":
        return <BarChart3 className="h-5 w-5 text-blue-600" />
      case "generating":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "preparing":
        return "Preparing data..."
      case "processing":
        return "Processing analytics..."
      case "generating":
        return "Generating report..."
      case "completed":
        return "Export completed!"
      case "error":
        return "Export failed"
      default:
        return "Preparing..."
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getBadgeVariant = () => {
    switch (status) {
      case "completed":
        return "default"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Export Progress</span>
            <Badge variant={getBadgeVariant()} className="ml-auto">
              {format.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            {getStatusText()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {status === "completed" && fileName && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Report generated successfully
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">{fileName}</p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">
                  Export failed
                </span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            {status === "completed" && (
              <Button className="flex-1" onClick={() => {
                // TODO: Implement actual download
                console.log("Downloading file:", fileName)
              }}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={onClose}
              className={status === "completed" ? "" : "flex-1"}
            >
              {status === "completed" ? "Close" : "Cancel"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ExportSummaryProps {
  format: string
  dateRange: { from: Date; to: Date }
  options: any
}

export function ExportSummary({ format, dateRange, options }: ExportSummaryProps) {
  const includedItems = Object.entries(options)
    .filter(([_, value]) => value === true)
    .map(([key]) => key.replace('include', '').toLowerCase())

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Export Summary</span>
        <Badge variant="outline">{format.toUpperCase()}</Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span>
            {formatDate(dateRange.from, "MMM dd")} - {formatDate(dateRange.to, "MMM dd, yyyy")}
          </span>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-600">Included:</span>
          <div className="flex flex-wrap gap-1">
            {includedItems.map((item) => (
              <Badge key={item} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 