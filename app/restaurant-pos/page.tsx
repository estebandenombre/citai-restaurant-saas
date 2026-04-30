import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonLd, SeoShell } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"

const path = "/restaurant-pos"

export const metadata: Metadata = {
  title: "Restaurant POS Software for Modern Teams | Tably",
  description:
    "Run service, orders, kitchen, and reporting from one restaurant POS software designed for modern independent operators.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
}

export default function RestaurantPosPage() {
  const site = getSiteUrl()
  const url = `${site}${path}`
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: metadata.title as string,
    description: metadata.description as string,
    url,
  }

  return (
    <SeoShell breadcrumbs={[{ label: "Restaurant POS" }]}>
      <JsonLd data={schema} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <h1 className="font-display text-4xl font-light tracking-[-0.02em] text-zinc-950 md:text-5xl">
          Restaurant POS software that keeps every station aligned
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-700">
          Tably combines point-of-sale workflows with kitchen and inventory context so your floor team can move
          faster with fewer mistakes. One platform, one monthly subscription, no order commission.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base text-[#F5F1E8] hover:bg-zinc-800">
              Open account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
