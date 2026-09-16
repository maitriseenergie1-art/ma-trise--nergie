import { createSubmissionAttempt } from '../../services/submissionAttempt';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { contactService } from '../../services/contactService';
import { trackEvent } from '../../services/analyticsService';
import { isValidEmail, isValidPhone } from '../../utils/validators';

const projectTypes = {
  etude: 'Étude énergétique',
  travaux: 'Travaux',
  pilotage: 'Pilotage',
  financement: 'Financement',
};

const firstError = (errors) => Object.keys(errors)[0];
const backendErrorMessages = {
  email: ['email', 'Renseignez un email valide.'],
  firstName: ['firstName', 'Renseignez un prénom valide.'],
  lastName: ['lastName', 'Renseignez un nom valide.'],
  companyName: ['company', 'Le nom de l’entreprise est trop long.'],
  phone: ['phone', 'Le numéro de téléphone est trop long.'],
  projectType: ['need', 'Choisissez un type de besoin valide.'],
  message: ['message', 'Le message est trop long.'],
  consent: ['privacy', 'Votre accord est nécessaire pour transmettre la demande.'],
};

function mapBackendErrors(fields = {}) {
  return Object.entries(fields).reduce((mapped, [field]) => {
    const entry = backendErrorMessages[field];
    if (entry) mapped[entry[0]] = entry[1];
    return mapped;
  }, {});
}

