import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { heroImages } from '../data/heroImages';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { ArticleCard } from '../components/cards';
import { usePageData } from '../hooks/usePageData';
import { contentKeys, loadBlogPosts } from '../services/contentService';
import { breadcrumbSchema, itemListSchema } from '../lib/structuredData';
import { QuickLeadSection } from '../features/quickLead/QuickLeadSection';

const PAGE_SIZE = 6;

export default function Blog() {
  const [category, setCategory] = useState('Tous');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { status, data } = usePageData(contentKeys.blogList, loadBlogPosts);
  const posts = data ?? [];
  const categories = ['Tous', ...Array.from(new Set(posts.map((p) => p.category?.name).filter(Boolean)))];
  const byCategory = category === 'Tous' ? posts : posts.filter((p) => p.category?.name === category);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? byCategory.filter((p) => [p.title, p.excerpt, p.category?.name, ...(p.tags || [])]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedQuery)))
    : byCategory;
  const isSearching = normalizedQuery.length > 0;
  const [featured, ...rest] = isSearching ? [null, ...filtered] : filtered;

  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = rest.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [category, normalizedQuery]);

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
        title="Guides sur la performance énergétique des entreprises"
        description="Consultez nos guides sur les audits énergétiques, les CEE, le photovoltaïque, le froid industriel, la GTB et l’optimisation des bâtiments."
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
              <div className="resource-search">
                <label htmlFor="resource-search-input" className="sr-only">Rechercher un article</label>
                <Search size={18} aria-hidden="true" />
                <input
                  id="resource-search-input"
                  type="search"
                  placeholder="Rechercher un article, un mot-clé…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button type="button" aria-label="Effacer la recherche" onClick={() => setQuery('')}>
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
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
              {isSearching && filtered.length === 0 && (
                <p className="empty-state">Aucun article ne correspond à « {query.trim()} ».</p>
              )}
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
              {pageItems.length > 0 && (
                <>
                  <div className="resource-strip">
                    {pageItems.map((item) => (
                      <ArticleCard item={item} key={item.slug} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <nav className="pagination" aria-label="Pagination des articles">
                      <button
                        type="button"
                        disabled={safePage === 1}
                        onClick={() => setPage(safePage - 1)}
                      >
                        <ChevronLeft size={16} aria-hidden="true" />
                        Précédent
                      </button>
                      <span>Page {safePage} sur {totalPages}</span>
                      <button
                        type="button"
                        disabled={safePage === totalPages}
                        onClick={() => setPage(safePage + 1)}
                      >
                        Suivant
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    </nav>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </Section>
      <QuickLeadSection variant="blog" heading="Une question sur votre installation ?" />
    </>
  );
}
