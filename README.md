# Maîtrise Énergie

Site React/Vite de démonstration pour Maîtrise Énergie.

## Démarrer

```bash
npm install
npm run dev
```

## Architecture

- `src/app/` : composition de l’application et routeur unique.
- `src/components/` : mise en page, composants UI, SEO et cartes réutilisables.
- `src/pages/` : pages éditoriales et leurs templates de détail.
- `src/features/eligibility/` et `src/features/contact/` : état, validation et interface des parcours de conversion.
- `src/data/` : contenus structurés (solutions, secteurs, réalisations, ressources, navigation).
- `src/config/siteConfig.js` : configuration globale et valeurs à compléter.
- `src/services/` : adaptateurs indépendants pour acquisition, analytics, contact, éligibilité et réservation.
- `src/utils/storage.js` : accès protégé à la persistance de session.

Le projet reste en JavaScript : une migration TypeScript immédiate aurait créé une réécriture disproportionnée. Les modèles métier sont isolés dans `src/data/` pour permettre une migration incrémentale et typée lors de la prochaine évolution importante.

## Parcours de conversion

`Button` conserve le contexte d’acquisition (`landingPage`, UTM, CTA source, intérêt solution/secteur et identifiant non sensible) dans la session. Les événements passent par `trackEvent`, qui ne transmet aucune donnée personnelle ni ne connecte un fournisseur externe.

Le simulateur persiste un brouillon de six étapes en session, isole sa validation dans `features/eligibility` et remet ses réponses à `eligibilityService.submit`. Le formulaire de contact suit le même principe avec `contactService.submit` et le consentement affiché. Chaque tentative logique reçoit un UUID v4 `submissionId`, distinct du `trackingId` marketing : il reste stable pendant les retries et change après un succès ou pour un nouveau formulaire.

## SEO et sitemap

Le composant `Seo` gère titre, description, canonical, Open Graph et JSON-LD lorsque pertinent. Le sitemap est produit avant le build par `scripts/generate-sitemap.mjs` à partir des données et des routes publiques. Renseigner `SITE_URL` pendant le build de production pour y inscrire les URLs canoniques ; aucune URL fictive n’est publiée.

L’application est actuellement rendue côté client. Une décision SSR/SSG devra être prise avant la publication SEO finale.

## Backend readiness

Les formulaires Contact et Éligibilité envoient un `POST` vers l’Edge Function `create-lead` avec l’URL publique `VITE_LEAD_API_URL`, via leurs services dédiés et le même client HTTP. Ils ne communiquent jamais directement avec PostgreSQL. Le parcours d’éligibilité transmet une seule demande à sa dernière étape : il réalise une qualification commerciale et ne constitue pas un verdict réglementaire.

Pour tester Contact en développement, créer `.env.local` sans le versionner :

```bash
VITE_LEAD_API_URL=https://<PROJECT_REF>.supabase.co/functions/v1/create-lead
```

Le formulaire conserve le tracking de session et les paramètres d’acquisition initiaux, mais ne simule jamais une réussite si cette URL est absente ou si l’API répond en erreur.

## Backend / Supabase

Supabase PostgreSQL est préparé comme stockage versionné des leads. Le frontend ne contacte jamais directement la base : les soumissions passent par l’Edge Function, qui valide les entrées, applique l’anti-spam et exécute la transaction.

```text
React/Vite
   ↓
API / Edge Function
   ↓
Validation + anti-spam
   ↓
Supabase PostgreSQL
   ↓
CRM / notifications
```

La migration initiale est dans `supabase/migrations/` et crée :

- `leads` : identité de contact, statut commercial, formulaire d’origine et dates ;
- `lead_needs` : contexte du site, besoin, équipements JSONB et score de qualification ;
- `acquisitions` : landing page, CTA, référent et paramètres d’acquisition ;
- `consents` : consentements et preuve technique limitée (hash IP, jamais l’IP brute) ;
- `lead_events` : historique extensible du cycle de vie du lead.

