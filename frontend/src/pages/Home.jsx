import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { getAssetUrl } from '../utils/assets';
import { getTranslated, getCmsValue } from '../utils/translation';

const HOW_IT_WORKS_FR = [
  'Vous nous donnez vos infos : budget + personnes + nuitees + dates + envies.',
  'Vous recevez des propositions personnalisees (descriptions + photos).',
  "On affine ensemble jusqu'a ce que ce soit parfait.",
  'Vous recevez un planning clair.',
  "On s'occupe des reservations selon votre validation.",
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
   const [featured, setFeatured] = useState([]);
   const [cms, setCms] = useState({});

  useEffect(() => {
    // Fetch CMS
    axios.get('/api/public/content/home')
      .then(res => setCms(res.data))
      .catch(err => console.error('CMS Fetch error:', err));

    axios
      .get('/api/public/activities')
      .then((res) => {
          // Filter only featured if the API doesn't do it yet
          const feat = res.data.filter(a => a.featured).slice(0, 3);
          setFeatured(feat.length > 0 ? feat : res.data.slice(0, 3));
      })
      .catch((err) => console.error(err));
  }, []);



  const container = useRef();
  
  useGSAP(() => {
    // Hero Entrance
    const tl = gsap.timeline();
    tl.from(".hero-line", { y: 60, opacity: 0, stagger: 0.2, ease: "power4.out", duration: 1.4 })
      .from(".hero-image", { scale: 1.1, opacity: 0, duration: 2, ease: "power2.out" }, "-=1")
      .from(".hero-badge", { x: -20, opacity: 0, duration: 1 }, "-=1.5");

    // Scroll Revelations
    gsap.utils.toArray('.reveal-up').forEach(elem => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });
    });

    // Staggered reveals for cards
    gsap.from(".step-card", {
      scrollTrigger: {
        trigger: ".steps-container",
        start: "top 80%"
      },
      y: 30,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: "power2.out"
    });

  }, { scope: container });

  return (
    <div ref={container} className="overflow-hidden bg-background">
      <section className="relative px-4 sm:px-6 pt-4 pb-16 md:pb-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start md:pt-6 gap-8 md:gap-12 min-h-[70vh]">
        <div className="w-full md:w-5/12 z-10 flex flex-col items-start order-2 md:order-1 mt-0 md:mt-12">
          <div className="hero-badge inline-block px-4 py-1.5 border border-primary/20 rounded-full mb-8 label-md tracking-[0.2em] text-[10px] font-bold text-primary uppercase">
            Curated in Marrakech - Est. 2024
          </div>
          <h1 className="hero-line display-font text-3xl sm:text-4xl lg:text-6xl xl:text-[4rem] leading-[0.95] text-primary mb-6 md:mb-8 tracking-tighter italic">
            {getCmsValue(cms, 'home-hero-title', t('hero.titleHome'), lang)}
          </h1>
          <p className="hero-line text-sm md:text-base text-on-surface-variant max-w-md mb-8 md:mb-10 font-light leading-relaxed">
            {getCmsValue(cms, 'home-hero-subtitle', t('hero.subtitleHome'), lang)}
          </p>

          <div className="hero-line flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link
              to="/activities"
              className="group flex items-center justify-center gap-4 bg-primary text-white hover:bg-primary-container hover:text-on-primary-container transition-all px-10 py-5 rounded-2xl sand-shadow"
            >
              <span className="font-bold uppercase tracking-[0.2em] text-xs">{t('hero.explore')}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="w-full md:w-7/12 relative order-1 md:order-2">
          <div className="aspect-[4/5] md:aspect-[3/4] rounded-[3rem] overflow-hidden sand-shadow relative group hero-image">
            <img
              src={getAssetUrl(getCmsValue(cms, 'home-hero-img', '/hero.jfif', lang))}
              alt="Marrakech Luxury"
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2.5s] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
          </div>

          <div className="absolute -bottom-8 left-4 right-auto w-[calc(100%-2rem)] max-w-[220px] sm:max-w-[280px] sm:left-12 sm:right-12 md:-bottom-10 md:right-auto md:-left-20 glass-panel p-3 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/40 md:max-w-[320px] sand-shadow z-20">
            <div className="flex gap-0.5 mb-2 md:mb-4 text-primary">
              <Star size={10} fill="currentColor" className="md:w-3.5 md:h-3.5" />
              <Star size={10} fill="currentColor" className="md:w-3.5 md:h-3.5" />
              <Star size={10} fill="currentColor" className="md:w-3.5 md:h-3.5" />
              <Star size={10} fill="currentColor" className="md:w-3.5 md:h-3.5" />
              <Star size={10} fill="currentColor" className="md:w-3.5 md:h-3.5" />
            </div>
            <p className="display-font text-sm md:text-xl italic text-primary leading-tight mb-2 md:mb-4">
              "{getCmsValue(cms, 'home-vogue-quote', t('home.quote'), lang)}"
            </p>
            <div className="flex items-center gap-1 md:gap-3">
              <div className="w-4 md:w-8 h-px bg-primary/30"></div>
              <p className="text-[7px] md:text-[10px] font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-outline">
                {getCmsValue(cms, 'home-vogue-subtitle', 'Vogue Travel Journal', lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-surface-container-low relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, #8B4513 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D4A853 0%, transparent 50%)',
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary/60 uppercase mb-4 block">
              {getCmsValue(cms, 'home-how-it-works-label', t('home.how_it_works_label'), lang)}
            </span>
            <h2 className="display-font text-3xl md:text-5xl text-primary tracking-tighter italic mb-4">
              {getCmsValue(cms, 'home-how-it-works-title', t('home.how_it_works_title'), lang)}
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed text-sm md:text-base font-light">
              {getCmsValue(cms, 'home-how-it-works-desc', t('home.how_it_works_desc'), lang)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 steps-container">
            {(Array.isArray(getCmsValue(cms, 'home-how-it-works-steps', t('home.how_steps', { returnObjects: true }), lang)) ? getCmsValue(cms, 'home-how-it-works-steps', t('home.how_steps', { returnObjects: true }), lang) : []).map((step, index) => (
              <div
                key={index}
                className="step-card bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 sand-shadow border border-white/60 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="display-font text-xl text-primary italic font-bold">{index + 1}</span>
                </div>
                <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>


          <div className="mt-12 text-center">
            <div className="inline-flex items-start sm:items-center gap-3 px-4 sm:px-6 py-3 bg-primary/5 rounded-2xl sm:rounded-full border border-primary/10 max-w-full">
              <CheckCircle2 size={18} className="text-primary" />
              <p className="text-xs sm:text-sm font-semibold text-primary text-left sm:text-center">
                {getCmsValue(cms, 'home-how-it-works-cta', t('home.how_it_works_cta'), lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold tracking-[0.3em] text-outline uppercase mb-4 block">
              {getCmsValue(cms, 'home-featured-subtitle', t('home.featured_subtitle'), lang)}
            </span>
            <h2 className="display-font text-3xl md:text-5xl text-primary tracking-tighter italic">
              {getCmsValue(cms, 'home-featured-title', t('home.featured_title'), lang)}
            </h2>
          </div>
          <Link
            to="/activities"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary border-b border-primary/30 pb-2 hover:border-primary transition-all"
          >
            {getCmsValue(cms, 'home-view-collection', t('home.view_collection'))} {'->'}
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {Array.isArray(featured) && featured.map((item) => (
            <Link key={item.id} to={`/detail/activity/${item.id}`} className="reveal-up group block relative">
              <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden sand-shadow mb-8 relative">
                <img
                  src={getAssetUrl(item.images?.[0]?.url || item.images?.[0])}
                  alt={item.images?.[0]?.alt || getTranslated(item, 'title', lang)}
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  onError={e => { e.target.src = '/images/hero_home.jfif'; }}
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>

                <div className="absolute bottom-6 left-6 right-6 p-6 glass-panel rounded-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                    {t('home.featured_subtitle')}
                  </p>
                  <p className="display-font text-xl text-on-surface">{getTranslated(item, 'title', lang)}</p>
                </div>
              </div>

              <div className="px-2">
                <div className="flex items-center gap-2 text-outline mb-3">
                  <MapPin size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {getTranslated(item, 'location', lang)}
                  </span>
                </div>
                <h3 className="display-font text-2xl text-on-surface mb-4 group-hover:text-primary transition-colors italic">
                  {getTranslated(item, 'title', lang)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>


    </div>
  );
}
