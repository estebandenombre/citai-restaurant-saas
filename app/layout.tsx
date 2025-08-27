import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/60 to-zinc-50/80 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-slate-50/20 to-zinc-50/30"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-gray-300/10 to-slate-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-slate-300/10 to-zinc-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-gray-300/8 to-slate-400/8 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-slate-300/8 to-zinc-400/8 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
