import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { heroImages } from '../data/heroImages';
import { trackEvent } from '../services/analyticsService';
import { Container, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { FinalCta } from '../components/sections';
import NotFound from './NotFound';
import { usePageData } from '../hooks/usePageData';
import { contentKeys, loadBlogPost } from '../services/contentService';
import { renderMarkdown, estimateReadingMinutes } from '../lib/markdown';
import { articleSchema, breadcrumbSchema } from '../lib/structuredData';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

export default function BlogPost() {
  const { slug } = useParams();
  const { status, data: post } = usePageData(contentKeys.blogPost(slug), () => loadBlogPost(slug));

  useEffect(() => {
    if (post) trackEvent('blog_post_viewed', { slug });
  }, [post, slug]);

  const html = useMemo(() => (post ? renderMarkdown(post.body_markdown) : ''), [post]);

  if (status === 'loading') {
    return (
      <Section>
        <Container>
          <p className="empty-state">Chargement de l’article…</p>
        </Container>
      </Section>
    );
  }
  if (status === 'error') {
    return (
      <Section>
        <Container>
          <p className="empty-state">Cet article n’est pas disponible pour le moment.</p>
        </Container>
      </Section>
    );
  }
  if (!post) return <NotFound />;

  const path = `/blog/${post.slug}`;
  const minutes = post.reading_minutes || estimateReadingMinutes(post.body_markdown);
  const publishedLabel = post.published_at ? dateFormatter.format(new Date(post.published_at)) : null;

  return (
    <>
      <Seo
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        canonicalPath={path}
        noindex={!post.indexable}
        image={post.cover_image_url}
        imageAlt={post.cover_image_alt}
        type="article"
        article={{
          publishedTime: post.published_at,
          modifiedTime: post.updated_at || post.published_at,
          section: post.category?.name,
          tags: post.tags,
        }}
        schema={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path },
          ]),
          articleSchema(post, path),
        ]}
      />
      <PageHero
        breadcrumb="Blog"
        eyebrow={post.category?.name || 'Article'}
        title={post.title}
        text={post.excerpt}
        image={post.cover_image_url || heroImages.architecture}
        imageAlt={post.cover_image_alt || ''}
      />
      <Section>
        <Container className="article-body">
          <p className="article-meta">
            {publishedLabel && <span>{publishedLabel}</span>}
            <span>{minutes} min de lecture</span>
            <span>{post.author_name}</span>
          </p>
          {/* Markdown is authored in the protected back office and sanitised in renderMarkdown. */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          {(post.tags || []).length > 0 && (
            <p className="article-tags">
              {post.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </p>
          )}
          <p className="article-back">
            <Link to="/blog">← Tous les articles</Link>
          </p>
        </Container>
      </Section>
      <FinalCta
        formVariant="blog"
        formContext={{ key: post.category?.slug || post.slug }}
        title="Une question sur votre installation ?"
        text="Décrivez votre contexte : un spécialiste vous répond et vous oriente vers les bons leviers."
      />
    </>
  );
}
