import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getTranslated, getCmsValue } from '../utils/translation';
import { Clock, MapPin, Check } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';


function ActivityCard({ activity, compact, lang }) {
  const handleImageError = (e) => {
    e.currentTarget.src = '/images/hero_home.jfif';
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  const image = activity.images?.[0]?.startsWith('/storage') 
    ? `http://127.0.0.1:8000${activity.images[0]}` 
    : activity.images?.[0] || 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2073&auto=format&fit=crop';
    
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
                {location || 'Marrakech'}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}


function ActivitiesLanding({ featuredActivities, categories, cms, lang }) {
  const { t } = useTranslation();
  const badges = cms['activities-landing-badges']?.content || ['Selection testee', 'Reservation WhatsApp'];
  
  return (
    <>
      {/* CLEAN MINIMALIST HEADER */}
      <div className="pt-20 pb-16 text-center max-w-5xl mx-auto px-4">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary/40 uppercase mb-4 block">
              Just Marrakech
          </span>
          <h1 className="display-font text-4xl sm:text-5xl md:text-6xl text-primary mb-4 italic tracking-tight leading-tight">
              {getCmsValue(cms, 'activities-hero-title', t('nav.activities'), lang)}
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-base md:text-lg font-light italic opacity-70">
              {getCmsValue(cms, 'activities-hero-subtitle', t('hero.subtitleActivities'), lang)}
          </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-3 mb-20">
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

      <section className="mb-28">
        <div className="text-center mb-14">
          <h2 className="display-font text-4xl md:text-6xl text-on-surface italic tracking-tight mb-4">{t('activities_page.choose_category')}</h2>
          <p className="text-base text-on-surface-variant opacity-70 uppercase tracking-widest text-[10px] font-bold">{t('activities_page.choose_category_sub')}</p>
        </div>
        <div className="category-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/activities/${category.slug}`}
              className="category-card group block rounded-[2.5rem] overflow-hidden bg-white/90 border border-primary/5 sand-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={category.image?.startsWith('/storage') ? `http://127.0.0.1:8000${category.image}` : category.image || '/hero.jfif'}
                  alt={category.name}
                  onError={(e) => { e.currentTarget.src = '/images/hero_home.jfif'; }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                   <h3 className="display-font text-3xl text-white italic leading-tight">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="text-center mb-12">
          <h2 className="display-font text-4xl md:text-6xl text-primary italic mb-6">
            {t('activities_page.popular_activities', 'Activités Populaires')}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-sm leading-relaxed mb-12">
             {t('activities_page.exclusive_popular', 'Découvrez notre sélection des expériences les plus demandées à Marrakech.')}
          </p>
        </div>
        <div className="activity-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {featuredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} lang={lang} compact />
          ))}
        </div>
      </section>
    </>
  );
}


function CategoryPage({ category, activities, lang }) {
  const { t } = useTranslation();
  const badges = category.badges || [];
  return (
    <>
      <div className="max-w-5xl mx-auto mb-10 text-[10px] uppercase font-bold tracking-widest text-outline-variant flex gap-2 items-center">
        <Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link> 
        <span>{'>'}</span> 
        <Link to="/activities" className="hover:text-primary transition-colors">{t('nav.activities')}</Link> 
        <span>{'>'}</span> 
        <span className="text-primary">{category.name}</span>
      </div>

      <header className="listing-header max-w-5xl mx-auto text-center mb-14 md:mb-24">
        <h1 className="display-font text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[5rem] text-primary tracking-tighter italic mb-4">
          {category.hero_title || category.name}
        </h1>
        <p className="text-xl md:text-2xl font-light text-primary/80 mb-10 italic">{category.hero_subtitle}</p>
        <div className="max-w-3xl mx-auto space-y-6 mb-12">
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">{category.hero_description}</p>
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed italic opacity-80">{category.hero_support}</p>
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
        <div className="activity-grid grid grid-cols-1 md:grid-cols-2 gap-10">
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

  useGSAP(() => {
    if (loading) return;

    // Entrance for header
    if (gsap.utils.toArray(".listing-header").length > 0) {
      gsap.from(".listing-header > *", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power2.out"
      });
    }

    // Stagger for categories
    if (gsap.utils.toArray(".category-card").length > 0) {
      gsap.from(".category-card", {
        scrollTrigger: {
          trigger: ".category-grid",
          start: "top 85%"
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: "power3.out"
      });
    }

    // Stagger for activities
    if (gsap.utils.toArray(".activity-card").length > 0) {
      gsap.from(".activity-card", {
        scrollTrigger: {
          trigger: ".activity-grid",
          start: "top 85%"
        },
        scale: 0.95,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "back.out(1.2)"
      });
    }

  }, { scope: container, dependencies: [loading, categorySlug, activities.length, categories.length] });

  useEffect(() => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/public/activities'),
      axios.get('http://127.0.0.1:8000/api/public/categories'),
      axios.get('http://127.0.0.1:8000/api/public/content/activities')
    ])
    .then(([actRes, catRes, cmsRes]) => {
      setActivities(actRes.data || []);
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

  // On s'assure que featuredActivities exclut les excursions sur cette page
  const nonExcursionActivities = useMemo(() => 
    activities.filter(a => a.activityCategory?.slug !== 'excursions' && a.category !== 'excursions'),
    [activities]
  );

  const featuredActivities = useMemo(() => {
    const feats = nonExcursionActivities.filter(a => a.featured);
    // Si aucune activité n'est marquée "featured", on prend les premières non-excursions disponibles
    return feats.length > 0 ? feats.slice(0, 6) : nonExcursionActivities.slice(0, 6);
  }, [nonExcursionActivities]);
  
  const selectedCategory = useMemo(() => categories.find(c => c.slug === categorySlug), [categories, categorySlug]);
  const categoryActivities = useMemo(
    () => (selectedCategory ? activities.filter(a => a.activity_category_id === selectedCategory.id) : []),
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
    <div ref={container} className="bg-background min-h-screen pt-12 md:pt-16 pb-24 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {selectedCategory ? (
          <CategoryPage category={selectedCategory} activities={categoryActivities} lang={lang} />
        ) : (
          <ActivitiesLanding
            featuredActivities={featuredActivities.length ? featuredActivities : activities.slice(0, 6)}
            categories={categories}
            cms={cms}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

