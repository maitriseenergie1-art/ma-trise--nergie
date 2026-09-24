# ChatGPT Ads — lancement photovoltaïque professionnel

Ce document récapitule la configuration préparée pour Ads Manager. Il ne déclenche aucune publicité.

## Objectif unique

- **Objectif de campagne :** Conversions
- **Événement d’optimisation :** soumission de lead / formulaire envoyé avec succès
- **À ne pas utiliser comme conversion :** affichage de page, clic sur un CTA, début de formulaire, clic téléphone ou e-mail
- **Destination principale :** `https://maitrise-energie.fr/eligibilite`

La page cible qualifie d’emblée les deux critères commerciaux : au moins 2 000 m² de surface disponible et au moins 1 000 € de facture d’électricité mensuelle. Les résultats annoncés restent soumis à l’étude du site.

## Nommage et attribution

| Élément | Valeur à utiliser |
| --- | --- |
| Campagne | `FR | PV professionnel | Conversions | 2026` |
| Source UTM | `chatgpt` |
| Medium UTM | `paid` |
| Campagne UTM | `pv_pro_autofinancement` |
| URL de base | `https://maitrise-energie.fr/eligibilite` |

Exemple d’URL :

`https://maitrise-energie.fr/eligibilite?utm_source=chatgpt&utm_medium=paid&utm_campaign=pv_pro_autofinancement&utm_content=toitures_entrepots`

Le site enregistre cette origine dans le back-office sous **Payant > ChatGPT**, séparée des visites organiques venant de ChatGPT. La référence de clic `oppref` ajoutée par OpenAI est conservée dans la session et prise en charge automatiquement par le Pixel OpenAI après consentement.

## Structure à créer

Commencer avec **une campagne**, puis trois groupes d’annonces seulement si le budget permet de donner assez de volume à chacun. Chaque groupe garde une intention et un visuel cohérents.

### Groupe 1 — Toitures d’entrepôts et hangars

- **Besoin traité :** grande toiture inutilisée et facture électrique importante.
- **Landing :** URL d’éligibilité avec `utm_content=toitures_entrepots`.
- **Indications de contexte :**
  - Entreprises exploitant un entrepôt, un hangar ou un site industriel avec une grande toiture disponible.
  - Professionnels qui évaluent l’autoconsommation solaire afin de réduire les charges d’électricité d’un site.
  - Projet photovoltaïque étudié selon la surface, la consommation et la continuité d’activité du bâtiment.

### Groupe 2 — Parkings et ombrières

- **Besoin traité :** valorisation de parkings de sièges, commerces, assurances, banques et grands bâtiments.
- **Landing :** URL d’éligibilité avec `utm_content=ombrieres_parkings`.
- **Indications de contexte :**
  - Entreprises disposant d’un parc de stationnement et souhaitant étudier des ombrières photovoltaïques.
  - Exploitants de bâtiments professionnels cherchant à produire une partie de leur électricité sur site.

### Groupe 3 — Réduction des charges électriques

- **Besoin traité :** pression sur la facture d’électricité, avec surface exploitable.
- **Landing :** URL d’éligibilité avec `utm_content=reduction_charges`.
- **Indications de contexte :**
  - Dirigeants et responsables de site qui étudient une réduction durable de leur facture d’électricité.
  - Entreprises disposant d’au moins 2 000 m² de toiture, de parking ou de foncier exploitable.

## Créations prêtes à tester

| Angle | Titre | Description |
| --- | --- | --- |
| Toitures | Votre toiture peut réduire vos charges d’électricité | Étudiez une centrale photovoltaïque professionnelle, dimensionnée selon votre consommation et votre surface disponible. |
| Entrepôts | Valorisez la toiture de votre entrepôt | Préqualification rapide pour les entreprises disposant de grandes surfaces et d’une facture électrique significative. |
| Ombrières | Étudiez vos ombrières photovoltaïques | Parking, toiture ou foncier : vérifiez les premiers critères d’un projet solaire professionnel. |
| Autofinancement | Un projet solaire étudié en autofinancement | L’étude rapproche production, consommation et conditions de financement de votre site. |
| Charges | Réduisez votre facture grâce au solaire | Objectif de réduction d’au moins 40 % à confirmer par l’étude de votre installation. |
| Qualification | Votre site est-il éligible au photovoltaïque ? | Deux minutes pour vérifier les premiers critères de surface et de facture électrique. |

Utiliser des visuels métier cohérents avec chaque groupe : toiture d’entrepôt pour le premier, ombrières pour le second, équipe en visite technique pour les angles étude et accompagnement. Ne pas ajouter de prix, délai, certification ou économie garantie non vérifiable.

## Mesure des conversions

1. Source de données : **Maîtrise Énergie – Site web**.
2. Pixel OpenAI : `52KLrR3qwRDL3WJyDtXN5Z`, initialisé sur les pages publiques avec consentement désactivé par défaut.
3. Événement standard à créer dans Ads Manager : **Prospect créé** (`lead_created`).
4. Le site envoie cet événement uniquement après confirmation serveur d’un formulaire, avec l’identifiant de soumission comme `event_id` de déduplication.
5. Vérifier la réception d’un envoi test dans le flux d’événements, puis associer l’événement à la campagne.
6. La Conversions API côté serveur complète le Pixel avec le même identifiant de soumission afin de dédupliquer les deux signaux. Elle s'active dès que le secret `OPENAI_CONVERSIONS_API_KEY` est configuré dans Netlify.
7. Le serveur transmet `oppref` et la référence navigateur `obref` lorsqu'elles sont disponibles et que le visiteur a accepté la mesure publicitaire.

## Contrôle avant diffusion

- Domaine en HTTPS et URL de destination accessible publiquement.
- Logo, facturation et vérification du compte finalisés.
- Formulaire testé sur mobile et ordinateur avec Turnstile validé.
- Un seul événement de conversion reçu après un formulaire envoyé ; aucun événement lors d’un simple clic.
- Les UTM apparaissent dans l’admin dans l’onglet Acquisition.
- Prévoir une période d’observation avant d’augmenter fortement budget ou enchères.
