import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { useBooking } from '../contexts/BookingContext';

const NAV_ITEMS = [
  { id: 'airport', label: 'Airport Transfers' },
  { id: 'tours', label: 'Island Tours' },
  { id: 'charter', label: 'Hourly Charter' },
  { id: 'hotel-transfers', label: 'Hotel Transfers' },
  { id: 'wedding-transfers', label: 'Wedding Transfers' },
  { id: 'night-out', label: 'Night Out' },
];

const CTAButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center justify-center font-heading font-bold bg-yellow text-navy hover:bg-yellow/85 hover:scale-[1.02] transition-all duration-150 self-start"
    style={{ borderRadius: 'var(--radius-full)', padding: '0.875rem 2rem' }}
  >
    {children}
  </button>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="flex flex-col mb-6" style={{ gap: '0.75rem' }}>
    {items.map(text => (
      <li key={text} className="flex items-center gap-3">
        <CheckCircle size={20} className="text-turquoise flex-shrink-0" />
        <span className="font-body">{text}</span>
      </li>
    ))}
  </ul>
);

const SectionHeadingBlock: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <>
    <h2
      className="font-heading font-bold mb-4"
      style={{ fontSize: '2rem', color: 'var(--color-navy)' }}
    >
      {title}
    </h2>
    <p
      className="font-body mb-6"
      style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}
    >
      {description}
    </p>
  </>
);

const TextCol: React.FC<{ children: React.ReactNode; reverse?: boolean }> = ({ children, reverse }) => (
  <div
    className={`flex flex-col justify-center${reverse ? ' order-2 md:order-1' : ''}`}
    style={{ padding: 'clamp(2rem, 4vw, 3rem)' }}
  >
    {children}
  </div>
);

const ImageCol: React.FC<{ src: string; alt: string; reverse?: boolean }> = ({ src, alt, reverse }) => (
  <div className={`relative overflow-hidden h-[280px] md:h-[420px]${reverse ? ' order-1 md:order-2' : ''}`}>
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[400ms] ease-in-out hover:scale-[1.03]"
      loading="lazy"
    />
  </div>
);

