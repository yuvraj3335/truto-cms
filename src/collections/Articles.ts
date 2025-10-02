import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { updateArticleCountAfterChange, updateArticleCountAfterDelete } from '../hooks/updateArticleCount'

const calculateReadingTime = (content: any): number => {
  if (!content) return 0
  
  // Extract text from Lexical editor content
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node
    if (!node || !node.children) return ''
    
    return node.children
      .map((child: any) => {
        if (child.text) return child.text
        if (child.children) return extractText(child)
        return ''
      })
      .join(' ')
  }
  
  const text = extractText(content)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  const averageWordsPerMinute = 200
  
  return Math.ceil(wordCount / averageWordsPerMinute)
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate', 'categories'],
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/articles/${doc.slug}`
      }
      return null
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'super-admin' || user?.role === 'admin') {
        return true
      }
      
      return {
        or: [
          { status: { equals: 'published' } },
          { author: { equals: user?.id } },
        ],
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor') {
        return true
      }
      
      return {
        author: { equals: user?.id },
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'super-admin' || user?.role === 'admin') {
        return true
      }
      
      return {
        author: { equals: user?.id },
      }
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      localized: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
        ],
      }),
      admin: {
        description: 'Write your article content here',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Brief summary of the article (optional, will be auto-generated if empty)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image displayed with the article',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        description: 'When the article should be/was published',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      minRows: 1,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Article tags for categorization and SEO',
      },
    },
    {
      name: 'seoMetaTitle',
      type: 'text',
      admin: {
        description: 'SEO meta title (defaults to article title if empty)',
      },
      maxLength: 60,
    },
    {
      name: 'seoMetaDescription',
      type: 'textarea',
      admin: {
        description: 'SEO meta description (defaults to excerpt if empty)',
      },
      maxLength: 160,
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Estimated reading time in minutes',
      },
      defaultValue: 0,
    },
    {
      name: 'viewsCount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Number of views',
      },
      defaultValue: 0,
    },
    {
      name: 'featuredArticle',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description: 'Mark as featured article',
      },
      defaultValue: false,
    },
    {
      name: 'allowComments',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description: 'Allow comments on this article',
      },
      defaultValue: true,
    },
    {
      name: 'customFields',
      type: 'json',
      admin: {
        description: 'Additional custom data for this article',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Generate slug from title if not provided
        if (operation === 'create' || operation === 'update') {
          if (data.title && !data.slug) {
            data.slug = data.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
          }
          
          // Calculate reading time
          if (data.content) {
            data.readingTime = calculateReadingTime(data.content)
          }
          
          // Auto-set publishedDate when status changes to published
          if (data.status === 'published' && !data.publishedDate) {
            data.publishedDate = new Date().toISOString()
          }
          
          // Auto-generate excerpt if empty
          if (data.content && !data.excerpt) {
            const text = typeof data.content === 'string' ? data.content : JSON.stringify(data.content)
            data.excerpt = text.substring(0, 160).replace(/\s+/g, ' ').trim()
          }
        }
        
        return data
      },
    ],
    afterChange: [updateArticleCountAfterChange],
    afterDelete: [updateArticleCountAfterDelete],
  },
}