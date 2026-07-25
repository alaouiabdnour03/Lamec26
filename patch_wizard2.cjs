const fs = require('fs');
let code = fs.readFileSync('src/DiagnosticWizard.tsx', 'utf-8');

code = code.replace(
  "formData.digitalisation[proc.key] === val ? 'border-[#0f172a] bg-[#0f172a] text-white' : 'border-slate-200'",
  "formData.digitalisation[proc.key] === val ? 'border-[#0f172a] bg-[#0f172a] text-white shadow-md' : 'border-slate-300 hover:border-slate-400 bg-white shadow-sm transition-all'"
);

fs.writeFileSync('src/DiagnosticWizard.tsx', code);
console.log('patched wizard2');
