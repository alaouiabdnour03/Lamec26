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
  onClose: () => void;
  onComplete: (data: any) => void;
}

export function DiagnosticWizard({ companyInfo, onClose, onComplete }: DiagnosticWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
  });

  const steps = [
    { id: 1, title: 'Identité', icon: Building, description: 'Fiche d\'identité de la structure' },
    { id: 2, title: 'Activité', icon: Activity, description: 'Cadrage de l\'activité traiteur' },
    { id: 3, title: 'Organisation', icon: Users, description: 'Suivi et gestion des projets' },
    { id: 4, title: 'Logistique', icon: Truck, description: 'Ressources et matériels' },
    { id: 5, title: 'Maturité', icon: Cpu, description: 'Maturité digitale actuelle' },
    { id: 6, title: 'Finances', icon: DollarSign, description: 'Clôture et points de douleur' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'typologieOffres' | 'chiffrageMethode' | 'suiviAvancement' | 'gestionImprevus' | 'evaluationSucces' | 'planificationExtras' | 'clotureFinanciere', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleDigitalisationChange = (processKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      digitalisation: {
        ...prev.digitalisation,
        [processKey]: value
      }
    }));
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(prev => prev + 1);
      // Scroll modal container to top
      const el = document.getElementById('diagnostic-container');
      if (el) el.scrollTop = 0;
    } else {
      onComplete(formData);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      const el = document.getElementById('diagnostic-container');
      if (el) el.scrollTop = 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1B2A4A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="diagnostic-container"
        className="bg-[#FAFCFA] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#F59E0B] tracking-wider uppercase bg-amber-50 px-2.5 py-1 rounded-md">La Mec Conseils</span>
              <span className="text-xs font-bold text-gray-400">• Matrice d'Audit</span>
            </div>
            <h2 className="text-xl font-bold text-[#1B2A4A]">DIAGNOSTIC & CADRAGE MÉTIER GLOBAL</h2>
            <p className="text-xs text-gray-500 mt-0.5">Évaluation Opérationnelle, Pratiques Digitales & Business Doing</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            Fermer sans enregistrer
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[700px] md:min-w-0">
            {steps.map((s, index) => {
              const IconComponent = s.icon;
              const isCompleted = step > s.id;
              const isActive = step === s.id;

              return (
                <React.Fragment key={s.id}>
                  <div 
                    onClick={() => setStep(s.id)}
                    className="flex items-center gap-3 cursor-pointer group focus:outline-none"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-[#52B788] text-white' 
                        : isActive 
                        ? 'bg-[#1B2A4A] text-white shadow-md shadow-slate-200' 
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <IconComponent className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${isActive ? 'text-[#1B2A4A]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {s.title}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden lg:block">{s.description}</span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-[2px] flex-1 mx-3 rounded-full ${step > s.id ? 'bg-[#52B788]' : 'bg-gray-100'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            
            {/* Step 1: Identité */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Ce formulaire d'audit approfondi est destiné à identifier vos spécifications techniques et vos points de douleur opérationnels pour paramétrer au mieux vos outils de planification.
                  </p>
                </div>

                <h3 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-2">
                  1. Présentation Générale & Fiche d'Identité
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    <span className="block mb-1.5">Raison Sociale / Enseigne</span>
                    <input 
                      type="text" 
                      value={formData.raisonSociale}
                      onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all"
                      placeholder="Ex: Saveurs de l'Atlas"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-gray-700">
                    <span className="block mb-1.5">Nom du Dirigeant / Interlocuteur</span>
                    <input 
                      type="text" 
                      value={formData.nomDirigeant}
                      onChange={(e) => handleInputChange('nomDirigeant', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all"
                      placeholder="Ex: M. Rachid El Idrissi"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-gray-700 md:col-span-2">
                    <span className="block mb-1.5">Téléphone & Email direct</span>
                    <input 
                      type="text" 
                      value={formData.phoneEmail}
                      onChange={(e) => handleInputChange('phoneEmail', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all"
                      placeholder="Ex: +212 600000000 • contact@entreprise.ma"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700">Effectif Permanent (Fixe)</span>
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
                        className={`p-3 text-center text-sm font-medium rounded-xl border-2 transition-all ${
                          formData.effectif === item.id 
                            ? 'border-[#52B788] bg-green-50 text-[#1B2A4A] font-bold' 
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700">Nombre de Laboratoires / Cuisines</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('nbrLaboratoires', '1');
                        handleInputChange('nbrLaboratoiresDetail', '');
                      }}
                      className={`p-4 text-left rounded-xl border-2 transition-all ${
                        formData.nbrLaboratoires === '1' 
                          ? 'border-[#52B788] bg-green-50 text-[#1B2A4A]' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="block font-bold text-sm">1 seul site central</span>
                      <span className="block text-xs text-gray-400 mt-1">Toutes les opérations se déroulent au même endroit.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange('nbrLaboratoires', 'multi')}
                      className={`p-4 text-left rounded-xl border-2 transition-all ${
                        formData.nbrLaboratoires === 'multi' 
                          ? 'border-[#52B788] bg-green-50 text-[#1B2A4A]' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="block font-bold text-sm">Multi-sites</span>
                      <span className="block text-xs text-gray-400 mt-1">Plusieurs laboratoires ou points de production.</span>
                    </button>
                  </div>

                  {formData.nbrLaboratoires === 'multi' && (
                    <input 
                      type="text"
                      value={formData.nbrLaboratoiresDetail}
                      onChange={(e) => handleInputChange('nbrLaboratoiresDetail', e.target.value)}
                      placeholder="Précisez le nombre et la localisation des sites"
                      className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm mt-2"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Activité */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-2">
                  2. Cadrage de l'Activité & Business Doing
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    2.1. Quelle est la typologie de vos offres commerciales actuelles ?
                    <span className="block font-normal text-xs text-gray-400 mt-0.5">(Plusieurs choix possibles)</span>
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
                          className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            isChecked ? 'border-[#52B788] bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleArrayItem('typologieOffres', item.id)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]"
                          />
                          <div>
                            <span className="block text-sm font-bold text-gray-800">{item.label}</span>
                            <span className="block text-xs text-gray-400 mt-0.5">{item.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    2.2. Comment établissez-vous votre chiffrage initial pour sécuriser vos marges ?
                    <span className="block font-normal text-xs text-gray-400 mt-0.5">(Plusieurs choix possibles)</span>
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
                          className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            isChecked ? 'border-[#52B788] bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleArrayItem('chiffrageMethode', item.id)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]"
                          />
                          <span className="text-sm text-gray-700 leading-relaxed font-medium">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">
                    2.3. Quelles sont vos principales difficultés lors de la phase de closing ou d'ajustement des contrats ?
                  </label>
                  <textarea 
                    value={formData.difficultesClosing}
                    onChange={(e) => handleInputChange('difficultesClosing', e.target.value)}
                    rows={3}
                    placeholder="Ex: Lenteur de mise à jour des devis, négociations de dernière minute érodant les marges..."
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Organisation */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-2">
                  3. Organisation, Gestion & Suivi des Réalisations par Projet
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    3.1. Comment est assuré le suivi de l'avancement d'un dossier entre la signature et le jour J ?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'jalons', label: 'Par des jalons définis manuellement (validation du menu, acompte, choix de l\'art de la table).' },
                      { id: 'memoire', label: 'Pas de workflow formalisé : le suivi repose sur la mémoire du chef de projet / commercial.' },
                      { id: 'kanban_deconnecte', label: 'Via un tableau blanc ou outil collaboratif (Trello, Asana) déconnecté des fiches de cuisine.' }
                    ].map((item) => {
                      const isChecked = formData.suiviAvancement.includes(item.id);
                      return (
                        <label key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-[#52B788] bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => toggleArrayItem('suiviAvancement', item.id)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]" 
                          />
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    3.2. Comment gérez-vous les imprévus ou modifications de dernière minute (changement du nombre d'invités à J-48h, régimes spécifiques) ?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'verbal', label: 'Transmission verbale ou par note écrite à la cuisine (risque d\'oubli ou d\'erreur élevé).' },
                      { id: 'reedition', label: 'Réédition complète de la fiche technique papier et redistribution manuelle à tous les chefs de pôle.' },
                      { id: 'centralise', label: 'Système centralisé instantané qui met à jour les besoins d\'achats et la production en temps réel.' }
                    ].map((item) => {
                      const isChecked = formData.gestionImprevus.includes(item.id);
                      return (
                        <label key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-[#52B788] bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => toggleArrayItem('gestionImprevus', item.id)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]" 
                          />
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    3.3. Comment évaluez-vous le succès et la conformité d'une réalisation à la fin d'un événement ?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'verbal_client', label: 'Uniquement sur la base des retours verbaux ou du niveau de satisfaction du client final.' },
                      { id: 'debriefing', label: 'Par un débriefing opérationnel formalisé recensant les écarts de consommation (nourriture, boissons, casse).' },
                      { id: 'pas_de_suivi', label: 'Pas de suivi post-événement systématisé par manque de temps ou d\'outils adaptés.' }
                    ].map((item) => {
                      const isChecked = formData.evaluationSucces.includes(item.id);
                      return (
                        <label key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-[#52B788] bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => toggleArrayItem('evaluationSucces', item.id)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]" 
                          />
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
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
                <h3 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-2">
                  4. Gestion des Ressources & Contraintes Logistiques
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    4.1. Comment organisez-vous la planification et le suivi des équipes d'extras (maîtres d'hôtel, cuisiniers intérimaires) ?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'sms_whatsapp', label: 'Envoi de messages groupés (SMS/WhatsApp) et validation manuelle sur planning Excel.' },
                      { id: 'interim_externe', label: 'Recours exclusif à des agences d\'intérim externes qui gèrent la planification d\'après nos besoins bruts.' },
                      { id: 'dysfonctionnements', label: 'Dysfonctionnement fréquent : erreurs sur les horaires de convocation, fiches de poste mal transmises ou pointages complexes.' }
                    ].map((item) => {
                      const isChecked = formData.planificationExtras.includes(item.id);
                      return (
                        <label key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-[#52B788] bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => toggleArrayItem('planificationExtras', item.id)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]" 
                          />
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">
                    4.2. Comment gérez-vous l'adéquation logistique entre la vaisselle/matériel disponible en stock et les besoins cumulés en cas d'événements simultanés ?
                  </label>
                  <textarea 
                    value={formData.adequationLogistique}
                    onChange={(e) => handleInputChange('adequationLogistique', e.target.value)}
                    rows={4}
                    placeholder="Ex: Comptages physiques fréquents, double-réservations de matériel, location en catastrophe de dernière minute chez un confrère..."
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Maturité Digitale */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-2">
                  5. Audit de la Maturité Digitale & Cartographie des Outils
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    5.1. Évaluez le niveau de digitalisation actuel de vos opérations :
                  </label>

                  <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150">
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-2/5">Processus Métier</th>
                          {[
                            { val: '1', label: '1. Manuel / Papier' },
                            { val: '2', label: '2. Excel / Word' },
                            { val: '3', label: '3. Logiciel standard' },
                            { val: '4', label: '4. ERP intégré' }
                          ].map((head) => (
                            <th key={head.val} className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-[15%]">
                              {head.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {[
                          { key: 'crm', label: 'Gestion de la relation client & Pipeline de vente' },
                          { key: 'chiffrage', label: 'Chiffrage initial & Devis d\'ingrédients' },
                          { key: 'recettes', label: 'Fiches techniques de cuisine & Gestion des recettes' },
                          { key: 'personnel', label: 'Planification du personnel de salle (Extras)' },
                          { key: 'stocks', label: 'Gestion des stocks de matières premières & DLC' },
                          { key: 'flotte', label: 'Suivi de la flotte de véhicules & Conditionnement' },
                          { key: 'facturation', label: 'Facturation & Relances règlements' }
                        ].map((proc) => (
                          <tr key={proc.key} className="hover:bg-gray-50/50">
                            <td className="p-4 text-sm font-medium text-gray-700">{proc.label}</td>
                            {['1', '2', '3', '4'].map((val) => {
                              const isChecked = formData.digitalisation[proc.key] === val;
                              return (
                                <td key={val} className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDigitalisationChange(proc.key, val)}
                                    className={`w-6 h-6 mx-auto rounded-full border-2 flex items-center justify-center transition-all ${
                                      isChecked 
                                        ? 'border-[#52B788] bg-[#52B788] text-white shadow-sm' 
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                    }`}
                                  >
                                    {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
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
                  <label className="block text-sm font-bold text-gray-700">
                    5.2. Quels sont les principaux îlots ou silos d'information qui génèrent le plus de pertes de temps ou d'erreurs d'interprétation dans votre quotidien ?
                  </label>
                  <textarea 
                    value={formData.silosInformation}
                    onChange={(e) => handleInputChange('silosInformation', e.target.value)}
                    rows={4}
                    placeholder="Ex: La cuisine ne reçoit pas les mises à jour des fiches techniques à temps; le planning des extras est géré à part..."
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Finances & Pain points */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-2">
                  6. Clôture Financière, Rentabilité & Points de Douleur Majeurs
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    6.1. Comment procédez-vous à la clôture financière d'un événement pour déterminer sa rentabilité analytique réelle ?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'scrupuleux', label: 'Nous appliquons scrupuleusement la formule (Produits - Charges directes & indirectes) projet par projet sous 48h.' },
                      { id: 'estimation_brute', label: 'Nous estimons la marge brute uniquement sur les achats de nourriture, mais omettons les heures d\'extras, carburant ou casse.' },
                      { id: 'impossible_automatisation', label: 'Le calcul est impossible à automatiser car les données de coûts arrivent trop tardivement ou sont centralisées chez l\'expert-comptable.' }
                    ].map((item) => {
                      const isChecked = formData.clotureFinanciere.includes(item.id);
                      return (
                        <label key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-[#52B788] bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => toggleArrayItem('clotureFinanciere', item.id)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]" 
                          />
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    6.2. Quels sont vos trois (3) plus grands points de douleur ou irritants opérationnels qui nuisent à votre rentabilité ou au confort de vos équipes aujourd'hui ?
                  </label>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                      <span className="text-xs font-bold text-[#F59E0B] uppercase">Point de douleur 1</span>
                      <input 
                        type="text" 
                        value={formData.painPoint1}
                        onChange={(e) => handleInputChange('painPoint1', e.target.value)}
                        placeholder="Ex: Oublis logistiques récurrents au camion de livraison"
                        className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                      <span className="text-xs font-bold text-[#F59E0B] uppercase">Point de douleur 2</span>
                      <input 
                        type="text" 
                        value={formData.painPoint2}
                        onChange={(e) => handleInputChange('painPoint2', e.target.value)}
                        placeholder="Ex: Temps excessif passé sur Excel pour faire les plannings d'extras"
                        className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                      <span className="text-xs font-bold text-[#F59E0B] uppercase">Point de douleur 3</span>
                      <input 
                        type="text" 
                        value={formData.painPoint3}
                        onChange={(e) => handleInputChange('painPoint3', e.target.value)}
                        placeholder="Ex: Imprécision du calcul de marge lors des négociations"
                        className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 focus:border-[#52B788] transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t border-gray-100 p-6 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              step === 1 
                ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 bg-[#1B2A4A] text-white hover:bg-black px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-200"
          >
            {step === 6 ? 'Soumettre le Diagnostic' : 'Suivant'}
            {step < 6 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
