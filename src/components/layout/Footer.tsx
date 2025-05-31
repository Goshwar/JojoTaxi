import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h4 className="font-heading text-xl mb-4 text-white">FUNtastic Taxi & Tours</h4>
            <p className="text-gray-300 mb-4">Professional airport transfers and island tours in St. Lucia.</p>
            <div className="flex items-center space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-turquoise transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-turquoise transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-turquoise transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-turquoise transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-turquoise transition-colors">Services</Link>
              </li>
              <li>
                <Link to="/rates-and-zones" className="text-gray-300 hover:text-turquoise transition-colors">Rates & Zones</Link>
              </li>
              <li>
                <Link to="/reviews" className="text-gray-300 hover:text-turquoise transition-colors">Reviews</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-turquoise transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-turquoise transition-colors">Contact / Book</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-xl mb-4 text-white">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone size={20} className="text-turquoise mt-1 mr-2" />
                <div>
                  <p className="text-gray-300">+1 (758) 486-0790</p>
                  <p className="text-gray-400 text-sm">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail size={20} className="text-turquoise mt-1 mr-2" />
                <p className="text-gray-300">funtastictaxitours@gmail.com</p>
              </div>
              <div className="flex items-start">
                <MapPin size={20} className="text-turquoise mt-1 mr-2" />
                <p className="text-gray-300">Castries, St. Lucia</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-heading text-xl mb-4 text-white">Location</h4>
            <div className="footer-map" aria-label="Mini map St Lucia">
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

        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} FUNtastic Taxi & Tours. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;