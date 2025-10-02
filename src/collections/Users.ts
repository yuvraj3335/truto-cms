import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'displayName',
  },
  auth: true,
  access: {
    read: () => true,
    update: ({ req: { user } }) => {
      if (user?.role === 'super-admin' || user?.role === 'admin') {
        return true
      }
      return {
        id: {
          equals: user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Contributor', value: 'contributor' },
      ],
      defaultValue: 'contributor',
      required: true,
      access: {
        read: () => true,
        update: ({ req: { user } }) => user?.role === 'super-admin' || user?.role === 'admin',
      },
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'bio',
      type: 'richText',
      admin: {
        description: 'Author biography displayed on articles',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile picture for author byline',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Twitter', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'GitHub', value: 'github' },
            { label: 'Website', value: 'website' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (val: string) => {
            if (!val || (!val.startsWith('http://') && !val.startsWith('https://'))) {
              return 'URL must start with http:// or https://'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'website',
      type: 'text',
      validate: (val: string) => {
        if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
          return 'Website URL must start with http:// or https://'
        }
        return true
      },
    },
    {
      name: 'articleCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
