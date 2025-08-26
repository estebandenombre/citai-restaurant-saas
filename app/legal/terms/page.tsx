import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <Logo size="lg" />
          </Link>
          <Link href="/auth/register">
            <Button className="bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">
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
