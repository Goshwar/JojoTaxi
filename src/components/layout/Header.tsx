import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Menu, X, MessageSquare } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useScrolled } from '../../hooks/useScrolled';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Rates & Zones', path: '/rates-and-zones' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'FAQ', path: '/faq' },
];

const Header: React.FC = () => {
  const isScrolled = useScrolled();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openModal } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBookNow = () => {
    setMobileMenuOpen(false);
    if (window.innerWidth < 768) {
      navigate('/booking');
    } else {
      openModal();
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 py-4"
      style={{
        background: isScrolled ? 'var(--color-white)' : 'transparent',
        boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
        transition: 'all var(--transition-base)',
      }}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/Images/Logo.png" alt="FUNtastic Taxi and Tours St. Lucia logo" className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 text-sm font-medium"
                style={{
                  color: isActive ? 'var(--color-teal)' : undefined,
                  borderBottom: isActive
                    ? '2px solid var(--color-teal)'
                    : '2px solid transparent',
                  transition: `color var(--transition-fast)`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-teal)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = '';
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center space-x-4">
          <a href="tel:+17584860790" className="text-turquoise hover:text-turquoise/80">
            <Phone size={20} />
          </a>
          <a href="https://wa.me/17584860790" className="text-turquoise hover:text-turquoise/80">
            <MessageSquare size={20} />
          </a>
          <button onClick={handleBookNow} className="btn btn-cta">
            Book Now
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-gray-800"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile full-screen overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay lg:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(27,42,74,0.97)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              color: 'white',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={32} />
          </button>

          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: 'white',
                  fontSize: '1.75rem',
                  lineHeight: 3,
                  textDecoration: 'none',
                }}
              >
                {link.name}
              </Link>
            ))}

            <div
              style={{
                display: 'flex',
                gap: '2rem',
                marginTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.15)',
                paddingTop: '1.5rem',
              }}
            >
              <a
                href="tel:+17584860790"
                style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Phone size={16} /> Call Us
              </a>
              <a
                href="https://wa.me/17584860790"
                style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MessageSquare size={16} /> WhatsApp
              </a>
            </div>

            <button
              onClick={handleBookNow}
              className="btn btn-cta"
              style={{ marginTop: '1.5rem' }}
            >
              Book Now
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
