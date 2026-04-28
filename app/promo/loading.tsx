import { Skeleton } from "@/components/ui/skeleton"

export default function PromoLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute left-10 top-20 h-96 w-96 rounded-full bg-muted/40 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-muted/30 blur-3xl" />
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
      <section className="relative z-10 border-y border-border bg-card/50 px-6 py-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-2/3 mx-auto mb-6" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-8 shadow-sm">
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
      <section className="relative z-10 border-t border-border bg-foreground px-6 py-20 text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <Skeleton className="mx-auto mb-6 h-12 w-3/4 bg-primary-foreground/20" />
          <Skeleton className="mx-auto mb-12 h-8 w-1/2 bg-primary-foreground/20" />

          <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <Skeleton className="h-12 w-48 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-56 bg-primary-foreground/20" />
          </div>
        </div>
      </section>
    </div>
  )
}
