import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SeoShell, JsonLd } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"
import { ArrowRight } from "lucide-react"

const path = "/sobre-tably"

export const metadata: Metadata = {
  title: "Sobre Tably · Software para restaurantes desde Barcelona | Tably",
  description:
    "Tably es un estudio de producto para hostelería: pedidos, reservas, KDS e inventario sin comisión por venta. Datos en la UE, soporte humano.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
  openGraph: {
    title: "Sobre Tably",
    description: "Equipo y enfoque: herramientas para quien trabaja en sala y cocina.",
    url: `${getSiteUrl()}${path}`,
    siteName: "Tably",
    locale: "es_ES",
    type: "website",
  },
}

export default function SobreTablyPage() {
  const site = getSiteUrl()
  const url = `${site}${path}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre Tably",
    description: metadata.description as string,
    url,
    mainEntity: {
      "@type": "Organization",
      name: "Tably Studio S.L.",
      url: site,
      email: "hello@tably.digital",
      areaServed: "ES",
      description: "Software de gestión para restaurantes.",
    },
  }

  return (
    <SeoShell breadcrumbs={[{ label: "Sobre Tably" }]}>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Estudio</p>
        <h1 className="font-display text-4xl font-light leading-[1.08] tracking-[-0.02em] text-zinc-950 md:text-5xl lg:text-[3.25rem]">
          Sobre Tably: producto hecho desde <span className="italic text-[#7C3AED]">servicio</span>, no desde diagramas
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-zinc-700">
          Tably nace de la frustración de usar tres suscripciones que no se hablan entre sí: una para reservas, otra para pedidos,
          otra para “informes”. Los restaurantes pequeños y medianos merecen herramientas serias sin ceder un porcentaje de cada
          ticket a un intermediario eterno.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-700">
          Somos un equipo con base en Barcelona y foco en Europa. Priorizamos privacidad (alojamiento en la UE), exportación de
          datos y respuestas de personas reales cuando algo falla en pleno sábado.
        </p>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Qué construimos
        </h2>
        <p className="mt-6 leading-relaxed text-zinc-700">
          Una suite que cubre{" "}
          <Link href="/software-gestion-restaurantes" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            gestión integral
          </Link>
          :{" "}
          <Link href="/pedidos-online-restaurante" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            pedidos online
          </Link>
          ,{" "}
          <Link href="/reservas-restaurantes" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            reservas
          </Link>
          ,{" "}
          <Link href="/pantalla-cocina-kds" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            KDS
          </Link>{" "}
          e{" "}
          <Link href="/inventario-restaurante" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            inventario
          </Link>
          . No vendemos publicidad a comensales ni retención agresiva: si el producto no encaja, puedes llevarte tus datos.
        </p>

        <h2 className="font-display mt-14 text-2xl font-normal tracking-tight text-zinc-950 md:text-3xl">
          Contacto
        </h2>
        <p className="mt-6 leading-relaxed text-zinc-700">
          Escríbenos a{" "}
          <a href="mailto:hello@tably.digital" className="font-medium text-zinc-900 underline underline-offset-4">
            hello@tably.digital
          </a>{" "}
          para onboarding, integraciones o preguntas de privacidad. También puedes empezar desde una{" "}
          <Link href="/auth/register" className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-800">
            cuenta de prueba
          </Link>
          .
        </p>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base font-medium text-[#F5F1E8] shadow-none hover:bg-zinc-800">
              Crear cuenta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="text-sm text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900">
            Página de inicio
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
