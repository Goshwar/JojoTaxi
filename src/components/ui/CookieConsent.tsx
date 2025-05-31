import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cc_ok');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cc_ok', 'true');
    setIsVisible(false);
    // TODO: Initialize analytics after consent
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg transform translate-y-0 transition-transform duration-300 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <p className="text-gray-600 mr-8">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <button
            onClick={handleAccept}
            className="btn btn-primary py-2 px-4"
          >
            Accept All
          </button>
          <button
            onClick={() => handleAccept()}
            className="btn btn-outline py-2 px-4"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;