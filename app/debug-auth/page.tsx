"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { debugSession } from "@/lib/auth-utils"

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      const info = await debugSession()
      setDebugInfo(info)
    } catch (error: any) {
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const clearSession = async () => {
    await supabase.auth.signOut()
    setDebugInfo(null)
  }

  useEffect(() => {
    runDebug()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button onClick={runDebug} disabled={loading}>
                {loading ? "Running..." : "Refresh Debug Info"}
              </Button>
              <Button onClick={clearSession} variant="destructive">
                Clear Session
              </Button>
            </div>
            
            {debugInfo && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Session Info:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 