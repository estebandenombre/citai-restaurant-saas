import type { Metadata, Viewport } from "next"
import { Inter, Manrope } from "next/font/google"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Tably - Transforma tu Restaurante | Gestión Completa de Operaciones",
  description: "La plataforma completa para restaurantes modernos. Gestión de pedidos, reservas, inventario y analytics en una sola solución. Reduce errores en un 80% y aumenta la eficiencia.",
  keywords: "restaurante, gestión, pedidos, reservas, inventario, analytics, Tably",
  openGraph: {
    title: "Tably - Transforma tu Restaurante",
    description: "La plataforma completa para restaurantes modernos. Reduce errores en un 80% y aumenta la eficiencia.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tably - Transforma tu Restaurante",
    description: "La plataforma completa para restaurantes modernos",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function PromoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
