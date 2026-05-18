import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getTranslated, getCmsValue } from '../utils/translation';
import { getAssetUrl } from '../utils/assets';

const Blog = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cms, setCms] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const res = await axios.get('/api/public/content/blog');
                setCms(res.data);
            } catch (err) { console.error('CMS Fetch error:', err); }
        };
        fetchCMS();

        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/public/blog');
                setPosts(response.data.filter(p => !p.status || p.status === 'published' || p.status === 'active'));
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);



    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };

    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
    const filteredPosts = selectedCategory === 'all' 
        ? posts 
        : posts.filter(p => p.category === selectedCategory);

    const featuredPost = filteredPosts[0];
    const otherPosts = filteredPosts.slice(1);

    if (loading) return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="bg-surface min-h-screen pt-24 pb-16 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <header className="text-center mb-12 md:mb-16">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <span className="w-12 h-px bg-primary/20"></span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">
                            {getCmsValue(cms, 'blog-label', 'Journal de Voyage', lang)}
                        </span>
                        <span className="w-12 h-px bg-primary/20"></span>
                    </div>
                    <h1 className="display-font text-4xl md:text-6xl text-primary italic leading-[0.85] mb-6">
                        {getCmsValue(cms, 'blog-hero-title', 'Articles & Inspirations', lang)}
                    </h1>
                    <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base font-light italic opacity-70">
                        {getCmsValue(cms, 'blog-hero-subtitle', 'Découvrez nos conseils exclusifs et l\'actualité de Marrakech.', lang)}
                    </p>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8">
                        <button 
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white/60 text-primary/60 hover:bg-white hover:text-primary'}`}
                        >
                            Tous
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white/60 text-primary/60 hover:bg-white hover:text-primary'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                {filteredPosts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {filteredPosts.map((post, idx) => (
                            <Link 
                                key={post.id} 
                                to={`/blog/${post.slug}`} 
                                className="group flex flex-col"
                            >
                                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 sand-shadow border border-white/40">
                                    <img 
                                      src={getAssetUrl(post.image)} 
                                      alt={getTranslated(post, 'title', lang) || ''} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                                      onError={e => { e.target.src = '/images/hero_home.jfif'; }}
                                    />
                                </div>
                                <div className="px-4">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 mb-3 block">
                                        {formatDate(post.created_at)} • {post.category}
                                    </span>
                                    <h3 className="display-font text-2xl text-primary mb-4 italic leading-tight group-hover:translate-x-2 transition-transform duration-500">
                                        {getTranslated(post, 'title', lang)}
                                    </h3>
                                    <p className="text-on-surface-variant/70 text-sm font-light leading-relaxed line-clamp-2 italic">
                                        {getTranslated(post, 'excerpt', lang) || getTranslated(post, 'description', lang)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center bg-white/30 rounded-[3rem] border border-dashed border-primary/10">
                        <p className="display-font text-2xl text-primary/40 italic">Aucun article dans cette catégorie.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
