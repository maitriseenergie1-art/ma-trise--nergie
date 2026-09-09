import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';

export function BrandLogo({ light = false, className = '' }) {
  return <Link to="/" className={`brand-logo ${light ? 'brand-logo-light' : ''} ${className}`.trim()} aria-label={`${siteConfig.name}, accueil`}>
    <svg className="brand-logo-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="currentColor"/>
      <path d="M18.1 5.8 10.7 17h5.2L14 26.2 21.3 15h-5.2l2-9.2Z" fill="white"/>
    </svg>
    <span className="brand-logo-copy">
      <strong>Maîtrise Énergie</strong>
      <small>Performance énergétique</small>
    </span>
  </Link>;
}
