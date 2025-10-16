import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for Payload's default API routes
  // Only apply CORS to custom API routes (articles/[id], articles/list, etc.)
  if (
    pathname.startsWith('/api/graphql') ||
    pathname === '/api/articles' ||
    pathname === '/api/categories' ||
    pathname === '/api/media' ||
    pathname === '/api/users'
  ) {
    // Let Payload handle these routes without interference
    return NextResponse.next()
  }

  // Get the origin from the request
  const origin = request.headers.get('origin')

  const allowedOrigins = [
    'https://truto-cms-render.pages.dev',
    'https://truto-cms.yuvraj-432.workers.dev',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ]

  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  if (request.method === 'OPTIONS') {
    const response = NextResponse.json({}, { status: 200 })

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')

    return response
  }

  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

// Only apply middleware to custom API routes
export const config = {
  matcher: ['/api/articles/:path*', '/api/categories/:path*'],
}
