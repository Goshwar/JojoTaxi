import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

const WIDGET_ID = 'WID-STLUCIA-123';
const DELAY_TIME = 12000; // 12 seconds
const SCROLL_THRESHOLD = 50; // 50% of page height

const WhatsAppWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load WhatsApp widget script
    const script = document.createElement('script');
    script.src = 'https://static.whatschat.io/widget.js';
    script.async = true;
    script.dataset.widgetId = WIDGET_ID;
    document.body.appendChild(script);

    // Timer for delayed appearance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, DELAY_TIME);

    // Scroll handler
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage >= SCROLL_THRESHOLD) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.body.removeChild(script);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => {
        // Trigger WhatsApp chat with pre-filled message
        const pickup = sessionStorage.getItem('selectedPickup') || '';
        const message = `Hi! I'd like to book a ride from ${pickup}`;
        window.open(`https://wa.me/17584860790?text=${encodeURIComponent(message)}`, '_blank');
      }}
      className="fixed bottom-4 right-4 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-colors z-50"
      aria-label="Open WhatsApp Chat"
    >
      <MessageSquare size={24} />
    </button>
  );
};

export default WhatsAppWidget;