import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ 
  title, 
  subtitle, 
  centered = false 
}) => {
  return (
    <div className={`mb-8 ${centered ? 'text-center' : ''}`}>
      <h2 className="font-bold text-2xl md:text-3xl mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-lg">
          {subtitle}
        </p>
      )}
      <div className={`h-1 w-20 bg-turquoise mt-4 ${centered ? 'mx-auto' : ''}`}></div>
    </div>
  );
};

export default SectionHeading;