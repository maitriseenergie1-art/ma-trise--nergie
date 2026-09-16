export const eligibilitySteps = [
  {question:'Quel type de site souhaitez-vous équiper ?',type:'choice',options:['Site industriel','Bâtiment tertiaire','Entrepôt / plateforme logistique','Commerce','Exploitation agricole','Autre site professionnel'],field:'building'},
  {question:'Quelle surface de toiture ou d’exploitation est disponible ?',type:'choice',options:['Moins de 2 000 m²','2 000 à 5 000 m²','Plus de 5 000 m²','Je ne sais pas encore'],field:'size'},
  {question:'Quel est le montant mensuel de votre facture d’électricité ?',type:'choice',options:['Moins de 1 000 €','1 000 à 2 500 €','2 500 à 5 000 €','Plus de 5 000 €','Je ne sais pas encore'],field:'monthlyBill'},
  {question:'Comment vous recontacter ?',type:'form',field:'contact'},
];
