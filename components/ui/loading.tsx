import { cn } from "@/lib/utils"
import Image from "next/image"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function Loading({ className, size = "md", text = "Loading…" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  return (
    <div className={cn("flex w-full min-h-[320px] flex-col items-center justify-center py-16", className)}>
      <div className={cn("relative flex items-center justify-center rounded-2xl border border-border bg-card shadow-sm", sizeClasses[size])}>
        <div className="absolute inset-0 rounded-2xl border border-foreground/5" aria-hidden />
        <Image
          src="/tably_logo.png"
          alt=""
          width={size === "sm" ? 36 : size === "md" ? 52 : 68}
          height={size === "sm" ? 36 : size === "md" ? 52 : 68}
          className="relative animate-pulse object-contain opacity-90"
        />
      </div>
      <p className="mt-6 text-center font-mono text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

export function FullPageLoading({ text = "Tably" }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <Image
            src="/tably_logo.png"
            alt=""
            width={64}
            height={64}
            className="animate-pulse object-contain"
          />
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {text}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Preparing your workspace</p>
      </div>
    </div>
  )
}
