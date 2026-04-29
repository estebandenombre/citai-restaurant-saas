import Link from "next/link"
import { Fraunces } from "next/font/google"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { ReactNode } from "react"

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display-seo",
})

const productLinks = [
  { href: "/software-gestion-restaurantes", label: "Gestión" },
  { href: "/pedidos-online-restaurante", label: "Pedidos online" },
  { href: "/reservas-restaurantes", label: "Reservas" },
  { href: "/pantalla-cocina-kds", label: "KDS" },
  { href: "/inventario-restaurante", label: "Inventario" },
]

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

type Breadcrumb = { label: string; href?: string }

type SeoShellProps = {
  children: ReactNode
  breadcrumbs?: Breadcrumb[]
}

export function SeoShell({ children, breadcrumbs }: SeoShellProps) {
  return (
    <div
      className={`${display.variable} min-h-screen bg-[#F5F1E8] text-zinc-950 antialiased selection:bg-zinc-950 selection:text-[#F5F1E8]`}
    >
      <header className="sticky top-0 z-50 border-b border-zinc-900/10 bg-[#F5F1E8]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size="sm" showText={false} />
            <span className={`${display.className} text-xl font-medium tracking-tight`}>
              Tably<span className="text-zinc-400">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {productLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-900/5 hover:text-zinc-950"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="rounded-full px-3 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-900/5 hover:text-zinc-950"
            >
              Precios
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden text-sm text-zinc-700 hover:text-zinc-950 sm:inline-flex">
              Iniciar sesión
            </Link>
            <Link href="/auth/register">
              <Button className="h-9 rounded-full border-0 bg-zinc-950 px-4 text-sm font-medium text-[#F5F1E8] shadow-none hover:bg-zinc-800">
                Crear cuenta
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="border-b border-zinc-900/10 bg-[#EFEBE0]/80">
          <div className="mx-auto max-w-[1400px] px-6 py-3 lg:px-10">
            <nav aria-label="Migas de pan" className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="text-zinc-700 hover:text-zinc-950">
                    Inicio
                  </Link>
                </li>
                {breadcrumbs.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span aria-hidden className="text-zinc-400">
                      /
                    </span>
                    {b.href ? (
                      <Link href={b.href} className="text-zinc-700 hover:text-zinc-950">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-zinc-950">{b.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      )}

      {children}

      <footer className="border-t border-zinc-900/10 bg-zinc-950 text-[#F5F1E8]">
        <div className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <p className={`${display.className} text-2xl font-light italic leading-snug`}>
                Tably — software de gestión para restaurantes, sin comisiones por pedido.
              </p>
              <p className="mt-4 max-w-md text-sm text-zinc-400">
                Datos en la UE. Prueba gratuita. Cancela cuando quieras.
              </p>
            </div>
            <div className="md:col-span-3">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Soluciones</div>
              <ul className="space-y-2 text-sm text-zinc-300">
                {productLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-3">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Empresa</div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <Link href="/sobre-tably" className="hover:text-white">
                    Sobre Tably
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-white">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-white">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
            <span className="font-mono">© {new Date().getFullYear()} Tably Studio S.L.</span>
            <a href="mailto:hello@tably.digital" className="hover:text-white">
              hello@tably.digital
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
