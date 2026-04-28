import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LucideIcon, ShoppingCart, TrendingUp, Users } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }
  action?: {
    label: string
    icon?: LucideIcon
    onClick: () => void
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost"
  }
  className?: string
  showStats?: boolean
  stats?: {
    orders?: number
    revenue?: number
    staff?: number
  }
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  badge, 
  action,
  className,
  showStats = false,
  stats
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/90 bg-card p-6 md:p-7 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-foreground"
              aria-hidden
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">
                {title}
              </h1>
              {badge && (
                <Badge
                  variant={badge.variant || "secondary"}
                  className={cn("text-[11px] font-mono font-normal normal-case tracking-[0.1em]", badge.className)}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "outline"}
            className="shrink-0"
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>

      {showStats && stats && (
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border/80 pt-6 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
              <ShoppingCart className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                Today&rsquo;s orders
              </p>
              <p className="text-xl font-medium tabular-nums tracking-tight text-foreground" data-slot="metric">
                {stats.orders ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
              <TrendingUp className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                Revenue
              </p>
              <p
                className="text-xl font-medium tabular-nums tracking-tight text-foreground"
                data-slot="metric"
              >
                ${stats.revenue?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
              <Users className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                Active staff
              </p>
              <p
                className="text-xl font-medium tabular-nums tracking-tight text-foreground"
                data-slot="metric"
              >
                {stats.staff ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
