import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import axios from 'axios';

const BlogSidebar = ({ recentPosts = [], categories = [] }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      await axios.post('/api/public/newsletter', { email });
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter error:', error);
      setStatus('error');
    }
  };

  return (
    <aside className="space-y-12">
      {/* Categories Search/Filter */}
      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6 pb-2 border-b border-primary/10">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? categories.map((cat, idx) => (
            <button key={idx} className="px-4 py-2 bg-surface sand-shadow text-[10px] font-bold uppercase tracking-widest text-on-surface hover:bg-primary hover:text-white transition-all rounded-full border border-white/40">
              {cat}
            </button>
          )) : (
            ['Incontournables', 'Conseils', 'Culture', 'Excursions'].map((cat, idx) => (
              <button key={idx} className="px-4 py-2 bg-surface sand-shadow text-[10px] font-bold uppercase tracking-widest text-on-surface hover:bg-primary hover:text-white transition-all rounded-full border border-white/40">
                {cat}
              </button>
            ))
          )}
        </div>
      </section>

      {/* Recent Posts List */}
      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6 pb-2 border-b border-primary/10">
          Articles Récents
        </h3>
        <div className="space-y-6">
          {recentPosts.length > 0 ? recentPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-surface shadow-sm border border-white/40">
                  <img 
                    src={getAssetUrl(post.image)} 
                    alt={post.title}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/images/hero_home.jfif';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-primary/60 mb-1">{post.category || 'Marrakech'}</p>
                  <h4 className="display-font text-sm text-on-surface leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              </div>
            </Link>
          )) : (
            <p className="text-xs text-outline italic">Aucun autre article disponible.</p>
          )}
        </div>
      </section>

      {/* Newsletter / CTA removed as per user request */}
    </aside>
  );
};

export default BlogSidebar;
