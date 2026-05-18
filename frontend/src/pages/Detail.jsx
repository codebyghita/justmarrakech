import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getTranslated, getJsonField, getCmsValue } from '../utils/translation';
import {
  ArrowLeft, Clock, MapPin, Users, Check, X,
  ChevronDown, MessageCircle, Star, Send, Copy, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { useRef } from 'react';
import ReviewsBlock from '../components/ReviewsBlock';
import { updateSEO } from '../utils/seo';

export default function Detail() {
  const { type, id, activitySlug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [data, setData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [openExperience, setOpenExperience] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [personCount, setPersonCount] = useState(1);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const galleryRef = useRef(null);

  useEffect(() => {
    const isAct = !!activitySlug || type === 'activity';
    const endpoint = isAct ? 'activities' : 'accommodations';
    const identifier = id || activitySlug;

    const fetchData = async () => {
      try {
        const [itemRes, settingsRes] = await Promise.all([
          axios.get(`/api/public/${endpoint}/${identifier}`),
          axios.get('/api/public/settings')
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

        // Only fetch/set unavailable dates if blocking is enabled (default to true for accommodations)
        if (!isAct || item.is_blocking_enabled !== false) {
          const [specCal, globCal] = await Promise.all([
            axios.get(`/api/public/unavailable_dates?type=${modelType}&id=${dbId}`),
            axios.get('/api/public/unavailable_dates?type=global')
          ]);
          setUnavailableDates([...specCal.data, ...globCal.data].map(d => d.date.split('T')[0]));
        } else {
          setUnavailableDates([]);
        }

        // Meta updates
        updateSEO(getTranslated(item, 'title', lang), item.meta_description || item.description);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching Detail:', err);
        setLoading(false);
      }
    };

    if (identifier) fetchData();
  }, [id, activitySlug, type]);


  const isDateBlocked = (dateStr) => unavailableDates.includes(dateStr);




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

  const formulas = getJsonField(data, 'formulas', lang);
  const faqs = getJsonField(data, 'faq', lang);
  const includedList = getJsonField(data, 'included', lang);
  const notIncludedList = getJsonField(data, 'not_included', lang);
  const practicalInfoPoints = getJsonField(data, 'practical_info_points', lang);
  const timelineList = getJsonField(data, 'timeline', lang);

  const handleGalleryScroll = () => {
    if (!galleryRef.current || !data.images?.length) return;
    const idx = Math.round(galleryRef.current.scrollLeft / galleryRef.current.scrollWidth * data.images.length);
    setActiveGalleryIndex(Math.min(idx, data.images.length - 1));
  };

  const renderBookingSection = () => {
    if (isActivity) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="display-font text-3xl text-primary italic mb-2">{t('detail.formulas')}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline/60">{t('detail.formulas_subtitle')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl sand-shadow border border-primary/5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 block mb-2">{t('whatsapp_message.date')}</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-primary/10 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 block mb-2">{t('whatsapp_message.time')}</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-primary/10 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {data.activity_category_id === 6 ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-primary/10 sand-shadow flex flex-col gap-5">
                <div className="mb-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60 block mb-2">{t('whatsapp_message.persons')}</label>
                  <div className="flex items-center gap-2 bg-surface-container-lowest border border-primary/10 rounded-xl p-1">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setPersonCount(num)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${personCount === num ? 'bg-primary text-white shadow-sm' : 'text-primary/60 hover:bg-primary/5'}`}
                      >
                        {num}
                      </button>
                    ))}
                    <select
                      value={personCount > 6 ? personCount : ''}
                      onChange={(e) => setPersonCount(Number(e.target.value))}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold outline-none bg-transparent ${personCount > 6 ? 'bg-primary text-white' : 'text-primary/60'}`}
                    >
                      <option value="" disabled>{personCount > 6 ? personCount : '+'}</option>
                      {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(num => (
                        <option key={num} value={num} className="text-black">{num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <h4 className="display-font text-2xl italic text-on-surface mb-1">{t('detail.booking_title')}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline/60">{t('detail.price_calculated')}</p>
                  <div className="space-y-4">
                    {(() => {
                      const pricingDetails = getJsonField(data, 'pricing_details');
                      if (pricingDetails && personCount <= 16) {
                        const unitPrice = pricingDetails[personCount];
                        return unitPrice ? (
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">{t('detail.price_per_person')}</span>
                            <span className="text-sm font-bold text-primary">{unitPrice}€</span>
                          </div>
                        ) : null;
                      }
                      return null;
                    })()}
                    <div className="text-center py-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 block mb-1">
                        {personCount > 16 ? t('detail.pricing') || 'Tarification' : t('detail.total_to_pay')}
                      </span>
                      <div className="display-font text-4xl text-primary italic">
                        {(() => {
                          if (personCount > 16) return t('detail.on_quote');
                          const pricingDetails = getJsonField(data, 'pricing_details');
                          if (pricingDetails) {
                            const unitPrice = pricingDetails[personCount];
                            return unitPrice ? `${parseFloat(unitPrice) * personCount}€` : t('detail.on_quote');
                          }
                          if (data.price_from) {
                            const p = Number.parseFloat(String(data.price_from).replace(',', '.'));
                            return data.price_type === 'group' ? `${p}€` : `${p * personCount}€`;
                          }
                          return t('detail.on_quote');
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppNoFormula}
                  disabled={isSelectedBlocked}
                  className={`w-full font-bold text-[11px] tracking-[0.2em] uppercase py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 mt-2 ${isSelectedBlocked ? 'bg-outline/20 text-outline/40 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/90'}`}
                >
                  {isSelectedBlocked ? (
                    <><X size={16} /> {t('detail.fully_booked') || 'Complet pour cette date'}</>
                  ) : (
                    <><MessageCircle size={16} /> {t('actions.book_whatsapp')}</>
                  )}
                </button>
                <p className="text-[9px] text-center text-on-surface-variant/60 italic">
                  {isSelectedBlocked ? t('detail.choose_another_date') || 'Veuillez choisir une autre date' : t('whatsapp_message.confirmation_immediate') || 'Confirmation immédiate par WhatsApp'}
                </p>
              </div>
            ) : (
              formulas && formulas.length > 0 ? formulas.map((formula, idx) => (
                <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-white border border-primary/10 sand-shadow flex flex-col gap-5">
                  <div className="text-center mb-2">
                    <h4 className="display-font text-2xl italic text-on-surface mb-1">{formula.title}</h4>
                    {formula.details && <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">{formula.details}</p>}
                  </div>
                  <div className="text-center text-primary font-medium text-sm italic mb-2">
                    {formula.price}
                    <span className="ml-1 text-[9px] uppercase tracking-widest font-normal text-on-surface-variant not-italic">
                      {formula.price_type === 'group' ? t('detail.per_group') : t('detail.per_person_short')}
                    </span>
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
                    disabled={isSelectedBlocked}
                    className={`w-full font-bold text-[11px] tracking-[0.2em] uppercase py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 mt-2 ${isSelectedBlocked ? 'bg-outline/20 text-outline/40 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/90'}`}
                  >
                    {isSelectedBlocked ? (
                      <><X size={16} /> {t('detail.fully_booked') || 'Complet'}</>
                    ) : (
                      <><MessageCircle size={16} /> {t('actions.book_whatsapp')}</>
                    )}
                  </button>
                </div>
              )) : (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-primary/10 sand-shadow flex flex-col gap-5">
                  <div className="text-center mb-2">
                    <h4 className="display-font text-2xl italic text-on-surface mb-1">{t('detail.booking_title')}</h4>
                  </div>
                  <div className="text-center text-primary font-medium text-sm italic mb-2">
                    {data.price_from ? formatEuro(data.price_from, ' ' + t('detail.per_person_short')) : t('detail.on_quote')}
                  </div>
                  <button
                    onClick={handleWhatsAppNoFormula}
                    disabled={isSelectedBlocked}
                    className={`w-full font-bold text-[11px] tracking-[0.2em] uppercase py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 mt-2 ${isSelectedBlocked ? 'bg-outline/20 text-outline/40 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/90'}`}
                  >
                    {isSelectedBlocked ? (
                      <><X size={16} /> {t('detail.fully_booked') || 'Complet'}</>
                    ) : (
                      <><MessageCircle size={16} /> {t('actions.book_whatsapp')}</>
                    )}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white p-10 rounded-[3rem] sand-shadow border border-primary/5">
        <button onClick={() => {}} className="w-full bg-primary text-white py-5 rounded-2xl">{t('detail.book_now') || 'Réserver'}</button>
      </div>
    );
  };

  const handleWhatsAppFormula = (formula) => {
    if (!data || !formula) return;
    const rawNum = siteSettings['whatsapp_number']?.value || '212714173661';
    const whatsappNum = rawNum.replace(/\D/g, '');

    const message = `${t('whatsapp_message.intro')}%0A%0A${t('whatsapp_message.wish_to_book')} *${activityTitle}*%0A- ${t('whatsapp_message.formula')} ${formula.title}%0A- ${t('whatsapp_message.date')} ${selectedDate || t('whatsapp_message.default_date')}%0A- ${t('whatsapp_message.time')} ${selectedTime || t('whatsapp_message.default_time')}%0A%0A${t('whatsapp_message.thanks')}`;
    window.open(`https://wa.me/${whatsappNum}?text=${message}`, '_blank');
  };

  const handleWhatsAppNoFormula = () => {
    if (!data) return;
    const rawNum = siteSettings['whatsapp_number']?.value || '212714173661';
    const whatsappNum = rawNum.replace(/\D/g, '');

    const pricingDetails = getJsonField(data, 'pricing_details');
    let totalPrice = '';

    if (personCount > 16) {
      totalPrice = 'Sur devis';
    } else if (pricingDetails && pricingDetails[personCount]) {
      totalPrice = `${parseFloat(pricingDetails[personCount]) * personCount}€`;
    } else if (data.price_from) {
      const p = Number.parseFloat(String(data.price_from).replace(',', '.'));
      totalPrice = data.price_type === 'group' ? `${p}€` : `${p * personCount}€`;
    }

    const message = `${t('whatsapp_message.intro')}%0A%0A${t('whatsapp_message.wish_to_book')} *${activityTitle}*%0A- ${t('whatsapp_message.date')} ${selectedDate || t('whatsapp_message.default_date')}%0A- ${t('whatsapp_message.time')} ${selectedTime || t('whatsapp_message.default_time')}%0A- ${t('whatsapp_message.persons')} ${personCount}%0A${totalPrice ? `- ${t('whatsapp_message.total_price')} *${totalPrice}*%0A` : ''}%0A${t('whatsapp_message.thanks')}`;
    window.open(`https://wa.me/${whatsappNum}?text=${message}`, '_blank');
  };

  const container = useRef();

  useGSAP(() => {
    if (loading) return;

    const tl = gsap.timeline();
    tl.from(".detail-gallery", { scale: 1.05, opacity: 0, duration: 1.5, ease: "power2.out" })
      .from(".detail-title-block > *", { y: 30, opacity: 0, stagger: 0.15, duration: 1, ease: "power3.out" }, "-=0.8")
      .from(".detail-info-item", { x: -20, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }, "-=0.5")
      .from(".detail-sidebar", { x: 40, opacity: 0, duration: 1.2, ease: "power4.out" }, "-=0.8")
      .from(".detail-reviews", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.6");

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
            src={getAssetUrl(selectedImage?.url || selectedImage)}
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            alt={selectedImage?.alt || "Fullscreen view"}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 md:pt-12">
        <div className="detail-gallery relative group overflow-hidden rounded-[1.8rem] sm:rounded-[2.4rem] md:rounded-[3rem] sand-shadow-lg h-[40vh] sm:h-[50vh] md:h-[60vh] bg-surface-container-low">
          <div ref={galleryRef} onScroll={handleGalleryScroll} className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-1 sm:gap-2">
            {data.images?.length > 0 ? (
              data.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`snap-center shrink-0 ${data.images.length === 1 ? 'w-full' : 'w-[90%] sm:w-[70%] md:w-[60%] lg:w-[45%]'} h-full relative cursor-zoom-in snap-start overflow-hidden`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={getAssetUrl(img?.url || img)}
                    onError={handleImageError}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[3s]"
                    alt={img?.alt || `Gallery ${idx + 1}`}
                  />
                </div>
              ))
            ) : (
              <div className="flex-none w-full h-full relative overflow-hidden">
                <img
                  src="/images/hero_home.jfif"
                  className="w-full h-full object-cover"
                  alt="Default"
                />
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {data.images?.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  galleryRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }}
                className="pointer-events-auto p-3 bg-white/40 hover:bg-white text-primary rounded-full backdrop-blur-md transition-all sand-shadow"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  galleryRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }}
                className="pointer-events-auto p-3 bg-white/40 hover:bg-white text-primary rounded-full backdrop-blur-md transition-all sand-shadow"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          <Link
            to={backHref}
            className={`absolute top-4 sm:top-6 ${dir === 'rtl' ? 'right-4 sm:right-6' : 'left-4 sm:left-6'} flex items-center gap-2 text-white/90 hover:bg-white hover:text-primary bg-black/40 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full backdrop-blur-xl transition-all sand-shadow z-20`}
          >
            <ArrowLeft size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-bold">{t('detail.back')}</span>
          </Link>

          {data.images?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {data.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const el = galleryRef.current;
                    if (el) el.scrollTo({ left: (el.scrollWidth / data.images.length) * idx, behavior: 'smooth' });
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activeGalleryIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10 md:mt-12 relative z-10 flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="flex-1 detail-content-block">
          <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.4rem] md:rounded-[3rem] p-5 sm:p-8 md:p-12 lg:p-16 sand-shadow border border-white/60 mb-10 md:mb-12 detail-title-block">
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <span className="w-12 h-px bg-primary/20"></span>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary/60">
                {getTranslated(data, 'category', lang) || getTranslated(data, 'type', lang)}
              </span>
            </div>

            <h1 className="display-font text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-primary mb-8 sm:mb-10 md:mb-12 leading-[0.95] tracking-tighter italic">
              {getTranslated(data, 'title', lang)}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 py-8 sm:py-10 border-y border-primary/10 mb-10 sm:mb-12">
              {/* Prix */}
              <div className="detail-info-item flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">{t('detail.price_from')}</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-xl sm:text-2xl text-primary italic leading-none">{mainPrice || '--'}</span>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-1 opacity-70">
                    {data.price_type === 'group' ? t('detail.per_group') : t('detail.per_person_short')}
                  </span>
                </div>
              </div>

              {/* Durée */}
              <div className="detail-info-item flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">{t('detail.duration')}</span>
                <div className="flex items-center gap-2 text-primary">
                  <Clock size={16} className="opacity-60" />
                  <span className="font-semibold text-sm sm:text-base">{getTranslated(data, 'duration', lang)}</span>
                </div>
              </div>

              {/* Lieu & Maps */}
              <div className="detail-info-item flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">{t('detail.location')}</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary">
                    <MapPin size={16} className="opacity-60" />
                    <span className="font-semibold text-sm sm:text-base">{getTranslated(data, 'location', lang) || ''}</span>
                  </div>
                  {data.location_address && (
                    <span className="text-[10px] text-on-surface-variant font-light truncate max-w-[140px] opacity-80">{data.location_address}</span>
                  )}
                  {data.google_maps_url && (
                    <a
                      href={data.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold uppercase tracking-widest text-primary mt-1 underline underline-offset-4 decoration-primary/20 hover:decoration-primary transition-all inline-block"
                    >
                      {t('detail.see_on_map')}
                    </a>
                  )}
                </div>
              </div>

              {/* Taille du groupe */}
              <div className="detail-info-item flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">{t('detail.group_size')}</span>
                <div className="flex items-center gap-2 text-primary">
                  <Users size={16} className="opacity-60" />
                  <span className="font-semibold text-sm sm:text-base">
                    {data.max_persons ? `Max ${data.max_persons} pers.` : getTranslated(data, 'group_size', lang)}
                  </span>
                </div>
              </div>
            </div>

            {/* Short description below badges */}
            {data.description && (
              <p className="text-base sm:text-lg text-on-surface-variant/80 font-light leading-relaxed italic border-l-4 border-primary/20 pl-5 mb-6 sm:mb-8">
                {getTranslated(data, 'description', lang)}
              </p>
            )}

            {/* Mobile booking section (hidden on desktop) */}
            <div className="lg:hidden mb-8">
              {renderBookingSection()}
            </div>

            {/* Full description (rich text) */}
            {getTranslated(data, 'full_description', lang) && getTranslated(data, 'full_description', lang) !== 'null' && (
              <div className="prose prose-base sm:prose-lg prose-stone prose-italic text-on-surface-variant/90 leading-relaxed mb-10 sm:mb-12 md:mb-16 max-w-none">
                <div
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: getTranslated(data, 'full_description', lang)
                      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            )}

            {/* Accordions: Ce que vous allez vivre, Déroulé, Informations détaillées */}
            <div className="space-y-4 mb-10 sm:mb-12 md:mb-16">

              {/* Ce que vous allez vivre */}
              {getTranslated(data, 'experience_details', lang) && (
                <div className="bg-white rounded-2xl sand-shadow-sm border border-primary/5 overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenExperience(!openExperience)}
                    className="w-full flex justify-between items-center p-4 sm:p-6 text-left"
                  >
                    <span className="font-semibold text-sm sm:text-base text-primary uppercase tracking-widest">{t('detail.long_description')}</span>
                    <ChevronDown
                      size={20}
                      className={`text-primary/60 transition-transform duration-300 ${openExperience ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className={`px-4 sm:px-6 pb-4 sm:pb-6 text-on-surface-variant text-sm leading-relaxed ${openExperience ? 'block' : 'hidden'}`}>
                    <div className="pt-4 border-t border-primary/5 whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: getTranslated(data, 'experience_details', lang)
                          .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Déroulé de la journée (Excursions) */}
              {timelineList.length > 0 && (
                <div className="bg-white rounded-2xl sand-shadow-sm border border-primary/5 overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenTimeline(!openTimeline)}
                    className="w-full flex justify-between items-center p-4 sm:p-6 text-left"
                  >
                    <span className="font-semibold text-sm sm:text-base text-primary uppercase tracking-widest">{t('detail.day_breakdown')}</span>
                    <ChevronDown
                      size={20}
                      className={`text-primary/60 transition-transform duration-300 ${openTimeline ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className={`px-4 sm:px-6 pb-4 sm:pb-6 text-on-surface-variant text-sm leading-relaxed ${openTimeline ? 'block' : 'hidden'}`}>
                    <div className="pt-6 border-t border-primary/5">
                      <div className="relative border-l-2 border-primary/20 ml-3 md:ml-4 space-y-8">
                        {timelineList.map((step, idx) => (
                          <div key={idx} className="relative pl-6 sm:pl-8">
                            <div className="absolute -left-[5px] top-1 w-[10px] h-[10px] bg-secondary rounded-full ring-4 ring-white" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
                              {step.time && <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded w-fit">{step.time}</span>}
                              <h5 className="font-bold text-primary text-base">{step.title}</h5>
                            </div>
                            {step.description && <p className="text-sm text-on-surface-variant leading-relaxed mt-2">{step.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations détaillées */}
              {getTranslated(data, 'detailed_info', lang) && (
                <div className="bg-white rounded-2xl sand-shadow-sm border border-primary/5 overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenDetails(!openDetails)}
                    className="w-full flex justify-between items-center p-4 sm:p-6 text-left"
                  >
                    <span className="font-semibold text-sm sm:text-base text-primary uppercase tracking-widest">{t('detail.detailed_info')}</span>
                    <ChevronDown
                      size={20}
                      className={`text-primary/60 transition-transform duration-300 ${openDetails ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className={`px-4 sm:px-6 pb-4 sm:pb-6 text-on-surface-variant text-sm leading-relaxed ${openDetails ? 'block' : 'hidden'}`}>
                    <div className="pt-4 border-t border-primary/5 whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: getTranslated(data, 'detailed_info', lang)
                          .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </div>
                </div>
              )}
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
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">{t('detail.practical_info')}</h4>
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

            {data.google_maps_url && (
              <div className="py-12 border-t border-primary/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-[1px] bg-primary/30"></div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Localisation</h4>
                </div>

                <div className="relative group overflow-hidden rounded-[2.5rem] bg-white border border-primary/10 sand-shadow-lg transition-all duration-500 hover:shadow-2xl">
                  {/* Subtle Background Pattern or Accent */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                  <div className="relative p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 text-primary mb-2">
                        <MapPin size={24} strokeWidth={1.5} />
                      </div>
                      <h5 className="display-font text-3xl text-primary italic leading-tight">
                        {data.location_address || getTranslated(data, 'location', lang) || ''}
                      </h5>
                      <p className="text-sm text-on-surface-variant/70 font-light max-w-md leading-relaxed">
                        {t('detail.location_guide')}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-center gap-4">
                      <a
                        href={data.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative overflow-hidden bg-primary text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex items-center gap-3"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <ExternalLink size={16} /> {t('detail.open_google_maps')}
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(data.location_address || '');
                          alert(t('detail.address_copied'));
                        }}
                        className="text-[9px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <Copy size={12} /> {t('detail.copy_address')}
                      </button>
                    </div>
                  </div>
                </div>
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
                              src={getAssetUrl(faq.image)}
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
        </div>

        <div className={`w-full hidden lg:block ${isActivity ? 'lg:w-[480px]' : 'lg:w-[420px]'} detail-sidebar`}>
          <div className="lg:sticky lg:top-32">
            {renderBookingSection()}
          </div>
        </div>
      </div>

      {isActivity && (
        <div className="detail-reviews max-w-7xl mx-auto px-4 sm:px-6 mt-12 md:mt-16 mb-16 md:mb-20">
          <ReviewsBlock reviewableId={data.id} reviewableType="Activity" siteSettings={siteSettings} />
        </div>
      )}
    </div>
  );
}
