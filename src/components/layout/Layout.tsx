import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useBooking } from '../../contexts/BookingContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { openModal } = useBooking();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';

  const handleBookNow = () => {
    if (window.innerWidth < 768) navigate('/booking');
    else openModal();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />

      {/* Floating Book Now — mobile only, hidden on homepage */}
      {!isHomePage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-4"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleBookNow}
            className="w-full py-4 rounded-2xl bg-[#00B8B8] text-white font-bold text-lg shadow-lg hover:bg-[#00B8B8]/90 transition-colors"
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