export function ContactForm(){
  const formRef = useRef(null);
  const submittingRef = useRef(false);
  const attemptRef = useRef(null);
  if (!attemptRef.current) attemptRef.current = createSubmissionAttempt();
  const [status,setStatus]=useState('idle');
  const [error,setError]=useState('');
  const [fieldErrors,setFieldErrors]=useState({});

  const focusField = (name) => requestAnimationFrame(()=>formRef.current?.querySelector(`[name="${name}"]`)?.focus());
  const validate = (values) => {
    const errors = {};
    if (!values.firstName || values.firstName.length > 100) errors.firstName = 'Renseignez un prénom de moins de 100 caractères.';
    if (!values.lastName || values.lastName.length > 100) errors.lastName = 'Renseignez un nom de moins de 100 caractères.';
    if (!values.email || !isValidEmail(values.email)) errors.email = 'Renseignez une adresse email valide (avec @).';
    if (!values.company || values.company.length > 180) errors.company = 'Renseignez le nom de votre entreprise.';
    if (!values.phone || !isValidPhone(values.phone)) errors.phone = 'Renseignez un numéro de téléphone valide à 10 chiffres.';
    if (!values.need) errors.need = 'Choisissez un type de besoin.';
    if (!values.message || values.message.length > 4000) errors.message = 'Décrivez brièvement votre besoin.';
    if (!values.privacy) errors.privacy = 'Votre accord est nécessaire pour transmettre la demande.';
    return errors;
  };

  const submit=async(event)=>{
    event.preventDefault();
    if (submittingRef.current) return;
    const fields=new FormData(event.currentTarget);
    const values={
      firstName:String(fields.get('firstName')||'').trim(),
      lastName:String(fields.get('lastName')||'').trim(),
      company:String(fields.get('company')||'').trim(),
      phone:String(fields.get('phone')||'').trim(),
      email:String(fields.get('email')||'').trim(),
      need:String(fields.get('need')||''),
      message:String(fields.get('message')||'').trim(),
      privacy:fields.get('privacy') === 'on',
      website:String(fields.get('website')||''),
    };
    const errors=validate(values);
    if (Object.keys(errors).length){
      setFieldErrors(errors);
      setError('Certaines informations doivent être corrigées avant l’envoi.');
      focusField(firstError(errors));
      return;
    }

    setError('');
    setFieldErrors({});
    submittingRef.current=true;
    setStatus('submitting');
    trackEvent('contact_submit_attempt',{sourceForm:'contact',projectType:projectTypes[values.need]});

    const result=await contactService.submit({
      submissionId:attemptRef.current.getId(),
      identity:{firstName:values.firstName,lastName:values.lastName,company:values.company,phone:values.phone,email:values.email},
      need:{projectType:projectTypes[values.need],message:values.message},
      consent:{privacy:values.privacy},
      website:values.website,
    });

    submittingRef.current=false;
    if (result.ok){
      attemptRef.current.confirm();
      trackEvent('contact_submit_success',{sourceForm:'contact',projectType:projectTypes[values.need]});
      setStatus('success');
      return;
    }

    const backendErrors=mapBackendErrors(result.fields);
    setFieldErrors(backendErrors);
    if (result.type==='validation') setError('Certaines informations doivent être corrigées avant l’envoi.');
    else if (result.type==='rate_limit') setError('Trop de tentatives ont été envoyées. Merci de patienter avant de réessayer.');
    else if (result.type==='network'||result.type==='timeout') setError('La demande n’a pas pu être transmise. Vérifiez votre connexion puis réessayez.');
    else if (result.type==='configuration') setError('Le service d’envoi n’est pas configuré pour le moment.');
    else setError('Une erreur est survenue lors de l’envoi. Merci de réessayer.');
    trackEvent('contact_submit_error',{sourceForm:'contact',reason:result.type||'unknown'});
    if (Object.keys(backendErrors).length) focusField(firstError(backendErrors));
    setStatus('error');
  };

  if(status==='success') return <div className="form-success" role="status" aria-live="polite"><h2>Demande transmise</h2><p>Votre demande a bien été transmise. Notre équipe pourra reprendre les informations communiquées pour étudier votre projet.</p></div>;

  const describedBy=(name)=>fieldErrors[name]?`${name}-error`:undefined;
  return <form ref={formRef} onSubmit={submit} noValidate><h2>Être rappelé</h2><div className="form-grid"><label htmlFor="contact-first-name">Prénom<input id="contact-first-name" name="firstName" maxLength="100" autoComplete="given-name" required aria-invalid={Boolean(fieldErrors.firstName)} aria-describedby={describedBy('firstName')}/>{fieldErrors.firstName&&<small id="firstName-error" className="field-error">{fieldErrors.firstName}</small>}</label><label htmlFor="contact-last-name">Nom<input id="contact-last-name" name="lastName" maxLength="100" autoComplete="family-name" required aria-invalid={Boolean(fieldErrors.lastName)} aria-describedby={describedBy('lastName')}/>{fieldErrors.lastName&&<small id="lastName-error" className="field-error">{fieldErrors.lastName}</small>}</label><label htmlFor="contact-company">Entreprise<input id="contact-company" name="company" maxLength="180" autoComplete="organization" required aria-invalid={Boolean(fieldErrors.company)} aria-describedby={describedBy('company')}/>{fieldErrors.company&&<small id="company-error" className="field-error">{fieldErrors.company}</small>}</label><label htmlFor="contact-phone">Téléphone<input id="contact-phone" name="phone" type="tel" inputMode="tel" maxLength="64" autoComplete="tel" placeholder="06 12 34 56 78" required aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={describedBy('phone')}/>{fieldErrors.phone&&<small id="phone-error" className="field-error">{fieldErrors.phone}</small>}</label><label className="full" htmlFor="contact-email">Email<input id="contact-email" name="email" type="email" maxLength="254" autoComplete="email" required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={describedBy('email')}/>{fieldErrors.email&&<small id="email-error" className="field-error">{fieldErrors.email}</small>}</label><label className="full" htmlFor="contact-need">Type de besoin<select id="contact-need" name="need" defaultValue="" aria-invalid={Boolean(fieldErrors.need)} aria-describedby={describedBy('need')}><option value="">Choisir un sujet</option><option value="etude">Étude énergétique</option><option value="travaux">Travaux</option><option value="pilotage">Pilotage</option><option value="financement">Financement</option></select>{fieldErrors.need&&<small id="need-error" className="field-error">{fieldErrors.need}</small>}</label><label className="full" htmlFor="contact-message">Message<textarea id="contact-message" name="message" rows="4" maxLength="4000" required aria-invalid={Boolean(fieldErrors.message)} aria-describedby={describedBy('message')}/>{fieldErrors.message&&<small id="message-error" className="field-error">{fieldErrors.message}</small>}</label></div><div className="contact-trap" aria-hidden="true"><label htmlFor="contact-website">Votre site web<input id="contact-website" name="website" type="url" tabIndex="-1" autoComplete="off"/></label></div><label className="privacy"><input name="privacy" type="checkbox" aria-invalid={Boolean(fieldErrors.privacy)} aria-describedby={describedBy('privacy')}/> J’ai lu l’information relative à l’utilisation de mes données dans la <Link to="/politique-de-confidentialite">politique de confidentialité</Link>.</label>{fieldErrors.privacy&&<small id="privacy-error" className="field-error">{fieldErrors.privacy}</small>}<div aria-live="assertive">{error&&<p className="error" role="alert">{error}</p>}</div><Button type="submit" sourceCta="contact_submit" disabled={status==='submitting'} aria-disabled={status==='submitting'}>{status==='submitting'?'Envoi en cours…':'Être rappelé'}</Button><p className="calendly">Ou choisir directement un rendez-vous<br/><span>Emplacement réservé à une future intégration Calendly.</span></p></form>;
}
