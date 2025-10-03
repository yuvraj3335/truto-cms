import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectUrl = searchParams.get('redirect') || '/'

  // Create redirect response and clear the preview cookie
  const response = Response.redirect(new URL(redirectUrl, request.url))
  response.headers.set('Set-Cookie', 'payloadToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0')
  
  return response
}