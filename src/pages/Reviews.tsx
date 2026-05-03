import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, X } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import { useBooking } from '../contexts/BookingContext';
import ReviewFormModal from '../components/ui/ReviewForm';
import InlineReviewForm from '../components/ReviewForm';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  name: string;
  location: string;
  service_type?: string;
  rating: number;
  comment: string;
  photo_urls?: string[];
  image_urls?: string[];
  featured?: boolean;
  review_date?: string;
  created_at: string;
}

const SERVICE_TYPES = [
  'Airport Transfer',
  'Island Tour',
  'Hotel Transfer',
  'Group Charter',
  'Wedding Transfer',
  'Night Out',
];

const PAGE_SIZE = 9;

function getPhotos(review: Review): string[] {
  return [...(review.image_urls ?? []), ...(review.photo_urls ?? [])];
}

const Reviews: React.FC = () => {
  const { openModal } = useBooking();
  const navigate = useNavigate();
  const handleBookNow = () => {
    if (window.innerWidth < 768) navigate('/booking');
    else openModal();
  };

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [serviceFilter, setServiceFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [ratingFilter, serviceFilter]);

  // Stats — derived from all approved reviews
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const breakdown = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++; });
    return counts;
  }, [reviews]);

  // Sort: featured first, preserve date order otherwise
  const sorted = useMemo(
    () =>
      [...reviews].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }),
    [reviews]
  );

  // Apply filters
  const filtered = useMemo(
    () =>
      sorted.filter(r => {
        if (ratingFilter !== null && r.rating !== ratingFilter) return false;
        if (serviceFilter && r.service_type !== serviceFilter) return false;
        return true;
      }),
    [sorted, ratingFilter, serviceFilter]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const hasActiveFilter = ratingFilter !== null || serviceFilter !== '';

  return (
    <div>
      <Helmet>
        <title>Customer Reviews | FUNtastic Taxi &amp; Tours St. Lucia</title>
        <meta name="description" content="Read verified reviews from travelers who used FUNtastic Taxi & Tours in St. Lucia. Share your own experience and photos." />
        <meta property="og:title" content="Customer Reviews | FUNtastic Taxi & Tours St. Lucia" />
        <meta property="og:url" content="https://funtastictaxiandtours.netlify.app/reviews" />
      </Helmet>

      {/* Page Header */}
      <section className="bg-turquoise/10 py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our clients say about their experience with FUNtastic Taxi &amp; Tours
          </p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn btn-primary mt-6"
          >
            Leave a Review
          </button>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section">
        <div className="container">
          <SectionHeading
            title="What Our Customers Say"
            subtitle="Hear from travelers who have experienced our services"
            centered={true}
          />

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turquoise mx-auto" />
              <p className="mt-4 text-gray-600">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-600 text-lg">No reviews yet — be the first to share your experience!</p>
            </div>
          ) : (
            <>
              {/* Stats Banner */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Average */}
                  <div className="text-center shrink-0 md:border-r md:border-gray-100 md:pr-8">
                    <div className="text-5xl font-bold text-navy mb-2">{avgRating.toFixed(1)}</div>
                    <div className="flex gap-1 justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          size={20}
                          className={i <= Math.round(avgRating) ? 'fill-yellow text-yellow' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Breakdown bars */}
                  <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = breakdown[star] || 0;
                      const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-8 shrink-0 justify-end">
                            <span className="text-sm text-gray-600">{star}</span>
                            <Star size={11} className="fill-yellow text-yellow" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-5 text-right shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="space-y-3 mb-8">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-500 mr-1">Rating:</span>
                  {([null, 5, 4, 3, 2, 1] as (number | null)[]).map(r => (
                    <button
                      key={r ?? 'all'}
                      onClick={() => setRatingFilter(r)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        ratingFilter === r
                          ? 'bg-turquoise text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r === null ? 'All' : `${r}★`}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-500 mr-1">Service:</span>
                  {(['', ...SERVICE_TYPES]).map(s => (
                    <button
                      key={s || 'all'}
                      onClick={() => setServiceFilter(s)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        serviceFilter === s
                          ? 'bg-turquoise text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered empty state */}
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Star size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-600 mb-3">No reviews match the selected filters.</p>
                  <button
                    onClick={() => { setRatingFilter(null); setServiceFilter(''); }}
                    className="text-sm text-turquoise hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Review Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visible.map(review => {
                      const photos = getPhotos(review);
                      return (
                        <div
                          key={review.id}
                          className="card cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
                          style={review.featured ? { borderLeft: '4px solid #FFC845' } : undefined}
                          onClick={() => setSelectedReview(review)}
                        >
                          {review.featured && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star size={12} className="fill-yellow text-yellow" />
                              <span className="text-xs font-medium text-yellow-700">Featured</span>
                            </div>
                          )}

                          {/* Stars */}
                          <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star
                                key={i}
                                size={18}
                                className={i <= review.rating ? 'fill-yellow text-yellow' : 'text-gray-300'}
                              />
                            ))}
                          </div>

                          {/* Comment */}
                          <p className="text-gray-700 italic mb-4 line-clamp-4 flex-1">{review.comment}</p>

                          {/* Photo thumbnails */}
                          {photos.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-4">
                              {photos.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`Photo by ${review.name}`}
                                  loading="lazy"
                                  className="w-20 h-20 object-cover rounded-lg hover:opacity-90 transition-opacity"
                                  onClick={e => { e.stopPropagation(); setLightboxUrl(url); }}
                                />
                              ))}
                            </div>
                          )}

                          {/* Name / location / service */}
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                            <p className="text-gray-500 text-sm">{review.location}</p>
                            {review.service_type && (
                              <p className="text-xs text-turquoise mt-1">{review.service_type}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-10">
                      <button
                        onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                        className="btn btn-outline px-8"
                      >
                        Load More
                        <span className="ml-2 text-sm opacity-60">
                          ({filtered.length - visibleCount} more)
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Share Your Experience */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy mb-3">
              Share Your Experience
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Traveled with us? We'd love to hear your thoughts. Your review helps other visitors
              choose the best transportation for their St. Lucia adventure.
            </p>
          </div>
          <InlineReviewForm />
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-turquoise text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Experience Our Exceptional Service?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our hundreds of satisfied customers and book your St. Lucia transportation today.
          </p>
          <button onClick={handleBookNow} className="btn btn-cta">
            Book Now
          </button>
        </div>
      </section>

      {/* Review Form Modal (header button) */}
      {showReviewForm && (
        <ReviewFormModal onClose={() => setShowReviewForm(false)} />
      )}

      {/* Review Detail Modal */}
      {selectedReview && (() => {
        const modalPhotos = getPhotos(selectedReview);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedReview(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-heading font-bold text-navy">{selectedReview.name}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">{selectedReview.location}</p>
                  {selectedReview.service_type && (
                    <span className="inline-block mt-2 px-3 py-1 bg-turquoise/10 text-turquoise text-xs font-medium rounded-full">
                      {selectedReview.service_type}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  aria-label="Close"
                  className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={22}
                      className={i <= selectedReview.rating ? 'fill-yellow text-yellow' : 'text-gray-300'}
                    />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">{selectedReview.comment}</p>

                {selectedReview.review_date && (
                  <p className="text-xs text-gray-400 mb-6">
                    {new Date(selectedReview.review_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}

                {modalPhotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {modalPhotos.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square overflow-hidden rounded-lg"
                      >
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Reviews;
