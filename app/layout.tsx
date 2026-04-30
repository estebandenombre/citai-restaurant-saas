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
  title: "Tably - Restaurant Management",
  description: "Modern restaurant management platform",
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
      </head>
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        <AppProviders>
          <div className="min-h-screen bg-background">{children}</div>
        </AppProviders>
      </body>
    </html>
  )
}
