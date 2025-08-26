import { Skeleton } from "@/components/ui/skeleton"

export default function PromoLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-indigo-200/20 to-purple-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation skeleton */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </nav>

      {/* Hero section skeleton */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <Skeleton className="h-6 w-48 mx-auto mb-6" />
          <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-8 w-2/3 mx-auto mb-8" />
          
          {/* Video container skeleton */}
          <div className="relative w-full max-w-4xl mx-auto mb-12">
            <Skeleton className="aspect-video rounded-2xl" />
          </div>

          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </section>

      {/* Benefits grid skeleton */}
      <section className="relative z-10 px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-2/3 mx-auto mb-6" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section skeleton */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-6 bg-white/20" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-12 bg-white/20" />
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Skeleton className="h-12 w-48 bg-white/20" />
            <Skeleton className="h-12 w-56 bg-white/20" />
          </div>
        </div>
      </section>
    </div>
  )
}
