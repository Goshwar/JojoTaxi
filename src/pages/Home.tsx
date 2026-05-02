import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, MapPin, Clock, ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SectionHeading from '../components/ui/SectionHeading';
import ServiceCard from '../components/ui/ServiceCard';
import { useBooking } from '../contexts/BookingContext';

const Home: React.FC = () => {
  const { openModal } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const swiperEl = document.querySelector('.hero-slider');
    if (mediaQuery.matches && swiperEl) {
      const swiperInstance = (swiperEl as any).swiper;
      if (swiperInstance?.autoplay) swiperInstance.autoplay.stop();
    }
  }, []);

  const handleBookNow = () => {
    if (window.innerWidth < 768) navigate('/booking');
    else openModal();
  };

  const heroSlides = [
    { image: '/Images/Marigot 1.jpg', alt: 'Scenic view of Marigot Bay, St Lucia', priority: true },
    { image: '/Images/Pitons 1.jpg', alt: 'The iconic Pitons of St Lucia', priority: false },
    { image: '/Images/Viewpoint 3.jpg', alt: 'Panoramic viewpoint overlooking St Lucia coastline', priority: false },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-screen flex items-center">
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
              <div className="relative h-full min-h-[70vh] md:min-h-screen">
                <img
                  src={slide.image} alt={slide.alt}
                  className="h-full w-full object-cover"
                  loading={slide.priority ? 'eager' : 'lazy'}
                  decoding={slide.priority ? 'sync' : 'async'}
                  fetchPriority={slide.priority ? 'high' : 'low'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              </div>
            </SwiperSlide>
          ))}
          <div className="hidden md:block">
            <button className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors" aria-label="Previous slide">
              <ChevronDown className="w-6 h-6 text-white rotate-90" />
            </button>
            <button className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors" aria-label="Next slide">
              <ChevronDown className="w-6 h-6 text-white -rotate-90" />
            </button>
          </div>
          <div className="hero-pagination absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2" />
        </Swiper>

        {/* Content Overlay */}
        <div className="container relative z-10 text-white pt-20">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              Stress-Free Airport Transfers in St. Lucia
            </h1>
            <h3 className="text-xl md:text-2xl mb-8 text-gray-100">
              Flat-rate fares • 24/7 local drivers • Free flight tracking
            </h3>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleBookNow} className="btn btn-cta">
                Book Your Transfer
              </button>
              <Link to="/services" className="btn btn-outline border-white text-white hover:bg-white/20">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section bg-gray-50">
        <div className="container">
          <SectionHeading
            title="Our Services"
            subtitle="Professional transportation solutions for your St. Lucia experience"
            centered={true}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard
              title="Airport → Hotel Transfers"
              description="Professional airport pickup service with flight tracking, meet & greet, and fixed rates. Available 24/7 at both UVF and SLU airports."
              icon={<Car size={24} className="text-turquoise" />}
              link="/services#airport-transfers"
            />
            <ServiceCard
              title="Island Tours"
              description="Discover St. Lucia's beauty with our customized tours. Visit the Pitons, botanical gardens, and hidden gems with our knowledgeable local guides."
              icon={<MapPin size={24} className="text-turquoise" />}
              link="/services#island-tours"
            />
            <ServiceCard
              title="Hourly Charter"
              description="Flexible transportation with your dedicated driver. Perfect for shopping trips, restaurant visits, or creating your own island adventure."
              icon={<Clock size={24} className="text-turquoise" />}
              link="/services#hourly-charter"
            />
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="btn btn-primary">View All Services</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading
                title="Why Choose FUNtastic Taxi & Tours?"
                subtitle="Experience the difference with our premium transportation services"
              />
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Professional Drivers</h3>
                  <p className="text-gray-600">All our drivers are licensed professionals with extensive local knowledge and excellent service standards.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Modern, Comfortable Fleet</h3>
                  <p className="text-gray-600">Travel in style and comfort in our well-maintained, air-conditioned vehicles suitable for all group sizes.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Fixed, Transparent Pricing</h3>
                  <p className="text-gray-600">No hidden fees or surprises. Our rates are fixed and clearly communicated before your journey begins.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">24/7 Availability</h3>
                  <p className="text-gray-600">We're available around the clock for airport pickups, regardless of flight delays or changes to your schedule.</p>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/Images/Waterfall 3.jpg"
                alt="Professional driver welcoming tourists"
                className="rounded-xl shadow-lg w-full h-[400px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-turquoise text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Book Your St. Lucia Transportation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Secure your airport transfer or island tour today and enjoy peace of mind for your St. Lucia trip.
          </p>
          <button onClick={handleBookNow} className="btn btn-cta">
            Book Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
