import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonLd, SeoShell } from "@/components/marketing/seo-shell"
import { getSiteUrl } from "@/lib/site"

const path = "/restaurant-reservation-system"

export const metadata: Metadata = {
  title: "Restaurant Reservation System Software | Tably",
  description:
    "Manage table bookings, waitlists, and no-show protection in one restaurant reservation system connected to your floor and kitchen.",
  alternates: { canonical: `${getSiteUrl()}${path}` },
}

export default function RestaurantReservationSystemPage() {
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
    <SeoShell breadcrumbs={[{ label: "Reservation system" }]}>
      <JsonLd data={schema} />
      <article className="mx-auto max-w-[800px] px-6 py-16 lg:px-10 lg:py-24">
        <h1 className="font-display text-4xl font-light tracking-[-0.02em] text-zinc-950 md:text-5xl">
          Restaurant reservation system for busy dining rooms
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-700">
          Tably helps hosts seat faster with drag-and-drop tables, smart waitlists, and service-aware pacing.
          Reservations stay connected to live operations, so the kitchen and front-of-house run from the same truth.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/auth/register">
            <Button className="h-12 rounded-full bg-zinc-950 px-6 text-base text-[#F5F1E8] hover:bg-zinc-800">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
    </SeoShell>
  )
}
