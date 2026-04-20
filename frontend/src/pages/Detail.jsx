import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '../utils/translation';
import { 
  ArrowLeft, Clock, MapPin, Users, Check, X, 
  ChevronDown, MessageCircle, Star, Send, Copy, ExternalLink 
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { useRef } from 'react';
import ReviewsBlock from '../components/ReviewsBlock';

export default function Detail() {
  const { type, id, activitySlug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [data, setData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFormula, setSelectedFormula] = useState(null);

  useEffect(() => {
    const isAct = !!activitySlug || type === 'activity';
    const endpoint = isAct ? 'activities' : 'accommodations';
    const identifier = id || activitySlug;

    const fetchData = async () => {
        try {
            const [itemRes, settingsRes] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/public/${endpoint}/${identifier}`),
                axios.get('http://127.0.0.1:8000/api/public/settings')
            ]);
            
            const item = itemRes.data;
            setData(item);
            setSiteSettings(settingsRes.data);
            
            // From here on, use the actual numeric ID from the database for related data
            const dbId = item.id;

            // Set initial formula
            const formulas = getJsonField(item, 'formulas');
            if (formulas?.length > 0) setSelectedFormula(formulas[0]);

            // Settings
            setSiteSettings(settingsRes.data);

            // Fetch Unavailable dates
            const modelType = isAct ? 'App\\Models\\Activity' : 'App\\Models\\Accommodation';
            const [specCal, globCal] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/public/unavailable_dates?type=${modelType}&id=${dbId}`),
                axios.get('http://127.0.0.1:8000/api/public/unavailable_dates?type=global')
            ]);
            setUnavailableDates([...specCal.data, ...globCal.data].map(d => d.date.split('T')[0]));

            setLoading(false);
        } catch (err) {
            console.error('Error fetching Detail:', err);
            setLoading(false);
        }
    };

    if (identifier) fetchData();
  }, [id, activitySlug, type]);


  const isDateBlocked = (dateStr) => unavailableDates.includes(dateStr);

  const getJsonField = (item, field) => {
    if (!item) return [];
    const val = getTranslated(item, field, lang);
    if (!val) return [];
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  };


  const getImgUrl = (path) => {
    if (!path) return '/images/hero_home.jfif';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage')) return `http://127.0.0.1:8000${path}`;
    return path;
  };

  const handleImageError = (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackApplied === '1') return;
    img.dataset.fallbackApplied = '1';
    img.src = '/images/hero_home.jfif';
  };

  const formatEuro = (value, suffix = '') => {
    if (value === null || value === undefined || value === '') return '';

    const numeric = Number.parseFloat(String(value).replace(',', '.'));
    if (Number.isFinite(numeric)) {
      const hasDecimals = !Number.isInteger(numeric);
      const formatted = numeric.toLocaleString('fr-FR', {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: hasDecimals ? 2 : 0,
      });
      return `${formatted}\u20AC${suffix}`;
    }

    const raw = String(value);
    if (raw.includes('\u20AC')) return `${raw}${suffix}`;
    if (raw.toUpperCase().includes('EUR')) return `${raw.replace(/EUR/gi, '\u20AC')}${suffix}`;
    return `${raw}\u20AC${suffix}`;
  };

  const translateOrFallback = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const isActivity = !!activitySlug || type === 'activity';
  const isSelectedBlocked = selectedDate && isDateBlocked(selectedDate);
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  
  const activityTitle = getTranslated(data, 'title', lang);
  
  const formulas = getJsonField(data, 'formulas');
  const faqs = getJsonField(data, 'faq');
  const includedList = getJsonField(data, 'included');
  const notIncludedList = getJsonField(data, 'not_included');
  const practicalInfoPoints = getJsonField(data, 'practical_info_points');


  const handleWhatsAppFormula = (formula) => {
    if (!data || !formula) return;
    const rawNum = siteSettings['whatsapp_number']?.value || '212714173661';
    const whatsappNum = rawNum.replace(/\D/g, '');

    const message = `Bonjour Just Marrakech,%0A%0AJe souhaite reserver l'activite : *${activityTitle}*%0A- Formule : ${formula.title}%0A- Date : ${selectedDate || '____'}%0A- Heure : ${selectedTime || '____'}%0A%0AMerci de me confirmer la disponibilite.`;
    window.open(`https://wa.me/${whatsappNum}?text=${message}`, '_blank');
  };
  
  const container = useRef();
  
  useGSAP(() => {
    if (loading) return;

    const tl = gsap.timeline();
    tl.from(".detail-gallery", { scale: 1.05, opacity: 0, duration: 1.5, ease: "power2.out" })
      .from(".detail-title-block > *", { y: 30, opacity: 0, stagger: 0.15, duration: 1, ease: "power3.out" }, "-=0.8")
      .from(".detail-info-item", { x: -20, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }, "-=0.5")
      .from(".detail-sidebar", { x: 40, opacity: 0, duration: 1.2, ease: "power4.out" }, "-=0.8");

  }, { scope: container, dependencies: [loading, id, activitySlug] });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 bg-primary rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="display-font text-4xl text-primary italic mb-4">Item introuvable</h1>
          <Link to={isActivity ? "/activities" : "/accommodations"} className="text-primary font-semibold">
            Retour
          </Link>
        </div>
      </div>
    );
  }

  const backHref = isActivity ? "/activities" : "/accommodations";
  const mainPrice = formatEuro(data.price_from);
  const includedTitle = t('detail.included') || 'Ce qui est inclus';
  const excludedTitle = t('detail.excluded') || 'Ce qui n\'est pas inclus';
  const faqTitle = t('detail.faq') || 'Questions frequentes';

  return (
    <div ref={container} className="pb-32 bg-surface relative" dir={dir}>
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out animate-in fade-in zoom-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <X size={32} strokeWidth={1} />
          </button>
          <img
            src={getImgUrl(selectedImage)}
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            alt="Fullscreen view"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 md:pt-12">
        <div className="detail-gallery relative group overflow-hidden rounded-[1.8rem] sm:rounded-[2.4rem] md:rounded-[3rem] sand-shadow-lg aspect-[4/3] md:aspect-[21/9] lg:aspect-[2.5/1] grid grid-cols-1 md:grid-cols-4 gap-2 bg-surface-container-low">
          <div
            className="md:col-span-2 relative overflow-hidden h-full cursor-zoom-in"
            onClick={() => setSelectedImage(data.images?.[0])}
          >
            <img
              src={getImgUrl(data.images?.[0])}
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
              alt=""
            />
          </div>
          <div className="hidden md:grid grid-cols-1 grid-rows-2 gap-2 h-full">
            <div className="overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(data.images?.[1])}>
              <img
                src={getImgUrl(data.images?.[1] || data.images?.[0])}
                onError={handleImageError}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]"
                alt=""
              />
            </div>
            <div className="overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(data.images?.[2])}>
              <img
                src={getImgUrl(data.images?.[2] || data.images?.[0])}
                onError={handleImageError}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]"
                alt=""
              />
            </div>
          </div>
          <div className="hidden md:grid grid-cols-1 grid-rows-2 gap-2 h-full">
            <div className="overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(data.images?.[3])}>
              <img
                src={getImgUrl(data.images?.[3] || data.images?.[0])}
                onError={handleImageError}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]"
                alt=""
              />
            </div>
            <div className="overflow-hidden relative cursor-zoom-in" onClick={() => setSelectedImage(data.images?.[4])}>
              <img
                src={getImgUrl(data.images?.[4] || data.images?.[0])}
                onError={handleImageError}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]"
                alt=""
              />
              {data.images?.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest pointer-events-none">
                  + {data.images.length - 5} photos
                </div>
              )}
            </div>
          </div>

          <Link
            to={backHref}
            className={`absolute top-4 sm:top-6 ${dir === 'rtl' ? 'right-4 sm:right-6' : 'left-4 sm:left-6'} flex items-center gap-2 text-white/90 hover:bg-white hover:text-primary bg-black/40 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full backdrop-blur-xl transition-all sand-shadow z-20`}
          >
            <ArrowLeft size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-bold">{t('detail.back')}</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10 md:mt-12 relative z-10 flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="flex-1 detail-content-block">
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.4rem] md:rounded-[3rem] p-5 sm:p-8 md:p-12 lg:p-16 sand-shadow border border-white/60 mb-10 md:mb-12 detail-title-block">
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <span className="w-12 h-px bg-primary/20"></span>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary/60">
                {getTranslated(data, 'category') || getTranslated(data, 'type')}
              </span>
            </div>

            <h1 className="display-font text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-primary mb-8 sm:mb-10 md:mb-12 leading-[0.95] tracking-tighter italic">
              {getTranslated(data, 'title')}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-6 sm:py-8 border-y border-primary/5 mb-8 sm:mb-10 md:mb-12">
              <div className="detail-info-item space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline/50">{t('detail.price_from')}</span>
                <div className="flex items-center gap-2 text-primary">
                  <span className="font-semibold text-lg sm:text-xl italic">{mainPrice || '--'}</span>
                </div>
              </div>
              <div className="detail-info-item space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline/50">{t('detail.duration')}</span>
                <div className="flex items-center gap-2 text-primary">
                  <Clock size={16} />
                  <span className="font-semibold text-sm sm:text-base">{getTranslated(data, 'duration')}</span>
                </div>
              </div>
              <div className="detail-info-item space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline/50">{t('detail.location')}</span>
                <div className="flex items-center gap-2 text-primary">
                  <MapPin size={16} />
                  <span className="font-semibold text-sm sm:text-base">{getTranslated(data, 'location') || 'Marrakech'}</span>
                </div>
              </div>
              <div className="detail-info-item space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline/50">{t('detail.group_size')}</span>
                <div className="flex items-center gap-2 text-primary">
                  <Users size={16} />
                  <span className="font-semibold text-sm sm:text-base">{getTranslated(data, 'group_size')}</span>
                </div>
              </div>
            </div>

            <h3 className="display-font text-2xl sm:text-3xl text-primary mb-5 sm:mb-6 italic">{t('detail.long_description')}</h3>
            <div className="prose prose-base sm:prose-lg prose-stone prose-italic text-on-surface-variant/90 leading-relaxed mb-10 sm:mb-12 md:mb-16 max-w-none">
              <div 
                className="whitespace-pre-line"
                dangerouslySetInnerHTML={{ 
                  __html: ([getTranslated(data, 'full_description'), getTranslated(data, 'description')].find(desc => desc && desc !== 'null') || '')
                    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>')
                    .replace(/\n/g, '<br />')
                }}
              >
              </div>
            </div>

            {isActivity && (includedList.length > 0 || notIncludedList.length > 0) && (
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 py-8 sm:py-10 border-t border-primary/10 mb-10 sm:mb-12 md:mb-16">
                {includedList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">{includedTitle}</h4>
                    <ul className="space-y-4">
                      {includedList.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm text-on-surface-variant">
                          <Check size={16} className="text-secondary mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {notIncludedList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-outline mb-6">{excludedTitle}</h4>
                    <ul className="space-y-4">
                      {notIncludedList.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm text-on-surface-variant/60">
                          <X size={16} className="text-error/60 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {isActivity && practicalInfoPoints.length > 0 && (
              <div className="py-8 border-t border-primary/10">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Informations pratiques</h4>
                <ul className="space-y-3">
                  {practicalInfoPoints.map((item, index) => (
                    <li key={index} className="text-sm text-on-surface-variant flex items-start gap-3">
                      <span className="text-primary font-semibold">i</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {isActivity && faqs.length > 0 && (
            <div className="mb-14 sm:mb-16 md:mb-20">
              <h3 className="display-font text-3xl sm:text-4xl text-primary mb-8 sm:mb-10 italic text-center">{faqTitle}</h3>
              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-2xl sand-shadow-sm border border-primary/5 overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex justify-between items-center p-4 sm:p-6 text-left"
                    >
                      <span className="font-semibold text-sm sm:text-base text-on-surface pr-4">{faq.question}</span>
                      <ChevronDown
                        size={20}
                        className={`text-primary/60 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div className={`px-4 sm:px-6 pb-4 sm:pb-6 text-on-surface-variant text-sm leading-relaxed ${openFaq === index ? 'block' : 'hidden'}`}>
                      <div className="pt-2 border-t border-primary/5 space-y-4">
                        <p>{faq.answer}</p>
                        {faq.condition && (
                          <div className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-widest font-semibold px-3 py-1">
                            Condition: {faq.condition}
                          </div>
                        )}
                        {faq.image && (
                          <figure className="space-y-2">
                            <img
                              src={getImgUrl(faq.image)}
                              onError={handleImageError}
                              alt={faq.question || 'FAQ'}
                              className="w-full h-44 object-cover rounded-xl border border-primary/10"
                            />
                            {faq.image_caption && <figcaption className="text-xs text-outline/70">{faq.image_caption}</figcaption>}
                          </figure>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
                    {isActivity && (
            <div className="mb-20">
               <ReviewsBlock reviewableId={data.id} reviewableType="Activity" siteSettings={siteSettings} />
            </div>
          )}
        </div>

        <div className={`w-full ${isActivity ? 'lg:w-[480px]' : 'lg:w-[420px]'} detail-sidebar`}>
          <div className="lg:sticky lg:top-32">
            {isActivity ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="display-font text-3xl text-primary italic mb-2">{t('detail.formulas')}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline/60">{t('detail.formulas_subtitle')}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl sand-shadow border border-primary/5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 block mb-2">Date souhaitee</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-primary/10 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 block mb-2">Heure souhaitee</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-primary/10 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                    {formulas.map((formula, idx) => (
                        <div 
                            key={idx}
                            className="p-6 sm:p-8 rounded-3xl bg-white border border-primary/10 sand-shadow flex flex-col gap-5"
                        >
                            <div className="text-center mb-2">
                                <h4 className="display-font text-2xl italic text-on-surface mb-1">{formula.title}</h4>
                                {formula.details && <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">{formula.details}</p>}
                            </div>
                            
                            <div className="text-center text-primary font-medium text-sm italic mb-2">
                                {formula.price}
                            </div>

                            {formula.includes && formula.includes.length > 0 && (
                                <ul className="space-y-3 mb-2">
                                    {formula.includes.map((inc, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant/90 leading-relaxed">
                                            <Check size={16} className="text-secondary mt-0.5 shrink-0" /> 
                                            <span>{inc}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <button
                                onClick={() => handleWhatsAppFormula(formula)}
                                className="w-full bg-secondary text-white font-bold text-[11px] tracking-[0.2em] uppercase py-4 rounded-xl shadow-md hover:bg-secondary/90 transition-all flex justify-center items-center gap-2 mt-2"
                            >
                                <MessageCircle size={16} /> WhatsApp - Choisir cette formule
                            </button>
                        </div>
                    ))}
                </div>
              </div>
            ) : (
                // Accommodation Reservation UI
                <div className="bg-white p-10 rounded-[3rem] sand-shadow border border-primary/5">
                   {/* ... keep accommodation UI simple for now ... */}
                   <button onClick={() => {}} className="w-full bg-primary text-white py-5 rounded-2xl">Reserver</button>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

