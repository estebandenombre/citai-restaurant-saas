/**
 * BCP-47 language tags. UI strings use `en` and `es-ES` (español de España).
 */
export const SUPPORTED_APP_LOCALES = ["en", "es-ES"] as const
export type AppLocale = (typeof SUPPORTED_APP_LOCALES)[number]

export const LOCALE_STORAGE_KEY = "tably-locale"
export const DEFAULT_LOCALE: AppLocale = "es-ES"

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  "es-ES": "Español (España)",
}

/** For `Date#toLocaleDateString` / `Intl` */
export function bcp47ForIntl(locale: AppLocale): string {
  if (locale === "es-ES") return "es-ES"
  return "en-GB"
}

/** For <html lang> */
export function documentLangAttribute(locale: AppLocale): string {
  if (locale === "es-ES") return "es-ES"
  return "en"
}
