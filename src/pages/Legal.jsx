import { Breadcrumb, Container, Eyebrow } from '../components/ui';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/siteConfig';

const { contact, legal } = siteConfig;
const editorName = legal.companyIdentity || `${siteConfig.name} [forme juridique et capital à compléter]`;
const editorAddress = legal.address || contact.address;
const registration = legal.registration || '[SIREN / SIRET et ville d’immatriculation RCS à compléter]';
const hostingProvider = legal.hostingProvider || 'Netlify, Inc. — https://www.netlify.com';

function LastUpdate() {
  return <p className="legal-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}.</p>;
}

function MentionsLegales() {
  return <>
    <h1>Mentions légales</h1>
    <p className="lead">Informations relatives à l’édition et à l’hébergement du site {siteConfig.name.toLowerCase()}.fr, conformément à l’article 6 III de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique.</p>
    <LastUpdate/>

    <h2>Éditeur du site</h2>
    <p>{editorName}</p>
    <ul>
      <li>Siège social : {editorAddress}</li>
      <li>Immatriculation : {registration}</li>
      <li>Directeur de la publication : [nom et fonction à compléter]</li>
      <li>Email : <a href={`mailto:${contact.email}`}>{contact.email}</a></li>
      {contact.phone && <li>Téléphone : <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a></li>}
    </ul>
    <p className="legal-placeholder-note">Les mentions ci-dessus doivent être complétées avec l’identité juridique exacte (forme sociale, capital social, RCS, n° de TVA intracommunautaire) avant toute mise en ligne en production.</p>

    <h2>Hébergement</h2>
    <p>Le site est hébergé par {hostingProvider}. Les fonctions applicatives (formulaires, back-office, suivi de fréquentation) s’exécutent sur l’infrastructure Netlify Functions et s’appuient sur une base de données Supabase (PostgreSQL) pour la persistance des données.</p>

    <h2>Propriété intellectuelle</h2>
    <p>L’ensemble des contenus présents sur ce site (textes, visuels, schémas, structure, code) est protégé par le droit d’auteur et le droit des marques, sauf mention contraire. Toute reproduction, représentation, modification ou diffusion, totale ou partielle, sans autorisation écrite préalable de {siteConfig.name}, est interdite et pourrait constituer une contrefaçon au sens des articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
    <p>Les photographies utilisées à titre d’illustration proviennent de banques d’images sous licence et ne représentent pas nécessairement des installations réelles de clients de {siteConfig.name}.</p>

    <h2>Responsabilité</h2>
    <p>{siteConfig.name} s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur ce site, sans garantir qu’elles soient exhaustives ou exemptes d’erreurs. Les informations présentées sont données à titre indicatif et ne constituent ni un devis, ni un engagement contractuel, ni un conseil réglementaire. Toute décision d’étude, de travaux ou de financement doit faire l’objet d’un échange direct et d’une qualification préalable avec nos équipes.</p>
    <p>{siteConfig.name} ne pourra être tenu responsable des dommages directs ou indirects résultant de l’accès au site ou de l’usage qui en est fait, y compris l’impossibilité d’y accéder.</p>

    <h2>Liens hypertextes</h2>
    <p>Le site peut contenir des liens vers des ressources ou sites tiers (organismes officiels, presse spécialisée). {siteConfig.name} n’exerce aucun contrôle sur ces ressources externes et décline toute responsabilité quant à leur contenu.</p>

    <h2>Droit applicable</h2>
    <p>Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut de résolution amiable, les tribunaux français compétents seront seuls saisis.</p>
  </>;
}