Le statut de `leads` est contrôlé (`new`, `to_contact`, `contacted`, `qualified`, `appointment`, `proposal`, `won`, `lost`, `completed`) et `source_form` couvre actuellement `contact`, `eligibility`, `landing_page` et `campaign`. Les relations enfant utilisent `ON DELETE CASCADE`. Les index ciblent les recherches par email, identifiant de tracking, statut, date, relations et campagnes. Un trigger PostgreSQL maintient `leads.updated_at`.

### Cycle de vie commercial

La migration B2 `20260909093000_add_lead_status_update_rpc.sql` ajoute `public.update_lead_status`. La migration de raffinement B2 `20260909095500_refine_lead_status_lifecycle.sql` précise ensuite les transitions sans modifier la migration initiale. La RPC effectue dans la même transaction le verrouillage du lead, la validation de la transition, la mise à jour de `leads.status`, le déclenchement de `updated_at` et l’ajout de l’événement `lead_status_changed`.

Les statuts signifient : `new` (créé), `to_contact` (à traiter), `contacted` (premier échange effectué), `qualified` (besoin commercial confirmé), `appointment` (rendez-vous prévu), `proposal` (proposition transmise), `won` (projet signé) et `completed` (réalisation achevée). `lost` indique l’arrêt du cycle commercial.

| Depuis | Vers |
| --- | --- |
| `new` | `to_contact`, `contacted`, `qualified`, `appointment`, `proposal`, `lost` |
| `to_contact` | `contacted`, `qualified`, `appointment`, `proposal`, `lost` |
| `contacted` | `qualified`, `appointment`, `proposal`, `lost` |
| `qualified` | `appointment`, `proposal`, `lost` |
| `appointment` | `proposal`, `lost` |
| `proposal` | `won`, `lost` |
| `won` | `completed` |
| `lost` | `to_contact`, `contacted`, `qualified` |
| `completed` | aucune |

Les étapes intermédiaires peuvent être sautées lorsque le commercial dispose déjà de l’information. Une perte est autorisée depuis les étapes non terminales jusqu’à `proposal`, avec une raison obligatoire : `budget`, `timing`, `not_qualified`, `no_response`, `competitor` ou `other`. Un lead perdu peut être réouvert vers `to_contact`, `contacted` ou `qualified`, afin de reprendre le cycle à un niveau commercial cohérent. Les leads `completed` sont terminaux.

`supabase/functions/update-lead-status` est une API serveur-à-serveur pour un futur back-office ou CRM. `verify_jwt = false` est volontaire pour cette seule fonction : le projet ne possède pas encore d’utilisateur Supabase Auth interne. L’authentification est réalisée avant toute lecture ou écriture par l’en-tête `x-lead-admin-key`, comparé de façon sûre au secret `LEAD_STATUS_API_KEY`. La fonction ne renvoie aucun en-tête CORS et n’est pas appelée par le site public. Le navigateur ne doit jamais posséder cette clé ni la clé de service Supabase.

### Sécurité et RLS

RLS est activée sur les cinq tables, sans policy pour `anon` ou `authenticated`. Les privilèges de ces rôles sont aussi révoqués : un navigateur ne peut donc ni lire, ni insérer, ni modifier, ni supprimer les leads. `SUPABASE_SERVICE_ROLE_KEY` est réservée au serveur ; elle ne doit jamais porter un préfixe `VITE_` ni être importée par React.

Copier `.env.example` dans un fichier local non versionné pour les valeurs nécessaires. Les fichiers `.env`, `.env.local` et `.env.production` sont ignorés par Git ; `.env.example` est conservé sans secret.

### Workflow local

```bash
npm install
npx supabase start
npx supabase db reset
```

`supabase db reset` applique la migration puis `supabase/seed.sql`. Le seed contient quatre leads explicitement fictifs (`.test`) couvrant les statuts `new`, `qualified`, `proposal` et `won`, avec leurs besoins, acquisitions, consentements et événements associés.

Pour générer plus tard les types sans migrer le frontend JavaScript vers TypeScript :

```bash
npm run supabase:types
# ou : npx supabase gen types typescript --local
```

Pour une base distante, après avoir créé le projet Supabase :

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

