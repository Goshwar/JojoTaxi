import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  location: string;
  testimonial: string;
  rating: number;
  photos?: string[];
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  name, 
  location, 
  testimonial, 
  rating,
  photos 
}) => {
  return (
    <div className="card">
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < rating ? 'fill-yellow text-yellow' : 'text-gray-300'}
          />
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">{testimonial}</p>
      
      {/* Photo grid */}
      {photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {photos.map((photo, index) => (
            <a 
              key={index}
              href={photo}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={photo}
                alt={`Review photo ${index + 1} by ${name}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-gray-500 text-sm">{location}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;