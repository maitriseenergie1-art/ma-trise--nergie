# Tests de `create-lead`

Les tests unitaires ne nécessitent ni Docker ni une base distante :

```bash
npx deno test --allow-env \
  supabase/functions/create-lead/validation.test.ts \
  supabase/functions/create-lead/handler.test.ts \
  supabase/functions/_shared/email.test.ts \
  supabase/functions/_shared/leadStatus.test.ts
node --test tests/submissionAttempt.test.mjs
```

Les scénarios HTTP à vérifier avec un payload valide `.test` sont :

| Cas | Résultat attendu |
| --- | --- |
| Contact valide avec UUID v4 | `201`, `replayed: false`, avec `leadId`, `trackingId`, `submissionId` |
| Éligibilité valide avec UUID v4 | `201`, `replayed: false`, avec `leadId`, `trackingId`, `submissionId` |
| Rejeu du même `submissionId` | `200`, `replayed: true`, même `leadId`, sans nouvel email |
| Même prospect, nouveau `submissionId` | nouveau lead en `201` |
| `submissionId` absent | `400`, `SUBMISSION_ID_REQUIRED` |
| `submissionId` invalide | `400`, `INVALID_SUBMISSION_ID` |
| Email invalide | `400`, `VALIDATION_ERROR`, champ `email` |
| Consentement refusé | `400`, `VALIDATION_ERROR`, champ `consent` |
| `sourceForm` inconnu | `400`, `VALIDATION_ERROR`, champ `sourceForm` |
| Honeypot `website` rempli | `204`, sans écriture SQL |
| Body supérieur à 25 Ko | `413`, `PAYLOAD_TOO_LARGE` |
| `GET` | `405`, en-tête `Allow: POST, OPTIONS` |
| Service role absent ou erreur RPC | `500`, `INTERNAL_ERROR` sans détail SQL |

Après une première réponse `201`, vérifier avec le `leadId` retourné qu’il existe exactement une ligne dans `leads`, `lead_needs`, `acquisitions` et `consents`, un seul événement `lead_created`, et un seul événement de notification. Un rejeu ne crée aucune ligne et ne relance pas Resend. Toute erreur de la RPC annule l’ensemble de ses insertions.

Le test PostgreSQL réel est ignoré tant que `B3_DB_URL` n’est pas défini. Il couvre la course entre deux transactions, les cardinalités des enfants, le rollback, RLS et les droits de la RPC :

```bash
npx supabase start
npx supabase db reset
B3_DB_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
  npx deno test --node-modules-dir=auto --allow-env --allow-net \
  supabase/tests/submission_idempotency.test.ts
```

Le scénario navigateur démarre Vite avec l’API B3 interceptée, puis vérifie le vrai timeout de 12 secondes, le rejeu Contact et la persistance du brouillon Éligibilité :

```bash
VITE_LEAD_API_URL=http://127.0.0.1:5174/b3-api npm run dev -- --host 127.0.0.1 --port 5174
B3_PLAYWRIGHT_MODULE='file:///chemin/vers/playwright/index.mjs' node scripts/test-b3-browser.mjs
```

Le rate limit mémoire est de cinq requêtes par dix minutes pour une même IP observée par une instance. Il est volontairement considéré comme une première protection ; il ne remplace pas une protection distribuée ou anti-bot au niveau du domaine.
