"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  MapPin,
  MessageSquare,
} from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"

interface ReservationFormProps {
  restaurantId: string
  restaurantName: string
}

interface ReservationData {
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  reservationDate: string
  reservationTime: string
  specialRequests: string
  tablePreference: string
}

export default function ReservationForm({ restaurantId, restaurantName }: ReservationFormProps) {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          failedCreate: "No se pudo crear la reserva",
          submittedTitle: "Reserva enviada",
          submittedDesc: "Gracias por tu solicitud. Confirmaremos la reserva en breve.",
          makeAnother: "Hacer otra reserva",
          bookTable: "Reservar mesa",
          reserveAt: "Reserva tu mesa en",
          yourDetails: "Tus datos",
          fullName: "Nombre completo*",
          phone: "Telefono*",
          emailOptional: "Email (opcional)",
          reservationDetails: "Detalles de la reserva",
          partySize: "Tamano del grupo*",
          selectPartySize: "Selecciona tamano del grupo",
          person: "persona",
          people: "personas",
          date: "Fecha*",
          selectDate: "Selecciona fecha",
          time: "Hora*",
          selectTime: "Selecciona hora",
          preferences: "Preferencias",
          tablePreference: "Preferencia de mesa",
          anyTable: "Cualquier mesa",
          window: "Junto a ventana",
          outdoor: "Terraza",
          quiet: "Zona tranquila",
          bar: "Barra",
          specialRequests: "Peticiones especiales",
          specialRequestsPlaceholder: "Alergias o peticiones especiales...",
          submitting: "Enviando...",
          requestReservation: "Solicitar reserva",
          requiredNote: "* Campos obligatorios. Confirmaremos tu reserva en 24 horas.",
        }
      : {
          failedCreate: "Failed to create reservation",
          submittedTitle: "Reservation Submitted!",
          submittedDesc: "Thank you for your reservation request. We'll confirm your booking shortly.",
          makeAnother: "Make Another Reservation",
          bookTable: "Book a Table",
          reserveAt: "Reserve your table at",
          yourDetails: "Your Details",
          fullName: "Full name*",
          phone: "Phone*",
          emailOptional: "Email (optional)",
          reservationDetails: "Reservation Details",
          partySize: "Party Size*",
          selectPartySize: "Select party size",
          person: "person",
          people: "people",
          date: "Date*",
          selectDate: "Select date",
          time: "Time*",
          selectTime: "Select time",
          preferences: "Preferences",
          tablePreference: "Table Preference",
          anyTable: "Any table is fine",
          window: "Window seat",
          outdoor: "Outdoor seating",
          quiet: "Quiet area",
          bar: "Bar seating",
          specialRequests: "Special Requests",
          specialRequestsPlaceholder: "Any special requests or dietary requirements...",
          submitting: "Submitting...",
          requestReservation: "Request Reservation",
          requiredNote: "* Required fields. We'll confirm your reservation within 24 hours.",
        }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<ReservationData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    partySize: 2,
    reservationDate: "",
    reservationTime: "",
    specialRequests: "",
    tablePreference: "any",
  })

  // Generate available times (every 30 minutes from 11:00 to 22:00)
  const generateTimeSlots = () => {
    const times = []
    for (let hour = 11; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }

  // Generate available dates (next 30 days)
  const generateDateSlots = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          partySize: formData.partySize,
          reservationDate: formData.reservationDate,
          reservationTime: formData.reservationTime,
          specialRequests: formData.specialRequests,
          tablePreference: formData.tablePreference,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || tx.failedCreate)
      }

      setIsSubmitted(true)
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      setError(error.message || tx.failedCreate)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ReservationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{tx.submittedTitle}</h3>
          <p className="text-gray-600 mb-4">
            {tx.submittedDesc}
          </p>
          <Button 
            onClick={() => {
              setIsSubmitted(false)
              setFormData({
                customerName: "",
                customerEmail: "",
                customerPhone: "",
                partySize: 2,
                reservationDate: "",
                reservationTime: "",
                specialRequests: "",
                tablePreference: "any",
              })
            }}
            className="w-full"
          >
            {tx.makeAnother}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-2xl font-bold text-slate-900">
          <Calendar className="h-6 w-6 text-blue-600" />
          <span>{tx.bookTable}</span>
        </CardTitle>
        <CardDescription className="text-base text-slate-600 mt-2">
          {tx.reserveAt} <span className="font-semibold text-slate-900">{restaurantName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos personales */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" /> {tx.yourDetails}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder={tx.fullName}
                  required
                  className="pl-10 h-12 text-base"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <div className="relative">
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder={tx.phone}
                  required
                  className="pl-10 h-12 text-base"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <div className="relative md:col-span-2">
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder={tx.emailOptional}
                  className="pl-10 h-12 text-base"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Detalles de reserva */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" /> {tx.reservationDetails}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block text-slate-700">{tx.partySize}</Label>
                <Select
                  value={formData.partySize.toString()}
                  onValueChange={(value) => handleInputChange('partySize', parseInt(value))}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={tx.selectPartySize} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? tx.person : tx.people}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-slate-700">{tx.date}</Label>
                <Select
                  value={formData.reservationDate}
                  onValueChange={(value) => handleInputChange('reservationDate', value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={tx.selectDate} />
                  </SelectTrigger>
                  <SelectContent>
                    {generateDateSlots().map(date => {
                      const displayDate = new Date(date)
                      return (
                        <SelectItem key={date} value={date}>
                          {displayDate.toLocaleDateString(locale, {
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-slate-700">{tx.time}</Label>
                <Select
                  value={formData.reservationTime}
                  onValueChange={(value) => handleInputChange('reservationTime', value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={tx.selectTime} />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map(time => {
                      const [hours, minutes] = time.split(':')
                      const hour = parseInt(hours)
                      const ampm = hour >= 12 ? 'PM' : 'AM'
                      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                      const displayTime = `${displayHour}:${minutes} ${ampm}`
                      
                      return (
                        <SelectItem key={time} value={time}>
                          {displayTime}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preferencias */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" /> {tx.preferences}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-slate-700">{tx.tablePreference}</Label>
                <Select
                  value={formData.tablePreference}
                  onValueChange={(value) => handleInputChange('tablePreference', value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={tx.anyTable} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{tx.anyTable}</SelectItem>
                    <SelectItem value="window">{tx.window}</SelectItem>
                    <SelectItem value="outdoor">{tx.outdoor}</SelectItem>
                    <SelectItem value="quiet">{tx.quiet}</SelectItem>
                    <SelectItem value="bar">{tx.bar}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-slate-700">{tx.specialRequests}</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder={tx.specialRequestsPlaceholder}
                  rows={3}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2"><Clock className="h-5 w-5 animate-spin" /> {tx.submitting}</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5" /> {tx.requestReservation}</span>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-2">
            {tx.requiredNote}
          </p>
        </form>
      </CardContent>
    </Card>
  )
} 