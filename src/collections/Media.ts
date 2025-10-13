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
      ({ doc, req }) => {
        // Ensure full URL is available for frontend consumption
        if (doc?.url) {
          // If URL is relative, make it absolute
          if (doc.url.startsWith('/')) {
            const protocol = 'https'
            const host =
              req?.headers?.get?.('host') ||
              process.env.PAYLOAD_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, '') ||
              'localhost:3000'
            doc.fullURL = `${protocol}://${host}${doc.url}`
          } else {
            doc.fullURL = doc.url
          }
        }
        return doc
      },
    ],
  },
}
