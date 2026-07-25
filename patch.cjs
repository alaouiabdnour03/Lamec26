const fs = require('fs');
let code = fs.readFileSync('src/components/EspaceClient.tsx', 'utf-8');

code = code.replace(
  `import { DiagnosticWizard } from '../DiagnosticWizard';`,
  `import { DiagnosticWizard } from '../DiagnosticWizard';\nimport { ReportGenerator } from '../ReportGenerator';\n\nexport interface Dossier {\n  id: string;\n  date: string;\n  url?: string;\n  filename?: string;\n  sizeKb?: number;\n}`
);

code = code.replace(
  `  const [selectedTab, setSelectedTab] = useState('dashboard');\n  const [isWizardOpen, setIsWizardOpen] = useState(false);`,
  `  const [selectedTab, setSelectedTab] = useState('dashboard');\n  const [auditView, setAuditView] = useState<'list' | 'wizard' | 'generator'>('list');\n  const [pendingDiagnostic, setPendingDiagnostic] = useState<string | null>(null);\n  const [dossiers, setDossiers] = useState<Dossier[]>([]);`
);

let newJSX = `            <div className="bg-white rounded-[24px] p-8 lg:p-10 border border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_30px_rgba(0,0,0,0.02)] min-h-[600px]">
              
              {auditView === 'wizard' ? (
                <div className="flex flex-col gap-4">
                  <button onClick={() => setAuditView('list')} className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-4 w-fit">
                    ← Retour aux dossiers
                  </button>
                  <DiagnosticWizard 
                    onComplete={(data) => {
                      setPendingDiagnostic(JSON.stringify(data));
                      setAuditView('generator');
                    }}
                    onClose={() => setAuditView('list')}
                    inline={true}
                  />
                </div>
              ) : auditView === 'generator' && pendingDiagnostic ? (
                <div className="flex flex-col gap-4">
                  <button onClick={() => setAuditView('list')} className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-4 w-fit">
                    ← Retour aux dossiers
                  </button>
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                    <ReportGenerator 
                      diagnosticJson={pendingDiagnostic}
                      onBack={() => setAuditView('list')}
                      onSuccess={(url, filename, sizeKb) => {
                        const newDossier: Dossier = {
                          id: (dossiers.length + 1).toString(),
                          date: new Date().toLocaleString('fr-FR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          }),
                          url,
                          filename,
                          sizeKb
                        };
                        setDossiers([newDossier, ...dossiers]);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Banner Button */}
                  <div 
                    onClick={() => setAuditView('wizard')}
                    className="mb-12 border border-slate-200/60 rounded-[20px] p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <button className="bg-white border border-slate-200 text-slate-800 font-bold px-6 py-2.5 rounded-full flex items-center gap-2 mb-4 group-hover:border-slate-300 transition-colors shadow-sm text-sm pointer-events-none">
                      <span className="text-teal-600 text-lg leading-none">+</span>
                      Nouveau Diagnostic
                    </button>
                    <p className="text-sm text-slate-500 font-medium max-w-[400px]">
                      Lancez une nouvelle évaluation pour analyser vos besoins et générer un devis subventionné.
                    </p>
                  </div>

                  {/* Section Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vos récents Dossiers d'Audit</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Gérez vos diagnostics, rapports d'analyse stratégique et simulations de devis.</p>
                  </div>
                  
                  <hr className="border-slate-100 mb-8" />

                  {/* Folders Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dossiers.length === 0 ? (
                      <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        Aucun dossier d'audit pour le moment.
                      </div>
                    ) : (
                      dossiers.map((dossier) => (
                        <div key={dossier.id} onClick={() => { if(dossier.url) { const a = document.createElement('a'); a.href = dossier.url; a.download = dossier.filename || 'rapport.pdf'; a.click(); } }} className="flex items-center gap-4 p-4 rounded-[16px] border border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group relative">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                            <Folder className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[15px] font-bold text-slate-900">Dossier {dossier.id} {dossier.filename ? <span className="ml-2 text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Rapport généré</span> : ''}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span className="text-[12px] font-medium text-slate-500">Créé le {dossier.date}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>`;

const startIdx = code.indexOf('<div className="bg-white rounded-[24px] p-8 lg:p-10 border border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_10px_30px_rgba(0,0,0,0.02)] min-h-[600px]">');
const endIdx = code.indexOf('</div>\n          )}\n\n        </main>');
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newJSX + '\n' + code.substring(endIdx);
  fs.writeFileSync('src/components/EspaceClient.tsx', code);
  console.log('patched');
} else {
  console.log('could not find block');
}
