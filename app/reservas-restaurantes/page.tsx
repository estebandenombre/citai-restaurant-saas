import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SeoShell, JsonLd } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"
import { ArrowRight } from "lucide-react"

const path = "/reservas-restaurantes"

export const metadata: Metadata = {
  title: "Software de reservas y plano de sala para restaurantes | Tably",
  description:
    "Mesas con arrastrar y soltar, depósitos, lista de espera y recordatorios. Menos no-shows y menos caos en recepción — integrado con pedidos y cocina.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
  openGraph: {
    title: "Software de reservas para restaurantes | Tably",
    description: "Plano de sala, waitlist y protección ante ausencias. Prueba gratuita.",
    url: `${getSiteUrl()}${path}`,
    siteName: "Tably",
    locale: "es_ES",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Software de reservas para restaurantes | Tably",
    description: "Plano de sala, waitlist y protección ante ausencias. Prueba gratuita.",
  },
}

export default function ReservasRestaurantesPage() {
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
        { "@type": "ListItem", position: 2, name: "Reservas para restaurantes", item: url },
      ],
    },
  }

  return (
    <SeoShell breadcrumbs={[{ label: "Reservas" }]}>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Guía · Sala</p>
        <h1 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.02em] text-zinc-950 md:text-5xl lg:text-[3.25rem]">
          Reservas y plano de sala que el <span className="italic text-[#7C3AED]">maître</span> usa de verdad
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-zinc-700">
          Una libreta en el atril funciona hasta el día en que dos equipos telefonean a la vez, llega un grupo sin avisar y la
          cocina no sabe cuántas cubiertos hay a las 21:30. El software de reservas no sustituye el criterio del equipo: lo
          potencia con visibilidad compartida.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-700">
          Tably enlaza la capacidad del comedor con{" "}
          <Link href="/pedidos-online-restaurante" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            pedidos
          </Link>{" "}
          y{" "}
          <Link href="/pantalla-cocina-kds" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            cocina
          </Link>
          , para que el número de servicios previstos y los tickets abiertos cuadren sin llamadas cruzadas.
        </p>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Funciones que reducen tensión en hora punta
        </h2>
        <ul className="mt-6 space-y-4 text-zinc-700">
          <li>
            <strong className="text-zinc-900">Mapa de mesas</strong> — reorganiza capacidad cuando llega un grupo grande o
            cambias el aforo por evento.
          </li>
          <li>
            <strong className="text-zinc-900">Depósitos y políticas</strong> — reduce mesas vacías por reservas fantasmas sin
            castigar a quien avisa con tiempo.
          </li>
          <li>
            <strong className="text-zinc-900">Lista de espera y walk-ins</strong> — orden claro cuando la gente espera en barra:
            menos discusiones, más rotación.
          </li>
          <li>
            <strong className="text-zinc-900">Recordatorios</strong> — SMS o WhatsApp según configuración, para bajar olvidos sin
            ahogar al equipo en mensajes manuales.
          </li>
        </ul>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Integración con el resto de la gestión
        </h2>
        <p className="mt-6 leading-relaxed text-zinc-700">
          Si las reservas viven en una caja negra separada del POS o del KDS, siempre habrá desajustes. Con una sola aplicación de{" "}
          <Link href="/software-gestion-restaurantes" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            gestión para restaurantes
          </Link>
          , el mismo inventario alimenta carta, disponibilidad y expectativas de cocina.
        </p>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base font-medium text-[#F5F1E8] shadow-none hover:bg-zinc-800">
              Empezar prueba
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a
            href="mailto:hello@tably.digital"
            className="text-sm text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900"
          >
            Hablar con el equipo
          </a>
        </div>
      </article>
    </SeoShell>
  )
}