L’API crée de façon atomique `leads`, `lead_needs`, `acquisitions`, `consents`, puis l’événement `lead_created`, avec rollback si une étape échoue. La qualification commerciale du simulateur ne constitue pas une éligibilité réglementaire CEE.

## À compléter avant publication

- coordonnées, identité juridique et contenus des pages légales ;
- domaine de production dans `SITE_URL` et les métadonnées de `siteConfig` ;
- images, études de cas, ressources et données de performance validées ;
- endpoint de formulaire/CRM, dispositif antispam et gestionnaire de consentement.

## Lead ingestion API

`supabase/functions/create-lead` est l’API d’ingestion des leads utilisée par les formulaires React Contact et Éligibilité. Aucun navigateur n’accède directement à PostgreSQL.

```text
Frontend
   ↓ POST /functions/v1/create-lead
create-lead Edge Function
   ↓ validation + honeypot + rate limit
create_lead_submission RPC
   ↓ transaction PostgreSQL
leads + lead_needs + acquisitions + consents + lead_events
   ↓ après succès uniquement
Resend — notification interne commerciale
```

La fonction n’accepte que `POST` et répond à `OPTIONS` pour le CORS. Les payloads portent `sourceForm: "contact"` ou `sourceForm: "eligibility"`, un UUID v4 `submissionId`, un bloc `contact`, un bloc `need`, un contexte `acquisition` et un consentement explicite. Un champ optionnel `website` sert de honeypot : lorsqu’il est renseigné, la fonction répond sans créer de lead ni réserver l’identifiant de soumission.

Les contrôles serveur comprennent notamment l’email obligatoire, les longueurs maximales, la normalisation des chaînes et de l’email, la taille totale du body (25 Ko), la compatibilité JSON de `equipment`, le consentement et un score de qualification éventuel entre 0 et 100. Les erreurs de validation retournent `400`, les méthodes non permises `405`, le rate limit `429`, les bodies trop grands `413` et les erreurs internes `500` sans détail PostgreSQL.

La migration B3 `20260909160000_add_submission_idempotency.sql` ajoute `leads.submission_id uuid`, sa contrainte unique et remplace la signature de `public.create_lead_submission`. La première requête écrit les cinq enregistrements dans une transaction implicite. Un rejeu retourne le lead existant avant les insertions enfants. La RPC reste `SECURITY DEFINER`, fixe son `search_path` et ne donne `EXECUTE` qu’à `service_role`; elle n’est jamais accordée à `anon` ou `authenticated`.

### CORS, anti-spam et secrets

`ALLOWED_ORIGINS` est une liste séparée par des virgules. Par défaut, seules les origines Vite locales sont autorisées ; définir le domaine de production lors du déploiement, sans wildcard. La limitation actuelle est volontairement simple : cinq requêtes par IP observée sur dix minutes, en mémoire d’une instance Edge. Elle complète le honeypot et la validation, mais n’est pas une protection distribuée ; une protection anti-bot/WAF devra être ajoutée avant une campagne à fort trafic.

Les fonctions hébergées reçoivent déjà `SUPABASE_URL` et les clés serveur Supabase au runtime. Il n’est donc pas nécessaire de recopier une clé de service dans un secret de projet. Configurer uniquement l’origine applicative :

```bash
npx supabase secrets set ALLOWED_ORIGINS=https://votre-domaine.example
```

`SUPABASE_URL` est fourni par Supabase au runtime. Ne jamais définir une clé de service sous une variable `VITE_*` et ne jamais la transmettre au navigateur. L’adresse IP n’est pas persistée : `ip_hash` reste à `null` tant qu’une stratégie de hash documentée n’est pas mise en place.

### Lead email notifications

Après une création effective signalée par la RPC, `create-lead` tente d’envoyer une notification interne avec l’API HTTP de Resend. Un rejeu technique n’appelle ni Resend ni l’écriture d’un événement de notification. Cet effet secondaire n’appartient pas à la transaction PostgreSQL : un échec Resend, une configuration manquante ou un timeout ne supprime pas le lead et ne change pas le succès retourné au visiteur. L’événement `lead_notification_sent` ou `lead_notification_failed` est ajouté à `lead_events` lorsque son écriture est disponible.

