"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { 
  MessageSquare, 
  Crown,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Zap,
  Shield,
  Bot
} from "lucide-react"
import Link from "next/link"

export default function WhatsAppPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to services page after a short delay to show the premium message
    const timer = setTimeout(() => {
      router.push('/dashboard/services')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Business Bot"
        description="Premium AI-powered WhatsApp automation service"
        icon={MessageSquare}
      />

      {/* Premium Service Message */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <Crown className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                WhatsApp Business Bot is a Premium Service
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Unlock AI-powered WhatsApp automation to handle customer conversations, 
                process orders, and provide 24/7 support for your restaurant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Bot className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">AI-Powered</p>
                  <p className="text-sm text-gray-600">Smart conversations</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Zap className="h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">24/7 Support</p>
                  <p className="text-sm text-gray-600">Always available</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Secure</p>
                  <p className="text-sm text-gray-600">Enterprise-grade</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Link href="/dashboard/services">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Crown className="h-5 w-5 mr-2" />
                    View Pricing Plans
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-gray-500">
                Redirecting to services page in a few seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            What You'll Get with WhatsApp Business Bot
          </CardTitle>
          <CardDescription>
            Preview of features available with the premium service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI-Powered Conversations</h4>
                  <p className="text-sm text-gray-600">Natural language processing for customer interactions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Automatic Order Processing</h4>
                  <p className="text-sm text-gray-600">Process orders directly through WhatsApp</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Reservation Management</h4>
                  <p className="text-sm text-gray-600">Handle table bookings automatically</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Menu Recommendations</h4>
                  <p className="text-sm text-gray-600">Smart suggestions based on preferences</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Multi-Language Support</h4>
                  <p className="text-sm text-gray-600">Communicate in multiple languages</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Order Status Updates</h4>
                  <p className="text-sm text-gray-600">Real-time notifications to customers</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Customer Analytics</h4>
                  <p className="text-sm text-gray-600">Detailed insights and reporting</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">24/7 Availability</h4>
                  <p className="text-sm text-gray-600">Never miss a customer message</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
