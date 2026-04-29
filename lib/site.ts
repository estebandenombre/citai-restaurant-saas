/**
 * Canonical site origin for metadata, sitemap and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://tudominio.com).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (explicit) return explicit
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`
  return "https://tably.digital"
}
