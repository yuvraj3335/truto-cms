import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload or select an image',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Image alt text for accessibility',
        placeholder: 'Describe the image',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional image caption',
        placeholder: 'Image caption',
      },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      admin: {
        description: 'Image display size',
      },
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full Width', value: 'full' },
      ],
    },
    {
      name: 'position',
      type: 'select',
      defaultValue: 'center',
      admin: {
        description: 'Image alignment',
      },
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
