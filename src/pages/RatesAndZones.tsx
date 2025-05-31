import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';

const RatesAndZones: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-turquoise/10 py-20">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Rates & Zones</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent pricing for all your transportation needs in St. Lucia
          </p>
        </div>
      </section>

      {/* Rate Information */}
      <section className="section">
        <div className="container">
          <SectionHeading 
            title="Airport Transfer Rates" 
            subtitle="Fixed rates based on your destination zone"
          />
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12">
            <div className="overflow-x-auto">
              {/* TODO: replace with live component in later iteration */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area/Resorts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UVF Airport (One-way)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLU Airport (One-way)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round Trip (10% Discount)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Zone 1</td>
                    <td className="px-6 py-4">Vieux Fort, Laborie</td>
                    <td className="px-6 py-4">$30</td>
                    <td className="px-6 py-4">$85</td>
                    <td className="px-6 py-4">$54</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Zone 2</td>
                    <td className="px-6 py-4">Choiseul, Soufrière</td>
                    <td className="px-6 py-4">$65</td>
                    <td className="px-6 py-4">$95</td>
                    <td className="px-6 py-4">$117</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Zone 3</td>
                    <td className="px-6 py-4">Anse La Raye, Canaries</td>
                    <td className="px-6 py-4">$80</td>
                    <td className="px-6 py-4">$55</td>
                    <td className="px-6 py-4">$144</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Zone 4</td>
                    <td className="px-6 py-4">Castries, Marigot Bay</td>
                    <td className="px-6 py-4">$90</td>
                    <td className="px-6 py-4">$30</td>
                    <td className="px-6 py-4">$162</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Zone 5</td>
                    <td className="px-6 py-4">Rodney Bay, Gros Islet, Cap Estate</td>
                    <td className="px-6 py-4">$100</td>
                    <td className="px-6 py-4">$45</td>
                    <td className="px-6 py-4">$180</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading 
                title="Zone Map" 
                subtitle="Visual representation of our pricing zones"
              />
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/Images/Island Zone.jpg"
                  alt="St. Lucia Transportation Zones Map"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div>
              <SectionHeading 
                title="Additional Information" 
                subtitle="Important notes about our rates"
              />
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Group Rates</h3>
                  <p className="text-gray-600">Rates shown are for standard vehicles (up to 4 passengers). For larger groups, please contact us for specific pricing.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Late Night Surcharge</h3>
                  <p className="text-gray-600">For pickups between 10:00 PM and 5:00 AM, a 20% surcharge applies.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Holiday Rates</h3>
                  <p className="text-gray-600">During peak holiday periods (Dec 15-Jan 10, Easter week), a 10% surcharge may apply.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Included in Rate</h3>
                  <p className="text-gray-600">All rates include driver, fuel, taxes, and bottled water. Gratuity is not included but appreciated.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Rates */}
      <section className="section bg-gray-50">
        <div className="container">
          <SectionHeading 
            title="Island Tour & Hourly Charter Rates" 
            subtitle="Flexible options for exploring St. Lucia"
            centered={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="card hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4">Half-Day Island Tour</h3>
              <p className="text-3xl font-bold text-turquoise mb-2">$150</p>
              <p className="text-gray-500 mb-4">Up to 4 people, 4 hours</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Customizable itinerary</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Professional driver/guide</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Hotel pickup and drop-off</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Bottled water included</span>
                </li>
              </ul>
              <Link to="/contact" className="btn btn-cta w-full">
                Book Now
              </Link>
            </div>

            <div className="card hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4">Full-Day Island Tour</h3>
              <p className="text-3xl font-bold text-turquoise mb-2">$250</p>
              <p className="text-gray-500 mb-4">Up to 4 people, 8 hours</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Comprehensive island exploration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Professional driver/guide</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Hotel pickup and drop-off</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Bottled water and refreshments</span>
                </li>
              </ul>
              <Link to="/contact" className="btn btn-cta w-full">
                Book Now
              </Link>
            </div>

            <div className="card hover:shadow-lg">
              <h3 className="text-xl font-bold mb-4">Hourly Charter</h3>
              <p className="text-3xl font-bold text-turquoise mb-2">$45/hr</p>
              <p className="text-gray-500 mb-4">Minimum 4 hours</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Flexible scheduling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Dedicated driver</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Create your own itinerary</span>
                </li>
                <li className="flex items-start">
                  <span className="text-turquoise mr-2">✓</span>
                  <span>Ideal for shopping or restaurant visits</span>
                </li>
              </ul>
              <Link to="/contact" className="btn btn-cta w-full">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-turquoise text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Book Your St. Lucia Transportation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to confirm rates for your specific requirements and to make your reservation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn btn-cta">
              Book Now
            </Link>
            <a href="tel:+17584860790" className="btn bg-white text-turquoise hover:bg-gray-100">
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RatesAndZones;