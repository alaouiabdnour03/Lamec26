import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function EspaceClient({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [loginIce, setLoginIce] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);

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
      
      const { data: files } = await supabase.storage.from('documents').list(loginIce);
      
      setDashboardData({ company, dossier, files: files || [] });
      setView('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Identifiants invalides');
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 w-full text-[#123] bg-[#f5f7fb]">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Accès Espace Client</h2>
          {loginError && <p className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">{loginError}</p>}
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-semibold text-gray-700">
              <span className="block mb-1.5">ICE</span>
              <input
                type="text"
                value={loginIce}
                onChange={(e) => setLoginIce(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-all"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              <span className="block mb-1.5">Code d'accès</span>
              <input
                type="text"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-all font-mono tracking-wider"
                required
              />
            </label>
          </div>
          <button type="submit" className="w-full bg-[#123] text-white rounded-xl py-3.5 font-bold hover:bg-gray-800 transition-colors shadow-lg">
            Se connecter
          </button>
          <button type="button" onClick={onBack} className="w-full mt-4 text-gray-500 hover:text-[#52B788] text-sm font-medium transition-colors">
            Retour à l'accueil
          </button>
        </form>
      </div>
    );
  }

  if (view === 'dashboard' && dashboardData) {
    const { company, dossier, files } = dashboardData;
    return (
      <div className="min-h-screen bg-[#f5f7fb] w-full p-6 text-[#123]">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Espace Client</p>
              <h1 className="text-3xl font-bold text-gray-900">{company.company_name}</h1>
              <p className="text-gray-500 mt-1">ICE: {company.ice} • {company.email}</p>
            </div>
            <button
              onClick={() => {
                setDashboardData(null);
                setView('login');
              }}
              className="text-sm font-bold text-gray-500 hover:text-gray-900 px-4 py-2 bg-gray-50 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </header>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                État du dossier
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Statut</span>
                  <span className="font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                    {dossier.statut}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Programme</span>
                  <span className="font-bold text-gray-900">{dossier.programme}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Pack choisi</span>
                  <span className="font-bold text-gray-900">{dossier.pack}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Subvention estimée</span>
                  <span className="font-bold text-green-600 text-lg">{Number(dossier.montant).toLocaleString('fr-MA')} MAD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informations supplémentaires</h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium text-sm mb-1">Téléphone</span>
                <span className="font-bold text-gray-900">{company.phone || '-'}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium text-sm mb-1">Tranche de CA</span>
                <span className="font-bold text-gray-900">{company.ca || '-'}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium text-sm mb-1">Site Web ?</span>
                <span className="font-bold text-gray-900">{company.has_website || '-'}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium text-sm mb-1">Plateformes</span>
                <span className="font-bold text-gray-900">{company.platforms || '-'}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-gray-50 md:col-span-2">
                <span className="text-gray-500 font-medium text-sm mb-1">Besoins exprimés</span>
                <span className="font-bold text-gray-900">{dossier.needs || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
