"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail, 
  Shield, 
  Eye, 
  EyeOff,
  Lock,
  User,
  Calendar,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'
import { UpgradeRequestService, UpgradeRequest } from '@/lib/upgrade-request-service'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/components/i18n/i18n-provider'

interface AdminUser {
  id: string
  email: string
  role: string
  first_name: string
  last_name: string
}

export default function AdminUpgradeRequestsPage() {
  const { locale } = useI18n()
  const tx =
    locale === 'es-ES'
      ? {
          accountLocked: 'Cuenta bloqueada',
          tooManyAttempts: 'Demasiados intentos fallidos. Intentalo de nuevo mas tarde.',
          loginFailed: 'Inicio de sesion fallido',
          invalidCredentials: 'Credenciales invalidas. Intentalo de nuevo.',
          accessDenied: 'Acceso denegado',
          noPrivileges: 'No tienes permisos de administrador.',
          loginSuccess: 'Inicio de sesion correcto',
          welcomeAdmin: 'Bienvenido, admin',
          loginError: 'Error de inicio de sesion',
          unexpectedError: 'Ha ocurrido un error inesperado.',
          loggedOut: 'Sesion cerrada',
          loadError: 'No se han podido cargar las solicitudes.',
          warning: 'Aviso',
          planUpdateFailed: 'Solicitud aprobada, pero fallo la actualizacion del plan.',
          success: 'Exito',
          requestUpdated: 'Solicitud actualizada correctamente.',
          updateFailed: 'No se pudo actualizar la solicitud.',
          status: { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada', completed: 'Completada', unknown: 'Desconocido' },
          verifying: 'Verificando acceso de administrador...',
          adminRequired: 'Acceso de administrador requerido',
          enterCredentials: 'Introduce tus credenciales para gestionar solicitudes de upgrade',
          adminEmail: 'Email de admin',
          password: 'Contrasena',
          enterPassword: 'Introduce la contrasena',
          loginAdmin: 'Entrar como admin',
          lockedTemp: 'Cuenta bloqueada temporalmente por multiples intentos fallidos.',
          backDashboard: 'Volver al panel',
          adminPanel: 'Panel de administracion',
          management: 'Gestion de solicitudes de upgrade',
          logout: 'Cerrar sesion',
          total: 'Total',
          pending: 'Pendiente',
          approved: 'Aprobada',
          rejected: 'Rechazada',
          completed: 'Completada',
          statusFilter: 'Estado',
          dateRange: 'Rango de fechas',
          search: 'Buscar',
          allStatus: 'Todos los estados',
          allTime: 'Todo el periodo',
          today: 'Hoy',
          week: 'Ultimos 7 dias',
          month: 'Ultimos 30 dias',
          searchPh: 'Buscar por email, plan o mensaje...',
          refresh: 'Actualizar',
          requestsTitle: 'Solicitudes de upgrade',
          requestsDesc: 'Gestiona solicitudes y aprueba o rechaza cambios',
          loadingRequests: 'Cargando solicitudes...',
          noRequests: 'No hay solicitudes de upgrade.',
          requestingUpgrade: 'Solicita upgrade a',
          view: 'Ver',
          approve: 'Aprobar',
          reject: 'Rechazar',
        }
      : {
          accountLocked: 'Account Locked',
          tooManyAttempts: 'Too many failed attempts. Please try again later.',
          loginFailed: 'Login Failed',
          invalidCredentials: 'Invalid credentials. Please try again.',
          accessDenied: 'Access Denied',
          noPrivileges: "You don't have admin privileges.",
          loginSuccess: 'Login Successful',
          welcomeAdmin: 'Welcome, Admin!',
          loginError: 'Login Error',
          unexpectedError: 'An unexpected error occurred.',
          loggedOut: 'Logged Out',
          loadError: 'Failed to load upgrade requests.',
          warning: 'Warning',
          planUpdateFailed: 'Request approved but user plan update failed.',
          success: 'Success',
          requestUpdated: 'Request updated successfully.',
          updateFailed: 'Failed to update request.',
          status: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', completed: 'Completed', unknown: 'Unknown' },
          verifying: 'Verifying admin access...',
          adminRequired: 'Admin Access Required',
          enterCredentials: 'Enter your admin credentials to manage upgrade requests',
          adminEmail: 'Admin Email',
          password: 'Password',
          enterPassword: 'Enter password',
          loginAdmin: 'Login as Admin',
          lockedTemp: 'Account temporarily locked due to multiple failed attempts.',
          backDashboard: 'Back to Dashboard',
          adminPanel: 'Admin Panel',
          management: 'Upgrade Requests Management',
          logout: 'Logout',
          total: 'Total',
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
          completed: 'Completed',
          statusFilter: 'Status',
          dateRange: 'Date Range',
          search: 'Search',
          allStatus: 'All Status',
          allTime: 'All Time',
          today: 'Today',
          week: 'Last 7 Days',
          month: 'Last 30 Days',
          searchPh: 'Search by email, plan, or message...',
          refresh: 'Refresh',
          requestsTitle: 'Upgrade Requests',
          requestsDesc: 'Manage user upgrade requests and approve or reject them',
          loadingRequests: 'Loading requests...',
          noRequests: 'No upgrade requests found.',
          requestingUpgrade: 'Requesting upgrade to',
          view: 'View',
          approve: 'Approve',
          reject: 'Reject',
        }

  const router = useRouter()
  const { toast } = useToast()
  
  // Security states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  
  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  
  // Data states
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<UpgradeRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Security timeout
  const [lastActivity, setLastActivity] = useState(Date.now())
  const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  useEffect(() => {
    checkAuthentication()
    const interval = setInterval(checkSessionTimeout, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests()
    }
  }, [isAuthenticated])

  useEffect(() => {
    filterRequests()
  }, [requests, statusFilter, searchTerm, dateFilter])

  const checkSessionTimeout = () => {
    if (Date.now() - lastActivity > SESSION_TIMEOUT) {
      handleLogout('Session expired due to inactivity')
    }
  }

  const updateActivity = () => {
    setLastActivity(Date.now())
  }

  const checkAuthentication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      // Check if user is admin
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, role, first_name, last_name')
        .eq('email', user.email)
        .single()

      if (error || !userData || userData.role !== 'admin') {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      setAdminUser(userData)
      setIsAuthenticated(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Authentication check failed:', error)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    if (isLocked) {
      toast({
        title: tx.accountLocked,
        description: tx.tooManyAttempts,
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (error) {
        setLoginAttempts(prev => prev + 1)
        if (loginAttempts >= 4) {
          setIsLocked(true)
          setTimeout(() => setIsLocked(false), 300000) // 5 minutes lock
        }
        toast({
          title: tx.loginFailed,
          description: tx.invalidCredentials,
          variant: "destructive",
        })
        return
      }

      // Verify admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, first_name, last_name')
        .eq('email', adminEmail)
        .single()

      if (userError || !userData || userData.role !== 'admin') {
        await supabase.auth.signOut()
        toast({
          title: tx.accessDenied,
          description: tx.noPrivileges,
          variant: "destructive",
        })
        return
      }

      setAdminUser(userData)
      setIsAuthenticated(true)
      setLoginAttempts(0)
      toast({
        title: tx.loginSuccess,
        description: tx.welcomeAdmin,
      })
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: tx.loginError,
        description: tx.unexpectedError,
        variant: "destructive",
      })
    }
  }

  const handleLogout = (reason?: string) => {
    supabase.auth.signOut()
    setIsAuthenticated(false)
    setAdminUser(null)
    setRequests([])
    setFilteredRequests([])
    setSelectedRequest(null)
    setShowDetailsDialog(false)
    setShowActionDialog(false)
    setActionType(null)
    setAdminNotes('')
    
    if (reason) {
      toast({
        title: tx.loggedOut,
        description: reason,
      })
    }
  }

  const loadRequests = async () => {
    try {
      setLoadingRequests(true)
      updateActivity()
      
      // Get all requests (admin can see all)
      const { data, error } = await supabase
        .from('upgrade_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
      toast({
        title: tx.loginError,
        description: tx.loadError,
        variant: "destructive",
      })
    } finally {
      setLoadingRequests(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requested_plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.message && r.message.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(r => new Date(r.created_at) >= today)
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(r => new Date(r.created_at) >= weekAgo)
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(r => new Date(r.created_at) >= monthAgo)
          break
      }
    }

    setFilteredRequests(filtered)
  }

  const handleRequestAction = async () => {
    if (!selectedRequest || !actionType) return

    try {
      updateActivity()
      
      // Update request status
      const { error } = await supabase
        .from('upgrade_requests')
        .update({
          status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'completed',
          processed_at: new Date().toISOString(),
          processed_by: adminUser?.id,
          admin_notes: adminNotes || null
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      // If approved, update user plan
      if (actionType === 'approve') {
        const { error: userError } = await supabase
          .from('users')
          .update({
            plan_id: (await supabase.from('subscription_plans').select('id').eq('name', selectedRequest.requested_plan).single()).data?.id,
            plan_status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('email', selectedRequest.user_email)

        if (userError) {
          console.error('Error updating user plan:', userError)
          toast({
            title: tx.warning,
            description: tx.planUpdateFailed,
            variant: "destructive",
          })
        }
      }

      toast({
        title: tx.success,
        description: tx.requestUpdated,
      })

      setShowActionDialog(false)
      setActionType(null)
      setAdminNotes('')
      setSelectedRequest(null)
      loadRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      toast({
        title: tx.loginError,
        description: tx.updateFailed,
        variant: "destructive",
      })
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
        return <Badge variant="secondary">{tx.status.pending}</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500">{tx.status.approved}</Badge>
      case 'rejected':
        return <Badge variant="destructive">{tx.status.rejected}</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-500">{tx.status.completed}</Badge>
      default:
        return <Badge variant="outline">{tx.status.unknown}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'es-ES' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStats = () => {
    const total = requests.length
    const pending = requests.filter(r => r.status === 'pending').length
    const approved = requests.filter(r => r.status === 'approved').length
    const rejected = requests.filter(r => r.status === 'rejected').length
    const completed = requests.filter(r => r.status === 'completed').length

    return { total, pending, approved, rejected, completed }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{tx.verifying}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">{tx.adminRequired}</CardTitle>
            <CardDescription>
              {tx.enterCredentials}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{tx.adminEmail}</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{tx.password}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={tx.enterPassword}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={isLocked}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              onClick={handleAdminLogin}
              disabled={isLocked || !adminEmail || !adminPassword}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              {tx.loginAdmin}
            </Button>
            {isLocked && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {tx.lockedTemp}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50" onClick={updateActivity}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tx.backDashboard}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tx.adminPanel}</h1>
              <p className="text-sm text-gray-600">{tx.management}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {adminUser?.first_name} {adminUser?.last_name}
              </p>
              <p className="text-xs text-gray-500">{adminUser?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLogout()}
            >
              {tx.logout}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{tx.total}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{tx.pending}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{tx.approved}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{tx.rejected}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{tx.completed}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{tx.statusFilter}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{tx.allStatus}</option>
                  <option value="pending">{tx.pending}</option>
                  <option value="approved">{tx.approved}</option>
                  <option value="rejected">{tx.rejected}</option>
                  <option value="completed">{tx.completed}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{tx.dateRange}</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{tx.allTime}</option>
                  <option value="today">{tx.today}</option>
                  <option value="week">{tx.week}</option>
                  <option value="month">{tx.month}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{tx.search}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={tx.searchPh}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={loadRequests}
                  disabled={loadingRequests}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingRequests ? 'animate-spin' : ''}`} />
                  {tx.refresh}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>{tx.requestsTitle} ({filteredRequests.length})</CardTitle>
            <CardDescription>
              {tx.requestsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{tx.loadingRequests}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{tx.noRequests}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(request.status)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{request.user_email}</p>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {tx.requestingUpgrade} <span className="font-medium">{request.requested_plan}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {tx.view}
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setActionType('approve')
                                  setShowActionDialog(true)
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {tx.approve}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setActionType('reject')
                                  setShowActionDialog(true)
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {tx.reject}
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setActionType('complete')
                                setShowActionDialog(true)
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">User Email</p>
                  <p className="text-sm">{selectedRequest.user_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRequest.status)}
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Plan</p>
                  <p className="text-sm">{selectedRequest.current_plan || 'No plan'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Requested Plan</p>
                  <p className="text-sm font-medium">{selectedRequest.requested_plan}</p>
                </div>
              </div>

              {selectedRequest.message && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">User Message</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{selectedRequest.message}</p>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Admin Notes</p>
                  <p className="text-sm bg-blue-50 p-3 rounded-md border-l-4 border-blue-200">
                    {selectedRequest.admin_notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{formatDate(selectedRequest.created_at)}</p>
                </div>
                {selectedRequest.processed_at && (
                  <div>
                    <p className="text-gray-500">Processed</p>
                    <p>{formatDate(selectedRequest.processed_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {actionType === 'reject' && <XCircle className="h-5 w-5 text-red-500" />}
              {actionType === 'complete' && <CheckCircle className="h-5 w-5 text-blue-500" />}
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'reject' && 'Reject Request'}
              {actionType === 'complete' && 'Mark as Complete'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'This will approve the upgrade request and update the user plan.'}
              {actionType === 'reject' && 'This will reject the upgrade request.'}
              {actionType === 'complete' && 'This will mark the request as completed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this action..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionDialog(false)
                  setActionType(null)
                  setAdminNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestAction}
                className={
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }
              >
                {actionType === 'approve' && <CheckCircle className="h-4 w-4 mr-2" />}
                {actionType === 'reject' && <XCircle className="h-4 w-4 mr-2" />}
                {actionType === 'complete' && <CheckCircle className="h-4 w-4 mr-2" />}
                {actionType === 'approve' && 'Approve'}
                {actionType === 'reject' && 'Reject'}
                {actionType === 'complete' && 'Complete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
