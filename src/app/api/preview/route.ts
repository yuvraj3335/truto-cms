import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  const secret = searchParams.get('secret')

  // Check if the secret is valid
  if (!secret || secret !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check if url is provided
  if (!url) {
    return new Response('URL is required', { status: 400 })
  }

  // Create redirect response with preview cookie
  const response = Response.redirect(new URL(url, request.url))
  response.headers.set('Set-Cookie', 'payloadToken=preview; Path=/; HttpOnly; SameSite=Strict')
  
  return response
}