import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SeoShell, JsonLd } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"
import { ArrowRight } from "lucide-react"

const path = "/pedidos-online-restaurante"

export const metadata: Metadata = {
  title: "Pedidos online para restaurantes sin comisión | Tably",
  description:
    "Activa pedidos a domicilio y para recoger con tu marca y tu URL. Upsells, alérgenos y franjas horarias. Cero porcentaje sobre ventas — solo suscripción mensual.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
  openGraph: {
    title: "Pedidos online para restaurantes sin comisión | Tably",
    description: "Canal directo de ventas para tu restaurante. Sin comisiones por pedido.",
    url: `${getSiteUrl()}${path}`,
    siteName: "Tably",
    locale: "es_ES",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pedidos online para restaurantes sin comisión | Tably",
    description: "Canal directo de ventas para tu restaurante. Sin comisiones por pedido.",
  },
}

export default function PedidosOnlineRestaurantePage() {
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
        { "@type": "ListItem", position: 2, name: "Pedidos online para restaurantes", item: url },
      ],
    },
  }

  return (
    <SeoShell breadcrumbs={[{ label: "Pedidos online" }]}>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Guía · Venta directa</p>
        <h1 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.02em] text-zinc-950 md:text-5xl lg:text-[3.25rem]">
          Pedidos online para restaurantes, <span className="italic text-[#7C3AED]">sin devolver margen</span> a terceros
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-zinc-700">
          Los marketplaces aportan visibilidad, pero cobrar un tercio del ticket en la carta digital duele. Cuando ya tienes
          comunidad local, tiene sentido abrir un canal propio: misma cocina, misma calidad, mejor reparto del ingreso.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-700">
          Con Tably el comensal pide en un entorno con tu identidad; tú defines carta, complementos, alérgenos y ventanas de
          recogida o reparto. El pedido llega al mismo flujo operativo que usa tu equipo con{" "}
          <Link href="/pantalla-cocina-kds" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            cocina y sala
          </Link>
          , sin duplicar trabajo en otra tablet.
        </p>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Qué buscar en un proveedor de pedidos web
        </h2>
        <ul className="mt-6 space-y-4 text-zinc-700">
          <li>
            <strong className="text-zinc-900">Propiedad del dato y de la marca</strong> — URL tuya, lista de clientes tuya,
            comunicación directa (email o SMS según integres pasarela y políticas).
          </li>
          <li>
            <strong className="text-zinc-900">Menú vivo</strong> — si se acaba un plato, debe desaparecer al instante también online;
            eso solo es fácil si el menú online y el de sala comparten{" "}
            <Link href="/software-gestion-restaurantes" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
              la misma base
            </Link>
            .
          </li>
          <li>
            <strong className="text-zinc-900">Precio predecible</strong> — cuota fija mensual frente a comisión variable: sabes
            cuánto pagas aunque tengas un viernes récord.
          </li>
        </ul>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          SEO local y pedidos: encajan juntos
        </h2>
        <p className="mt-6 leading-relaxed text-zinc-700">
          Una página dedicada “pizza Napoli + tu barrio” o “menú del día + ciudad” ayuda en buscadores, pero el objetivo final es
          que el usuario reserve o pida. Al integrar pedido y{" "}
          <Link href="/reservas-restaurantes" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            reserva
          </Link>{" "}
          en una plataforma única reduces fricción y errores de inventario entre lo prometido online y lo servido en sala.
        </p>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base font-medium text-[#F5F1E8] shadow-none hover:bg-zinc-800">
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing" className="text-sm text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900">
            Ver planes y trial
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
