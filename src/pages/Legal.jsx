import { Breadcrumb, Container, Eyebrow } from '../components/ui';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/siteConfig';
import { Link } from 'react-router-dom';
import { MeasurementConsentControls } from '../components/MeasurementConsent';

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
      <li>Mesurer, avec votre accord, l’efficacité des campagnes ChatGPT Ads et attribuer une demande à l’annonce à l’origine de la visite (voir notre <Link to="/gestion-des-cookies">politique de gestion des cookies</Link>).</li>
    </ul>

    <h2>Base légale</h2>
    <p>Le traitement repose sur votre consentement exprès, recueilli au moment de la soumission de chaque formulaire, ainsi que sur l’intérêt légitime de {siteConfig.name} à répondre aux demandes qui lui sont adressées dans le cadre de démarches précontractuelles.</p>
    <p>La mesure des campagnes ChatGPT Ads repose sur le choix distinct présenté dans le bandeau de consentement. Refuser cette mesure n’empêche ni la consultation du site ni l’envoi d’une demande.</p>

    <h2>Destinataires des données</h2>
    <p>Vos données sont destinées exclusivement à l’équipe interne de {siteConfig.name} en charge du traitement des demandes. Elles sont hébergées et traitées par nos sous-traitants techniques :</p>
    <ul>
      <li><strong>Supabase</strong> (base de données PostgreSQL) pour le stockage sécurisé des demandes ;</li>
      <li><strong>Netlify</strong> pour l’hébergement du site et l’exécution des fonctions de traitement des formulaires.</li>
      <li><strong>OpenAI</strong>, uniquement lorsque vous autorisez la mesure publicitaire, pour attribuer une demande aux campagnes ChatGPT Ads.</li>
    </ul>
    <p>Ces prestataires interviennent pour les finalités techniques et de mesure décrites ci-dessus. Aucune donnée n’est vendue ou louée par {siteConfig.name}.</p>

    <h2>Durée de conservation</h2>
    <p>Les données des demandes non converties en projet sont conservées 3 ans à compter du dernier contact, conformément aux recommandations de la CNIL en matière de prospection commerciale. En cas de projet engagé, les données sont conservées pendant la durée de la relation contractuelle puis archivées conformément aux obligations légales applicables.</p>

    <h2>Vos droits</h2>
    <p>Conformément au RGPD, vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation du traitement, portabilité, et opposition (notamment à la prospection commerciale). Vous pouvez également retirer votre consentement à tout moment.</p>
    <p>Pour exercer ces droits, contactez-nous à l’adresse <a href={`mailto:${contact.email}`}>{contact.email}</a> en précisant votre demande. Une réponse vous sera apportée dans un délai maximal d’un mois. Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).</p>

    <h2>Sécurité</h2>
    <p>Les échanges avec le site sont chiffrés (HTTPS) et l’accès aux données des demandes est restreint aux membres autorisés de l’équipe {siteConfig.name}, via un accès protégé par authentification. Un dispositif anti-robot (champ piège invisible) protège également les formulaires contre les soumissions automatisées.</p>

    <h2>Cookies et traceurs</h2>
    <p>Le site utilise, avec votre accord préalable, le Pixel OpenAI pour mesurer les demandes provenant de ChatGPT Ads. Vous pouvez refuser ou retirer cet accord à tout moment depuis notre <Link to="/gestion-des-cookies">politique de gestion des cookies</Link>.</p>
  </>;
}

function GestionCookies() {
  return <>
    <h1>Politique de cookies</h1>
    <p className="lead">Cette politique explique ce que sont les cookies et autres stockages locaux, pourquoi ils sont utilisés sur ce site et comment vous pouvez gérer vos préférences.</p>
    <LastUpdate/>

    <h2>Qu’est-ce qu’un cookie&nbsp;?</h2>
    <p>Un cookie est un petit fichier enregistré sur votre appareil lors de la consultation d’un site. Des technologies proches, comme le stockage local du navigateur, peuvent remplir des fonctions similaires. Dans cette politique, le terme «&nbsp;cookies&nbsp;» désigne l’ensemble de ces technologies.</p>

    <h2>Cookies et stockages nécessaires</h2>
    <p>Ces éléments sont utilisés pour assurer le fonctionnement, la sécurité et la continuité de votre navigation. Ils ne sont pas destinés à établir un profil publicitaire :</p>
    <ul>
      <li><strong>Continuité de la visite</strong> — un identifiant technique et les paramètres de campagne éventuellement présents dans l’adresse sont conservés pendant la session afin de relier une demande à sa page d’origine.</li>
      <li><strong>Préférence de cookies</strong> — votre choix d’accepter ou de refuser les cookies optionnels est mémorisé dans votre navigateur.</li>
      <li><strong>Sécurité et administration</strong> — l’espace privé réservé à l’équipe utilise un stockage de session pour maintenir une connexion sécurisée. Il n’a aucun effet sur la navigation publique.</li>
    </ul>

    <h2>Cookies optionnels</h2>
    <p>Avec votre accord, un outil de mesure fourni par OpenAI peut être activé pour comprendre si une demande de contact fait suite à une campagne publicitaire. Il peut utiliser les cookies propriétaires <code>__oppref</code> (jusqu’à 30 jours) et <code>__obref</code> (jusqu’à 365 jours). Seule une demande effectivement transmise est comptabilisée comme conversion.</p>
    <p>Ces cookies optionnels ne sont pas déposés et aucun événement publicitaire n’est envoyé tant que vous n’avez pas donné votre accord. Leur refus n’empêche ni la consultation du site ni l’envoi d’un formulaire.</p>

    <h2>Gérer vos préférences</h2>
    <p>Vous pouvez accepter ou refuser les cookies optionnels ci-dessous. Votre nouveau choix s’applique aux prochaines actions réalisées sur le site.</p>
    <MeasurementConsentControls/>

    <h2>Paramètres du navigateur</h2>
    <p>Vous pouvez également supprimer les cookies et données locales depuis les réglages de votre navigateur. Leur suppression peut réinitialiser votre préférence et certaines informations liées à la session en cours.</p>

    <h2>Mise à jour de la politique</h2>
    <p>Cette politique peut évoluer pour refléter une modification du site, des outils utilisés ou des exigences applicables. La date de mise à jour figure en haut de cette page.</p>

    <h2>Contact</h2>
    <p>Pour toute question relative à cette politique, contactez-nous à <a href={`mailto:${contact.email}`}>{contact.email}</a>.</p>
  </>;
}

