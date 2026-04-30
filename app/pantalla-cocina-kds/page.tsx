import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SeoShell, JsonLd } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"
import { ArrowRight } from "lucide-react"

const path = "/pantalla-cocina-kds"

export const metadata: Metadata = {
  title: "Pantalla de cocina KDS para restaurantes | Tably",
  description:
    "Kitchen Display System: tickets por estación, tiempos de curso, vista de pase y menos errores en el rush. Integrado con pedidos sala y online.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
  openGraph: {
    title: "KDS · Pantalla de cocina para restaurantes | Tably",
    description: "Organiza comandas por estación y mantén el pase bajo control.",
    url: `${getSiteUrl()}${path}`,
    siteName: "Tably",
    locale: "es_ES",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "KDS · Pantalla de cocina para restaurantes | Tably",
    description: "Organiza comandas por estación y mantén el pase bajo control.",
  },
}

export default function PantallaCocinaKdsPage() {
  const site = getSiteUrl()
  const url = `${site}${path}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: metadata.title as string,
    description: metadata.description as string,
    url,
    isPartOf: { "@type": "WebSite", name: "Tably", url: site },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: site },
        { "@type": "ListItem", position: 2, name: "Pantalla de cocina KDS", item: url },
      ],
    },
  }

  return (
    <SeoShell breadcrumbs={[{ label: "KDS cocina" }]}>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Guía · Cocina</p>
        <h1 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.02em] text-zinc-950 md:text-5xl lg:text-[3.25rem]">
          KDS: pantalla de cocina que aguanta el <span className="italic text-[#7C3AED]">viernes noche</span>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-zinc-700">
          Los tickets en papel siguen teniendo su sitio, pero cuando el viento del aire acondicionado se lleva una comanda o la
          impresora decide jubilarse en pleno servicio, un Kitchen Display System estable es el plan B que se convierte en plan A.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-700">
          Tably enruta pedidos desde{" "}
          <Link href="/reservas-restaurantes" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            sala y reservas
          </Link>{" "}
          y desde{" "}
          <Link href="/pedidos-online-restaurante" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            canal online
          </Link>{" "}
          hacia estaciones configurables, para que parrilla, fríos y pastelería vean solo lo que les corresponde.
        </p>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Qué soluciona un KDS bien montado
        </h2>
        <ul className="mt-6 space-y-4 text-zinc-700">
          <li>
            <strong className="text-zinc-900">Prioridad legible</strong> — tiempos, modificaciones y alérgenos visibles sin
            interpretar garabatos.
          </li>
          <li>
            <strong className="text-zinc-900">Sincronía con el pase</strong> — el equipo de sala sabe qué va retrasado antes de
            prometer el segundo plato.
          </li>
          <li>
            <strong className="text-zinc-900">Menos retrabajo</strong> — mismas reglas para pedidos dictados por teléfono y los que
            entran por web; menos “¿esto era sin gluten?”.
          </li>
        </ul>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Hardware e impresoras
        </h2>
        <p className="mt-6 leading-relaxed text-zinc-700">
          Tably está pensado para funcionar en tablets y equipos que ya tengas; muchos locales combinan KDS en pantalla con
          impresoras ESC/POS para ticket físico cuando tiene sentido operativo. El objetivo no es eliminar papel por ideología,
          sino que el servicio no dependa de un solo punto de fallo.
        </p>
        <p className="mt-4 leading-relaxed text-zinc-700">
          Cuando el KDS y el{" "}
          <Link href="/inventario-restaurante" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            inventario
          </Link>{" "}
          comparten datos, también es más fácil marcar platos agotados y evitar vender lo que no puedes cocinar.
        </p>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base font-medium text-[#F5F1E8] shadow-none hover:bg-zinc-800">
              Probar en mi cocina
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/software-gestion-restaurantes" className="text-sm text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900">
            Ver visión general del producto
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
