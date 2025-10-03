import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { cookies } from 'next/headers'
import config from '@/payload.config'
import RichTextRenderer from '@/components/RichTextRenderer'

interface Params {
  slug: string
}

export default async function ArticlePreviewPage({ params }: { params: Params }) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Check if this is a preview request
  const cookieStore = await cookies()
  const isPreview = cookieStore.get('payloadToken')?.value === 'preview'
  
  // If not in preview mode, redirect to public article page
  if (!isPreview) {
    const { docs: publicDocs } = await payload.find({
      collection: 'articles',
      where: {
        and: [
          { slug: { equals: params.slug } },
          { status: { equals: 'published' } }
        ]
      },
      limit: 1,
    })
    
    if (publicDocs.length > 0) {
      // Article is published, redirect to public page
      return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        <p>This article is published. <a href={`/articles/${params.slug}`} style={{ color: '#007acc' }}>View published version</a></p>
      </div>
    } else {
      // Article is not published and user is not in preview mode
      return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        <p>Preview access required. Please access this page through the admin panel.</p>
      </div>
    }
  }

  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        equals: params.slug,
      },
    },
    depth: 2,
    draft: isPreview, // Include drafts if in preview mode
  })

  const article = docs[0]

  if (!article) {
    notFound()
  }

  return (
    <>
      {isPreview && (
        <div style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          color: 'white',
          padding: '1rem 2rem',
          textAlign: 'center',
          fontWeight: 'bold',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔍 <span>PREVIEW MODE</span>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              Status: {article.status}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {article.status === 'published' && (
              <Link 
                href={`/articles/${params.slug}`}
                style={{ 
                  color: 'white', 
                  textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
              >
                View Live
              </Link>
            )}
            <Link 
              href={`/api/exit-preview?redirect=/admin/collections/articles/${article.id}`}
              style={{ 
                color: 'white', 
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
            >
              Back to Admin
            </Link>
            <Link 
              href={`/api/exit-preview?redirect=/articles`}
              style={{ 
                background: 'rgba(255,255,255,0.2)',
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Exit Preview
            </Link>
          </div>
        </div>
      )}
      
      <div style={{ 
        padding: '2rem', 
        maxWidth: '900px', 
        margin: '0 auto',
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}>
        <article>
          <header style={{ marginBottom: '3rem', borderBottom: '2px solid #eee', paddingBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <h1 style={{ 
                fontSize: '3rem', 
                marginBottom: '1.5rem',
                lineHeight: '1.2',
                color: '#2c3e50',
                fontWeight: '700',
                flex: 1
              }}>
                {article.title}
              </h1>
              
              <div style={{
                background: article.status === 'published' ? '#27ae60' : '#f39c12',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginLeft: '1rem'
              }}>
                {article.status}
              </div>
            </div>
            
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
    </>
  )
}