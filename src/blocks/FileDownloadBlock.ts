import type { Block } from 'payload'

export const FileDownloadBlock: Block = {
  slug: 'fileDownload',
  labels: {
    singular: 'File Download',
    plural: 'File Downloads',
  },
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload or select a file',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Download link text',
        placeholder: 'Download PDF',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'File description',
        placeholder: 'Detailed guide about...',
        rows: 3,
      },
    },
    {
      name: 'showFileSize',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Display file size',
      },
    },
    {
      name: 'showFileType',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Display file type',
      },
    },
  ],
}
