const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all back to simple alert
code = code.replace(
    /onClick=\{\(\)=>\{\s*console\.log\("Formulaire soumis:", formData\);\s*alert\("Votre dossier d'éligibilité a été soumis avec succès !"\);\s*\}\}/g,
    `onClick={() => alert("Action cliquée !")}`
);

// Specifically target the submit button wrapper and make it submit the form
// The button is inside a div with "Valider mon dossier d'éligibilité"
code = code.replace(
    /<div className="flex items-center bg-\[#FFFFFF00\] py-2 mr-\[101px\] rounded-\[9999px\]" \s*style=\{\{\s*boxShadow: "0px 20px 50px #00162F80"\s*\}\}>\s*<div className="flex flex-col shrink-0 items-center py-\[7px\] ml-8 mr-4">\s*<span className="text-white text-base font-bold" >\s*\{"Valider mon dossier d'éligibilité"\}\s*<\/span>\s*<\/div>\s*<button className="flex flex-col shrink-0 items-start bg-\[#FFFFFF00\] text-left py-\[11px\] px-3 mr-2 rounded-\[9999px\] border-0"\s*onClick=\{\(\) => alert\("Action cliquée !"\)\}>/g,
    `<div className="flex items-center bg-[#FFFFFF00] py-2 mr-[101px] rounded-[9999px] cursor-pointer" 
\t\t\t\t\t\t\t\t\t\t\t\tstyle={{
\t\t\t\t\t\t\t\t\t\t\t\t\tboxShadow: "0px 20px 50px #00162F80"
\t\t\t\t\t\t\t\t\t\t\t\t}}
\t\t\t\t\t\t\t\t\t\t\t\tonClick={() => {
\t\t\t\t\t\t\t\t\t\t\t\t\tconsole.log("Formulaire soumis:", formData);
\t\t\t\t\t\t\t\t\t\t\t\t\talert("Votre dossier d'éligibilité a été soumis avec succès !");
\t\t\t\t\t\t\t\t\t\t\t\t}}>
\t\t\t\t\t\t\t\t\t\t\t\t<div className="flex flex-col shrink-0 items-center py-[7px] ml-8 mr-4">
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-white text-base font-bold" >
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Valider mon dossier d'éligibilité"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t<button className="flex flex-col shrink-0 items-start bg-[#FFFFFF00] text-left py-[11px] px-3 mr-2 rounded-[9999px] border-0">`
);


// Also target the File buttons to trigger file selection (we'll just use a generic hidden file input)
code = code.replace(
    /const \[formData, setFormData\] = useState\(\{/,
    `const fileInputRef = React.useRef<HTMLInputElement>(null);
\tconst [formData, setFormData] = useState({`
);

code = code.replace(
    /onClick=\{\(\) => alert\("Action cliquée !"\)\}>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[167px\]" >\s*\{"Sélectionner un fichier \(Optionnel\)"\}\s*<\/span>/g,
    `onClick={() => fileInputRef.current?.click()}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[167px]" >
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Sélectionner un fichier (Optionnel)"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);
code = code.replace(
    /onClick=\{\(\) => alert\("Action cliquée !"\)\}>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[244px\]" >\s*\{"Sélectionner un fichier"\}\s*<\/span>/g,
    `onClick={() => fileInputRef.current?.click()}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[244px]" >
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Sélectionner un fichier"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// Add the hidden file input inside the main container
code = code.replace(
    /<div className="w-full min-h-screen overflow-x-hidden flex justify-center items-start bg-\[#FAFCFA\]">/,
    `<div className="w-full min-h-screen overflow-x-hidden flex justify-center items-start bg-[#FAFCFA]">
\t\t\t<input type="file" ref={fileInputRef} className="hidden" />`
);


fs.writeFileSync('src/App.tsx', code);
