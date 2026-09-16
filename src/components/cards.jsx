import { BusinessIcon } from './BusinessIcon';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../services/analyticsService';

export function SolutionCard({solution}) {
  const problem = solution.problem || solution.description || 'Les usages et les équipements du site doivent être analysés.';
  const benefit = solution.benefit || solution.summary || 'Définir une action adaptée au contexte de l’installation.';

  return <article className="solution-card">
    <img className="solution-card-image" src={solution.image} alt={solution.heroAlt} loading="lazy"/>
    <div className="solution-card-body">
      <span className="business-label"><BusinessIcon name={solution.icon} size={26}/>{solution.category}</span>
      <h3>{solution.title}</h3>
      <div className="solution-card-detail"><b>Problème</b><p>{problem}</p></div>
      <div className="solution-card-detail"><b>Bénéfice</b><p>{benefit}</p></div>
      <Link to={`/solutions/${solution.slug}`} onClick={()=>trackEvent('cta_click',{sourceCta:'solution_card_discover',solutionInterest:solution.slug})}>Découvrir <ArrowRight size={17}/></Link>
    </div>
  </article>;
}
export function SectorCard({sector}) { return <Link className="sector-card" to={`/secteurs/${sector.slug}`}><img src={sector.image} alt={sector.imageAlt} loading="lazy"/><div><BusinessIcon name={sector.icon} size={30}/><h3>{sector.title}</h3><p>{sector.description}</p><ArrowRight/></div></Link>; }
export function CaseCard({item}) {
  const image = item.cover_image_url || item.image;
  const text = item.summary || item.work;
  return <article className="case-card"><Link to={`/realisations/${item.slug}`} onClick={()=>trackEvent('case_study_viewed',{slug:item.slug})}><img src={image} alt={item.cover_image_alt || `Illustration de démonstration : ${item.title}`} loading="lazy"/><div><span>{item.sector}</span><h3>{item.title}</h3><p>{text}</p><small>{item.location}</small><ArrowRight size={19}/></div></Link></article>;
}
export function ArticleCard({item}) {
  const categoryLabel = item.category?.name || item.category || 'Article';
  return <article className="article-card resource-card">
    <Link to={`/ressources/${item.slug}`}>
      <img src={item.cover_image_url} alt={item.cover_image_alt || `Illustration pour l’article : ${item.title}`} loading="lazy"/>
      <div>
        <span className="article-category">{categoryLabel}</span>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
        <span className="resource-card-link">Lire l’article <ArrowRight size={18}/></span>
      </div>
    </Link>
  </article>;
}
