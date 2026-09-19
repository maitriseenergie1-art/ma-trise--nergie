import { siteConfig } from '../config/siteConfig';

function base() {
  const configured = siteConfig.siteUrl;
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function absoluteUrl(path = '') {
  if (/^https?:\/\//.test(path)) return path;
  return `${base()}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function organizationSchema() {
  const { contact } = siteConfig;
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${base() || absoluteUrl('/') }/#organization`,
    name: siteConfig.name,
    url: base() || undefined,
    description: siteConfig.description,
    image: absoluteUrl(siteConfig.defaultShareImage),
    logo: absoluteUrl('/brand-mark.webp'),
    email: contact?.email,
    telephone: contact?.phone,
    areaServed: { '@type': 'Country', name: 'France' },
    availableLanguage: ['fr-FR'],
    knowsAbout: [
      'Photovoltaïque professionnel',
      'Autoconsommation solaire',
      'Performance énergétique des entreprises',
      'Gestion technique du bâtiment',
      'CVC et pompes à chaleur',
      'Froid industriel et commercial',
      'Isolation thermique',
      'Certificats d’économies d’énergie',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Solutions de performance énergétique',
      itemListElement: [
        'Photovoltaïque professionnel en autofinancement',
        'Gestion technique du bâtiment et pilotage énergétique',
        'CVC et pompes à chaleur',
        'Froid industriel et commercial',
        'Isolation thermique et calorifugeage',
        'Récupération de chaleur',
        'Financement CEE',
      ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
    address: contact?.address ? {
      '@type': 'PostalAddress',
      streetAddress: contact.address.split(',')[0]?.trim(),
      postalCode: contact.address.match(/\b\d{5}\b/)?.[0],
      addressLocality: 'Paris',
      addressCountry: 'FR',
    } : undefined,
    geo: contact?.geo ? {
      '@type': 'GeoCoordinates',
      latitude: contact.geo.latitude,
      longitude: contact.geo.longitude,
    } : undefined,
  };
}

export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path ? absoluteUrl(item.path) : undefined,
    })),
  };
}

export function itemListSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(item.path),
      name: item.name,
    })),
  };
}

export function articleSchema(post, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.cover_image_url ? absoluteUrl(post.cover_image_url) : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: post.author_name || siteConfig.name },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/brand-mark.webp') },
    },
    articleSection: post.category?.name,
    keywords: (post.tags || []).join(', ') || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
  };
}

export function caseStudySchema(item, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.seo_title || item.title,
    description: item.seo_description || item.summary,
    image: item.cover_image_url ? absoluteUrl(item.cover_image_url) : undefined,
    datePublished: item.published_at,
    about: item.sector,
    keywords: (item.tags || []).join(', ') || undefined,
    publisher: { '@type': 'Organization', name: siteConfig.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
  };
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base() || absoluteUrl('/')}/#website`,
    name: siteConfig.name,
    url: base() || undefined,
    inLanguage: 'fr-FR',
    description: siteConfig.description,
    publisher: { '@id': `${base() || absoluteUrl('/')}/#organization` },
  };
}

export function webPageSchema({ name, description, path, about = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: 'fr-FR',
    isPartOf: { '@type': 'WebSite', '@id': `${base() || absoluteUrl('/')}/#website` },
    about: about.map((item) => ({ '@type': 'Thing', name: item })),
  };
}
