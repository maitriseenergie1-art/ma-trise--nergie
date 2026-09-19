import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Turnstile } from '../../components/Turnstile';
import { renovationTypeLabels, renovationTypes } from '../forms/renovationTypes';
import { contactService } from '../../services/contactService';
import { createSubmissionAttempt } from '../../services/submissionAttempt';
import { isValidEmail, isValidPhone } from '../../utils/validators';

export function ContactForm() {
  const captchaRef = useRef(null); const attemptRef = useRef(null); if (!attemptRef.current) attemptRef.current = createSubmissionAttempt();
  const [status, setStatus] = useState('idle'); const [error, setError] = useState(''); const [errors, setErrors] = useState({});
  const submit = async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const values = Object.fromEntries(['firstName','lastName','company','phone','email','need','turnstileToken','website'].map(k => [k,String(form.get(k)||'').trim()])); values.privacy = form.get('privacy') === 'on';
    const next = {};
    if (!values.firstName) next.firstName = 'Renseignez votre prénom.'; if (!values.lastName) next.lastName = 'Renseignez votre nom.'; if (!values.company) next.company = 'Renseignez votre entreprise.';
    if (!values.phone || !isValidPhone(values.phone)) next.phone = 'Indiquez un mobile français : 06, 07, +336 ou +337.';
    if (!values.email || !isValidEmail(values.email)) next.email = 'Renseignez une adresse email valide.';
    if (!renovationTypeLabels[values.need]) next.need = 'Choisissez précisément le type de rénovation.';
    if (!values.turnstileToken) next.captcha = 'Validez la vérification anti-robot.'; if (!values.privacy) next.privacy = 'Votre accord est nécessaire.';
    if (Object.keys(next).length) { setErrors(next); setError('Vérifiez les champs indiqués.'); return; }
    setErrors({}); setError(''); setStatus('submitting');
    const result = await contactService.submit({ submissionId: attemptRef.current.getId(), identity: values, need: { projectType: renovationTypeLabels[values.need] }, consent: { privacy: values.privacy }, website: values.website, captchaToken: values.turnstileToken });
    captchaRef.current?.reset();
    if (result.ok) { attemptRef.current.confirm(); setStatus('success'); return; }
    setError(result.type === 'validation' ? 'Certaines informations doivent être corrigées.' : 'La demande n’a pas pu être transmise. Réessayez.'); setStatus('error');
  };
  if (status === 'success') return <div className="form-success" role="status"><h2>Demande transmise</h2><p>Votre demande a bien été transmise. Notre équipe vous recontactera.</p></div>;
  const field = (name,label,props={}) => <label htmlFor={`contact-${name}`}>{label}<input id={`contact-${name}`} name={name} required {...props}/>{errors[name]&&<small className="field-error">{errors[name]}</small>}</label>;
  return <form onSubmit={submit} noValidate><h2>Être rappelé</h2><div className="form-grid">{field('firstName','Prénom',{maxLength:100,autoComplete:'given-name'})}{field('lastName','Nom',{maxLength:100,autoComplete:'family-name'})}{field('company','Entreprise',{maxLength:180,autoComplete:'organization'})}{field('phone','Téléphone mobile',{type:'tel',inputMode:'tel',maxLength:64,autoComplete:'tel',placeholder:'06 12 34 56 78 ou +33 6…'})}{field('email','E-mail',{type:'email',maxLength:254,autoComplete:'email'})}<label className="full">Type de rénovation<select name="need" defaultValue="" required><option value="">Choisir précisément votre besoin</option>{renovationTypes.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>{errors.need&&<small className="field-error">{errors.need}</small>}</label></div><div className="contact-trap" aria-hidden="true"><input name="website" tabIndex="-1" autoComplete="off"/></div><Turnstile ref={captchaRef} action="contact"/>{errors.captcha&&<small className="field-error">{errors.captcha}</small>}<label className="privacy"><input name="privacy" type="checkbox"/>J’ai lu l’information relative à l’utilisation de mes données dans la <Link to="/politique-de-confidentialite">politique de confidentialité</Link>.</label>{errors.privacy&&<small className="field-error">{errors.privacy}</small>}<div aria-live="assertive">{error&&<p className="error" role="alert">{error}</p>}</div><Button type="submit" sourceCta="contact_submit" disabled={status==='submitting'}>{status==='submitting'?'Envoi en cours…':'Être rappelé'}</Button></form>;
}
