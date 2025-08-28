"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PaymentProcessor } from '@/lib/payment-processor'
import { PaymentService } from '@/lib/payment-service'

export default function TestPaymentsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('')
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [hasPayments, setHasPayments] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // Load restaurants
    const loadRestaurants = async () => {
      try {
        const { data, error } = await fetch('/api/restaurants').then(res => res.json())
        if (data) {
          setRestaurants(data)
          addLog(`Loaded ${data.length} restaurants`)
        }
      } catch (error) {
        addLog(`Error loading restaurants: ${error}`)
      }
    }
    loadRestaurants()
  }, [])

  const testPaymentSettings = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    addLog(`Testing payment settings for restaurant: ${selectedRestaurant}`)
    
    try {
      // Test PaymentService
      addLog('Testing PaymentService.getPaymentSettings...')
      const settings = await PaymentService.getPaymentSettings(selectedRestaurant)
      setPaymentSettings(settings)
      
      if (settings) {
        addLog(`✅ Got payment settings: payments_enabled=${settings.payments_enabled}`)
        addLog(`Stripe: enabled=${settings.gateways.stripe.enabled}, setup_complete=${settings.gateways.stripe.setup_complete}`)
        addLog(`PayPal: enabled=${settings.gateways.paypal.enabled}, setup_complete=${settings.gateways.paypal.setup_complete}`)
      } else {
        addLog('❌ No payment settings found')
      }

      // Test PaymentProcessor
      addLog('Testing PaymentProcessor.hasPaymentsEnabled...')
      const enabled = await PaymentProcessor.hasPaymentsEnabled(selectedRestaurant)
      setHasPayments(enabled)
      addLog(`✅ Payments enabled: ${enabled}`)

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Payment System Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Restaurant</label>
            <select 
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a restaurant...</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} ({restaurant.id})
                </option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={testPaymentSettings}
            disabled={!selectedRestaurant || loading}
          >
            {loading ? 'Testing...' : 'Test Payment Settings'}
          </Button>
        </CardContent>
      </Card>

      {paymentSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(paymentSettings, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {hasPayments !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-semibold ${hasPayments ? 'text-green-600' : 'text-red-600'}`}>
              {hasPayments ? '✅ Payments Enabled' : '❌ Payments Disabled'}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono max-h-96 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

