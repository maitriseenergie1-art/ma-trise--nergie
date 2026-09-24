import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, MessageCircle, PhoneCall, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/siteConfig';
import { Turnstile } from '../../components/Turnstile';
import { createSubmissionAttempt } from '../../services/submissionAttempt';
import { trackEvent } from '../../services/analyticsService';
import { trackFormEvent } from '../../services/trafficTracking';
import { eligibilityService } from '../../services/eligibilityService';
import { isValidEmail, isValidPhone } from '../../utils/validators';

const SITE_TYPES = ['Site industriel', 'Bâtiment tertiaire', 'Entrepôt ou plateforme logistique', 'Commerce ou grande surface', 'Exploitation agricole'];
const SITE_SIZES = ['Moins de 2 000 m²', '2 000 à 5 000 m²', 'Plus de 5 000 m²'];
const MONTHLY_BILLS = ['Moins de 1 000 €', '1 000 à 2 500 €', '2 500 à 5 000 €', 'Plus de 5 000 €'];
const TIMELINES = ['Dès que possible', 'Dans les 3 à 6 mois', 'Dans les 6 à 12 mois', 'Projet à l’étude'];

const initialValues = {
  building: '', size: '', monthlyBill: '', postalCode: '', timeline: '',
  firstName: '', lastName: '', company: '', phone: '', email: '', privacy: false,
  turnstileToken: '', website: '',
};

