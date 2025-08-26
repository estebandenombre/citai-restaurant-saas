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
    footer_text: 'Thank you for your order!'
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
        setMessage({ type: 'error', text: 'Restaurant not found' })
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

      setMessage({ type: 'success', text: 'Printer configuration saved successfully!' })
    } catch (error: any) {
      console.error('Error saving printer config:', error)
      setMessage({ type: 'error', text: `Error saving configuration: ${error.message}` })
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
        setMessage({ type: 'error', text: 'Restaurant not found' })
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
                <title>Receipt - Test</title>
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
                  🖨️ Print Receipt
                </button>
                <div class="instructions">
                  <strong>Instructions:</strong><br>
                  1. Click "Print Receipt" button or press Ctrl+P<br>
                  2. Select your USB printer<br>
                  3. Choose "80mm" paper size if available<br>
                  4. Print the receipt
                </div>
                ${result.pdfUrl}
              </body>
              </html>
            `)
            newWindow.document.close()
            setMessage({ type: 'success', text: 'PDF abierto en nueva ventana - imprimir desde ahí' })
          } else {
            setMessage({ type: 'error', text: 'Bloqueador de ventanas activado - permitir ventanas emergentes' })
          }
        } else {
          setMessage({ type: 'success', text: result.message || 'Test print sent successfully!' })
        }
      } else {
        setMessage({ type: 'error', text: `Test print failed: ${result.error}` })
      }
    } catch (error: any) {
      console.error('Error testing printer:', error)
      setMessage({ type: 'error', text: `Test print failed: ${error.message}` })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <Loading text="Loading printer configuration..." />
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
              Printer Settings
            </h1>
            <p className="text-gray-500 text-sm">
              Configure receipt printing for your restaurant
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
              <span>Printer Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Printer */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Receipt Printing</Label>
                <p className="text-sm text-gray-500">
                  Enable automatic receipt printing for orders
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
              <Label>Printer Type</Label>
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
                      <span>Thermal Printer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="network">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4" />
                      <span>Network Printer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>PDF (Local Print)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="escpos">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>ESC/POS</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Network Configuration */}
            {(config.printer_type === 'network' || config.printer_type === 'thermal') && (
              <>
                <div className="space-y-2">
                  <Label>Printer IP Address</Label>
                  <Input
                    placeholder="192.168.1.100"
                    value={config.printer_ip || ''}
                    onChange={(e) => setConfig({ ...config, printer_ip: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Printer Port</Label>
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
              <Label>Paper Width (mm)</Label>
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
                <Label>Auto Cut Paper</Label>
                <p className="text-sm text-gray-500">
                  Automatically cut paper after printing
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
              <span>Receipt Customization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Print Logo */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Print Restaurant Logo</Label>
                <p className="text-sm text-gray-500">
                  Include logo on receipts
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
              <Label>Header Text</Label>
              <Input
                placeholder="Welcome to our restaurant!"
                value={config.header_text || ''}
                onChange={(e) => setConfig({ ...config, header_text: e.target.value })}
              />
              <p className="text-sm text-gray-500">
                Custom text to appear at the top of receipts
              </p>
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
              <Label>Footer Text</Label>
              <Input
                placeholder="Thank you for your order!"
                value={config.footer_text || ''}
                onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
              />
              <p className="text-sm text-gray-500">
                Custom text to appear at the bottom of receipts
              </p>
            </div>

            <Separator />

            {/* Test Print */}
            <div className="space-y-4">
              <div>
                <Label>Test Print</Label>
                <p className="text-sm text-gray-500">
                  Send a test receipt to verify configuration
                </p>
              </div>
              <Button
                onClick={testPrinter}
                disabled={testing || !config.enabled}
                variant="outline"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing ? 'Sending Test...' : 'Send Test Receipt'}
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
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Printer Enabled</span>
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Printer Type</span>
              <Badge variant="outline">{config.printer_type}</Badge>
            </div>
            {config.printer_ip && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Printer IP</span>
                <span className="text-sm text-gray-600">{config.printer_ip}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Paper Width</span>
              <span className="text-sm text-gray-600">{config.paper_width}mm</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 