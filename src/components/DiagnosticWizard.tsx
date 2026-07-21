import React, { useState } from 'react';
import { 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Building, 
  Users, 
  Activity, 
  Truck, 
  Cpu, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

interface DiagnosticWizardProps {
  companyInfo?: {
    company_name?: string;
    ice?: string;
    email?: string;
    phone?: string;
  };
  initialData?: any;
  initialStep?: number;
  onClose: () => void;
  onComplete: (data: any) => void;
  onSaveDraft?: (data: any, step: number) => Promise<void>;
}

export function DiagnosticWizard({ companyInfo, initialData, initialStep, onClose, onComplete, onSaveDraft }: DiagnosticWizardProps) {
  const [step, setStep] = useState(initialStep || 1);
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        raisonSociale: initialData.raisonSociale ?? companyInfo?.company_name ?? '',
        nomDirigeant: initialData.nomDirigeant ?? '',
        phoneEmail: initialData.phoneEmail ?? companyInfo?.phone ?? companyInfo?.email ?? '',
        effectif: initialData.effectif ?? '',
        nbrLaboratoires: initialData.nbrLaboratoires ?? '',
        nbrLaboratoiresDetail: initialData.nbrLaboratoiresDetail ?? '',
        typologieOffres: initialData.typologieOffres ?? [],
        chiffrageMethode: initialData.chiffrageMethode ?? [],
        difficultesClosing: initialData.difficultesClosing ?? '',
        suiviAvancement: initialData.suiviAvancement ?? [],
        gestionImprevus: initialData.gestionImprevus ?? [],
        evaluationSucces: initialData.evaluationSucces ?? [],
        planificationExtras: initialData.planificationExtras ?? [],
        adequationLogistique: initialData.adequationLogistique ?? '',
        digitalisation: {
          crm: initialData.digitalisation?.crm ?? '',
          chiffrage: initialData.digitalisation?.chiffrage ?? '',
          recettes: initialData.digitalisation?.recettes ?? '',
          personnel: initialData.digitalisation?.personnel ?? '',
          stocks: initialData.digitalisation?.stocks ?? '',
          flotte: initialData.digitalisation?.flotte ?? '',
          facturation: initialData.digitalisation?.facturation ?? ''
        },
        silosInformation: initialData.silosInformation ?? '',
        clotureFinanciere: initialData.clotureFinanciere ?? [],
        painPoint1: initialData.painPoint1 ?? '',
        painPoint2: initialData.painPoint2 ?? '',
        painPoint3: initialData.painPoint3 ?? ''
      };
    }
    return {
      // Section 1: Présentation Générale
      raisonSociale: companyInfo?.company_name || '',
      nomDirigeant: '',
      phoneEmail: companyInfo?.phone || companyInfo?.email || '',
      effectif: '', // '1-5', '6-15', '16-50', '50+'
      nbrLaboratoires: '', // '1', 'multi'
      nbrLaboratoiresDetail: '',

      // Section 2: Cadrage de l'Activité
      typologieOffres: [] as string[], // Multiple select / checkbox
      chiffrageMethode: [] as string[],
      difficultesClosing: '',

      // Section 3: Organisation & Suivi
      suiviAvancement: [] as string[],
      gestionImprevus: [] as string[],
      evaluationSucces: [] as string[],

      // Section 4: Ressources & Logistique
      planificationExtras: [] as string[],
      adequationLogistique: '',

      // Section 5: Maturité Digitale (Matrix)
      // Values: '1' (Manuel), '2' (Excel), '3' (Logiciel standard), '4' (ERP)
      digitalisation: {
        crm: '',
        chiffrage: '',
        recettes: '',
        personnel: '',
        stocks: '',
        flotte: '',
        facturation: ''
      } as Record<string, string>,
      silosInformation: '',

      // Section 6: Clôture & Pain Points
      clotureFinanciere: [] as string[],
      painPoint1: '',
      painPoint2: '',
      painPoint3: ''
    };
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Identité', icon: Building, description: 'Fiche d\'identité de la structure' },
    { id: 2, title: 'Activité', icon: Activity, description: 'Cadrage de l\'activité traiteur' },
    { id: 3, title: 'Organisation', icon: Users, description: 'Suivi et gestion des projets' },
    { id: 4, title: 'Logistique', icon: Truck, description: 'Ressources et matériels' },
    { id: 5, title: 'Maturité', icon: Cpu, description: 'Maturité digitale actuelle' },
    { id: 6, title: 'Finances', icon: DollarSign, description: 'Clôture et points de douleur' }
  ];

  const triggerDraftSave = async (data: any, stepNum: number) => {
    if (!onSaveDraft) return;
    setSaveStatus('saving');
    try {
      await onSaveDraft(data, stepNum);
      setSaveStatus('saved');
      setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error saving diagnostic draft:', err);
      setSaveStatus('error');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    // Auto-save on input change with a slight delay or trigger immediately on step transitions.
    // For inputs, we can also trigger draft save right away or let it save when navigating steps.
    // Let's do a quiet draft save in background or save on step transition!
  };

  const toggleArrayItem = (field: 'typologieOffres' | 'chiffrageMethode' | 'suiviAvancement' | 'gestionImprevus' | 'evaluationSucces' | 'planificationExtras' | 'clotureFinanciere', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updatedArray = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      const updatedForm = { ...prev, [field]: updatedArray };
      return updatedForm;
    });
  };

  const handleDigitalisationChange = (processKey: string, value: string) => {
    setFormData(prev => {
      const updatedForm = {
        ...prev,
        digitalisation: {
          ...prev.digitalisation,
          [processKey]: value
        }
      };
      return updatedForm;
    });
  };

  const handleNext = async () => {
    if (step < 6) {
      const nextStep = step + 1;
      setStep(nextStep);
      // Scroll modal container to top
      const el = document.getElementById('diagnostic-container');
      if (el) el.scrollTop = 0;
      await triggerDraftSave(formData, nextStep);
    } else {
      onComplete(formData);
    }
  };

  const handlePrev = async () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      const el = document.getElementById('diagnostic-container');
      if (el) el.scrollTop = 0;
      await triggerDraftSave(formData, prevStep);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-50 flex flex-col animate-in fade-in duration-200 font-sans">
      <div 
        id="diagnostic-container"
        className="bg-[#f8fafc] w-full h-full flex flex-col overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">DIAGNOSTIC & CADRAGE</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Évaluation Opérationnelle & Pratiques Digitales</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors bg-transparent border-none py-1.5 px-0 cursor-pointer"
          >
            Quitter le diagnostic
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="bg-white border-b border-slate-100 px-8 py-6 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-start justify-between gap-6 min-w-[700px] md:min-w-0">
            {steps.map((s, index) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;

              return (
                <div 
                  key={s.id}
                  onClick={async () => {
                    setStep(s.id);
                    await triggerDraftSave(formData, s.id);
                  }}
                  className="flex-1 flex flex-col gap-3.5 cursor-pointer group focus:outline-none"
                >
                  {/* Top line indicator */}
                  <div className="relative h-[4px] w-full rounded-full bg-slate-100 overflow-hidden">
                    {isCompleted && (
                      <div className="absolute inset-0 bg-[#0f766e]" />
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-slate-100">
                        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#0f766e] rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Circle and label */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                      isCompleted 
                        ? 'bg-[#0f766e] text-white shadow-sm' 
                        : isActive 
                        ? 'border-2 border-[#0f766e] text-[#0f766e] bg-white shadow-sm' 
                        : 'border-2 border-slate-200 text-slate-300 bg-white'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold leading-none transition-colors ${
                        isCompleted || isActive ? 'text-slate-800' : 'text-slate-300'
                      }`}>
                        {s.title}
                      </span>
                      <span className={`text-[10px] font-semibold mt-1.5 leading-none ${
                        isCompleted 
                          ? 'text-slate-400' 
                          : isActive 
                          ? 'text-[#0f766e]' 
                          : 'text-slate-300'
                      }`}>
                        {isCompleted ? 'Terminé' : isActive ? 'En cours' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8fafc]">
          <div className="max-w-5xl mx-auto bg-white rounded-[32px] p-8 md:p-12 border border-slate-100/80 shadow-[0_20px_50px_rgba(15,118,110,0.03)]">
            
            {/* Step 1: Identité */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-[#0f766e] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ce formulaire d'audit approfondi est destiné à identifier vos spécifications techniques et vos points de douleur opérationnels pour paramétrer au mieux vos outils de planification.
                  </p>
                </div>

                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  1. Présentation Générale & Fiche d'Identité
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="block mb-1.5 text-xs text-slate-400 uppercase tracking-wider font-semibold">Raison Sociale / Enseigne</span>
                    <input 
                      type="text" 
                      value={formData.raisonSociale}
                      onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm font-medium text-slate-800"
                      placeholder="Ex: Saveurs de l'Atlas"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="block mb-1.5 text-xs text-slate-400 uppercase tracking-wider font-semibold">Nom du Dirigeant / Interlocuteur</span>
                    <input 
                      type="text" 
                      value={formData.nomDirigeant}
                      onChange={(e) => handleInputChange('nomDirigeant', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm font-medium text-slate-800"
                      placeholder="Ex: M. Rachid El Idrissi"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                    <span className="block mb-1.5 text-xs text-slate-400 uppercase tracking-wider font-semibold">Téléphone & Email direct</span>
                    <input 
                      type="text" 
                      value={formData.phoneEmail}
                      onChange={(e) => handleInputChange('phoneEmail', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm font-medium text-slate-800"
                      placeholder="Ex: +212 600000000 • contact@entreprise.ma"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-slate-700 text-xs text-slate-400 uppercase tracking-wider">Effectif Permanent (Fixe)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: '1-5', label: '1 à 5 pers.' },
                      { id: '6-15', label: '6 à 15 pers.' },
                      { id: '16-50', label: '16 à 50 pers.' },
                      { id: '50+', label: '+ 50 pers.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleInputChange('effectif', item.id)}
                        className={`p-3 text-center text-sm font-semibold rounded-xl border-2 transition-all cursor-pointer ${
                          formData.effectif === item.id 
                            ? 'border-[#0f766e] bg-[#f0fdfa] text-[#115e59]' 
                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-slate-700 text-xs text-slate-400 uppercase tracking-wider">Nombre de Laboratoires / Cuisines</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('nbrLaboratoires', '1');
                        handleInputChange('nbrLaboratoiresDetail', '');
                      }}
                      className={`p-4 text-left rounded-xl border-2 transition-all cursor-pointer ${
                        formData.nbrLaboratoires === '1' 
                          ? 'border-[#0f766e] bg-[#f0fdfa] text-[#115e59]' 
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <span className="block font-bold text-sm">1 seul site central</span>
                      <span className="block text-xs text-slate-400 mt-1">Toutes les opérations se déroulent au même endroit.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange('nbrLaboratoires', 'multi')}
                      className={`p-4 text-left rounded-xl border-2 transition-all cursor-pointer ${
                        formData.nbrLaboratoires === 'multi' 
                          ? 'border-[#0f766e] bg-[#f0fdfa] text-[#115e59]' 
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <span className="block font-bold text-sm">Multi-sites</span>
                      <span className="block text-xs text-slate-400 mt-1">Plusieurs laboratoires ou points de production.</span>
                    </button>
                  </div>

                  {formData.nbrLaboratoires === 'multi' && (
                    <input 
                      type="text"
                      value={formData.nbrLaboratoiresDetail}
                      onChange={(e) => handleInputChange('nbrLaboratoiresDetail', e.target.value)}
                      placeholder="Précisez le nombre et la localisation des sites"
                      className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm mt-2 text-slate-800 font-medium"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Activité */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  2. Cadrage de l'Activité & Business Doing
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    2.1. Quelle est la typologie de vos offres commerciales actuelles ?
                    <span className="block font-normal text-xs text-slate-400 mt-0.5">(Plusieurs choix possibles)</span>
                  </label>

                  <div className="space-y-2">
                    {[
                      { id: 'standard', label: 'Formules clés en main standardisées', desc: 'Package fixe par personne' },
                      { id: 'sur-mesure', label: 'Devis 100% sur-mesure', desc: 'Chaque prestation est reconstruite à partir de zéro' },
                      { id: 'modulaire', label: 'Vente de prestations modulaires', desc: 'Prestation traiteur + location matériel + service décorrélés' }
                    ].map((item) => {
                      const isChecked = formData.typologieOffres.includes(item.id);
                      return (
                        <label 
                          key={item.id}
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-[#0f766e]/30 bg-[#f0fdfa]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleArrayItem('typologieOffres', item.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#0f766e] text-white' : 'border-2 border-slate-200 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <div>
                            <span className={`block text-sm font-bold transition-colors ${
                              isChecked ? 'text-[#115e59]' : 'text-slate-800'
                            }`}>{item.label}</span>
                            <span className={`block text-xs transition-colors ${
                              isChecked ? 'text-[#115e59]/70' : 'text-slate-400'
                            } mt-1`}>{item.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    2.2. Comment établissez-vous votre chiffrage initial pour sécuriser vos marges ?
                    <span className="block font-normal text-xs text-slate-400 mt-0.5">(Plusieurs choix possibles)</span>
                  </label>

                  <div className="space-y-2">
                    {[
                      { id: 'manuel', label: 'Nous calculons manuellement le coût théorique des matières et appliquons un coefficient multiplicateur global.' },
                      { id: 'excel_lent', label: 'Nous n\'avons pas d\'outil de simulation dynamique : toute modification demandée par le client nécessite de refaire entièrement le calcul sur Excel.' },
                      { id: 'remises_aveugles', label: 'Les commerciaux négocient des remises de prix globales sans visibilité immédiate sur l\'érosion de la marge nette.' }
                    ].map((item) => {
                      const isChecked = formData.chiffrageMethode.includes(item.id);
                      return (
                        <label 
                          key={item.id}
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-[#0f766e]/30 bg-[#f0fdfa]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleArrayItem('chiffrageMethode', item.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#0f766e] text-white' : 'border-2 border-slate-200 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className={`text-sm font-medium leading-relaxed transition-colors ${
                            isChecked ? 'text-[#115e59]' : 'text-slate-600'
                          }`}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700">
                    2.3. Quelles sont vos principales difficultés lors de la phase de closing ou d'ajustement des contrats ?
                  </label>
                  <textarea 
                    value={formData.difficultesClosing}
                    onChange={(e) => handleInputChange('difficultesClosing', e.target.value)}
                    rows={3}
                    placeholder="Ex: Lenteur de mise à jour des devis, négociations de dernière minute érodant les marges..."
                    className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm leading-relaxed text-slate-800 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Organisation */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    3. Organisation, Gestion & Suivi des Réalisations par Projet
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Analysez vos processus de coordination interne et l'efficacité de vos flux de travail opérationnels.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    3.1. Comment est assuré le suivi de l'avancement d'un dossier entre la signature et le jour J ?
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'jalons', label: 'Par des jalons définis manuellement (validation du menu, acompte, choix de l\'art de la table).' },
                      { id: 'memoire', label: 'Pas de workflow formalisé : le suivi repose sur la mémoire du chef de projet / commercial.' },
                      { id: 'kanban_deconnecte', label: 'Via un tableau blanc ou outil collaboratif (Trello, Asana) déconnecté des fiches de cuisine.' }
                    ].map((item) => {
                      const isChecked = formData.suiviAvancement.includes(item.id);
                      return (
                        <label 
                          key={item.id} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-[#0f766e]/30 bg-[#f0fdfa]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleArrayItem('suiviAvancement', item.id)}
                              className="sr-only" 
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#0f766e] text-white' : 'border-2 border-slate-200 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            isChecked ? 'text-[#115e59]' : 'text-slate-600'
                          }`}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    3.2. Comment gérez-vous les imprévus ou modifications de dernière minute (changement du nombre d'invités à J-48h, régimes spécifiques) ?
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'verbal', label: 'Transmission verbale ou par note écrite à la cuisine (risque d\'oubli ou d\'erreur élevé).' },
                      { id: 'reedition', label: 'Réédition complète de la fiche technique papier et redistribution manuelle à tous les chefs de pôle.' },
                      { id: 'centralise', label: 'Système centralisé instantané qui met à jour les besoins d\'achats et la production en temps réel.' }
                    ].map((item) => {
                      const isChecked = formData.gestionImprevus.includes(item.id);
                      return (
                        <label 
                          key={item.id} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-[#0f766e]/30 bg-[#f0fdfa]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleArrayItem('gestionImprevus', item.id)}
                              className="sr-only" 
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#0f766e] text-white' : 'border-2 border-slate-200 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            isChecked ? 'text-[#115e59]' : 'text-slate-600'
                          }`}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    3.3. Comment évaluez-vous le succès et la conformité d'une réalisation à la fin d'un événement ?
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'verbal_client', label: 'Uniquement sur la base des retours verbaux ou du niveau de satisfaction du client final.' },
                      { id: 'debriefing', label: 'Par un débriefing opérationnel formalisé recensant les écarts de consommation (nourriture, boissons, casse).' },
                      { id: 'pas_de_suivi', label: 'Pas de suivi post-événement systématisé par manque de temps ou d\'outils adaptés.' }
                    ].map((item) => {
                      const isChecked = formData.evaluationSucces.includes(item.id);
                      return (
                        <label 
                          key={item.id} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-[#0f766e]/30 bg-[#f0fdfa]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleArrayItem('evaluationSucces', item.id)}
                              className="sr-only" 
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#0f766e] text-white' : 'border-2 border-slate-200 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            isChecked ? 'text-[#115e59]' : 'text-slate-600'
                          }`}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Logistique */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  4. Gestion des Ressources & Contraintes Logistiques
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    4.1. Comment organisez-vous la planification et le suivi des équipes d'extras (maîtres d'hôtel, cuisiniers intérimaires) ?
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'sms_whatsapp', label: 'Envoi de messages groupés (SMS/WhatsApp) et validation manuelle sur planning Excel.' },
                      { id: 'interim_externe', label: 'Recours exclusif à des agences d\'intérim externes qui gèrent la planification d\'après nos besoins bruts.' },
                      { id: 'dysfonctionnements', label: 'Dysfonctionnement frequent : erreurs sur les horaires de convocation, fiches de poste mal transmises ou pointages complexes.' }
                    ].map((item) => {
                      const isChecked = formData.planificationExtras.includes(item.id);
                      return (
                        <label 
                          key={item.id} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-[#0f766e]/30 bg-[#f0fdfa]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleArrayItem('planificationExtras', item.id)}
                              className="sr-only" 
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#0f766e] text-white' : 'border-2 border-slate-200 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            isChecked ? 'text-[#115e59]' : 'text-slate-600'
                          }`}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700">
                    4.2. Comment gérez-vous l'adéquation logistique entre la vaisselle/matériel disponible en stock et les besoins cumulés en cas d'événements simultanés ?
                  </label>
                  <textarea 
                    value={formData.adequationLogistique}
                    onChange={(e) => handleInputChange('adequationLogistique', e.target.value)}
                    rows={4}
                    placeholder="Ex: Comptages physiques fréquents, double-réservations de matériel, location en catastrophe de dernière minute chez un confrère..."
                    className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm leading-relaxed text-slate-800 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Maturité Digitale */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  5. Audit de la Maturité Digitale & Cartographie des Outils
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    5.1. Évaluez le niveau de digitalisation actuel de vos opérations :
                  </label>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-2/5">Processus Métier</th>
                          {[
                            { val: '1', label: '1. Manuel / Papier' },
                            { val: '2', label: '2. Excel / Word' },
                            { val: '3', label: '3. Logiciel standard' },
                            { val: '4', label: '4. ERP intégré' }
                          ].map((head) => (
                            <th key={head.val} className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center w-[15%]">
                              {head.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { key: 'crm', label: 'Gestion de la relation client & Pipeline de vente' },
                          { key: 'chiffrage', label: 'Chiffrage initial & Devis d\'ingrédients' },
                          { key: 'recettes', label: 'Fiches techniques de cuisine & Gestion des recettes' },
                          { key: 'personnel', label: 'Planification du personnel de salle (Extras)' },
                          { key: 'stocks', label: 'Gestion des stocks de matières premières & DLC' },
                          { key: 'flotte', label: 'Suivi de la flotte de véhicules & Conditionnement' },
                          { key: 'facturation', label: 'Facturation & Relances règlements' }
                        ].map((proc) => (
                          <tr key={proc.key} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-sm font-semibold text-slate-700">{proc.label}</td>
                            {['1', '2', '3', '4'].map((val) => {
                              const isChecked = formData.digitalisation[proc.key] === val;
                              return (
                                <td key={val} className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDigitalisationChange(proc.key, val)}
                                    className={`w-6 h-6 mx-auto rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                      isChecked 
                                        ? 'border-[#0f766e] bg-[#f0fdfa] text-[#0f766e] shadow-sm' 
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                  >
                                    {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-[#0f766e]" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700">
                    5.2. Quels sont les principaux îlots ou silos d'information qui génèrent le plus de pertes de temps ou d'erreurs d'interprétation dans votre quotidien ?
                  </label>
                  <textarea 
                    value={formData.silosInformation}
                    onChange={(e) => handleInputChange('silosInformation', e.target.value)}
                    rows={4}
                    placeholder="Ex: La cuisine ne reçoit pas les mises à jour des fiches techniques à temps; le planning des extras est géré à part..."
                    className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm leading-relaxed text-slate-800 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Finances & Pain points */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  6. Clôture Financière, Rentabilité & Points de Douleur Majeurs
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    6.1. Comment procédez-vous à la clôture financière d'un événement pour déterminer sa rentabilité analytique réelle ?
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { id: 'scrupuleux', label: 'Nous appliquons scrupuleusement la formule (Produits - Charges directes & indirectes) projet par projet sous 48h.' },
                      { id: 'estimation_brute', label: 'Nous estimons la marge brute uniquement sur les achats de nourriture, mais omettons les heures d\'extras, carburant ou casse.' },
                      { id: 'impossible_automatisation', label: 'Le calcul est impossible à automatiser car les données de coûts arrivent trop tardivement ou sont centralisées chez l\'expert-comptable.' }
                    ].map((item) => {
                      const isChecked = formData.clotureFinanciere.includes(item.id);
                      return (
                        <label 
                          key={item.id} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-[#0f766e]/30 bg-[#f0fdfa]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleArrayItem('clotureFinanciere', item.id)}
                              className="sr-only" 
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#0f766e] text-white' : 'border-2 border-slate-200 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            isChecked ? 'text-[#115e59]' : 'text-slate-600'
                          }`}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    6.2. Quels sont vos trois (3) plus grands points de douleur ou irritants opérationnels qui nuisent à votre rentabilité ou au confort de vos équipes aujourd'hui ?
                  </label>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
                      <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-wider">Point de douleur 1</span>
                      <input 
                        type="text" 
                        value={formData.painPoint1}
                        onChange={(e) => handleInputChange('painPoint1', e.target.value)}
                        placeholder="Ex: Oublis logistiques récurrents au camion de livraison"
                        className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm font-medium text-slate-800"
                      />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
                      <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-wider">Point de douleur 2</span>
                      <input 
                        type="text" 
                        value={formData.painPoint2}
                        onChange={(e) => handleInputChange('painPoint2', e.target.value)}
                        placeholder="Ex: Temps excessif passé sur Excel pour faire les plannings d'extras"
                        className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm font-medium text-slate-800"
                      />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
                      <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-wider">Point de douleur 3</span>
                      <input 
                        type="text" 
                        value={formData.painPoint3}
                        onChange={(e) => handleInputChange('painPoint3', e.target.value)}
                        placeholder="Ex: Imprécision du calcul de marge lors des négociations"
                        className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-all text-sm font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t border-slate-100 p-6 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              step === 1 
                ? 'text-slate-300 bg-slate-50 cursor-not-allowed' 
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 bg-[#0f766e] text-white hover:bg-[#0d635c] px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-100 cursor-pointer"
          >
            {step === 6 ? 'Soumettre le Diagnostic' : 'Suivant'}
            {step < 6 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
