import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // MIDDLEWARE DISABLED - Using AuthGuard component instead
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match only the routes we want to protect:
     * - /dashboard
     * - /admin
     */
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
