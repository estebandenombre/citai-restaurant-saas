import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          La página que buscas no existe. Regresa a la página principal de Tably.
        </p>
        <Link href="/promo">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Tably
          </Button>
        </Link>
      </div>
    </div>
  )
}
