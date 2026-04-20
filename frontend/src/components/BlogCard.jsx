import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const BlogCard = ({ post, featured = false }) => {
  if (!post) return null;

  const [imgError, setImgError] = React.useState(false);
  const imageUrl = post.image 
    ? (post.image.startsWith('http') ? post.image : `http://127.0.0.1:8000${post.image}`) 
    : '/images/hero_home.jfif'; // Use an existing valid asset as default

  if (featured) {
    return (
      <Link to={`/blog/${post.slug}`} className="group block relative overflow-hidden rounded-[2.5rem] bg-surface-container shadow-2xl transition-all duration-700 hover:shadow-primary/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 h-[300px] lg:h-[450px] overflow-hidden">
            {!imgError ? (
              <img 
                src={imageUrl} 
                alt={post.title} 
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center display-font text-primary italic text-2xl">
                 Just Marrakech
              </div>
            )}
          </div>
          <div className="lg:col-span-5 p-8 lg:p-12 space-y-6">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary">
              <span className="px-3 py-1 bg-primary/10 rounded-full">{post.category || 'Évasion'}</span>
              <span className="flex items-center gap-2 text-outline"><Clock size={12} /> 5 min read</span>
            </div>
            <h2 className="display-font text-3xl lg:text-5xl text-on-surface leading-tight group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-sm lg:text-base text-on-surface/70 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
            <div className="inline-flex items-center gap-3 text-sm font-bold text-primary group-hover:gap-5 transition-all">
              Lire l'article <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${post.slug}`} className="group block space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-surface shadow-lg border border-white/40">
        {!imgError ? (
          <img 
            src={imageUrl} 
            alt={post.title} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center display-font text-primary italic text-xl">
             Just Marrakech
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-[0.2em] rounded-full text-primary shadow-sm">
            {post.category || 'Lifestyle'}
          </span>
        </div>
      </div>
      <div className="space-y-3 px-2">
        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-outline">
           <span>{new Date(post.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
           <span className="w-1 h-1 bg-outline/30 rounded-full"></span>
           <span>5 min read</span>
        </div>
        <h3 className="display-font text-2xl text-on-surface leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-on-surface/60 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
};

export default BlogCard;
