import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import FaqItem from '../components/ui/FaqItem';
import Seo from '../components/ui/Seo';
import JsonLd from '../components/ui/JsonLd';
import { faqPageSchema, breadcrumbSchema } from '../lib/schema';
import { discountLabel } from '../data/zones';
import { useLiveZones, type LivePricing } from '../hooks/useLiveZones';

/**
 * The "how much does a transfer cost" answer, derived from the zone table.
 *
 * This answer used to be hardcoded, and had already drifted: it quoted
 * "$80–$110" for UVF to Rodney Bay against a zone price of $100, and offered
 * "Cap Estate or Gros Islet start from $70" for areas that sit in the same
 * $100 zone as Rodney Bay. It is also the single most-quoted answer on the
 * site — it feeds the FAQPage schema that AI engines read — so a wrong number
 * here is a wrong number in someone's travel plan. Deriving it means editing a
 * zone price in the admin dashboard corrects this sentence too.
 */
const priceAnswer = ({ zones, roundTripDiscount, ratesUpdated }: LivePricing): string => {
  if (!zones.length) {
    return 'Transfer prices are fixed by destination zone and quoted per vehicle, not per person. See our Rates & Zones page for the current table.';
  }

  /** 'Rodney Bay, Gros Islet, Cap Estate' → '…, Gros Islet and Cap Estate'. */
  const readable = (areas: string): string => {
    const parts = areas.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return areas;
    return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  };

  const cheapestUvf = Math.min(...zones.map((z) => z.uvf));
  const cheapestSlu = Math.min(...zones.map((z) => z.slu));
  const dearest = zones.reduce((a, b) => (b.uvf > a.uvf ? b : a));

  return (
    `Transfer prices are fixed by destination zone and quoted per vehicle, not per person. ` +
    `From Hewanorra Airport (UVF) in the south, one-way fares run from $${cheapestUvf} for the ` +
    `nearest areas up to $${dearest.uvf} for ${readable(dearest.areas)}. From George F. L. Charles Airport ` +
    `(SLU) in Castries they start at $${cheapestSlu}. Round trips are ${discountLabel(roundTripDiscount)} ` +
    `off two one-way fares. Rates last updated ${ratesUpdated} — visit our Rates & Zones page for the full table.`
  );
};

const buildCategories = (pricing: LivePricing) => [
  {
    title: 'Airport Transfers',
    items: [
      {
        question: 'How far is Hewanorra International Airport from Rodney Bay?',
        answer:
          'Hewanorra International Airport (UVF) is located in Vieux Fort in the south of St. Lucia, approximately 60–70km from Rodney Bay in the north. The drive typically takes 60–90 minutes depending on traffic. We provide comfortable, air-conditioned private transfers on this route every day of the year.',
      },
      {
        question: 'Do you monitor my flight for delays?',
        answer:
          'Yes — we track all incoming flights in real time. If your flight is delayed, we automatically adjust your pickup time so your driver will still be waiting when you land. There is no extra charge for flight delays or early arrivals.',
      },
      {
        question: 'What happens if I need to cancel my booking?',
        answer:
          'We accept cancellations up to 24 hours before your scheduled pickup for a full refund. For last-minute changes please contact us directly on WhatsApp and we will do our best to accommodate you.',
      },
      {
        question: 'Do you offer meet and greet service at the airport?',
        answer:
          'Yes. Your driver will be waiting in the arrivals hall holding a sign with your name. We also offer fast-track airport assistance to help guide you through the terminal quickly after a long flight.',
      },
    ],
  },
  {
    title: 'Island Tours',
    items: [
      {
        question: 'What tours do you offer in St. Lucia?',
        answer:
          "We offer private island tours covering St. Lucia's most iconic attractions — the Pitons UNESCO World Heritage Site, Sulphur Springs volcano and mud baths in Soufriere, Diamond Botanical Gardens, Marigot Bay, and the stunning waterfalls of the island interior. All tours are private and fully customizable to your group.",
      },
      {
        question: 'How long is the Soufriere and Pitons tour?',
        answer:
          'The full Soufriere day tour typically runs 8–10 hours including all stops. We pick you up from your hotel or resort, drive down the scenic west coast to Soufriere, visit the key attractions, and return by late afternoon. A shorter half-day option is also available.',
      },
      {
        question: 'Can I customize my island tour itinerary?',
        answer:
          'Absolutely. All our tours are private so the itinerary is entirely up to you. Tell us which attractions you want to visit, any activities you want to include like snorkeling or rum tasting, and your available time — we will build the perfect tour around you.',
      },
    ],
  },
  {
    title: 'Pricing & Payment',
    items: [
      {
        question: 'How much does an airport transfer cost in St. Lucia?',
        answer: priceAnswer(pricing),
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept US Dollars (cash), Eastern Caribbean Dollars, and major credit and debit cards. Payment can be made on arrival or in advance when booking online. There are no hidden fees — the price you see is the price you pay.',
      },
      {
        question: 'Are there any hidden charges or extra fees?',
        answer:
          'No. Our prices include the driver, vehicle, fuel, and air conditioning. Optional extras like guided commentary or additional stops on a tour may have added costs which we always discuss and agree upfront before confirming your booking.',
      },
    ],
  },
  {
    title: 'Booking',
    items: [
      {
        question: 'How far in advance should I book?',
        answer:
          'We recommend booking at least 24 hours in advance to guarantee your preferred vehicle and time slot. For peak travel periods like Christmas, New Year, and carnival season, booking 48–72 hours ahead is advisable. Last-minute bookings are accepted subject to availability.',
      },
      {
        question: 'Can I change or cancel my booking?',
        answer:
          'Yes. Changes can be made up to 24 hours before your pickup at no charge. Cancellations made 24+ hours in advance receive a full refund. For same-day changes please message us on WhatsApp and we will do everything we can to help.',
      },
      {
        question: 'How will I receive my booking confirmation?',
        answer:
          "After completing your booking you will receive an email confirmation with all your trip details. We will also send a WhatsApp message with your driver's name and contact number approximately 2 hours before your pickup time.",
      },
    ],
  },
  {
    title: 'About St. Lucia',
    items: [
      {
        question: 'What is the best time of year to visit St. Lucia?',
        answer:
          'St. Lucia is beautiful year-round. The dry season from December to May offers the most sunshine and is the most popular time to visit. The wetter months of June to November bring lush green landscapes and fewer crowds. The island rarely experiences severe weather and temperatures stay warm throughout the year.',
      },
      {
        question: 'What are the must-see attractions in St. Lucia?',
        answer:
          'The top attractions include the Pitons (UNESCO World Heritage twin peaks), Sulphur Springs drive-in volcano in Soufriere, Diamond Botanical Gardens and waterfall, Marigot Bay, the Tet Paul Nature Trail with Pitons views, and the beautiful beaches of Reduit and Anse Chastanet.',
      },
      {
        question: 'How do I get from the airport to my hotel in St. Lucia?',
        answer:
          'The best and most comfortable option is a private transfer with FUNtastic. We meet you at Hewanorra International Airport (UVF) or George F. Charles Airport (SLU) and drive you directly to your hotel or resort anywhere on the island. No shared shuttles, no waiting — just a private, air-conditioned ride.',
      },
    ],
  },
];

