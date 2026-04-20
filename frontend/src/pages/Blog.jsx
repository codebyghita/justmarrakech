import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';
import { getTranslated } from '../utils/translation';

const Blog = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cms, setCms] = useState({});

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/public/content/blog');
                setCms(res.data);
            } catch (err) { console.error('CMS Fetch error:', err); }
        };
        fetchCMS();

        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/public/blog');
                // Support multi-language for articles
                const localizedPosts = response.data.map(p => ({
                    ...p,
                    title: getTranslated(p, 'title', i18n.language),
                    excerpt: getTranslated(p, 'excerpt', i18n.language)
                }));
                // Only showing published posts
                setPosts(localizedPosts.filter(p => !p.status || p.status === 'published' || p.status === 'active'));
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [i18n.language]);

    const getCmsValue = (slug, fallback) => {
        const block = cms[slug];
        if (!block) return fallback;
        const translated = getTranslated(block, 'content', i18n.language);
        return translated !== null ? translated : fallback;
    };

    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
        <div className="bg-background min-h-screen">
            {/* CLEAN MINIMALIST HEADER */}
            <header className="pt-20 pb-16 text-center max-w-5xl mx-auto px-4">
                <span className="text-[10px] font-bold tracking-[0.4em] text-primary/40 uppercase mb-4 block">
                    Just Marrakech
                </span>
                <h1 className="display-font text-5xl md:text-7xl lg:text-8xl text-primary mb-6 leading-tight italic">
                    {getCmsValue('blog-hero-title', 'Articles & Inspirations')}
                </h1>
                <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-light italic opacity-70">
                    {getCmsValue('blog-hero-subtitle', 'Découvrez nos conseils exclusifs et l\'actualité de Marrakech.')}
                </p>
            </header>

            <main className="pb-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-20">
                            {/* Featured Article */}
                            {featuredPost && (
                                <section>
                                    <BlogCard post={featuredPost} featured={true} />
                                </section>
                            )}

                            {/* Main Grid Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                {/* Left: Other Articles */}
                                <div className="lg:col-span-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                                        {otherPosts.length > 0 ? (
                                            otherPosts.map(post => (
                                                <BlogCard key={post.id} post={post} />
                                            ))
                                        ) : !featuredPost && (
                                            <div className="col-span-2 text-center py-20 bg-surface rounded-[2rem] border border-dashed border-outline/20">
                                                <p className="text-outline italic">Aucun article à afficher pour le moment.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Pagination Placeholder */}
                                    {posts.length > 6 && (
                                        <div className="mt-20 flex justify-center">
                                            <button className="px-10 py-4 bg-white border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all">
                                                Voir plus d'articles
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Sidebar */}
                                <div className="lg:col-span-4">
                                    <div className="sticky top-32">
                                        <BlogSidebar 
                                            recentPosts={posts.slice(0, 4)} 
                                            categories={categories} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>


        </div>
    );
};

export default Blog;
