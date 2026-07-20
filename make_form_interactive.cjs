const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for the form
code = code.replace(
    /const \[scale, setScale\] = useState\(1\);/,
    `const [scale, setScale] = useState(1);
\tconst [formData, setFormData] = useState({
\t\traisonSociale: '',
\t\tice: '',
\t\tcnss: '',
\t\temail: '',
\t\tphone: '',
\t\ttrancheCa: '',
\t\ttypologie: [],
\t\thasWebsite: '',
\t\tplateformes: '',
\t\tbesoins: [],
\t\tpack: ''
\t});
\tconst handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
\tconst toggleArrayItem = (field, value) => setFormData(prev => ({
\t\t...prev,
\t\t[field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value]
\t}));
`
);

// 2. Adjust scale responsiveness
// The user asked to "zoom out is a little bit over decrease it a little" 
// This means scale was too low, let's use a smaller divisor or min clamp
code = code.replace(
    /if \(width < 1920\) \{\s*setScale\(width \/ 1920\);\s*\} else \{/,
    `if (width < 1920) {
\t\t\t\tsetScale(Math.max(width / 1600, 0.4)); // reduced zoom out effect
\t\t\t} else {`
);

// 3. Replace text inputs
// Raison Sociale
code = code.replace(
    /<div className="flex flex-col shrink-0 items-start pr-\[26px\]">\s*<span className="text-\[#1B2A4A\] text-sm" >\s*\{"Raison Sociale :"\}\s*<\/span>\s*<\/div>\s*<div className="bg-\[#FAFCFA\] w-\[277px\] h-\[42px\] rounded-xl border border-solid border-\[#1B2A4A1A\]">\s*<\/div>/g,
    `<div className="flex flex-col shrink-0 items-start pr-[26px]">
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm" >
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Raison Sociale :"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t<input type="text" value={formData.raisonSociale} onChange={(e) => handleInputChange('raisonSociale', e.target.value)} className="bg-[#FAFCFA] w-[277px] h-[42px] rounded-xl border border-solid border-[#1B2A4A1A] px-3 text-[#1B2A4A] text-sm outline-none focus:border-[#F59E0B]" />`
);

// ICE
code = code.replace(
    /<div className="flex flex-col shrink-0 items-start pr-\[29px\]">\s*<span className="text-\[#1B2A4A\] text-sm w-24" >\s*\{"ICE \(Identifiant\\nFiscal\) :"\}\s*<\/span>\s*<\/div>\s*<div className="bg-\[#FAFCFA\] w-\[277px\] h-\[42px\] rounded-xl border border-solid border-\[#1B2A4A1A\]">\s*<\/div>/g,
    `<div className="flex flex-col shrink-0 items-start pr-[29px]">
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm w-24" >
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"ICE (Identifiant\\nFiscal) :"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t<input type="text" value={formData.ice} onChange={(e) => handleInputChange('ice', e.target.value)} className="bg-[#FAFCFA] w-[277px] h-[42px] rounded-xl border border-solid border-[#1B2A4A1A] px-3 text-[#1B2A4A] text-sm outline-none focus:border-[#F59E0B]" />`
);

// N CNSS
code = code.replace(
    /<span className="text-\[#1B2A4A\] text-sm w-\[118px\]" >\s*\{"N° CNSS & Effectif\\n:"\}\s*<\/span>\s*<div className="bg-\[#FAFCFA\] w-\[277px\] h-\[42px\] rounded-xl border border-solid border-\[#1B2A4A1A\]">\s*<\/div>/g,
    `<span className="text-[#1B2A4A] text-sm w-[118px]" >
\t\t\t\t\t\t\t\t\t\t\t\t\t{"N° CNSS & Effectif\\n:"}
\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t\t<input type="text" value={formData.cnss} onChange={(e) => handleInputChange('cnss', e.target.value)} className="bg-[#FAFCFA] w-[277px] h-[42px] rounded-xl border border-solid border-[#1B2A4A1A] px-3 text-[#1B2A4A] text-sm outline-none focus:border-[#F59E0B]" />`
);

// Email
code = code.replace(
    /<span className="text-\[#1B2A4A\] text-sm" >\s*\{"Email de contact :"\}\s*<\/span>\s*<div className="bg-\[#FAFCFA\] w-\[277px\] h-\[42px\] rounded-xl border border-solid border-\[#1B2A4A1A\]">\s*<\/div>/g,
    `<span className="text-[#1B2A4A] text-sm" >
\t\t\t\t\t\t\t\t\t\t\t\t\t{"Email de contact :"}
\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t\t<input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-[#FAFCFA] w-[277px] h-[42px] rounded-xl border border-solid border-[#1B2A4A1A] px-3 text-[#1B2A4A] text-sm outline-none focus:border-[#F59E0B]" />`
);

// Telephone
code = code.replace(
    /<div className="flex flex-col shrink-0 items-start pr-\[52px\]">\s*<span className="text-\[#1B2A4A\] text-sm" >\s*\{"Téléphone :"\}\s*<\/span>\s*<\/div>\s*<div className="bg-\[#FAFCFA\] w-\[277px\] h-\[42px\] rounded-xl border border-solid border-\[#1B2A4A1A\]">\s*<\/div>/g,
    `<div className="flex flex-col shrink-0 items-start pr-[52px]">
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm" >
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Téléphone :"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t<input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="bg-[#FAFCFA] w-[277px] h-[42px] rounded-xl border border-solid border-[#1B2A4A1A] px-3 text-[#1B2A4A] text-sm outline-none focus:border-[#F59E0B]" />`
);


// 4. Replace Radio Buttons
// < 10M MAD
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5">\s*<div className="bg-white w-5 h-5 rounded-\[9999px\] border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm" >\s*\{"< 10M MAD"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 cursor-pointer" onClick={() => handleInputChange('trancheCa', '< 10M MAD')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-full border border-solid flex items-center justify-center \${formData.trancheCa === '< 10M MAD' ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.trancheCa === '< 10M MAD' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm cursor-pointer" onClick={() => handleInputChange('trancheCa', '< 10M MAD')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"< 10M MAD"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// > 10M MAD
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5">\s*<div className="bg-white w-5 h-5 rounded-\[9999px\] border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm" >\s*\{"> 10M MAD"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 cursor-pointer" onClick={() => handleInputChange('trancheCa', '> 10M MAD')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-full border border-solid flex items-center justify-center \${formData.trancheCa === '> 10M MAD' ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.trancheCa === '> 10M MAD' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm cursor-pointer" onClick={() => handleInputChange('trancheCa', '> 10M MAD')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"> 10M MAD"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);


// 5. Checkboxes (Typologie de l'activité)
// Hôtel / Riad
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5 mr-3">\s*<div className="bg-white w-5 h-5 rounded-md border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[206px\]" >\s*\{"Hôtel \/ Riad \/ Maison d'Hôte"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 mr-3 cursor-pointer" onClick={() => toggleArrayItem('typologie', "Hôtel / Riad / Maison d'Hôte")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-md border border-solid flex items-center justify-center \${formData.typologie.includes("Hôtel / Riad / Maison d'Hôte") ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.typologie.includes("Hôtel / Riad / Maison d'Hôte") && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[206px] cursor-pointer select-none" onClick={() => toggleArrayItem('typologie', "Hôtel / Riad / Maison d'Hôte")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Hôtel / Riad / Maison d'Hôte"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// Agence de Voyages
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5 mr-3">\s*<div className="bg-white w-5 h-5 rounded-md border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[191px\]" >\s*\{"Agence de Voyages \/ Réceptif"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 mr-3 cursor-pointer" onClick={() => toggleArrayItem('typologie', "Agence de Voyages / Réceptif")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-md border border-solid flex items-center justify-center \${formData.typologie.includes("Agence de Voyages / Réceptif") ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.typologie.includes("Agence de Voyages / Réceptif") && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[191px] cursor-pointer select-none" onClick={() => toggleArrayItem('typologie', "Agence de Voyages / Réceptif")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Agence de Voyages / Réceptif"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// École de Surf
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5 mr-3">\s*<div className="bg-white w-5 h-5 rounded-md border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[135px\]" >\s*\{"École de Surf \/ Club Nautique & Loisirs"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 mr-3 cursor-pointer" onClick={() => toggleArrayItem('typologie', "École de Surf / Club Nautique & Loisirs")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-md border border-solid flex items-center justify-center \${formData.typologie.includes("École de Surf / Club Nautique & Loisirs") ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.typologie.includes("École de Surf / Club Nautique & Loisirs") && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[135px] cursor-pointer select-none" onClick={() => toggleArrayItem('typologie', "École de Surf / Club Nautique & Loisirs")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"École de Surf / Club Nautique & Loisirs"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);


// 6. Avez-vous un site web?
// Oui
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5">\s*<div className="bg-white w-5 h-5 rounded-\[9999px\] border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm" >\s*\{"Oui"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 cursor-pointer" onClick={() => handleInputChange('hasWebsite', 'Oui')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-full border border-solid flex items-center justify-center \${formData.hasWebsite === 'Oui' ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.hasWebsite === 'Oui' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm cursor-pointer select-none" onClick={() => handleInputChange('hasWebsite', 'Oui')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Oui"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// Non
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5">\s*<div className="bg-white w-5 h-5 rounded-\[9999px\] border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm" >\s*\{"Non"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 cursor-pointer" onClick={() => handleInputChange('hasWebsite', 'Non')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-full border border-solid flex items-center justify-center \${formData.hasWebsite === 'Non' ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.hasWebsite === 'Non' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm cursor-pointer select-none" onClick={() => handleInputChange('hasWebsite', 'Non')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Non"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);


// 7. Input for platforms
code = code.replace(
    /value=\{input1\}/g,
    `value={formData.plateformes}`
);
code = code.replace(
    /onChange=\{\(event\)=>onChangeInput1\(event.target\.value\)\}/g,
    `onChange={(event)=>handleInputChange('plateformes', event.target.value)}`
);

// 8. 4. Vos besoins immédiats & prioritaires
// Répondre instantanément sur WhatsApp aux demandes
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5 mr-3">\s*<div className="bg-white w-5 h-5 rounded-md border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[47px\]" >\s*\{"Répondre instantanément sur WhatsApp aux demandes"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 mr-3 cursor-pointer" onClick={() => toggleArrayItem('besoins', "WhatsApp")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-md border border-solid flex items-center justify-center \${formData.besoins.includes("WhatsApp") ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.besoins.includes("WhatsApp") && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[47px] cursor-pointer select-none" onClick={() => toggleArrayItem('besoins', "WhatsApp")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Répondre instantanément sur WhatsApp aux demandes"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// Avoir des photos/vidéo professionnelles et vues de drone
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5 mr-3">\s*<div className="bg-white w-5 h-5 rounded-md border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[37px\]" >\s*\{"Avoir des photos\/vidéo professionnelles et vues de drone"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 mr-3 cursor-pointer" onClick={() => toggleArrayItem('besoins', "Photos")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-md border border-solid flex items-center justify-center \${formData.besoins.includes("Photos") ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.besoins.includes("Photos") && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[37px] cursor-pointer select-none" onClick={() => toggleArrayItem('besoins', "Photos")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Avoir des photos/vidéo professionnelles et vues de drone"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// Éviter les erreurs d'overbooking entre Booking et Airbnb
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5 mr-3">\s*<div className="bg-white w-5 h-5 rounded-md border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm mr-\[50px\]" >\s*\{"Éviter les erreurs d'overbooking entre Booking et Airbnb"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 mr-3 cursor-pointer" onClick={() => toggleArrayItem('besoins', "Overbooking")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-md border border-solid flex items-center justify-center \${formData.besoins.includes("Overbooking") ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.besoins.includes("Overbooking") && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm mr-[50px] cursor-pointer select-none" onClick={() => toggleArrayItem('besoins', "Overbooking")}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"Éviter les erreurs d'overbooking entre Booking et Airbnb"}
\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// 9. Sélection du pack d'accompagnement
// PACK I
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5">\s*<div className="bg-white w-5 h-5 rounded-\[9999px\] border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<span className="text-\[#1B2A4A\] text-sm" >\s*\{"PACK I : IMMERSION DIGITALE \(Reste à charge : 3 000 MAD HT\)"\}\s*<\/span>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 cursor-pointer" onClick={() => handleInputChange('pack', 'PACK I')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-full border border-solid flex items-center justify-center \${formData.pack === 'PACK I' ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.pack === 'PACK I' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm cursor-pointer select-none" onClick={() => handleInputChange('pack', 'PACK I')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"PACK I : IMMERSION DIGITALE (Reste à charge : 3 000 MAD HT)"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>`
);

// PACK II
code = code.replace(
    /<div className="flex flex-col shrink-0 items-center pt-0\.5">\s*<div className="bg-white w-5 h-5 rounded-\[9999px\] border border-solid border-\[#1B2A4A33\]">\s*<\/div>\s*<\/div>\s*<div className="flex flex-col shrink-0 items-start pr-\[19px\]">\s*<span className="text-\[#1B2A4A\] text-sm w-\[389px\]" >\s*\{"PACK II : EXCELLENCE VISUELLE \(Reste à charge : 4 500 MAD\\nHT\)"\}\s*<\/span>\s*<\/div>/g,
    `<div className="flex flex-col shrink-0 items-center pt-0.5 cursor-pointer" onClick={() => handleInputChange('pack', 'PACK II')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className={\`w-5 h-5 rounded-full border border-solid flex items-center justify-center \${formData.pack === 'PACK II' ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#1B2A4A33] bg-white'}\`}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{formData.pack === 'PACK II' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div className="flex flex-col shrink-0 items-start pr-[19px]">
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span className="text-[#1B2A4A] text-sm w-[389px] cursor-pointer select-none" onClick={() => handleInputChange('pack', 'PACK II')}>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t{"PACK II : EXCELLENCE VISUELLE (Reste à charge : 4 500 MAD\\nHT)"}
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>`
);

fs.writeFileSync('src/App.tsx', code);
