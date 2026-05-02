import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';
import { Shield, ThumbsUp, Clock, Award } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';

const FleetAndDrivers: React.FC = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Fleet & Drivers</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our professional team and explore our comfortable vehicle options
          </p>
        </div>
      </section>

      {/* Vehicle Fleet */}
      <section className="section">
        <div className="container">
          <SectionHeading 
            title="Our Vehicle Fleet" 
            subtitle="Modern, well-maintained vehicles for all your transportation needs"
            centered={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="card hover:shadow-lg overflow-hidden group">
              <div className="bg-gray-200 h-48 flex items-center justify-center mb-4">
                <p className="text-gray-500">Image Placeholder: Sedan/Car</p>
              </div>
              <h3 className="text-xl font-bold mb-2">Executive Sedans</h3>
              <p className="text-gray-600 mb-4">Comfortable, air-conditioned sedans perfect for couples or small groups of up to 3 passengers. Includes ample luggage space.</p>
              <ul className="text-gray-600 space-y-1 mb-4">
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Up to 3 passengers</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>2 standard suitcases</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Air conditioning</span>
                </li>
              </ul>
            </div>

            <div className="card hover:shadow-lg overflow-hidden group">
              <div className="bg-gray-200 h-48 flex items-center justify-center mb-4">
                <p className="text-gray-500">Image Placeholder: SUV</p>
              </div>
              <h3 className="text-xl font-bold mb-2">Luxury SUVs</h3>
              <p className="text-gray-600 mb-4">Spacious SUVs ideal for families or small groups who want extra comfort and luggage space.</p>
              <ul className="text-gray-600 space-y-1 mb-4">
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Up to 5 passengers</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>4 standard suitcases</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Air conditioning</span>
                </li>
              </ul>
            </div>

            <div className="card hover:shadow-lg overflow-hidden group">
              <div className="bg-gray-200 h-48 flex items-center justify-center mb-4">
                <p className="text-gray-500">Image Placeholder: Minivan</p>
              </div>
              <h3 className="text-xl font-bold mb-2">Passenger Vans</h3>
              <p className="text-gray-600 mb-4">Spacious vans perfect for larger families or groups traveling together with plenty of luggage space.</p>
              <ul className="text-gray-600 space-y-1 mb-4">
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Up to 8 passengers</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>8 standard suitcases</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Air conditioning</span>
                </li>
              </ul>
            </div>

            <div className="card hover:shadow-lg overflow-hidden group">
              <div className="bg-gray-200 h-48 flex items-center justify-center mb-4">
                <p className="text-gray-500">Image Placeholder: Large Bus</p>
              </div>
              <h3 className="text-xl font-bold mb-2">Group Buses</h3>
              <p className="text-gray-600 mb-4">Comfortable buses for larger groups, corporate events, or wedding parties requiring transportation.</p>
              <ul className="text-gray-600 space-y-1 mb-4">
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Up to 20 passengers</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Large luggage capacity</span>
                </li>
                <li className="flex items-center">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Air conditioning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Features */}
      <section className="section bg-gray-50">
        <div className="container">
          <SectionHeading 
            title="Fleet Features" 
            subtitle="All our vehicles come with premium amenities for your comfort"
            centered={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="mx-auto bg-turquoise/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Shield size={30} className="text-turquoise" />
              </div>
              <h3 className="font-bold mb-2">Safety First</h3>
              <p className="text-gray-600">All vehicles regularly maintained and equipped with safety features</p>
            </div>
            <div className="card text-center">
              <div className="mx-auto bg-turquoise/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <ThumbsUp size={30} className="text-turquoise" />
              </div>
              <h3 className="font-bold mb-2">Comfort</h3>
              <p className="text-gray-600">Air conditioning, comfortable seating, and bottled water in all vehicles</p>
            </div>
            <div className="card text-center">
              <div className="mx-auto bg-turquoise/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Clock size={30} className="text-turquoise" />
              </div>
              <h3 className="font-bold mb-2">Reliability</h3>
              <p className="text-gray-600">Punctual service and modern fleet to ensure on-time arrivals</p>
            </div>
            <div className="card text-center">
              <div className="mx-auto bg-turquoise/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Award size={30} className="text-turquoise" />
              </div>
              <h3 className="font-bold mb-2">Quality</h3>
              <p className="text-gray-600">Premium vehicles maintained to high standards for a quality experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Drivers */}
      <section className="section">
        <div className="container">
          <SectionHeading 
            title="Meet Our Professional Drivers" 
            subtitle="Experienced, friendly, and knowledgeable local experts"
            centered={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center hover:shadow-lg">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <p className="text-gray-500">Driver Photo</p>
              </div>
              <h3 className="text-xl font-bold mb-1">John Alexander</h3>
              <p className="text-gray-500 mb-3">Senior Driver, 15+ years</p>
              <p className="text-gray-600 mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Expert on island history and culture.
              </p>
              <div className="flex justify-center">
                <div className="text-yellow flex">
                  ★★★★★
                </div>
              </div>
            </div>

            <div className="card text-center hover:shadow-lg">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <p className="text-gray-500">Driver Photo</p>
              </div>
              <h3 className="text-xl font-bold mb-1">Michael Thomas</h3>
              <p className="text-gray-500 mb-3">Tour Guide, 8+ years</p>
              <p className="text-gray-600 mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Specialized in eco-tours and hiking.
              </p>
              <div className="flex justify-center">
                <div className="text-yellow flex">
                  ★★★★★
                </div>
              </div>
            </div>

            <div className="card text-center hover:shadow-lg">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <p className="text-gray-500">Driver Photo</p>
              </div>
              <h3 className="text-xl font-bold mb-1">Sarah Williams</h3>
              <p className="text-gray-500 mb-3">Executive Driver, 10+ years</p>
              <p className="text-gray-600 mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Specializes in luxury transfers.
              </p>
              <div className="flex justify-center">
                <div className="text-yellow flex">
                  ★★★★★
                </div>
              </div>
            </div>

            <div className="card text-center hover:shadow-lg">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <p className="text-gray-500">Driver Photo</p>
              </div>
              <h3 className="text-xl font-bold mb-1">Robert Johnson</h3>
              <p className="text-gray-500 mb-3">Airport Specialist, 12+ years</p>
              <p className="text-gray-600 mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Expert in airport logistics and transfers.
              </p>
              <div className="flex justify-center">
                <div className="text-yellow flex">
                  ★★★★★
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver Qualifications */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading 
                title="Driver Qualifications" 
                subtitle="Our rigorous standards ensure your safety and satisfaction"
              />
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Licensed & Certified</h3>
                  <p className="text-gray-600">All our drivers hold professional licenses and certifications required by St. Lucia transportation authorities.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Local Knowledge</h3>
                  <p className="text-gray-600">In-depth knowledge of St. Lucia's roads, attractions, history, and culture to enhance your experience.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Safety Training</h3>
                  <p className="text-gray-600">Regular safety training including defensive driving techniques and basic first aid.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Customer Service Excellence</h3>
                  <p className="text-gray-600">Trained in hospitality best practices to ensure professional, courteous service at all times.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-200 rounded-xl h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Image Placeholder: Professional driver with vehicle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-turquoise text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Experience Our Premium Transportation Services</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book with confidence knowing you'll be traveling in comfort and safety with our professional team.
          </p>
          <button onClick={handleBookNow} className="btn btn-cta">
            Book Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default FleetAndDrivers;