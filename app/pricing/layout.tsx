import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site"

const path = "/pricing"

export const metadata: Metadata = {
  title: "Restaurant Software Pricing | Tably",
  description:
    "Transparent monthly pricing for restaurant software. No commission on orders, 14-day trial, and plans for independent venues or multi-location teams.",
  alternates: {
    canonical: `${getSiteUrl()}${path}`,
  },
  openGraph: {
    title: "Restaurant Software Pricing | Tably",
    description:
      "Compare Tably plans with transparent monthly pricing and 0% commission on orders.",
    url: `${getSiteUrl()}${path}`,
    siteName: "Tably",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant Software Pricing | Tably",
    description:
      "Choose a pricing plan for your restaurant with transparent monthly billing.",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
