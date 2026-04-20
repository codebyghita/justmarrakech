import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronDown, MessageCircle, Check, X, ShieldCheck, Heart, Map, Clock, Users, Globe, Gem } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import ReviewsBlock from '../components/ReviewsBlock';
import { getCmsValue } from '../utils/translation';

export default function SurMesure() {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const container = useRef();

  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({});
  const [cms, setCms] = useState({});
  const [openProgram, setOpenProgram] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/public/settings'),
      axios.get('http://127.0.0.1:8000/api/public/content/sur-mesure')
    ]).then(([settingsRes, cmsRes]) => {
      setSiteSettings(settingsRes.data);
      const block = cmsRes.data?.['sur-mesure-content'];
      if (block?.content) {
        setCms({ 'sur-mesure-content': block });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useGSAP(() => {
    if (loading) return;

    const tl = gsap.timeline();
    tl.from(".sur-hero-title > *", { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: "power3.out" })
      .from(".sur-hero-tags > div", { y: 20, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }, "-=0.5")
      .from(".sur-gallery", { scale: 1.05, opacity: 0, duration: 1.2, ease: "power2.out" }, "-=0.6");

    gsap.utils.toArray('.fade-in-section').forEach(section => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: "top 85%"
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });
    });
  }, { scope: container, dependencies: [loading] });

  const handleWhatsApp = (context = 'Général') => {
    const rawNum = siteSettings['whatsapp_number']?.value || '212714173661';
    const whatsappNum = rawNum.replace(/\D/g, '');
    const msg = `Bonjour Just Marrakech, je souhaite obtenir un devis pour un séjour sur mesure (%0AContexte : ${context}%0A). Voici mes souhaits : `;
    window.open(`https://wa.me/${whatsappNum}?text=${msg}`, '_blank');
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
     );
  }

  // --- CMS DATA with fallbacks ---
  const smCms = getCmsValue(cms, 'sur-mesure-content', {}, i18n.language);

  const staticGallery = ['/itinerary.jfif', '/images/hero_home.jfif', '/images/des_0.jfif'];
  const filteredCmsGallery = (smCms.galleryImages || []).filter(Boolean);
  const galleryImages = filteredCmsGallery.length > 0 ? filteredCmsGallery : staticGallery;

  const activeSejourCards = smCms.sejourCards?.length > 0 ? smCms.sejourCards : [];

  const targetAudiences = t('sur_mesure_page.target_audiences', { returnObjects: true }) || [];
  const keyInfos = (t('sur_mesure_page.key_infos', { returnObjects: true }) || []).map((info, idx) => ({
      ...info,
      icon: idx === 0 ? <Clock size={16}/> : idx === 1 ? <Gem size={16}/> : idx === 2 ? <ShieldCheck size={16}/> : idx === 3 ? <Users size={16}/> : <Globe size={16}/>
  }));

  const whyChooseUs = t('sur_mesure_page.why_choose_us', { returnObjects: true }) || [];
  const programs = t('sur_mesure_page.programs', { returnObjects: true }) || [];
  const formulas = t('sur_mesure_page.formulas', { returnObjects: true }) || [];
  const inclusions = t('sur_mesure_page.inclusions', { returnObjects: true }) || { included: [], excluded: [] };
  const faqs = t('sur_mesure_page.faqs', { returnObjects: true }) || [];
  const practicalInfos = t('sur_mesure_page.practical_infos', { returnObjects: true }) || [];
  const heroTags = t('sur_mesure_page.hero_tags', { returnObjects: true }) || [];

  const activeTargetAudiences = smCms.targetAudiences !== undefined ? smCms.targetAudiences : targetAudiences;
  const activeKeyInfos = (smCms.keyInfos !== undefined ? smCms.keyInfos : keyInfos).map((info, idx) => ({
      ...info,
      icon: idx === 0 ? <Clock size={16}/> : idx === 1 ? <Gem size={16}/> : idx === 2 ? <ShieldCheck size={16}/> : idx === 3 ? <Users size={16}/> : <Globe size={16}/>
  }));
  const activeWhyChooseUs = smCms.whyChooseUs !== undefined ? smCms.whyChooseUs : whyChooseUs;
  const activePrograms = smCms.programs !== undefined ? smCms.programs : programs;
  const activeFormulas = smCms.formulas !== undefined ? smCms.formulas : formulas;
  const activeInclusions = smCms.inclusions !== undefined ? smCms.inclusions : inclusions;
  const activeFaqs = smCms.faqs !== undefined ? smCms.faqs : faqs;
  const activeHeroTags = smCms.heroTags !== undefined ? smCms.heroTags : heroTags;
  const activePracticalInfos = smCms.practicalInfos !== undefined ? smCms.practicalInfos : practicalInfos;

  const getImgUrl = (path) => {
    if (!path) return '/images/hero_home.jfif';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage')) return `http://127.0.0.1:8000${path}`;
    return path;
  };

  return (
    <div ref={container} className="bg-surface min-h-screen pb-32" dir={dir}>
        
        {/* Fullscreen Image Overlay */}
        {selectedImage && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
                <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="Gallery fullscreen" />
            </div>
        )}

      {/* 01 - Hero Section */}
      <section className="pt-10 sm:pt-12 md:pt-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="sur-hero-title mb-8">
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase mb-4 block">
                {t('sur_mesure.tag', 'Séjours sur mesure')}
            </span>
            <h1 className="display-font text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-primary mb-6 italic tracking-tighter leading-[0.9] whitespace-pre-line">
                {smCms.hero_title || 'Séjour sur mesure \nà Marrakech'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-on-surface-variant font-light leading-relaxed max-w-3xl whitespace-pre-line">
                {smCms.hero_subtitle || 'Votre Marrakech, à votre rythme — hébergement vérifié, activités sélectionnées, accompagnement avant et pendant : on compose tout selon vos envies et votre budget.'}
            </p>
        </div>

        {/* Hero Tags */}
        <div className="sur-hero-tags flex flex-wrap gap-2 sm:gap-4 mb-12 border-y border-outline/10 py-6">
             {activeHeroTags.map((tag, i) => (
                  <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${i === activeHeroTags.length - 1 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-container-low border-primary/10 text-on-surface'}`}>
                     <Check size={14} className={i === activeHeroTags.length - 1 ? 'text-primary' : 'text-primary/70'}/> 
                     <span className="text-xs font-bold uppercase tracking-widest">{tag}</span>
                  </div>
              ))}
        </div>

        {/* 02 - Galerie Photos */}
        <div className="sur-gallery relative group overflow-hidden rounded-[1.8rem] sm:rounded-[3rem] sand-shadow-lg aspect-[4/3] md:aspect-[21/9] lg:aspect-[3/1] grid grid-cols-1 md:grid-cols-3 gap-2 bg-surface-container-low mb-20 fade-in-section">
            {galleryImages.map((img, i) => (
                <div key={i} className={`relative overflow-hidden h-full cursor-zoom-in ${i === 2 ? 'hidden md:block' : ''}`} onClick={() => setSelectedImage(img)}>
                    <img src={getImgUrl(img)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]" alt={`Gallery ${i}`} />
                </div>
            ))}
        </div>

        {/* CARTES SÉJOURS — depuis admin */}
        {activeSejourCards.length > 0 && (
          <div className="mb-20 fade-in-section">
            <div className="text-center mb-10">
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase mb-3 block">Destinations</span>
              <h2 className="display-font text-3xl sm:text-4xl text-primary italic">Choisissez votre séjour</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSejourCards.map((card, i) => (
                <div key={i} className="group rounded-3xl overflow-hidden bg-surface border border-primary/10 sand-shadow hover:sand-shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getImgUrl(card.image)}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                      onError={e => { e.currentTarget.src = '/images/hero_home.jfif'; }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="display-font text-xl italic text-primary mb-1">{card.title}</h3>
                    {card.subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">{card.subtitle}</p>}
                    {card.description && <p className="text-sm text-on-surface-variant">{card.description}</p>}
                    <button
                      onClick={() => handleWhatsApp(card.title)}
                      className="mt-4 w-full py-3 bg-primary/10 hover:bg-primary hover:text-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                      Demander un devis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 03 & 04 - Pour qui & Infos clés */}
      {(activeTargetAudiences.length > 0 || activeKeyInfos.length > 0) && (
      <section className="bg-surface-container-low py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8">
                    {activeTargetAudiences.length > 0 && (
                    <div className="lg:col-span-8 fade-in-section">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-4 block">
                            {t('sur_mesure_page.target_audiences_label', 'Identification immédiate')}
                        </span>
                        <h2 className="display-font text-3xl sm:text-4xl text-primary italic mb-8">
                            {t('sur_mesure_page.target_audiences_title', 'Pour qui est fait ce séjour ?')}
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {activeTargetAudiences.map((aud, i) => (
                                <div key={i} className="bg-surface p-6 rounded-3xl border border-primary/10 hover:border-primary/30 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        {typeof aud.icon === 'string' ? <span className="text-xl">{aud.icon}</span> : aud.icon}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-on-surface">{aud.title}</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{aud.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    )}

                    {activeKeyInfos.length > 0 && (
                    <div className="lg:col-span-4 fade-in-section">
                        <div className="bg-surface p-8 rounded-[2.5rem] border border-primary/10 sand-shadow h-full">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-outline/60 uppercase mb-4 block">
                                {t('sur_mesure_page.key_infos_label', 'Infos clés')}
                            </span>
                            <ul className="space-y-6">
                                {activeKeyInfos.map((info, i) => (
                                    <li key={i} className="flex justify-between items-center pb-4 border-b border-outline/10 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3 text-outline/80">
                                            {typeof info.icon === 'string' ? <span className="text-sm">{info.icon}</span> : info.icon}
                                            <span className="text-xs font-bold uppercase tracking-widest">{info.label}</span>
                                        </div>
                                        <span className="font-bold text-on-surface bg-surface-container-highest px-3 py-1 rounded-md text-sm">{info.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    )}
                </div>
            </section>
      )}

            {/* 05 - Pourquoi choisir */}
            {activeWhyChooseUs.length > 0 && (
            <section className="py-20 md:py-32 px-4 sm:px-6 bg-surface">
                <div className="max-w-7xl mx-auto fade-in-section">
                    <h2 className="display-font text-3xl sm:text-4xl text-primary italic mb-10 text-center">
                        {t('sur_mesure_page.why_choose_us_title', 'Pourquoi choisir Just Marrakech ?')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {activeWhyChooseUs.map((reason, i) => (
                            <div key={i} className="bg-surface-container-lowest p-8 rounded-3xl border border-primary/5 sand-shadow-sm text-center">
                                <h3 className="font-bold text-lg mb-4 text-on-surface">{reason.title}</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{reason.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* 06 - Exemple de programme */}
            {activePrograms.length > 0 && (
              <section className="py-20 px-4 sm:px-6 bg-surface-container-low">
                <div className="max-w-4xl mx-auto fade-in-section">
                    <div className="text-center mb-12">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-4 block">
                            {t('sur_mesure_page.programs_label', 'Inspiration')}
                        </span>
                        <h2 className="display-font text-3xl sm:text-5xl text-primary italic">
                            {t('sur_mesure_page.programs_title', 'Exemple de programme')}
                        </h2>
                        <p className="text-sm text-outline/60 mt-4">
                            {t('sur_mesure_page.programs_subtitle', 'Chaque thème peut être déployé au clic pour ne pas surcharger la page.')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {activePrograms.map((prog, index) => (
                            <div key={index} className="bg-surface rounded-2xl border border-primary/10 overflow-hidden transition-all shadow-sm">
                                <button onClick={() => setOpenProgram(openProgram === index ? null : index)} className="w-full flex justify-between items-center p-6 text-left hover:bg-primary/5 transition-colors">
                                    <span className="font-bold text-lg text-primary">{prog.title}</span>
                                    <ChevronDown size={24} className={`text-primary/60 transition-transform duration-300 ${openProgram === index ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`px-6 pb-6 text-on-surface-variant text-base leading-relaxed whitespace-pre-line ${openProgram === index ? 'block' : 'hidden'}`}>
                                    <div className="pt-4 border-t border-primary/10">
                                        {prog.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </section>
            )}

            {/* 08 - Formules */}
            {activeFormulas.length > 0 && (
              <section className="py-20 md:py-32 px-4 sm:px-6 bg-surface">
                <div className="max-w-7xl mx-auto fade-in-section">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-4 block">
                            {t('sur_mesure_page.formulas_label', 'Options & Personnalisation')}
                        </span>
                        <h2 className="display-font text-3xl sm:text-5xl text-primary italic mb-6">
                            {t('sur_mesure_page.formulas_title', 'Nos Formules Base')}
                        </h2>
                        <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
                            {t('sur_mesure_page.formulas_subtitle', 'Ces formules sont des bases — tout est adaptable selon budget, envies et durée.')}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {activeFormulas.map((form, i) => (
                            <div key={i} className={`rounded-[2.5rem] p-8 sm:p-10 flex flex-col ${i === 1 ? 'bg-primary text-white sand-shadow-xl scale-100 lg:scale-105 z-10' : 'bg-surface-container-lowest border border-primary/10 sand-shadow'}`}>
                                <h3 className="display-font text-3xl italic mb-2">{form.title}</h3>
                                <div className={`text-xs font-bold uppercase tracking-widest mb-4 ${i === 1 ? 'text-white/70' : 'text-primary/60'}`}>{form.duration}</div>
                                <p className={`text-sm italic mb-8 h-12 ${i === 1 ? 'text-white/90' : 'text-on-surface-variant'}`}>{form.desc}</p>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {(form.pros || []).map((pro, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                                            <Check size={18} className={`shrink-0 mt-0.5 ${i === 1 ? 'text-secondary' : 'text-primary'}`} />
                                            <span className={i === 1 ? 'text-white' : 'text-on-surface'}>{pro}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={() => handleWhatsApp(`Formule ${form.title}`)} className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${i === 1 ? 'bg-secondary text-white hover:bg-white hover:text-primary shadow-lg' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                                    <MessageCircle size={16} /> {t('sur_mesure_page.cta_whatsapp_devis', 'Demander un devis')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
              </section>
            )}

            {/* 09 - Inclus / Non inclus & 10 - Infos / 11 - FAQ */}
            <section className="py-20 px-4 sm:px-6 bg-surface-container-low mb-20">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 fade-in-section">

                    {/* Inclus / Non inclus */}
                    <div className="space-y-8">
                      {(activeInclusions.included?.length > 0 || activeInclusions.excluded?.length > 0) && (
                        <>
                        <h2 className="display-font text-3xl italic text-primary border-b border-primary/10 pb-4">
                            {t('sur_mesure_page.inclusions_title', 'Inclus / Non inclus')}
                        </h2>
                        <div className="bg-surface p-8 rounded-3xl border border-primary/10">
                            {activeInclusions.included?.length > 0 && (
                            <>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
                                {t('sur_mesure_page.included_label', 'Inclus')}
                            </h3>
                            <ul className="space-y-4 mb-8">
                                {activeInclusions.included.map((inc, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant"><Check size={16} className="text-secondary shrink-0"/> {inc}</li>
                                ))}
                            </ul>
                            </>
                            )}
                            {activeInclusions.excluded?.length > 0 && (
                            <>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-outline mb-6 pt-6 border-t border-outline/10">
                                {t('sur_mesure_page.excluded_label', 'Non inclus')}
                            </h3>
                            <ul className="space-y-4">
                                {activeInclusions.excluded.map((exc, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-outline/70"><X size={16} className="text-error/60 shrink-0"/> {exc}</li>
                                ))}
                            </ul>
                            </>
                            )}
                        </div>
                        </>
                      )}

                        {/* Informations Pratiques (10) */}
                        {activePracticalInfos.length > 0 && (
                        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
                                {t('sur_mesure_page.practical_infos_label', 'Informations Pratiques')}
                            </h3>
                            <ul className="space-y-3">
                                {activePracticalInfos.map((info, i) => (
                                    <li key={i} className={`flex justify-between items-center text-sm ${i !== activePracticalInfos.length -1 ? 'border-b border-primary/10 pb-2' : ''}`}>
                                        <span className="text-outline/70">{info.label}</span>
                                        <span className="font-semibold text-right">{info.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}
                    </div>

                    {/* FAQ */}
                    <div className="space-y-8">
                      {activeFaqs.length > 0 && (
                        <>
                        <h2 className="display-font text-3xl italic text-primary border-b border-primary/10 pb-4">
                            {t('sur_mesure_page.faqs_title', 'Conditions & FAQ')}
                        </h2>
                 <div className="space-y-3">
                  {activeFaqs.map((faq, index) => (
                      <div key={index} className="bg-surface rounded-2xl border border-primary/10 overflow-hidden transition-all shadow-sm">
                        <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center p-5 text-left hover:bg-primary/5 transition-colors">
                            <span className={`font-semibold text-sm pr-4 ${index === activeFaqs.length -1 ? 'text-primary' : 'text-on-surface'}`}>{faq.q}</span>
                            <ChevronDown size={20} className={`text-primary/60 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`px-5 pb-5 text-on-surface-variant text-sm leading-relaxed whitespace-pre-line ${openFaq === index ? 'block' : 'hidden'}`}>
                            <div className="pt-3 border-t border-primary/10">
                                {faq.a}
                            </div>
                        </div>
                      </div>
                  ))}
                 </div>
                 </>
                 )}
             </div>
         </div>
      </section>

      {/* 07 & 12 - Avis Clients & Formulaire (ReviewsBlock reusable component) */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto fade-in-section">
          {/* We use reviewableId=1 and reviewableType='SurMesure' as discussed to store bespoke reviews independently */}
          <ReviewsBlock reviewableId={1} reviewableType="SurMesure" siteSettings={siteSettings} />
      </section>

    </div>
  );
}
