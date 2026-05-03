import React from 'react';
import { Star, ShieldCheck, Zap, MapPin } from 'lucide-react';

const trustItems = [
  {
    icon: <Star size={22} className="text-yellow shrink-0" />,
    bold: '5.0 Rated',
    muted: 'By verified travelers',
  },
  {
    icon: <ShieldCheck size={22} className="text-turquoise shrink-0" />,
    bold: 'Licensed & Insured',
    muted: 'Government approved',
  },
  {
    icon: <Zap size={22} className="text-turquoise shrink-0" />,
    bold: 'Instant Confirmation',
    muted: 'Book in minutes',
  },
  {
    icon: <MapPin size={22} className="text-turquoise shrink-0" />,
    bold: 'St. Lucia Locals',
    muted: 'Born & raised experts',
  },
];

const TrustBar: React.FC = () => (
  <section className="bg-white" style={{ paddingBottom: '1rem' }}>
    <div
      className="mx-auto"
      style={{
        maxWidth: '900px',
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem 2rem',
        marginTop: '-2.5rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
        {trustItems.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 md:px-4${i > 0 ? ' md:border-l' : ''}`}
            style={i > 0 ? { borderColor: 'var(--color-border)' } : {}}
          >
            {item.icon}
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                {item.bold}
              </p>
              <p className="text-xs leading-tight mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {item.muted}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
