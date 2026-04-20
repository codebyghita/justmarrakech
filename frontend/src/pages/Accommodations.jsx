import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Users, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { useRef } from 'react';

export default function Accommodations() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const container = useRef();

  useGSAP(() => {
    if (loading) return;

    // Header reveal
    const tl = gsap.timeline();
    tl.from(".acc-header > *", { y: 30, opacity: 0, stagger: 0.15, duration: 1.2, ease: "power3.out" });

    // Individual block reveals
    gsap.utils.toArray('.acc-block').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });
  }, { scope: container, dependencies: [loading] });

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/public/accommodations')
      .then(res => {
        setAccommodations(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const getTranslated = (item, field) => {
    if (!item) return '';
    const defaultVal = item[field];
    if (lang === 'fr') return defaultVal;
    
    if (item.translations && item.translations.length > 0) {
      const trans = item.translations.find(tr => tr.locale === lang && tr.field === field);
      if (trans) {
        if (['included', 'not_included', 'pricing_details', 'highlights', 'images'].includes(field)) {
          try {
            return JSON.parse(trans.content);
          } catch (e) {
            return trans.content;
          }
        }
        return trans.content;
      }
    }
    return defaultVal;
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-8 md:pt-12 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <header className="mb-32 text-center max-w-4xl mx-auto animate-pulse flex flex-col items-center">
            <div className="h-3 w-32 bg-primary/10 rounded-full mb-6"></div>
            <div className="h-24 w-full bg-primary/10 rounded-3xl max-w-xl mb-10"></div>
          </header>
          <div className="grid grid-cols-1 gap-32">
            {[1, 2, 3].map(i => (
               <div key={i} className="animate-pulse flex flex-col md:flex-row items-center gap-16">
                 <div className="w-full md:w-7/12 aspect-[4/3] md:aspect-[16/10] rounded-[3rem] bg-surface-container-high"></div>
                 <div className="w-full md:w-5/12 flex flex-col">
                   <div className="h-4 bg-surface-container-high rounded-full w-1/4 mb-8"></div>
                   <div className="h-12 bg-surface-container-high rounded-lg w-full mb-8"></div>
                   <div className="h-4 bg-surface-container-high rounded-full w-full mb-2"></div>
                   <div className="h-4 bg-surface-container-high rounded-full w-2/3 mb-12"></div>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={container} className="bg-background min-h-screen pt-8 md:pt-12 pb-24 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Luxury Header */}
        <header className="acc-header mb-20 md:mb-32 text-center max-w-4xl mx-auto">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase mb-6 block">{t('nav.accommodations')}</span>
          <h1 className="display-font text-5xl sm:text-6xl md:text-[8rem] text-primary mb-8 md:mb-10 italic tracking-tighter leading-[0.85] md:leading-[0.8]">
             {t('nav.accommodations')}
          </h1>
          <div className="w-24 h-px bg-primary/20 mx-auto mb-10"></div>
          <p className="text-base md:text-xl text-on-surface-variant font-light leading-relaxed max-w-2xl mx-auto">
            {t('nav.accommodations_desc')}
          </p>
        </header>

        {/* Accommodations List - Editorial Layout */}
        <div className="grid grid-cols-1 gap-20 md:gap-32">
          {accommodations.map((heb, index) => (
            <Link 
              key={heb.id} 
              to={`/detail/accommodation/${heb.id}`} 
              className="flex flex-col md:flex-row items-center gap-10 md:gap-16 group acc-block"
            >
              {/* Image Container */}
              <div className="w-full md:w-7/12 relative">
                <div className="aspect-[4/3] md:aspect-[16/10] rounded-[3rem] overflow-hidden sand-shadow relative">
                  {heb.images?.[0] && (
                    <img 
                      src={heb.images[0]?.startsWith('/storage') ? `http://127.0.0.1:8000${heb.images[0]}` : heb.images[0]} 
                      className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110" 
                      alt="" 
                    />
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-40 group-hover:opacity-0 transition-opacity duration-700"></div>
                </div>
                {/* Floating Rating Card */}
                <div className="absolute -bottom-8 -right-8 glass-panel px-8 py-6 rounded-3xl border border-white/40 sand-shadow hidden md:block">
                  <div className="flex gap-1.5 text-primary mb-2">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-outline">Excellence Certified</p>
                </div>
              </div>

              {/* Text Context */}
              <div className="w-full md:w-5/12">
                <div className="flex items-center gap-4 mb-8">
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{getTranslated(heb, 'type') || 'Villa'}</span>
                </div>

                <h3 className="display-font text-4xl sm:text-5xl lg:text-6xl text-on-surface mb-8 leading-[1] group-hover:text-primary transition-colors tracking-tighter">
                  {getTranslated(heb, 'title')}
                </h3>

                <p className="text-lg text-on-surface-variant line-clamp-3 text-base leading-relaxed mb-12 font-light">
                  {getTranslated(heb, 'description')}
                </p>

                <div className="flex items-center justify-between pt-10 border-t border-surface-container-low">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">{t('detail.price_label')}</span>
                       <p className="display-font text-3xl italic text-on-surface">{heb.price_per_night}€ <span className="text-sm font-normal not-italic opacity-40">{t('detail.per_night')}</span></p>
                    </div>
                   <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary">
                     <ArrowRight size={20} />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
