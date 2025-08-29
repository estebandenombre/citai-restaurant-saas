"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Clock } from "lucide-react"

interface EmailStatusBadgeProps {
  emailSent: boolean
  customerEmail?: string
  className?: string
}

export function EmailStatusBadge({ 
  emailSent, 
  customerEmail, 
  className = "" 
}: EmailStatusBadgeProps) {
  if (!customerEmail) {
    return (
      <Badge variant="secondary" className={`text-xs ${className}`}>
        <Mail className="w-3 h-3 mr-1" />
        Sin email
      </Badge>
    )
  }

  if (emailSent) {
    return (
      <Badge variant="default" className={`text-xs bg-green-100 text-green-800 hover:bg-green-100 ${className}`}>
        <CheckCircle className="w-3 h-3 mr-1" />
        Email enviado
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className={`text-xs ${className}`}>
      <XCircle className="w-3 h-3 mr-1" />
      Error email
    </Badge>
  )
}

interface EmailStatusIndicatorProps {
  emailSent?: boolean
  customerEmail?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmailStatusIndicator({ 
  emailSent, 
  customerEmail, 
  size = 'sm' 
}: EmailStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (!customerEmail) {
    return (
      <div className="flex items-center justify-center">
        <Mail className={`${sizeClasses[size]} text-gray-400`} />
      </div>
    )
  }

  if (emailSent === true) {
    return (
      <div className="flex items-center justify-center">
        <CheckCircle className={`${sizeClasses[size]} text-green-500`} />
      </div>
    )
  }

  if (emailSent === false) {
    return (
      <div className="flex items-center justify-center">
        <XCircle className={`${sizeClasses[size]} text-red-500`} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <Clock className={`${sizeClasses[size]} text-yellow-500 animate-pulse`} />
    </div>
  )
}