La notification contient uniquement les données réellement renseignées : coordonnées, contexte projet, acquisition et identifiants du lead. Elle produit une version texte et une version HTML sobre. Les valeurs utilisateur sont échappées avant insertion dans le HTML. L’email du prospect est utilisé comme `Reply-To` par défaut ; `LEAD_NOTIFICATION_REPLY_TO` peut le remplacer si nécessaire.

Configurer les secrets serveur, sans préfixe `VITE_` :

```bash
npx supabase secrets set RESEND_API_KEY=REPLACE_WITH_A_SENDING_ONLY_RESEND_KEY
npx supabase secrets set LEAD_NOTIFICATION_TO='commercial@example.com,operations@example.com'
npx supabase secrets set LEAD_NOTIFICATION_FROM='Maîtrise Énergie <leads@your-verified-domain.example>'
# Facultatif : uniquement si l’équipe ne doit pas répondre directement au prospect.
npx supabase secrets set LEAD_NOTIFICATION_REPLY_TO='commercial@example.com'
npx supabase secrets set LEAD_STATUS_API_KEY='REPLACE_WITH_A_LONG_RANDOM_INTERNAL_SECRET'
```

L’adresse `LEAD_NOTIFICATION_FROM` doit employer un domaine vérifié auprès de Resend. L’envoi utilise un timeout de six secondes et une clé d’idempotence Resend dérivée du `leadId`, valable selon les règles du fournisseur. Aucun retry automatique n’est réalisé ; une stratégie de reprise durable reste une amélioration future.

### Tests locaux

Docker est requis pour démarrer Supabase localement. Après `npx supabase start` :

```bash
npx supabase db reset
npx supabase functions serve create-lead
```

Les tests unitaires couvrent la validation, l’orchestration HTTP, les notifications, le cycle de vie et la conservation du `submissionId` côté frontend :

```bash
npx deno test --allow-env \
  supabase/functions/create-lead/validation.test.ts \
  supabase/functions/create-lead/handler.test.ts \
  supabase/functions/_shared/email.test.ts \
  supabase/functions/_shared/leadStatus.test.ts
node --test tests/submissionAttempt.test.mjs
```

Exemple de soumission Contact fictive :

```bash
curl -i -X POST http://127.0.0.1:54321/functions/v1/create-lead \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:5173' \
  --data '{"submissionId":"11111111-1111-4111-8111-111111111111","sourceForm":"contact","trackingId":"lead_demo_api","contact":{"firstName":"Jean","lastName":"Démo","email":"jean@example.test","phone":"+33600000000","companyName":"Entreprise Démo"},"need":{"sector":"Industrie","buildingType":null,"siteSize":null,"projectType":"Optimisation énergétique","solutionSlug":"air-comprime","equipment":[],"projectTimeline":null,"message":"Test API fictif."},"acquisition":{"landingPage":"/solutions/air-comprime","referrer":null,"ctaSource":"api_test","utmSource":null,"utmMedium":null,"utmCampaign":null,"utmTerm":null,"utmContent":null,"gclid":null,"gbraid":null,"wbraid":null,"fbclid":null},"consent":{"accepted":true,"policyVersion":"demo-v1"}}'
```

La première création retourne `201` avec `replayed: false`. Le même payload et le même `submissionId` retournent `200`, `replayed: true` et le même `leadId`. Un nouveau `submissionId` crée un autre lead, même si les données de contact et le `trackingId` sont identiques.

### Déploiement distant

Les migrations existantes ne doivent pas être modifiées. Vérifier puis appliquer la nouvelle migration, et déployer uniquement la fonction modifiée :

```bash
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy create-lead --no-verify-jwt
```

`--no-verify-jwt` correspond à la configuration locale de fonction : c’est un endpoint de formulaire public contrôlé par CORS, validation et anti-spam, sans donner de droit SQL au navigateur. Les intégrations CRM, Slack, prise de rendez-vous et upload de documents restent hors de cette passe.
