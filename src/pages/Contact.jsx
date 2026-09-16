import { useEffect } from 'react';
import { Clock3, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { trackEvent } from '../services/analyticsService';
import { Breadcrumb, Container, Eyebrow } from '../components/ui';
import { Seo } from '../components/Seo';
import { ContactForm } from '../features/contact/ContactForm';
import { breadcrumbSchema } from '../lib/structuredData';

export default function Contact(){
  useEffect(()=>{trackEvent('contact_started',{});},[]);
  const phoneHref=`tel:${siteConfig.contact.phone.replace(/\s/g,'')}`;
  return <>
    <Seo title="Contact — étude de performance énergétique" description="Contactez Maîtrise Énergie pour qualifier un projet de performance énergétique, de GTB, CVC, froid, isolation ou utilités industrielles." canonicalPath="/contact" schema={breadcrumbSchema([{name:'Accueil',path:'/'},{name:'Contact',path:'/contact'}])}/>
    <main className="contact-page"><Container><Breadcrumb current="Contact"/><div className="contact-layout"><div><Eyebrow>Contact</Eyebrow><h1>Parlons de votre site et de vos priorités énergétiques.</h1><p className="lead">Décrivez votre bâtiment, votre procédé ou l’équipement concerné. Nous vous recontactons pour préciser le contexte, les informations disponibles et la prochaine étape utile.</p><div className="contact-reassurance"><span><Clock3/>Réponse pendant les horaires ouvrés</span><span><ShieldCheck/>Informations traitées confidentiellement</span></div><div className="contact-details"><a href={`mailto:${siteConfig.contact.email}`} onClick={()=>trackEvent('email_clicked',{channel:'email'})}><Mail/><span>Email<small>{siteConfig.contact.email}</small></span></a><a href={phoneHref} onClick={()=>trackEvent('phone_clicked',{channel:'contact'})}><Phone/><span>Téléphone<small>{siteConfig.contact.phone}</small></span></a><div><MapPin/><span>Adresse<small>{siteConfig.contact.address}</small></span></div><div><Clock3/><span>Disponibilités<small>{siteConfig.contact.hours}</small></span></div></div><div className="contact-location"><strong>Nous trouver</strong><p>{siteConfig.contact.address}</p>{siteConfig.contact.mapEmbedUrl && <iframe title="Localisation de Maîtrise Énergie" src={siteConfig.contact.mapEmbedUrl} loading="lazy"/>}</div></div><div className="contact-form"><ContactForm/></div></div></Container></main>
  </>;
}
