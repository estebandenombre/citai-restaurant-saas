"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Printer, Save, TestTube, Wifi, Monitor, FileText, Settings, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { useI18n } from "@/components/i18n/i18n-provider"

interface PrinterConfig {
  enabled: boolean
  printer_type: 'thermal' | 'pdf' | 'escpos' | 'network'
  printer_ip?: string
  printer_port?: number
  printer_name?: string
  paper_width?: number
  auto_cut?: boolean
  print_logo?: boolean
  header_text?: string
  footer_text?: string
}

export default function PrinterSettingsPage() {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          restaurantNotFound: "Restaurante no encontrado",
          saveSuccess: "Configuracion de impresora guardada",
          saveError: "Error al guardar la configuracion",
          testError: "Error al enviar prueba",
          loading: "Cargando configuracion de impresora...",
          title: "Ajustes de impresora",
          subtitle: "Configura la impresion de tickets del restaurante",
          printerConfig: "Configuracion de impresora",
          enableReceipt: "Activar impresion de tickets",
          enableReceiptDesc: "Imprimir tickets automaticamente en cada pedido",
          printerType: "Tipo de impresora",
          thermal: "Impresora termica",
          network: "Impresora de red",
          pdf: "PDF (impresion local)",
          ip: "IP de impresora",
          port: "Puerto de impresora",
          paperWidth: "Ancho de papel (mm)",
          autoCut: "Corte automatico",
          autoCutDesc: "Cortar papel automaticamente al imprimir",
          receiptCustomization: "Personalizacion del ticket",
          printLogo: "Imprimir logo del restaurante",
          printLogoDesc: "Incluir logo en los tickets",
          headerText: "Texto de cabecera",
          headerPh: "Bienvenido a nuestro restaurante",
          headerDesc: "Texto personalizado en la parte superior",
          footerText: "Texto de pie",
          footerPh: "Gracias por tu pedido",
          footerDesc: "Texto personalizado en la parte inferior",
          testPrint: "Prueba de impresion",
          testPrintDesc: "Enviar ticket de prueba para validar la configuracion",
          sendingTest: "Enviando prueba...",
          sendTest: "Enviar prueba",
          saving: "Guardando...",
          saveConfig: "Guardar configuracion",
          status: "Estado de configuracion",
          printerEnabled: "Impresora activada",
          enabled: "Activada",
          disabled: "Desactivada",
          printerTypeLabel: "Tipo de impresora",
          printerIpLabel: "IP de impresora",
          paperWidthLabel: "Ancho de papel",
          printReceipt: "Imprimir ticket",
          instructions: "Instrucciones:",
          printStep1: '1. Haz clic en "Imprimir ticket" o pulsa Ctrl+P',
          printStep2: "2. Selecciona tu impresora USB",
          printStep3: '3. Elige papel "80mm" si esta disponible',
          printStep4: "4. Imprime el ticket",
          pdfOpened: "PDF abierto en nueva ventana - imprime desde ahi",
          popupBlocked: "Bloqueador de ventanas activo - permite ventanas emergentes",
          testSent: "Prueba enviada correctamente",
          escpos: "ESC/POS",
        }
      : {
          restaurantNotFound: "Restaurant not found",
          saveSuccess: "Printer configuration saved successfully",
          saveError: "Error saving configuration",
          testError: "Test print failed",
          loading: "Loading printer configuration...",
          title: "Printer Settings",
          subtitle: "Configure receipt printing for your restaurant",
          printerConfig: "Printer Configuration",
          enableReceipt: "Enable Receipt Printing",
          enableReceiptDesc: "Enable automatic receipt printing for orders",
          printerType: "Printer Type",
          thermal: "Thermal Printer",
          network: "Network Printer",
          pdf: "PDF (Local Print)",
          ip: "Printer IP Address",
          port: "Printer Port",
          paperWidth: "Paper Width (mm)",
          autoCut: "Auto Cut Paper",
          autoCutDesc: "Automatically cut paper after printing",
          receiptCustomization: "Receipt Customization",
          printLogo: "Print Restaurant Logo",
          printLogoDesc: "Include logo on receipts",
          headerText: "Header Text",
          headerPh: "Welcome to our restaurant!",
          headerDesc: "Custom text to appear at the top of receipts",
          footerText: "Footer Text",
          footerPh: "Thank you for your order!",
          footerDesc: "Custom text to appear at the bottom of receipts",
          testPrint: "Test Print",
          testPrintDesc: "Send a test receipt to verify configuration",
          sendingTest: "Sending Test...",
          sendTest: "Send Test Receipt",
          saving: "Saving...",
          saveConfig: "Save Configuration",
          status: "Configuration Status",
          printerEnabled: "Printer Enabled",
          enabled: "Enabled",
          disabled: "Disabled",
          printerTypeLabel: "Printer Type",
          printerIpLabel: "Printer IP",
          paperWidthLabel: "Paper Width",
          printReceipt: "Print Receipt",
          instructions: "Instructions:",
          printStep1: '1. Click "Print Receipt" button or press Ctrl+P',
          printStep2: "2. Select your USB printer",
          printStep3: '3. Choose "80mm" paper size if available',
          printStep4: "4. Print the receipt",
          pdfOpened: "PDF opened in new window - print from there",
          popupBlocked: "Popup blocker active - allow popups",
          testSent: "Test print sent successfully!",
          escpos: "ESC/POS",
        }

  const [config, setConfig] = useState<PrinterConfig>({
    enabled: false,
    printer_type: 'thermal',
    printer_ip: '',
    printer_port: 9100,
    printer_name: '',
    paper_width: 80,
    auto_cut: true,
    print_logo: true,
    header_text: '',
    footer_text: locale === "es-ES" ? "Gracias por tu pedido" : "Thank you for your order!"
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadPrinterConfig()
  }, [])

  const loadPrinterConfig = async () => {
    try {
      const { restaurantId } = await getCurrentUserRestaurant()
      if (!restaurantId) return

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('printer_config')
        .eq('id', restaurantId)
        .single()

      if (error) {
        console.error('Error loading printer config:', error)
        return
      }

      if (restaurant.printer_config) {
        setConfig(restaurant.printer_config)
      }
    } catch (error) {
      console.error('Error loading printer config:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePrinterConfig = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const { restaurantId } = await getCurrentUserRestaurant()
      if (!restaurantId) {
        setMessage({ type: 'error', text: tx.restaurantNotFound })
        return
      }

      const { error } = await supabase
        .from('restaurants')
        .update({ 
          printer_config: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId)

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: tx.saveSuccess })
    } catch (error: any) {
      console.error('Error saving printer config:', error)
      setMessage({ type: 'error', text: `${tx.saveError}: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  const testPrinter = async () => {
    try {
      setTesting(true)
      setMessage(null)

      const { restaurantId } = await getCurrentUserRestaurant()
      if (!restaurantId) {
        setMessage({ type: 'error', text: tx.restaurantNotFound })
        return
      }

      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'test',
          printerType: config.printer_type,
          printerConfig: {
            printerIP: config.printer_ip,
            printerPort: config.printer_port,
            printerType: config.printer_type,
            ...config
          },
          testMode: true
        })
      })

      const result = await response.json()
      
      if (result.success) {
        if (result.printerType === 'pdf' && result.pdfUrl) {
          // Abrir PDF en nueva ventana para impresión local
          const newWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes')
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>${tx.printReceipt} - Test</title>
                <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  .print-button {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                  }
                  .print-button:hover {
                    background: #1d4ed8;
                  }
                  .instructions {
                    background: #f3f4f6;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    border-left: 4px solid #2563eb;
                  }
                </style>
              </head>
              <body>
                <button class="print-button" onclick="window.print()">
                  🖨️ ${tx.printReceipt}
                </button>
                <div class="instructions">
                  <strong>${tx.instructions}</strong><br>
                  ${tx.printStep1}<br>
                  ${tx.printStep2}<br>
                  ${tx.printStep3}<br>
                  ${tx.printStep4}
                </div>
                ${result.pdfUrl}
              </body>
              </html>
            `)
            newWindow.document.close()
            setMessage({ type: 'success', text: tx.pdfOpened })
          } else {
            setMessage({ type: 'error', text: tx.popupBlocked })
          }
        } else {
          setMessage({ type: 'success', text: result.message || tx.testSent })
        }
      } else {
          setMessage({ type: 'error', text: `${tx.testError}: ${result.error}` })
      }
    } catch (error: any) {
      console.error('Error testing printer:', error)
      setMessage({ type: 'error', text: `${tx.testError}: ${error.message}` })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <Loading text={tx.loading} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg">
            <Printer className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {tx.title}
            </h1>
            <p className="text-gray-500 text-sm">
              {tx.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Printer Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>{tx.printerConfig}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Printer */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{tx.enableReceipt}</Label>
                <p className="text-sm text-gray-500">
                  {tx.enableReceiptDesc}
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
            </div>

            <Separator />

            {/* Printer Type */}
            <div className="space-y-2">
              <Label>{tx.printerType}</Label>
              <Select
                value={config.printer_type}
                onValueChange={(value: any) => setConfig({ ...config, printer_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">
                    <div className="flex items-center space-x-2">
                      <Printer className="h-4 w-4" />
                      <span>{tx.thermal}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="network">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4" />
                      <span>{tx.network}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{tx.pdf}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="escpos">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>{tx.escpos}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Network Configuration */}
            {(config.printer_type === 'network' || config.printer_type === 'thermal') && (
              <>
                <div className="space-y-2">
                  <Label>{tx.ip}</Label>
                  <Input
                    placeholder="192.168.1.100"
                    value={config.printer_ip || ''}
                    onChange={(e) => setConfig({ ...config, printer_ip: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{tx.port}</Label>
                  <Input
                    type="number"
                    placeholder="9100"
                    value={config.printer_port || ''}
                    onChange={(e) => setConfig({ ...config, printer_port: parseInt(e.target.value) || 9100 })}
                  />
                </div>
              </>
            )}

            {/* Paper Configuration */}
            <div className="space-y-2">
              <Label>{tx.paperWidth}</Label>
              <Input
                type="number"
                placeholder="80"
                value={config.paper_width || ''}
                onChange={(e) => setConfig({ ...config, paper_width: parseInt(e.target.value) || 80 })}
              />
            </div>

            {/* Auto Cut */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{tx.autoCut}</Label>
                <p className="text-sm text-gray-500">
                  {tx.autoCutDesc}
                </p>
              </div>
              <Switch
                checked={config.auto_cut || false}
                onCheckedChange={(checked) => setConfig({ ...config, auto_cut: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{tx.receiptCustomization}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Print Logo */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{tx.printLogo}</Label>
                <p className="text-sm text-gray-500">
                  {tx.printLogoDesc}
                </p>
              </div>
              <Switch
                checked={config.print_logo || false}
                onCheckedChange={(checked) => setConfig({ ...config, print_logo: checked })}
              />
            </div>

            <Separator />

            {/* Header Text */}
            <div className="space-y-2">
              <Label>{tx.headerText}</Label>
              <Input
                placeholder={tx.headerPh}
                value={config.header_text || ''}
                onChange={(e) => setConfig({ ...config, header_text: e.target.value })}
              />
              <p className="text-sm text-gray-500">
                {tx.headerDesc}
              </p>
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
              <Label>{tx.footerText}</Label>
              <Input
                placeholder={tx.footerPh}
                value={config.footer_text || ''}
                onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
              />
              <p className="text-sm text-gray-500">
                {tx.footerDesc}
              </p>
            </div>

            <Separator />

            {/* Test Print */}
            <div className="space-y-4">
              <div>
                <Label>{tx.testPrint}</Label>
                <p className="text-sm text-gray-500">
                  {tx.testPrintDesc}
                </p>
              </div>
              <Button
                onClick={testPrinter}
                disabled={testing || !config.enabled}
                variant="outline"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing ? tx.sendingTest : tx.sendTest}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={savePrinterConfig}
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? tx.saving : tx.saveConfig}
          </Button>
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>{tx.status}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tx.printerEnabled}</span>
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? tx.enabled : tx.disabled}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tx.printerTypeLabel}</span>
              <Badge variant="outline">{config.printer_type}</Badge>
            </div>
            {config.printer_ip && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{tx.printerIpLabel}</span>
                <span className="text-sm text-gray-600">{config.printer_ip}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tx.paperWidthLabel}</span>
              <span className="text-sm text-gray-600">{config.paper_width}mm</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 