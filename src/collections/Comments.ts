import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'article', 'status', 'createdAt'],
    group: 'Content Management',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor') {
        return true
      }
      
      // Only show approved comments to non-admin users
      return {
        status: { equals: 'approved' },
      }
    },
    create: () => true, // Allow anyone to create comments
    update: ({ req: { user } }) => {
      // Only admins and editors can update comments
      return user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'super-admin' || user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      maxLength: 100,
      validate: (val: string) => {
        if (!val || val.trim().length === 0) {
          return 'Author name is required'
        }
        return true
      },
    },
    {
      name: 'authorEmail',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'authorWebsite',
      type: 'text',
      validate: (val: string) => {
        if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
          return 'Website URL must start with http:// or https://'
        }
        return true
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      validate: (val: string) => {
        if (!val || val.trim().length === 0) {
          return 'Comment content is required'
        }
        if (val.length < 5) {
          return 'Comment must be at least 5 characters long'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Spam', value: 'spam' },
        { label: 'Deleted', value: 'deleted' },
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      admin: {
        position: 'sidebar',
        description: 'Reply to another comment (for threading)',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        hidden: true,
        description: 'IP address for moderation purposes',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        hidden: true,
        description: 'User agent string for moderation purposes',
      },
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for moderators',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Capture IP address and user agent for new comments
        if (operation === 'create') {
          if (req?.ip) {
            data.ipAddress = req.ip
          }
          if (req?.headers?.['user-agent']) {
            data.userAgent = req.headers['user-agent']
          }
        }
        
        return data
      },
    ],
  },
  timestamps: true,
}