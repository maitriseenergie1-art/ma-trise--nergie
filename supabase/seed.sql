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

-- ---------------------------------------------------------------------------
-- Contenu de démonstration : réalisations et blog (données fictives).
-- ---------------------------------------------------------------------------
insert into public.case_studies (
  slug, title, sector, tags, summary, problem, diagnosis, solution, works, results,
  metrics, location, cover_image_url, cover_image_alt, seo_title, seo_description,
  status, indexable, published_at
) values
  ('entrepot-pilotage', 'Pilotage d’un entrepôt multi-zone', 'Logistique',
   array['Logistique', 'GTB', 'Éclairage'],
   'Exemple de démonstration : mise sous supervision d’un entrepôt logistique multi-zone pour réduire les consommations de chauffage et d’éclairage.',
   'Les zones de stockage, préparation et quais étaient chauffées et éclairées sans distinction, avec des plages horaires figées.',
   'Campagne de mesures sur quatre semaines : identification des dérives de température, du fonctionnement de l’éclairage hors exploitation et de la stratification de l’air.',
   'Déploiement d’une GTB avec zonage, abaissement nocturne, détection de présence sur l’éclairage et déstratificateurs pilotés.',
   'Pose des capteurs, câblage des armoires, paramétrage des scénarios et formation des équipes d’exploitation.',
   'Consommations de chauffage et d’éclairage réduites, confort homogène sur les postes de travail et suivi mensuel des indicateurs.',
   '[{"label":"Chauffage","value":"-22 %","detail":"consommation annuelle estimée"},{"label":"Éclairage","value":"-35 %","detail":"grâce à la détection de présence"},{"label":"Retour sur investissement","value":"< 3 ans","detail":"scénario de démonstration"}]'::jsonb,
   'Exemple de projet — données de démonstration',
   '/images/mechanical-room.png', 'Salle des machines d’un entrepôt logistique',
   'Pilotage GTB d’un entrepôt logistique multi-zone', 'Exemple de démonstration : supervision GTB, zonage et éclairage intelligent pour un entrepôt logistique multi-zone.',
   'published', false, now() - interval '40 days'),
  ('site-froid', 'Optimisation d’une installation frigorifique', 'Froid',
   array['Froid', 'Récupération'],
   'Exemple de démonstration : optimisation de la régulation d’une centrale frigorifique et récupération de chaleur sur les condenseurs.',
   'La centrale frigorifique fonctionnait à haute pression fixe toute l’année et la chaleur des condenseurs était rejetée à l’extérieur.',
   'Analyse des relevés de pression, de la charge des compresseurs et des besoins de chaleur du site (eau chaude sanitaire, chauffage des bureaux).',
   'Mise en place de la haute pression flottante, optimisation de la surchauffe et installation d’un échangeur de récupération sur le circuit de refoulement.',
   'Intégration hydraulique, adaptation de la régulation et mise en service progressive avec suivi des performances.',
   'Baisse de la consommation électrique du froid et couverture d’une part significative des besoins de chaleur par la récupération.',
   '[{"label":"Électricité froid","value":"-18 %","detail":"consommation annuelle estimée"},{"label":"Chaleur récupérée","value":"120 MWh/an","detail":"scénario de démonstration"}]'::jsonb,
   'Exemple de projet — données de démonstration',
   '/images/refrigeration-plant.png', 'Centrale de production frigorifique',
   'Optimisation d’une installation frigorifique industrielle', 'Exemple de démonstration : haute pression flottante et récupération de chaleur sur une centrale frigorifique.',
   'published', false, now() - interval '28 days'),
  ('batiment-tertiaire', 'Rénovation énergétique d’un bâtiment tertiaire', 'Tertiaire',
   array['Tertiaire', 'CVC', 'GTB'],
   'Exemple de démonstration : rénovation des systèmes CVC et déploiement d’une GTB sur un immeuble de bureaux.',
   'Les centrales de traitement d’air fonctionnaient en tout ou rien et la régulation de chauffage n’était pas coordonnée entre les étages.',
   'Audit des installations, mesures de débit et de température, analyse des plages d’occupation réelles des plateaux.',
   'Variation de vitesse sur les ventilateurs, régulation terminale par plateau, programmation horaire et supervision GTB centralisée.',
   'Remplacement des moteurs, pose de sondes, reprise des automates et mise en service.',
   'Réduction des consommations CVC, meilleure réactivité aux besoins et pilotage à distance des installations.',
   '[{"label":"Consommation CVC","value":"-27 %","detail":"scénario de démonstration"},{"label":"Confort","value":"+1 classe","detail":"ressenti occupants"}]'::jsonb,
   'Exemple de projet — données de démonstration',
   '/images/mechanical-room.png', 'Local technique CVC d’un immeuble de bureaux',
   'Rénovation énergétique d’un immeuble de bureaux', 'Exemple de démonstration : rénovation CVC et GTB pour un bâtiment tertiaire.',
   'published', false, now() - interval '15 days');

