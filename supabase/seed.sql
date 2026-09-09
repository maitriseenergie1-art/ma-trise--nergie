-- Données fictives de démonstration uniquement. Aucun contact réel n'est utilisé.
insert into public.leads (
  tracking_id, first_name, last_name, email, phone, company_name, status, source_form
) values
  ('demo-ind-001', 'Démo', 'Industrie', 'demo-industrie@example.test', '+33000000001', 'Industrie Démonstration SAS', 'new', 'contact'),
  ('demo-log-002', 'Démo', 'Logistique', 'demo-logistique@example.test', '+33000000002', 'Logistique Démonstration SAS', 'qualified', 'eligibility'),
  ('demo-agro-003', 'Démo', 'Agroalimentaire', 'demo-agro@example.test', '+33000000003', 'Agro Démonstration SAS', 'proposal', 'landing_page'),
  ('demo-ter-004', 'Démo', 'Tertiaire', 'demo-tertiaire@example.test', '+33000000004', 'Tertiaire Démonstration SAS', 'won', 'campaign');

insert into public.lead_needs (
  lead_id, sector, building_type, site_size, project_type, solution_slug,
  equipment, project_timeline, message, qualification_score
)
select id, 'Industrie', 'Site de production', '10 000 à 25 000 m²', 'Optimisation des utilités', 'air-comprime',
  '["compresseurs", "sécheurs", "réseau de distribution"]'::jsonb, 'À étudier sous 6 mois',
  'Exemple fictif : analyse du réseau d’air comprimé.', 42
from public.leads where tracking_id = 'demo-ind-001'
union all
select id, 'Logistique', 'Entrepôt', '25 000 à 50 000 m²', 'Confort thermique', 'destratification-air',
  '["chauffage", "destratificateurs", "sondes de température"]'::jsonb, 'Projet en préparation',
  'Exemple fictif : étude de la répartition de chaleur.', 76
from public.leads where tracking_id = 'demo-log-002'
union all
select id, 'Agroalimentaire', 'Atelier de production', '5 000 à 10 000 m²', 'Froid industriel', 'regulation-froid',
  '["compresseurs", "condenseurs", "régulation"]'::jsonb, 'Travaux envisagés cette année',
  'Exemple fictif : optimisation d’une installation frigorifique.', 84
from public.leads where tracking_id = 'demo-agro-003'
union all
select id, 'Tertiaire', 'Bureaux', '2 000 à 5 000 m²', 'Pilotage énergétique', 'gtb',
  '["chauffage", "ventilation", "éclairage", "compteurs"]'::jsonb, 'Projet validé',
  'Exemple fictif : déploiement d’une supervision GTB.', 91
from public.leads where tracking_id = 'demo-ter-004';

insert into public.acquisitions (
  lead_id, landing_page, referrer, cta_source, utm_source, utm_medium, utm_campaign, gclid
)
select id, '/contact', 'https://example.test/recherche', 'header_contact', 'google', 'organic', 'demo-industrie', null
from public.leads where tracking_id = 'demo-ind-001'
union all
select id, '/eligibilite', 'https://example.test/logistique', 'solutions_card', 'linkedin', 'paid_social', 'demo-logistique', null
from public.leads where tracking_id = 'demo-log-002'
union all
select id, '/solutions/regulation-froid', 'https://example.test/annonce', 'landing_form', 'google', 'cpc', 'demo-froid', 'demo-gclid-003'
from public.leads where tracking_id = 'demo-agro-003'
union all
select id, '/financement-cee', null, 'campaign_cta', 'newsletter', 'email', 'demo-gtb', null
from public.leads where tracking_id = 'demo-ter-004';

insert into public.consents (lead_id, consent_type, accepted, policy_version, accepted_at, ip_hash, user_agent)
select id, 'privacy', true, 'demo-2026-09', now(), 'demo-ip-hash-001', 'Demo browser'
from public.leads where tracking_id = 'demo-ind-001'
union all
select id, 'privacy', true, 'demo-2026-09', now(), 'demo-ip-hash-002', 'Demo browser'
from public.leads where tracking_id = 'demo-log-002'
union all
select id, 'privacy', true, 'demo-2026-09', now(), 'demo-ip-hash-003', 'Demo browser'
from public.leads where tracking_id = 'demo-agro-003'
union all
select id, 'privacy', true, 'demo-2026-09', now(), 'demo-ip-hash-004', 'Demo browser'
from public.leads where tracking_id = 'demo-ter-004';

insert into public.lead_events (lead_id, event_type, metadata)
select id, 'lead_created', '{"source_form":"contact"}'::jsonb from public.leads where tracking_id = 'demo-ind-001'
union all
select id, 'lead_created', '{"source_form":"eligibility"}'::jsonb from public.leads where tracking_id = 'demo-log-002'
union all
select id, 'qualified', '{"qualification_score":76}'::jsonb from public.leads where tracking_id = 'demo-log-002'
union all
select id, 'lead_created', '{"source_form":"landing_page"}'::jsonb from public.leads where tracking_id = 'demo-agro-003'
union all
select id, 'qualified', '{"qualification_score":84}'::jsonb from public.leads where tracking_id = 'demo-agro-003'
union all
select id, 'proposal_sent', '{"proposal_reference":"DEMO-003"}'::jsonb from public.leads where tracking_id = 'demo-agro-003'
union all
select id, 'lead_created', '{"source_form":"campaign"}'::jsonb from public.leads where tracking_id = 'demo-ter-004'
union all
select id, 'qualified', '{"qualification_score":91}'::jsonb from public.leads where tracking_id = 'demo-ter-004'
union all
select id, 'proposal_sent', '{"proposal_reference":"DEMO-004"}'::jsonb from public.leads where tracking_id = 'demo-ter-004'
union all
select id, 'won', '{"note":"Projet de démonstration signé"}'::jsonb from public.leads where tracking_id = 'demo-ter-004';
