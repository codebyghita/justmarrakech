import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getTranslated, getCmsValue, getJsonField } from '../utils/translation';
import { Clock, MapPin, Check } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';


function ActivityCard({ activity, compact, lang }) {
  const handleImageError = (e) => {
    e.currentTarget.src = '/images/hero_home.jfif';
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  const image = getAssetUrl(activity.images?.[0]?.url || activity.images?.[0]);
    
  const price = `${activity.price_from ?? ''}\u20ac`;
  const title = getTranslated(activity, 'title', lang);
  const location = getTranslated(activity, 'location', lang);
  const desc = getTranslated(activity, 'description', lang);
  const catName = activity.activityCategory?.name || activity.category || 'Activite';

  const isExcursion = activity.activityCategory?.slug === 'excursions' || activity.category === 'excursions' || activity.activity_category_id === 5; // Fallback for ID if needed, but slug is safer
  const linkPath = isExcursion 
    ? `/excursions/${activity.slug || activity.id}`
    : `/activities/${activity.activityCategory?.slug || 'all'}/${activity.slug || activity.id}`;

  return (
    <Link
      to={linkPath}
      className="activity-card group block rounded-[2rem] bg-white/90 border border-primary/5 shadow-[0_24px_60px_rgba(149,101,70,0.12)] hover:shadow-[0_40px_80px_rgba(149,101,70,0.2)] overflow-hidden hover:-translate-y-2 transition-all duration-500"
    >
      <div className={compact ? 'aspect-[4/3] overflow-hidden' : 'aspect-[5/4] overflow-hidden'}>
        <img
          src={image}
          alt={title}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary/60 font-bold mb-3">
            {catName}
          </p>
        <h3 className="display-font text-2xl text-on-surface italic leading-tight mb-3">
          {title}
        </h3>
        {!compact && (
          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-5">
            {desc}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
          <span className="font-semibold text-primary">A partir de {price} / personne</span>
          {!compact && (
            <>
              <span className="inline-flex items-center gap-2">
                <Clock size={14} className="text-primary/60" />
                {activity.duration || 'A definir'}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-primary/60" />
                {location}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}


function ActivitiesLanding({ categories, cms, lang }) {
  const { t } = useTranslation();
  const badges = getJsonField(cms['activities-landing-badges'], 'content', lang);
  const finalBadges = badges.length > 0 ? badges : ['Selection testee', 'Reservation WhatsApp'];
  
  return (
    <>
      {/* CLEAN MINIMALIST HEADER */}
      <div className="pt-16 pb-12 text-center max-w-5xl mx-auto px-4">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary/40 uppercase mb-4 block">
              Just Marrakech
          </span>
          <h1 className="display-font text-3xl sm:text-4xl md:text-5xl text-primary mb-4 italic tracking-tight leading-tight">
              {getCmsValue(cms, 'activities-hero-title', t('nav.activities'), lang)}
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base font-light italic opacity-70">
              {getCmsValue(cms, 'activities-hero-subtitle', t('hero.subtitleActivities'), lang)}
          </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            {finalBadges.map((badge) => (
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

      <section className="mb-12">
        <div className="text-center mb-14">
          <h2 className="display-font text-4xl md:text-6xl text-on-surface italic tracking-tight mb-4">{getCmsValue(cms, 'activities-category-title', t('activities_page.choose_category'), lang)}</h2>
          <p className="text-base text-on-surface-variant opacity-70 uppercase tracking-widest text-[10px] font-bold">{getCmsValue(cms, 'activities-category-subtitle', t('activities_page.choose_category_sub'), lang)}</p>
        </div>
        <div className="category-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(categories) && categories.map((category) => (
            <Link
              key={category.slug}
              to={`/activities/${category.slug}`}
              className="category-card group block rounded-[2.5rem] overflow-hidden bg-white/90 border border-primary/5 sand-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={getAssetUrl(category.image?.url || category.image)}
                  alt={category.name}
                  onError={(e) => { e.currentTarget.src = '/images/hero_home.jfif'; }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                   <h3 className="display-font text-3xl text-white italic leading-tight">{getTranslated(category, 'name', lang)}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}


function CategoryPage({ category, activities, lang }) {
  const { t } = useTranslation();
  const badges = getJsonField(category, 'badges', lang);
  return (
    <>
      <div className="max-w-5xl mx-auto mb-10 text-[10px] uppercase font-bold tracking-widest text-outline-variant flex gap-2 items-center">
        <Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link> 
        <span>{'>'}</span> 
        <Link to="/activities" className="hover:text-primary transition-colors">{t('nav.activities')}</Link> 
        <span>{'>'}</span> 
        <span className="text-primary">{getTranslated(category, 'name', lang)}</span>
      </div>

      <header className="listing-header max-w-5xl mx-auto text-center mb-10 md:mb-16">
        <h1 className="display-font text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] text-primary tracking-tighter italic mb-4">
          {getTranslated(category, 'hero_title', lang) || getTranslated(category, 'name', lang)}
        </h1>
        <p className="text-lg md:text-xl font-light text-primary/80 mb-8 italic">{getTranslated(category, 'hero_subtitle', lang)}</p>
        <div className="max-w-3xl mx-auto space-y-6 mb-12">
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">{getTranslated(category, 'hero_description', lang)}</p>
        </div>
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
      </header>

      {activities.length > 0 ? (
        <div className="activity-grid grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto rounded-[3rem] bg-surface-container-low border border-white/40 p-16 text-center sand-shadow">
          <h2 className="display-font text-3xl text-primary italic mb-6">Selection en cours...</h2>
          <p className="text-on-surface-variant leading-relaxed font-light">
            Nous mettons a jour cette categorie avec nos meilleures adresses. 
            Revenez bientot pour decouvrir nos nouveautes testees et approuvees.
          </p>
        </div>
      )}
    </>
  );
}


export default function Activities() {
  const { categorySlug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cms, setCms] = useState({});
  const [loading, setLoading] = useState(true);
  const container = React.useRef();

  // No GSAP animations for cards to ensure 100% reliability and visibility
  useGSAP(() => {
    // Only simple header animation
    if (gsap.utils.toArray(".listing-header").length > 0) {
      gsap.from(".listing-header > *", {
        y: 10,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, { scope: container, dependencies: [loading, categorySlug] });

  useEffect(() => {
    // Scroll to top when category changes to avoid visual glitches
    window.scrollTo(0, 0);
  }, [categorySlug]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/public/activities'),
      axios.get('/api/public/categories'),
      axios.get('/api/public/content/activities')
    ])
    .then(([actRes, catRes, cmsRes]) => {
      const allActivities = actRes.data || [];
      const publishedActivities = allActivities.filter(a => a.status === 'published' || !a.status);
      setActivities(publishedActivities);
      
      const filteredCats = (catRes.data || []).filter(c => c.slug !== 'excursions');
      setCategories(filteredCats);
      setCms(cmsRes.data || {});
      setLoading(false);
    })
    .catch((err) => {
      console.error('Fetch activities/categories error:', err);
      setLoading(false);
    });
  }, []);

  
  const selectedCategory = useMemo(() => categories.find(c => c.slug === categorySlug), [categories, categorySlug]);
  const categoryActivities = useMemo(
    () => (selectedCategory ? activities.filter(a => a.activity_category_id == selectedCategory.id) : []),
    [activities, selectedCategory]
  );

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-12 md:pt-16 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <header className="listing-header mb-20 md:mb-32 text-center max-w-4xl mx-auto animate-pulse flex flex-col items-center">
            <div className="h-4 w-32 bg-primary/10 rounded-full mb-6"></div>
            <div className="h-20 md:h-28 w-full bg-primary/10 rounded-3xl max-w-xl mb-10"></div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="aspect-[4/3] rounded-[2.5rem] bg-surface-container-high mb-6 sand-shadow"></div>
                <div className="h-8 bg-surface-container-high rounded-full w-1/3 mb-4 mx-6"></div>
                <div className="h-16 bg-surface-container-high rounded-lg w-auto mx-6 mb-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={container} className="bg-background min-h-screen pt-12 md:pt-16 pb-24 md:pb-32" style={{ transform: 'scale(0.9)', transformOrigin: 'top' }}>
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
        {selectedCategory ? (
          <CategoryPage category={selectedCategory} activities={categoryActivities} lang={lang} />
        ) : (
          <ActivitiesLanding
            categories={categories}
            cms={cms}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

