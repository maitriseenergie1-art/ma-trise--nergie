import { trackClick, trackFormEvent } from './trafficTracking';

// Suivi du parcours vers les formulaires, sans donnée personnelle (aucune valeur saisie).
// Tout repose sur l'attribut data-form-type posé sur chaque <form> :
//  - form_view  : le formulaire est réellement visible à l'écran (≥ 40 %)
//  - form_start : premier champ touché
//  - form_error : un message d'erreur de champ apparaît (target = type:champ)
//  - scroll     : profondeur de lecture de la page (25 / 50 / 75 / 100 %)
// Les événements annexes (début, étape, erreur, scroll) sont stockés comme « click » avec un
// target_kind dédié ; l'API stats les exclut du total des clics (voir ENGAGEMENT_KINDS).
const SELECTOR = '[data-form-type]';
const seen = new Set();
const once = (key) => { if (seen.has(key)) return false; seen.add(key); return true; };
const pathKey = () => window.location.pathname;

export const trackFormStart = (formType) => {
  if (once(`start:${formType}:${pathKey()}`)) trackClick({ target: formType, targetKind: 'form_start' });
};
export const trackFormStep = (formType, step) => {
  if (once(`step:${formType}:${step}`)) trackClick({ target: `${formType}:${step}`, targetKind: 'form_step' });
};

function watchViews(root) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const type = entry.target.dataset.formType;
      if (once(`view:${type}:${pathKey()}`)) trackFormEvent('form_view', { formType: type });
    });
  }, { threshold: 0.4 });
  const scan = (node) => {
    if (node.nodeType !== 1) return;
    if (node.matches?.(SELECTOR)) observer.observe(node);
    node.querySelectorAll?.(SELECTOR).forEach((el) => observer.observe(el));
  };
  scan(root);
  return scan;
}

function errorField(el) {
  const label = el.closest('label');
  return label?.querySelector('[name]')?.getAttribute('name') || el.closest('[data-field]')?.dataset.field || 'general';
}

export function initFormTracking() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  const scanForm = watchViews(document.body);

  document.addEventListener('focusin', (event) => {
    const form = event.target.closest?.(SELECTOR);
    if (form) trackFormStart(form.dataset.formType);
  });

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      scanForm(node);
      const errors = node.matches?.('.field-error') ? [node] : [...(node.querySelectorAll?.('.field-error') || [])];
      errors.forEach((el) => {
        const form = el.closest(SELECTOR);
        if (form) trackClick({ target: `${form.dataset.formType}:${errorField(el)}`, targetKind: 'form_error' });
      });
    }));
  }).observe(document.body, { childList: true, subtree: true });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable < 200 || window.location.pathname.startsWith('/admin')) return;
      const pct = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      [25, 50, 75, 100].forEach((mark) => {
        if (pct >= mark - 1 && once(`scroll:${pathKey()}:${mark}`)) trackClick({ target: String(mark), targetKind: 'scroll' });
      });
    });
  }, { passive: true });
}
