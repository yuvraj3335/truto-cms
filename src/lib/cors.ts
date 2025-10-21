import { NextResponse } from 'next/server'

/**
 * Centralized list of allowed origins for CORS
 */
export const allowedOrigins = [
  'https://truto-cms-render.pages.dev',
  'https://truto-guides.pages.dev',
  'https://truto-cms.yuvraj-432.workers.dev',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
]

/**
 * Add CORS headers to a NextResponse
 */
export function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

/**
 * Create a CORS preflight response
 */
export function createCorsPreflightResponse(origin: string | null): NextResponse {
  const response = NextResponse.json({}, { status: 200 })
  return addCorsHeaders(response, origin)
}
