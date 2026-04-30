import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonLd, SeoShell } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"

const path = "/digital-menu-software"

export const metadata: Metadata = {
  title: "Digital Menu Software for Restaurants | Tably",
  description:
    "Publish and update your restaurant menu in real time with allergens, modifiers, and automatic out-of-stock sync.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
}

export default function DigitalMenuSoftwarePage() {
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
    <SeoShell breadcrumbs={[{ label: "Digital menu" }]}>
      <JsonLd data={schema} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <h1 className="font-display text-4xl font-light tracking-[-0.02em] text-zinc-950 md:text-5xl">
          Digital menu software with live availability
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-700">
          Keep your menu consistent across dine-in and online channels. Tably lets you update dishes instantly,
          handle modifiers cleanly, and avoid selling items that are no longer available.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base text-[#F5F1E8] hover:bg-zinc-800">
              Try Tably
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
