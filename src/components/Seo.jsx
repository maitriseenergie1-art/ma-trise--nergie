import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';

export function Seo({title,description,noindex=false,schema}) {
  const location=useLocation();
  useEffect(()=>{const setMeta=(selector,attribute,value)=>{let el=document.querySelector(selector);if(!el){el=document.createElement('meta');el.setAttribute(selector.includes('property')?'property':'name',attribute);document.head.appendChild(el);}el.setAttribute('content',value);};const pageTitle=`${title} — ${siteConfig.name}`;document.title=pageTitle;setMeta('meta[name="description"]','description',description);setMeta('meta[property="og:title"]','og:title',pageTitle);setMeta('meta[property="og:description"]','og:description',description);let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}canonical.href=`${siteConfig.siteUrl||window.location.origin}${location.pathname}`;let robots=document.querySelector('meta[name="robots"]');if(noindex){if(!robots){robots=document.createElement('meta');robots.name='robots';document.head.appendChild(robots);}robots.content='noindex, nofollow';}else robots?.remove();let json=document.querySelector('#page-jsonld');if(schema){if(!json){json=document.createElement('script');json.id='page-jsonld';json.type='application/ld+json';document.head.appendChild(json);}json.textContent=JSON.stringify(schema);}else json?.remove();},[title,description,noindex,schema,location.pathname]);
  return null;
}
