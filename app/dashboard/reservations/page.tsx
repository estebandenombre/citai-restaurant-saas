"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CalendarDays,
  MapPin,
  MessageSquare,
  Grid3X3,
  List,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Star,
  Clock4,
  MapPinIcon,
} from "lucide-react"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Loading } from "@/components/ui/loading"

interface Reservation {
  id: string
  restaurant_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  party_size: number
  reservation_date: string
  reservation_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests: string | null
  table_preference: string | null
  created_at: string
  updated_at: string
}

type ViewMode = 'list' | 'calendar' | 'timeline' | 'planner'

// Helper functions for date handling
const formatDateToLocalString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayString = () => {
  return formatDateToLocalString(new Date())
}

const getTomorrowString = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateToLocalString(tomorrow)
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false)
  const [newReservation, setNewReservation] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    party_size: 2,
    reservation_date: formatDateToLocalString(new Date()),
    reservation_time: '18:00',
    special_requests: '',
    table_preference: ''
  })
  const [viewMode, setViewMode] = useState<ViewMode>('planner')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { toast } = useToast()

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const { restaurantId, restaurant: userRestaurant } = await getCurrentUserRestaurant()
      setRestaurant(userRestaurant)

      if (!restaurantId) {
        console.error("No restaurant ID found")
        return
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("reservation_date", { ascending: true })
        .order("reservation_time", { ascending: true })

      if (error) {
        console.error("Error fetching reservations:", error)
        toast({
          title: "Error loading reservations",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      setReservations(data || [])
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast({
        title: "Error loading reservations",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: newStatus })
        .eq("id", reservationId)

      if (error) {
        console.error("Error updating reservation:", error)
        toast({
          title: "Error updating reservation",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: newStatus as any }
            : reservation
        )
      )

      toast({
        title: "Reservation updated",
        description: `Status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast({
        title: "Error updating reservation",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const moveReservation = async (reservationId: string, newDate: string, newTime: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ 
          reservation_date: newDate,
          reservation_time: newTime 
        })
        .eq("id", reservationId)

      if (error) {
        console.error("Error moving reservation:", error)
        toast({
          title: "Error moving reservation",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, reservation_date: newDate, reservation_time: newTime }
            : reservation
        )
      )

      toast({
        title: "Reservation moved",
        description: `Moved to ${formatDate(newDate)} at ${formatTime(newTime)}`,
      })

      setIsEditDialogOpen(false)
      setEditingReservation(null)
    } catch (error) {
      console.error("Error moving reservation:", error)
      toast({
        title: "Error moving reservation",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const cancelReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: 'cancelled' })
        .eq("id", reservationId)

      if (error) {
        console.error("Error cancelling reservation:", error)
        toast({
          title: "Error cancelling reservation",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'cancelled' }
            : reservation
        )
      )

      toast({
        title: "Reservation cancelled",
        description: "The reservation has been cancelled.",
      })

      setIsEditDialogOpen(false)
      setEditingReservation(null)
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      toast({
        title: "Error cancelling reservation",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const createReservation = async () => {
    try {
      const { restaurantId } = await getCurrentUserRestaurant()
      if (!restaurantId) {
        toast({
          title: "Error",
          description: "Restaurant not found.",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("reservations")
        .insert({
          restaurant_id: restaurantId,
          customer_name: newReservation.customer_name,
          customer_email: newReservation.customer_email || null,
          customer_phone: newReservation.customer_phone,
          party_size: newReservation.party_size,
          reservation_date: newReservation.reservation_date,
          reservation_time: newReservation.reservation_time,
          status: 'pending',
          special_requests: newReservation.special_requests || null,
          table_preference: newReservation.table_preference || null
        })
        .select()

      if (error) {
        console.error("Error creating reservation:", error)
        toast({
          title: "Error creating reservation",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Add to local state
      if (data && data[0]) {
        setReservations(prev => [data[0], ...prev])
      }

      toast({
        title: "Reservation created",
        description: "The reservation has been created successfully.",
      })

      // Reset form and close dialog
      setNewReservation({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        party_size: 2,
        reservation_date: formatDateToLocalString(new Date()),
        reservation_time: '18:00',
        special_requests: '',
        table_preference: ''
      })
      setIsNewReservationOpen(false)
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Error creating reservation",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle },
      confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
      completed: { label: "Completed", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customer_phone.includes(searchTerm)
    
    const matchesName = nameFilter === "" || reservation.customer_name.toLowerCase().includes(nameFilter.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "today" && reservation.reservation_date === getTodayString()) ||
                       (dateFilter === "tomorrow" && reservation.reservation_date === getTomorrowString())

    return matchesSearch && matchesName && matchesStatus && matchesDate
  })

  // Get reservations for a specific date (with search filter)
  const getReservationsForDate = (date: string) => {
    return filteredReservations.filter(r => r.reservation_date === date)
  }

  // Get reservations for a specific date and time (with search filter)
  const getReservationsForTime = (date: string, time: string) => {
    return filteredReservations.filter(r => 
      r.reservation_date === date && r.reservation_time === time
    )
  }

  // Generate calendar days for the current month (highlight days with search results)
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  // Generate timeline data for the current week (with search filter)
  const generateTimelineData = () => {
    const weekStart = new Date(selectedDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    
    const timelineData = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateString = formatDateToLocalString(date)
      const dayReservations = getReservationsForDate(dateString)
      
      timelineData.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        reservations: dayReservations
      })
    }
    
    return timelineData
  }

  const getStats = () => {
    const total = reservations.length
    const pending = reservations.filter(r => r.status === 'pending').length
    const confirmed = reservations.filter(r => r.status === 'confirmed').length
    const today = reservations.filter(r => r.reservation_date === getTodayString()).length

    return { total, pending, confirmed, today }
  }

  // Generate time slots for planner view
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 11; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setSelectedDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const handleDateChange = (dateString: string) => {
    const newDate = new Date(dateString)
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate)
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setNameFilter("")
    setStatusFilter("all")
    setDateFilter("all")
  }

  // Generate date options for the next 30 days
  const generateDateOptions = () => {
    const options = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateString = formatDateToLocalString(date)
      const displayDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
      options.push({ value: dateString, label: displayDate })
    }
    return options
  }

  // Generate time slots for edit dialog
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 11; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = formatTime(time)
        options.push({ value: time, label: displayTime })
      }
    }
    return options
  }

  // Get today's date in YYYY-MM-DD format
      const today = formatDateToLocalString(selectedDate)

  if (loading) {
    return <Loading text="Loading reservations..." />
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalist Header */}
      <div className="bg-white rounded-lg border-b border-gray-200 px-6 py-4">
        
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-50 border border-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Reservations
                </h1>
                <p className="text-gray-500 text-sm">
                  Manage your restaurant reservations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setIsNewReservationOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </div>
          </div>
       
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time reservations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">
                Confirmed reservations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground">
                Reservations for today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                    <Search className="h-3 w-3" />
                    <span>
                      Found {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''} 
                      matching "{searchTerm}"
                    </span>
                  </div>
                )}
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter by customer name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || nameFilter || statusFilter !== "all" || dateFilter !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock4 className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Planner
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {filteredReservations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                  <p className="text-gray-500">
                    {searchTerm || nameFilter || statusFilter !== "all" || dateFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "No reservations have been made yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReservations.map((reservation) => {
                const statusConfig = getStatusConfig(reservation.status)
                const StatusIcon = statusConfig.icon

                return (
                  <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <div>
                            <h3 className="font-medium">{reservation.customer_name}</h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(reservation.reservation_date)} at {formatTime(reservation.reservation_time)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>{reservation.party_size} people</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{reservation.customer_phone}</span>
                          </div>
                          {reservation.customer_email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{reservation.customer_email}</span>
                            </div>
                          )}
                          {reservation.table_preference && (
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>Prefers: {reservation.table_preference}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {reservation.special_requests && (
                            <div className="flex items-start space-x-2 text-sm">
                              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">{reservation.special_requests}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Reservation Details</DialogTitle>
                              <DialogDescription>
                                Reservation for {reservation.customer_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Date</Label>
                                  <p className="text-sm text-gray-600">{formatDate(reservation.reservation_date)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Time</Label>
                                  <p className="text-sm text-gray-600">{formatTime(reservation.reservation_time)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Party Size</Label>
                                  <p className="text-sm text-gray-600">{reservation.party_size} people</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <Badge className={statusConfig.color}>
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                              </div>
                              <Separator />
                              <div>
                                <Label className="text-sm font-medium">Contact Information</Label>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-gray-600">{reservation.customer_name}</p>
                                  <p className="text-sm text-gray-600">{reservation.customer_phone}</p>
                                  {reservation.customer_email && (
                                    <p className="text-sm text-gray-600">{reservation.customer_email}</p>
                                  )}
                                </div>
                              </div>
                              {reservation.special_requests && (
                                <>
                                  <Separator />
                                  <div>
                                    <Label className="text-sm font-medium">Special Requests</Label>
                                    <p className="text-sm text-gray-600 mt-1">{reservation.special_requests}</p>
                                  </div>
                                </>
                              )}
                              {reservation.table_preference && (
                                <>
                                  <Separator />
                                  <div>
                                    <Label className="text-sm font-medium">Table Preference</Label>
                                    <p className="text-sm text-gray-600 mt-1">{reservation.table_preference}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {reservation.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        {reservation.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateReservationStatus(reservation.id, 'completed')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Calendar View</CardTitle>
                    <CardDescription>
                      {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {generateCalendarDays().map((date, index) => {
                    const dateString = formatDateToLocalString(date)
                    const dayReservations = getReservationsForDate(dateString)
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                    const isToday = dateString === getTodayString()
                    const hasSearchResults = searchTerm && dayReservations.length > 0
                    
                    return (
                      <div
                        key={index}
                        className={`p-2 min-h-[80px] border border-gray-200 ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                          hasSearchResults ? 'ring-2 ring-green-500 bg-green-50' : ''
                        }`}
                      >
                        <div className={`text-sm font-medium ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isToday ? 'text-blue-600' : ''} ${
                          hasSearchResults ? 'text-green-700' : ''
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayReservations.slice(0, 2).map((reservation) => {
                            const statusConfig = getStatusConfig(reservation.status)
                            return (
                              <div
                                key={reservation.id}
                                className={`text-xs p-1 rounded cursor-pointer ${statusConfig.color} ${
                                  searchTerm && reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) 
                                    ? 'ring-2 ring-green-500' 
                                    : ''
                                }`}
                                onClick={() => setSelectedReservation(reservation)}
                              >
                                <div className="font-medium truncate">{reservation.customer_name}</div>
                                <div className="text-xs opacity-75">{formatTime(reservation.reservation_time)}</div>
                              </div>
                            )
                          })}
                          {dayReservations.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayReservations.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Timeline View</CardTitle>
                    <CardDescription>
                      Week of {generateTimelineData()[0].date} to {generateTimelineData()[6].date}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextDay}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generateTimelineData().map((dayData) => (
                    <div key={dayData.date} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{dayData.dayName}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(dayData.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {dayData.reservations.length} reservations
                        </Badge>
                      </div>
                      
                      {dayData.reservations.length === 0 ? (
                        <div className="text-sm text-gray-400 italic">No reservations</div>
                      ) : (
                        <div className="space-y-2">
                          {dayData.reservations.map((reservation) => {
                            const statusConfig = getStatusConfig(reservation.status)
                            const StatusIcon = statusConfig.icon
                            const isSearchMatch = searchTerm && (
                              reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              reservation.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              reservation.customer_phone.includes(searchTerm)
                            )
                            
                            return (
                              <div
                                key={reservation.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${statusConfig.color} cursor-pointer hover:shadow-md transition-shadow ${
                                  isSearchMatch ? 'ring-2 ring-green-500 bg-green-50' : ''
                                }`}
                                onClick={() => setSelectedReservation(reservation)}
                              >
                                <div className="flex items-center space-x-3">
                                  <StatusIcon className="h-4 w-4" />
                                  <div>
                                    <div className={`font-medium ${isSearchMatch ? 'text-green-700' : ''}`}>
                                      {reservation.customer_name}
                                    </div>
                                    <div className="text-sm opacity-75">
                                      {formatTime(reservation.reservation_time)} • {reservation.party_size} people
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {statusConfig.label}
                                  </Badge>
                                  {isSearchMatch && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                      Match
                                    </Badge>
                                  )}
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planner View */}
          <TabsContent value="planner" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Reservation Planner</CardTitle>
                    <CardDescription>
                      Visual planning for {formatDate(today)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextDay}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-2 ml-4">
                      <Label htmlFor="date-input" className="text-sm font-medium text-gray-700">
                        Go to date:
                      </Label>
                      <Input
                        id="date-input"
                        type="date"
                        value={formatDateToLocalString(selectedDate)}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-40"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Time slots header */}
                    <div className="grid grid-cols-1 gap-4">
                      {timeSlots.map((time) => {
                        const reservationsForTime = getReservationsForTime(today, time)
                        
                        return (
                          <div key={time} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-20 text-sm font-medium text-gray-600">
                              {formatTime(time)}
                            </div>
                            <div className="flex-1">
                              {reservationsForTime.length === 0 ? (
                                <div className="text-sm text-gray-400 italic">No reservations</div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {reservationsForTime.map((reservation) => {
                                    const statusConfig = getStatusConfig(reservation.status)
                                    const StatusIcon = statusConfig.icon
                                    const isSearchMatch = searchTerm && (
                                      reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      reservation.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      reservation.customer_phone.includes(searchTerm)
                                    )
                                    
                                    return (
                                      <div
                                        key={reservation.id}
                                        className={`flex items-center space-x-2 p-2 rounded-lg border ${statusConfig.color} cursor-pointer hover:shadow-md transition-shadow ${
                                          isSearchMatch ? 'ring-2 ring-green-500 bg-green-50' : ''
                                        }`}
                                        onClick={() => setSelectedReservation(reservation)}
                                      >
                                        <StatusIcon className="h-3 w-3" />
                                        <div className="text-xs">
                                          <div className={`font-medium ${isSearchMatch ? 'text-green-700' : ''}`}>
                                            {reservation.customer_name}
                                          </div>
                                          <div className="text-xs opacity-75">
                                            {reservation.party_size} people
                                          </div>
                                        </div>
                                        {isSearchMatch && (
                                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                            Match
                                          </Badge>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reservation Details Dialog */}
      {selectedReservation && (
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
              <DialogDescription>
                Reservation for {selectedReservation.customer_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-gray-600">{formatDate(selectedReservation.reservation_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <p className="text-sm text-gray-600">{formatTime(selectedReservation.reservation_time)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Party Size</Label>
                  <p className="text-sm text-gray-600">{selectedReservation.party_size} people</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusConfig(selectedReservation.status).color}>
                    {getStatusConfig(selectedReservation.status).label}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium">Contact Information</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">{selectedReservation.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedReservation.customer_phone}</p>
                  {selectedReservation.customer_email && (
                    <p className="text-sm text-gray-600">{selectedReservation.customer_email}</p>
                  )}
                </div>
              </div>
              {selectedReservation.special_requests && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Special Requests</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedReservation.special_requests}</p>
                  </div>
                </>
              )}
              {selectedReservation.table_preference && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Table Preference</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedReservation.table_preference}</p>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                {selectedReservation.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'confirmed')
                        setSelectedReservation(null)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirm
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'cancelled')
                        setSelectedReservation(null)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {selectedReservation.status === 'confirmed' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'completed')
                        setSelectedReservation(null)
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Mark Complete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingReservation(selectedReservation)
                        setSelectedReservation(null)
                        setIsEditDialogOpen(true)
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Move
                    </Button>
                  </>
                )}

                {selectedReservation.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingReservation(selectedReservation)
                      setSelectedReservation(null)
                      setIsEditDialogOpen(true)
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Move
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Reservation Dialog */}
      {editingReservation && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Reservation</DialogTitle>
              <DialogDescription>
                Move or cancel reservation for {editingReservation.customer_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Date</Label>
                  <p className="text-sm text-gray-600">{formatDate(editingReservation.reservation_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Time</Label>
                  <p className="text-sm text-gray-600">{formatTime(editingReservation.reservation_time)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">New Date</Label>
                  <Select 
                    defaultValue={editingReservation.reservation_date}
                    onValueChange={(value) => {
                      setEditingReservation(prev => prev ? { ...prev, reservation_date: value } : null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new date" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateDateOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">New Time</Label>
                  <Select 
                    defaultValue={editingReservation.reservation_time}
                    onValueChange={(value) => {
                      setEditingReservation(prev => prev ? { ...prev, reservation_time: value } : null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (editingReservation) {
                      moveReservation(
                        editingReservation.id, 
                        editingReservation.reservation_date, 
                        editingReservation.reservation_time
                      )
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Move Reservation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (editingReservation) {
                      cancelReservation(editingReservation.id)
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel Reservation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingReservation(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Reservation Dialog */}
      <Dialog open={isNewReservationOpen} onOpenChange={setIsNewReservationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Reservation</DialogTitle>
            <DialogDescription>
              Create a new reservation for your restaurant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name" className="text-sm font-medium">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={newReservation.customer_name}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="party_size" className="text-sm font-medium">Party Size</Label>
                <Select 
                  value={newReservation.party_size.toString()} 
                  onValueChange={(value) => setNewReservation(prev => ({ ...prev, party_size: parseInt(value) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select party size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="customer_phone"
                  value={newReservation.customer_phone}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer_email" className="text-sm font-medium">Email (Optional)</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={newReservation.customer_email}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reservation_date" className="text-sm font-medium">Date</Label>
                <Select 
                  value={newReservation.reservation_date} 
                  onValueChange={(value) => setNewReservation(prev => ({ ...prev, reservation_date: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateDateOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reservation_time" className="text-sm font-medium">Time</Label>
                <Select 
                  value={newReservation.reservation_time} 
                  onValueChange={(value) => setNewReservation(prev => ({ ...prev, reservation_time: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="table_preference" className="text-sm font-medium">Table Preference (Optional)</Label>
              <Input
                id="table_preference"
                value={newReservation.table_preference}
                onChange={(e) => setNewReservation(prev => ({ ...prev, table_preference: e.target.value }))}
                placeholder="e.g., Window seat, outdoor, quiet area"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="special_requests" className="text-sm font-medium">Special Requests (Optional)</Label>
              <Textarea
                id="special_requests"
                value={newReservation.special_requests}
                onChange={(e) => setNewReservation(prev => ({ ...prev, special_requests: e.target.value }))}
                placeholder="Any special requests or dietary restrictions"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={createReservation}
                disabled={!newReservation.customer_name || !newReservation.customer_phone}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Reservation
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsNewReservationOpen(false)
                  setNewReservation({
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    party_size: 2,
                    reservation_date: formatDateToLocalString(new Date()),
                    reservation_time: '18:00',
                    special_requests: '',
                    table_preference: ''
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 