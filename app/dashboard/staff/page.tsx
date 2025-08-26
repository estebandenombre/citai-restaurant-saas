"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  CalendarIcon,
  Clock,
  Mail,
  Phone,
  User,
  CalendarDays,
  DollarSign,
  ClipboardList,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { Loading } from "@/components/ui/loading"
import { PageHeader } from "@/components/ui/page-header"
import { FormattedPrice } from "@/components/ui/formatted-price"

interface StaffMember {
  id: string
  restaurant_id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
  phone?: string
  position?: string
  hourly_rate?: number
  hire_date?: string
  notes?: string
}

interface Shift {
  id: string
  restaurant_id: string
  user_id: string
  shift_date: string
  start_time: string
  end_time: string
  break_duration: number
  hourly_rate: number | null
  status: string
  created_at: string
  staff?: StaffMember
}

export default function StaffPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Dialog states
  const [staffDialogOpen, setStaffDialogOpen] = useState(false)
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Form states
  const [staffForm, setStaffForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "staff",
    position: "",
    hourly_rate: "",
    hire_date: "",
    notes: "",
    is_active: true,
  })

  const [shiftForm, setShiftForm] = useState({
    user_id: "",
    shift_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "17:00",
    break_duration: "30",
    hourly_rate: "",
    status: "scheduled",
  })

  useEffect(() => {
    fetchStaffData()
  }, [])

  useEffect(() => {
    filterStaff()
  }, [staffMembers, searchTerm, roleFilter])

  const fetchStaffData = async () => {
    try {
      const { restaurantId: userRestaurantId, restaurant: userRestaurant } = await getCurrentUserRestaurant()
      setRestaurant(userRestaurant)
      setRestaurantId(userRestaurantId)

      // Fetch staff members
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("*")
        .eq("restaurant_id", userRestaurantId)
        .order("first_name")

      if (staffError) throw staffError

      // Fetch shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("staff_shifts")
        .select(`
          *,
          staff:user_id (
            first_name,
            last_name,
            role
          )
        `)
        .eq("restaurant_id", userRestaurantId)
        .order("shift_date", { ascending: false })

      if (shiftsError) throw shiftsError

      setStaffMembers(staffData || [])
      setShifts(shiftsData || [])
    } catch (error) {
      console.error("Error fetching staff data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterStaff = () => {
    let filtered = staffMembers

    if (searchTerm) {
      filtered = filtered.filter(
        (staff) =>
          staff.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.position?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((staff) => staff.role === roleFilter)
    }

    setFilteredStaff(filtered)
  }

  const handleCreateStaff = async () => {
    if (!restaurantId || !staffForm.first_name.trim() || !staffForm.last_name.trim() || !staffForm.email.trim()) return

    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8)

      const { data, error } = await supabase
        .from("staff")
        .insert({
          restaurant_id: restaurantId,
          first_name: staffForm.first_name.trim(),
          last_name: staffForm.last_name.trim(),
          email: staffForm.email.trim(),
          phone: staffForm.phone.trim() || null,
          role: staffForm.role,
          position: staffForm.position.trim() || null,
          hourly_rate: staffForm.hourly_rate ? Number.parseFloat(staffForm.hourly_rate) : null,
          hire_date: staffForm.hire_date || null,
          notes: staffForm.notes.trim() || null,
          is_active: staffForm.is_active,
        })
        .select()
        .single()

      if (error) throw error

      setStaffMembers([...staffMembers, data])
      resetStaffForm()
      setStaffDialogOpen(false)
    } catch (error) {
      console.error("Error creating staff member:", error)
    }
  }

  const handleUpdateStaff = async () => {
    if (!editingStaff || !staffForm.first_name.trim() || !staffForm.last_name.trim() || !staffForm.email.trim()) return

    try {
      const { data, error } = await supabase
        .from("staff")
        .update({
          first_name: staffForm.first_name.trim(),
          last_name: staffForm.last_name.trim(),
          email: staffForm.email.trim(),
          phone: staffForm.phone.trim() || null,
          role: staffForm.role,
          position: staffForm.position.trim() || null,
          hourly_rate: staffForm.hourly_rate ? Number.parseFloat(staffForm.hourly_rate) : null,
          hire_date: staffForm.hire_date || null,
          notes: staffForm.notes.trim() || null,
          is_active: staffForm.is_active,
        })
        .eq("id", editingStaff.id)
        .eq("restaurant_id", restaurantId)
        .select()
        .single()

      if (error) throw error

      setStaffMembers(staffMembers.map((staff) => (staff.id === editingStaff.id ? data : staff)))
      resetStaffForm()
      setEditingStaff(null)
      setStaffDialogOpen(false)
    } catch (error) {
      console.error("Error updating staff member:", error)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!restaurantId) return

    try {
      const { error } = await supabase.from("staff").delete().eq("id", staffId).eq("restaurant_id", restaurantId)

      if (error) throw error

      setStaffMembers(staffMembers.filter((staff) => staff.id !== staffId))
    } catch (error) {
      console.error("Error deleting staff member:", error)
    }
  }

  const handleCreateShift = async () => {
    if (!restaurantId || !shiftForm.user_id || !shiftForm.shift_date) return

    try {
      const { data, error } = await supabase
        .from("staff_shifts")
        .insert({
          restaurant_id: restaurantId,
          user_id: shiftForm.user_id,
          shift_date: shiftForm.shift_date,
          start_time: shiftForm.start_time,
          end_time: shiftForm.end_time,
          break_duration: Number.parseInt(shiftForm.break_duration),
          hourly_rate: shiftForm.hourly_rate ? Number.parseFloat(shiftForm.hourly_rate) : null,
          status: shiftForm.status,
        })
        .select(`
          *,
          staff:user_id (
            first_name,
            last_name,
            role
          )
        `)
        .single()

      if (error) throw error

      setShifts([data, ...shifts])
      resetShiftForm()
      setShiftDialogOpen(false)
    } catch (error) {
      console.error("Error creating shift:", error)
    }
  }

  const handleUpdateShiftStatus = async (shiftId: string, newStatus: string) => {
    if (!restaurantId) return

    try {
      const { data, error } = await supabase
        .from("staff_shifts")
        .update({
          status: newStatus,
        })
        .eq("id", shiftId)
        .eq("restaurant_id", restaurantId)
        .select(`
          *,
          staff:user_id (
            first_name,
            last_name,
            role
          )
        `)
        .single()

      if (error) throw error

      setShifts(shifts.map((shift) => (shift.id === shiftId ? data : shift)))
    } catch (error) {
      console.error("Error updating shift status:", error)
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    if (!restaurantId) return

    try {
      const { error } = await supabase.from("staff_shifts").delete().eq("id", shiftId).eq("restaurant_id", restaurantId)

      if (error) throw error

      setShifts(shifts.filter((shift) => shift.id !== shiftId))
    } catch (error) {
      console.error("Error deleting shift:", error)
    }
  }

  const openStaffDialog = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff)
      setStaffForm({
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        phone: staff.phone || "",
        role: staff.role,
        position: staff.position || "",
        hourly_rate: staff.hourly_rate?.toString() || "",
        hire_date: staff.hire_date || "",
        notes: staff.notes || "",
        is_active: staff.is_active,
      })
    } else {
      setEditingStaff(null)
      resetStaffForm()
    }
    setStaffDialogOpen(true)
  }

  const resetStaffForm = () => {
    setStaffForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "staff",
      position: "",
      hourly_rate: "",
      hire_date: "",
      notes: "",
      is_active: true,
    })
  }

  const resetShiftForm = () => {
    setShiftForm({
      user_id: "",
      shift_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "09:00",
      end_time: "17:00",
      break_duration: "30",
      hourly_rate: "",
      status: "scheduled",
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "started":
        return "bg-green-100 text-green-800"
      case "break":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateShiftHours = (startTime: string, endTime: string, breakDuration: number) => {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    const totalMinutes = endMinutes - startMinutes - breakDuration
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}h ${minutes}m`
  }

  const calculateShiftCost = (startTime: string, endTime: string, breakDuration: number, hourlyRate: number) => {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    const totalMinutes = endMinutes - startMinutes - breakDuration
    const hours = totalMinutes / 60

    return (hours * hourlyRate).toFixed(2)
  }

  const getShiftsForDate = (date: string) => {
    return shifts.filter((shift) => shift.shift_date === date)
  }

  const getTotalStaffCount = () => {
    return staffMembers.length
  }

  const getActiveStaffCount = () => {
    return staffMembers.filter((staff) => staff.is_active).length
  }

  const getManagerCount = () => {
    return staffMembers.filter((staff) => staff.role === "manager" || staff.role === "owner").length
  }

  const getAverageHourlyRate = () => {
    const staffWithRates = staffMembers.filter((staff) => staff.hourly_rate)
    if (staffWithRates.length === 0) return 0

    const total = staffWithRates.reduce((sum, staff) => sum + (staff.hourly_rate || 0), 0)
    return (total / staffWithRates.length).toFixed(2)
  }

  if (loading) {
    return <Loading text="Loading team..." />
  }

  return (
    <div className="space-y-6">
      {/* Minimalist Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-violet-50 border border-violet-100 rounded-lg">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Team
              </h1>
              <p className="text-gray-500 text-sm">
                Manage your restaurant team and schedules
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setShiftDialogOpen(true)}
              variant="outline"
              className="border border-gray-200 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
            <Button 
              onClick={() => openStaffDialog()}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalStaffCount()}</div>
            <p className="text-xs text-muted-foreground">{getActiveStaffCount()} team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Management</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getManagerCount()}</div>
            <p className="text-xs text-muted-foreground">Managers & owners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {shifts.filter((shift) => shift.status === "scheduled").length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled shifts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${getAverageHourlyRate()}</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Staff and Shifts */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="shifts">Shifts & Schedule</TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Staff</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="role">Role Filter</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <div className="space-y-4">
            {filteredStaff.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {staffMembers.length === 0 ? "No staff members yet" : "No staff members found"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {staffMembers.length === 0
                      ? "Add your first staff member to get started"
                      : "Try adjusting your filters"}
                  </p>
                  {staffMembers.length === 0 && (
                    <Button onClick={() => openStaffDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff Member
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredStaff.map((staff) => (
                  <Card key={staff.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex flex-col">
                              <h3 className="text-lg font-semibold">
                                {staff.first_name} {staff.last_name}
                              </h3>
                              <p className="text-sm text-gray-500">{staff.position || "No position specified"}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={getRoleColor(staff.role)}>{staff.role}</Badge>
                              {!staff.is_active && <Badge variant="secondary">Inactive</Badge>}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{staff.email}</span>
                            </div>

                            {staff.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{staff.phone}</span>
                              </div>
                            )}

                            {staff.hourly_rate && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span>
                                  <FormattedPrice amount={staff.hourly_rate} restaurantId={restaurantId || undefined} />/hour
                                </span>
                              </div>
                            )}
                          </div>

                          {staff.hire_date && (
                            <div className="mt-2 text-xs text-gray-500">
                              <CalendarDays className="inline w-3 h-3 mr-1" />
                              Hired: {new Date(staff.hire_date).toLocaleDateString()}
                            </div>
                          )}

                          {staff.notes && (
                            <div className="mt-2 text-sm">
                              <p className="text-gray-600">{staff.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openStaffDialog(staff)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {staff.first_name} {staff.last_name}? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteStaff(staff.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Shifts Tab */}
        <TabsContent value="shifts" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Calendar */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Schedule Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="mt-4">
                  <Button className="w-full" onClick={() => setShiftDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shift
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shifts for selected date */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  Shifts for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Today"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate && getShiftsForDate(format(selectedDate, "yyyy-MM-dd")).length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No shifts scheduled</h3>
                    <p className="text-gray-500 mb-4">No shifts are scheduled for this date</p>
                    <Button onClick={() => setShiftDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Shift
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDate &&
                      getShiftsForDate(format(selectedDate, "yyyy-MM-dd")).map((shift) => (
                        <Card key={shift.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold">
                                    {shift.staff?.first_name} {shift.staff?.last_name}
                                  </h4>
                                  <Badge className={getShiftStatusColor(shift.status)}>{shift.status}</Badge>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <Clock className="inline w-3 h-3 mr-1" />
                                  {shift.start_time} - {shift.end_time} (
                                  {calculateShiftHours(shift.start_time, shift.end_time, shift.break_duration)})
                                </div>
                                {shift.break_duration > 0 && (
                                  <div className="text-xs text-gray-500">Break: {shift.break_duration} minutes</div>
                                )}
                                {shift.hourly_rate && (
                                  <div className="text-xs text-gray-500">
                                    Cost: $
                                    {calculateShiftCost(
                                      shift.start_time,
                                      shift.end_time,
                                      shift.break_duration,
                                      shift.hourly_rate,
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Select
                                  value={shift.status}
                                  onValueChange={(value) => handleUpdateShiftStatus(shift.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="started">Started</SelectItem>
                                    <SelectItem value="break">On Break</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this shift? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteShift(shift.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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

          {/* Recent Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent & Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              {shifts.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No shifts yet</h3>
                  <p className="text-gray-500 mb-4">Add your first shift to get started</p>
                  <Button onClick={() => setShiftDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shift
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {shifts.slice(0, 5).map((shift) => (
                    <div key={shift.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {shift.staff?.first_name} {shift.staff?.last_name}
                          </h4>
                          <Badge className={getShiftStatusColor(shift.status)}>{shift.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(shift.shift_date).toLocaleDateString()} • {shift.start_time} - {shift.end_time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {calculateShiftHours(shift.start_time, shift.end_time, shift.break_duration)}
                        </div>
                        {shift.hourly_rate && (
                          <div className="text-xs text-gray-500">
                            $
                            {calculateShiftCost(
                              shift.start_time,
                              shift.end_time,
                              shift.break_duration,
                              shift.hourly_rate,
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
            <DialogDescription>
              {editingStaff ? "Update staff member information" : "Add a new staff member to your team"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={staffForm.first_name}
                  onChange={(e) => setStaffForm({ ...staffForm, first_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={staffForm.last_name}
                  onChange={(e) => setStaffForm({ ...staffForm, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={staffForm.role} onValueChange={(value) => setStaffForm({ ...staffForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position (Optional)</Label>
                <Input
                  id="position"
                  value={staffForm.position}
                  onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                  placeholder="e.g., Chef, Server, Bartender"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly-rate">Hourly Rate ($) (Optional)</Label>
                <Input
                  id="hourly-rate"
                  type="number"
                  step="0.01"
                  value={staffForm.hourly_rate}
                  onChange={(e) => setStaffForm({ ...staffForm, hourly_rate: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="hire-date">Hire Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !staffForm.hire_date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {staffForm.hire_date ? format(new Date(staffForm.hire_date), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={staffForm.hire_date ? new Date(staffForm.hire_date) : undefined}
                      onSelect={(date) =>
                        setStaffForm({ ...staffForm, hire_date: date ? format(date, "yyyy-MM-dd") : "" })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={staffForm.notes}
                onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                placeholder="Any additional notes"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-active"
                checked={staffForm.is_active}
                onChange={(e) => setStaffForm({ ...staffForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is-active">Team Member</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingStaff ? handleUpdateStaff : handleCreateStaff}>
                {editingStaff ? "Update" : "Add"} Staff Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Shift Dialog */}
      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>Schedule a new shift for a staff member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff-member">Staff Member</Label>
              <Select
                value={shiftForm.user_id}
                onValueChange={(value) => setShiftForm({ ...shiftForm, user_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers
                    .filter((staff) => staff.is_active)
                    .map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="shift-date">Shift Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {shiftForm.shift_date ? format(new Date(shiftForm.shift_date), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={shiftForm.shift_date ? new Date(shiftForm.shift_date) : undefined}
                    onSelect={(date) =>
                      setShiftForm({ ...shiftForm, shift_date: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={shiftForm.start_time}
                  onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={shiftForm.end_time}
                  onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                <Input
                  id="break-duration"
                  type="number"
                  value={shiftForm.break_duration}
                  onChange={(e) => setShiftForm({ ...shiftForm, break_duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hourly-rate">Hourly Rate ($) (Optional)</Label>
                <Input
                  id="hourly-rate"
                  type="number"
                  step="0.01"
                  value={shiftForm.hourly_rate}
                  onChange={(e) => setShiftForm({ ...shiftForm, hourly_rate: e.target.value })}
                  placeholder="Use staff default"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={shiftForm.status} onValueChange={(value) => setShiftForm({ ...shiftForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="break">On Break</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shiftForm.start_time && shiftForm.end_time && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Shift Duration:</strong>{" "}
                  {calculateShiftHours(shiftForm.start_time, shiftForm.end_time, Number(shiftForm.break_duration))}
                </p>
                {shiftForm.hourly_rate && (
                  <p className="text-sm text-blue-800">
                    <strong>Estimated Cost:</strong> $
                    {calculateShiftCost(
                      shiftForm.start_time,
                      shiftForm.end_time,
                      Number(shiftForm.break_duration),
                      Number(shiftForm.hourly_rate),
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateShift}>Add Shift</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
