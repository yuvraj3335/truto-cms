import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return createCorsPreflightResponse(origin)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const origin = request.headers.get('origin')

  try {
    const payload = await getPayload({ config })
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    // Validate slug format
    if (!slug || typeof slug !== 'string') {
      const response = NextResponse.json({ error: 'Invalid category slug' }, { status: 400 })
      return addCorsHeaders(response, origin)
    }

    // Parse pagination parameters for articles
    const articlesPage = parseInt(searchParams.get('articlesPage') || '1')
    const articlesLimit = Math.min(parseInt(searchParams.get('articlesLimit') || '10'), 50) // Max 50 per page

    // Validate pagination parameters
    if (articlesPage < 1) {
      const response = NextResponse.json(
        { error: 'articlesPage must be 1 or greater' },
        { status: 400 },
      )
      return addCorsHeaders(response, origin)
    }

    if (articlesLimit < 1) {
      const response = NextResponse.json(
        { error: 'articlesLimit must be 1 or greater' },
        { status: 400 },
      )
      return addCorsHeaders(response, origin)
    }

    // Find category by slug
    const categories = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 1, // Include coverImage
    })

    if (!categories.docs.length) {
      const response = NextResponse.json({ error: 'Category not found' }, { status: 404 })
      return addCorsHeaders(response, origin)
    }

    const category = categories.docs[0]

    // Get total article count for this category
    const totalArticlesCount = await payload.find({
      collection: 'articles',
      where: {
        categories: {
          contains: category.id,
        },
        status: {
          equals: 'published',
        },
      },
      limit: 0, // We only want the count
    })

    // Fetch paginated articles for this category
    const articles = await payload.find({
      collection: 'articles',
      where: {
        categories: {
          contains: category.id,
        },
        status: {
          equals: 'published',
        },
      },
      page: articlesPage,
      limit: articlesLimit,
      depth: 2, // Include coverImage, author, and nested relations
      sort: '-publishedDate', // Most recent first
    })

    const response = NextResponse.json({
      success: true,
      category: {
        ...category,
        articleCount: totalArticlesCount.totalDocs,
      },
      articles: articles.docs,
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