function PolitiqueConfidentialite() {
  return <>
    <h1>Politique de confidentialité</h1>
    <p className="lead">Cette politique décrit comment {siteConfig.name} collecte, utilise et protège les données transmises via ce site, conformément au Règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.</p>
    <LastUpdate/>

    <h2>Responsable du traitement</h2>
    <p>Le responsable du traitement des données collectées sur ce site est {editorName}, joignable à l’adresse <a href={`mailto:${contact.email}`}>{contact.email}</a> pour toute question relative à vos données personnelles.</p>

    <h2>Données collectées</h2>
    <p>Nous collectons uniquement les données que vous nous transmettez volontairement, via les formulaires du site (contact, vérification d’éligibilité, prise de contact rapide) :</p>
    <ul>
      <li>Identité : prénom, nom, nom de l’entreprise ;</li>
      <li>Coordonnées : adresse email, numéro de téléphone ;</li>
      <li>Données de qualification du projet : secteur d’activité, type de bâtiment, type de projet, solution recherchée, calendrier envisagé, message libre ;</li>
      <li>Données techniques d’acquisition : page d’origine, référent (site depuis lequel vous arrivez), paramètres de campagne (UTM) et identifiant technique de session, utilisés pour relier votre demande à son origine marketing.</li>
    </ul>
    <p>Aucune donnée bancaire ou de paiement n’est collectée sur ce site. Aucune catégorie particulière de données (santé, opinions, origines…) n’est demandée ni traitée.</p>

    <h2>Finalités du traitement</h2>
    <ul>
      <li>Traiter votre demande de contact ou votre demande d’étude énergétique ;</li>
      <li>Qualifier votre projet pour vous orienter vers la solution ou le dispositif pertinent ;</li>
      <li>Vous recontacter dans le cadre du suivi commercial de votre demande ;</li>
      <li>Mesurer l’efficacité de nos canaux d’acquisition (sans finalité publicitaire tierce, voir notre <Link-placeholder/>).</li>
    </ul>

    <h2>Base légale</h2>
    <p>Le traitement repose sur votre consentement exprès, recueilli au moment de la soumission de chaque formulaire, ainsi que sur l’intérêt légitime de {siteConfig.name} à répondre aux demandes qui lui sont adressées dans le cadre de démarches précontractuelles.</p>

    <h2>Destinataires des données</h2>
    <p>Vos données sont destinées exclusivement à l’équipe interne de {siteConfig.name} en charge du traitement des demandes. Elles sont hébergées et traitées par nos sous-traitants techniques :</p>
    <ul>
      <li><strong>Supabase</strong> (base de données PostgreSQL) pour le stockage sécurisé des demandes ;</li>
      <li><strong>Netlify</strong> pour l’hébergement du site et l’exécution des fonctions de traitement des formulaires.</li>
    </ul>
    <p>Ces prestataires agissent en tant que sous-traitants au sens du RGPD et ne réutilisent vos données à aucune fin propre. Aucune donnée n’est vendue, louée ou transmise à des fins publicitaires à des tiers.</p>

    <h2>Durée de conservation</h2>
    <p>Les données des demandes non converties en projet sont conservées 3 ans à compter du dernier contact, conformément aux recommandations de la CNIL en matière de prospection commerciale. En cas de projet engagé, les données sont conservées pendant la durée de la relation contractuelle puis archivées conformément aux obligations légales applicables.</p>

    <h2>Vos droits</h2>
    <p>Conformément au RGPD, vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation du traitement, portabilité, et opposition (notamment à la prospection commerciale). Vous pouvez également retirer votre consentement à tout moment.</p>
    <p>Pour exercer ces droits, contactez-nous à l’adresse <a href={`mailto:${contact.email}`}>{contact.email}</a> en précisant votre demande. Une réponse vous sera apportée dans un délai maximal d’un mois. Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).</p>

    <h2>Sécurité</h2>
    <p>Les échanges avec le site sont chiffrés (HTTPS) et l’accès aux données des demandes est restreint aux membres autorisés de l’équipe {siteConfig.name}, via un accès protégé par authentification. Un dispositif anti-robot (champ piège invisible) protège également les formulaires contre les soumissions automatisées.</p>

    <h2>Cookies et traceurs</h2>
    <p>Le site n’utilise pas de cookies de mesure d’audience tiers ni de cookies publicitaires. Le détail des données techniques stockées dans votre navigateur est présenté dans notre <Link to="/gestion-des-cookies">politique de gestion des cookies</Link>.</p>
  </>;
}

