import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT; script.async = true; script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export const Turnstile = forwardRef(function Turnstile({ action = 'lead', onTokenChange }, ref) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const elementRef = useRef(null);
  const widgetRef = useRef(null);
  const [token, setToken] = useState('');
  const [failed, setFailed] = useState(false);
  const reset = useCallback(() => {
    setToken('');
    if (widgetRef.current !== null && window.turnstile) window.turnstile.reset(widgetRef.current);
  }, []);
  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (!siteKey) return undefined;
    let active = true;
    loadTurnstile().then((turnstile) => {
      if (!active || !turnstile || !elementRef.current) return;
      widgetRef.current = turnstile.render(elementRef.current, {
        sitekey: siteKey, action, theme: 'light', appearance: 'always', size: 'flexible',
        callback: (value) => { if (active) { setToken(value); onTokenChange?.(value); setFailed(false); } },
        'expired-callback': () => { if (active) { setToken(''); onTokenChange?.(''); } },
        'error-callback': () => { if (active) { setToken(''); setFailed(true); } },
      });
    }).catch(() => active && setFailed(true));
    return () => { active = false; if (widgetRef.current !== null && window.turnstile) window.turnstile.remove(widgetRef.current); };
  }, [action, siteKey]);

  return <div className="turnstile-captcha"><p>Vérification anti-robot requise avant l’envoi</p><div ref={elementRef}/><input name="turnstileToken" type="hidden" value={token} readOnly />{!siteKey && <small className="field-error">La vérification anti-robot est indisponible. Réessayez plus tard.</small>}{failed && <small className="field-error">La vérification anti-robot n’a pas pu être chargée. Réessayez.</small>}</div>;
});
