"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Printer, 
  Smartphone,
  Monitor,
  Tablet,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import Link from "next/link"
import QRCode from "qrcode"
import { useI18n } from "@/components/i18n/i18n-provider"

export default function WebsitePreviewPage() {
  const { locale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          copied: "URL copiada",
          copiedDesc: "La URL se ha copiado al portapapeles",
          copyFailed: "No se pudo copiar",
          copyFailedDesc: "Copia la URL manualmente",
          noWebsite: "No hay web disponible",
          noWebsiteDesc: "Todavia no has configurado la web del restaurante.",
          configure: "Configurar restaurante",
          title: "Vista previa web",
          subtitle: "Previsualiza y comparte la web de tu restaurante",
          openWebsite: "Abrir web",
          preview: "Vista previa",
          websiteUrl: "URL del sitio web",
          websiteUrlDesc: "Comparte este enlace con tus clientes",
          visitWebsite: "Visitar web",
          qrTitle: "Codigo QR",
          qrDesc: "Escanea para visitar la web",
          download: "Descargar",
          generateQrHint: "Genera un codigo QR para compartir",
          generateQr: "Generar codigo QR",
          quickActions: "Acciones rapidas",
          socialCopied: "Mensaje copiado",
          socialCopiedDesc: "Listo para compartir en redes sociales",
          socialCopy: "Copiar mensaje social",
          printQr: "Imprimir codigo QR",
          scanQrHint: "Escanea este codigo QR para visitar la web",
        }
      : {
          copied: "URL copied",
          copiedDesc: "Website URL has been copied to clipboard",
          copyFailed: "Failed to copy",
          copyFailedDesc: "Please copy the URL manually",
          noWebsite: "No website available",
          noWebsiteDesc: "Your restaurant website is not yet configured.",
          configure: "Configure restaurant",
          title: "Website preview",
          subtitle: "Preview and share your restaurant website",
          openWebsite: "Open website",
          preview: "Preview",
          websiteUrl: "Website URL",
          websiteUrlDesc: "Share this link with your customers",
          visitWebsite: "Visit website",
          qrTitle: "QR code",
          qrDesc: "Scan to visit your website",
          download: "Download",
          generateQrHint: "Generate QR code to share",
          generateQr: "Generate QR code",
          quickActions: "Quick actions",
          socialCopied: "Message copied",
          socialCopiedDesc: "Ready to share on social media",
          socialCopy: "Copy social message",
          printQr: "Print QR Code",
          scanQrHint: "Scan this QR code to visit the website",
        }
  const [restaurant, setRestaurant] = useState<any>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const websiteUrl = restaurant?.restaurant?.slug ? `${window.location.origin}/r/${restaurant.restaurant.slug}` : ""

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const restaurantData = await getCurrentUserRestaurant()
        console.log("Restaurant data:", restaurantData)
        setRestaurant(restaurantData)
      } catch (error) {
        console.error("Error fetching restaurant:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [])

  const generateQRCode = async () => {
    if (!websiteUrl) return
    
    try {
      const qrDataUrl = await QRCode.toDataURL(websiteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const copyToClipboard = async () => {
    if (!websiteUrl) return
    
    try {
      await navigator.clipboard.writeText(websiteUrl)
      setCopied(true)
      toast({
        title: tx.copied,
        description: tx.copiedDesc,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: tx.copyFailed,
        description: tx.copyFailedDesc,
        variant: "destructive",
      })
    }
  }

  const openWebsite = () => {
    if (!websiteUrl) return
    window.open(websiteUrl, "_blank", "noopener,noreferrer")
  }

  const printQRCode = () => {
    if (!qrCodeUrl || !restaurant?.restaurant?.name) return
    
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
                     <title>QR Code - ${restaurant.restaurant.name}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              text-align: center;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .qr-code {
              margin: 20px 0;
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .website-url {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
              word-break: break-all;
            }
            @media print {
              body { margin: 0; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()" style="position: fixed; top: 20px; right: 20px; background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            🖨️ ${tx.printQr}
          </button>
          <div class="qr-container">
                         <div class="restaurant-name">${restaurant.restaurant.name}</div>
            <div class="website-url">${websiteUrl}</div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 300px; height: auto;" />
            </div>
            <p style="color: #666; font-size: 12px;">${tx.scanQrHint}</p>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case "mobile":
        return { width: "320px", height: "568px" }
      case "tablet":
        return { width: "768px", height: "1024px" }
      default:
        return { width: "100%", height: "600px" }
    }
  }

  const dimensions = getPreviewDimensions()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant?.restaurant?.slug) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tx.noWebsite}</h3>
            <p className="text-gray-500 mb-4">{tx.noWebsiteDesc}</p>
            <Link href="/dashboard/settings">
              <Button>
                {tx.configure}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Globe className="h-6 w-6 mr-2 text-blue-600" />
            {tx.title}
          </h1>
          <p className="text-gray-500 text-sm">
            {tx.subtitle}
          </p>
        </div>
        <Button onClick={openWebsite}>
          <ExternalLink className="h-4 w-4 mr-2" />
          {tx.openWebsite}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    <Monitor className="h-3 w-3 mr-1" />
                    {tx.preview}
                  </Badge>
                  <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={previewMode === "desktop" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("desktop")}
                      className="h-7 px-2 text-xs"
                    >
                      <Monitor className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={previewMode === "tablet" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("tablet")}
                      className="h-7 px-2 text-xs"
                    >
                      <Tablet className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={previewMode === "mobile" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("mobile")}
                      className="h-7 px-2 text-xs"
                    >
                      <Smartphone className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                <div 
                  className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
                  style={{ 
                    width: dimensions.width, 
                    height: dimensions.height,
                    maxWidth: "100%"
                  }}
                >
                                     <iframe
                     src={websiteUrl}
                     title={`${restaurant.restaurant.name} Website Preview`}
                     className="w-full h-full border-0"
                     sandbox="allow-scripts allow-same-origin allow-forms"
                   />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - URL & QR Code */}
        <div className="space-y-6">
          {/* URL Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tx.websiteUrl}</CardTitle>
              <CardDescription>{tx.websiteUrlDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={websiteUrl}
                  readOnly
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={openWebsite}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {tx.visitWebsite}
              </Button>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tx.qrTitle}</CardTitle>
              <CardDescription>{tx.qrDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeUrl ? (
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 border border-gray-200 rounded-lg"
                  />
                  <div className="flex space-x-2">
                    {/* Print button temporarily disabled
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={printQRCode}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                                                 link.download = `${restaurant.restaurant.name}-qr-code.png`
                        link.href = qrCodeUrl
                        link.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {tx.download}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-4">{tx.generateQrHint}</p>
                  <Button
                    onClick={generateQRCode}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {tx.generateQr}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tx.quickActions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Copy URL & Print QR button temporarily disabled
              <Button
                variant="outline"
                onClick={() => {
                  copyToClipboard()
                  if (qrCodeUrl) {
                    printQRCode()
                  }
                }}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL & Print QR
              </Button>
              */}
              <Button
                variant="outline"
                onClick={() => {
                                     const text = `Check out ${restaurant.restaurant.name}'s website: ${websiteUrl}`
                  navigator.clipboard.writeText(text)
                  toast({
                    title: tx.socialCopied,
                    description: tx.socialCopiedDesc,
                  })
                }}
                className="w-full"
              >
                <Globe className="h-4 w-4 mr-2" />
                {tx.socialCopy}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
