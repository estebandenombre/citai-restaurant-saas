import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { getSiteUrl } from "@/lib/site"
import { ArrowLeft } from "lucide-react"

const path = "/legal/terms"

export const metadata: Metadata = {
  title: "Terms and Conditions | Tably",
  description:
    "Review Tably's service terms, trial details, user responsibilities, and data ownership commitments.",
  alternates: {
    canonical: `${getSiteUrl()}${path}`,
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Logo size="lg" />
          </Link>
          <Link href="/auth/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-semibold">Terms and conditions</h1>
          <p className="mb-8 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By using Tably, you agree to these terms. If you don't agree, please don't use our service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Service Description</h2>
              <p>Tably is a restaurant management platform providing order management, menu management, inventory tracking, and analytics tools.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Free Trial</h2>
              <p>New users get a 14-day free trial with full access. No credit card required. You can cancel anytime during the trial.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Responsibilities</h2>
              <p>You must provide accurate information, keep your account secure, and use the service responsibly and legally.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data & Privacy</h2>
              <p>You own your data. We process it according to our Privacy Policy. You're responsible for ensuring you have rights to upload your data.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Termination</h2>
              <p>We can terminate accounts for violations. You can cancel anytime. Upon termination, access to the service stops immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
              <p>Questions? Contact us at info@tably.digital</p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
