import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SeoShell, JsonLd } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"
import { ArrowRight } from "lucide-react"

const path = "/inventario-restaurante"

export const metadata: Metadata = {
  title: "Control de inventario para restaurantes | Tably",
  description:
    "Stock por ingrediente, menú vivo y platos que se pausan solos cuando falta materia prima. Menos 86 a gritos y más coherencia entre cocina, sala y online.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
  openGraph: {
    title: "Inventario y menú en vivo | Tably",
    description: "Gestiona mermas y disponibilidad ligada a la carta y a los pedidos.",
    url: `${getSiteUrl()}${path}`,
    siteName: "Tably",
    locale: "es_ES",
    type: "article",
  },
}

export default function InventarioRestaurantePage() {
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
        { "@type": "ListItem", position: 2, name: "Inventario restaurante", item: url },
      ],
    },
  }

  return (
    <SeoShell breadcrumbs={[{ label: "Inventario" }]}>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Guía · Operaciones</p>
        <h1 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.02em] text-zinc-950 md:text-5xl lg:text-[3.25rem]">
          Inventario que habla el mismo idioma que tu <span className="italic text-[#7C3AED]">carta</span>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-zinc-700">
          Contar cajas en almacén es necesario; conectar ese número con lo que aparece en la carta y en el iPad de los camareros
          es lo que evita disculpas incómodas a mitad de servicio.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-700">
          Tably permite pensar en ingredientes y recetas, de modo que cuando un producto base se agota, los platos que lo usan
          pueden retirarse automáticamente del{" "}
          <Link href="/pedidos-online-restaurante" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            canal online
          </Link>{" "}
          y de la vista del personal en sala, alineado con lo que ve{" "}
          <Link href="/pantalla-cocina-kds" className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800">
            cocina
          </Link>
          .
        </p>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Beneficios directos en el servicio
        </h2>
        <ul className="mt-6 space-y-4 text-zinc-700">
          <li>
            <strong className="text-zinc-900">Menos platos imposibles</strong> — el cliente no paga algo que luego hay que
            devolver porque “se terminó el rape”.
          </li>
          <li>
            <strong className="text-zinc-900">Mejor forecasting</strong> — ver qué se mueve en combinación con datos de servicio
            ayuda a comprar con cabeza, no a punta de intuición exhausta.
          </li>
          <li>
            <strong className="text-zinc-900">Un solo lugar para actualizar</strong> — el mismo cambio alimenta TI, carta física
            digital y señalización al equipo.
          </li>
        </ul>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Relación con la gestión global
        </h2>
        <p className="mt-6 leading-relaxed text-zinc-700">
          El inventario no es un módulo aislado: encaja en un{" "}
          <Link href="/software-gestion-restaurantes" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            software de restaurante
          </Link>{" "}
          donde{" "}
          <Link href="/reservas-restaurantes" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            aforo
          </Link>
          , pedidos y preparación comparten contexto. Así las decisiones de compra responden a la demanda real, no solo al
          Excel de turno mañana.
        </p>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base font-medium text-[#F5F1E8] shadow-none hover:bg-zinc-800">
              Probar Tably
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing" className="text-sm text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900">
            Planes para tu tamaño de equipo
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
