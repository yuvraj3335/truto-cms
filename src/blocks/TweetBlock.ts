import type { Block } from 'payload'

export const TweetBlock: Block = {
  slug: 'tweet',
  labels: {
    singular: 'Tweet Embed',
    plural: 'Tweet Embeds',
  },
  fields: [
    {
      name: 'tweetUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Twitter/X post URL',
        placeholder: 'https://twitter.com/username/status/...',
      },
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      admin: {
        description: 'Tweet display theme',
      },
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
    {
      name: 'hideConversation',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hide conversation thread',
      },
    },
    {
      name: 'hideMedia',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hide media attachments',
      },
    },
  ],
}
