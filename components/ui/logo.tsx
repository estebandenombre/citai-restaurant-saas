import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "space-x-1",
      image: "w-10 h-10",
      text: "text-sm"
    },
    md: {
      container: "space-x-2",
      image: "w-12 h-12",
      text: "text-xl"
    },
    lg: {
      container: "space-x-3",
      image: "w-16 h-16",
      text: "text-2xl"
    },
    xl: {
      container: "space-x-3",
      image: "w-20 h-20",
      text: "text-3xl"
    },
    "2xl": {
      container: "space-x-3",
      image: "w-40 h-40",
      text: "text-4xl"
    }
  }

  const classes = sizeClasses[size]
  
  // Use complete logo when showText is true, simple logo when false
  const logoSrc = showText ? "/tably_logo_completo.png" : "/tably_logo.png"

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logoSrc}
        alt="Tably Logo"
        width={160}
        height={160}
        className={cn("object-contain", classes.image)}
      />
      {/* Only show text if using simple logo */}
      {showText && logoSrc === "/tably_logo.png" && (
        <span className={cn("font-bold text-gray-900 ml-2", classes.text)}>
          Tably
        </span>
      )}
    </div>
  )
} 