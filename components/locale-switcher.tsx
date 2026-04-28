"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LOCALE_LABELS, type AppLocale } from "@/lib/i18n/config"
import { useI18n } from "@/components/i18n/i18n-provider"
import { Globe } from "lucide-react"

type LocaleSwitcherProps = {
  collapsed?: boolean
  inline?: boolean
  className?: string
}

export function LocaleSwitcher({ collapsed, inline, className }: LocaleSwitcherProps) {
  const { locale, setLocale, t, supportedLocales } = useI18n()

  if (collapsed) {
    return (
      <div className={`flex justify-center px-1 py-1 ${className ?? ""}`}>
        <Select
          value={locale}
          onValueChange={(v) => setLocale(v as AppLocale)}
        >
          <SelectTrigger
            className="h-8 w-8 shrink-0 border-0 bg-transparent p-0 shadow-none hover:bg-muted/60"
            aria-label={t("nav.language")}
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            {supportedLocales.map((code) => (
              <SelectItem key={code} value={code}>
                {LOCALE_LABELS[code]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className={`${inline ? "flex items-center gap-2 px-2.5" : "space-y-1.5 px-2.5"} ${className ?? ""}`}>
      <p className={`${inline ? "font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground whitespace-nowrap" : "px-1 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground"}`}>
        {t("nav.language")}
      </p>
      <Select
        value={locale}
        onValueChange={(v) => setLocale(v as AppLocale)}
      >
        <SelectTrigger className={`h-9 rounded-xl border-border bg-background text-left text-sm ${inline ? "w-[190px]" : "w-full"}`}>
          <Globe className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {supportedLocales.map((code) => (
            <SelectItem key={code} value={code}>
              {LOCALE_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
