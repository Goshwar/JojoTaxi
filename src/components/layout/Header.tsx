import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Phone, Menu, X, MessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Fleet', path: '/fleet' },
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
          <span className="text-2xl font-heading font-bold text-turquoise">
            FUNtastic <span className="text-gray-800">Taxi & Tours</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <a href="tel:+17584860790" className="text-turquoise hover:text-turquoise/80">
            <Phone size={20} />
          </a>
          <a href="https://wa.me/17584860790" className="text-turquoise hover:text-turquoise/80">
            <MessageSquare size={20} />
          </a>
          <Link to="/contact" className="btn btn-cta">
            Book Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
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
              <Link 
                to="/contact" 
                className="btn btn-cta py-2 px-4 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;