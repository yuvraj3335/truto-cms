import type { Block } from 'payload'

export const AccordionBlock: Block = {
  slug: 'accordion',
  labels: {
    singular: 'Accordion',
    plural: 'Accordions',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional accordion group title',
        placeholder: 'Frequently Asked Questions',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Accordion items',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          admin: {
            description: 'Question or accordion header',
            placeholder: 'What is...?',
          },
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Answer or accordion content',
            rows: 4,
          },
        },
        {
          name: 'defaultOpen',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Start expanded',
          },
        },
      ],
    },
    {
      name: 'allowMultiple',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Allow multiple items to be open at once',
      },
    },
  ],
}
