import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { DiagnosticWizard } from './DiagnosticWizard';
import { 
  CheckCircle, 
  FileText, 
  ArrowLeft, 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Play,
  Info,
  Check
} from 'lucide-react';

export function EspaceClient({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [loginIce, setLoginIce] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // State for Diagnostic & Cadrage
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [diagnosticStep, setDiagnosticStep] = useState(1);
  const [submittingDiagnostic, setSubmittingDiagnostic] = useState(false);
  const [diagnosticStatus, setDiagnosticStatus] = useState('');

  const parseDiagnosticFromText = (text: string) => {
    if (!text) return null;

    // Check for serialized JSON metadata block first
    const marker = '--- DIAGNOSTIC_DRAFT_JSON ---';
    if (text.includes(marker)) {
      try {
        const parts = text.split(marker);
        const jsonStr = parts[1].trim();
        const parsedObj = JSON.parse(jsonStr);
        return parsedObj; // Holds { formData, currentStep }
      } catch (err) {
        console.error('Error parsing draft JSON:', err);
      }
    }

    // Fallback: legacy text representation parsing
    const effectifMatch = text.match(/• Effectif : (.*)/);
    const laboMatch = text.match(/• Laboratoire\(s\) de production : (.*)/);
    const p1Match = text.match(/• Point de douleur #1 : (.*)/);
    const p2Match = text.match(/• Point de douleur #2 : (.*)/);
    const p3Match = text.match(/• Point de douleur #3 : (.*)/);
    
    return {
      formData: {
        raisonSociale: text.match(/• Raison Sociale : (.*)/)?.[1]?.trim() || '',
        nomDirigeant: text.match(/• Dirigeant \/ Interlocuteur : (.*)/)?.[1]?.trim() || '',
        phoneEmail: text.match(/• Contact \(Tél\/Email\) : (.*)/)?.[1]?.trim() || '',
        effectif: effectifMatch ? effectifMatch[1].trim() : '',
        nbrLaboratoires: laboMatch && laboMatch[1].includes('Multi-sites') ? 'multi' : 'single',
        nbrLaboratoiresDetail: laboMatch && laboMatch[1].includes('Multi-sites') ? laboMatch[1].replace(/Multi-sites \((.*?)\)/, '$1').trim() : '',
        painPoint1: p1Match ? p1Match[1].trim() : '',
        painPoint2: p2Match ? p2Match[1].trim() : '',
        painPoint3: p3Match ? p3Match[1].trim() : ''
      },
      currentStep: 1
    };
  };

  const getCleanNeedsText = (needs: string) => {
    if (!needs) return '-';
    const marker = '--- DIAGNOSTIC_DRAFT_JSON ---';
    if (needs.includes(marker)) {
      return needs.split(marker)[0].trim();
    }
    return needs;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const { data: company, error: companyErr } = await supabase
        .from('entreprises')
        .select('id, company_name, email, sector, ice, phone, ca, has_website, platforms')
        .eq('ice', loginIce)
        .single();
        
      if (companyErr || !company) throw new Error('ICE introuvable');
      
      const { data: dossier, error: dossierErr } = await supabase
        .from('dossiers_subvention')
        .select('*')
        .eq('entreprise_id', company.id)
        .eq('access_code', loginCode)
        .single();
        
      if (dossierErr || !dossier) throw new Error("Code d'accès invalide");
      
      // Auto-restore diagnostic state if already submitted or draft saved
      const hasDiagnostic = dossier.needs?.includes('--- FICHE D\'IDENTITÉ') || dossier.needs?.includes('--- DIAGNOSTIC_DRAFT_JSON');
      if (hasDiagnostic) {
        const parsed = parseDiagnosticFromText(dossier.needs);
        if (parsed) {
          setDiagnosticData(parsed.formData || parsed);
          setDiagnosticStep(parsed.currentStep || 1);
          setDiagnosticCompleted(dossier.statut === 'Diagnostic soumis');
        }
      } else {
        setDiagnosticCompleted(false);
        setDiagnosticData(null);
        setDiagnosticStep(1);
      }

      setDashboardData({ company, dossier });
      setView('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Identifiants invalides');
    }
  };

  const formatDiagnosticText = (data: any) => {
    if (!data) return '';
    return `
--- FICHE D'IDENTITÉ & PRÉSENTATION ---
• Raison Sociale : ${data.raisonSociale || '-'}
• Dirigeant / Interlocuteur : ${data.nomDirigeant || '-'}
• Contact (Tél/Email) : ${data.phoneEmail || '-'}
• Effectif : ${data.effectif || '-'}
• Laboratoire(s) de production : ${data.nbrLaboratoires === 'multi' ? `Multi-sites (${data.nbrLaboratoiresDetail || 'Non spécifié'})` : 'Site unique'}

--- CADRAGE DE L'ACTIVITÉ ---
• Typologie des offres : ${Array.isArray(data.typologieOffres) ? data.typologieOffres.join(', ') : '-'}
• Méthode de chiffrage : ${Array.isArray(data.chiffrageMethode) ? data.chiffrageMethode.join(', ') : '-'}
• Difficultés de conversion / closing : ${data.difficultesClosing || '-'}

--- ORGANISATION & SUIVI ---
• Suivi d'avancement des dossiers : ${Array.isArray(data.suiviAvancement) ? data.suiviAvancement.join(', ') : '-'}
• Gestion des imprévus de dernière minute : ${Array.isArray(data.gestionImprevus) ? data.gestionImprevus.join(', ') : '-'}
• Évaluation du succès d'un projet : ${Array.isArray(data.evaluationSucces) ? data.evaluationSucces.join(', ') : '-'}

--- RESSOURCES & LOGISTIQUE ---
• Planification & gestion des extras : ${Array.isArray(data.planificationExtras) ? data.planificationExtras.join(', ') : '-'}
• Adéquation logistique & transport : ${data.adequationLogistique || '-'}

--- MATURITÉ DIGITALE ---
• CRM / Gestion commerciale : ${data.digitalisation?.crm || '-'}
• Chiffrage & fiches techniques : ${data.digitalisation?.chiffrage || '-'}
• Planification des recettes & labos : ${data.digitalisation?.recettes || '-'}
• Gestion du personnel & extras : ${data.digitalisation?.personnel || '-'}
• Suivi des stocks & achats : ${data.digitalisation?.stocks || '-'}
• Logistique & gestion de flotte : ${data.digitalisation?.flotte || '-'}
• Facturation & comptabilité : ${data.digitalisation?.facturation || '-'}
• Silos d'information identifiés : ${data.silosInformation || '-'}

--- CLÔTURE & RENTABILITÉ ---
• Processus de clôture financière : ${Array.isArray(data.clotureFinanciere) ? data.clotureFinanciere.join(', ') : '-'}
• Point de douleur #1 : ${data.painPoint1 || '-'}
• Point de douleur #2 : ${data.painPoint2 || '-'}
• Point de douleur #3 : ${data.painPoint3 || '-'}
    `.trim();
  };

  const serializeDiagnosticWithDraft = (data: any, currentStep: number) => {
    const textRepr = formatDiagnosticText(data);
    const draftObj = {
      formData: data,
      currentStep,
      isDraft: true,
      savedAt: new Date().toISOString()
    };
    return `${textRepr}\n\n--- DIAGNOSTIC_DRAFT_JSON ---\n${JSON.stringify(draftObj)}`;
  };

  const handleSaveDraft = async (data: any, stepNum: number) => {
    if (!dashboardData?.company) return;
    const company = dashboardData.company;

    try {
      const formattedText = serializeDiagnosticWithDraft(data, stepNum);
      const currentStatut = dashboardData.dossier?.statut || 'En attente de diagnostic';
      const nextStatut = currentStatut === 'Diagnostic soumis' ? 'Diagnostic soumis' : 'Diagnostic en cours';

      const { error: updateError } = await supabase
        .from('dossiers_subvention')
        .update({
          statut: nextStatut,
          needs: formattedText
        })
        .eq('entreprise_id', company.id);

      if (updateError) {
        throw new Error(`Erreur Supabase : ${updateError.message}`);
      }

      setDiagnosticData(data);
      setDiagnosticStep(stepNum);

      // Update local dashboardData model
      setDashboardData((prev: any) => ({
        ...prev,
        dossier: {
          ...prev.dossier,
          statut: nextStatut,
          needs: formattedText
        }
      }));
    } catch (err: any) {
      console.error('Failed to save diagnostic draft:', err);
      throw err;
    }
  };

  const handleDiagnosticComplete = async (data: any) => {
    if (!dashboardData?.company) return;
    const company = dashboardData.company;

    setSubmittingDiagnostic(true);
    setDiagnosticStatus('Enregistrement du diagnostic dans la base de données sécurisée...');
    try {
      const formattedText = serializeDiagnosticWithDraft(data, 6);
      
      // Update the subvention dossier in Supabase
      const { error: updateError } = await supabase
        .from('dossiers_subvention')
        .update({
          statut: 'Diagnostic soumis',
          needs: formattedText
        })
        .eq('entreprise_id', company.id);

      if (updateError) {
        throw new Error(`Erreur Supabase : ${updateError.message}`);
      }

      setDiagnosticStatus('Envoi du rapport de diagnostic par e-mail...');
      
      // Send diagnostic notification email
      await fetch('/api/send-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          diagnostic: data
        })
      });

      // Update local state
      setDiagnosticData(data);
      setDiagnosticStep(6);
      setDiagnosticCompleted(true);
      
      // Update local dashboardData model
      setDashboardData((prev: any) => ({
        ...prev,
        dossier: {
          ...prev.dossier,
          statut: 'Diagnostic soumis',
          needs: formattedText
        }
      }));

    } catch (err: any) {
      console.error('Failed to save diagnostic:', err);
      alert(`Une erreur est survenue lors de l'enregistrement : ${err.message}`);
    } finally {
      setSubmittingDiagnostic(false);
      setDiagnosticStatus('');
      setShowDiagnostic(false);
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 w-full text-slate-800 bg-[#f8fafc] font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img 
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/me08pjb3_expires_30_days.png" 
              className="w-14 h-10 object-contain mx-auto mb-3" 
              alt="Logo" 
            />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950">LA MEC CONSEILS</h1>
            <p className="text-xs text-[#0f766e] font-bold uppercase tracking-widest mt-0.5">Espace Client Partenaire</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(15,118,110,0.05)] w-full border border-slate-100/80">
            <h2 className="text-xl font-extrabold mb-6 text-center text-slate-900 tracking-tight">Connexion sécurisée</h2>
            
            {loginError && (
              <p className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-semibold leading-relaxed border border-red-100">
                ⚠️ {loginError}
              </p>
            )}

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-bold text-slate-700">
                <span className="block mb-1.5">Identifiant unique (ICE)</span>
                <input
                  type="text"
                  value={loginIce}
                  onChange={(e) => setLoginIce(e.target.value)}
                  placeholder="Ex: 001234567890123"
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm font-semibold"
                  required
                />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                <span className="block mb-1.5">Code de dossier confidentiel</span>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="Ex: LMC-892A"
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all font-mono tracking-wider text-sm font-semibold"
                  required
                />
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#0f766e] hover:bg-[#0d635c] text-white rounded-xl py-3.5 font-bold transition-all shadow-md shadow-teal-100 cursor-pointer text-sm uppercase tracking-wider"
            >
              Se connecter
            </button>

            <button 
              type="button" 
              onClick={onBack} 
              className="w-full mt-4 text-slate-400 hover:text-[#0f766e] text-xs font-extrabold transition-colors uppercase tracking-wider text-center cursor-pointer"
            >
              Retour à l'accueil
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'dashboard' && dashboardData) {
    const { company, dossier } = dashboardData;

    // calculate progress values
    const totalSteps = 6;
    const currentStep = diagnosticCompleted ? 6 : (diagnosticStep || 1);
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    const circleRadius = 24;
    const strokeWidth = 3;
    const circumference = 2 * Math.PI * circleRadius; // ~150.8
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
      <div className="min-h-screen bg-[#f8fafc] w-full p-6 text-[#115e59] font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <header className="flex flex-row justify-between items-center gap-4 bg-white px-8 py-5 rounded-[24px] shadow-sm border border-slate-100/80 font-sans">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Espace Partenaire</h1>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {company.company_name} <span className="text-slate-300 mx-1.5">•</span> {company.ice}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setDashboardData(null);
                  setDiagnosticCompleted(false);
                  setDiagnosticData(null);
                  setView('login');
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          </header>
          
          <div className="grid gap-6">
            
            {/* Diagnostic & Cadrage Widget */}
            <div className="bg-gradient-to-r from-slate-50 to-teal-50/30 border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                {/* Elegant Circular Progress Indicator */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r={circleRadius}
                      className="stroke-slate-200 fill-transparent"
                      strokeWidth={strokeWidth}
                    />
                    {/* Foreground Circle */}
                    <motion.circle
                      cx="40"
                      cy="40"
                      r={circleRadius}
                      className="stroke-[#0f766e] fill-transparent"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Centered Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                    <span className="text-xs font-extrabold text-[#0f766e] tracking-tight">
                      {diagnosticCompleted ? '6/6' : `${diagnosticStep || 1}/6`}
                    </span>
                  </div>
                </div>
                
                {/* Text description */}
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Diagnostic de conformité</h3>
                  <p className="text-xs text-slate-500 max-w-lg leading-relaxed font-medium">
                    {diagnosticCompleted 
                      ? 'Votre diagnostic est soumis et validé par nos conseillers. Nous étudions vos réponses pour préparer vos architectures de planification.'
                      : 'Votre audit est en cours. Complétez les sections restantes pour finaliser votre dossier de partenariat annuel.'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowDiagnostic(true)}
                className="w-full md:w-auto bg-[#0f766e] hover:bg-[#0d635c] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-teal-100 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>
                  {diagnosticCompleted
                    ? 'Consulter l\'Audit'
                    : diagnosticData
                    ? `Reprendre à l'Étape ${diagnosticStep}`
                    : 'Reprendre à l\'Étape 1'}
                </span>
              </button>
            </div>


            {/* Informations supplémentaires */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100/80 shadow-sm space-y-6 font-sans">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-lg md:text-xl font-bold text-slate-800">Fiche de Renseignements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                
                {/* Téléphone */}
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Téléphone</span>
                  <span className="text-base md:text-lg font-extrabold text-slate-900">
                    {company.phone || '+33 (0)1 42 88 19 00'}
                  </span>
                </div>

                {/* Tranche de CA */}
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Tranche de CA</span>
                  <span className="text-base md:text-lg font-extrabold text-slate-900">
                    {company.ca || '1.5M€ — 5M€'}
                  </span>
                </div>

                {/* Site Web */}
                <div className="flex items-center gap-3 py-1">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase shrink-0">Site Web</span>
                  <a 
                    href={company.has_website ? (company.has_website.startsWith('http') ? company.has_website : `https://${company.has_website}`) : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-extrabold text-[#0f766e] hover:text-[#0d635c] transition-colors underline decoration-[#0f766e] decoration-2 underline-offset-4"
                  >
                    {company.has_website || 'www.ice-solutions.tech'}
                  </a>
                </div>

                {/* Plateformes connectées */}
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Plateformes connectées</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(company.platforms || 'Shopify Plus, AWS Cloud, Stripe').split(',').map((plat: string) => (
                      <span key={plat} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold shadow-sm">
                        {plat.trim()}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Render Diagnostic Wizard Modal */}
        {showDiagnostic && (
          <DiagnosticWizard 
            companyInfo={company}
            initialData={diagnosticData}
            initialStep={diagnosticStep}
            onClose={() => setShowDiagnostic(false)}
            onComplete={handleDiagnosticComplete}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {/* Diagnostic Submission Loader Overlay */}
        {submittingDiagnostic && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center font-sans">
              <div className="w-16 h-16 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Soumission en cours</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">{diagnosticStatus}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}
