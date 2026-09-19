import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Turnstile } from '../../components/Turnstile';
import { renovationTypeFromSolution, renovationTypeLabels, renovationTypes } from '../forms/renovationTypes';
import { createSubmissionAttempt } from '../../services/submissionAttempt';
import { trackEvent } from '../../services/analyticsService';
import { trackFormEvent } from '../../services/trafficTracking';
import { resolveVariant } from './quickLeadConfig';
import { submitQuickLead } from './quickLeadService';
import { isValidEmail, isValidPhone } from '../../utils/validators';

export function QuickLeadForm({ variant = 'generic', context = {}, heading, text, dense = false }) {
  const config = resolveVariant(variant); const captchaRef = useRef(null); const attemptRef = useRef(null); const submittingRef = useRef(false);
  if (!attemptRef.current) attemptRef.current = createSubmissionAttempt();
  const [status, setStatus] = useState('idle'); const [error, setError] = useState(''); const [errors, setErrors] = useState({});
  useEffect(() => { trackFormEvent('form_view', { formType: `quick_${variant}` }); }, [variant]);
  const submit = async (event) => {
    event.preventDefault(); if (submittingRef.current) return;
    const data = new FormData(event.currentTarget); const values = Object.fromEntries(['firstName','lastName','company','email','phone','need','turnstileToken','website'].map(k => [k, String(data.get(k) || '').trim()])); values.privacy = data.get('privacy') === 'on';
    const next = {};
    if (!values.firstName) next.firstName = 'Renseignez votre prénom.'; if (!values.lastName) next.lastName = 'Renseignez votre nom.'; if (!values.company) next.company = 'Renseignez votre entreprise.';
    if (!values.phone || !isValidPhone(values.phone)) next.phone = 'Indiquez un mobile français : 06, 07, +336 ou +337.';
    if (!values.email || !isValidEmail(values.email)) next.email = 'Renseignez une adresse email valide.';
    if (!renovationTypeLabels[values.need]) next.need = 'Choisissez précisément le type de rénovation.';
    if (!values.turnstileToken) next.captcha = 'Validez la vérification anti-robot.'; if (!values.privacy) next.privacy = 'Votre accord est nécessaire.';
    if (Object.keys(next).length) { setErrors(next); setError('Vérifiez les champs indiqués.'); return; }
    setErrors({}); setError(''); submittingRef.current = true; setStatus('submitting'); const projectType = renovationTypeLabels[values.need];
    const result = await submitQuickLead({ submissionId: attemptRef.current.getId(), variant, context: { ...context, projectType }, identity: values, consent: values.privacy, website: values.website, captchaToken: values.turnstileToken });
    submittingRef.current = false; captchaRef.current?.reset();
    if (result.ok) { attemptRef.current.confirm(); trackEvent('contact_submit_success', { sourceForm: 'landing_page', projectType }); trackFormEvent('form_submit', { formType: `quick_${variant}` }); setStatus('success'); return; }
    setError(result.type === 'validation' ? 'Certaines informations doivent être corrigées.' : result.type === 'rate_limit' ? 'Trop de tentatives. Merci de patienter.' : 'L’envoi a échoué. Réessayez.'); setStatus('error');
  };
  if (status === 'success') return <div className={`quick-lead${dense ? ' dense' : ''}`}><div className="form-success" role="status"><h3>Demande transmise</h3><p>Merci. Nous revenons vers vous rapidement.</p></div></div>;
  const field = (name, label, props = {}) => <label htmlFor={`ql-${name}-${variant}`}>{label}<input id={`ql-${name}-${variant}`} name={name} required {...props}/>{errors[name] && <small className="field-error">{errors[name]}</small>}</label>;
  return <form className={`quick-lead${dense ? ' dense' : ''}`} onSubmit={submit} noValidate><h3>{heading || config.heading}</h3><p className="quick-lead-text">{text || config.text}</p><div className="form-grid">{field('firstName','Prénom',{maxLength:100,autoComplete:'given-name'})}{field('lastName','Nom',{maxLength:100,autoComplete:'family-name'})}{field('company','Entreprise',{maxLength:180,autoComplete:'organization'})}{field('phone','Téléphone mobile',{type:'tel',inputMode:'tel',maxLength:64,autoComplete:'tel',placeholder:'06 12 34 56 78 ou +33 6…'})}{field('email','E-mail',{type:'email',maxLength:254,autoComplete:'email'})}<label className="full">Type de rénovation<select name="need" defaultValue={renovationTypeFromSolution(context.solutionSlug)} required><option value="">Choisir précisément votre besoin</option>{renovationTypes.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>{errors.need&&<small className="field-error">{errors.need}</small>}</label></div><div className="contact-trap" aria-hidden="true"><input name="website" tabIndex="-1" autoComplete="off"/></div><Turnstile ref={captchaRef} action="lead"/>{errors.captcha&&<small className="field-error">{errors.captcha}</small>}<label className="privacy"><input name="privacy" type="checkbox"/>J’accepte que mes coordonnées soient utilisées pour être recontacté (voir la <Link to="/politique-de-confidentialite">politique de confidentialité</Link>).</label>{errors.privacy&&<small className="field-error">{errors.privacy}</small>}<div aria-live="assertive">{error&&<p className="error" role="alert">{error}</p>}</div><Button type="submit" sourceCta={`quick_${variant}_submit`} disabled={status==='submitting'}>{status==='submitting'?'Envoi…':config.cta}</Button></form>;
}
