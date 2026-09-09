# Rapport frontend — motion, pictogrammes et conversion

1. **Animation choisie** : API Web Animations native pour les entrées au scroll et du hero ; animations CSS pour les routes et menus. Aucune bibliothèque d’animation ajoutée.
2. **Reveal** : un `IntersectionObserver` par page dans `PageMotion.jsx`, seuil 8 %, déconnexion des éléments après leur première entrée. Aucun état initial caché. Sans IntersectionObserver ou Web Animations, le contenu reste visible ; fallback testé avec IntersectionObserver désactivé.
3. **Fichiers modifiés** : `src/app/App.jsx`, `src/components/cards.jsx`, `src/components/sections.jsx`, `src/components/ui.jsx`, `src/data/solutions.js`, `src/data/sectors.js`, `src/pages/Home.jsx`, `src/pages/SolutionDetail.jsx`, `src/pages/SectorDetail.jsx`, `src/pages/Financing.jsx`, `src/styles.css`. Créés : `src/components/PageMotion.jsx`, `src/components/BusinessIcon.jsx`, `src/components/MidContact.jsx`, `src/data/businessIcons.js`, ce rapport. Le build régénère `public/sitemap.xml` avec le domaine de test demandé et les artefacts `dist/`.
4. **Animations ajoutées** : introductions de sections, frises, collections, grilles métier, FAQ, contact et CTA intermédiaires : opacité .65 → 1 et translation verticale 22 → 0 px en 460 ms sur desktop. Hero : titre, texte et boutons avec délai plafonné à 120 ms. Route : fondu .88 → 1 en 240 ms, sans sortie ni délai bloquant. Aucun effet permanent ajouté. Les collections apparaissent en bloc pour préserver le scroll-snap ; pas de stagger individuel des cards.
5. **Liens internes** : audit de `<a>`, `location.href/assign/replace` et `window.open`. Les ancres restantes sont des liens téléphone/email. Aucun remplacement de lien interne nécessaire.
6. **Navigation SPA** : clics Accueil → Solution → Contact, retour, Accueil → Secteur → Contact, Financement → Solution, retour → Éligibilité testés avec un marqueur JavaScript conservé dans `window` : aucun rechargement de document. `ScrollToTop` existant reste l’unique implémentation ; haut de page vérifié après navigation Contact. Le retour navigateur fonctionne et conserve le comportement antérieur de retour en haut, sans nouvelle restauration de position.
7. **Carrousels** : composant `CardCarousel` et événements tactiles inchangés ; swipe natif, overflow local, scroll-snap et inertie conservés. Carte à 90 % de largeur sous 680 px pour laisser voir la suivante. Geste tactile simulé : déplacement horizontal mesuré à 321 px. Pas de listener touch ajouté.
8. **Motion responsive** : 12 px / 320 ms sur mobile ; délais hero 35 ms, plafonnés à 70 ms. Aucun changement de largeur, hauteur, marge ou padding animé. Aucun nouveau listener scroll continu.
9. **Burger** : animation d’ouverture de 200 ms, fondu + translation -6 px → 0. Logique, ARIA, fermeture Escape, focus, safe areas et scroll interne existants conservés. Escape rend bien le focus au bouton.
10. **CTA burger** : largeur maximale 330 px, centrage par marges automatiques, hauteur minimale 52 px. À 390 px : x=30, largeur=330, écart au centre=0 px. Capture après fin d’animation inspectée visuellement. Route et source `mobile_eligibility` inchangées.
11. **Bibliothèque SVG** : `lucide-react` 1.42.0 déjà installée.
12. **Choix** : famille outline cohérente déjà utilisée dans les menus, cartes et frises ; pas de deuxième bibliothèque. Chaque export du mapping a été vérifié dans le paquet local. Imports nommés, trait 1.6, `currentColor`, SVG décoratifs avec `aria-hidden="true"`.
13. **Mapping Solution → pictogramme** : voir tableau ci-dessous. 15 solutions couvertes, vérification de présence sur toutes les pages détail.
14. **Mapping Secteur → pictogramme** : voir tableau ci-dessous. 6 secteurs couverts.
15. **Financement** : les huit liens existants réutilisent le mapping de la route cible : GTB→MonitorCog, CVC→Fan, Calorifugeage→Pipette, Régulation froid→Snowflake, Récupération chaleur→Repeat2, Moteurs→Cog, Air comprimé→Wind, Éclairage→Lightbulb. Les libellés regroupés existants et leurs destinations sont conservés.
16. **Centralisation** : `businessIcons.js` définit les mappings sémantiques ; les données Solution/Secteur alimentent leur champ `icon` depuis ce fichier. `BusinessIcon.jsx` rend les SVG dans les heroes, cartes, liens associés et Financement. Suppression de l’ancien registre `IconFor` inutilisé et des anciennes valeurs métier dupliquées.
17. **CTA Home** : après la méthode complète, avant Financement, titre « Vous avez identifié un poste énergétique à améliorer ? », bouton « Parler de mon projet » vers `/contact`. Espacé du CTA préexistant dans « Pourquoi nous ».
18. **Autres CTA** : Solution après les équipements, avant contenus associés ; Secteur après les solutions adaptées, avant méthode ; Financement après l’explication CEE, avant les éléments étudiés. Pas d’ajout sur les listes courtes Réalisations/Ressources/Secteurs ni sur le catalogue Solutions qui possède déjà un CTA intermédiaire.
19. **Sources CTA** : `home_mid_contact`, `solution_mid_contact`, `sector_mid_contact`, `financing_mid_contact`. Tous utilisent le composant `Button` existant, la prop `sourceCta`, le contexte d’acquisition et `cta_click`. Les détails Solution/Secteur transmettent aussi `solutionInterest` / `sectorInterest`.
20. **Tracking** : services d’acquisition, analytics et formulaires inchangés, confirmés par comparaison avec la copie avant modification. Test Solution→Contact : `sourceCta=solution_mid_contact`, `solutionInterest=gtb`, `utm_source`, landing page et tracking ID conservés. Test Home : `home_mid_contact` constaté. Aucun nouveau champ personnel envoyé aux analytics.
21. **Reduced motion** : animations CSS désactivées et animations Web Animations annulées lorsque la préférence change ; contenu immédiatement disponible. Test navigateur : zéro animation active en mode reduce.
22. **Largeurs réellement testées** : 375, 390, 393, 402, 430, 768, 1024, 1440, 1920 px sur les 29 routes ci-dessous, sans overflow horizontal détecté. Vérification complémentaire des 35 liens du plan du site à 320 et 1440 px.
23. **Routes réellement testées** : `/`, `/solutions`, les 15 `/solutions/{slug}` du tableau, `/secteurs`, les 6 `/secteurs/{slug}` du tableau, `/financement-cee`, `/realisations`, `/ressources`, `/contact`, `/eligibilite`. Contrôles interactifs : dropdown desktop, menu mobile, Escape/focus, swipe, FAQ, progression des cinq questions d’éligibilité jusqu’aux coordonnées et Retour avec choix conservé. Aucune soumission réseau de formulaire effectuée.
24. **Dépendances ajoutées** : aucune ; `package.json` inchangé.
25. **Build** : `SITE_URL=https://maitrise-energie.test npm run build` réussi. 1900 modules, JavaScript 355.73 kB (107.96 kB gzip), CSS 80.42 kB (15.90 kB gzip).
26. **Limites et points restants** : pas de défaut bloquant détecté. Tests exécutés dans Chrome piloté par Playwright, avec geste tactile simulé ; pas de test sur iPhone physique/Safari, ni de mesure de fluidité à 60 fps. Inspection visuelle réellement réalisée sur les pastilles GTB, Air comprimé, Récupération chaleur, Éclairage, Industrie, Tertiaire, Logistique, Santé, la grille Financement et le menu à 390 px. Les autres contrôles responsive sont automatisés, pas une inspection visuelle exhaustive de chaque page. Backend, consentement, payloads et services préservés ; aucune prétention à un test d’envoi de lead en production.

