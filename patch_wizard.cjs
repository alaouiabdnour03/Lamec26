const fs = require('fs');
let code = fs.readFileSync('src/DiagnosticWizard.tsx', 'utf-8');

const oldHeader = `        <div className="bg-transparent border-b border-slate-100 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Nouveau diagnostic & cadrage</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Évaluation Opérationnelle & Pratiques Digitales</p>
          </div>
          <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-start">
            {!inline && onClose && (
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors bg-transparent border-none py-1.5 px-0 cursor-pointer"
              >
                Quitter le diagnostic
              </button>
            )}
          </div>
        </div>`;

const newHeader = `        <div className="bg-transparent border-b border-slate-100 py-5 relative flex flex-col sm:flex-row justify-center items-center gap-4 shrink-0">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Diagnostic+</h2>
          </div>
          {!inline && onClose && (
            <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2">
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors bg-transparent border-none py-1.5 px-0 cursor-pointer"
              >
                Quitter
              </button>
            </div>
          )}
        </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/DiagnosticWizard.tsx', code);
console.log('patched wizard');
