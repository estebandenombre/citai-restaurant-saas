"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestReservationsPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testGetAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-reservations')
      const data = await response.json()
      setTestResult({ type: 'GET', success: response.ok, data })
    } catch (error: any) {
      setTestResult({ type: 'GET', success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testPostAPI = async () => {
    setLoading(true)
    try {
      const testData = {
        restaurantId: 'test-id',
        customerName: 'Test Customer',
        customerPhone: '123-456-7890',
        partySize: 2,
        reservationDate: '2024-12-25',
        reservationTime: '19:00'
      }
      
      const response = await fetch('/api/test-reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })
      const data = await response.json()
      setTestResult({ type: 'POST', success: response.ok, data })
    } catch (error: any) {
      setTestResult({ type: 'POST', success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Reservations API</h1>
      
      <div className="space-y-4 mb-8">
        <Button onClick={testGetAPI} disabled={loading}>
          Test GET /api/test-reservations
        </Button>
        
        <Button onClick={testPostAPI} disabled={loading}>
          Test POST /api/test-reservations
        </Button>
      </div>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              {testResult.type} Test Result - {testResult.success ? 'SUCCESS' : 'FAILED'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 