## Solutions

| Solution / slug | Pictogramme Lucide |
|---|---|
| GTB — `gtb` | MonitorCog |
| Pompes à chaleur — `pompes-a-chaleur` | Thermometer |
| CVC — `cvc` | Fan |
| Calorifugeage — `calorifugeage` | Pipette |
| Isolation thermique — `isolation-thermique` | Layers |
| Points singuliers — `points-singuliers` | Network |
| Déstratification — `destratification-air` | ArrowDownUp |
| Récupération de chaleur — `recuperation-chaleur` | Repeat2 |
| Chaleur fatale — `chaleur-fatale` | Flame |
| Haute pression flottante — `haute-pression-flottante` | Gauge |
| Régulation froid — `regulation-froid` | Snowflake |
| Moteurs / variateurs — `moteurs-variateurs` | Cog |
| Éclairage — `eclairage` | Lightbulb |
| Air comprimé — `air-comprime` | Wind |
| Pilotage énergétique — `pilotage-energetique` | ChartNoAxesCombined |

## Secteurs

| Secteur / slug | Pictogramme Lucide |
|---|---|
| Industrie — `industrie` | Factory |
| Tertiaire — `tertiaire` | Building2 |
| Logistique — `logistique` | Warehouse |
| Commerce — `commerce` | Store |
| Agroalimentaire — `agroalimentaire` | Wheat |
| Santé — `sante` | Hospital |
