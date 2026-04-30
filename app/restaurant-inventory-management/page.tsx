import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonLd, SeoShell } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"

const path = "/restaurant-inventory-management"

export const metadata: Metadata = {
  title: "Restaurant Inventory Management Software | Tably",
  description:
    "Track stock by ingredient, reduce waste, and keep your menu accurate with inventory management software for restaurants.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
}

export default function RestaurantInventoryManagementPage() {
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
    <SeoShell breadcrumbs={[{ label: "Inventory management" }]}>
      <JsonLd data={schema} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <h1 className="font-display text-4xl font-light tracking-[-0.02em] text-zinc-950 md:text-5xl">
          Inventory management software built for restaurants
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-700">
          Tably connects ingredients, recipes, and live menu status. Your team can avoid stock surprises,
          reduce waste, and keep service smooth even during peak hours.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base text-[#F5F1E8] hover:bg-zinc-800">
              Start free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
