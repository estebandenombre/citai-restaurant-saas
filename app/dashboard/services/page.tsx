"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { 
  MessageSquare, 
  Crown,
  CheckCircle,
  Zap,
  Shield,
  Bot,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react"
import Link from "next/link"

const services = [
  {
    id: "whatsapp",
    name: "WhatsApp Business Bot",
    description: "AI-powered WhatsApp bot for automated customer service and order management",
    icon: MessageSquare,
    price: "$29",
    period: "/month",
    features: [
      "AI-powered customer conversations",
      "Automatic order processing",
      "24/7 customer support",
      "Multi-language support",
      "Order status updates",
      "Reservation management",
      "Menu recommendations",
      "Customer analytics"
    ],
    popular: true,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "premium",
    name: "Premium Bundle",
    description: "Get WhatsApp Bot with additional premium features and priority support",
    icon: Crown,
    price: "$29",
    period: "/month",
    features: [
      "Everything in WhatsApp Bot",
      "Priority support",
      "Custom integrations",
      "Advanced analytics dashboard",
      "White-label options",
      "API access",
      "Custom branding",
      "Extended features"
    ],
    popular: false,
    color: "from-purple-500 to-pink-600"
  }
]

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const handlePurchase = (serviceId: string) => {
    // TODO: Implement payment processing
    console.log(`Purchasing service: ${serviceId}`)
    // For now, just show an alert
    alert(`Redirecting to payment for ${serviceId}...`)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Premium Services"
        description="Unlock advanced features to grow your restaurant business"
        icon={Sparkles}
      />

      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Take Your Restaurant to the Next Level
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our premium services help you automate operations, increase sales, and provide 
              exceptional customer experiences that keep guests coming back.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => {
          const IconComponent = service.icon
          return (
            <Card 
              key={service.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                service.popular ? 'ring-2 ring-green-500 shadow-lg' : ''
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {service.savings && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {service.savings}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${service.color}`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {service.price}
                    </span>
                    <span className="text-lg text-gray-500 ml-1">
                      {service.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Purchase Button */}
                <Button 
                  className={`w-full ${
                    service.popular 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={() => handlePurchase(service.id)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Why Choose Our Premium Services?</CardTitle>
          <CardDescription className="text-center">
            Join thousands of restaurants already using our premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold">Instant Setup</h3>
              <p className="text-sm text-gray-600">
                Get up and running in minutes with our easy-to-use configuration tools
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold">Secure & Reliable</h3>
              <p className="text-sm text-gray-600">
                Enterprise-grade security with 99.9% uptime guarantee
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                Advanced AI technology that learns and improves over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time. No long-term contracts required.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Do you offer a free trial?</h4>
            <p className="text-sm text-gray-600">
              Yes, all premium services come with a 14-day free trial. No credit card required.
            </p>
          </div>
          
          
          <div className="space-y-2">
            <h4 className="font-medium">Is there customer support?</h4>
            <p className="text-sm text-gray-600">
              Yes, premium subscribers get priority email support and live chat assistance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back to Dashboard */}
      <div className="text-center">
        <Link href="/dashboard">
          <Button variant="outline">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
