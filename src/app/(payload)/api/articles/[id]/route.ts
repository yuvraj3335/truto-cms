import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return createCorsPreflightResponse(origin)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get('origin')

  try {
    const payload = await getPayload({ config })
    const { id } = await params

    // Validate ID format
    if (!id || !/^\d+$/.test(id)) {
      const response = NextResponse.json({ error: 'Invalid article ID format' }, { status: 400 })
      return addCorsHeaders(response, origin)
    }

    const article = await payload.findByID({
      collection: 'articles',
      id: parseInt(id),
      depth: 2, // Include related data like coverImage, categories
    })

    if (!article) {
      const response = NextResponse.json({ error: 'Article not found' }, { status: 404 })
      return addCorsHeaders(response, origin)
    }

    const response = NextResponse.json({
      success: true,
      data: article,
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    // Validate ID format
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid article ID format' }, { status: 400 })
    }

    const articleId = parseInt(id)

    // Read and parse the request body
    let updateData: Record<string, unknown>
    try {
      const contentType = request.headers.get('content-type') || ''

      // Handle multipart/form-data (from Payload admin UI)
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const payloadField = formData.get('_payload')

        if (!payloadField || typeof payloadField !== 'string') {
          return NextResponse.json(
            { error: 'Missing _payload field in form data' },
            { status: 400 },
          )
        }

        updateData = JSON.parse(payloadField)
      }
      // Handle application/json
      else if (contentType.includes('application/json')) {
        const body = await request.text()

        if (!body || body.trim() === '') {
          return NextResponse.json({ error: 'Request body cannot be empty' }, { status: 400 })
        }

        updateData = JSON.parse(body)
      }
      // Unsupported content type
      else {
        return NextResponse.json(
          {
            error: 'Unsupported content type',
            details: `Expected multipart/form-data or application/json, got: ${contentType}`,
          },
          { status: 415 },
        )
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        },
        { status: 400 },
      )
    }

    // Validate that update data is an object and not empty
    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Update data cannot be empty' }, { status: 400 })
    }

    // Check if article exists before updating
    try {
      await payload.findByID({
        collection: 'articles',
        id: articleId,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Update the article using Payload's update method
    const updatedArticle = await payload.update({
      collection: 'articles',
      id: articleId,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully',
    })
  } catch (error) {
    // Handle validation errors from Payload
    if (error && typeof error === 'object' && ('name' in error || 'status' in error)) {
      const err = error as { name?: string; status?: number; data?: unknown; message?: string }

      if (err.name === 'ValidationError' || err.status === 400) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: err.data || err.message,
          },
          { status: 400 },
        )
      }

      // Handle not found errors
      if (err.status === 404) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
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
