import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/auth/", "/test-", "/debug-auth", "/fix-orders"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
