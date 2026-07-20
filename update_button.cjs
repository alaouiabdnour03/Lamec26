const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    /onClick=\{\(\)=>alert\("Pressed!"\)\}/g,
    `onClick={()=>{
\t\t\t\t\t\t\t\t\t\t\t\tconsole.log("Formulaire soumis:", formData);
\t\t\t\t\t\t\t\t\t\t\t\talert("Votre dossier d'éligibilité a été soumis avec succès !");
\t\t\t\t\t\t\t\t\t\t\t}}`
);

fs.writeFileSync('src/App.tsx', code);
