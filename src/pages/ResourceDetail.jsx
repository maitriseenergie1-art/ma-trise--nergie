import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { QuickLeadSection } from '../features/quickLead/QuickLeadSection';
import { resources } from '../data/resources';
import { solutions } from '../data/solutions';
import { sectors } from '../data/sectors';
import { absoluteUrl, breadcrumbSchema } from '../lib/structuredData';
import NotFound from './NotFound';

function relatedLabel(path) {
  if (path === '/financement-cee') return 'Financement et CEE';
  const slug = path.split('/').pop();
  return solutions.find((item) => item.slug === slug)?.title || sectors.find((item) => item.slug === slug)?.title || path;
}

export default function ResourceDetail() {
  const { slug } = useParams();
  const item = resources.find((entry) => entry.slug === slug);
  if (!item) return <NotFound />;
  const path = `/ressources/${item.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.excerpt,
    image: absoluteUrl(item.image),
    dateModified: item.updatedAt,
    author: { '@type': 'Organization', name: 'Maîtrise Énergie' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
  };

  return <>
    <Seo
      title={item.seoTitle || item.title}
      description={item.excerpt}
      canonicalPath={path}
      image={item.image}
      imageAlt={item.imageAlt}
      type="article"
      schema={[schema, breadcrumbSchema([{ name: 'Accueil', path: '/' }, { name: 'Ressources', path: '/ressources' }, { name: item.title, path }])]}
      article={{ modifiedTime: item.updatedAt, section: item.category }}
    />
    <PageHero breadcrumb={`Ressources · ${item.category}`} eyebrow={item.category} title={item.title} text={item.excerpt} image={item.image} imageAlt={item.imageAlt} />
    <article className="article resource-guide">
      <Container>
        <div className="article-heading resource-meta">
          <span>Guide pratique</span>
          <time dateTime={item.updatedAt}>Mis à jour le 10 septembre 2026</time>
          <span>Lecture : 4 minutes</span>
        </div>
        <div className="article-content">
          <aside className="article-toc" aria-label="Sommaire">
            <strong>Dans ce guide</strong>
            {item.sections.map(([title], index) => <a key={title} href={`#partie-${index + 1}`}>{title}</a>)}
            <a href="#a-retenir">À retenir</a>
          </aside>
          <div className="prose">
            <p className="article-intro">{item.intro}</p>
            {item.sections.map(([title, text], index) => <section id={`partie-${index + 1}`} key={title}>
              <span className="section-number">0{index + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>)}
            <section className="guide-checklist" id="a-retenir">
              <Eyebrow>À retenir</Eyebrow>
              <h2>Les vérifications à préparer</h2>
              <ul>{item.checklist.map((point) => <li key={point}><CheckCircle2 aria-hidden="true" />{point}</li>)}</ul>
            </section>
            <div className="official-source">
              <div><Eyebrow>Source de référence</Eyebrow><p>Consultez toujours la source publique à jour pour les règles, obligations et dispositifs applicables.</p></div>
              <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.label}<ExternalLink size={16} aria-hidden="true" /></a>
            </div>
            <section>
              <h2>Approfondir ce sujet</h2>
              <div className="resource-related">{item.related.map((relatedPath) => <Link key={relatedPath} to={relatedPath}>{relatedLabel(relatedPath)} →</Link>)}</div>
            </section>
            <div className="article-callout"><h3>Vous souhaitez appliquer cette méthode à votre site&nbsp;?</h3><p>Présentez votre installation et les premières données disponibles pour cadrer les vérifications utiles.</p><Button to="/eligibilite" sourceCta={`resource_${item.slug}`}>Vérifier mon éligibilité</Button></div>
          </div>
        </div>
      </Container>
    </article>
    <QuickLeadSection variant="resource" context={{ key:item.slug }} />
  </>;
}
