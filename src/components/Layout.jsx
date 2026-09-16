import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { primaryNavigation } from '../data/navigation';
import { sectors } from '../data/sectors';
import { siteConfig } from '../config/siteConfig';
import { trackEvent } from '../services/analyticsService';
import { Button, Container } from './ui';
import { BrandLogo } from './BrandLogo';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname]);
  return null;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const toggleRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return <>
    <header className={`site-rail ${open ? 'is-open' : ''}`}>
      <div className="top-header-inner container">
        <div className="rail-head"><BrandLogo /><button ref={toggleRef} className="rail-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="rail-navigation" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}>{open ? <X /> : <Menu />}</button></div>
        <div className="rail-body" id="rail-navigation">
          <p className="rail-intro">Conseil et ingénierie pour les bâtiments et installations professionnelles.</p>
          <nav className="rail-nav" aria-label="Navigation principale">
            <span className="rail-label">Explorer</span>
            {primaryNavigation.map((item) => {
              const expanded = activeMenu === item.path;
              return <div className={`rail-nav-item ${expanded ? 'is-expanded' : ''}`} key={item.path}>
                <div className="rail-nav-row"><NavLink to={item.path}>{item.label}</NavLink>{item.children && <button type="button" onClick={() => setActiveMenu(expanded ? null : item.path)} aria-expanded={expanded} aria-controls={`rail-submenu-${item.label.toLowerCase()}`} aria-label={`${expanded ? 'Masquer' : 'Afficher'} les rubriques ${item.label}`}><ChevronRight /></button>}</div>
                {item.children && expanded && <div className="rail-submenu" id={`rail-submenu-${item.label.toLowerCase()}`}><div className="rail-submenu-head"><span>{item.label}</span><Link to={item.path}>Tout voir <ArrowRight /></Link></div><div className="rail-submenu-list">{item.children.map((child) => <Link to={child.path} key={child.path}><strong>{child.label}</strong>{child.description && <small>{child.description}</small>}</Link>)}</div></div>}
              </div>;
            })}
            <NavLink className="rail-simple-link" to="/a-propos">À propos</NavLink>
            <NavLink className="rail-simple-link" to="/contact">Contact</NavLink>
          </nav>
          <div className="rail-action"><span>Vous avez un projet&nbsp;?</span><Button to="/eligibilite" sourceCta="rail_eligibility">Décrire mon besoin</Button><a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></div>
        </div>
      </div>
    </header>
    {open && <button className="rail-backdrop" type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} />}
  </>;
}

function FooterList({ title, items }) {
  return <div className="footer-list"><h3>{title}</h3>{items.map(([label, to]) => <Link key={`${to}-${label}`} to={to}>{label}</Link>)}</div>;
}

export function Footer() {
  const { contact } = siteConfig;
  const phoneHref = `tel:${contact.phone.replace(/\s/g, '')}`;
  return <footer className="footer"><Container>
    <div className="footer-statement"><BrandLogo light /><h2>Décider à partir de votre site, de vos usages et de données utiles.</h2><Button to="/contact" variant="outline-light" sourceCta="footer_contact">Parler de mon projet</Button></div>
    <div className="footer-sitemap"><FooterList title="Expertises" items={[["Toutes les solutions", "/solutions"], ["Financement & CEE", "/financement-cee"], ["Ressources", "/ressources"]]} /><FooterList title="Secteurs" items={sectors.map((item) => [item.title, `/secteurs/${item.slug}`])} /><FooterList title="Entreprise" items={[["À propos", "/a-propos"], ["Réalisations", "/realisations"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Plan du site", "/plan-du-site"]]} /><div className="footer-contact"><h3>Nous contacter</h3><address><span>{contact.address}</span><a href={phoneHref} onClick={() => trackEvent('phone_clicked', { channel: 'footer' })}>{contact.phone}</a><a href={`mailto:${contact.email}`} onClick={() => trackEvent('email_clicked', { channel: 'footer' })}>{contact.email}</a><span>{contact.hours}</span></address></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><div><Link to="/mentions-legales">Mentions légales</Link><Link to="/politique-de-confidentialite">Confidentialité</Link><Link to="/gestion-des-cookies">Cookies</Link></div></div>
  </Container></footer>;
}
