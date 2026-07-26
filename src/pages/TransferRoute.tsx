import React from 'react';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Seo from '../components/ui/Seo';
import JsonLd from '../components/ui/JsonLd';
import { transferRouteSchema, breadcrumbSchema } from '../lib/schema';
import { useBooking } from '../contexts/BookingContext';
import { RATES_UPDATED } from '../data/zones';
import {
  findTransferRoute,
  routeFare,
  routeRoundTripFare,
  AIRPORT_NAMES,
} from '../data/transferRoutes';

/**
 * Landing page for one airport-transfer corridor, e.g. UVF to Rodney Bay.
 * Rendered from data so every corridor gets identical structure, schema and
 * pricing sourced from the zone table.
 */
const TransferRoute: React.FC = () => {
  const { slug } = useParams();
  const route = findTransferRoute(slug);
  const { openModal } = useBooking();
  const navigate = useNavigate();

  if (!route) return <Navigate to="/rates-and-zones" replace />;

  const airportName = AIRPORT_NAMES[route.airport];
  const fare = routeFare(route);
  const roundTrip = routeRoundTripFare(route);
  const title = `${airportName} to ${route.destination} Transfer | FUNtastic Taxi & Tours`;

  const handleBookNow = () => {
    if (window.innerWidth < 768) navigate('/booking');
    else openModal();
  };

  return (
    <div>
      <Seo
        title={title}
        description={`Private taxi transfer from ${airportName} to ${route.destination}, St. Lucia. ${`$${fare}`} one-way per vehicle. Flight monitoring, meet and greet, fixed price with no hidden fees.`}
        path={`/airport-transfers/${route.slug}`}
      />
      <JsonLd
        data={[
          transferRouteSchema({
            destination: route.destination,
            slug: route.slug,
            airportName,
            fare,
            intro: route.intro,
          }),
          breadcrumbSchema([
            { name: 'Rates & Zones', path: '/rates-and-zones' },
            { name: `${route.airport} to ${route.destination}`, path: `/airport-transfers/${route.slug}` },
          ]),
        ]}
      />

      <section className="bg-turquoise/10 py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {airportName} to {route.destination}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Private, fixed-price transfers — {`$${fare}`} one-way per vehicle
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Fare summary. Units and currency are spelled out so neither a
              reader nor an AI engine can mistake this for a per-person price. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="card text-center py-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">One-way</p>
              <p className="text-3xl font-bold text-turquoise">{`$${fare}`}</p>
              <p className="text-sm text-gray-500">USD per vehicle</p>
            </div>
            <div className="card text-center py-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Round trip</p>
              <p className="text-3xl font-bold text-turquoise">{`$${roundTrip}`}</p>
              <p className="text-sm text-gray-500">USD per vehicle (10% off)</p>
            </div>
            <div className="card text-center py-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Journey</p>
              <p className="text-3xl font-bold text-turquoise">
                {route.duration ?? 'Private'}
              </p>
              <p className="text-sm text-gray-500">
                {route.distance ?? 'Direct, no shared shuttle'}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-8" style={{ lineHeight: 1.8 }}>
            {route.intro}
          </p>

          <h2 className="text-2xl font-bold mb-4">What’s included</h2>
          <ul className="flex flex-col mb-10" style={{ gap: '0.75rem' }}>
            {route.highlights.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-turquoise flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-gray-600 mb-8">
            Fares include the driver, vehicle, fuel, taxes and bottled water. Prices are in
            US dollars per vehicle, not per person, and were last updated {RATES_UPDATED}.
            See the <Link to="/rates-and-zones" className="text-turquoise underline">full zone pricing table</Link>{' '}
            for every destination, or read the <Link to="/faq" className="text-turquoise underline">FAQ</Link>{' '}
            for answers on flight delays, cancellations and payment.
          </p>

          <div className="text-center">
            <button onClick={handleBookNow} className="btn btn-cta">
              Book this transfer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransferRoute;
