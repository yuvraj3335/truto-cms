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
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // Max 100 per page
    const includeArticles = searchParams.get('includeArticles') === 'true'

    // Validate pagination parameters
    if (page < 1) {
      const response = NextResponse.json({ error: 'Page must be 1 or greater' }, { status: 400 })
      return addCorsHeaders(response, origin)
    }

    if (limit < 1) {
      const response = NextResponse.json({ error: 'Limit must be 1 or greater' }, { status: 400 })
      return addCorsHeaders(response, origin)
    }

    // Fetch categories with pagination
    const categories = await payload.find({
      collection: 'categories',
      page,
      limit,
      depth: 1, // Include coverImage
    })

    // Transform categories to include article count and optionally articles
    const transformedCategories = await Promise.all(
      categories.docs.map(async (category) => {
        // Get article count for this category
        const articlesInCategory = await payload.find({
          collection: 'articles',
          where: {
            categories: {
              contains: category.id,
            },
            status: {
              equals: 'published', // Only count published articles
            },
          },
          limit: 0, // We only want the count
        })

        const categoryData: any = {
          ...category,
          articleCount: articlesInCategory.totalDocs,
        }

        // Include articles if requested
        if (includeArticles) {
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
            limit: 10, // Limit articles per category in list view
            depth: 1, // Include coverImage and author
            sort: '-publishedDate', // Most recent first
          })

          categoryData.articles = articles.docs
        } else {
          categoryData.articles = []
        }

        return categoryData
      }),
    )

    const response = NextResponse.json({
      success: true,
      data: transformedCategories,
      pagination: {
        page: categories.page,
        limit: categories.limit,
        totalPages: categories.totalPages,
        totalDocs: categories.totalDocs,
        hasNextPage: categories.hasNextPage,
        hasPrevPage: categories.hasPrevPage,
        nextPage: categories.nextPage,
        prevPage: categories.prevPage,
      },
    })

    return addCorsHeaders(response, origin)
  } catch (error) {
    console.error('Error fetching categories list:', error)
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return addCorsHeaders(response, origin)
  }
}
