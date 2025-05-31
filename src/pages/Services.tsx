import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Clock, Users, Calendar, CreditCard, MessageSquare } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const Services: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <section 
        className="relative bg-cover bg-center py-32"
        style={{
          backgroundImage: 'url("/Images/Waterfall 1.jpg")'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Taxi & Tour Services
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Professional transportation solutions for your St. Lucia experience
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3">
        <div className="container">
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:text-turquoise">Home</Link>
            <span className="mx-2">/</span>
            <span>Services</span>
          </div>
        </div>
      </div>

      {/* Airport Transfers */}
      <section id="airport" className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="overflow-hidden rounded-xl">
              <img 
                src="/Images/SLU Airport.jpg" 
                alt="St. Lucia Airport Transfer Service"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Airport Transfers</h2>
              <p className="text-gray-600 mb-6">
                Start your St. Lucia vacation stress-free with our reliable airport transfer service. 
                We provide professional pickup and drop-off at both Hewanorra International Airport (UVF) 
                and George F.L. Charles Airport (SLU). Our service includes flight monitoring, 
                meet & greet, and fixed rates with no hidden fees.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Clock className="text-turquoise mr-3" size={20} />
                  <span>24/7 service with free flight monitoring</span>
                </li>
                <li className="flex items-center">
                  <Users className="text-turquoise mr-3" size={20} />
                  <span>Vehicles for all group sizes</span>
                </li>
                <li className="flex items-center">
                  <CreditCard className="text-turquoise mr-3" size={20} />
                  <span>Fixed rates, no hidden fees</span>
                </li>
              </ul>
              <Link 
                to="/contact?service=Airport%20Transfer" 
                className="btn btn-cta"
              >
                Book Airport Transfer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Island Tours */}
      <section id="tours" className="section bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold mb-4">Island Tours</h2>
              <p className="text-gray-600 mb-6">
                Discover the natural beauty and cultural richness of St. Lucia with our 
                customized island tours. From the iconic Pitons to hidden gems off the 
                beaten path, our knowledgeable guides will show you the best of our island 
                paradise. Choose from half-day or full-day tours tailored to your interests.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <MapPin className="text-turquoise mr-3" size={20} />
                  <span>Visit iconic landmarks and hidden gems</span>
                </li>
                <li className="flex items-center">
                  <Calendar className="text-turquoise mr-3" size={20} />
                  <span>Flexible scheduling and customizable routes</span>
                </li>
                <li className="flex items-center">
                  <Users className="text-turquoise mr-3" size={20} />
                  <span>Private tours with expert local guides</span>
                </li>
              </ul>
              <Link 
                to="/contact?service=Island%20Tour" 
                className="btn btn-cta"
              >
                Book Island Tour
              </Link>
            </div>
            <div className="order-1 lg:order-2 overflow-hidden rounded-xl">
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                speed={1000}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false
                }}
                loop={true}
                className="h-[400px]"
              >
                <SwiperSlide>
                  <img 
                    src="/Images/Marigot 1.jpg" 
                    alt="Marigot Bay Tour"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img 
                    src="/Images/Waterfall 1.jpg" 
                    alt="Waterfall Tour"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img 
                    src="/Images/Waterfall 4 .jpg" 
                    alt="Waterfall Experience"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img 
                    src="/Images/Jojo 3.jpg" 
                    alt="St. Lucia Tour"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img 
                    src="/Images/Viewpoint 1 .jpg" 
                    alt="Scenic Viewpoint"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* Hourly Charter */}
      <section id="charter" className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="overflow-hidden rounded-xl">
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                speed={1000}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false
                }}
                loop={true}
                className="h-[400px]"
              >
                <SwiperSlide>
                  <img 
                    src="/Images/Viewpoint 2.jpg" 
                    alt="St. Lucia Viewpoint"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img 
                    src="/Images/Pitons 1.jpg" 
                    alt="Pitons View"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img 
                    src="/Images/Jojo 1.jpg" 
                    alt="St. Lucia Experience"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img 
                    src="/Images/Waterfall 3.jpg" 
                    alt="Waterfall Visit"
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              </Swiper>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Hourly Charter Service</h2>
              <p className="text-gray-600 mb-6">
                Need flexible transportation for shopping, dining, or exploring at your own pace? 
                Our hourly charter service gives you the freedom to create your own itinerary 
                with a dedicated driver at your disposal. Perfect for those who want to 
                explore St. Lucia on their own terms.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Clock className="text-turquoise mr-3" size={20} />
                  <span>Minimum 4-hour booking</span>
                </li>
                <li className="flex items-center">
                  <Car className="text-turquoise mr-3" size={20} />
                  <span>Choice of comfortable vehicles</span>
                </li>
                <li className="flex items-center">
                  <Users className="text-turquoise mr-3" size={20} />
                  <span>Perfect for groups and families</span>
                </li>
              </ul>
              <Link 
                to="/contact?service=Hourly%20Charter" 
                className="btn btn-cta"
              >
                Book Hourly Charter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="bg-turquoise py-12">
        <div className="container text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Not sure which option fits?</h2>
          <p className="text-xl mb-6">Chat with us 24/7 on WhatsApp</p>
          <a 
            href="https://wa.me/17584860790" 
            className="btn bg-white text-turquoise hover:bg-gray-100 inline-flex items-center"
          >
            <MessageSquare className="mr-2" size={20} />
            Message Us on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default Services;