function GestionCookies() {
  return <>
    <h1>Gestion des cookies</h1>
    <p className="lead">Ce site n’utilise ni cookie de mesure d’audience tiers, ni cookie publicitaire, ni traceur de réseau social. Cette page détaille précisément ce qui est réellement stocké dans votre navigateur et pourquoi.</p>
    <LastUpdate/>

    <h2>Ce que nous n’utilisons pas</h2>
    <ul>
      <li>Aucun outil de mesure d’audience tiers (type Google Analytics) ;</li>
      <li>Aucun pixel publicitaire ou traceur cross-site ;</li>
      <li>Aucun bouton ou widget de réseau social chargeant du contenu tiers ;</li>
      <li>Aucune vente ni cession de données de navigation à des tiers.</li>
    </ul>

    <h2>Ce que le site stocke réellement</h2>
    <p>Le site utilise uniquement le stockage local de votre navigateur (<em>sessionStorage</em> et <em>localStorage</em>), et non des cookies au sens strict. Ces données restent sur votre appareil et ne sont partagées avec aucun tiers publicitaire :</p>
    <ul>
      <li><strong>Attribution de la demande</strong> — un identifiant technique anonyme et les paramètres de campagne (UTM) éventuels sont conservés dans <em>sessionStorage</em> pendant la durée de votre visite, afin de relier une éventuelle demande envoyée à son origine (page de destination, campagne). Ces données sont supprimées à la fermeture de l’onglet.</li>
      <li><strong>Mesure de fréquentation interne</strong> — les pages consultées et clics sur les appels à l’action sont envoyés à notre propre serveur (fonction technique interne, hébergée par nos soins), sans identifiant permanent ni recoupement avec d’autres sites. Aucun profil publicitaire n’est constitué.</li>
      <li><strong>Session d’administration</strong> — réservé à l’équipe {siteConfig.name} : un jeton de connexion est conservé dans <em>localStorage</em> pour maintenir la session ouverte sur l’espace d’administration protégé (<code>/admin</code>). Il n’a aucun effet sur la navigation publique du site.</li>
    </ul>
    <p>Ces stockages sont strictement nécessaires au fonctionnement du site et à la bonne gestion de vos demandes ; ils sont à ce titre exemptés de recueil de consentement au sens des recommandations de la CNIL, mais nous avons choisi de vous en informer intégralement par transparence.</p>

    <h2>Comment effacer ces données</h2>
    <p>Vous pouvez à tout moment supprimer ces données depuis les réglages de votre navigateur (effacement des données de navigation, ou navigation privée), sans que cela n’affecte votre capacité à consulter le site. La suppression du stockage de session peut simplement réinitialiser l’attribution d’une demande en cours.</p>

    <h2>Évolution de cette politique</h2>
    <p>Si un outil de mesure d’audience ou un service tiers venait à être ajouté au site, cette page serait mise à jour et un bandeau de consentement conforme au RGPD et aux lignes directrices de la CNIL serait mis en place avant toute activation.</p>

    <h2>Contact</h2>
    <p>Pour toute question relative à cette politique, contactez-nous à <a href={`mailto:${contact.email}`}>{contact.email}</a>.</p>
  </>;
}

const pages = {
  'mentions-legales': { title: 'Mentions légales', description: 'Éditeur, hébergeur et informations légales du site Maîtrise Énergie.', Content: MentionsLegales },
  'politique-de-confidentialite': { title: 'Politique de confidentialité', description: 'Comment Maîtrise Énergie collecte, utilise et protège vos données personnelles, conformément au RGPD.', Content: PolitiqueConfidentialite },
  'gestion-des-cookies': { title: 'Gestion des cookies', description: 'Détail des cookies et données de stockage utilisés par le site Maîtrise Énergie.', Content: GestionCookies },
};

export default function Legal({ pageKey }) {
  const page = pages[pageKey];
  return <main className="legal-page">
    <Seo title={page.title} description={page.description} noindex/>
    <Container>
      <Breadcrumb current={page.title}/>
      <article className="prose">
        <page.Content/>
      </article>
    </Container>
  </main>;
}
