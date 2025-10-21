import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return createCorsPreflightResponse(origin)
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')

  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 per page
    const sort = searchParams.get('sort') || '-publishedDate' // Default sort by newest first

    // Validate pagination parameters
    if (page < 1) {
      const response = NextResponse.json({ error: 'Page must be 1 or greater' }, { status: 400 })
      return addCorsHeaders(response, origin)
    }

    if (limit < 1) {
      const response = NextResponse.json({ error: 'Limit must be 1 or greater' }, { status: 400 })
      return addCorsHeaders(response, origin)
    }

    // Fetch articles with pagination
    const articles = await payload.find({
      collection: 'articles',
      page,
      limit,
      sort,
      depth: 1, // Include related data like coverImage
    })

    const response = NextResponse.json({
      success: true,
      data: articles.docs,
      pagination: {
        page: articles.page,
        limit: articles.limit,
        totalPages: articles.totalPages,
        totalDocs: articles.totalDocs,
        hasNextPage: articles.hasNextPage,
        hasPrevPage: articles.hasPrevPage,
        nextPage: articles.nextPage,
        prevPage: articles.prevPage,
      },
    })

    return addCorsHeaders(response, origin)
  } catch (error) {
    const response = NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    )
    return addCorsHeaders(response, origin)
  }
}
