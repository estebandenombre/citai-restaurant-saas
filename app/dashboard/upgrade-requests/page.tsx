"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, XCircle, AlertCircle, Mail } from 'lucide-react'
import { UpgradeRequestService, UpgradeRequest } from '@/lib/upgrade-request-service'
import { useToast } from '@/hooks/use-toast'

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadUpgradeRequests()
  }, [])

  const loadUpgradeRequests = async () => {
    try {
      setLoading(true)
      const userRequests = await UpgradeRequestService.getUserUpgradeRequests()
      setRequests(userRequests)
    } catch (error) {
      console.error('Error loading upgrade requests:', error)
      toast({
        title: "Error",
        description: "Failed to load upgrade requests.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-500">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Upgrade Requests</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Upgrade Requests</h1>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upgrade requests</h3>
              <p className="text-gray-500 mb-4">
                You haven't submitted any upgrade requests yet.
              </p>
              <Button onClick={() => window.location.href = '/pricing'}>
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <CardTitle className="text-lg">
                      Upgrade to {request.requested_plan}
                    </CardTitle>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  Requested on {formatDate(request.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Plan</p>
                    <p className="text-sm">{request.current_plan || 'No plan'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Requested Plan</p>
                    <p className="text-sm font-medium">{request.requested_plan}</p>
                  </div>
                </div>

                {request.message && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-md">{request.message}</p>
                  </div>
                )}

                {request.admin_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Admin Response</p>
                    <p className="text-sm bg-blue-50 p-3 rounded-md border-l-4 border-blue-200">
                      {request.admin_notes}
                    </p>
                  </div>
                )}

                {request.processed_at && (
                  <div className="text-xs text-gray-500">
                    Processed on {formatDate(request.processed_at)}
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      Your request is being reviewed. We'll contact you within 24 hours.
                    </p>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-800">
                      Your request has been approved! Your plan will be updated shortly.
                    </p>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">
                      Your request has been rejected. Please contact support for more information.
                    </p>
                  </div>
                )}

                {request.status === 'completed' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      Your plan has been successfully upgraded!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
