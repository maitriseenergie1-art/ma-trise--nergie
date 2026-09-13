import { useState } from 'react';
import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { Container, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { CaseCard } from '../components/cards';
import { usePageData } from '../hooks/usePageData';
import { contentKeys, loadCaseStudies } from '../services/contentService';
import { breadcrumbSchema, itemListSchema } from '../lib/structuredData';
import { QuickLeadSection } from '../features/quickLead/QuickLeadSection';

export default function CaseStudies() {
  const [filter, setFilter] = useState('Tous');
  const { status, data } = usePageData(contentKeys.caseStudyList, loadCaseStudies);
  const caseStudies = data ?? [];
  const filters = ['Tous', ...Array.from(new Set(caseStudies.flatMap((item) => item.tags || [])))];
  const items = filter === 'Tous' ? caseStudies : caseStudies.filter((item) => (item.tags || []).includes(filter));

  const schema = caseStudies.length
    ? [
        breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: 'Réalisations', path: '/realisations' },
        ]),
        itemListSchema(
          caseStudies.map((item) => ({ name: item.title, path: `/realisations/${item.slug}` })),
        ),
      ]
    : undefined;

  return (
    <>
      <Seo
        title="Réalisations"
        description="Exemples de projets de performance énergétique : pilotage GTB, froid industriel, CVC et récupération de chaleur, présentés comme des systèmes."
        canonicalPath="/realisations"
        noindex
        schema={schema}
      />
      <PageHero
        eyebrow="Réalisations"
        title="Des exemples de projets à lire comme des systèmes."
        text="Chaque carte est un exemple de démonstration : elle illustre un contexte et des solutions possibles, sans représenter une référence client."
        image={heroImages.industry}
        imageAlt=""
      />
      <Section>
        <Container>
          {status === 'loading' && <p className="empty-state">Chargement des réalisations…</p>}
          {status === 'error' && (
            <p className="empty-state">Les réalisations ne sont pas disponibles pour le moment.</p>
          )}
          {status === 'success' && (
            <>
              <div className="filter-bar">
                {filters.map((item) => (
                  <button
                    onClick={() => setFilter(item)}
                    className={filter === item ? 'active' : ''}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {items.length ? (
                <CardCarousel key={filter} label="Nos réalisations">
                  {items.map((item) => (
                    <CaseCard item={item} key={item.slug} />
                  ))}
                </CardCarousel>
              ) : (
                <p className="empty-state">Aucune réalisation ne correspond à ce filtre.</p>
              )}
            </>
          )}
        </Container>
      </Section>
      <QuickLeadSection variant="caseStudy" heading="Un projet comparable sur votre site ?" />
    </>
  );
}
