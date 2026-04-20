import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, 
    Facebook, 
    Twitter, 
    Copy,
    CheckCircle,
    User,
    Clock,
    Music2,
    BookOpen
} from 'lucide-react';

import BlogSidebar from '../components/BlogSidebar';
import { getTranslated } from '../utils/translation';

const BlogDetail = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const [post, setPost] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareSuccess, setShareSuccess] = useState(false);

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = post?.title || 'Just Marrakech';
        
        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 3000);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postRes, allRes] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/public/blog/${slug}`),
                    axios.get('http://127.0.0.1:8000/api/public/blog')
                ]);
                
                setPost(postRes.data);
                
                // Get other posts for the sidebar
                const others = allRes.data
                    .filter(p => p.slug !== slug)
                    .slice(0, 4)
                    .map(p => ({
                        ...p,
                        title: getTranslated(p, 'title', i18n.language)
                    }));
                setRecentPosts(others);
            } catch (error) {
                console.error('Error fetching blog post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [slug, i18n.language]);

    if (loading) {
        return (
            <div className="min-h-screen bg-sand-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-4">
                <h1 className="display-font text-4xl mb-4">Article non trouvé</h1>
                <Link to="/blog" className="text-primary font-bold uppercase tracking-widest text-[10px]">
                    Retour au Blog
                </Link>
            </div>
        );
    }

    const title = getTranslated(post, 'title', i18n.language);
    const content = getTranslated(post, 'content', i18n.language);
    const dateStr = new Date(post.created_at).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-background">

            
            {/* CLEAN MINIMALIST HEADER */}
            <header className="pt-20 pb-12 text-center max-w-5xl mx-auto px-4">
                <Link to="/blog" className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-[0.2em] mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('blog.back_to_blog')}
                </Link>
                
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-primary/5 border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {post.category || 'Merveilles de Marrakech'}
                        </span>
                        <span className="flex items-center gap-2 text-on-surface-variant text-[10px] uppercase font-bold tracking-widest opacity-60">
                            <Clock size={14} /> {t('blog.read_time', { count: post.read_time || 5 })}
                        </span>
                    </div>
                    <h1 className="display-font text-4xl md:text-5xl lg:text-7xl text-primary leading-tight italic max-w-4xl">
                        {title}
                    </h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    
                    {/* LEFT: MAIN ARTICLE CONTENT */}
                    <article className="lg:col-span-8">
                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center gap-8 mb-12 py-6 border-b border-primary/10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary/60">
                                    <BookOpen size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('blog.author') || 'Auteur'}</p>
                                    <p className="font-bold text-on-surface">{post.author || "L'équipe Just Marrakech"}</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-primary/10 hidden md:block"></div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Date de publication</p>
                                <p className="font-bold text-on-surface/80">{dateStr}</p>
                            </div>
                        </div>

                        {/* Article Main Image */}
                        {post.image && (
                          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl bg-surface border border-white/40">
                            <img 
                              src={post.image.startsWith('http') ? post.image : `http://127.0.0.1:8000${post.image}`} 
                              alt={title} 
                              onError={(e) => {
                                // Instead of just hiding, we can set a clean fallback or just hide the block
                                e.target.parentElement.style.display = 'none';
                              }}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}

                        <div className="prose prose-lg max-w-none prose-headings:display-font prose-headings:font-normal prose-p:text-on-surface/80 prose-p:leading-relaxed prose-img:rounded-[2rem] prose-img:shadow-xl">
                            {/* Rendering content with auto-link and line breaks support */}
                            <div 
                                className="blog-body text-xl lg:text-2xl leading-relaxed text-on-surface/90 space-y-8"
                                dangerouslySetInnerHTML={{ 
                                    __html: content
                                        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>')
                                        .replace(/\n/g, '<br />') 
                                }}
                            ></div>
                        </div>

                        {/* Bottom Tags */}
                        <div className="mt-16 flex flex-wrap gap-3">
                            {['Marrakech', 'Evasion', 'Authenticité'].map(tag => (
                                <span key={tag} className="px-6 py-2 bg-surface border border-white/60 text-[10px] font-bold uppercase tracking-widest text-on-surface/60 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Share Section */}
                        <div className="mt-16 p-10 bg-surface rounded-[2.5rem] border border-white shadow-xl relative overflow-hidden">
                           <div className="relative z-10">
                                <h3 className="display-font text-2xl mb-6">Cet article vous a plu ?</h3>
                                <p className="text-secondary mb-8">Partagez vos découvertes avec vos proches pour préparer ensemble votre prochain voyage.</p>
                                <div className="flex flex-wrap gap-4">
                                     <button 
                                        onClick={() => handleShare('facebook')}
                                        className="flex items-center gap-3 px-6 py-3 bg-[#1877F2] text-white rounded-xl text-xs font-bold transition-transform hover:scale-105"
                                     >
                                         <Facebook size={16} /> Facebook
                                     </button>
                                     <button 
                                        onClick={() => handleShare('twitter')}
                                        className="flex items-center gap-3 px-6 py-3 bg-[#1DA1F2] text-white rounded-xl text-xs font-bold transition-transform hover:scale-105"
                                     >
                                         <Twitter size={16} /> Twitter
                                     </button>
                                     <button 
                                        onClick={() => handleShare('copy')}
                                        className={`flex items-center gap-3 px-6 py-3 ${shareSuccess ? 'bg-secondary' : 'bg-primary'} text-white rounded-xl text-xs font-bold transition-all hover:scale-105`}
                                     >
                                         {shareSuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
                                         {shareSuccess ? 'Lien copié !' : 'Copier le lien'}
                                     </button>
                                </div>
                           </div>
                           {/* Decorative background element icon */}
                           <Music2 size={120} className="absolute -right-10 -bottom-10 text-primary/5 -rotate-12" />
                        </div>
                    </article>

                    {/* RIGHT: SIDEBAR */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                           <BlogSidebar 
                             recentPosts={recentPosts} 
                             categories={[...new Set(recentPosts.map(p => p.category).filter(Boolean))]} 
                           />
                        </div>
                    </div>

                </div>
            </div>


        </div>
    );
};

export default BlogDetail;
