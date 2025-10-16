import type { CollectionConfig } from 'payload'
import { customLexicalEditor } from '../editor/lexical-config'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'author', 'publishedDate', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate/update JSON-LD schema on save
        if (data) {
          const jsonLd: Record<string, any> = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: data.title || '',
            description: data.excerpt || '',
            author: {
              '@type': 'Person',
              name: data.author || '',
            },
            datePublished: data.publishedDate || new Date().toISOString(),
            dateModified: new Date().toISOString(),
          }

          // Add image if available
          if (data.coverImage) {
            // Handle both object references and string IDs
            if (typeof data.coverImage === 'object' && data.coverImage.url) {
              jsonLd.image = data.coverImage.url
            } else if (typeof data.coverImage === 'string') {
              // Store the media ID reference, will need to be resolved on frontend
              jsonLd.image = `[MEDIA:${data.coverImage}]`
            }
          }

          data.jsonLd = JSON.stringify(jsonLd, null, 2)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (data?.title && !value) {
              return data.title
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief description of the article for previews and SEO',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Cover image for article previews and thumbnails',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: customLexicalEditor,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: false,
      admin: {
        description: 'Alternative publish timestamp (auto-synced with publishedDate)',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ value, data, siblingData }) => {
            // Auto-sync with publishedDate if not explicitly set
            if (!value && siblingData?.publishedDate) {
              return siblingData.publishedDate
            }
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      required: false,
      admin: {
        description: 'Tags for categorizing and filtering articles',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: false,
          admin: {
            description: 'SEO title (falls back to article title)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: false,
          admin: {
            description: 'SEO description (falls back to excerpt)',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'SEO image (falls back to coverImage)',
          },
        },
      ],
    },
    {
      name: 'jsonLd',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Auto-generated JSON-LD structured data for SEO (updates on save)',
        position: 'sidebar',
        rows: 15,
      },
    },
  ],
}
