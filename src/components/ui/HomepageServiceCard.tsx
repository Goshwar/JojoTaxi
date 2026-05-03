import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface HomepageServiceCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  badge?: string;
  imageAlt?: string;
}

const HomepageServiceCard: React.FC<HomepageServiceCardProps> = ({ title, description, image, link, badge, imageAlt }) => {
  return (
    <Link
      to={link}
      className="group block relative overflow-hidden h-[240px] md:h-[280px] rounded-lg shadow-card hover:shadow-md transition-shadow"
    >
      {/* Background image */}
      <img
        src={image}
        alt={imageAlt ?? title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06]"
        style={{ transition: 'transform 400ms ease' }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 55%)' }}
      />

      {/* Badge */}
      {badge && (
        <div
          className="absolute top-4 left-4 z-10 font-bold"
          style={{
            background: 'var(--color-yellow)',
            color: 'var(--color-navy)',
            fontSize: '0.7rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {badge}
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ padding: '1.25rem', paddingRight: '3.5rem' }}>
        <h3 className="font-heading text-white font-bold mb-1" style={{ fontSize: '1.2rem' }}>
          {title}
        </h3>
        <p className="font-body truncate" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div
        className="absolute z-10 text-white group-hover:translate-x-1"
        style={{ bottom: '1.25rem', right: '1.25rem', transition: 'transform 250ms ease' }}
      >
        <ArrowRight size={18} />
      </div>
    </Link>
  );
};

export default HomepageServiceCard;
