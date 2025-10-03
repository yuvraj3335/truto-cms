import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectUrl = searchParams.get('redirect') || '/'

  // Clear the preview cookie
  const response = new Response()
  response.headers.set('Set-Cookie', 'payloadToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0')
  
  return redirect(redirectUrl)
}