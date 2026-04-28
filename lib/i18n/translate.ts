import type { AppLocale } from "./config"
import { en } from "./messages/en"
import { esES } from "./messages/es-ES"
import { DEFAULT_LOCALE } from "./config"

const byLocale: Record<AppLocale, typeof en> = {
  en,
  "es-ES": esES,
}

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".")
  let current: unknown = obj
  for (const p of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[p]
  }
  return typeof current === "string" ? current : undefined
}

function interpolate(
  str: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_match, key: string) =>
    String(vars[key] ?? "")
  )
}

/**
 * @param key — Dot path, e.g. `nav.items.orders`
 */
export function translate(
  locale: AppLocale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = byLocale[locale] ?? byLocale[DEFAULT_LOCALE]
  const primary = getByPath(dict as unknown as Record<string, unknown>, key)
  if (primary !== undefined) return interpolate(primary, vars)
  if (locale !== DEFAULT_LOCALE) {
    const fallback = getByPath(
      byLocale[DEFAULT_LOCALE] as unknown as Record<string, unknown>,
      key
    )
    if (fallback !== undefined) return interpolate(fallback, vars)
  }
  return key
}