function ConditionsGeneralesUtilisation() {
  return <>
    <h1>Conditions générales d’utilisation</h1>
    <p className="lead">Les présentes conditions encadrent l’accès et l’utilisation du site {siteConfig.name.toLowerCase()}.fr. La consultation du site implique leur acceptation.</p>
    <LastUpdate/>

    <h2>Objet du site</h2>
    <p>Le site présente les activités de {siteConfig.name} dans le domaine du photovoltaïque professionnel et de la performance énergétique. Il permet également de transmettre une demande de contact ou de préqualification de projet.</p>

    <h2>Accès au site</h2>
    <p>Le site est accessible gratuitement, sous réserve de disposer d’une connexion internet et d’un équipement compatible. {siteConfig.name} peut interrompre temporairement tout ou partie du service pour des raisons de maintenance, de sécurité ou en cas d’événement indépendant de sa volonté.</p>

    <h2>Utilisation des formulaires</h2>
    <p>L’utilisateur s’engage à transmettre des informations exactes, à jour et nécessaires au traitement de sa demande. Toute utilisation frauduleuse, automatisée, abusive ou portant atteinte au fonctionnement du site est interdite.</p>
    <p>La transmission d’un formulaire ne vaut ni acceptation d’un projet, ni devis, ni engagement contractuel. Une étude et un échange avec nos équipes restent nécessaires avant toute proposition.</p>

    <h2>Informations publiées</h2>
    <p>Les contenus sont fournis à titre informatif. Les économies, financements, aides, performances ou conditions d’éligibilité dépendent notamment des caractéristiques réelles du site, des consommations, des équipements et des règles applicables au moment de l’étude.</p>

    <h2>Propriété intellectuelle</h2>
    <p>Les textes, visuels, éléments graphiques, marques, logos, documents et composants du site sont protégés par les droits de propriété intellectuelle. Leur reproduction ou réutilisation sans autorisation préalable est interdite, sauf exception prévue par la loi.</p>

    <h2>Liens et services tiers</h2>
    <p>Certains liens peuvent diriger vers des sites tiers. {siteConfig.name} ne contrôle pas leur contenu, leur disponibilité ni leurs pratiques et ne peut en être tenue responsable.</p>

    <h2>Données personnelles et cookies</h2>
    <p>Le traitement des données personnelles est décrit dans notre <Link to="/politique-de-confidentialite">politique de confidentialité</Link>. L’utilisation des cookies et la gestion des préférences sont détaillées dans notre <Link to="/gestion-des-cookies">politique de cookies</Link>.</p>

    <h2>Responsabilité</h2>
    <p>{siteConfig.name} met en œuvre des moyens raisonnables pour maintenir le site accessible et ses informations à jour. Elle ne peut toutefois garantir une disponibilité permanente ni l’absence totale d’erreurs. L’utilisateur reste responsable de l’usage qu’il fait des informations consultées.</p>

    <h2>Modification des conditions</h2>
    <p>Ces conditions peuvent être modifiées à tout moment. La version applicable est celle publiée sur le site à la date de la consultation.</p>

    <h2>Droit applicable et contact</h2>
    <p>Les présentes conditions sont soumises au droit français. Pour toute question, vous pouvez écrire à <a href={`mailto:${contact.email}`}>{contact.email}</a>.</p>
  </>;
}

const pages = {
  'mentions-legales': { title: 'Mentions légales', description: 'Éditeur, hébergeur et informations légales du site Maîtrise Énergie.', Content: MentionsLegales },
  'politique-de-confidentialite': { title: 'Politique de confidentialité', description: 'Comment Maîtrise Énergie collecte, utilise et protège vos données personnelles, conformément au RGPD.', Content: PolitiqueConfidentialite },
  'gestion-des-cookies': { title: 'Politique de cookies', description: 'Cookies, stockages locaux et gestion des préférences sur le site Maîtrise Énergie.', Content: GestionCookies },
  'conditions-generales-utilisation': { title: 'Conditions générales d’utilisation', description: 'Conditions encadrant l’accès et l’utilisation du site Maîtrise Énergie.', Content: ConditionsGeneralesUtilisation },
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
