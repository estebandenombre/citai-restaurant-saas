"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  type AppLocale,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_APP_LOCALES,
  bcp47ForIntl,
  documentLangAttribute,
} from "@/lib/i18n/config"
import { translate } from "@/lib/i18n/translate"

function isAppLocale(s: string | null): s is AppLocale {
  return s === "en" || s === "es-ES"
}

function readStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isAppLocale(raw)) return raw
  } catch {
    // ignore
  }
  return null
}

function inferLocaleFromBrowser(): AppLocale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE
  const langs = [navigator.language, ...(navigator.languages ?? [])]
  for (const l of langs) {
    if (l === "es-ES" || l === "ca-ES" || l === "gl-ES" || l === "eu-ES") {
      return "es-ES"
    }
  }
  if (langs.some((l) => l.startsWith("es"))) {
    return "es-ES"
  }
  return DEFAULT_LOCALE
}

type I18nValue = {
  locale: AppLocale
  setLocale: (l: AppLocale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  intlLocale: string
  supportedLocales: readonly AppLocale[]
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE)

  useEffect(() => {
    const fromStorage = readStoredLocale()
    if (fromStorage) {
      setLocaleState(fromStorage)
      return
    }
    setLocaleState(inferLocaleFromBrowser())
  }, [])

  const setLocale = useCallback((l: AppLocale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.lang = documentLangAttribute(locale)
  }, [locale])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  )

  const intlLocale = bcp47ForIntl(locale)

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t,
      intlLocale,
      supportedLocales: SUPPORTED_APP_LOCALES,
    }),
    [locale, setLocale, t, intlLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return ctx
}

export function useI18nOptional(): I18nValue | null {
  return useContext(I18nContext)
}
