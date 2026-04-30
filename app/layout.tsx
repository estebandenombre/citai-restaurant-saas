import type { Metadata } from "next"
import { Fraunces } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AppProviders } from "@/components/app-providers"
import { getSiteUrl } from "@/lib/site"

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Restaurant Management Software | Tably",
    template: "%s | Tably",
  },
  description:
    "All-in-one restaurant management software for online orders, reservations, kitchen display and inventory. 0% commission on orders.",
  alternates: {
    canonical: getSiteUrl(),
  },
  openGraph: {
    title: "Restaurant Management Software | Tably",
    description:
      "All-in-one restaurant management software for online orders, reservations, kitchen display and inventory.",
    url: getSiteUrl(),
    siteName: "Tably",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant Management Software | Tably",
    description:
      "Run orders, reservations, kitchen and inventory from one platform with 0% commission on orders.",
  },
  icons: {
    icon: '/tably_logo.png',
    shortcut: '/tably_logo.png',
    apple: '/tably_logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = getSiteUrl()
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tably",
    url: siteUrl,
    logo: `${siteUrl}/tably_logo.png`,
    email: "hello@tably.digital",
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Tably",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "29",
      category: "subscription",
    },
    url: siteUrl,
    publisher: {
      "@type": "Organization",
      name: "Tably",
    },
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`}
    >
      <head>
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="tol2ZTFF5YglM7V0jPkMrg"
          async
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        <AppProviders>
          <div className="min-h-screen bg-background">{children}</div>
        </AppProviders>
      </body>
    </html>
  )
}
