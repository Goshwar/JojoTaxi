import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';
import { useBooking } from '../contexts/BookingContext';
import TestimonialCard from '../components/ui/TestimonialCard';
import ReviewForm from '../components/ui/ReviewForm';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  photo_urls: string[];
  created_at: string;
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

  return (
    <div>
      {/* Page Header */}
      <section className="bg-turquoise/10 py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our clients say about their experience with FUNtastic Taxi & Tours
          </p>
          <button 
            onClick={() => setShowReviewForm(true)}
            className="btn btn-primary mt-6"
          >
            Leave a Review
          </button>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="section">
        <div className="container">
          <SectionHeading 
            title="What Our Customers Say" 
            subtitle="Hear from travelers who have experienced our services"
            centered={true}
          />
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turquoise mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No reviews available yet. Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <TestimonialCard
                  key={review.id}
                  name={review.name}
                  location={review.location}
                  rating={review.rating}
                  testimonial={review.comment}
                  photos={review.photo_urls}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Platforms */}
      <section className="section bg-gray-50">
        <div className="container text-center">
          <SectionHeading 
            title="Find Us On Review Platforms" 
            subtitle="See more reviews from verified customers"
            centered={true}
          />
          
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-3 mx-auto">
                <p className="font-bold">TripAdvisor</p>
              </div>
              <p className="text-yellow font-bold">★★★★★</p>
              <p className="text-gray-600">4.9/5 from 250+ reviews</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-3 mx-auto">
                <p className="font-bold">Google</p>
              </div>
              <p className="text-yellow font-bold">★★★★★</p>
              <p className="text-gray-600">4.8/5 from 180+ reviews</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-3 mx-auto">
                <p className="font-bold">Facebook</p>
              </div>
              <p className="text-yellow font-bold">★★★★★</p>
              <p className="text-gray-600">4.9/5 from 120+ reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-turquoise text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Experience Our Exceptional Service?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our hundreds of satisfied customers and book your St. Lucia transportation today.
          </p>
          <button onClick={handleBookNow} className="btn btn-cta">
            Book Now
          </button>
        </div>
      </section>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm onClose={() => setShowReviewForm(false)} />
      )}
    </div>
  );
};

export default Reviews;