const fs = require('fs');
let code = fs.readFileSync('src/components/EspaceClient.tsx', 'utf-8');

code = code.replace(
  `import { ReportGenerator } from '../ReportGenerator';`,
  `import { ReportGenerator } from '../ReportGenerator';\nimport { supabase, DiagnosticData } from '../lib/supabase';\nimport { useEffect } from 'react';`
);

const oldInit = `  const displayData = data || {};
  
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [auditView, setAuditView] = useState<'list' | 'wizard' | 'generator'>('list');
  const [pendingDiagnostic, setPendingDiagnostic] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);`;

const newInit = `  const displayData = data || {};
  
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [auditView, setAuditView] = useState<'list' | 'wizard' | 'generator'>('list');
  const [pendingDiagnostic, setPendingDiagnostic] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [dbDiagnostics, setDbDiagnostics] = useState<DiagnosticData[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [activeDiagnosticId, setActiveDiagnosticId] = useState<string | null>(null);
  const [diagnosticInitialData, setDiagnosticInitialData] = useState<any>(undefined);
  const [diagnosticInitialStep, setDiagnosticInitialStep] = useState<number>(1);

  useEffect(() => {
    if (displayData.id) {
      loadDiagnostics();
    }
  }, [displayData.id]);

  const loadDiagnostics = async () => {
    setLoadingDocs(true);
    try {
      const { data: diags, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('client_id', displayData.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDbDiagnostics(diags || []);
      
      // Map to Dossier type for UI
      const mapped = (diags || []).map((d: any) => ({
        id: d.id.substring(0, 8).toUpperCase(),
        date: new Date(d.created_at).toLocaleString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        url: d.report_url,
        filename: d.report_filename,
        sizeKb: d.report_size_kb,
        rawId: d.id,
        status: d.status,
        step: d.current_step,
        data: d.data
      }));
      setDossiers(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };`;

code = code.replace(oldInit, newInit);

code = code.replace(
  `                  <DiagnosticWizard 
                    onComplete={(data) => {
                      setPendingDiagnostic(JSON.stringify(data));
                      setAuditView('generator');
                    }}
                    onClose={() => setAuditView('list')}
                    inline={true}
                  />`,
  `                  <DiagnosticWizard 
                    companyInfo={{ company_name: displayData.companyName, ice: displayData.ice, email: displayData.email, phone: displayData.phone }}
                    initialData={diagnosticInitialData}
                    initialStep={diagnosticInitialStep}
                    onComplete={async (diagData) => {
                      try {
                        let finalId = activeDiagnosticId;
                        if (!finalId) {
                          const { data: newDiag } = await supabase
                            .from('diagnostics')
                            .insert([{
                              client_id: displayData.id,
                              status: 'completed',
                              current_step: 999,
                              data: diagData
                            }])
                            .select().single();
                          if (newDiag) finalId = newDiag.id;
                        } else {
                          await supabase
                            .from('diagnostics')
                            .update({ status: 'completed', current_step: 999, data: diagData })
                            .eq('id', finalId);
                        }
                        setActiveDiagnosticId(finalId || null);
                        setPendingDiagnostic(JSON.stringify(diagData));
                        setAuditView('generator');
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    onSaveDraft={async (draftData, step) => {
                      if (!displayData.id) return;
                      try {
                        if (!activeDiagnosticId) {
                          const { data: newDiag } = await supabase
                            .from('diagnostics')
                            .insert([{
                              client_id: displayData.id,
                              status: 'draft',
                              current_step: step,
                              data: draftData
                            }])
                            .select().single();
                          if (newDiag) setActiveDiagnosticId(newDiag.id);
                        } else {
                          await supabase
                            .from('diagnostics')
                            .update({
                              current_step: step,
                              data: draftData
                            })
                            .eq('id', activeDiagnosticId);
                        }
                      } catch (err) {
                        console.error("Failed to save draft:", err);
                      }
                    }}
                    onClose={() => setAuditView('list')}
                    inline={true}
                  />`
);

code = code.replace(
  `                    <ReportGenerator 
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
                    />`,
  `                    <ReportGenerator 
                      diagnosticJson={pendingDiagnostic}
                      diagnosticId={activeDiagnosticId}
                      onBack={() => setAuditView('list')}
                      onSuccess={async (url, filename, sizeKb) => {
                        // The ReportGenerator will handle uploading to Supabase Storage and updating the DB record.
                        // So we just need to reload the UI list.
                        await loadDiagnostics();
                      }}
                    />`
);

code = code.replace(
  `                  <div 
                    onClick={() => setAuditView('wizard')}
                    className="mb-12 border border-slate-200/60 rounded-[20px] p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >`,
  `                  <div 
                    onClick={() => {
                      setActiveDiagnosticId(null);
                      setDiagnosticInitialData(undefined);
                      setDiagnosticInitialStep(1);
                      setAuditView('wizard');
                    }}
                    className="mb-12 border border-slate-200/60 rounded-[20px] p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >`
);

const oldMap = `                      dossiers.map((dossier) => (
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
                      ))`;

const newMap = `                      dossiers.map((dossier: any) => (
                        <div key={dossier.id} onClick={() => { 
                          if(dossier.url) { 
                            const a = document.createElement('a'); 
                            a.href = dossier.url; 
                            a.download = dossier.filename || 'rapport.pdf'; 
                            a.click(); 
                          } else if (dossier.status === 'draft') {
                            setActiveDiagnosticId(dossier.rawId);
                            setDiagnosticInitialData(dossier.data);
                            setDiagnosticInitialStep(dossier.step);
                            setAuditView('wizard');
                          } else {
                            setActiveDiagnosticId(dossier.rawId);
                            setPendingDiagnostic(JSON.stringify(dossier.data));
                            setAuditView('generator');
                          }
                        }} className="flex items-center gap-4 p-4 rounded-[16px] border border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group relative">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                            <Folder className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[15px] font-bold text-slate-900">
                              Dossier {dossier.id} 
                              {dossier.filename ? <span className="ml-2 text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Rapport généré</span> : ''}
                              {dossier.status === 'draft' ? <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Brouillon (Étape {dossier.step})</span> : ''}
                              {dossier.status === 'completed' && !dossier.filename ? <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">À générer</span> : ''}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span className="text-[12px] font-medium text-slate-500">Créé le {dossier.date}</span>
                            </div>
                          </div>
                        </div>
                      ))`;

code = code.replace(oldMap, newMap);

fs.writeFileSync('src/components/EspaceClient.tsx', code);
console.log('patched espace');
