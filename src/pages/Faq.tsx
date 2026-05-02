import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';
import FaqItem from '../components/ui/FaqItem';
import { useBooking } from '../contexts/BookingContext';

const Faq: React.FC = () => {
  const { openModal } = useBooking();
  const navigate = useNavigate();
  const handleBookNow = () => {
    if (window.innerWidth < 768) navigate('/booking');
    else openModal();
  };
  return (
    <div>
      {/* Page Header */}
      <section className="bg-turquoise/10 py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our services and policies
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Booking & Reservations */}
            <div>
              <SectionHeading 
                title="Booking & Reservations" 
                subtitle="Questions about making a reservation"
              />
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  <FaqItem 
                    question="How far in advance should I book my airport transfer?"
                    answer="We recommend booking your airport transfer at least 48 hours in advance to ensure availability. For peak season (December-April), we suggest booking 1-2 weeks ahead of time for the best options."
                    isOpen={true}
                  />
                  <FaqItem 
                    question="What information do I need to provide when booking?"
                    answer="When booking, please provide your flight details (for airport transfers), full name, contact information, pickup and drop-off locations, date and time, number of passengers, and any special requirements you may have."
                  />
                  <FaqItem 
                    question="How do I confirm my booking?"
                    answer="Once you submit your booking request, you'll receive an email confirmation within 24 hours. This will include all your trip details and payment information. If you don't receive this, please check your spam folder or contact us."
                  />
                  <FaqItem 
                    question="Can I modify or cancel my reservation?"
                    answer="Yes, you can modify or cancel your reservation. For changes, please give us at least 24 hours' notice. Cancellations made 48+ hours before service receive a full refund, while those made 24-48 hours prior receive a 50% refund. Cancellations with less than 24 hours' notice are non-refundable."
                  />
                  <FaqItem 
                    question="Do you require a deposit for bookings?"
                    answer="For standard airport transfers, we typically require a 25% deposit to secure your booking, with the balance due on the day of service. For full-day tours or special arrangements, a 50% deposit may be required."
                  />
                </div>
              </div>
            </div>

            {/* Services & Rates */}
            <div>
              <SectionHeading 
                title="Services & Rates" 
                subtitle="Questions about our services and pricing"
              />
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  <FaqItem 
                    question="What is included in the airport transfer rate?"
                    answer="Our airport transfer rates include the vehicle, professional driver, bottled water, luggage handling, all taxes, and waiting time in case of flight delays. Gratuity is not included but is appreciated for excellent service."
                    isOpen={true}
                  />
                  <FaqItem 
                    question="Are there additional charges for flight delays?"
                    answer="No, we monitor flight arrivals and adjust pickup times accordingly at no extra charge. We understand delays are beyond your control and will be there when you arrive."
                  />
                  <FaqItem 
                    question="Do you offer round-trip discounts?"
                    answer="Yes, we offer a 10% discount when you book round-trip transfers with us. This will be automatically applied when booking both journeys together."
                  />
                  <FaqItem 
                    question="What payment methods do you accept?"
                    answer="We accept credit cards (Visa, Mastercard, American Express), PayPal, and cash (USD, EUR, or Eastern Caribbean Dollars). Card payments can be made online during booking or with the driver using a mobile terminal."
                  />
                  <FaqItem 
                    question="Do your drivers expect tips?"
                    answer="Tipping is not mandatory but is customary for good service. A typical gratuity is 10-15% of the fare, but this is entirely at your discretion based on your satisfaction with the service."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More FAQs */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Airport Transfers */}
            <div>
              <SectionHeading 
                title="Airport Transfers" 
                subtitle="Questions about our airport pickup service"
              />
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  <FaqItem 
                    question="How will I identify my driver at the airport?"
                    answer="Your driver will be waiting in the arrival hall holding a sign with your name on it. In your booking confirmation, we'll provide specific meeting point details for either UVF or SLU airport."
                  />
                  <FaqItem 
                    question="How long will the driver wait if my flight is delayed?"
                    answer="Our drivers monitor flight arrivals and will adjust their schedule accordingly. There's no additional charge for waiting due to flight delays."
                  />
                  <FaqItem 
                    question="How long does the transfer take from UVF airport to popular resorts?"
                    answer="Transfer times vary by destination: Vieux Fort (15-20 min), Soufrière (45-60 min), Castries (90 min), and Rodney Bay/Gros Islet (100-120 min). These times may vary depending on traffic conditions."
                  />
                  <FaqItem 
                    question="Do you provide child seats for airport transfers?"
                    answer="Yes, we offer child and infant seats upon request. Please specify the age and weight of your child when booking so we can provide the appropriate seat. There's a small additional fee of $10 per seat."
                  />
                </div>
              </div>
            </div>

            {/* Tours & Excursions */}
            <div>
              <SectionHeading 
                title="Tours & Excursions" 
                subtitle="Questions about our island tours"
              />
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  <FaqItem 
                    question="What types of tours do you offer?"
                    answer="We offer a variety of tours including half-day and full-day island tours, volcano and waterfall tours, beach hopping tours, and customized excursions based on your interests."
                  />
                  <FaqItem 
                    question="Are entrance fees to attractions included in tour rates?"
                    answer="Entrance fees to attractions are not included in our standard tour rates. Your driver can assist with purchasing tickets at each venue, allowing you to choose which attractions you wish to visit."
                  />
                  <FaqItem 
                    question="Do you provide tour guides or just transportation?"
                    answer="Our drivers are knowledgeable about the island and provide commentary during tours. For specialized guided tours of specific attractions, we can arrange professional tour guides for an additional fee."
                  />
                  <FaqItem 
                    question="Can tours be customized to our interests?"
                    answer="Absolutely! We specialize in customized tours. Let us know your interests, and we'll recommend an itinerary. During the tour, you can also adjust the schedule as long as it fits within your booked time frame."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need More Information */}
      <section className="section">
        <div className="container text-center">
          <SectionHeading 
            title="Need More Information?" 
            subtitle="We're here to help with any questions you may have"
            centered={true}
          />
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            If you haven't found the answer to your question, please contact us directly. We're happy to assist you with any inquiries.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn btn-primary">
              Contact Us
            </Link>
            <a href="mailto:funtastictaxitours@gmail.com" className="btn btn-outline">
              Email Us
            </a>
            <a href="tel:+17584860790" className="btn btn-outline">
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-turquoise text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Book Your St. Lucia Transportation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience our professional service and make your St. Lucia trip smooth and enjoyable.
          </p>
          <button onClick={handleBookNow} className="btn btn-cta">
            Book Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Faq;