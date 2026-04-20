import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, MapPin, ArrowUpRight, Compass, Check } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { useRef } from 'react';

export default function Excursions() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [excursions, setExcursions] = useState([]);
  const [category, setCategory] = useState(null);
  const [cms, setCms] = useState({});
  const [loading, setLoading] = useState(true);
  const container = useRef();

  useGSAP(() => {
    if (loading) return;

    // Header reveal
    if (gsap.utils.toArray('.exc-header').length > 0) {
      const tl = gsap.timeline();
      tl.from(".exc-header > *", { y: 40, opacity: 0, stagger: 0.15, duration: 1.2, ease: "power3.out" });
    }

    // Grid stagger
    if (gsap.utils.toArray('.exc-card').length > 0) {
      gsap.from(".exc-card", {
        scrollTrigger: {
          trigger: ".exc-grid",
          start: "top 85%",
        },
        y: 60,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        ease: "power2.out"
      });
    }
  }, { scope: container, dependencies: [loading, excursions.length, category] });

  useEffect(() => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/public/activities'),
      axios.get('http://127.0.0.1:8000/api/public/categories'),
      axios.get('http://127.0.0.1:8000/api/public/content/excursions')
    ])
    .then(([actRes, catRes, cmsRes]) => {
      const allActivities = actRes.data || [];
      const allCategories = catRes.data || [];
      setCms(cmsRes.data);
      const excCat = allCategories.find(c => c.slug === 'excursions');
      
      setCategory(excCat);
      if (excCat) {
        setExcursions(allActivities.filter(a => a.activity_category_id === excCat.id));
      } else {
        setExcursions(allActivities.filter(a => a.category?.slug === 'excursions'));
      }
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  const getTranslated = (item, field) => {
    if (!item) return '';
    const defaultVal = item[field];
    if (lang === 'fr') return defaultVal;
    if (item.translations?.length > 0) {
      const trans = item.translations.find(tr => tr.locale === lang && tr.field === field);
      if (trans) return trans.content;
    }
    return defaultVal;
  };

  const getCmsValue = (slug, fallback) => {
    const block = cms[slug];
    if (!block) return fallback;
    const translated = getTranslated(block, 'content');
    return translated !== null ? translated : fallback;
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-8 md:pt-12 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <header className="mb-32 text-center max-w-4xl mx-auto animate-pulse flex flex-col items-center">
            <div className="h-3 w-32 bg-primary/10 rounded-full mb-6"></div>
            <div className="h-24 w-full bg-primary/10 rounded-3xl max-w-xl mb-10"></div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="aspect-[3/4] rounded-[3rem] bg-surface-container-high mb-10"></div>
                <div className="h-4 bg-surface-container-high rounded-full w-1/4 mb-6"></div>
                <div className="h-10 bg-surface-container-high rounded-lg w-full mb-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const badges = category?.badges || ['Selection testee', 'Reservation WhatsApp'];

  return (
    <div ref={container} className="bg-background min-h-screen pb-24 md:pb-32">
        {/* CLEAN MINIMALIST HEADER */}
        <div className="pt-20 pb-16 text-center max-w-5xl mx-auto px-4">
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary/40 uppercase mb-4 block">
                Just Marrakech
            </span>
            <h1 className="display-font text-4xl sm:text-5xl md:text-6xl text-primary mb-4 italic tracking-tight leading-tight">
                {category?.hero_title || t('nav.excursions')}
            </h1>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-base md:text-lg font-light italic opacity-70">
                {category?.hero_subtitle || 'Des escapades mémorables au-delà des remparts.'}
            </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Badges and intro */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <div className="w-24 h-px bg-primary/20 mx-auto mb-10"></div>
                <p className="text-base md:text-xl text-on-surface-variant font-light leading-relaxed mb-12">
                    {category?.hero_description || t('nav.excursions_desc')}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {badges.map((badge) => (
                        <span
                            key={badge}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary"
                        >
                            <Check size={14} />
                            {badge}
                        </span>
                    ))}
                </div>
            </div>

        {excursions.length === 0 ? (
          <div className="text-center py-32">
            <Compass size={48} className="text-primary/20 mx-auto mb-6" />
            <p className="text-on-surface-variant text-base md:text-lg font-light">
              {t('excursions_page.desc')}
            </p>
          </div>
        ) : (
          <div className="exc-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
            {excursions.map((act) => (
              <Link
                key={act.id}
                to={`/excursions/${act.slug || act.id}`}
                className="exc-card group block relative"
              >
                <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden sand-shadow group-hover:shadow-[0_40px_80px_rgba(149,101,70,0.2)] group-hover:-translate-y-2 transition-all duration-700 ease-out mb-10 bg-surface-container-high">
                  <img
                    src={
                      act.images?.[0]
                        ? (act.images[0]?.startsWith('/storage') ? `http://127.0.0.1:8000${act.images[0]}` : act.images[0])
                        : 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2073&auto=format&fit=crop'
                    }
                    onError={(e) => { e.currentTarget.src = '/images/hero_home.jfif'; }}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2.5s] ease-out"
                    alt={getTranslated(act, 'title')}
                  />
                  <div className="absolute top-8 right-8 glass-panel px-6 py-3 rounded-xl border border-white/40 sand-shadow translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-right">
                    <p className="display-font text-xl text-primary italic font-semibold leading-none">{act.price_from}€</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-primary/40 mt-1">{t('detail.per_person')}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>

                <div className="max-w-lg">
                  <h3 className="display-font text-3xl sm:text-4xl lg:text-5xl text-on-surface mb-6 leading-[1.1] group-hover:text-primary transition-colors flex items-start justify-between">
                    <span>{getTranslated(act, 'title')}</span>
                    <ArrowUpRight size={24} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 mt-2 text-primary" />
                  </h3>
                  <p className="text-on-surface-variant line-clamp-2 text-base leading-relaxed mb-8 font-light">
                    {getTranslated(act, 'description')}
                  </p>
                  <div className="flex items-center gap-8 pt-8 border-t border-surface-container-low">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Clock size={16} className="text-primary/60" />
                      <span className="text-sm font-medium">{act.duration || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <MapPin size={16} className="text-primary/60" />
                      <span className="text-sm font-medium">{getTranslated(act, 'location') || 'Marrakech'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
