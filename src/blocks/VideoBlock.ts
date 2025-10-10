import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: {
    singular: 'Video Embed',
    plural: 'Video Embeds',
  },
  fields: [
    {
      name: 'platform',
      type: 'select',
      required: true,
      defaultValue: 'youtube',
      admin: {
        description: 'Select video platform',
      },
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Other (Direct URL)', value: 'other' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'Video URL or embed code',
        placeholder: 'https://www.youtube.com/watch?v=...',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional video caption',
        placeholder: 'Video description',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '16:9',
      admin: {
        description: 'Video aspect ratio',
      },
      options: [
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '4:3 (Standard)', value: '4:3' },
        { label: '1:1 (Square)', value: '1:1' },
        { label: '21:9 (Ultrawide)', value: '21:9' },
      ],
    },
  ],
}
