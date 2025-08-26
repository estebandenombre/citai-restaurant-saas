import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          Página no encontrada
        </h2>
        <p className="text-slate-600 mb-8 max-w-md">
          La página que buscas no existe. Regresa a la página principal de Tably.
        </p>
        <Link href="/promo">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Tably
          </Button>
        </Link>
      </div>
    </div>
  )
}
