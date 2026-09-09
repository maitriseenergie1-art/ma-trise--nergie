export const eligibilitySteps = [
  {question:'Quel est votre type de bâtiment ?',type:'choice',options:['Industrie','Tertiaire','Entrepôt','Commerce','Santé','Hôtel / restauration'],field:'building'},
  {question:'Quelle est la taille approximative de votre site ?',type:'choice',options:['Moins de 1 000 m²','1 000 à 5 000 m²','Plus de 5 000 m²','Je ne sais pas'],field:'size'},
  {question:'Quels équipements sont concernés ?',type:'choice',options:['Chauffage ou CVC','Froid','Éclairage','Enveloppe / isolation','Plusieurs postes'],field:'equipment'},
  {question:'Quel type de projet envisagez-vous ?',type:'choice',options:['Étude initiale','Travaux identifiés','Pilotage / régulation','Je souhaite être conseillé'],field:'project'},
  {question:'Quel est votre calendrier ?',type:'choice',options:['Dans les 3 mois','Cette année','À plus long terme','À définir'],field:'timeline'},
  {question:'Comment vous recontacter ?',type:'form',field:'contact'},
];
