import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { BlocksFeature } from '@payloadcms/richtext-lexical'
import {
  CodeBlock,
  CalloutBlock,
  VideoBlock,
  QuoteBlock,
  ImageBlock,
  TableBlock,
  FileDownloadBlock,
  AccordionBlock,
  TweetBlock,
} from '../blocks'

/**
 * Custom Lexical Editor Configuration with Block-Based Content Components
 *
 * This configuration extends Payload's Lexical editor with custom block types:
 * - /code - Code snippets with syntax highlighting
 * - /callout - Alert/info boxes
 * - /video - Video embeds (YouTube/Vimeo)
 * - /quote - Styled quotes with author
 * - /image - Enhanced images with captions
 * - /table - Data tables
 * - /file - File downloads
 * - /accordion - Accordion/FAQ sections
 * - /tweet - Tweet embeds
 *
 * Content is stored as structured JSON for headless CMS consumption.
 */
export const customLexicalEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    BlocksFeature({
      blocks: [
        CodeBlock,
        CalloutBlock,
        VideoBlock,
        QuoteBlock,
        ImageBlock,
        TableBlock,
        FileDownloadBlock,
        AccordionBlock,
        TweetBlock,
      ],
    }),
  ],
})