export function FloatingContactHub() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const formButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const captchaRef = useRef(null);
  const attemptRef = useRef(null);
  const submittingRef = useRef(false);
  if (!attemptRef.current) attemptRef.current = createSubmissionAttempt();

  const phone = siteConfig.contact.phone.replace(/\s/g, '');
  const whatsappNumber = phone.replace(/^\+/, '');
  const whatsappText = encodeURIComponent('Bonjour, je souhaite échanger au sujet d’un projet de performance énergétique pour mon site professionnel.');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(true);
      trackEvent('floating_lead_opened', { trigger: 'automatic_4s' });
      trackFormEvent('form_view', { formType: 'floating_qualified_lead' });
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const { [name]: removed, ...remaining } = current;
      return remaining;
    });
    setError('');
  };

  const openPanel = () => {
    setOpen(true);
    trackEvent('floating_lead_opened', { trigger: 'icon' });
    trackFormEvent('form_view', { formType: 'floating_qualified_lead' });
    window.setTimeout(() => closeButtonRef.current?.focus(), 180);
  };

  const closePanel = () => {
    setOpen(false);
    formButtonRef.current?.focus();
  };

  const validateProject = () => {
    const next = {};
    if (!values.building) next.building = 'Sélectionnez le type de site.';
    if (!values.size) next.size = 'Sélectionnez la surface disponible.';
    if (!values.monthlyBill) next.monthlyBill = 'Sélectionnez votre facture mensuelle.';
    if (!/^\d{5}$/.test(values.postalCode.trim())) next.postalCode = 'Indiquez un code postal à 5 chiffres.';
    if (!values.timeline) next.timeline = 'Sélectionnez l’échéance du projet.';
    return next;
  };

  const validateContact = () => {
    const next = {};
    if (!values.firstName.trim()) next.firstName = 'Renseignez votre prénom.';
    if (!values.lastName.trim()) next.lastName = 'Renseignez votre nom.';
    if (!values.company.trim()) next.company = 'Renseignez votre entreprise.';
    if (!isValidPhone(values.phone.trim())) next.phone = 'Indiquez un mobile français valide.';
    if (!isValidEmail(values.email.trim())) next.email = 'Renseignez une adresse e-mail valide.';
    if (!values.turnstileToken) next.captcha = 'Validez la vérification anti-robot.';
    if (!values.privacy) next.privacy = 'Votre accord est nécessaire.';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (step === 0) {
      const next = validateProject();
      if (Object.keys(next).length) {
        setErrors(next);
        setError('Complétez les informations indiquées.');
        return;
      }
      setErrors({});
      setError('');
      setStep(1);
      trackEvent('floating_lead_step_completed', { step: 1 });
      return;
    }

    const next = validateContact();
    if (Object.keys(next).length) {
      setErrors(next);
      setError('Vérifiez les champs indiqués avant l’envoi.');
      return;
    }

    submittingRef.current = true;
    setStatus('submitting');
    setErrors({});
    setError('');
    const result = await eligibilityService.submit(values, attemptRef.current.getId(), 'floating_qualified_lead');
    submittingRef.current = false;
    captchaRef.current?.reset();

    if (result.ok) {
      attemptRef.current.confirm();
      setStatus('success');
      trackEvent('floating_lead_submit_success', {
        qualified: ['2 000 à 5 000 m²', 'Plus de 5 000 m²'].includes(values.size)
          && ['1 000 à 2 500 €', '2 500 à 5 000 €', 'Plus de 5 000 €'].includes(values.monthlyBill),
      });
      trackFormEvent('form_submit', { formType: 'floating_qualified_lead' });
      return;
    }

    setStatus('error');
    setError(result.type === 'rate_limit'
      ? 'Trop de tentatives. Patientez quelques instants avant de réessayer.'
      : 'L’envoi n’a pas abouti. Vérifiez votre connexion puis réessayez.');
  };

  const field = (name, label, props = {}) => (
    <label htmlFor={`floating-${name}`}>
      {label}
      <input
        id={`floating-${name}`}
        name={name}
        value={values[name]}
        onChange={(event) => setValue(name, event.target.value)}
        aria-invalid={Boolean(errors[name])}
        {...props}
      />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );

  const select = (name, label, options) => (
    <label htmlFor={`floating-${name}`}>
      {label}
      <select id={`floating-${name}`} name={name} value={values[name]} onChange={(event) => setValue(name, event.target.value)} aria-invalid={Boolean(errors[name])}>
        <option value="">Sélectionner</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );

  return (
    <aside className={`floating-contact ${open ? 'is-open' : ''}`} aria-label="Contact rapide">
      <section id="floating-lead-panel" className="floating-lead-panel" role="dialog" aria-modal="false" aria-labelledby="floating-lead-title" aria-hidden={!open}>
        <div className="floating-lead-head">
          <div>
            <span>Étape {step + 1} sur 2</span>
            <h2 id="floating-lead-title">{status === 'success' ? 'Demande transmise' : step === 0 ? 'Votre site est-il éligible ?' : 'Comment vous recontacter ?'}</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="floating-lead-close" onClick={closePanel} aria-label="Fermer le formulaire"><X /></button>
        </div>

        {status === 'success' ? (
          <div className="floating-lead-success" role="status">
            <CheckCircle2 />
            <p>Merci. Votre projet a bien été transmis à notre équipe pour étude.</p>
            <button type="button" className="button" onClick={closePanel}>Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="floating-lead-progress" aria-hidden="true"><i style={{ width: step === 0 ? '50%' : '100%' }} /></div>
            {step === 0 ? (
              <div className="floating-lead-fields">
                <p className="floating-lead-intro">Préqualification pour les sites dès <strong>2 000 m²</strong> et <strong>1 000 € d’électricité par mois</strong>.</p>
                {select('building', 'Type de site', SITE_TYPES)}
                {select('size', 'Surface disponible', SITE_SIZES)}
                {select('monthlyBill', 'Facture d’électricité mensuelle', MONTHLY_BILLS)}
                <div className="floating-lead-row">
                  {field('postalCode', 'Code postal du site', { inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 5, placeholder: '75009' })}
                  {select('timeline', 'Échéance du projet', TIMELINES)}
                </div>
              </div>
            ) : (
              <div className="floating-lead-fields">
                <div className="floating-lead-row">
                  {field('firstName', 'Prénom', { autoComplete: 'given-name', maxLength: 100 })}
                  {field('lastName', 'Nom', { autoComplete: 'family-name', maxLength: 100 })}
                </div>
                {field('company', 'Entreprise', { autoComplete: 'organization', maxLength: 180 })}
                <div className="floating-lead-row">
                  {field('phone', 'Téléphone mobile', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 64, placeholder: '06 12 34 56 78' })}
                  {field('email', 'E-mail professionnel', { type: 'email', autoComplete: 'email', maxLength: 254 })}
                </div>
                <div className="contact-trap" aria-hidden="true"><input name="website" tabIndex="-1" autoComplete="off" value={values.website} onChange={(event) => setValue('website', event.target.value)} /></div>
                <Turnstile ref={captchaRef} action="floating_lead" onTokenChange={(token) => setValue('turnstileToken', token)} />
                {errors.captcha && <small className="field-error">{errors.captcha}</small>}
                <label className="floating-lead-privacy">
                  <input type="checkbox" checked={values.privacy} onChange={(event) => setValue('privacy', event.target.checked)} aria-invalid={Boolean(errors.privacy)} />
                  <span>J’accepte d’être recontacté au sujet de mon projet. <Link to="/politique-de-confidentialite">Confidentialité</Link></span>
                </label>
                {errors.privacy && <small className="field-error">{errors.privacy}</small>}
              </div>
            )}
            <div aria-live="assertive">{error && <p className="floating-lead-error" role="alert">{error}</p>}</div>
            <div className="floating-lead-actions">
              {step === 1 ? <button type="button" className="floating-lead-back" onClick={() => { setStep(0); setError(''); }}><ArrowLeft /> Retour</button> : <span />}
              <button type="submit" className="button" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Envoi…' : step === 0 ? <>Continuer <ArrowRight /></> : 'Recevoir mon étude'}
              </button>
            </div>
          </form>
        )}
      </section>

      <nav className="floating-contact-actions" aria-label="Actions de contact">
        <button ref={formButtonRef} className="floating-contact-button is-form" type="button" onClick={open ? closePanel : openPanel} aria-expanded={open} aria-controls="floating-lead-panel" aria-label={open ? 'Fermer le formulaire' : 'Ouvrir le formulaire de projet'} data-label="Mon projet"><ClipboardCheck /></button>
        <a className="floating-contact-button is-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noreferrer" aria-label="Écrire sur WhatsApp" data-label="WhatsApp" onClick={() => trackEvent('whatsapp_clicked', { channel: 'floating_contact' })}><MessageCircle /></a>
        <a className="floating-contact-button is-phone" href={`tel:${phone}`} aria-label={`Appeler le ${siteConfig.contact.phone}`} data-label="Appeler" onClick={() => trackEvent('phone_clicked', { channel: 'floating_contact' })}><PhoneCall /></a>
      </nav>
    </aside>
  );
}
