import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import config from '@/payload.config'
import RichTextRenderer from '@/components/RichTextRenderer'

interface Params {
  slug: string
}

export default async function ArticlePage({ params }: { params: Params }) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      and: [
        {
          slug: {
            equals: params.slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 2,
  })

  const article = docs[0]

  if (!article) {
    notFound()
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '900px', 
      margin: '0 auto',
      fontFamily: 'Georgia, "Times New Roman", serif'
    }}>
      <article>
        <header style={{ marginBottom: '3rem', borderBottom: '2px solid #eee', paddingBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1.5rem',
            lineHeight: '1.2',
            color: '#2c3e50',
            fontWeight: '700'
          }}>
            {article.title}
          </h1>
          
          <div style={{ 
            fontSize: '1rem', 
            color: '#666', 
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '500' }}>
              By {typeof article.author === 'object' ? article.author.displayName : 'Unknown'}
            </span>
            {article.publishedDate && (
              <span>Published {new Date(article.publishedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            )}
            {article.readingTime && (
              <span style={{ 
                background: '#e8f4fd',
                color: '#0066cc',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {article.readingTime} min read
              </span>
            )}
          </div>

          {article.categories && article.categories.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              {article.categories.map((category) => (
                <span
                  key={typeof category === 'object' ? category.id : category}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    marginRight: '0.75rem',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {typeof category === 'object' ? category.name : category}
                </span>
              ))}
            </div>
          )}

          {article.featuredImage && typeof article.featuredImage === 'object' && (
            <div style={{ 
              marginBottom: '1.5rem',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Image
                src={article.featuredImage.url || ''}
                alt={article.featuredImage.alt || article.title}
                width={800}
                height={400}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}

          {article.excerpt && (
            <p style={{ 
              fontSize: '1.3rem', 
              color: '#555', 
              fontStyle: 'italic',
              marginBottom: '0',
              lineHeight: '1.7',
              padding: '1.5rem',
              background: '#f8f9fa',
              borderLeft: '4px solid #3498db',
              borderRadius: '0 8px 8px 0'
            }}>
              {article.excerpt}
            </p>
          )}
        </header>

        <main style={{ 
          lineHeight: '1.8', 
          fontSize: '1.125rem',
          color: '#333'
        }}>
          <RichTextRenderer 
            content={article.content} 
            className="article-content"
          />
        </main>

        <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/articles" style={{ color: '#007acc', textDecoration: 'none' }}>
              ← Back to Articles
            </Link>
            
            {article.allowComments && (
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                Comments are enabled for this article
              </div>
            )}
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Tags: </strong>
              {article.tags.map((tagObj, index) => (
                <span key={index} style={{ 
                  background: '#f8f9fa',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  marginRight: '0.5rem',
                  color: '#495057'
                }}>
                  #{typeof tagObj === 'object' ? tagObj.tag : tagObj}
                </span>
              ))}
            </div>
          )}
        </footer>
      </article>
    </div>
  )
}

// Generate static params for published articles
export async function generateStaticParams() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: {
      status: {
        equals: 'published',
      },
    },
    select: {
      slug: true,
    },
  })

  return articles.map((article) => ({
    slug: article.slug,
  }))
}