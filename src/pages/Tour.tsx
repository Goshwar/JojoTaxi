import React from 'react';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin } from 'lucide-react';
import Seo from '../components/ui/Seo';
import JsonLd from '../components/ui/JsonLd';
import { tourSchema, breadcrumbSchema } from '../lib/schema';
import { useBooking } from '../contexts/BookingContext';
import { findTour } from '../data/tours';

/**
 * Landing page for a single island tour. No price is shown: there is no
 * published tour price list to source from, and an invented figure would
 * reach both customers and AI engines. See src/data/tours.ts.
 */
const Tour: React.FC = () => {
  const { slug } = useParams();
  const tour = findTour(slug);
  const { openModal } = useBooking();
  const navigate = useNavigate();

  if (!tour) return <Navigate to="/services" replace />;

  const handleBookNow = () => {
    if (window.innerWidth < 768) navigate('/booking');
    else openModal();
  };

  return (
    <div>
      <Seo
        title={`${tour.name} | FUNtastic Taxi & Tours St. Lucia`}
        description={`${tour.name} in St. Lucia — private, fully customisable${tour.duration ? `, ${tour.duration}` : ''}. Hotel pickup anywhere on the island with a local driver-guide.`}
        path={`/tours/${tour.slug}`}
      />
      <JsonLd
        data={[
          tourSchema({
            name: tour.name,
            slug: tour.slug,
            intro: tour.intro,
            stops: tour.stops,
          }),
          breadcrumbSchema([
            { name: 'Services', path: '/services' },
            { name: tour.name, path: `/tours/${tour.slug}` },
          ]),
        ]}
      />

      <section className="bg-turquoise/10 py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{tour.name}</h1>
          {tour.duration && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{tour.duration}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <p className="text-gray-700 mb-10" style={{ lineHeight: 1.8 }}>
            {tour.intro}
          </p>

          <h2 className="text-2xl font-bold mb-4">Where we go</h2>
          <ul className="flex flex-col mb-10" style={{ gap: '0.75rem' }}>
            {tour.stops.map((stop) => (
              <li key={stop} className="flex items-start gap-3">
                <MapPin size={20} className="text-turquoise flex-shrink-0 mt-1" />
                <span>{stop}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mb-4">What’s included</h2>
          <ul className="flex flex-col mb-10" style={{ gap: '0.75rem' }}>
            {tour.includes.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-turquoise flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-gray-600 mb-8">
            Every tour is private and built around your group, so the itinerary and timing
            are yours to set. Tell us what you would like to see and we will price it for
            you — see the <Link to="/faq" className="text-turquoise underline">FAQ</Link> for
            what to expect, or browse <Link to="/services" className="text-turquoise underline">all our services</Link>.
          </p>

          <div className="text-center">
            <button onClick={handleBookNow} className="btn btn-cta">
              Enquire about this tour
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tour;