const Faq: React.FC = () => {
  // Same source as the rates table, so the FAQ answer and the price a visitor
  // sees one click away cannot disagree.
  const pricing = useLiveZones();
  const categories = useMemo(() => buildCategories(pricing), [pricing]);

  return (
    <div>
      <Seo
        title="FAQ | FUNtastic Taxi & Tours St. Lucia"
        description="Answers to the most common questions about airport transfers, island tours, pricing and booking with FUNtastic Taxi & Tours in St. Lucia."
        path="/faq"
      />
      {/* Generated from the same `categories` data the page renders, so the
          schema can never drift from the visible answers. */}
      <JsonLd data={[faqPageSchema(categories), breadcrumbSchema([{ name: 'FAQ', path: '/faq' }])]} />

      {/* Hero Banner */}
      <section style={{ background: 'var(--color-bg-soft)', padding: '4rem 1.5rem' }}>
        {/* A real <h1>, not SectionHeading (which renders <h2>): this page had
            no top-level heading, leaving the site's most-cited page without
            one. Markup mirrors the hero on the other public pages. */}
        <div style={{ maxWidth: '860px', margin: '0 auto' }} className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about getting around St. Lucia with FUNtastic Taxi &amp; Tours.
          </p>
          <div className="h-1 w-20 bg-turquoise mt-4 mx-auto" />
        </div>
      </section>

      {/* FAQ Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {categories.map((category) => (
          <div key={category.title}>
            {/* Category heading with teal accent bar */}
            <h2
              className="font-heading"
              style={{
                color: 'var(--color-navy)',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                marginTop: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '3px',
                  height: '16px',
                  background: 'var(--color-teal)',
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              />
              {category.title}
            </h2>

            {/* FaqItems wrapped with teal left border */}
            <div
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
              }}
            >
              {category.items.map((item) => (
                <div
                  key={item.question}
                  style={{ borderLeft: '3px solid var(--color-teal)', paddingLeft: '0.5rem' }}
                >
                  <FaqItem question={item.question} answer={item.answer} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div
          style={{
            background: 'var(--color-bg-soft)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            marginTop: '3rem',
            textAlign: 'center',
          }}
        >
          <h2
            className="font-heading"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              marginBottom: '0.75rem',
            }}
          >
            Still have questions?
          </h2>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              marginBottom: '1.5rem',
            }}
          >
            We are happy to help. Book directly and our team will answer everything.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <Link
              to="/booking"
              style={{
                background: 'var(--color-yellow)',
                color: 'var(--color-navy)',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                padding: '0.875rem 2rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Book Now
            </Link>
            <a
              href="https://wa.me/17584860790"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: '2px solid var(--color-teal)',
                color: 'var(--color-teal)',
                borderRadius: 'var(--radius-full)',
                padding: '0.875rem 2rem',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: 500,
                background: 'transparent',
              }}
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
