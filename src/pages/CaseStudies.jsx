import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { useState } from 'react';
import { images } from '../data/images';
import { caseStudies } from '../data/caseStudies';
import { Container, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { CaseCard } from '../components/cards';
export default function CaseStudies(){const [filter,setFilter]=useState('Tous');const filters=['Tous',...Array.from(new Set(caseStudies.flatMap(item=>item.tags)))];const items=filter==='Tous'?caseStudies:caseStudies.filter(item=>item.tags.includes(filter));return <><Seo title="Réalisations" description="Exemples de présentation de projets de performance énergétique."/><PageHero eyebrow="Réalisations" title="Des exemples de projets à lire comme des systèmes." text="Chaque carte est un exemple de démonstration : elle illustre un contexte et des solutions possibles, sans représenter une référence client." image={heroImages.industry} imageAlt=""/><Section><Container><div className="filter-bar">{filters.map(item=><button onClick={()=>setFilter(item)} className={filter===item?'active':''} key={item}>{item}</button>)}</div>{items.length?<CardCarousel key={filter} label="Nos réalisations">{items.map(item=><CaseCard item={item} key={item.slug}/>)}</CardCarousel>:<p className="empty-state">Aucun projet de démonstration ne correspond à ce filtre.</p>}</Container></Section></>}