insert into public.blog_categories (slug, name, description) values
  ('methode', 'Méthode', 'Approche, diagnostic et conduite de projet en performance énergétique.'),
  ('financement', 'Financement', 'Dispositifs CEE, aides et modèles économiques des projets d’efficacité énergétique.'),
  ('technique', 'Technique', 'Repères techniques sur le CVC, le froid, la GTB et les utilités industrielles.');

insert into public.blog_posts (
  slug, title, excerpt, body_markdown, category_id, tags, author_name,
  cover_image_url, cover_image_alt, reading_minutes, seo_title, seo_description,
  status, indexable, published_at
) values
  ('comprendre-les-cee',
   'Comprendre les Certificats d’économies d’énergie (CEE)',
   'Ce que financent les CEE, comment ils se calculent et à quel moment les mobiliser dans un projet de performance énergétique.',
   E'## Qu’est-ce qu’un CEE ?\n\nLe dispositif des Certificats d’économies d’énergie oblige les fournisseurs d’énergie à financer des travaux d’efficacité énergétique. Pour un site professionnel, c’est une aide **au démarrage du projet**, calculée à partir d’opérations standardisées.\n\n## Comment se calcule le montant ?\n\nLe volume de CEE dépend de trois facteurs :\n\n- la nature de l’opération (fiche standardisée) ;\n- la zone climatique et la durée d’usage ;\n- le prix de valorisation négocié avec l’obligé.\n\n## Quand les mobiliser ?\n\nLa demande doit être **engagée avant la signature des devis de travaux**. C’est le point le plus souvent manqué : un dossier déposé trop tard perd le bénéfice de l’aide.\n\n> Exemple de démonstration : les montants et délais cités ici sont illustratifs.',
   (select id from public.blog_categories where slug = 'financement'),
   array['CEE', 'Financement', 'Méthode'], 'Maîtrise Énergie',
   '/images/refrigeration-plant.png', 'Installation technique industrielle',
   5, 'Comprendre les CEE : calcul, montants et calendrier',
   'Guide clair sur les Certificats d’économies d’énergie : ce qu’ils financent, comment le montant se calcule et quand déposer le dossier.',
   'published', true, now() - interval '20 days'),
  ('audit-energetique-par-ou-commencer',
   'Audit énergétique : par où commencer sur un site industriel',
   'Une méthode en quatre étapes pour cadrer un audit énergétique utile, des relevés à la hiérarchisation des actions.',
   E'## Étape 1 — Cadrer le périmètre\n\nAvant toute mesure, il faut lister les **usages énergétiques significatifs** : froid, air comprimé, CVC, process, éclairage. On cible les postes qui représentent l’essentiel de la facture.\n\n## Étape 2 — Mesurer\n\nUne campagne de mesures de deux à quatre semaines suffit souvent à révéler les dérives : fonctionnement hors production, pressions trop élevées, absence de régulation.\n\n## Étape 3 — Modéliser et comparer\n\nOn reconstruit les consommations par usage et on les compare à des références. L’écart pointe les gisements d’économies.\n\n## Étape 4 — Hiérarchiser\n\nChaque action est classée selon son gain, son coût et sa complexité. Le plan d’actions distingue les réglages sans investissement des travaux lourds.',
   (select id from public.blog_categories where slug = 'methode'),
   array['Audit', 'Méthode', 'Industrie'], 'Maîtrise Énergie',
   '/images/mechanical-room.png', 'Salle des machines d’un site industriel',
   6, 'Audit énergétique industriel : méthode en 4 étapes',
   'Comment cadrer un audit énergétique utile sur un site industriel : périmètre, mesures, modélisation et hiérarchisation des actions.',
   'published', true, now() - interval '9 days'),
  ('haute-pression-flottante-froid',
   'Haute pression flottante : un réglage à fort impact sur le froid',
   'Pourquoi laisser la pression de condensation s’adapter à la température extérieure réduit sensiblement la consommation d’une centrale frigorifique.',
   E'## Le principe\n\nSur beaucoup d’installations, la haute pression est maintenue à une valeur fixe toute l’année. Or les compresseurs consomment d’autant moins que la pression de condensation est basse.\n\n## Ce que change la haute pression flottante\n\nEn autorisant la pression à **suivre la température extérieure**, on abaisse le taux de compression une grande partie de l’année, surtout en mi-saison et en hiver.\n\n## Les points de vigilance\n\n- garantir l’alimentation correcte des détendeurs à basse pression ;\n- vérifier le comportement des postes les plus éloignés ;\n- accompagner le changement par un suivi des performances.\n\nC’est un réglage **sans investissement lourd**, dont l’effet se mesure dès les premières semaines.',
   (select id from public.blog_categories where slug = 'technique'),
   array['Froid', 'Régulation', 'Technique'], 'Maîtrise Énergie',
   '/images/refrigeration-plant.png', 'Compresseurs d’une centrale frigorifique',
   4, 'Haute pression flottante : réglage clé pour le froid industriel',
   'La haute pression flottante laisse la pression de condensation suivre la météo et réduit la consommation des compresseurs, sans investissement lourd.',
   'published', true, now() - interval '3 days');
