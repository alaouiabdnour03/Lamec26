const fs = require('fs');
let code = fs.readFileSync('src/components/EspaceClient.tsx', 'utf-8');

code = code.replace(
  `import { \n  Building2, \n  Home, \n  Folder, \n  Users, \n  FileText, \n  Compass, \n  Check, \n  File,\n  FolderLock,\n  FolderOpen\n} from 'lucide-react';`,
  `import { \n  Building2, \n  Home, \n  Folder, \n  Users, \n  FileText, \n  Compass, \n  Check, \n  File,\n  FolderLock,\n  FolderOpen,\n  Download,\n  ExternalLink\n} from 'lucide-react';`
);

code = code.replace(
  `const [auditView, setAuditView] = useState<'list' | 'wizard' | 'generator'>('list');`,
  `const [auditView, setAuditView] = useState<'list' | 'wizard' | 'generator' | 'viewer'>('list');`
);

const oldClick = `                        <div key={dossier.id} onClick={() => { 
                          if(dossier.url) { 
                            const a = document.createElement('a'); 
                            a.href = dossier.url;
                            a.target = '_blank';
                            a.download = dossier.filename || 'rapport.pdf'; 
                            a.click(); 
                          } else if (dossier.status === 'draft') {`;

const newClick = `                        <div key={dossier.id} onClick={() => { 
                          if(dossier.url) { 
                            setActiveDiagnosticId(dossier.rawId);
                            setAuditView('viewer');
                          } else if (dossier.status === 'draft') {`;
code = code.replace(oldClick, newClick);

const renderGenerator = `              ) : auditView === 'generator' && pendingDiagnostic ? (
                <div className="flex flex-col gap-4">
                  <button onClick={() => setAuditView('list')} className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-4 w-fit">
                    ← Retour aux dossiers
                  </button>
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                    <ReportGenerator 
                      diagnosticJson={pendingDiagnostic}
                      diagnosticId={activeDiagnosticId}
                      onBack={() => setAuditView('list')}
                      onSuccess={async (url, filename, sizeKb) => {
                        // The ReportGenerator will handle uploading to Supabase Storage and updating the DB record.
                        // So we just need to reload the UI list.
                        await loadDiagnostics();
                      }}
                    />
                  </div>
                </div>
              ) : null}`;

const newRenderGenerator = `              ) : auditView === 'generator' && pendingDiagnostic ? (
                <div className="flex flex-col gap-4">
                  <button onClick={() => setAuditView('list')} className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-4 w-fit">
                    ← Retour aux dossiers
                  </button>
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                    <ReportGenerator 
                      diagnosticJson={pendingDiagnostic}
                      diagnosticId={activeDiagnosticId}
                      onBack={() => setAuditView('list')}
                      onSuccess={async (url, filename, sizeKb) => {
                        // The ReportGenerator will handle uploading to Supabase Storage and updating the DB record.
                        // So we just need to reload the UI list.
                        await loadDiagnostics();
                      }}
                    />
                  </div>
                </div>
              ) : auditView === 'viewer' && activeDiagnosticId ? (
                (() => {
                  const dossier = dossiers.find(d => d.rawId === activeDiagnosticId);
                  if (!dossier) return null;
                  return (
                    <div className="flex flex-col gap-4">
                      <button onClick={() => setAuditView('list')} className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-4 w-fit">
                        ← Retour aux dossiers
                      </button>
                      <div className="bg-white border border-slate-200/60 rounded-3xl p-12 shadow-sm text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                          <Check className="w-10 h-10 text-teal-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Rapport d'Audit Généré</h2>
                        <p className="text-slate-500 mb-10 max-w-lg text-lg">
                          Votre rapport d'analyse stratégique pour le dossier <strong>{dossier.id}</strong> est prêt.
                        </p>
                        
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              const a = document.createElement('a'); 
                              a.href = dossier.url;
                              a.target = '_blank';
                              a.download = dossier.filename || 'rapport.pdf'; 
                              a.click();
                            }}
                            className="bg-[#0f766e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#0d635c] transition-all shadow-md flex items-center gap-2"
                          >
                            <Download className="w-5 h-5" />
                            Télécharger le PDF ({dossier.sizeKb ? dossier.sizeKb.toFixed(0) + ' Ko' : '...'})
                          </button>
                          
                          <a
                            href={dossier.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 text-slate-800 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                          >
                            <ExternalLink className="w-5 h-5" />
                            Ouvrir
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : null}`;

code = code.replace(renderGenerator, newRenderGenerator);

fs.writeFileSync('src/components/EspaceClient.tsx', code);
console.log('patched espace3');
