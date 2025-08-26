"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function FixOrdersPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")

  const checkTableStructure = async () => {
    setLoading(true)
    setResult("")
    setError("")

    try {
      // First, let's check if the orders table exists and what columns it has
      const { data: tableInfo, error: tableError } = await supabase
        .from('orders')
        .select('*')
        .limit(1)

      if (tableError) {
        throw new Error(`Table error: ${tableError.message}`)
      }

      setResult(`✅ Orders table exists. Found ${Object.keys(tableInfo?.[0] || {}).length} columns.`)
      
      // Log the actual structure
      console.log('Current table structure:', tableInfo?.[0] || 'No data')
      
    } catch (error: any) {
      console.error('Error checking table:', error)
      setError(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createMissingColumns = async () => {
    setLoading(true)
    setResult("")
    setError("")

    try {
      // Get current user's restaurant
      const { restaurant } = await getCurrentUserRestaurant()
      if (!restaurant || typeof restaurant === 'object' && !('id' in restaurant)) {
        throw new Error('Restaurant not found. Please make sure you are logged in as a restaurant owner.')
      }

      // Try to query the table structure by attempting to select with all expected columns
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          restaurant_id,
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          customer_table_number,
          customer_pickup_time,
          customer_address,
          customer_special_instructions,
          order_type,
          order_status,
          subtotal,
          tax_amount,
          delivery_fee,
          total_amount,
          created_at,
          updated_at
        `)
        .limit(1)

      if (error) {
        // If we get a column error, it means the structure is wrong
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          throw new Error(`Table structure is incorrect. Missing columns detected.\n\nError: ${error.message}\n\nPlease execute the SQL script in Supabase dashboard.`)
        }
        throw error
      }

      setResult("✅ Orders table structure is correct! All required columns exist.")
      
    } catch (error: any) {
      console.error('Error testing table structure:', error)
      setError(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testOrdersAPI = async () => {
    setLoading(true)
    setResult("")
    setError("")

    try {
      const response = await fetch('/api/test-orders')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'API test failed')
      }

      setResult("✅ Orders API is working correctly! All database operations are functional.")
      
    } catch (error: any) {
      console.error('Error testing orders API:', error)
      setError(`❌ API Test Failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Fix Orders Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            This will check and fix the orders table structure to resolve the "order_status does not exist" error.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={checkTableStructure} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check if Table Exists'
              )}
            </Button>

            <Button 
              onClick={createMissingColumns} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test All Required Columns'
              )}
            </Button>

            <Button 
              onClick={testOrdersAPI} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing API...
                </>
              ) : (
                'Test Orders API (Full Test)'
              )}
            </Button>
          </div>

          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-800">{result}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800 whitespace-pre-line">{error}</span>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-4 space-y-2">
            <p>If the table structure is incorrect, you need to:</p>
            <ol className="text-left list-decimal list-inside space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Open the SQL editor</li>
              <li>First, execute <code>scripts/11-fix-orders-table.sql</code> to fix table structure</li>
              <li>Then, execute <code>scripts/12-fix-rls-policies.sql</code> to fix RLS policies</li>
              <li>Run the tests again</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 