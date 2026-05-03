import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, SmilePlus, Award, Clock, ShieldCheck } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SectionHeading from '../components/ui/SectionHeading';
import HomepageServiceCard from '../components/ui/HomepageServiceCard';
import TrustBar from '../components/ui/TrustBar';
import { useInView } from '../hooks/useInView';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  reviewer_name: string;
  location?: string;
  rating: number;
  comment: string;
  source?: string;
  image_urls?: string[];
}

const sourceBadgeClass: Record<string, string> = {
  Google: 'bg-blue-500 text-white',
  TripAdvisor: 'bg-green-600 text-white',
  Website: 'bg-turquoise text-white',
};

const Home: React.FC = () => {
  const { ref: revealRef, inView } = useInView(0.1);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const swiperEl = document.querySelector('.hero-slider');
    if (mediaQuery.matches && swiperEl) {
      const swiperInstance = (swiperEl as any).swiper;
      if (swiperInstance?.autoplay) swiperInstance.autoplay.stop();
    }
  }, []);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setReviews(data as Review[]);
        else setReviews([]);
        setReviewsLoading(false);
      });
  }, []);

  const heroSlides = [
    { image: '/Images/Marigot 1.jpg', alt: 'Scenic view of Marigot Bay, St Lucia', priority: true },
    { image: '/Images/Pitons 1.jpg', alt: 'The iconic Pitons of St Lucia', priority: false },
    { image: '/Images/Viewpoint 3.jpg', alt: 'Panoramic viewpoint overlooking St Lucia coastline', priority: false },
  ];

  return (
    <div>
      <Helmet>
        <title>FUNtastic Taxi &amp; Tours | St. Lucia Airport Transfers &amp; Island Tours</title>
        <meta name="description" content="Private airport transfers, island tours and taxi service in St. Lucia. Book online instantly with FUNtastic — St. Lucia's local taxi and tour experts." />
        <meta property="og:title" content="FUNtastic Taxi & Tours | St. Lucia Airport Transfers & Island Tours" />
        <meta property="og:url" content="https://funtastictaxiandtours.netlify.app/" />
      </Helmet>

      {/* Hero Section */}
      <section
        className="relative flex flex-col justify-end"
        style={{ height: 'calc(100vh - var(--header-height))', minHeight: '600px' }}
      >
        <Swiper
          className="hero-slider absolute inset-0 z-0"
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          speed={1000}
          autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          navigation={{ enabled: true, prevEl: '.hero-prev', nextEl: '.hero-next' }}
          pagination={{ enabled: true, clickable: true, el: '.hero-pagination', bulletClass: 'hero-bullet', bulletActiveClass: 'hero-bullet-active' }}
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index} className="!h-full">
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover"
                loading={slide.priority ? 'eager' : 'lazy'}
                decoding={slide.priority ? 'sync' : 'async'}
                fetchPriority={slide.priority ? 'high' : 'low'}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Single gradient overlay above slides, below content */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(27,42,74,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%)' }}
        />

        {/* Slider navigation — outside Swiper so they sit above the gradient */}
        <div className="hidden md:block">
          <button
            className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-[2] bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronDown className="w-6 h-6 text-white rotate-90" />
          </button>
          <button
            className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-[2] bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
            aria-label="Next slide"
          >
            <ChevronDown className="w-6 h-6 text-white -rotate-90" />
          </button>
        </div>
        <div className="hero-pagination absolute bottom-4 left-1/2 -translate-x-1/2 z-[2] flex gap-2" />

        {/* Hero content — anchored bottom-left desktop, bottom-center mobile */}
        <div className="container relative z-[2] pb-8 md:pb-12 w-full">
          <div className="max-w-[720px] mx-auto md:mx-0 text-center md:text-left">
            <h1
              className="font-heading text-white font-bold animate-slide-up"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.15, animationDelay: '200ms', animationFillMode: 'both' }}
            >
              Your St. Lucia Adventure Starts Here
            </h1>
            <p
              className="font-body text-white/90 mt-4 mb-8 animate-slide-up"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', animationDelay: '400ms', animationFillMode: 'both' }}
            >
              Private transfers, island tours &amp; unforgettable experiences with local experts.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Link
                to="/booking"
                className="w-full md:w-auto flex items-center justify-center font-bold transition-all duration-150 bg-yellow text-navy hover:bg-yellow/85 hover:scale-[1.02] animate-slide-up"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.875rem 2rem', fontSize: '1rem', animationDelay: '600ms', animationFillMode: 'both' }}
              >
                Book Your Transfer
              </Link>
              <Link
                to="/services"
                className="w-full md:w-auto flex items-center justify-center font-bold transition-all duration-150 border-2 border-white text-white hover:bg-white/15 animate-slide-up"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.875rem 2rem', fontSize: '1rem', animationDelay: '700ms', animationFillMode: 'both' }}
              >
                Explore Tours
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Services Overview */}
      <section className="section bg-gray-50">
        <div className="container">
          <SectionHeading
            title="How Would You Like to Explore St. Lucia?"
            subtitle="Every journey is private, personal and unforgettable."
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HomepageServiceCard
              title="Airport Transfers"
              description="Private pickup from Hewanorra or George F. Charles airport"
              image="/Images/UVF Airport.jpg"
              imageAlt="Hewanorra International Airport St. Lucia airport transfer"
              link="/booking"
              badge="Most Popular"
            />
            <HomepageServiceCard
              title="Island Tours"
              description="Explore the Pitons, Soufriere, waterfalls and hidden gems"
              image="/Images/Pitons 1.jpg"
              imageAlt="The Pitons St. Lucia UNESCO World Heritage Site island tour"
              link="/services"
            />
            <HomepageServiceCard
              title="Group Charters"
              description="Spacious vehicles for families, wedding parties and groups"
              image="/Images/Jojo 1.jpg"
              imageAlt="Group charter taxi St. Lucia family and wedding transport"
              link="/booking"
            />
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center justify-center bg-turquoise text-white font-bold rounded-full hover:bg-turquoise-dark transition-colors duration-150"
              style={{ padding: '0.875rem 2.5rem' }}
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us — Stats + Review Teaser */}
      <div
        ref={revealRef as React.RefObject<HTMLDivElement>}
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
        }}
      >
        <section className="section" style={{ background: 'var(--color-bg-soft)', paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="container">
            <SectionHeading
              title="Why Travelers Choose FUNtastic"
              subtitle="St. Lucia's most trusted private taxi and tour service."
              align="center"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
              {[
                { Icon: SmilePlus, number: '500+', title: 'Happy Travelers', desc: 'Trusted by visitors from around the world' },
                { Icon: Award, number: '10+', title: 'Years Experience', desc: 'Local experts who know every corner of St. Lucia' },
                { Icon: Clock, number: '24/7', title: 'Always Available', desc: 'Day or night — we are ready for your arrival' },
                { Icon: ShieldCheck, number: '100%', title: 'Licensed & Insured', desc: 'Fully government-approved operator' },
              ].map(({ Icon, number, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center"
                  style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '2rem 1.5rem',
                  }}
                >
                  <Icon className="text-turquoise mb-3" style={{ width: '2.5rem', height: '2.5rem' }} />
                  <span
                    className="font-heading font-bold text-navy"
                    style={{ fontSize: '2.5rem', lineHeight: 1.1 }}
                  >
                    {number}
                  </span>
                  <span
                    className="font-heading font-bold text-navy"
                    style={{ fontSize: '1rem', marginBottom: '0.25rem', marginTop: '0.25rem' }}
                  >
                    {title}
                  </span>
                  <span
                    className="font-body"
                    style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}
                  >
                    {desc}
                  </span>
                </div>
              ))}
            </div>

            {/* Review Teaser */}
            {(reviewsLoading || (reviews && reviews.length > 0)) && (
              <div>
                <h3
                  className="font-heading font-bold text-navy text-center"
                  style={{ fontSize: '1.5rem', marginTop: '3rem', marginBottom: '1.5rem' }}
                >
                  What Our Travelers Say
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem' }}>
                  {reviewsLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="animate-pulse"
                          style={{
                            background: '#e5e7eb',
                            borderRadius: 'var(--radius-lg)',
                            height: '180px',
                          }}
                        />
                      ))
                    : reviews!.map((review) => {
                        const badgeClass = sourceBadgeClass[review.source ?? ''] ?? 'bg-gray-400 text-white';
                        const thumb = review.image_urls?.[0];
                        return (
                          <div
                            key={review.id}
                            className="relative flex flex-col"
                            style={{
                              background: '#fff',
                              borderRadius: 'var(--radius-lg)',
                              boxShadow: 'var(--shadow-card)',
                              padding: '1.5rem',
                            }}
                          >
                            {/* Source badge */}
                            {review.source && (
                              <span
                                className={`absolute top-4 right-4 font-body text-xs font-medium rounded-full px-2 py-0.5 ${badgeClass}`}
                              >
                                {review.source}
                              </span>
                            )}

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  style={{ color: i < review.rating ? 'var(--color-yellow)' : '#D1D5DB', fontSize: '1rem' }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>

                            {/* Comment */}
                            <p
                              className="font-body flex-1"
                              style={{
                                fontSize: '0.925rem',
                                color: 'var(--color-text-secondary)',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                marginBottom: '1rem',
                              } as React.CSSProperties}
                            >
                              {review.comment}
                            </p>

                            {/* Reviewer */}
                            <div className="flex items-center gap-2 mt-auto">
                              {thumb && (
                                <img
                                  src={thumb}
                                  alt={review.reviewer_name}
                                  className="rounded-full object-cover flex-shrink-0"
                                  style={{ width: '40px', height: '40px' }}
                                  loading="lazy"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-heading font-bold text-navy text-sm truncate">{review.reviewer_name}</p>
                                {review.location && (
                                  <p
                                    className="font-body text-xs truncate"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    {review.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                </div>

                {/* Read All Reviews button */}
                <div className="text-center" style={{ marginTop: '2rem' }}>
                  <Link
                    to="/reviews"
                    className="inline-flex items-center justify-center font-body font-medium text-turquoise border-turquoise hover:bg-turquoise-light transition-colors duration-150"
                    style={{
                      border: '2px solid var(--color-teal)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.75rem 2rem',
                    }}
                  >
                    Read All Reviews
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Call to Action */}
      <section
        className="relative overflow-hidden"
        style={{ padding: '5rem 1.5rem', minHeight: '320px' }}
      >
        <img
          src="/Images/Pitons 1.jpg"
          alt="The iconic Pitons of St Lucia"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(27,42,74,0.80)', zIndex: 1 }}
        />
        <div className="container relative text-center" style={{ zIndex: 2 }}>
          <h2
            className="font-heading text-white font-bold text-center"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}
          >
            Ready to Experience the Real St. Lucia?
          </h2>
          <p
            className="font-body text-center"
            style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.88)', marginBottom: '2rem' }}
          >
            Book your transfer or tour in minutes. Your adventure is waiting.
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center justify-center font-heading font-bold bg-yellow text-navy hover:bg-yellow/85 hover:scale-[1.02] transition-all duration-150"
            style={{
              fontSize: '1.125rem',
              borderRadius: 'var(--radius-full)',
              padding: '1rem 3rem',
            }}
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
