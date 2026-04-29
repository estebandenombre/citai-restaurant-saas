import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const lastModified = new Date()

  const paths = [
    "",
    "/pricing",
    "/software-gestion-restaurantes",
    "/pedidos-online-restaurante",
    "/reservas-restaurantes",
    "/pantalla-cocina-kds",
    "/inventario-restaurante",
    "/sobre-tably",
    "/legal/privacy",
    "/legal/terms",
  ]

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/legal/") ? 0.3 : 0.8,
  }))
}
