"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n/i18n-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </I18nProvider>
  )
}
