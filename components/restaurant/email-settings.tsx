"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, CheckCircle, XCircle, Settings, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface EmailSettings {
  enabled: boolean
  send_confirmation: boolean
  send_status_updates: boolean
}

interface EmailSettingsProps {
  restaurantId: string
}

export function EmailSettings({ restaurantId }: EmailSettingsProps) {
  const [settings, setSettings] = useState<EmailSettings>({
    enabled: false,
    send_confirmation: true,
    send_status_updates: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmailSettings()
  }, [restaurantId])

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('email_settings')
        .eq('id', restaurantId)
        .single()

      if (error) throw error

      if (data?.email_settings) {
        setSettings(data.email_settings)
      }
    } catch (error) {
      console.error('Error fetching email settings:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de email",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateEmailSettings = async (newSettings: EmailSettings) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          email_settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId)

      if (error) throw error

      setSettings(newSettings)
      toast({
        title: "Configuración actualizada",
        description: "Las configuraciones de email se han guardado correctamente",
      })
    } catch (error) {
      console.error('Error updating email settings:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones de email",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof EmailSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    
    // Si se deshabilita el email principal, también deshabilitar las sub-opciones
    if (key === 'enabled' && !newSettings.enabled) {
      newSettings.send_confirmation = false
      newSettings.send_status_updates = false
    }
    
    // Si se habilita el email principal, habilitar las sub-opciones por defecto
    if (key === 'enabled' && newSettings.enabled) {
      newSettings.send_confirmation = true
      newSettings.send_status_updates = true
    }
    
    updateEmailSettings(newSettings)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuración de Emails
          </CardTitle>
          <CardDescription>
            Gestiona el envío automático de emails a los clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Configuración de Emails
        </CardTitle>
        <CardDescription>
          Gestiona el envío automático de emails a los clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado general */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Emails automáticos</Label>
            <p className="text-sm text-muted-foreground">
              Habilita o deshabilita el envío automático de emails
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={settings.enabled ? "default" : "secondary"}>
              {settings.enabled ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Habilitado
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Deshabilitado
                </>
              )}
            </Badge>
            <Switch
              checked={settings.enabled}
              onCheckedChange={() => handleToggle('enabled')}
              disabled={saving}
            />
          </div>
        </div>

        <Separator />

        {/* Sub-configuraciones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Confirmación de pedido</Label>
              <p className="text-xs text-muted-foreground">
                Email automático cuando se crea un pedido
              </p>
            </div>
            <Switch
              checked={settings.send_confirmation}
              onCheckedChange={() => handleToggle('send_confirmation')}
              disabled={!settings.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Actualizaciones de estado</Label>
              <p className="text-xs text-muted-foreground">
                Email cuando cambia el estado del pedido
              </p>
            </div>
            <Switch
              checked={settings.send_status_updates}
              onCheckedChange={() => handleToggle('send_status_updates')}
              disabled={!settings.enabled || saving}
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900">
                Información sobre los emails automáticos
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Los emails se envían desde info@tably.digital</li>
                <li>• Solo se envían si el cliente proporciona un email válido</li>
                <li>• Los errores de envío se registran en los logs</li>
                <li>• Puedes reenviar emails manualmente desde la lista de pedidos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <Button 
            onClick={() => updateEmailSettings(settings)}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
