import { cn } from "@/lib/utils"
import Image from "next/image"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function Loading({ className, size = "md", text = "Loading..." }: LoadingProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] py-16 w-full", className)}>
      {/* Modern Logo Animation Container */}
      <div className="relative flex justify-center">
        {/* Glowing Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse",
          sizeClasses[size]
        )} />
        
        {/* Logo Container with Glass Effect */}
        <div className={cn(
          "relative bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border border-white/20",
          sizeClasses[size]
        )}>
          {/* Logo with Scale Animation */}
          <div className="animate-pulse">
            <Image
              src="/tably_logo.png"
              alt="Tably"
              width={size === "sm" ? 32 : size === "md" ? 48 : 64}
              height={size === "sm" ? 32 : size === "md" ? 48 : 64}
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Rotating Rings */}
        <div className={cn(
          "absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin",
          sizeClasses[size]
        )} style={{ animationDuration: '3s' }} />
        
        <div className={cn(
          "absolute inset-0 border border-indigo-400/40 rounded-full animate-spin",
          sizeClasses[size]
        )} style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        
        {/* Pulsing Ring */}
        <div className={cn(
          "absolute inset-0 border border-purple-400/50 rounded-full animate-ping",
          sizeClasses[size]
        )} style={{ animationDuration: '2.5s' }} />
      </div>
      
      {/* Modern Loading Text */}
      <div className="mt-8 text-center w-full">
        <p className="text-gray-400 font-medium text-lg">{text}</p>
      </div>
    </div>
  )
}

// Full Page Loading Component with Modern Design
export function FullPageLoading({ text = "Loading Tably..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/60 to-zinc-50/80 flex items-center justify-center">
      <div className="text-center">
        {/* Large Modern Logo Animation */}
        <div className="relative mb-12">
          {/* Glowing Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 rounded-full blur-2xl animate-pulse w-40 h-40" />
          
          {/* Logo Container with Glass Effect */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/30 w-40 h-40">
            {/* Logo with Scale Animation */}
            <div className="animate-pulse">
              <Image
                src="/tably_logo.png"
                alt="Tably"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
          
          {/* Multiple Rotating Rings */}
          <div className="absolute inset-0 border-4 border-blue-400/40 rounded-full animate-spin" 
               style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 border-2 border-indigo-400/50 rounded-full animate-spin" 
               style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 border border-purple-400/60 rounded-full animate-ping" 
               style={{ animationDuration: '3.5s' }} />
        </div>
        
        {/* Modern Loading Text */}
        <h2 className="text-2xl font-bold text-gray-400 mb-3">
          {text}
        </h2>
        <p className="text-gray-400 text-lg">Preparing your dashboard...</p>
      </div>
    </div>
  )
} 