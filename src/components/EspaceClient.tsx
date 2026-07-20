import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { DiagnosticWizard } from './DiagnosticWizard';
import { 
  CheckCircle, 
  FileText, 
  ArrowLeft, 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck 
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
      
      setDashboardData({ company, dossier });
      setView('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Identifiants invalides');
    }
  };

  const handleDiagnosticComplete = (data: any) => {
    setDiagnosticData(data);
    setDiagnosticCompleted(true);
    setShowDiagnostic(false);
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 w-full text-[#1B2A4A] bg-[#FAFCFA]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img 
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/me08pjb3_expires_30_days.png" 
              className="w-14 h-10 object-contain mx-auto mb-3" 
              alt="Logo" 
            />
            <h1 className="text-xl font-extrabold tracking-tight text-[#1B2A4A]">LA MEC CONSEILS</h1>
            <p className="text-xs text-[#F59E0B] font-bold uppercase tracking-widest mt-0.5">Espace Client Partenaire</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-center text-gray-900">Connexion sécurisée</h2>
            
            {loginError && (
              <p className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-semibold leading-relaxed border border-red-100">
                ⚠️ {loginError}
              </p>
            )}

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="block mb-1.5">Identifiant unique (ICE)</span>
                <input
                  type="text"
                  value={loginIce}
                  onChange={(e) => setLoginIce(e.target.value)}
                  placeholder="Ex: 001234567890123"
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                <span className="block mb-1.5">Code de dossier confidentiel</span>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="Ex: LMC-892A"
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all font-mono tracking-wider text-sm"
                  required
                />
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#1B2A4A] text-white rounded-xl py-3.5 font-bold hover:bg-black transition-colors shadow-lg cursor-pointer text-sm"
            >
              Se connecter
            </button>



            <button 
              type="button" 
              onClick={onBack} 
              className="w-full mt-4 text-gray-400 hover:text-[#52B788] text-xs font-bold transition-colors uppercase tracking-wider text-center"
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
    return (
      <div className="min-h-screen bg-[#FAFCFA] w-full p-6 text-[#1B2A4A]">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <p className="text-xs font-extrabold text-[#F59E0B] uppercase tracking-widest mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Espace Partenaire Confidentiel
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
              <p className="text-xs text-gray-500 mt-1">ICE: {company.ice} • {company.email}</p>
            </div>
            <button
              onClick={() => {
                setDashboardData(null);
                setDiagnosticCompleted(false);
                setDiagnosticData(null);
                setView('login');
              }}
              className="text-xs font-bold text-gray-500 hover:text-red-600 px-4 py-2.5 bg-gray-50 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
            >
              Déconnexion
            </button>
          </header>
          
          <div className="grid gap-6">
            
            {/* Diagnostic & Cadrage Widget */}
            <div className="bg-white p-6 rounded-3xl shadow-md border-2 border-dashed border-[#52B788]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5">
                <FileText className="w-40 h-40 text-[#52B788]" />
              </div>
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                    diagnosticCompleted 
                      ? 'bg-green-100 text-[#52B788]' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {diagnosticCompleted ? 'Soumis & Enregistré' : 'Action Requise'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">Section 1 à 6</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Diagnostic & Cadrage Métier Global</h3>
                <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
                  Complétez la matrice d'audit (Présentation, Cadrage d'activité, Organisation projet, Ressources logistiques, Maturité digitale et Clôture financière) nécessaire à l'optimisation de votre future infrastructure logicielle.
                </p>
              </div>

              <button
                onClick={() => setShowDiagnostic(true)}
                className={`px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer relative z-10 ${
                  diagnosticCompleted
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    : 'bg-[#52B788] text-white hover:bg-[#409c71] shadow-lg shadow-emerald-100'
                }`}
              >
                {diagnosticCompleted ? 'Visualiser / Modifier' : 'Remplir le Diagnostic'}
              </button>
            </div>

            {/* État du dossier */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Suivi du Dossier de Subvention
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Statut</span>
                  <span className="font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs">
                    {diagnosticCompleted ? 'Audit en cours de revue' : dossier.statut}
                  </span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Programme</span>
                  <span className="font-bold text-gray-900 text-xs truncate block">{dossier.programme}</span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Accompagnement</span>
                  <span className="font-bold text-gray-900 text-xs truncate block">{dossier.pack}</span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Subvention estimée</span>
                  <span className="font-bold text-green-600 text-sm block">
                    {Number(dossier.montant).toLocaleString('fr-MA')} MAD
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Summary display if completed */}
            {diagnosticCompleted && (
              <div className="bg-green-50/20 border border-green-100 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-[#52B788]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Diagnostic complété & stocké</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Merci ! Votre diagnostic complet a été enregistré. La Mec Conseils utilise ces informations pour configurer votre solution de planification globale et valider votre dossier de financement auprès des instances.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Effectif déclaré</span>
                    <span className="font-bold text-xs text-gray-800">{diagnosticData?.effectif || '-'} pers.</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Laboratoires</span>
                    <span className="font-bold text-xs text-gray-800">
                      {diagnosticData?.nbrLaboratoires === 'multi' ? 'Multi-sites' : 'Site unique'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Points de douleur</span>
                    <span className="font-bold text-xs text-gray-800">
                      {[diagnosticData?.painPoint1, diagnosticData?.painPoint2].filter(Boolean).length} identifiés
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Fiche de Renseignements</h2>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Téléphone direct</span>
                  <span className="font-bold text-gray-800">{company.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Tranche de CA</span>
                  <span className="font-bold text-gray-800">{company.ca || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Présence d'un Site Web</span>
                  <span className="font-bold text-gray-800">{company.has_website || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Plateformes connectées</span>
                  <span className="font-bold text-gray-800">{company.platforms || '-'}</span>
                </div>
                <div className="flex flex-col py-2 border-b border-gray-50 sm:col-span-2">
                  <span className="text-gray-400 font-medium mb-1">Besoins prioritaires déclarés initialement</span>
                  <span className="font-bold text-gray-800 leading-relaxed">{dossier.needs || '-'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Render Diagnostic Wizard Modal */}
        {showDiagnostic && (
          <DiagnosticWizard 
            companyInfo={company}
            onClose={() => setShowDiagnostic(false)}
            onComplete={handleDiagnosticComplete}
          />
        )}
      </div>
    );
  }
  return null;
}
