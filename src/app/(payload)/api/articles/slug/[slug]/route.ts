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

    // Validate slug format
    if (!slug || typeof slug !== 'string') {
      const response = NextResponse.json({ error: 'Invalid article slug' }, { status: 400 })
      return addCorsHeaders(response, origin)
    }

    const articles = await payload.find({
      collection: 'articles',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 2, // Include related data like coverImage, categories
    })

    if (!articles.docs.length) {
      const response = NextResponse.json({ error: 'Article not found' }, { status: 404 })
      return addCorsHeaders(response, origin)
    }

    const response = NextResponse.json({
      success: true,
      data: articles.docs[0],
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const payload = await getPayload({ config })
    const { slug } = await params

    // Validate slug format
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Invalid article slug' }, { status: 400 })
    }

    // Parse request body
    let updateData: Record<string, unknown>
    try {
      updateData = await request.json()
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Validate that update data is not empty
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Update data cannot be empty' }, { status: 400 })
    }

    // Find the article by slug
    const articles = await payload.find({
      collection: 'articles',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    if (!articles.docs.length) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const existingArticle = articles.docs[0]

    // If slug is being updated, check for uniqueness
    if (updateData.slug && updateData.slug !== existingArticle.slug) {
      const duplicateSlug = await payload.find({
        collection: 'articles',
        where: {
          slug: {
            equals: updateData.slug as string,
          },
          id: {
            not_equals: existingArticle.id,
          },
        },
        limit: 1,
      })

      if (duplicateSlug.docs.length > 0) {
        return NextResponse.json(
          { error: 'An article with this slug already exists' },
          { status: 409 },
        )
      }
    }

    // Update the article
    const updatedArticle = await payload.update({
      collection: 'articles',
      id: existingArticle.id,
      data: updateData,
      depth: 1, // Include related data like coverImage
    })

    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully',
    })
  } catch (error) {
    // Handle validation errors from Payload
    if (error && typeof error === 'object' && 'name' in error) {
      const err = error as { name?: string; data?: unknown; message?: string }

      if (err.name === 'ValidationError') {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: err.data || err.message,
          },
          { status: 422 },
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
