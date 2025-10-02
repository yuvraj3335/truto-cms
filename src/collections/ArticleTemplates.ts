import type { CollectionConfig } from 'payload'

export const ArticleTemplates: CollectionConfig = {
  slug: 'article-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'label', 'description'],
    group: 'Configuration',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => {
      return user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor'
    },
    update: ({ req: { user } }) => {
      return user?.role === 'super-admin' || user?.role === 'admin' || user?.role === 'editor'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'super-admin' || user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the template',
      },
      validate: (val: string) => {
        if (!val || !/^[a-z0-9-_]+$/.test(val)) {
          return 'Name must contain only lowercase letters, numbers, hyphens, and underscores'
        }
        return true
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for the template',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this template is for',
      },
    },
    {
      name: 'schema',
      type: 'json',
      required: true,
      admin: {
        description: 'JSON schema defining the template structure and default values',
      },
      validate: (val: any) => {
        if (!val) {
          return 'Schema is required'
        }
        
        try {
          if (typeof val === 'string') {
            JSON.parse(val)
          } else if (typeof val !== 'object') {
            return 'Schema must be valid JSON'
          }
        } catch (_error) {
          return 'Schema must be valid JSON'
        }
        
        return true
      },
    },
    {
      name: 'previewComponent',
      type: 'text',
      admin: {
        description: 'Optional React component name/path for template preview',
        placeholder: 'components/templates/BlogPostPreview',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Blog Post', value: 'blog-post' },
        { label: 'News Article', value: 'news-article' },
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'Review', value: 'review' },
        { label: 'Interview', value: 'interview' },
        { label: 'Case Study', value: 'case-study' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'blog-post',
      admin: {
        description: 'Category of content this template is designed for',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this template is available for use',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order for displaying templates in selection lists',
      },
    },
    {
      name: 'requiredFields',
      type: 'array',
      fields: [
        {
          name: 'fieldName',
          type: 'text',
          required: true,
        },
        {
          name: 'fieldType',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Rich Text', value: 'richText' },
            { label: 'Number', value: 'number' },
            { label: 'Date', value: 'date' },
            { label: 'Select', value: 'select' },
            { label: 'Upload', value: 'upload' },
            { label: 'Relationship', value: 'relationship' },
          ],
          required: true,
        },
        {
          name: 'isRequired',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        description: 'Define which fields are required when using this template',
      },
    },
    {
      name: 'defaultValues',
      type: 'json',
      admin: {
        description: 'Default values to populate when creating an article with this template',
      },
    },
  ],
  timestamps: true,
}