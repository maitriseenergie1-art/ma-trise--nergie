import { BusinessIcon } from './BusinessIcon';
import { heroImages } from '../data/heroImages';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { updateAcquisitionContext } from '../services/acquisition';
import { trackEvent } from '../services/analyticsService';

export function Button({ to, children, variant='primary', className='', sourceCta, solutionInterest, sectorInterest, onClick, ...props }) {
  const location=useLocation();
  const handleClick=(event)=>{const label=sourceCta||(typeof children==='string'?children:'cta');updateAcquisitionContext({sourcePage:location.pathname,sourceCta:label,solutionInterest,sectorInterest});trackEvent('cta_click',{sourceCta:label,solutionInterest,sectorInterest,destination:to});onClick?.(event);};
  const content=<>{children}<ArrowRight size={17} aria-hidden="true"/></>;
  return to?<Link className={`button ${variant} ${className}`} to={to} onClick={handleClick} {...props}>{content}</Link>:<button className={`button ${variant} ${className}`} onClick={handleClick} {...props}>{content}</button>;
}
export function Container({children,className=''}) { return <div className={`container ${className}`}>{children}</div>; }
export function Section({children,className='',tone=''}) { return <section className={`section ${tone} ${className}`}>{children}</section>; }
export function Eyebrow({children}) { return <p className="eyebrow"><span/>{children}</p>; }
export function Breadcrumb({current}) { return <nav className="breadcrumb" aria-label="Fil d’Ariane"><Link to="/">Accueil</Link><ChevronRight size={14}/><span>{current}</span></nav>; }
export function PageHero({eyebrow,title,text,image=heroImages.architecture,imageAlt='',breadcrumb,icon,children}) { return <section className="page-hero editorial-hero"><Container><div className="page-hero-copy">{breadcrumb&&<Breadcrumb current={breadcrumb}/>}<div className="hero-business-label">{icon&&<BusinessIcon name={icon} size={34}/>}<Eyebrow>{eyebrow}</Eyebrow></div><h1>{title}</h1><p className="lead">{text}</p>{children || <Button to="/eligibilite" sourceCta="page_hero_eligibility">Vérifier mon éligibilité</Button>}</div><figure className="editorial-hero-media"><img src={image} alt={imageAlt} fetchPriority="high"/><figcaption>Maîtrise Énergie · Étude et performance des installations</figcaption></figure></Container></section>; }
