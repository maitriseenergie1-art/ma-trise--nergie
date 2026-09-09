# B3 — Idempotence des soumissions de leads

## Contrat

`trackingId` identifie une session ou une acquisition marketing. `submissionId` est un UUID v4 généré pour une tentative logique de soumission. Un retry conserve ce dernier ; un nouveau projet utilise un nouvel UUID, même si le prospect et le tracking sont identiques.

La base est l’autorité finale. `leads.submission_id` accepte `NULL` pour préserver les lignes historiques et porte la contrainte unique `leads_submission_id_key`. La RPC utilise `INSERT ... ON CONFLICT DO NOTHING`. Le gagnant crée le lead, ses trois lignes enfants et `lead_created`. Un appel concurrent perdant attend la contrainte, relit le lead gagnant et retourne avant toute autre insertion.

La première création répond `201` avec `replayed: false`. Le rejeu répond `200` avec `replayed: true` et le même `leadId`. L’Edge Function appelle Resend et écrit l’événement de notification uniquement quand `replayed` vaut `false`.

Contact garde l’UUID dans une ref tant que la requête n’a pas réussi. Éligibilité le conserve dans son brouillon `sessionStorage`, y compris pendant les changements d’étape, une erreur réseau et un rechargement. Après un succès confirmé, l’identifiant est supprimé ; la prochaine tentative en crée un autre.

## Validation locale

```bash
npx deno check --node-modules-dir=auto supabase/functions/create-lead/index.ts
npx deno test --allow-env \
  supabase/functions/create-lead/validation.test.ts \
  supabase/functions/create-lead/handler.test.ts \
  supabase/functions/_shared/email.test.ts \
  supabase/functions/_shared/leadStatus.test.ts
node --test tests/submissionAttempt.test.mjs
SITE_URL=https://maitrise-energie.test npm run build
```

Le test de concurrence PostgreSQL nécessite une base réelle ayant reçu toutes les migrations :

```bash
npx supabase start
npx supabase db reset
B3_DB_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
  npx deno test --node-modules-dir=auto --allow-env --allow-net \
  supabase/tests/submission_idempotency.test.ts
```

## Migration et déploiement

Le contrat devient obligatoire des deux côtés. La migration remplace la signature RPC et l’Edge Function appelle la nouvelle signature ; il faut donc effectuer une mise en production coordonnée avec le frontend, plutôt que laisser durablement une version ancienne entre ces étapes.

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy create-lead --no-verify-jwt
SITE_URL=https://<DOMAINE_PRODUCTION> npm run build
```

Publier ensuite le dossier `dist/` avec la procédure habituelle de l’hébergeur.

## Tests distants explicites

La commande suivante crée trois leads synthétiques et peut provoquer trois emails. Elle n’est donc pas lancée automatiquement :

```bash
B3_LEAD_API_URL='https://<PROJECT_REF>.supabase.co/functions/v1/create-lead' \
  node scripts/test-b3-remote.mjs --send-test-leads
```

Le script vérifie la création, le rejeu, le même contact avec un nouvel UUID et deux requêtes concurrentes. Il écrit `b3-remote-result.json` et `b3-remote-verify.sql`. Exécuter ensuite la vérification SQL avec une connexion d’administration non versionnée :

```bash
export B3_DB_URL='postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres'
psql "$B3_DB_URL" -v ON_ERROR_STOP=1 -f b3-remote-verify.sql
```

Contrôler enfin dans Resend qu’un seul message existe pour le `leadId` rejoué. Le SQL doit montrer une seule ligne dans `leads`, `lead_needs`, `acquisitions` et `consents`, un seul `lead_created`, et un seul événement de notification pour cette soumission.
