import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getOpenAIAdsConsent,
  initOpenAIAdsPixel,
  OPENAI_ADS_CONSENT_EVENT,
  setOpenAIAdsConsent,
} from '../services/openaiAdsPixel';

function useMeasurementConsent() {
  const [consent, setConsent] = useState(undefined);

  useEffect(() => {
    initOpenAIAdsPixel();
    setConsent(getOpenAIAdsConsent());
    const update = (event) => setConsent(event.detail);
    window.addEventListener(OPENAI_ADS_CONSENT_EVENT, update);
    return () => window.removeEventListener(OPENAI_ADS_CONSENT_EVENT, update);
  }, []);

  const choose = (granted) => {
    setOpenAIAdsConsent(granted);
    setConsent(granted ? 'granted' : 'denied');
  };

  return [consent, choose];
}

export function MeasurementConsentBanner() {
  const [consent, choose] = useMeasurementConsent();
  if (consent !== null) return null;

  return (
    <aside className="measurement-consent" aria-label="Préférences de cookies">
      <div>
        <strong>Vos préférences de cookies</strong>
        <p>Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies optionnels de mesure. Vous pouvez modifier votre choix à tout moment. <Link to="/gestion-des-cookies">Politique de cookies</Link>.</p>
      </div>
      <div className="measurement-consent-actions">
        <button type="button" className="button secondary" onClick={() => choose(false)}>Tout refuser</button>
        <button type="button" className="button" onClick={() => choose(true)}>Tout accepter</button>
      </div>
    </aside>
  );
}

export function MeasurementConsentControls() {
  const [consent, choose] = useMeasurementConsent();
  return (
    <div className="measurement-consent-controls">
      <p><strong>Choix actuel :</strong> {consent === 'granted' ? 'mesure autorisée' : consent === 'denied' ? 'mesure refusée' : 'aucun choix enregistré'}.</p>
      <div className="measurement-consent-actions">
        <button type="button" className="button secondary" onClick={() => choose(false)}>Refuser les cookies optionnels</button>
        <button type="button" className="button" onClick={() => choose(true)}>Accepter les cookies optionnels</button>
      </div>
    </div>
  );
}
