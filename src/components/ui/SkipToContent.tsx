import React from 'react';

const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#005FCC] text-white px-4 py-2 z-50 rounded-lg shadow-md"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;