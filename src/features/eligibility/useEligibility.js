import { createSubmissionAttempt } from '../../services/submissionAttempt';
import { useEffect, useRef, useState } from 'react';
import { eligibilitySteps } from './steps';
import { readSession, writeSession } from '../../utils/storage';
import { updateAcquisitionContext } from '../../services/acquisition';
import { trackEvent } from '../../services/analyticsService';
import { eligibilityService } from '../../services/eligibilityService';

const DRAFT_KEY = 'me-eligibility-draft-v2';
const initial = () => readSession(DRAFT_KEY, { step: 0, values: {}, done: false });
const emailPattern = /^\S+@\S+\.\S+$/;

const backendFieldMessages = {
  firstName: ['firstName', 'Renseignez un prénom valide.'],
  lastName: ['lastName', 'Renseignez un nom valide.'],
  email: ['email', 'Renseignez un email valide.'],
  companyName: ['company', 'Le nom de l’entreprise est trop long.'],
  phone: ['phone', 'Le numéro de téléphone est trop long.'],
  sector: ['building', 'Choisissez un type de site valide.'],
  buildingType: ['building', 'Choisissez un type de site valide.'],
  siteSize: ['size', 'Choisissez une taille de site valide.'],
  projectType: ['project', 'Choisissez un besoin valide.'],
  equipment: ['equipment', 'Choisissez un équipement concerné.'],
  projectTimeline: ['timeline', 'Choisissez un calendrier valide.'],
  consent: ['privacy', 'Votre accord est nécessaire pour transmettre la demande.'],
};

const mapBackendErrors = (fields = {}) => Object.entries(fields).reduce((mapped, [field]) => {
  const entry = backendFieldMessages[field];
  if (entry) mapped[entry[0]] = entry[1];
  return mapped;
}, {});

const firstError = (errors) => Object.keys(errors)[0];

export function useEligibility() {
  const draft = initial();
  const [step, setStep] = useState(draft.step || 0);
  const [values, setValues] = useState(draft.values || {});
  const [done, setDone] = useState(Boolean(draft.done));
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [focusTarget, setFocusTarget] = useState('');
  const submittingRef = useRef(false);
  const attemptRef = useRef(null);
  if (!attemptRef.current) attemptRef.current = createSubmissionAttempt(draft.done ? null : draft.submissionId || null);
  const submissionIdRef = useRef(draft.done ? null : draft.submissionId || null);
  const current = eligibilitySteps[step];

  useEffect(() => {
    trackEvent('eligibility_started', {});
  }, []);

  useEffect(() => {
    writeSession(DRAFT_KEY, { step, values, done, submissionId: submissionIdRef.current });
    updateAcquisitionContext({ sectorInterest: values.building });
  }, [step, values, done]);

  const setValue = (field, value) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setFieldErrors((currentErrors) => {
      const { [field]: removed, ...remaining } = currentErrors;
      return remaining;
    });
    setError('');
  };

  const validateCurrent = () => {
    if (current.type === 'choice') {
      return values[current.field] ? {} : { [current.field]: 'Choisissez une réponse pour continuer.' };
    }

    const errors = {};
    const firstName = values.firstName?.trim() || '';
    const lastName = values.lastName?.trim() || '';
    const email = values.email?.trim() || '';
    const company = values.company?.trim() || '';
    const phone = values.phone?.trim() || '';

    if (!firstName || firstName.length > 100) errors.firstName = 'Renseignez un prénom de moins de 100 caractères.';
    if (!lastName || lastName.length > 100) errors.lastName = 'Renseignez un nom de moins de 100 caractères.';
    if (!email || email.length > 254 || !emailPattern.test(email)) errors.email = 'Renseignez un email valide.';
    if (company.length > 180) errors.company = 'Le nom de l’entreprise est trop long.';
    if (phone.length > 64) errors.phone = 'Le numéro de téléphone est trop long.';
    if (!values.privacy) errors.privacy = 'Votre accord est nécessaire pour transmettre la demande.';
    return errors;
  };

  const next = async () => {
    if (submittingRef.current) return;

    const errors = validateCurrent();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setFocusTarget(firstError(errors));
      setError(current.type === 'choice' ? 'Choisissez une réponse pour continuer.' : 'Certaines informations doivent être corrigées avant l’envoi.');
      return;
    }

    setError('');
    setFieldErrors({});
    setFocusTarget('');
    trackEvent('eligibility_step_completed', { step: step + 1, answerType: current.field });

    if (step < eligibilitySteps.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    submittingRef.current = true;
    setStatus('submitting');
    trackEvent('eligibility_submit_attempt', {
      sourceForm: 'eligibility',
      siteType: values.building,
      equipment: values.equipment,
      projectType: values.project,
    });

    submissionIdRef.current = attemptRef.current.getId();
    // Persist with the existing draft before fetch, including when the response is lost.
    writeSession(DRAFT_KEY, { step, values, done: false, submissionId: submissionIdRef.current });
    const result = await eligibilityService.submit(values, submissionIdRef.current);
    submittingRef.current = false;

    if (result.ok) {
      attemptRef.current.confirm();
      submissionIdRef.current = null;
      writeSession(DRAFT_KEY, { step, values, done: true, submissionId: null });
      trackEvent('eligibility_submit_success', {
        sourceForm: 'eligibility',
        siteType: values.building,
        equipment: values.equipment,
        projectType: values.project,
      });
      trackEvent('eligibility_completed', {});
      setDone(true);
      setStatus('idle');
      return;
    }

    const backendErrors = mapBackendErrors(result.fields);
    setFieldErrors(backendErrors);
    if (result.type === 'validation') setError('Certaines informations doivent être corrigées avant l’envoi.');
    else if (result.type === 'rate_limit') setError('Trop de tentatives ont été envoyées. Merci de patienter avant de réessayer.');
    else if (result.type === 'network' || result.type === 'timeout') setError('La demande n’a pas pu être transmise. Vérifiez votre connexion puis réessayez.');
    else if (result.type === 'configuration') setError('Le service d’envoi n’est pas configuré pour le moment.');
    else setError('Une erreur est survenue lors de l’envoi. Merci de réessayer.');
    trackEvent('eligibility_submit_error', { sourceForm: 'eligibility', reason: result.type || 'unknown' });
    if (Object.keys(backendErrors).length) setFocusTarget(firstError(backendErrors));
    setStatus('error');
  };

  const previous = () => {
    if (submittingRef.current) return;
    setError('');
    setFieldErrors({});
    setFocusTarget('');
    setStep((currentStep) => Math.max(0, currentStep - 1));
  };

  return {
    step,
    values,
    done,
    status,
    error,
    fieldErrors,
    focusTarget,
    current,
    total: eligibilitySteps.length,
    setValue,
    next,
    previous,
  };
}
