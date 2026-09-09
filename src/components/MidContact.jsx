import { Button, Container } from './ui';
export function MidContact({title='Vous avez identifié un poste énergétique à améliorer ?',text='Un échange permet de préciser vos installations, vos contraintes et les prochaines étapes à étudier.',label='Parler de mon projet',sourceCta,solutionInterest,sectorInterest}) {
  return <section className="mid-contact"><Container><div><h2>{title}</h2><p>{text}</p></div><Button to="/contact" sourceCta={sourceCta} solutionInterest={solutionInterest} sectorInterest={sectorInterest}>{label}</Button></Container></section>;
}
