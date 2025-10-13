import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional caption for the media',
      },
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        try {
          // Ensure full URL is available for frontend consumption
          if (doc?.url) {
            // If URL is already absolute, use it as-is
            if (doc.url.startsWith('http://') || doc.url.startsWith('https://')) {
              doc.fullURL = doc.url
            } else if (doc.url.startsWith('/')) {
              // For relative URLs, R2 storage should have already provided the full URL
              // If not, we'll just keep the relative URL as fallback
              doc.fullURL = doc.url
            } else {
              doc.fullURL = doc.url
            }
          }
        } catch (error) {
          console.error('Error in Media afterRead hook:', error)
          // Don't fail the request, just skip fullURL generation
        }
        return doc
      },
    ],
  },
}
