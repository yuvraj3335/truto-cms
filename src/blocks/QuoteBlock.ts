import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: {
    singular: 'Quote',
    plural: 'Quotes',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The quote text',
        rows: 4,
        placeholder: 'Enter the quote here...',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        description: 'Quote author',
        placeholder: 'Author name',
      },
    },
    {
      name: 'authorTitle',
      type: 'text',
      admin: {
        description: 'Author title or role',
        placeholder: 'CEO, Company Name',
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Source or citation',
        placeholder: 'Book title, Article name, etc.',
      },
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'default',
      admin: {
        description: 'Quote style',
      },
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Highlighted', value: 'highlighted' },
        { label: 'Bordered', value: 'bordered' },
      ],
    },
  ],
}
