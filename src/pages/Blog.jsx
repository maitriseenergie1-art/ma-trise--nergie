import { useState } from 'react';
import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { ArticleCard } from '../components/cards';
import { usePageData } from '../hooks/usePageData';
import { contentKeys, loadBlogPosts } from '../services/contentService';
import { breadcrumbSchema, itemListSchema } from '../lib/structuredData';
import { QuickLeadSection } from '../features/quickLead/QuickLeadSection';

export default function Blog() {
  const [category, setCategory] = useState('Tous');
  const { status, data } = usePageData(contentKeys.blogList, loadBlogPosts);
  const posts = data ?? [];
  const categories = ['Tous', ...Array.from(new Set(posts.map((p) => p.category?.name).filter(Boolean)))];
  const filtered = category === 'Tous' ? posts : posts.filter((p) => p.category?.name === category);
  const [featured, ...rest] = filtered;

  const schema = posts.length
    ? [
        breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: 'Ressources', path: '/ressources' },
        ]),
        itemListSchema(posts.map((p) => ({ name: p.title, path: `/ressources/${p.slug}` }))),
      ]
    : undefined;

  return (
    <>
      <Seo
        title="Ressources"
        description="Analyses et repères sur la performance énergétique des bâtiments et installations professionnelles : méthode, financement CEE, froid, CVC et GTB."
        canonicalPath="/ressources"
        schema={schema}
      />
      <PageHero
        eyebrow="Ressources"
        title="Comprendre pour mieux décider."
        text="Des repères techniques et méthodologiques pour préparer les projets énergétiques professionnels."
        image={heroImages.architecture}
        imageAlt=""
      />
      <Section>
        <Container>
          {status === 'loading' && <p className="empty-state">Chargement des articles…</p>}
          {status === 'error' && (
            <p className="empty-state">Le blog n’est pas disponible pour le moment.</p>
          )}
          {status === 'success' && posts.length === 0 && (
            <p className="empty-state">Les premiers articles arrivent bientôt.</p>
          )}
          {status === 'success' && posts.length > 0 && (
            <>
              <div className="filter-bar">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={category === item ? 'active' : ''}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {featured && (
                <div className="featured-article">
                  <img
                    src={featured.cover_image_url}
                    alt={featured.cover_image_alt || `Illustration pour l’article : ${featured.title}`}
                  />
                  <div>
                    <Eyebrow>
                      À la une{featured.category?.name ? ` · ${featured.category.name}` : ''}
                    </Eyebrow>
                    <h2>{featured.title}</h2>
                    <p>{featured.excerpt}</p>
                    <Button to={`/ressources/${featured.slug}`}>Lire l’article</Button>
                  </div>
                </div>
              )}
              {rest.length > 0 && (
                <CardCarousel key={category} label="Nos articles">
                  {rest.map((item) => (
                    <ArticleCard item={item} key={item.slug} />
                  ))}
                </CardCarousel>
              )}
            </>
          )}
        </Container>
      </Section>
      <QuickLeadSection variant="blog" heading="Une question sur votre installation ?" />
    </>
  );
}
