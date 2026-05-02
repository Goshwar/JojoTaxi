import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, MessageSquare } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openModal } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = () => {
    setMobileMenuOpen(false);
    if (window.innerWidth < 768) {
      navigate('/booking');
    } else {
      openModal();
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Rates & Zones', path: '/rates-and-zones' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/Images/Logo.png" alt="FUNtastic Taxi & Tours" className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.name}
            </NavLink>
          ))}
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
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-white py-4 px-4 border-t animate-fade-in">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-3 flex items-center justify-between border-t border-gray-100 mt-2">
              <a href="tel:+17584860790" className="flex items-center text-sm text-turquoise">
                <Phone size={16} className="mr-1" /> Call Us
              </a>
              <a href="https://wa.me/17584860790" className="flex items-center text-sm text-turquoise">
                <MessageSquare size={16} className="mr-1" /> WhatsApp
              </a>
              <button onClick={handleBookNow} className="btn btn-cta py-2 px-4 text-sm">
                Book Now
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
