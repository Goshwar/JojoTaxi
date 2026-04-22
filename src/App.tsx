import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Public pages
import Home from './pages/Home';
import Services from './pages/Services';
import RatesAndZones from './pages/RatesAndZones';
import Reviews from './pages/Reviews';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import ThankYou from './pages/ThankYou';
import FleetAndDrivers from './pages/FleetAndDrivers';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminMessages from './pages/admin/AdminMessages';
import AdminRates from './pages/admin/AdminRates';
import AdminFleet from './pages/admin/AdminFleet';

// Utilities
import WhatsAppWidget from './components/ui/WhatsAppWidget';
import CookieConsent from './components/ui/CookieConsent';
import SkipToContent from './components/ui/SkipToContent';
import { useScrollToTop } from './utils/scroll';

const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
          <p className="text-gray-500 mb-6">Please refresh the page or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
    <h1 className="text-6xl font-bold text-turquoise mb-4">404</h1>
    <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
    <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary">Back to Home</a>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout><Dashboard /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute>
                  <AdminLayout><AdminBookings /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute>
                  <AdminLayout><AdminReviews /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute>
                  <AdminLayout><AdminMessages /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rates"
              element={
                <ProtectedRoute>
                  <AdminLayout><AdminRates /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fleet"
              element={
                <ProtectedRoute>
                  <AdminLayout><AdminFleet /></AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Public routes */}
            <Route
              path="/*"
              element={
                <>
                  <SkipToContent />
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/fleet" element={<FleetAndDrivers />} />
                      <Route path="/rates-and-zones" element={<RatesAndZones />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/faq" element={<Faq />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/thank-you" element={<ThankYou />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                  <WhatsAppWidget />
                  <CookieConsent />
                </>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
