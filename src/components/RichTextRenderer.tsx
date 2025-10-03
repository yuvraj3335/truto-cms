import React from 'react'

interface RichTextRendererProps {
  content: any
  className?: string
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) return null

  const renderNode = (node: any, index: number = 0): React.ReactNode => {
    if (typeof node === 'string') {
      return node
    }

    if (!node || !node.type) {
      return null
    }

    const key = `${node.type}-${index}`

    switch (node.type) {
      case 'root':
        return (
          <div key={key} className={`rich-text-content ${className}`}>
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </div>
        )

      case 'paragraph':
        return (
          <p key={key} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </p>
        )

      case 'heading':
        const HeadingTag = `h${node.tag || 2}` as keyof JSX.IntrinsicElements
        return (
          <HeadingTag 
            key={key} 
            style={{ 
              marginTop: '2rem', 
              marginBottom: '1rem',
              lineHeight: '1.3',
              color: '#2c3e50'
            }}
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </HeadingTag>
        )

      case 'list':
        const ListTag = node.listType === 'number' ? 'ol' : 'ul'
        return (
          <ListTag key={key} style={{ marginBottom: '1rem', paddingLeft: '2rem' }}>
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </ListTag>
        )

      case 'listitem':
        return (
          <li key={key} style={{ marginBottom: '0.5rem' }}>
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </li>
        )

      case 'quote':
        return (
          <blockquote 
            key={key} 
            style={{ 
              borderLeft: '4px solid #3498db',
              paddingLeft: '1rem',
              margin: '1.5rem 0',
              fontStyle: 'italic',
              color: '#555',
              background: '#f8f9fa',
              padding: '1rem 1rem 1rem 2rem',
              borderRadius: '0 4px 4px 0'
            }}
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </blockquote>
        )

      case 'code':
        return (
          <pre 
            key={key}
            style={{
              background: '#f4f4f4',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.9rem',
              border: '1px solid #ddd'
            }}
          >
            <code>{node.children?.map((child: any, i: number) => renderNode(child, i))}</code>
          </pre>
        )

      case 'link':
        return (
          <a 
            key={key}
            href={node.fields?.url || '#'}
            target={node.fields?.newTab ? '_blank' : '_self'}
            rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}
            style={{ color: '#3498db', textDecoration: 'underline' }}
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </a>
        )

      case 'linebreak':
        return <br key={key} />

      case 'text':
        let textElement: React.ReactNode = node.text || ''
        
        if (node.bold) {
          textElement = <strong>{textElement}</strong>
        }
        if (node.italic) {
          textElement = <em>{textElement}</em>
        }
        if (node.underline) {
          textElement = <u>{textElement}</u>
        }
        if (node.strikethrough) {
          textElement = <s>{textElement}</s>
        }
        if (node.code) {
          textElement = (
            <code style={{ 
              background: '#f1f1f1', 
              padding: '0.2rem 0.4rem', 
              borderRadius: '3px',
              fontSize: '0.9em'
            }}>
              {textElement}
            </code>
          )
        }

        return <span key={key}>{textElement}</span>

      default:
        // For any unhandled node types, try to render children
        if (node.children) {
          return (
            <div key={key}>
              {node.children.map((child: any, i: number) => renderNode(child, i))}
            </div>
          )
        }
        // Fallback for unknown nodes
        return <span key={key}>{JSON.stringify(node)}</span>
    }
  }

  return (
    <div className={`rich-text-renderer ${className}`}>
      {renderNode(content)}
    </div>
  )
}