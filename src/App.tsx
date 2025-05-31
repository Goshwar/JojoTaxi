import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import RatesAndZones from './pages/RatesAndZones';
import Reviews from './pages/Reviews';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import ThankYou from './pages/ThankYou';
import WhatsAppWidget from './components/ui/WhatsAppWidget';
import CookieConsent from './components/ui/CookieConsent';
import SkipToContent from './components/ui/SkipToContent';
import { useScrollToTop } from './utils/scroll';

const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <SkipToContent />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/rates-and-zones" element={<RatesAndZones />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </Layout>
      <WhatsAppWidget />
      <CookieConsent />
    </Router>
  );
}

export default App;