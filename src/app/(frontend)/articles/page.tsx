import { getPayload } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import config from '@/payload.config'

export default async function ArticlesPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedDate',
    depth: 2,
  })

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1000px', 
      margin: '0 auto',
      fontFamily: 'Georgia, "Times New Roman", serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#2c3e50',
          marginBottom: '1rem',
          fontWeight: '700'
        }}>
          Published Articles
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Discover our latest insights, stories, and thoughts
        </p>
      </header>
      
      {articles.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          color: '#666'
        }}>
          <h3>No published articles yet</h3>
          <p>Check back soon for new content!</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem' 
        }}>
          {articles.map((article) => (
            <article key={article.id} style={{ 
              background: 'white',
              border: '1px solid #e1e5e9',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}>
              {article.featuredImage && typeof article.featuredImage === 'object' && (
                <div style={{ 
                  position: 'relative',
                  height: '200px',
                  overflow: 'hidden'
                }}>
                  <Image
                    src={article.featuredImage.url || ''}
                    alt={article.featuredImage.alt || article.title}
                    width={400}
                    height={200}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              
              <div style={{ padding: '1.5rem' }}>
                {article.categories && article.categories.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {article.categories.slice(0, 2).map((category) => (
                      <span
                        key={typeof category === 'object' ? category.id : category}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.8rem',
                          marginRight: '0.5rem',
                          fontWeight: '500'
                        }}
                      >
                        {typeof category === 'object' ? category.name : category}
                      </span>
                    ))}
                  </div>
                )}
                
                <h2 style={{ 
                  margin: '0 0 1rem 0',
                  fontSize: '1.4rem',
                  lineHeight: '1.3'
                }}>
                  <Link 
                    href={`/articles/${article.slug}`} 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#2c3e50',
                      display: 'block'
                    }}
                  >
                    {article.title}
                  </Link>
                </h2>
                
                {article.excerpt && (
                  <p style={{ 
                    color: '#666', 
                    margin: '0 0 1.5rem 0',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                  }}>
                    {article.excerpt.length > 120 
                      ? `${article.excerpt.substring(0, 120)}...` 
                      : article.excerpt
                    }
                  </p>
                )}
                
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem', 
                  color: '#888',
                  marginTop: 'auto'
                }}>
                  <div>
                    <span style={{ fontWeight: '500' }}>
                      {typeof article.author === 'object' ? article.author.displayName : 'Unknown'}
                    </span>
                    {article.publishedDate && (
                      <div style={{ marginTop: '0.25rem' }}>
                        {new Date(article.publishedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                  
                  {article.readingTime && (
                    <span style={{ 
                      background: '#e8f4fd',
                      color: '#0066cc',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem'
                    }}>
                      {article.readingTime} min
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      
      <div style={{ 
        marginTop: '3rem', 
        textAlign: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid #e1e5e9'
      }}>
        <Link 
          href="/" 
          style={{ 
            color: '#0066cc',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}