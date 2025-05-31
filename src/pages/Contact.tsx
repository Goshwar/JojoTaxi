import React from 'react';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import ContactForm from '../components/ui/ContactForm';

const Contact: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-turquoise/10 py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact & Book Now</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch to book your transportation or to inquire about our services
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center hover:shadow-lg">
              <div className="mx-auto bg-turquoise/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Phone size={30} className="text-turquoise" />
              </div>
              <h3 className="font-bold text-xl mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">We're available 24/7 to take your call</p>
              <a href="tel:+17584860790" className="btn btn-primary w-full">
                +1 (758) 486-0790
              </a>
            </div>

            <div className="card text-center hover:shadow-lg">
              <div className="mx-auto bg-turquoise/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <MessageSquare size={30} className="text-turquoise" />
              </div>
              <h3 className="font-bold text-xl mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">Message us anytime for quick responses</p>
              <a href="https://wa.me/17584860790" className="btn btn-primary w-full">
                WhatsApp Us
              </a>
            </div>

            <div className="card text-center hover:shadow-lg">
              <div className="mx-auto bg-turquoise/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Mail size={30} className="text-turquoise" />
              </div>
              <h3 className="font-bold text-xl mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us a message, we'll respond promptly</p>
              <a href="mailto:funtastictaxitours@gmail.com" className="btn btn-primary w-full">
                funtastictaxitours@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <SectionHeading 
                title="Book Your Transportation" 
                subtitle="Complete the form below to request a booking"
              />
              
              <ContactForm />

              {/* Map */}
              <div className="map-wrapper mt-8" aria-label="Map showing the island of St Lucia">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123925.01132939865!2d-61.01623300875679!3d13.919462395803487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c406065f12da31d%3A0x6e7486c4e8399df5!2sSt%20Lucia!5e0!3m2!1sen!2sca!4v1747602735452!5m2!1sen!2sca"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="St Lucia map"
                ></iframe>
              </div>
            </div>

            <div className="lg:col-span-2">
              <SectionHeading 
                title="Our Location" 
                subtitle="Based in Castries, serving all of St. Lucia"
              />

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin size={20} className="text-turquoise mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">Office Address</h3>
                    <p className="text-gray-600">Castries, St. Lucia</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone size={20} className="text-turquoise mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-600">+1 (758) 486-0790</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail size={20} className="text-turquoise mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">funtastictaxitours@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare size={20} className="text-turquoise mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium">WhatsApp</h3>
                    <p className="text-gray-600">+1 (758) 486-0790</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="section">
        <div className="container">
          <SectionHeading 
            title="Hours of Operation" 
            subtitle="We're available when you need us"
            centered={true}
          />
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                <div className="grid grid-cols-2 px-6 py-4">
                  <div className="font-medium">Airport Transfers</div>
                  <div className="text-gray-600">24/7 Service</div>
                </div>
                <div className="grid grid-cols-2 px-6 py-4">
                  <div className="font-medium">Island Tours</div>
                  <div className="text-gray-600">7:00 AM - 6:00 PM</div>
                </div>
                <div className="grid grid-cols-2 px-6 py-4">
                  <div className="font-medium">Office Hours</div>
                  <div className="text-gray-600">Mon-Fri: 8:00 AM - 6:00 PM<br />Sat: 9:00 AM - 3:00 PM</div>
                </div>
                <div className="grid grid-cols-2 px-6 py-4">
                  <div className="font-medium">Phone Support</div>
                  <div className="text-gray-600">24/7 Service</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600">
                We understand that travel plans can change and flights can be delayed. Our team is flexible and responsive to ensure your transportation needs are met regardless of unexpected changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-turquoise text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Let's Make Your St. Lucia Experience Exceptional</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your transportation needs or to make a booking. We're here to help you enjoy a stress-free vacation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+17584860790" className="btn btn-cta">
              Call Now
            </a>
            <a href="https://wa.me/17584860790" className="btn bg-white text-turquoise hover:bg-gray-100">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;