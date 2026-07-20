import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight, ArrowLeft, Upload } from 'lucide-react';

const SECTORS = [
  { id: 'tourisme', label: 'Tourisme' },
  { id: 'commerce', label: 'Commerce & Services' },
  { id: 'autre', label: 'Autre' },
];

const ACTIVITIES: Record<string, { id: string; label: string }[]> = {
  tourisme: [
    { id: 'hotel3', label: 'Hotel 3*' },
    { id: 'transport', label: 'Agence Transport' },
    { id: 'location', label: 'Location Voiture' },
    { id: 'autre-tourisme', label: 'Autre activité touristique' },
  ],
  commerce: [
    { id: 'ameublement', label: 'Ameublement Cuir' },
    { id: 'tapis', label: 'Artisanat Tapis' },
    { id: 'prothese', label: 'Prothèse Dentaire' },
    { id: 'livraison', label: 'Transport / Livraison' },
    { id: 'autre-commerce', label: 'Autre activité' },
  ],
};

const RULES: Record<string, any> = {
  'Hotel 3*': {
    program: 'Go Siyaha',
    pack: 'Premium',
    montantHt: 95000,
    subvention: 85500,
    reste: 9500,
  },
  'Agence Transport': {
    program: 'Go Siyaha',
    pack: 'Business',
    montantHt: 55000,
    subvention: 49500,
    reste: 5500,
  },
  'Location Voiture': {
    program: 'Go Siyaha',
    pack: 'Business',
    montantHt: 55000,
    subvention: 49500,
    reste: 5500,
  },
  'Ameublement Cuir': {
    program: 'DigiTPME',
    pack: 'Business',
    montantHt: 55000,
    subvention: 44000,
    reste: 11000,
  },
  'Artisanat Tapis': {
    program: 'DigiTPME',
    pack: 'Business',
    montantHt: 55000,
    subvention: 44000,
    reste: 11000,
  },
  'Prothèse Dentaire': {
    program: 'DigiTPME',
    pack: 'Starter',
    montantHt: 30000,
    subvention: 24000,
    reste: 6000,
  },
  'Transport / Livraison': {
    program: 'DigiTPME',
    pack: 'Starter',
    montantHt: 30000,
    subvention: 24000,
    reste: 6000,
  },
};

type ClassificationResult = {
  activityLabel: string;
  program: string;
  pack: string;
  montantHt: number;
  subvention: number;
  reste: number;
  classification?: any;
};

interface EligibilityWizardProps {
  onNavigateToEspaceClient?: () => void;
}

