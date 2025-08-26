import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p>We collect information you provide when you register, use our service, or contact us. This includes your name, email, restaurant information, and usage data.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p>We use your information to provide and improve our service, communicate with you, and ensure security. We don't sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Storage and Security</h2>
              <p>Your data is stored securely using industry-standard encryption. We use Supabase for data storage and implement appropriate security measures to protect your information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information. You can also request a copy of your data or ask us to stop processing it.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies and Tracking</h2>
              <p>We use cookies to improve your experience and analyze usage. You can control cookie settings in your browser.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Third-Party Services</h2>
              <p>We may use third-party services for analytics, payment processing, and support. These services have their own privacy policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
              <p>For privacy questions, contact us at info@tably.digital</p>
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


