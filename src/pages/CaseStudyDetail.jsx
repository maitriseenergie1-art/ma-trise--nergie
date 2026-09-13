import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StepIcon } from '../components/StepIcon';
import { heroImages } from '../data/heroImages';
import { trackEvent } from '../services/analyticsService';
import { Container, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { FinalCta } from '../components/sections';
import NotFound from './NotFound';
import { usePageData } from '../hooks/usePageData';
import { contentKeys, loadCaseStudy } from '../services/contentService';
import { breadcrumbSchema, caseStudySchema } from '../lib/structuredData';

const STORY_STEPS = [
  ['Problématique', 'problem', 'diagnostic'],
  ['Diagnostic', 'diagnosis', 'etude'],
  ['Solution', 'solution', 'conception'],
  ['Travaux', 'works', 'travaux'],
  ['Résultats', 'results', 'suivi'],
];

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const { status, data: item } = usePageData(contentKeys.caseStudy(slug), () => loadCaseStudy(slug));

  useEffect(() => {
    if (item) trackEvent('case_study_viewed', { slug });
  }, [item, slug]);

  if (status === 'loading') {
    return (
      <Section>
        <Container>
          <p className="empty-state">Chargement de la réalisation…</p>
        </Container>
      </Section>
    );
  }
  if (status === 'error') {
    return (
      <Section>
        <Container>
          <p className="empty-state">Cette réalisation n’est pas disponible pour le moment.</p>
        </Container>
      </Section>
    );
  }
  if (!item) return <NotFound />;

  const path = `/realisations/${item.slug}`;
  const metrics = Array.isArray(item.metrics) ? item.metrics : [];
  const steps = STORY_STEPS.filter(([, field]) => item[field]);

  return (
    <>
      <Seo
        title={item.seo_title || item.title}
        description={item.seo_description || item.summary}
        canonicalPath={path}
        noindex
        image={item.cover_image_url}
        imageAlt={item.cover_image_alt}
        type="article"
        article={{
          publishedTime: item.published_at,
          section: item.sector,
          tags: item.tags,
        }}
        schema={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'Réalisations', path: '/realisations' },
            { name: item.title, path },
          ]),
          caseStudySchema(item, path),
        ]}
      />
      <PageHero
        breadcrumb="Réalisation"
        eyebrow={item.sector}
        title={item.title}
        text={item.summary}
        image={item.cover_image_url || heroImages.industry}
        imageAlt={item.cover_image_alt || ''}
      />
      {metrics.length > 0 && (
        <Section tone="muted">
          <Container>
            <div className="metrics-grid">
              {metrics.map((metric, index) => (
                <div className="metric" key={`${metric.label}-${index}`}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                  {metric.detail && <small>{metric.detail}</small>}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}
      <Section>
        <Container className="story-grid">
          {(steps.length ? steps : STORY_STEPS).map(([label, field, icon], index) => (
            <article key={label}>
              <StepIcon name={icon} />
              <span>0{index + 1}</span>
              <h2>{label}</h2>
              <p>{item[field] || 'Section à compléter pour ce projet.'}</p>
            </article>
          ))}
        </Container>
      </Section>
      <FinalCta
        formVariant="caseStudy"
        formContext={{ sector: item.sector, key: item.slug }}
        title="Un projet comparable sur votre site ?"
        text={`Vous exploitez un site ${item.sector.toLowerCase()} ? Parlons des leviers applicables chez vous.`}
      />
    </>
  );
}
