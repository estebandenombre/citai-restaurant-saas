"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2 } from 'lucide-react'
import { TicketGenerator, OrderData } from '@/lib/ticket-generator'

interface DownloadTicketButtonProps {
  orderData: OrderData
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export default function DownloadTicketButton({
  orderData,
  className = '',
  variant = 'outline',
  size = 'default'
}: DownloadTicketButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    
    try {
      // Generate and download the ticket
      TicketGenerator.downloadTicket(orderData)
      
      // Optional: Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Error downloading ticket:', error)
      // You could show a toast notification here
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
    >
      {downloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Ticket
        </>
      )}
    </Button>
  )
}

