import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SectionHeading from '../components/ui/SectionHeading';
import FaqItem from '../components/ui/FaqItem';

const categories = [
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
        answer:
          'Transfer prices vary by destination. A private transfer from Hewanorra Airport (UVF) to Rodney Bay ranges from $80–$110 USD per vehicle. Shorter routes to Cap Estate or Gros Islet start from $70 USD. All prices are per vehicle not per person. Visit our Rates & Zones page for full pricing.',
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
  return (
    <div>
      <Helmet>
        <title>FAQ | FUNtastic Taxi &amp; Tours St. Lucia</title>
        <meta name="description" content="Answers to the most common questions about airport transfers, island tours, pricing and booking with FUNtastic Taxi & Tours in St. Lucia." />
        <meta property="og:title" content="FAQ | FUNtastic Taxi & Tours St. Lucia" />
        <meta property="og:url" content="https://funtastictaxiandtours.netlify.app/faq" />
      </Helmet>

      {/* Hero Banner */}
      <section style={{ background: 'var(--color-bg-soft)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about getting around St. Lucia with FUNtastic Taxi & Tours."
            align="center"
          />
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
