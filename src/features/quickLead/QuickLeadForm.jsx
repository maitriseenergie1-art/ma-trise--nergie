import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { createSubmissionAttempt } from '../../services/submissionAttempt';
import { trackEvent } from '../../services/analyticsService';
import { trackFormEvent } from '../../services/trafficTracking';
import { resolveVariant } from './quickLeadConfig';
import { submitQuickLead } from './quickLeadService';
import { isValidEmail, isValidPhone } from '../../utils/validators';

/**
 * Compact contextual conversion form.
 * @param {string} variant - key of QUICK_LEAD_VARIANTS
 * @param {object} context - { sector, solutionSlug, key, projectType? }
 */
export function QuickLeadForm({ variant = 'generic', context = {}, heading, text, dense = false }) {
  const config = resolveVariant(variant);
  const projectType = context.projectType || config.projectType;
  const formRef = useRef(null);
  const attemptRef = useRef(null);
  const submittingRef = useRef(false);
  if (!attemptRef.current) attemptRef.current = createSubmissionAttempt();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    trackFormEvent('form_view', { formType: `quick_${variant}` });
  }, [variant]);

  const submit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const data = new FormData(event.currentTarget);
    const values = {
      lastName: String(data.get('lastName') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      message: String(data.get('message') || '').trim(),
      privacy: data.get('privacy') === 'on',
      website: String(data.get('website') || ''),
    };
    const next = {};
    if (!values.lastName) next.lastName = 'Renseignez votre nom.';
    if (!values.phone || !isValidPhone(values.phone)) next.phone = 'Renseignez un numéro de téléphone valide à 10 chiffres.';
    if (!values.email || !isValidEmail(values.email)) next.email = 'Renseignez une adresse email valide (avec @).';
    if (!values.message) next.message = 'Décrivez brièvement votre besoin.';
    if (!values.privacy) next.privacy = 'Votre accord est nécessaire.';
    if (Object.keys(next).length) {
      setErrors(next);
      setError('Vérifiez les champs indiqués.');
      return;
    }

    setErrors({});
    setError('');
    submittingRef.current = true;
    setStatus('submitting');
    trackEvent('contact_submit_attempt', { sourceForm: 'landing_page', projectType });

    const result = await submitQuickLead({
      submissionId: attemptRef.current.getId(),
      variant,
      context: { ...context, projectType },
      identity: { lastName: values.lastName, email: values.email, phone: values.phone },
      message: values.message,
      consent: values.privacy,
      website: values.website,
    });

    submittingRef.current = false;
    if (result.ok) {
      attemptRef.current.confirm();
      trackEvent('contact_submit_success', { sourceForm: 'landing_page', projectType });
      trackFormEvent('form_submit', { formType: `quick_${variant}` });
      setStatus('success');
      return;
    }
    trackEvent('contact_submit_error', { sourceForm: 'landing_page', reason: result.type || 'unknown' });
    if (result.type === 'validation') setError('Certaines informations doivent être corrigées.');
    else if (result.type === 'rate_limit') setError('Trop de tentatives. Merci de patienter avant de réessayer.');
    else if (result.type === 'configuration') setError('Le service d’envoi n’est pas configuré pour le moment.');
    else setError('L’envoi a échoué. Vérifiez votre connexion puis réessayez.');
    setStatus('error');
  };

  if (status === 'success') {
    return (
      <div className={`quick-lead${dense ? ' dense' : ''}`}>
        <div className="form-success" role="status" aria-live="polite">
          <h3>Demande transmise</h3>
          <p>Merci. Nous revenons vers vous rapidement pour en parler.</p>
        </div>
      </div>
    );
  }

  const describedBy = (name) => (errors[name] ? `ql-${name}-error` : undefined);

  return (
    <form ref={formRef} className={`quick-lead${dense ? ' dense' : ''}`} onSubmit={submit} noValidate>
      <h3>{heading || config.heading}</h3>
      <p className="quick-lead-text">{text || config.text}</p>
      <div className="form-grid">
        <label htmlFor={`ql-name-${variant}`}>
          Nom
          <input id={`ql-name-${variant}`} name="lastName" maxLength="100" autoComplete="family-name" required
            aria-invalid={Boolean(errors.lastName)} aria-describedby={describedBy('lastName')} />
          {errors.lastName && <small id={`ql-lastName-error`} className="field-error">{errors.lastName}</small>}
        </label>
        <label htmlFor={`ql-phone-${variant}`}>
          Téléphone
          <input id={`ql-phone-${variant}`} name="phone" type="tel" inputMode="tel" maxLength="64" autoComplete="tel" placeholder="06 12 34 56 78" required
            aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} />
          {errors.phone && <small id={`ql-phone-error`} className="field-error">{errors.phone}</small>}
        </label>
        <label className="full" htmlFor={`ql-email-${variant}`}>
          E-mail
          <input id={`ql-email-${variant}`} name="email" type="email" maxLength="254" autoComplete="email" required
            aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} />
          {errors.email && <small id={`ql-email-error`} className="field-error">{errors.email}</small>}
        </label>
        <label className="full" htmlFor={`ql-message-${variant}`}>
          Votre besoin en une phrase
          <textarea id={`ql-message-${variant}`} name="message" rows="2" maxLength="4000" required
            aria-invalid={Boolean(errors.message)} aria-describedby={describedBy('message')} />
          {errors.message && <small id={`ql-message-error`} className="field-error">{errors.message}</small>}
        </label>
      </div>
      <div className="contact-trap" aria-hidden="true">
        <label htmlFor={`ql-website-${variant}`}>Votre site web
          <input id={`ql-website-${variant}`} name="website" type="url" tabIndex="-1" autoComplete="off" />
        </label>
      </div>
      <label className="privacy">
        <input name="privacy" type="checkbox" aria-invalid={Boolean(errors.privacy)} aria-describedby={describedBy('privacy')} />
        J’accepte que mes coordonnées soient utilisées pour être recontacté (voir la{' '}
        <Link to="/politique-de-confidentialite">politique de confidentialité</Link>).
      </label>
      {errors.privacy && <small id="ql-privacy-error" className="field-error">{errors.privacy}</small>}
      <div aria-live="assertive">{error && <p className="error" role="alert">{error}</p>}</div>
      <Button type="submit" sourceCta={`quick_${variant}_submit`} disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Envoi…' : config.cta}
      </Button>
    </form>
  );
}