const SwiperCol: React.FC<{ slides: { src: string; alt: string }[]; reverse?: boolean }> = ({ slides, reverse }) => (
  <div className={`relative overflow-hidden h-[280px] md:h-[420px]${reverse ? ' order-1 md:order-2' : ''}`}>
    <Swiper
      modules={[Autoplay, EffectFade]}
      effect="fade"
      speed={1000}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      loop={true}
      className="h-full w-full"
    >
      {slides.map(({ src, alt }) => (
        <SwiperSlide key={src}>
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

const Services: React.FC = () => {
  const { openModal } = useBooking();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('airport');

  const handleBookNow = () => {
    if (window.innerWidth < 768) navigate('/booking');
    else openModal();
  };

  const scrollToSection = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 72 + 53;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div>
      <Helmet>
        <title>Our Services | FUNtastic Taxi &amp; Tours St. Lucia</title>
        <meta name="description" content="Airport transfers, island tours, hotel transfers, group charters and wedding transportation in St. Lucia. All private, all bookable online." />
        <meta property="og:title" content="Our Services | FUNtastic Taxi & Tours St. Lucia" />
        <meta property="og:url" content="https://funtastictaxiandtours.netlify.app/services" />
      </Helmet>

      {/* Hero Banner */}
      <section
        className="relative bg-cover bg-center"
        style={{
          backgroundImage: 'url("/Images/Waterfall 1.jpg")',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(27,42,74,0.75)' }} />
        <div className="container relative z-10 text-center animate-fade-in">
          <h1
            className="font-heading font-bold text-white text-center"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', lineHeight: 1.15 }}
          >
            Our Services
          </h1>
          <p
            className="font-body text-center mx-auto mt-4"
            style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.88)', maxWidth: '600px' }}
          >
            Private transfers, island tours and charters across St. Lucia — all bookable online.
          </p>
        </div>
      </section>

      {/* Sticky Anchor Navigation */}
      <nav
        className="bg-white border-b"
        style={{
          position: 'sticky',
          top: '72px',
          zIndex: 40,
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap' }}
        >
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="font-body flex-shrink-0 transition-colors"
              style={{
                fontSize: '0.9rem',
                padding: '1rem 1.25rem',
                color: activeId === id ? '#00B8B8' : 'var(--color-text-secondary)',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeId === id ? '2px solid #00B8B8' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* 1 — Airport Transfers */}
      <section id="airport" className="py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
          <ImageCol src="/Images/SLU Airport.jpg" alt="George F. Charles Airport St. Lucia transfer service" />
          <TextCol>
            <SectionHeadingBlock
              title="Airport Transfers"
              description="Start your St. Lucia vacation stress-free with our reliable airport transfer service. We provide professional pickup and drop-off at both Hewanorra International Airport (UVF) and George F.L. Charles Airport (SLU). Our service includes flight monitoring, meet & greet, and fixed rates with no hidden fees."
            />
            <BulletList items={['24/7 service with free flight monitoring', 'Vehicles for all group sizes', 'Fixed rates, no hidden fees']} />
            <CTAButton onClick={handleBookNow}>Book Airport Transfer</CTAButton>
          </TextCol>
        </div>
      </section>

      {/* 2 — Island Tours */}
      <section id="tours" className="py-12 md:py-20 overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
          <TextCol reverse>
            <SectionHeadingBlock
              title="Island Tours"
              description="Discover the natural beauty and cultural richness of St. Lucia with our customized island tours. From the iconic Pitons to hidden gems off the beaten path, our knowledgeable guides will show you the best of our island paradise. Choose from half-day or full-day tours tailored to your interests."
            />
            <BulletList items={['Visit iconic landmarks and hidden gems', 'Flexible scheduling and customizable routes', 'Private tours with expert local guides']} />
            <CTAButton onClick={handleBookNow}>Book Island Tour</CTAButton>
          </TextCol>
          <SwiperCol
            reverse
            slides={[
              { src: '/Images/Marigot 1.jpg', alt: 'Marigot Bay St. Lucia island tour' },
              { src: '/Images/Waterfall 1.jpg', alt: 'Waterfall in St. Lucia rainforest tour' },
              { src: '/Images/Waterfall 4.jpg', alt: 'Waterfall experience St. Lucia rainforest' },
              { src: '/Images/Jojo 3.jpg', alt: 'FUNtastic Taxi island tour St. Lucia' },
              { src: '/Images/Viewpoint 1.jpg', alt: 'Scenic viewpoint overlooking St. Lucia coastline' },
            ]}
          />
        </div>
      </section>

      {/* 3 — Hourly Charter */}
      <section id="charter" className="py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
          <SwiperCol
            slides={[
              { src: '/Images/Viewpoint 2.jpg', alt: 'Panoramic viewpoint St. Lucia' },
              { src: '/Images/Pitons 1.jpg', alt: 'The Pitons St. Lucia UNESCO World Heritage Site' },
              { src: '/Images/Jojo 1.jpg', alt: 'FUNtastic Taxi group charter St. Lucia' },
              { src: '/Images/Waterfall 3.jpg', alt: 'Waterfall visit St. Lucia rainforest' },
            ]}
          />
          <TextCol>
            <SectionHeadingBlock
              title="Hourly Charter Service"
              description="Need flexible transportation for shopping, dining, or exploring at your own pace? Our hourly charter service gives you the freedom to create your own itinerary with a dedicated driver at your disposal. Perfect for those who want to explore St. Lucia on their own terms."
            />
            <BulletList items={['Minimum 4-hour booking', 'Choice of comfortable vehicles', 'Perfect for groups and families']} />
            <CTAButton onClick={handleBookNow}>Book Hourly Charter</CTAButton>
          </TextCol>
        </div>
      </section>

      {/* 4 — Hotel Transfers */}
      <section id="hotel-transfers" className="py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
          <ImageCol src="/Images/Viewpoint 3.jpg" alt="St. Lucia hotel transfer service" />
          <TextCol>
            <SectionHeadingBlock
              title="Hotel Transfers"
              description="Comfortable, air-conditioned private transfers between any hotel or resort on the island. Whether you are moving between properties or heading out for the day, we handle the journey so you can relax."
            />
            <BulletList items={['Direct door-to-door service', 'All hotels and resorts covered', 'Fixed rates, no surprises']} />
            <CTAButton onClick={handleBookNow}>Book Hotel Transfer</CTAButton>
          </TextCol>
        </div>
      </section>

      {/* 5 — Wedding Transfers */}
      <section id="wedding-transfers" className="py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
          <ImageCol src="/Images/Lexus_1.jpg" alt="Wedding vehicle St. Lucia" />
          <TextCol>
            <SectionHeadingBlock
              title="Wedding Transfers"
              description="Elegant, punctual transportation for your most important day. We coordinate with your wedding planner to ensure every guest, bridal party member, and family arrival is perfectly timed and stress-free."
            />
            <BulletList items={['Bridal party and guest transportation', 'Decorated vehicles available on request', 'Punctual and professionally presented drivers']} />
            <CTAButton onClick={handleBookNow}>Book Wedding Transfer</CTAButton>
          </TextCol>
        </div>
      </section>

      {/* 6 — Night Out */}
      <section id="night-out" className="py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
          <ImageCol src="/Images/Marigot 1.jpg" alt="Night out transport St. Lucia" />
          <TextCol>
            <SectionHeadingBlock
              title="Night Out"
              description="Enjoy St. Lucia's restaurants, bars and events without worrying about the drive home. Our reliable night-out service keeps you safe and gets you back to your hotel comfortably."
            />
            <BulletList items={['Safe, reliable late-night pickups', 'Available island-wide', 'Advance and on-demand bookings']} />
            <CTAButton onClick={handleBookNow}>Book Night Out Transfer</CTAButton>
          </TextCol>
        </div>
      </section>

      {/* CTA Band */}
      <section
        className="relative overflow-hidden"
        style={{ padding: '5rem 1.5rem', minHeight: '320px', display: 'flex', alignItems: 'center' }}
      >
        <img
          src="/Images/Pitons 1.jpg"
          alt="The iconic Pitons of St Lucia"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
          loading="lazy"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(27,42,74,0.80)', zIndex: 1 }} />
        <div className="container relative text-center" style={{ zIndex: 2 }}>
          <h2
            className="font-heading text-white font-bold text-center"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem' }}
          >
            Ready to Book Your St. Lucia Experience?
          </h2>
          <p
            className="font-body text-center mx-auto"
            style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.88)', marginBottom: '2rem' }}
          >
            All transfers and tours are private, comfortable and bookable in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleBookNow}
              className="inline-flex items-center justify-center font-heading font-bold bg-yellow text-navy hover:bg-yellow/85 hover:scale-[1.02] transition-all duration-150"
              style={{ borderRadius: 'var(--radius-full)', padding: '0.875rem 2rem' }}
            >
              Book Now
            </button>
            <a
              href="https://wa.me/17584860790"
              className="inline-flex items-center justify-center font-heading font-bold text-white hover:bg-white/10 hover:scale-[1.02] transition-all duration-150"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.875rem 2rem',
                border: '2px solid white',
              }}
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
