import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const updateUserArticleCount = async (userId: string | number, payload: any) => {
  if (!userId) return

  try {
    // Count published articles for this user
    const { totalDocs } = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { author: { equals: userId } },
          { status: { equals: 'published' } },
        ],
      },
      limit: 0, // Only get count
    })

    // Update user's article count
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        articleCount: totalDocs,
      },
    })
  } catch (error) {
    payload.logger.error('Error updating user article count:', error)
  }
}

export const updateArticleCountAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req

  // Only process if the author changed or status changed
  const authorChanged = doc?.author !== previousDoc?.author
  const statusChanged = doc?.status !== previousDoc?.status

  if (operation === 'create' || statusChanged || authorChanged) {
    // Update count for current author
    if (doc?.author) {
      await updateUserArticleCount(doc.author, payload)
    }

    // If author changed, also update count for previous author
    if (authorChanged && previousDoc?.author) {
      await updateUserArticleCount(previousDoc.author, payload)
    }
  }

  return doc
}

export const updateArticleCountAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  const { payload } = req

  // Update count for the author of the deleted article
  if (doc?.author) {
    await updateUserArticleCount(doc.author, payload)
  }

  return doc
}