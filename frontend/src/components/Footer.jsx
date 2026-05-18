import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, Music2 } from 'lucide-react';

import { useState, useEffect } from 'react';
import axios from 'axios';

import { getTranslated, getJsonField } from '../utils/translation';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    axios.get('/api/public/settings')
      .then((settingsRes) => {
        setSettings(settingsRes.data);
      })
      .catch(err => console.error('Error fetching footer data:', err));
  }, []);

  const getS = (key, fallback) => settings[key]?.value || fallback;


  return (
    <footer
      className="bg-surface-container-highest pt-20 pb-10 border-t border-white/20"
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        <div className="lg:col-span-1">
          <Link to="/" className="text-3xl display-font font-bold text-primary tracking-tighter mb-6 block">
            {getTranslated(settings['footer_brand_title'], 'value', i18n.language) || 'just marrakech'}
          </Link>
          <p className="text-on-surface-variant/80 text-sm leading-relaxed mb-8">
            {getTranslated(settings['footer_description'], 'value', i18n.language) || t('footer.description')}
          </p>

        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-8 underline underline-offset-8 decoration-primary/20">
            {t('footer.contact')}
          </h4>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm text-on-surface-variant">
              <Mail size={16} className="text-primary/60" />
              <a href={`mailto:${getS('contact_email', 'contact@justmarrakech.fr')}`} className="hover:text-primary transition-colors underline underline-offset-2 break-all">
                {getS('contact_email', 'contact@justmarrakech.fr')}
              </a>
            </li>
            <li className="flex items-center gap-3 text-sm text-on-surface-variant">
              <Phone size={16} className="text-primary/60" />
              <span>+{getS('whatsapp_number', '212 714 173 661').replace(/\s/g, '').replace(/^\+/, '').replace(/(\d{3})(\d)(\d{2})(\d{2})(\d{3})/, '$1 $2 $3 $4 $5')}</span>
            </li>

            <li className="flex items-center gap-3 text-sm text-on-surface-variant">
              <MapPin size={16} className="text-primary/60" />
              <span>{getS('contact_address', 'Marrakech, Maroc')}</span>
            </li>
          </ul>

          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 underline underline-offset-8 decoration-primary/20">
            {t('footer.social_title')}
          </h4>
          <div className="flex gap-4">
            <a
              href={getS('facebook_url', 'https://facebook.com/justmarrakech')}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all"
            >
              <Facebook size={18} />
            </a>
            <a
              href={getS('instagram_url', 'https://instagram.com/justmarrakech')}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all"
            >
              <Instagram size={18} />
            </a>
            <a
              href={getS('tiktok_url', 'https://tiktok.com/@justmarrakech')}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all"
            >
              <Music2 size={18} />
            </a>
          </div>

        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-8 underline underline-offset-8 decoration-primary/20">
            {t('footer.info_title')}
          </h4>
          <ul className="space-y-4">
            {(() => {
                const links = getJsonField(settings['footer_info_links'], 'value', i18n.language);
                const result = Array.isArray(links) ? links.map((link, idx) => {
                    const url = link.url || '';
                    const isExternal = url.startsWith('http');
                    const isStorage = url.startsWith('/storage');
                    const finalUrl = isStorage ? `${url}` : url;

                    return (
                        <li key={`info-${idx}`} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                            {(isExternal || isStorage) ? (
                                <a href={finalUrl} target="_blank" rel="noreferrer">{link.label}</a>
                            ) : (
                                <Link to={url}>{link.label}</Link>
                            )}
                        </li>
                    );
                }) : [];

                    if (!result.length) return (
                        <li className="text-sm text-on-surface-variant italic opacity-50">Aucun lien configuré</li>
                    );

                    return result;
            })()}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 md:mt-20 pt-8 border-t border-surface-container-low flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-outline uppercase tracking-[0.1em]">
          © {new Date().getFullYear()} JUST MARRAKECH. {t('footer.rights')}
        </p>
        <p className="text-[10px] text-outline uppercase tracking-[0.1em] text-center md:text-right">
            Agence locale indépendante basée à Marrakech.
        </p>
      </div>
    </footer>
  );
}
