import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Star, Send, Check, Copy } from 'lucide-react';

export default function ReviewsBlock({ reviewableId, reviewableType, siteSettings }) {
  const { t } = useTranslation();
  
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reviewableId || !reviewableType) return;
    
    axios.get(`http://127.0.0.1:8000/api/public/reviews?reviewable_id=${reviewableId}&reviewable_type=${reviewableType}`)
      .then(res => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reviews", err);
        setLoading(false);
      });
  }, [reviewableId, reviewableType]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
        await axios.post('http://127.0.0.1:8000/api/public/reviews', {
            ...newReview,
            reviewable_id: reviewableId, 
            reviewable_type: reviewableType
        });
        setReviewSubmitted(true);
        setSubmittingReview(false);
        // Add optimistic update so it shows immediately if approved or just wait
    } catch (err) {
        console.error(err);
        alert('Erreur lors de l\'envoi de l\'avis.');
        setSubmittingReview(false);
    }
  };

  const copyAndPostToGoogle = () => {
    navigator.clipboard.writeText(newReview.comment);
    alert('Avis copié ! Vous allez être redirigé vers Google pour le coller.');
    const googleUrl = siteSettings?.['google_review_url']?.value || 'https://g.page/r/CVf-_qyR76RfEBM/review';
    window.open(googleUrl, '_blank');
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'text-secondary fill-secondary' : 'text-outline/30'}
        />
      ))}
    </div>
  );

  const formatReviewDate = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const reviewAverage = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;

  if (loading) return null;

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 sand-shadow border border-primary/5 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-primary/60 mb-2">{t('reviews.title', 'Avis Clients')}</p>
          <div className="flex items-center gap-4">
            <span className="display-font text-5xl sm:text-6xl text-primary italic leading-none truncate">{reviewAverage.toFixed(1)}</span>
            <div className="shrink-0">
                {renderStars(Math.round(reviewAverage))}
                <p className="text-[10px] sm:text-xs text-on-surface-variant mt-1">{reviews.length} {t('reviews.rating_label', 'Avis')}</p>
            </div>
          </div>
        </div>

        {!showReviewForm && !reviewSubmitted && (
          <button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary/5 border border-primary/20 text-primary font-bold text-[9px] sm:text-[10px] tracking-widest uppercase px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-primary/10 transition-all text-center w-full md:w-auto shrink-0"
          >
              {t('reviews.give_review', 'Laisser un avis')}
          </button>
        )}
      </div>

      {showReviewForm && !reviewSubmitted && (
          <form onSubmit={submitReview} className="mb-8 sm:mb-12 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-surface-container-lowest border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                      <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary/60 block mb-2">{t('reviews.your_name', 'Votre nom')}</label>
                      <input 
                          required
                          type="text" 
                          className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                          value={newReview.name}
                          onChange={e => setNewReview({...newReview, name: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary/60 block mb-2">{t('reviews.rating', 'Note')}</label>
                      <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                              <button 
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReview({...newReview, rating: star})}
                                  className="p-1"
                              >
                                  <Star size={24} className={star <= newReview.rating ? 'fill-secondary text-secondary' : 'text-outline/20'} />
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="mb-4 sm:mb-6">
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary/60 block mb-2">{t('reviews.your_message', 'Votre message')}</label>
                  <textarea 
                      required
                      rows={4}
                      className="w-full bg-white border border-primary/10 rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                      value={newReview.comment}
                      onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  ></textarea>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="submit"
                      disabled={submittingReview}
                      className="bg-primary text-white font-bold text-[9px] sm:text-[10px] tracking-widest uppercase px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
                    >
                      <Send size={14} /> {submittingReview ? t('reviews.sending', 'Envoi...') : t('reviews.publish', 'Publier')}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="text-outline/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:text-error transition-colors w-full sm:w-auto py-3"
                    >
                      {t('reviews.cancel', 'Annuler')}
                    </button>
              </div>
          </form>
      )}

      {reviewSubmitted && (
          <div className="mb-8 sm:mb-12 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-secondary/10 border border-secondary/20 text-center animate-in zoom-in duration-500">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={20} className="text-secondary" />
              </div>
              <h4 className="display-font text-xl sm:text-2xl text-secondary mt-3 mb-2 italic">{t('reviews.thank_you', 'Merci !')}</h4>
              <p className="text-on-surface-variant text-xs sm:text-sm mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
                  {t('reviews.google_cta', 'Votre avis compte. Partagez-le sur Google.')}
              </p>
              <div className="flex justify-center">
                  <button 
                      onClick={copyAndPostToGoogle}
                      className="bg-white border border-secondary/30 text-secondary font-bold text-[9px] sm:text-[10px] tracking-[0.2em] uppercase px-5 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/5 transition-all w-full sm:w-auto"
                  >
                      <Copy size={14} /> {t('reviews.google_button', 'Copier & Google')}
                  </button>
              </div>
          </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {reviews.length > 0 ? reviews.map((review) => (
          <article key={review.id} className="rounded-2xl sm:rounded-3xl border border-primary/5 bg-surface-container-lowest p-5 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="pr-2">
                <p className="font-bold text-on-surface text-base sm:text-lg truncate">{review.name}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-outline/50 mt-1">{formatReviewDate(review.created_at)}</p>
              </div>
              <div className="shrink-0">
                  {renderStars(review.rating)}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-on-surface-variant font-light italic">"{review.comment}"</p>
          </article>
        )) : (
          <div className="lg:col-span-2 text-center py-10 sm:py-12 text-outline/40 italic text-sm">{t('reviews.be_first', 'Soyez le premier à laisser un avis')}</div>
        )}
      </div>
    </div>
  );
}