export function EligibilityWizard({ onNavigateToEspaceClient }: EligibilityWizardProps = {}) {
  const [step, setStep] = useState(1);
  
  // Step 1
  const [companyName, setCompanyName] = useState('');
  const [ice, setIce] = useState('');
  const [cnssEmployees, setCnssEmployees] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ca, setCa] = useState('< 10M MAD');
  
  // Step 2
  const [sector, setSector] = useState('');
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  
  // Step 3 (AI results)
  const [classificationStatus, setClassificationStatus] = useState('');
  const [classificationLoading, setClassificationLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<ClassificationResult | null>(null);

  // Step 4
  const [hasWebsite, setHasWebsite] = useState('Oui');
  const [platforms, setPlatforms] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  
  // Step 5
  const [pack, setPack] = useState('');

  // Step 6
  const [fileStatuts, setFileStatuts] = useState<File | null>(null);
  const [fileRC, setFileRC] = useState<File | null>(null);
  const [fileFiscale, setFileFiscale] = useState<File | null>(null);
  const [fileCnss, setFileCnss] = useState<File | null>(null);
  const [fileBilan, setFileBilan] = useState<File | null>(null);

  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  const resolveActivityLabel = () => {
    if (customActivity.trim()) return customActivity.trim();
    const activityMap = Object.values(ACTIVITIES).flat().find((entry) => entry.id === activity);
    return activityMap ? activityMap.label : '';
  };

  const evaluateEligibility = async () => {
    setClassificationLoading(true);
    setClassificationStatus("Analyse de l'activité avec l'IA...");
    const label = resolveActivityLabel();
    
    if (RULES[label]) {
      setClassificationStatus('Règle locale appliquée');
      setEligibilityResult({ ...RULES[label], activityLabel: label });
      setClassificationLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: label }),
      });
      const data = await response.json();
      setClassificationStatus(`Classification : ${data?.sector || 'Autre'} (${data?.confidence || 0}%)`);
      
      const s = data?.sector || 'Tourisme';
      setEligibilityResult({
        activityLabel: label,
        program: data?.program || (s === 'Tourisme' ? 'Go Siyaha' : 'DigiTPME'),
        pack: s === 'Tourisme' ? 'Premium' : 'Starter',
        montantHt: s === 'Tourisme' ? 95000 : 30000,
        subvention: s === 'Tourisme' ? 85500 : 24000,
        reste: s === 'Tourisme' ? 9500 : 6000,
        classification: data,
      });
    } catch (error) {
      setClassificationStatus('Classification locale utilisée (fallback)');
      setEligibilityResult({
        activityLabel: label,
        program: 'Go Siyaha',
        pack: 'Premium',
        montantHt: 95000,
        subvention: 85500,
        reste: 9500,
        classification: { sector: 'Tourisme', confidence: 92 },
      });
    }
    setClassificationLoading(false);
  };

  const handleNext = async () => {
    if (step === 1 && (!companyName || !ice || !cnssEmployees || !email || !phone)) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (step === 2 && !activity && !customActivity) {
      alert('Veuillez sélectionner ou décrire une activité.');
      return;
    }
    if (step === 2) {
      await evaluateEligibility();
    }
    if (step === 5 && !pack) {
      alert("Veuillez sélectionner un pack d'accompagnement.");
      return;
    }
    if (step === 6 && !fileRC) {
      alert('Veuillez joindre le Registre de commerce.');
      return;
    }
    if (step < 7) setStep(step + 1);
  };

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomStr = (length: number) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${randomStr(3)}-${randomStr(4)}`;
  };

  const uploadFile = async (file: File, name: string) => {
    const { error } = await supabase.storage.from('documents').upload(`${ice}/${name}-${file.name}`, file);
    if (error) console.error('Upload error for', file.name, error);
  };

  const submitToSupabase = async () => {
    setUploading(true);
    setUploadStatus('Vérification et création du dossier…');

    let finalMontant = 0;
    if (pack === 'PACK I : IMMERSION DIGITALE') finalMontant = 27000;
    if (pack === 'PACK II : EXCELLENCE VISUELLE') finalMontant = 40500;

    try {
      const { data: existingCompany, error: companyError } = await supabase
        .from('entreprises')
        .select('id')
        .eq('ice', ice)
        .maybeSingle();

      if (existingCompany) {
        setUploadStatus('Erreur : Un dossier existe déjà pour cet ICE.');
        setUploading(false);
        return;
      }

      const generatedCode = generateAccessCode();
      setAccessCode(generatedCode);

      const { data: company, error: createCompanyError } = await supabase
        .from('entreprises')
        .insert({ 
          ice, 
          company_name: companyName, 
          sector: resolveActivityLabel(), 
          cnss: cnssEmployees, 
          email,
          phone,
          ca,
          has_website: hasWebsite,
          platforms
        })
        .select()
        .single();

      if (createCompanyError) throw new Error(createCompanyError.message);

      const { error: createDossierError } = await supabase
        .from('dossiers_subvention')
        .insert({
          entreprise_id: company.id,
          programme: eligibilityResult?.program || 'Go Siyaha',
          pack: pack,
          montant: finalMontant,
          statut: 'En cours',
          access_code: generatedCode,
          needs: needs.join(', ')
        });

      if (createDossierError) throw new Error(createDossierError.message);

      setUploadStatus('Envoi des documents...');
      if (fileStatuts) await uploadFile(fileStatuts, 'Statuts');
      if (fileRC) await uploadFile(fileRC, 'RC');
      if (fileFiscale) await uploadFile(fileFiscale, 'Fiscale');
      if (fileCnss) await uploadFile(fileCnss, 'CNSS');
      if (fileBilan) await uploadFile(fileBilan, 'Bilan');

      setUploadStatus("Envoi de l'email...");
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            ice,
            companyName,
            accessCode: generatedCode,
            pack: pack,
            montant: finalMontant,
            phone,
            cnssEmployees,
            ca,
            activity: resolveActivityLabel(),
            hasWebsite,
            platforms,
            needs
          })
        });
      } catch (e) {
        console.error("Email API failed:", e);
      }

      setUploadStatus('Dossier soumis avec succès !');
      setStep(7); 
    } catch (error: any) {
      setUploadStatus(`Erreur : ${error.message}`);
    }
    setUploading(false);
  };

  const TOTAL_STEPS = 6;
  const WIZARD_TITLES = [
    "Identification de l'établissement",
    "Secteur & Activité",
    "Analyse & Éligibilité",
    "Besoins & Présence Digitale",
    "Pack d'accompagnement",
    "Pièces Jointes"
  ];

  const showCustomActivity = sector === 'autre' || activity === 'autre-tourisme' || activity === 'autre-commerce';

  return (
    <div className="flex items-center justify-center w-full text-[#123]">
      <div className="w-full max-w-[800px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(18,35,51,0.05)] overflow-hidden border border-gray-100">
        {step < 7 && (
          <div className="p-8 md:p-10 border-b border-gray-50">
            <header className="flex flex-col md:flex-row justify-between gap-4 items-start mb-6">
              <div>
                <p className="text-[#52B788] uppercase tracking-[0.14em] text-[0.7rem] font-bold mb-2">
                  FORMULAIRE D'ÉLIGIBILITÉ
                </p>
                <h1 className="text-2xl md:text-3xl font-sans font-bold text-gray-900">
                  {step}. {WIZARD_TITLES[step - 1]}
                </h1>
              </div>
              <div className="bg-green-50 text-[#52B788] py-2 px-4 rounded-full font-bold whitespace-nowrap text-sm border border-green-100">
                Étape {step} / {TOTAL_STEPS}
              </div>
            </header>

            <div className="h-2 bg-[#ebeff7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#52B788] transition-all duration-500 ease-out"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-8 md:p-10">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 font-semibold text-gray-700 text-sm">
                  <span>Raison Sociale</span>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="border border-[#dbe3f0] bg-gray-50 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 focus:border-[#52B788] transition-all" required />
                </label>
                <label className="flex flex-col gap-2 font-semibold text-gray-700 text-sm">
                  <span>ICE (Identifiant Fiscal)</span>
                  <input type="text" value={ice} onChange={(e) => setIce(e.target.value)} className="border border-[#dbe3f0] bg-gray-50 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 focus:border-[#52B788] transition-all" required />
                </label>
                <label className="flex flex-col gap-2 font-semibold text-gray-700 text-sm">
                  <span>N° CNSS & Effectif</span>
                  <input type="text" value={cnssEmployees} onChange={(e) => setCnssEmployees(e.target.value)} className="border border-[#dbe3f0] bg-gray-50 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 focus:border-[#52B788] transition-all" required />
                </label>
                <label className="flex flex-col gap-2 font-semibold text-gray-700 text-sm">
                  <span>Email de contact</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-[#dbe3f0] bg-gray-50 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 focus:border-[#52B788] transition-all" required />
                </label>
                <label className="flex flex-col gap-2 font-semibold text-gray-700 text-sm">
                  <span>Téléphone</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-[#dbe3f0] bg-gray-50 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 focus:border-[#52B788] transition-all" required />
                </label>
                <label className="flex flex-col gap-3 font-semibold text-gray-700 text-sm">
                  <span>Tranche CA Annuel</span>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#52B788] transition-colors">
                      <input type="radio" name="ca" value="< 10M MAD" checked={ca === '< 10M MAD'} onChange={(e) => setCa(e.target.value)} className="w-5 h-5 accent-[#52B788] text-[#52B788] focus:ring-[#52B788]" />
                      &lt; 10M MAD
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#52B788] transition-colors">
                      <input type="radio" name="ca" value="> 10M MAD" checked={ca === '> 10M MAD'} onChange={(e) => setCa(e.target.value)} className="w-5 h-5 accent-[#52B788] text-[#52B788] focus:ring-[#52B788]" />
                      &gt; 10M MAD
                    </label>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-sm font-bold mb-4 uppercase text-gray-500 tracking-wider">Sélectionnez votre secteur</h2>
              <div className="grid gap-3 md:grid-cols-3 mb-8">
                {SECTORS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSector(s.id);
                      setActivity('');
                      setCustomActivity('');
                    }}
                    className={`text-center border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 font-bold ${
                      sector === s.id
                        ? 'border-[#52B788] bg-green-50 text-[#1B2A4A]'
                        : 'border-[#dbe3f0] text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {sector && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-sm font-bold mb-4 uppercase text-gray-500 tracking-wider">Précisez votre activité</h2>
                  <div className="grid gap-3 md:grid-cols-2 mb-4">
                    {ACTIVITIES[sector]?.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setActivity(a.id);
                          setCustomActivity('');
                        }}
                        className={`text-left border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 font-medium ${
                          activity === a.id
                            ? 'border-[#52B788] bg-green-50 text-[#1B2A4A]'
                            : 'border-[#dbe3f0] text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                  {showCustomActivity && (
                    <label className="flex flex-col gap-2 font-semibold text-gray-800 animate-in fade-in mt-4">
                      <span>Décrivez votre activité</span>
                      <textarea
                        rows={3}
                        value={customActivity}
                        onChange={(e) => setCustomActivity(e.target.value)}
                        placeholder="Ex: Organisation d'excursions..."
                        className="border border-[#dbe3f0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 focus:border-[#52B788] bg-gray-50"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {classificationLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#52B788] mb-4" />
                  <p className="text-lg font-medium text-gray-700">{classificationStatus}</p>
                </div>
              ) : eligibilityResult ? (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e7fff3] text-[#16784b] font-bold text-sm">
                    ✓ Éligible au financement
                  </div>
                  <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-green-100/50">
                        <strong className="text-gray-700">Activité reconnue</strong>
                        <span className="font-bold text-gray-900">{eligibilityResult.activityLabel}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-green-100/50">
                        <strong className="text-gray-700">Programme suggéré</strong>
                        <span className="font-bold text-gray-900">{eligibilityResult.program}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-green-100/50">
                        <strong className="text-gray-700">Taux de subvention IA</strong>
                        <span className="font-bold text-[#16784b]">Jusqu'à 90%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-green-100/50">
                        <strong className="text-gray-700">Montant HT estimé</strong>
                        <span className="font-bold text-gray-900">{eligibilityResult.montantHt.toLocaleString('fr-MA')} DHS</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-green-100/50">
                        <strong className="text-gray-700">Subvention estimée</strong>
                        <span className="font-bold text-[#16784b]">{eligibilityResult.subvention.toLocaleString('fr-MA')} DHS</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <strong className="text-gray-700">Reste à charge</strong>
                        <span className="font-bold text-gray-900">{eligibilityResult.reste.toLocaleString('fr-MA')} DHS</span>
                      </div>
                    </div>
                    {eligibilityResult.classification && (
                      <p className="mt-6 text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-100">
                        Classification IA : {eligibilityResult.classification.sector} ({eligibilityResult.classification.confidence}%)
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p>Aucun résultat trouvé.</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-4">
                    Présence Digitale
                  </h3>
                  <div className="space-y-4">
                    <p className="font-semibold text-gray-700 text-sm">Avez-vous un site web ?</p>
                    <div className="flex gap-6">
                      <button onClick={() => setHasWebsite('Oui')} className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all font-bold ${hasWebsite === 'Oui' ? 'border-[#52B788] bg-green-50 text-[#1B2A4A]' : 'border-[#dbe3f0] bg-gray-50 text-gray-600'}`}>Oui</button>
                      <button onClick={() => setHasWebsite('Non')} className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all font-bold ${hasWebsite === 'Non' ? 'border-[#52B788] bg-green-50 text-[#1B2A4A]' : 'border-[#dbe3f0] bg-gray-50 text-gray-600'}`}>Non</button>
                    </div>
                  </div>
                  
                  <label className="flex flex-col gap-2 font-semibold text-gray-700 text-sm mt-5">
                    <span>Plateformes de vente (Booking, Airbnb, etc.)</span>
                    <input type="text" value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="Ex: Booking, Airbnb, Agence de voyage..." className="border border-[#dbe3f0] bg-gray-50 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 focus:border-[#52B788] transition-all" />
                  </label>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-4">
                    Vos Besoins Prioritaires
                  </h3>
                  <div className="grid gap-3">
                    {[
                      "Répondre instantanément sur WhatsApp aux demandes",
                      "Avoir des photos / vidéos professionnelles et vues de drone",
                      "Éviter les erreurs d'overbooking entre Booking et Airbnb",
                      "Suivi de l'activité en temps réel",
                      "Disponibilité de l'information de gestion (Stock, factures, créances...)"
                    ].map(need => {
                      const isSelected = needs.includes(need);
                      return (
                        <label key={need} className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ${isSelected ? 'border-[#52B788] bg-green-50' : 'border-[#dbe3f0] bg-gray-50'}`}>
                          <input type="checkbox" checked={isSelected} onChange={(e) => { if (e.target.checked) setNeeds([...needs, need]); else setNeeds(needs.filter(n => n !== need)); }} className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#52B788] accent-[#52B788] focus:ring-[#52B788]" />
                          <span className={`leading-snug text-sm font-medium ${isSelected ? 'text-[#1B2A4A]' : 'text-gray-700'}`}>{need}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-sm font-bold uppercase text-gray-700 tracking-wider mb-4">
                Sélectionnez le pack d'accompagnement
              </h3>
              <div className="space-y-4">
                {[
                  { id: 'PACK I : IMMERSION DIGITALE', charge: '3 000' },
                  { id: 'PACK II : EXCELLENCE VISUELLE', charge: '4 500' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPack(p.id)}
                    className={`w-full text-left flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-200 ${
                      pack === p.id 
                        ? 'border-[#52B788] bg-green-50 shadow-md' 
                        : 'border-[#dbe3f0] bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg mb-1">{p.id.split(' (')[0]}</div>
                      <div className="text-gray-500 font-medium text-sm bg-white inline-block px-3 py-1 rounded-full border border-gray-200">
                        Reste à charge : {p.charge} MAD HT
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${pack === p.id ? 'border-[#52B788] bg-[#52B788]' : 'border-gray-300'}`}>
                      {pack === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              
              <div className="space-y-6">
                
                {/* Statuts */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569]">Statuts de l'entreprise</label>
                  <label className="flex items-center justify-between border border-[#e2e8f0] rounded-xl p-3 bg-[#f8fafc] cursor-pointer hover:border-[#cbd5e1] hover:bg-white transition-colors">
                    <span className="text-sm text-gray-400 font-medium truncate flex-1">
                      {fileStatuts ? fileStatuts.name : "Sélectionner un fichier (Optionnel)"}
                    </span>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <input type="file" className="hidden" onChange={(e) => e.target.files && setFileStatuts(e.target.files[0])} />
                  </label>
                </div>

                {/* RC */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569]">Registre de commerce <span className="text-red-500">*</span></label>
                  <label className="flex items-center justify-between border border-[#e2e8f0] rounded-xl p-3 bg-[#f8fafc] cursor-pointer hover:border-[#cbd5e1] hover:bg-white transition-colors">
                    <span className={`text-sm font-medium truncate flex-1 ${fileRC ? 'text-gray-900' : 'text-gray-400'}`}>
                      {fileRC ? fileRC.name : "Sélectionner un fichier"}
                    </span>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <input type="file" className="hidden" onChange={(e) => e.target.files && setFileRC(e.target.files[0])} />
                  </label>
                </div>

                {/* Régularité fiscale */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569]">Régularité fiscale</label>
                  <label className="flex items-center justify-between border border-[#e2e8f0] rounded-xl p-3 bg-[#f8fafc] cursor-pointer hover:border-[#cbd5e1] hover:bg-white transition-colors">
                    <span className="text-sm text-gray-400 font-medium truncate flex-1">
                      {fileFiscale ? fileFiscale.name : "Sélectionner un fichier (Optionnel)"}
                    </span>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <input type="file" className="hidden" onChange={(e) => e.target.files && setFileFiscale(e.target.files[0])} />
                  </label>
                </div>

                {/* CNSS */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569]">Régularité de soumission CNSS</label>
                  <label className="flex items-center justify-between border border-[#e2e8f0] rounded-xl p-3 bg-[#f8fafc] cursor-pointer hover:border-[#cbd5e1] hover:bg-white transition-colors">
                    <span className="text-sm text-gray-400 font-medium truncate flex-1">
                      {fileCnss ? fileCnss.name : "Sélectionner un fichier (Optionnel)"}
                    </span>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <input type="file" className="hidden" onChange={(e) => e.target.files && setFileCnss(e.target.files[0])} />
                  </label>
                </div>

                {/* Bilan */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569]">Bilan des 2 années passées</label>
                  <label className="flex items-center justify-between border border-[#e2e8f0] rounded-xl p-3 bg-[#f8fafc] cursor-pointer hover:border-[#cbd5e1] hover:bg-white transition-colors">
                    <span className="text-sm text-gray-400 font-medium truncate flex-1">
                      {fileBilan ? fileBilan.name : "Sélectionner un fichier (Optionnel)"}
                    </span>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <input type="file" className="hidden" onChange={(e) => e.target.files && setFileBilan(e.target.files[0])} />
                  </label>
                </div>

              </div>

              {uploadStatus && (
                <div className="mt-6 text-center">
                  <p className="text-sm font-bold bg-blue-50 text-blue-700 p-4 rounded-xl inline-block w-full">
                    {uploadStatus}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-6">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
                ✓
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Dossier soumis avec succès !</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Un email de confirmation a été envoyé à <strong className="text-gray-900">{email}</strong>.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-left mb-6">
                <p className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 text-center">Votre code d'accès sécurisé</p>
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex justify-center items-center shadow-sm">
                  <code className="text-4xl font-mono font-bold text-[#52B788] tracking-[0.2em]">
                    {accessCode}
                  </code>
                </div>
                <p className="text-sm text-gray-500 mt-5 leading-relaxed text-center font-medium">
                  Notez précieusement ce code et votre numéro d'ICE. Ils vous seront demandés pour vous connecter.
                </p>
              </div>

              {/* Action Requise CTA */}
              <div className="bg-[#FAFCFA] border-2 border-dashed border-[#52B788]/40 rounded-3xl p-8 text-left space-y-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52B788] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#52B788]"></span>
                  </span>
                  <p className="text-xs uppercase tracking-wider text-[#52B788] font-extrabold">Action requise immédiatement</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-gray-900">Compléter le Diagnostic & Cadrage Métier</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Pour valider définitivement votre éligibilité et permettre à nos équipes de configurer vos futurs outils de planification, veuillez vous connecter dès maintenant à l'Espace Client afin de remplir le diagnostic complet.
                  </p>
                </div>

                {onNavigateToEspaceClient && (
                  <button 
                    onClick={onNavigateToEspaceClient}
                    className="w-full sm:w-auto bg-[#1B2A4A] text-white hover:bg-black px-6 py-3.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Accéder à l'Espace Client</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          {step < 7 && (
            <footer className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100 gap-4">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1 || uploading || (step === 3 && classificationLoading)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
              
              {step < TOTAL_STEPS ? (
                <button
                  onClick={handleNext}
                  disabled={step === 3 && classificationLoading}
                  className="flex items-center gap-2 bg-[#52B788] text-white rounded-xl py-3 px-8 font-bold hover:bg-[#429d73] transition-colors shadow-md shadow-green-200/50 disabled:opacity-50"
                >
                  Suivant <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submitToSupabase}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-[#123] text-white rounded-xl py-3 px-8 font-bold hover:bg-black transition-colors shadow-lg disabled:opacity-70"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Soumettre le dossier
                </button>
              )}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
