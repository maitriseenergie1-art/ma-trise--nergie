import { solutions } from './solutions';
import { sectors } from './sectors';

export const primaryNavigation = [
  { label:'Solutions', path:'/solutions', children:solutions.map(({slug,title,summary,category})=>({label:title,path:`/solutions/${slug}`,description:summary,category})) },
  { label:'Secteurs', path:'/secteurs', children:sectors.map(({slug,title,description})=>({label:title,path:`/secteurs/${slug}`,description})) },
  { label:'Financement', path:'/financement-cee' }, { label:'Réalisations', path:'/realisations' }, { label:'Blog', path:'/blog' }, { label:'Ressources', path:'/ressources' },
];
