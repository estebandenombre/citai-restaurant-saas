import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SeoShell, JsonLd } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"
import { ArrowRight } from "lucide-react"

const path = "/software-gestion-restaurantes"

export const metadata: Metadata = {
  title: "Software de gestión para restaurantes | Tably",
  description:
    "Centraliza pedidos, reservas, cocina e inventario en un solo sistema. Sin comisiones por pedido, datos en la UE y puesta en marcha en horas, no en meses.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
  openGraph: {
    title: "Software de gestión para restaurantes | Tably",
    description:
      "ERP ligero para hostelería: sala, cocina y oficina conectadas. Prueba gratuita.",
    url: `${getSiteUrl()}${path}`,
    siteName: "Tably",
    locale: "es_ES",
    type: "article",
  },
}

export default function SoftwareGestionRestaurantesPage() {
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
        { "@type": "ListItem", position: 2, name: "Software de gestión para restaurantes", item: url },
      ],
    },
  }

  return (
    <SeoShell breadcrumbs={[{ label: "Software de gestión para restaurantes" }]}>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Guía · Gestión</p>
        <h1 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.02em] text-zinc-950 md:text-5xl lg:text-[3.25rem]">
          Software de gestión para restaurantes que respeta tu <span className="italic text-[#7C3AED]">margen</span>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-zinc-700">
          Un “sistema operativo” para hostelería une lo que ocurre en sala, en cocina y en la oficina. Si cada pieza vive en una
          app distinta, pierdes tiempo, cometes errores y pagas comisiones que no necesitas.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-700">
          Tably está pensado para equipos que facturan servicio real: pedidos online en tu propio canal,{" "}
          <Link href="/reservas-restaurantes" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            reservas y plano de mesas
          </Link>
          ,{" "}
          <Link href="/pantalla-cocina-kds" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            pantalla de cocina (KDS)
          </Link>{" "}
          e{" "}
          <Link href="/inventario-restaurante" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            inventario
          </Link>{" "}
          enlazados al menú. Cuota mensual fija: cero porcentaje sobre tus tickets.
        </p>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Qué debe cubrir un buen stack de gestión
        </h2>
        <ul className="mt-6 space-y-3 text-zinc-700">
          <li className="flex gap-3">
            <span className="font-mono text-zinc-400">01</span>
            <span>
              <strong className="text-zinc-900">Canal directo de venta</strong> — carta, alérgenos y{" "}
              <Link href="/pedidos-online-restaurante" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
                pedidos online
              </Link>{" "}
              bajo tu marca y URL, sin repartir ingresos con marketplaces.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-zinc-400">02</span>
            <span>
              <strong className="text-zinc-900">Operación en vivo</strong> — turnos, comandas y sincronización aunque la conexión
              falle unos minutos.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-zinc-400">03</span>
            <span>
              <strong className="text-zinc-900">Datos para decidir</strong> — ticket medio, horas punta y preparación sin meter
              números a mano en hojas de cálculo.
            </span>
          </li>
        </ul>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Por qué equipos en Valencia y en España eligen modelos sin comisión
        </h2>
        <p className="mt-6 leading-relaxed text-zinc-700">
          Las plataformas que cobran un porcentaje por pedido pueden ser útiles para darse a conocer, pero cuando ya tienes
          clientes habituales, el coste escala con tu éxito. Un software de restaurante con precio mensual transparente alinea
          incentivos: nuestra prioridad es que el servicio sea estable y rápido, no maximizar fees sobre tu facturación.
        </p>

        <div className="mt-14 rounded-2xl border border-zinc-900/10 bg-[#EFEBE0] p-8 md:p-10">
          <p className="font-display text-xl font-light italic text-zinc-900 md:text-2xl">
            “Necesitábamos una sola fuente de verdad para sala y cocina. Menos llamadas, menos papel, mismos comensales.”
          </p>
          <p className="mt-4 text-sm text-zinc-600">
            Caso típico de migración desde varias apps sueltas — consulta planes y trial en{" "}
            <Link href="/pricing" className="font-medium text-zinc-900 underline">
              precios
            </Link>
            .
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base font-medium text-[#F5F1E8] shadow-none hover:bg-zinc-800">
              Probar Tably gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="text-sm text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900">
            Volver a la página principal
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
