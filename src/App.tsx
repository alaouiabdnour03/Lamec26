import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { EligibilityWizard } from "./components/EligibilityWizard";
import { EspaceClient } from "./components/EspaceClient";

export default function App() {
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [currentView, setCurrentView] = useState<'landing' | 'espace-client'>('landing');
	const [formData, setFormData] = useState({
		raisonSociale: '',
		ice: '',
		cnss: '',
		email: '',
		phone: '',
		trancheCa: '',
		typologie: [] as string[],
		hasWebsite: '',
		plateformes: '',
		besoins: [] as string[],
		pack: ''
	});

	const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
	const toggleArrayItem = (field: 'typologie' | 'besoins', value: string) => setFormData(prev => ({
		...prev,
		[field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value]
	}));

	useEffect(() => {
		if (currentView !== 'landing') return;

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					(entry.target as HTMLElement).style.opacity = '1';
					(entry.target as HTMLElement).style.transform = 'translateY(0)';
				}
			});
		}, { threshold: 0.1 });

		setTimeout(() => {
			document.querySelectorAll('.scroll-animate').forEach(el => {
				observer.observe(el);
			});
		}, 100);

		return () => {
			observer.disconnect();
		};
	}, [currentView]);

	if (currentView === 'espace-client') {
		return <EspaceClient onBack={() => setCurrentView('landing')} />;
	}

	return (
		<div className="w-full min-h-screen overflow-x-hidden flex flex-col items-center bg-[#FAFCFA] text-[#1B2A4A] font-sans">
			<input type="file" ref={fileInputRef} className="hidden" />
			
			{/* Main Container */}
			<div className="w-full max-w-[1440px] bg-white shadow-xl flex flex-col">
				
				{/* Hero Section */}
				<section className="relative w-full mb-10 md:mb-14">
					<div className="w-full bg-cover bg-center py-16 md:py-[139px] px-6 md:px-[100px] flex flex-col gap-10"
						style={{ backgroundImage: 'url(https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/9m5pohjl_expires_30_days.png)' }}>
						<div className="w-full max-w-7xl mx-auto flex flex-col items-start relative">
							
							<div className="w-full flex flex-row justify-between items-start mb-12">
								<div className="flex flex-col">
									<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/me08pjb3_expires_30_days.png" className="w-[67px] h-12 object-contain mb-4" alt="Logo" />
									<span className="text-[#1B2A4A] text-xs font-bold">LA MEC CONSEILS</span>
									<span className="text-[#F59E0B] text-xs font-bold">L'EXPERTISE COMPTABLE</span>
								</div>

								<button 
									onClick={() => setCurrentView('espace-client')}
									className="bg-[#1B2A4A] text-white px-6 py-2.5 mt-1.5 rounded-full font-bold text-sm shadow-lg hover:bg-black transition-colors whitespace-nowrap"
								>
									Accès Espace Client
								</button>
							</div>
							
							<div className="w-full max-w-[839px]">
								<h1 className="scroll-animate text-[#1B2A4A] text-4xl md:text-5xl lg:text-[70px] font-bold leading-tight mb-6">
									Le Nouveau Moteur de<br className="hidden md:block"/>Croissance<br className="hidden md:block"/>de Votre Activité Touristique
								</h1>
								<p className="text-gray-500 text-base md:text-lg max-w-[600px] mb-8">
									Connectez votre offre locale de tourisme et d'animation aux plateformes mondiales. Maximisez vos profits en direct.
								</p>
								<div className="bg-[#F59E0B] w-16 h-1 rounded-full mb-10"></div>
							</div>
							
							<button className="flex flex-col sm:flex-row items-start sm:items-center bg-white/60 md:bg-[#1B2A4A12] py-3 px-6 gap-2 sm:gap-11 rounded-xl hover:bg-black/10 transition-colors border-0" onClick={() => alert("Action cliquée !")}>
								<span className="text-[#1B2A4A] text-sm font-bold">Manager</span>
								<span className="text-[#1B2A4A] text-sm font-bold break-all">Manager@lameconseils.ma</span>
							</button>
						</div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="px-4 md:px-10 mb-14 lg:mb-24">
					<div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
						<div className="flex flex-col flex-1 p-8 md:py-[39px] md:px-10 gap-2 border-b lg:border-b-0 lg:border-r border-gray-100">
							<span className="scroll-animate text-[#1B2A4A] text-base font-bold">Le Coût de l'Inaction Commerciale</span>
							<span className="text-[#F59E0B] text-6xl md:text-[110px] font-bold leading-none my-4">85%</span>
							<span className="scroll-animate text-[#1B2A4A] text-base font-bold">des demandes sans réponse sont perdues</span>
						</div>
						<div className="flex flex-col flex-1 p-8 md:py-[43px] md:px-10 justify-center">
							<h3 className="text-[#1B2A4A] text-xl font-bold mb-4">L'Exigence Absolue d'Immédiateté</h3>
							<p className="text-[#1B2A4A] text-sm mb-4 leading-relaxed">
								En 2025, 85% des voyageurs se tournent instantanément vers le concurrent direct si leur premier contact (WhatsApp, téléphone, email) ne reçoit pas de réponse qualifiée en moins de 30 secondes.
							</p>
							<p className="text-[#1B2A4A] text-sm leading-relaxed">
								De plus, la commission des agences en ligne internationales (OTA) dépasse en moyenne 15% à 25% de votre chiffre d'affaires, rognant votre rentabilité directe.
							</p>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="w-full py-16 mb-14 lg:mb-24 bg-gradient-to-b from-transparent via-gray-50/80 to-transparent">
					<div className="w-full max-w-[1104px] mx-auto px-4 md:px-8 flex flex-col items-center gap-10">
						<h2 className="text-[#1B2A4A] text-2xl md:text-[22px] font-bold text-center">L'Écosystème de Vente Directe Connecté</h2>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
							<div className="flex flex-col bg-white p-8 gap-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
								<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/nsgkor0z_expires_30_days.png" className="w-10 h-10 rounded-xl object-cover mb-2" alt="Icon" />
								<div>
									<h4 className="text-[#1B2A4A] text-lg font-bold mb-3">Interconnexion APIs Performante</h4>
									<p className="text-gray-600 text-sm mb-3 leading-relaxed">Nous intégrons vos canaux de réservation et d'animation directement avec les grandes plateformes de distribution connectée internationalement.</p>
									<p className="text-gray-600 text-sm leading-relaxed">Visez l'excellence technique et transformez décentralisément pour optimiser l'expérience et vos taux de succès.</p>
								</div>
							</div>
							
							<div className="flex flex-col bg-white p-8 gap-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
								<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/hvjxwkcn_expires_30_days.png" className="w-10 h-10 rounded-xl object-cover mb-2" alt="Icon" />
								<div>
									<h4 className="text-[#1B2A4A] text-lg font-bold mb-3">Boutiques & Vitrines Préétablies</h4>
									<p className="text-gray-600 text-sm mb-3 leading-relaxed">Nous déployons des vitrines digitales sur-mesure et des boutiques de commerce en ligne pour votre structure.</p>
									<p className="text-gray-600 text-sm leading-relaxed">Mettez en avant l'essence unique de votre offre et offrez une interface claire, attractive et aide conversion.</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Section 01 */}
				<section className="flex flex-col lg:flex-row items-center px-4 md:px-12 mb-14 lg:mb-24 gap-12 max-w-[1200px] mx-auto w-full">
					<div className="flex flex-col flex-1 w-full">
						<div className="bg-[#52B788] w-12 h-0.5 mb-5"></div>
						<span className="text-[#52B788] text-xs font-bold mb-4 tracking-wider uppercase">Plateformes</span>
						<h2 className="text-[#1B2A4A] text-3xl md:text-4xl font-bold mb-6">01. Plateformes d'Animation</h2>
						
						<h3 className="text-[#1B2A4A] text-xl font-bold mb-3">Une Expérience Client sans Friction</h3>
						<p className="text-gray-600 text-sm mb-8 leading-relaxed">
							Nos solutions unifient l'image et l'acte d'achat d'un prospect voyageur pour transformer l'intention en profit instantané.
						</p>
						
						<div className="flex flex-col gap-6">
							<div className="flex items-start gap-4">
								<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/nh7msulu_expires_30_days.png" className="w-6 h-6 object-contain mt-0.5 shrink-0" alt="" />
								<p className="text-[#1B2A4A] text-sm leading-relaxed"><strong className="font-bold">Showrooms Web Prédéfinis :</strong> Des vitrines esthétiques, fluides et optimisées pour le SEO et l'usage mobile.</p>
							</div>
							<div className="flex items-start gap-4">
								<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/44qv4k04_expires_30_days.png" className="w-6 h-6 object-contain mt-0.5 shrink-0" alt="" />
								<p className="text-[#1B2A4A] text-sm leading-relaxed"><strong className="font-bold">E-Boutiques de Loisirs :</strong> Réservation de créneaux, cours collectifs, excursions ou packages en temps réel.</p>
							</div>
							<div className="flex items-start gap-4">
								<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/ya9tjvws_expires_30_days.png" className="w-6 h-6 object-contain mt-0.5 shrink-0" alt="" />
								<p className="text-[#1B2A4A] text-sm leading-relaxed"><strong className="font-bold">Passerelles de Paiement :</strong> Intégration locale et internationale pour un encaissement direct sur votre compte.</p>
							</div>
						</div>
					</div>
					<div className="flex-1 w-full flex justify-center lg:justify-end">
						<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/cllhgp6i_expires_30_days.png" className="w-full max-w-[500px] lg:max-w-full h-auto object-cover rounded-2xl" alt="App interface preview" />
					</div>
				</section>

				{/* Solutions */}
				<section className="px-4 md:px-12 mb-14 lg:mb-24 max-w-[1200px] mx-auto w-full">
					<h3 className="text-center text-black text-[22px] leading-[29px] font-bold mb-8">Solutions Adaptées À Votre Secteur</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/1p3ej3s1_expires_30_days.png" className="w-12 h-12 rounded-xl object-cover" alt="" />
							<h4 className="text-black text-base font-bold">Hébergements & Riads</h4>
							<p className="text-gray-600 text-sm leading-relaxed">Vitrines de prestige, centralisation multicannale et excellence commerciale via la liaison pour capter et fidéliser directeurs de talents.</p>
						</div>
						<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/24lxttby_expires_30_days.png" className="w-12 h-12 rounded-xl object-cover" alt="" />
							<h4 className="text-black text-base font-bold">Surf Camps & Loisirs</h4>
							<p className="text-gray-600 text-sm leading-relaxed">Vente de cours à la carte, gestion des stocks d'équipements et coordination de sessions en direct via des espaces dynamiques et engageants.</p>
						</div>
						<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/1f7gln9e_expires_30_days.png" className="w-12 h-12 rounded-xl object-cover" alt="" />
							<h4 className="text-black text-base font-bold">Agences & Excursions</h4>
							<p className="text-gray-600 text-sm leading-relaxed">Catalogues interactifs d'expériences, plannings dynamiques des guides, et suivi personnalisé des réservations en temps réel.</p>
						</div>
					</div>
				</section>

				{/* Section 02 */}
				<section className="flex flex-col-reverse lg:flex-row items-center px-4 md:px-12 mb-20 lg:mb-32 gap-12 max-w-[1200px] mx-auto w-full">
					<div className="flex flex-col flex-1 gap-6 w-full">
						<div>
							<div className="bg-[#52B788] w-12 h-0.5 mb-5"></div>
							<span className="text-[#52B788] text-xs font-bold mb-4 block tracking-wider uppercase">Attractivité & Autorité</span>
							<h2 className="text-[#1B2A4A] text-3xl md:text-4xl font-bold">02. L'Allure d'une Enseigne</h2>
						</div>
						
						<h3 className="text-[#1B2A4A] text-xl font-bold">Sublimez Votre Spot Touristique</h3>
						<p className="text-gray-600 text-sm leading-relaxed mb-4">
							Le coup de cœur d'un voyageur s'établit sur la preuve visuelle. Nous mettons en œuvre notre compétence de création artistique de classe internationale.
						</p>
						
						<div className="flex items-start bg-white p-6 gap-4 rounded-2xl border border-gray-200 shadow-sm">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/rzc0yj5h_expires_30_days.png" className="w-12 h-12 rounded-xl object-cover shrink-0" alt="" />
							<div>
								<h4 className="text-[#1B2A4A] text-sm font-bold mb-2">Contenus RVA & Drone 4K</h4>
								<p className="text-gray-600 text-sm leading-relaxed">
									Shootings aériens professionnels, images vitrines de caractère et clips montés spécifiquement pour déclencher l'acte d'achat sur vos réseaux.
								</p>
							</div>
						</div>
					</div>
					<div className="flex-1 w-full flex justify-center lg:justify-end">
						<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/17cbnt4k_expires_30_days.png" className="w-full max-w-[500px] lg:max-w-full rounded-2xl object-cover" alt="" />
					</div>
				</section>

				{/* Section 07 */}
				<section className="px-4 md:px-12 mb-20 lg:mb-32 max-w-[1200px] mx-auto w-full">
					<div className="mb-10 text-center lg:text-left">
						<div className="bg-[#52B788] w-12 h-0.5 mb-5 mx-auto lg:mx-0"></div>
						<span className="text-[#52B788] text-xs font-bold mb-4 block tracking-wider uppercase">Méthodologie</span>
						<h2 className="text-[#1B2A4A] text-3xl md:text-4xl font-bold">07. Plan de Déploiement</h2>
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
						<div className="flex flex-col items-center text-center gap-4 bg-gray-50/50 p-6 rounded-2xl">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/c7z9akd8_expires_30_days.png" className="w-14 h-14 object-contain mb-2" alt="" />
							<span className="text-[#52B788] text-[10px] font-bold uppercase tracking-wider">Étape 1</span>
							<p className="text-[#1B2A4A] text-sm leading-relaxed">Audit UI, audit sémantique et mise en ligne de l'audience au lancement de l'étude d'objets.</p>
						</div>
						<div className="flex flex-col items-center text-center gap-4 bg-gray-50/50 p-6 rounded-2xl">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/8wenmxb5_expires_30_days.png" className="w-14 h-14 object-contain mb-2" alt="" />
							<span className="text-[#52B788] text-[10px] font-bold uppercase tracking-wider">Étape 2</span>
							<p className="text-[#1B2A4A] text-sm leading-relaxed">Shooting drone & sol, développement et fidélité de l'image et enrichissement de l'offre réseaux.</p>
						</div>
						<div className="flex flex-col items-center text-center gap-4 bg-gray-50/50 p-6 rounded-2xl">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/nve3ys90_expires_30_days.png" className="w-14 h-14 object-contain mb-2" alt="" />
							<span className="text-[#52B788] text-[10px] font-bold uppercase tracking-wider">Étape 3</span>
							<p className="text-[#1B2A4A] text-sm leading-relaxed">Déploiement des VPN dédiés et intégration des paiements en cours d'un environnement des offres.</p>
						</div>
						<div className="flex flex-col items-center text-center gap-4 bg-gray-50/50 p-6 rounded-2xl">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/g6a5cq6y_expires_30_days.png" className="w-14 h-14 object-contain mb-2" alt="" />
							<span className="text-[#52B788] text-[10px] font-bold uppercase tracking-wider">Étape 4</span>
							<p className="text-[#1B2A4A] text-sm leading-relaxed">Go-Live global, formation des équipes hôtelières et révision finale des offres.</p>
						</div>
					</div>
				</section>

				{/* Section 08 */}
				<section className="px-4 md:px-12 mb-20 lg:mb-32 max-w-[1104px] mx-auto w-full">
					<div className="mb-12">
						<div className="bg-[#52B788] w-12 h-0.5 mb-5"></div>
						<span className="text-[#52B788] text-xs font-bold mb-4 block tracking-wider uppercase">Nos Résultats</span>
						<h2 className="text-[#1B2A4A] text-3xl md:text-4xl font-bold">08. Maximisez Vos Marges</h2>
					</div>
					
					<div className="flex flex-col gap-8 mb-12">
						{/* Bar 1 */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/pynzasbb_expires_30_days.png" className="w-12 h-12 object-contain shrink-0 hidden sm:block" alt="" />
							<div className="flex-1 flex flex-col gap-3">
								<div className="flex flex-wrap justify-between items-center gap-2">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-[#1B2A4A] text-sm font-bold">Canal Connecté Direct</span>
										<span className="text-gray-500 text-xs">(Votre Site Web)</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-[#1B2A4A] text-sm font-bold">90%</span>
										<span className="text-gray-500 text-xs hidden xs:inline">Marge Conservée</span>
									</div>
								</div>
								<div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
									<div className="bg-[#52B788] w-[90%] h-full rounded-full transition-all duration-1000"></div>
								</div>
							</div>
						</div>
						
						{/* Bar 2 */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/jx0tmjlf_expires_30_days.png" className="w-12 h-12 object-contain shrink-0 hidden sm:block" alt="" />
							<div className="flex-1 flex flex-col gap-3">
								<div className="flex flex-wrap justify-between items-center gap-2">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-[#1B2A4A] text-sm font-bold">Canal Hybride</span>
										<span className="text-gray-500 text-xs">(Opéré par Partenaire)</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-[#1B2A4A] text-sm font-bold">60%</span>
										<span className="text-gray-500 text-xs hidden xs:inline">Marge Conservée</span>
									</div>
								</div>
								<div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
									<div className="bg-[#FCD34D] w-[60%] h-full rounded-full transition-all duration-1000"></div>
								</div>
							</div>
						</div>
						
						{/* Bar 3 */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/pvxuhgis_expires_30_days.png" className="w-12 h-12 object-contain shrink-0 hidden sm:block" alt="" />
							<div className="flex-1 flex flex-col gap-3">
								<div className="flex flex-wrap justify-between items-start sm:items-center gap-2">
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
										<span className="text-[#1B2A4A] text-sm font-bold">Canal OTA Classique</span>
										<span className="text-gray-500 text-xs">(Booking, Expedia, Airbnb)</span>
									</div>
									<div className="flex flex-col items-end">
										<div className="flex items-center gap-2">
											<span className="text-[#1B2A4A] text-sm font-bold">70%</span>
											<span className="text-gray-500 text-xs hidden xs:inline">Marge Conservée</span>
										</div>
										<span className="text-gray-400 text-[10px] mt-1">[15-25% de frais]</span>
									</div>
								</div>
								<div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
									<div className="bg-[#F97316] w-[70%] h-full rounded-full transition-all duration-1000"></div>
								</div>
							</div>
						</div>
					</div>
					
					<div className="flex items-start sm:items-center gap-5 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
						<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/p15d71m5_expires_30_days.png" className="w-10 h-10 object-contain shrink-0" alt="" />
						<p className="text-[#1B2A4A] text-sm leading-relaxed">
							En privilégiant nos canaux directs, vous récupérez jusqu'à 25% de revenus supplémentaires à chaque vente et renforcez votre rentabilité de votre ROI dès la première saison.
						</p>
					</div>
				</section>

				{/* Section 10 */}
				<section className="px-4 md:px-12 mb-20 lg:mb-32 max-w-[1200px] mx-auto w-full">
					<div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
						{/* Left Card */}
						<div className="w-full lg:w-[380px] bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col shrink-0 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-32 h-32 bg-[#52B788]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
							<div className="inline-flex self-start py-1.5 px-4 mb-8 bg-gray-100 rounded-full relative z-10">
								<span className="text-gray-800 text-[10px] font-bold tracking-wider">LANCEMENT SAISON PROCHAINE</span>
							</div>
							<h3 className="text-[#1B2A4A] text-3xl font-bold leading-tight mb-6 relative z-10">Offre Spéciale<br/>Premium</h3>
							<p className="text-gray-600 text-sm leading-relaxed mb-8 relative z-10">
								Afin de propulser notre écosystème, les <strong>3 premiers</strong> opérateurs touristiques validés bénéficieront d'une priorité absolue de mise en réseau sous 15 jours et de la gratuité complète du premier mois de maintenance.
							</p>
							<button className="mt-auto w-full py-4 px-6 rounded-full border border-gray-200 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all relative z-10" onClick={() => alert("Pressed!")}>
								Découvrez l'offre →
							</button>
						</div>
						
						{/* Right Content */}
						<div className="flex-1 flex flex-col">
							<div className="mb-10">
								<div className="bg-[#52B788] w-12 h-0.5 mb-5"></div>
								<span className="text-[#52B788] text-xs font-bold mb-4 block tracking-wider uppercase">Nos Offres</span>
								<h2 className="text-[#1B2A4A] text-3xl md:text-4xl font-bold mb-4">10. Bénéficiez d'un reste à charge de 10%</h2>
								<p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
									Prestations et solutions subventionnées à hauteur de 90% pour accélérer votre transition numérique avec notre cabinet partenaire.
								</p>
							</div>
							
							<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
								<div className="grid grid-cols-1 sm:grid-cols-12 border-b border-gray-100 bg-gray-50/80 p-4 md:p-6">
									<div className="sm:col-span-6 md:col-span-7 mb-2 sm:mb-0">
										<span className="text-gray-500 text-xs font-bold tracking-wider">PRESTATION / SOLUTION</span>
									</div>
									<div className="sm:col-span-3 text-left sm:text-center mb-2 sm:mb-0">
										<span className="text-gray-500 text-xs font-bold tracking-wider">VALEUR RÉELLE</span>
									</div>
									<div className="sm:col-span-3 text-left sm:text-right">
										<span className="text-gray-500 text-xs font-bold tracking-wider block">RESTE À CHARGE</span>
										<span className="text-gray-400 text-[10px]">(SUBVENTIONNÉ)</span>
									</div>
								</div>
								
								<div className="flex flex-col divide-y divide-gray-100">
									{/* Row 1 */}
									<div className="grid grid-cols-1 sm:grid-cols-12 p-4 md:p-6 gap-y-3">
										<div className="sm:col-span-6 md:col-span-7 pr-4">
											<h4 className="text-[#1B2A4A] text-sm font-bold mb-1">Pack : Immersion Digitale</h4>
											<p className="text-gray-500 text-xs">Audit UI - Agent Conversationnel WhatsApp</p>
										</div>
										<div className="sm:col-span-3 text-left sm:text-center sm:self-center">
											<span className="text-gray-600 text-sm whitespace-nowrap">30 000 MAD HT</span>
										</div>
										<div className="sm:col-span-3 text-left sm:text-right sm:self-center">
											<span className="text-[#F59E0B] text-sm font-bold whitespace-nowrap">3 000 MAD HT</span>
										</div>
									</div>
									
									{/* Row 2 */}
									<div className="grid grid-cols-1 sm:grid-cols-12 p-4 md:p-6 gap-y-3">
										<div className="sm:col-span-6 md:col-span-7 pr-4">
											<h4 className="text-[#1B2A4A] text-sm font-bold mb-1">Pack : Excellence Visuelle & Omnicanal</h4>
											<p className="text-gray-500 text-xs">Prise de vue - Booking Engine + Système d'inventaire</p>
										</div>
										<div className="sm:col-span-3 text-left sm:text-center sm:self-center">
											<span className="text-gray-600 text-sm whitespace-nowrap">45 000 MAD HT</span>
										</div>
										<div className="sm:col-span-3 text-left sm:text-right sm:self-center">
											<span className="text-[#F59E0B] text-sm font-bold whitespace-nowrap">4 500 MAD HT</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Form Section */}
				<section id="eligibility-section" className="px-4 md:px-12 mb-24 max-w-[1200px] mx-auto w-full">
					<div className="mb-12">
						<div className="bg-[#52B788] w-12 h-0.5 mb-5"></div>
						<span className="text-[#52B788] text-xs font-bold mb-4 block tracking-wider uppercase">Éligibilité</span>
						<h2 className="text-[#1B2A4A] text-3xl md:text-4xl font-bold">11. Formulaire d'Éligibilité</h2>
					</div>
					
					<EligibilityWizard onNavigateToEspaceClient={() => {
						setCurrentView('espace-client');
						// Scroll to top of the page so EspaceClient login is visible
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}} />
				</section>

				{/* Footer */}
				<footer className="w-full bg-white border-t border-gray-100 py-12 px-4 flex flex-col items-center">
					<div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
						<div className="flex items-center gap-6">
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/cc1tsca0_expires_30_days.png" className="w-16 h-auto object-contain" alt="Logo" />
							<div className="flex flex-col">
								<span className="text-[#1B2A4A] text-xs font-bold tracking-wider">LA MAISON DE</span>
								<span className="text-[#2D6A4F] text-xs font-bold tracking-wider">L'EXPERTISE COMPTABLE</span>
							</div>
						</div>
						
						<div className="flex items-center gap-4">
							<span className="text-[#1B2A4A] text-sm font-medium">contact@lameconseil.com</span>
							<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yG6rnZOno2/u7s9dsw3_expires_30_days.png" className="w-9 h-9 object-cover rounded-full" alt="Contact Icon" />
						</div>
					</div>
					<div className="text-center text-gray-400 text-xs">
						© 2026 La MEC Conseils. Tous droits réservés.
					</div>
				</footer>
			</div>
		</div>
	);
}
