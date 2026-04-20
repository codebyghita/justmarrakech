import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { useRef } from 'react';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const container = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".nav-logo", { x: -20, opacity: 0, duration: 1.2, ease: "power3.out" })
      .from(".nav-link", { y: -10, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }, "-=0.8")
      .from(".nav-right", { x: 20, opacity: 0, duration: 1, ease: "power3.out" }, "-=1");
  }, { scope: container });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/public/categories')
      .then(res => res.json())
      .then(data => {
        const filtered = (data || []).filter(c => c.slug !== 'excursions');
        setCategories(filtered);
      })
      .catch(err => console.error('Fetch categories error:', err));

    fetch('http://127.0.0.1:8000/api/public/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Fetch settings error:', err));
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setMobileOpen(false);
  };

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/activities', label: t('nav.activities') },
    { to: '/excursions', label: t('nav.excursions') },
    { to: '/sur-mesure', label: t('nav.sur_mesure') },
    { to: '/blog', label: t('nav.blog') },
  ];

  // Group categories under 'Activities' for cleaner mobile/desktop submenus if needed, 
  // but for now let's just keep the main links and maybe a 'Blog' if she adds it.
  const mainLinks = [
    { to: '/activities', label: t('nav.activities'), hasDropdown: categories.length > 0 },
    { to: '/excursions', label: t('nav.excursions') },
    { to: '/sur-mesure', label: t('nav.sur_mesure') },
    { to: '/blog', label: t('nav.blog') },
  ];


  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav ref={container} className="fixed w-full z-50 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 md:py-3 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 nav-logo">
            <img
              src="/logo-transparent.png"
              alt="Just Marrakech"
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-8 mx-4">
            {mainLinks.map((link) => (
              <div key={link.to} className="relative group/nav py-4 nav-link">
                <Link
                    to={link.to}
                    className={`text-[11px] font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${
                    isActive(link.to)
                        ? 'text-primary'
                        : 'text-on-surface/70 hover:text-primary'
                    }`}
                >
                    {link.label}
                    {link.hasDropdown && <span className="text-[8px] opacity-40">▼</span>}
                </Link>
                {link.hasDropdown && (
                    <div className="absolute top-full left-0 bg-surface shadow-xl rounded-xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 min-w-[200px] border border-white/20 p-2 overflow-hidden">
                        {categories.map(cat => (
                            <Link 
                                key={cat.id} 
                                to={`/activities/${cat.slug}`}
                                className="block px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}
                {isActive(link.to) && <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </div>
            ))}
          </div>


          {/* Right side: Language + Mobile Menu */}
          <div className="flex items-center gap-3 shrink-0 nav-right">
            
            {/* Language Switcher */}
            <div className="relative group cursor-pointer inline-flex items-center gap-1 text-sm">
              <Globe size={15} className="text-on-surface/70" />
              <span className="uppercase text-[11px] font-semibold tracking-wider">
                {i18n.language.substring(0, 2)}
              </span>
              <div className="absolute top-full right-0 mt-3 bg-surface shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden min-w-[140px] border border-white/20">
                {LANGUAGES.map((lng) => (
                  <button
                    key={lng.code}
                    onClick={() => changeLanguage(lng.code)}
                    className={`px-5 py-3 text-left text-sm font-medium border-b border-surface-container-low last:border-b-0 transition-colors ${
                      i18n.language === lng.code
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'hover:bg-surface-container-low text-on-surface/80'
                    }`}
                  >
                    {lng.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-surface-container-low transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><Menu size={18} /> Explorer</div>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-surface/95 backdrop-blur-xl px-4 sm:px-6 py-5 flex flex-col gap-1 max-h-[calc(100vh-84px)] overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive(link.to)
                    ? 'text-primary bg-primary/5'
                    : 'text-on-surface/70 hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {LANGUAGES.map((lng) => (
                <button
                  key={lng.code}
                  onClick={() => changeLanguage(lng.code)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    i18n.language === lng.code
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface/70 hover:text-primary'
                  }`}
                >
                  {lng.code}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
