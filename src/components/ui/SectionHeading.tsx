import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  centered?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align,
  centered = false,
}) => {
  const isCentered = align === 'center' || (align === undefined && centered);

  return (
    <div className={`mb-8 ${isCentered ? 'text-center' : ''}`}>
      <h2 className="font-bold text-2xl md:text-3xl mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-lg">
          {subtitle}
        </p>
      )}
      <div className={`h-1 w-20 bg-turquoise mt-4 ${isCentered ? 'mx-auto' : ''}`}></div>
    </div>
  );
};

export default SectionHeading;
