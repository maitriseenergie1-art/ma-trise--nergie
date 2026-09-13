# Contenu Supabase, back-office et déploiement

## 1. Base de données

Les migrations `supabase/migrations/*` et le contenu de démonstration `supabase/seed.sql`
**ont été appliqués** au projet Supabase `pspqvjiqemsphdvoslqe`.

Tables ajoutées :

| Table | Rôle | Accès navigateur |
|---|---|---|
| `case_studies` | Réalisations | lecture publique des lignes `status = 'published'` |
| `blog_categories` | Catégories du blog | lecture publique |
| `blog_posts` | Articles (corps en Markdown) | lecture publique des lignes publiées |
| `traffic_events` | Analytics first-party (page vues + clics) | **aucun** (écrit par `/api/track`) |
| Bucket storage `content-images` | Images du contenu | lecture publique, écriture via fonction |

Les écritures (leads, contenu, upload d'images) passent par des **Netlify Functions**
utilisant la `service_role` key — le navigateur n'a jamais d'accès en écriture.

Pour rejouer une migration plus tard :

```bash
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.supabase.com/v1/projects/pspqvjiqemsphdvoslqe/database/query" \
  -d "{\"query\": \"$(cat supabase/migrations/XXXX.sql | jq -Rs .)\"}"
```

ou, avec la CLI liée : `supabase db push`.

## 2. Lancer en local

```bash
npm install
npm run dev            # http://localhost:5173
```

`vite.config.js` monte les Netlify Functions comme middleware du serveur de dev :
**`/admin`, les formulaires de conversion et le tracking fonctionnent directement
avec `npm run dev`**, sans `netlify dev`. Les valeurs de `.env` (git-ignoré, déjà
rempli avec les clés du projet et `ADMIN_ACCESS_CODE=webfityou`) sont injectées
dans `process.env` pour les fonctions.

`netlify dev` reste utilisable si tu veux reproduire l'environnement Netlify complet.

## 3. Back-office `/admin`

Accès : `/admin` → saisir le code (`ADMIN_ACCESS_CODE`). 5 sections :

- **Dashboard** — KPI leads, conversion, trafic 7 j, contenu publié, derniers leads.
- **Leads** — onglets par type de formulaire (Contact / Éligibilité / Landing page /
  Campagne), tableau triable, panneau de détail (besoin, acquisition, consentement,
  historique), changement de statut (RPC `update_lead_status`).
- **Réalisations** — CRUD complet + chiffres clés + image + champs SEO + brouillon/publié.
- **Blog** — CRUD articles (Markdown + aperçu), gestion des catégories, SEO, publication.
- **Statistiques** — trafic par canal (**IA : ChatGPT, Gemini, Google AI Mode, Perplexity…**,
  recherche, réseaux, référents, direct), pages vues, clics par page et par élément,
  sources détaillées ; leads par mois / secteur / campagne, entonnoir.

## 4. Analytics de trafic

`src/services/trafficTracking.js` envoie un événement `page_view` à chaque changement
de route et un `click` sur chaque CTA (via l'event `maitrise-energie:analytics` déjà émis).
`netlify/functions/track.mjs` classe la source (voir `_lib/referrer.mjs`) et écrit dans
`traffic_events`. Sans cookie, sans donnée personnelle.

> La détection « Google AI Mode » repose sur le paramètre `udm=14`. Les AI Overviews
> classiques restent souvent indiscernables d'une visite Google organique — c'est une
> limite côté Google, pas du tracking.

## 5. Formulaires de conversion

`QuickLeadForm` (`src/features/quickLead/`) : formulaire court (nom, e-mail, téléphone,
besoin en une phrase) décliné par intention — `solution`, `sector`, `financing`,
`caseStudy`, `blog`, `resource`, `generic`. Présent sur toutes les pages, via
`FinalCta` (pages détail) ou `QuickLeadSection` (pages liste). Les leads partent avec
`sourceForm: 'landing_page'` et `ctaSource: quick_<variant>_<clé>` pour être
distingués dans le back-office.

## 6. SEO / rendu

- `npm run build` — build SPA classique (fallback).
- `npm run build:ssg` — build de production : SPA + **prérendu statique** de la home,
  des pages de section, de chaque réalisation et de chaque article (StaticRouter +
  hydratation). Chaque page statique embarque `<title>`, meta description, canonical,
  Open Graph / Twitter, et le JSON-LD (`Organization`, `BreadcrumbList`, `ItemList`,
  `BlogPosting` / `Article`).
- `scripts/generate-sitemap.mjs` génère `public/sitemap.xml` (avec `lastmod`) et
  `public/robots.txt` à partir du contenu Supabase publié.

## 7. Déploiement Netlify

1. Connecter le dépôt Git à Netlify (le `netlify.toml` fait le reste :
   `command = npm run build:ssg`, `publish = dist`, `functions = netlify/functions`).
2. Définir les variables d'environnement (Site settings → Environment variables) :

   | Variable | Valeur |
   |---|---|
   | `VITE_SITE_URL` / `SITE_URL` | l'URL de production (ex. `https://maitrise-energie.fr`) |
   | `VITE_SUPABASE_URL` / `SUPABASE_URL` | `https://pspqvjiqemsphdvoslqe.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | clé anon |
   | `SUPABASE_SERVICE_ROLE_KEY` | clé service_role |
   | `ADMIN_ACCESS_CODE` | code d'accès du back-office |

3. Déployer. Les routes `/api/admin/*`, `/api/track`, `/api/lead` sont servies par les
   fonctions ; tout le reste tombe sur le prérendu ou le shell SPA.
4. Après déploiement, ajouter le domaine de prod dans `siteConfig` si besoin et
   relancer un build pour régénérer sitemap + canonicals.
