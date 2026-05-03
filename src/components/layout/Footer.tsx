import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';

const colHeadingStyle: React.CSSProperties = {
  fontSize: '1rem',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.15)',
};

const Footer: React.FC = () => {
  return (
    <footer style={{ background: 'var(--color-navy)' }} className="pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Company Info */}
          <div>
            <h4 className="font-heading font-bold text-white" style={colHeadingStyle}>
              FUNtastic Taxi &amp; Tours
            </h4>
            <p className="text-white/70 mb-4">
              Professional airport transfers and island tours in St. Lucia.
            </p>
            <div className="flex items-center" style={{ gap: '1rem', marginTop: '1rem' }}>
              <a
                href="https://wa.me/17584860790"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-white" style={colHeadingStyle}>
              Quick Links
            </h4>
            <ul style={{ lineHeight: 2.2 }}>
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-white transition-colors">Services</Link></li>
<li><Link to="/rates-and-zones" className="text-white/70 hover:text-white transition-colors">Rates &amp; Zones</Link></li>
              <li><Link to="/reviews" className="text-white/70 hover:text-white transition-colors">Reviews</Link></li>
              <li><Link to="/faq" className="text-white/70 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors">Contact / Book</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-bold text-white" style={colHeadingStyle}>
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone size={20} className="text-turquoise mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-white/70">+1 (758) 486-0790</p>
                  <p className="text-white/50 text-sm">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail size={20} className="text-turquoise mt-1 mr-2 flex-shrink-0" />
                <p className="text-white/70">funtastictaxitours@gmail.com</p>
              </div>
              <div className="flex items-start">
                <MapPin size={20} className="text-turquoise mt-1 mr-2 flex-shrink-0" />
                <p className="text-white/70">Castries, St. Lucia</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-heading font-bold text-white" style={colHeadingStyle}>
              Location
            </h4>
            <div
              className="footer-map"
              aria-label="Mini map St Lucia"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123925.01132939865!2d-61.01623300875679!3d13.919462395803487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c406065f12da31d%3A0x6e7486c4e8399df5!2sSt%20Lucia!5e0!3m2!1sen!2sca!4v1747602735452!5m2!1sen!2sca"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="St Lucia map"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row md:justify-between md:items-center text-center md:text-left"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} FUNtastic Taxi &amp; Tours. All rights reserved.
          </p>
          <p className="text-white/50 text-sm">
            Licensed St. Lucia Taxi &amp; Tour Operator
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
