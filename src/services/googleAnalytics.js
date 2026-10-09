import { getOpenAIAdsConsent, OPENAI_ADS_CONSENT_EVENT } from './openaiAdsPixel';

// Google Analytics 4 (balise gtag.js). Le script n'est chargé qu'après le
// « Tout accepter » du bandeau de cookies (même choix que les autres mesures
// optionnelles) ; en cas de refus ou de retrait, rien n'est chargé / envoyé.
const MEASUREMENT_ID = 'G-P79WQK7ET3';

const hasBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
let loaded = false;

function gtag() {
  window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
}

function load() {
  if (loaded) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || gtag;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.gtag('js', new Date());
  // Site en SPA : les pages vues sont envoyées à chaque changement de route.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
  loaded = true;
}

export function trackGaPageView(path) {
  if (!hasBrowser() || getOpenAIAdsConsent() !== 'granted') return;
  window[`ga-disable-${MEASUREMENT_ID}`] = false;
  load();
  window.gtag('event', 'page_view', {
    page_path: path || window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
}

// Au changement de choix : désactive l'envoi si refus, ou envoie la page courante si accord.
export function initGoogleAnalyticsConsent() {
  if (!hasBrowser()) return () => {};
  const onChange = (event) => {
    if (event.detail === 'granted') {
      if (!window.location.pathname.startsWith('/admin')) trackGaPageView();
    } else {
      window[`ga-disable-${MEASUREMENT_ID}`] = true;
    }
  };
  window.addEventListener(OPENAI_ADS_CONSENT_EVENT, onChange);
  return () => window.removeEventListener(OPENAI_ADS_CONSENT_EVENT, onChange);
}
