import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { primaryNavigation } from '../data/navigation';
import { sectors } from '../data/sectors';
import { siteConfig } from '../config/siteConfig';
import { trackEvent } from '../services/analyticsService';
import { Button, Container } from './ui';
import { BrandLogo } from './BrandLogo';

export function ScrollToTop(){
  const { pathname }=useLocation();
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[pathname]);
  return null;
}

export function Header(){
  const [open,setOpen]=useState(false);
  const [activeMenu,setActiveMenu]=useState(null);
  const [mobileMenu,setMobileMenu]=useState(null);
  const suppressFocusOpen=useRef(false);
  const menuToggleRef=useRef(null);
  const location=useLocation();
  const [hasScrolled,setHasScrolled]=useState(false);
  const isHome=location.pathname==='/' || /^\/(solutions|secteurs|financement-cee|realisations|ressources|a-propos)(\/|$)/.test(location.pathname);
  useEffect(()=>{setOpen(false);setActiveMenu(null);setMobileMenu(null);},[location.pathname]);
  useEffect(()=>{
    if(!isHome){setHasScrolled(true);return undefined;}
    const updateHeader=()=>setHasScrolled(window.scrollY>24);
    updateHeader();
    window.addEventListener('scroll',updateHeader,{passive:true});
    return ()=>window.removeEventListener('scroll',updateHeader);
  },[isHome]);
  useEffect(()=>{
    if(!open)return undefined;
    const closeOnEscape=(event)=>{if(event.key==='Escape'){setOpen(false);setMobileMenu(null);menuToggleRef.current?.focus();}};
    window.addEventListener('keydown',closeOnEscape);
    return ()=>window.removeEventListener('keydown',closeOnEscape);
  },[open]);
  const closeOnBlur=(event)=>{if(!event.currentTarget.contains(event.relatedTarget))setActiveMenu(null);};
  const onKeyDown=(event)=>{if(event.key==='Escape'){setActiveMenu(null);suppressFocusOpen.current=true;event.currentTarget.querySelector('a')?.focus();}};
  const openOnFocus=(item)=>{if(!item.children)return;if(suppressFocusOpen.current){suppressFocusOpen.current=false;return;}setActiveMenu(item.path);};
  const renderDropdown=(item,menuId)=>item.label==='Solutions'
    ? <div className="dropdown mega-menu" id={menuId}><Link className="desktop-dropdown-parent" to={item.path}>Toutes nos solutions</Link><div className="mega-menu-groups">{Object.entries(item.children.reduce((groups,child)=>({...groups,[child.category]:[...(groups[child.category]||[]),child]}),{})).map(([category,children])=><section key={category}><h3>{category}</h3>{children.map(child=><Link to={child.path} key={child.path}><strong>{child.label}</strong></Link>)}</section>)}</div></div>
    : <div className="dropdown" id={menuId}><Link className="desktop-dropdown-parent" to={item.path}>Tous nos secteurs</Link>{item.children.map(child=><Link to={child.path} key={child.path}><strong>{child.label}</strong><small>{child.description}</small></Link>)}</div>;

  return <header className={`header ${isHome?'home-header':''} ${hasScrolled?'is-scrolled':'header-at-top'}`}><Container className="header-inner"><BrandLogo/><nav className="desktop-nav" aria-label="Navigation principale">{primaryNavigation.map(item=>{const isOpen=activeMenu===item.path;const menuId=`menu-${item.label.toLowerCase()}`;return <div className="nav-item" key={item.path} onMouseEnter={()=>item.children&&setActiveMenu(item.path)} onMouseLeave={()=>item.children&&setActiveMenu(null)} onFocusCapture={()=>openOnFocus(item)} onBlur={closeOnBlur} onKeyDown={onKeyDown}><NavLink to={item.path} aria-expanded={item.children?isOpen:undefined} aria-controls={item.children?menuId:undefined}>{item.label}{item.children&&<ChevronDown size={14}/>}</NavLink>{item.children&&isOpen&&renderDropdown(item,menuId)}</div>;})}</nav><div className="header-cta"><Button to="/eligibilite" sourceCta="header_eligibility">Vérifier mon éligibilité</Button></div><button ref={menuToggleRef} className="menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open?'Fermer le menu':'Ouvrir le menu'}>{open?<X/>:<Menu/>}</button></Container>{open&&<div className="mobile-menu" id="mobile-navigation"><nav>{primaryNavigation.map(item=>item.children?<div className="mobile-nav-group" key={item.path}><div><Link to={item.path}>{item.label}</Link><button onClick={()=>setMobileMenu(mobileMenu===item.path?null:item.path)} aria-expanded={mobileMenu===item.path} aria-controls={`mobile-${item.label.toLowerCase()}`} aria-label={`${mobileMenu===item.path?'Masquer':'Afficher'} les sous-sections ${item.label}`}><ChevronDown size={18}/></button></div>{mobileMenu===item.path&&<div className="mobile-subnav" id={`mobile-${item.label.toLowerCase()}`}><Link className="mobile-parent-link" to={item.path}>{item.label==='Solutions'?'Toutes nos solutions':'Tous nos secteurs'}<ArrowRight size={15}/></Link>{item.children.map(child=><Link to={child.path} key={child.path}>{child.label}<ArrowRight size={15}/></Link>)}</div>}</div>:<Link to={item.path} key={item.path}>{item.label}<ArrowRight size={18}/></Link>)}<Link to="/a-propos">Notre approche<ArrowRight size={18}/></Link></nav><Button to="/eligibilite" sourceCta="mobile_eligibility">Vérifier mon éligibilité</Button></div>}</header>;
}

function FooterList({title,items}){
  return <div className="footer-list"><h3>{title}</h3>{items.map(([label,to])=><Link key={`${to}-${label}`} to={to}>{label}</Link>)}</div>;
}

export function Footer(){
  const solutionGroups=['Pilotage & supervision','Chauffage & CVC','Isolation & performance thermique','Froid','Récupération & chaleur','Utilités & équipements'];
  const { contact }=siteConfig;
  const phoneHref=`tel:${contact.phone.replace(/\s/g,'')}`;

  return <footer className="footer"><Container><div className="footer-intro"><BrandLogo light/><p>{siteConfig.description}</p></div><div className="footer-sitemap"><FooterList title="Solutions" items={[['Toutes les solutions','/solutions'],...solutionGroups.map(label=>[label,'/solutions'])]}/><FooterList title="Secteurs" items={sectors.map(item=>[item.title,`/secteurs/${item.slug}`])}/><FooterList title="Entreprise" items={[['À propos','/a-propos'],['Réalisations','/realisations'],['Ressources','/ressources'],['FAQ','/faq'],['Contact','/contact']]}/><FooterList title="Informations" items={[['Financement & CEE','/financement-cee'],['Mentions légales','/mentions-legales'],['Politique de confidentialité','/politique-de-confidentialite'],['Gestion des cookies','/gestion-des-cookies'],['Plan du site','/plan-du-site']]}/></div><div className="footer-contact"><p>Nous contacter</p><address><span>{contact.address}</span><a href={phoneHref} onClick={()=>trackEvent('phone_clicked',{channel:'footer'})}>{contact.phone}</a><a href={`mailto:${contact.email}`} onClick={()=>trackEvent('email_clicked',{channel:'footer'})}>{contact.email}</a><span>{contact.hours}</span></address></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><span>Coordonnées de démonstration</span></div></Container></footer>;
}
