import type { Block } from 'payload'

export const TableBlock: Block = {
  slug: 'table',
  labels: {
    singular: 'Table',
    plural: 'Tables',
  },
  fields: [
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional table caption',
        placeholder: 'Table 1: Performance Metrics',
      },
    },
    {
      name: 'headers',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Table column headers',
      },
      fields: [
        {
          name: 'header',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'Column name',
          },
        },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Table rows',
      },
      fields: [
        {
          name: 'cells',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'content',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'Cell content',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'striped',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Alternate row colors',
      },
    },
    {
      name: 'bordered',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show table borders',
      },
    },
  ],
}
