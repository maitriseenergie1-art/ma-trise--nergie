import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';

export function BrandLogo({ light = false, className = '' }) {
  return <Link to="/" className={`brand-logo ${light ? 'brand-logo-light' : ''} ${className}`.trim()} aria-label={`${siteConfig.name}, accueil`}>
    <img className="brand-logo-mark" src="/logo-mark.png" alt="" width="32" height="32" />
    <span className="brand-logo-copy">
      <strong>Maîtrise Énergie</strong>
      <small>Performance énergétique</small>
    </span>
  </Link>;
}
