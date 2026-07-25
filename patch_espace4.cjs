const fs = require('fs');
let code = fs.readFileSync('src/components/EspaceClient.tsx', 'utf-8');

const oldHeader = `                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vos récents Dossiers d'Audit</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Gérez vos diagnostics, rapports d'analyse stratégique et simulations de devis.</p>
                  </div>`;

const newHeader = `                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Derniers diagnostics</h2>
                  </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/EspaceClient.tsx', code);
console.log('patched espace4');
