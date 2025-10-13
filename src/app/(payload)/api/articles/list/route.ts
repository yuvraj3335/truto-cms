import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 per page
    const sort = searchParams.get('sort') || '-publishedDate' // Default sort by newest first

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json({ error: 'Page must be 1 or greater' }, { status: 400 })
    }

    if (limit < 1) {
      return NextResponse.json({ error: 'Limit must be 1 or greater' }, { status: 400 })
    }

    // Fetch articles with pagination
    const articles = await payload.find({
      collection: 'articles',
      page,
      limit,
      sort,
      depth: 1, // Include related data like coverImage
    })

    return NextResponse.json({
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
  } catch (error) {
    console.error('Error fetching articles list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
