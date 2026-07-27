import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider, useBooking } from './contexts/BookingContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import PublicProtectedRoute from './components/ProtectedRoute';

/*
 * Public pages that scripts/prerender.mjs turns into static HTML are imported
 * eagerly and must stay that way. Their markup is already inside #root when
 * the browser parses the document, so a lazy boundary would make React render
 * a Suspense fallback during hydration — replacing real content with a spinner
 * and throwing away the whole point of prerendering.
 *
 * Everything below that is NOT prerendered (see src/lib/routes.ts) is split
 * out, which is where the weight is anyway: the admin dashboard and the
 * booking flow together pull in sweetalert2 and ~2,000 lines that no visitor
 * reading the homepage will ever execute.
 */
import Home from './pages/Home';
import Services from './pages/Services';
import RatesAndZones from './pages/RatesAndZones';
import Reviews from './pages/Reviews';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import TransferRoute from './pages/TransferRoute';
import Tour from './pages/Tour';

const BookingModal = lazy(() => import('./components/ui/BookingModal'));
const Booking = lazy(() => import('./pages/Booking'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const PublicLogin = lazy(() => import('./pages/Login'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminRates = lazy(() => import('./pages/admin/AdminRates'));
const AdminFleet = lazy(() => import('./pages/admin/AdminFleet'));

// Utilities
import WhatsAppWidget from './components/ui/WhatsAppWidget';
import CookieConsent from './components/ui/CookieConsent';
import SkipToContent from './components/ui/SkipToContent';
import { useScrollToTop } from './utils/scroll';

const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

/** Fills the viewport while a split route chunk arrives. */
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center" aria-busy="true">
    <span className="sr-only">Loading…</span>
    <div
      className="animate-pulse rounded-full"
      style={{ width: '2.5rem', height: '2.5rem', background: 'var(--color-teal)', opacity: 0.35 }}
    />
  </div>
);

/**
 * Mounts the booking modal's chunk only once someone opens it, so sweetalert2
 * and the 900-line booking form stay out of every public page's initial
 * download. In modal mode the component already rendered nothing until
 * `isOpen`, so gating the mount here changes no behaviour.
 *
 * The chunk is warmed once the page has finished loading, well before anyone
 * can realistically click "Book Now" — that keeps the interaction instant
 * instead of trading a smaller bundle for a visible delay on tap.
 */
const DeferredBookingModal: React.FC = () => {
  const { isOpen } = useBooking();

  useEffect(() => {
    if (document.readyState === 'complete') {
      void import('./components/ui/BookingModal');
      return;
    }
    const warm = () => void import('./components/ui/BookingModal');
    window.addEventListener('load', warm, { once: true });
    return () => window.removeEventListener('load', warm);
  }, []);

  if (!isOpen) return null;

  return (
    <Suspense fallback={null}>
      <BookingModal mode="modal" />
    </Suspense>
  );
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

/**
 * Router-agnostic app tree. The router itself is supplied by the entry point:
 * BrowserRouter in src/main.tsx for the browser, StaticRouter in
 * src/entry-server.tsx for build-time prerendering.
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <ScrollToTop />
          {/* One boundary for every split route below. The eagerly imported
              prerendered pages never suspend, so they hydrate untouched. */}
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public login */}
            <Route path="/login" element={<PublicLogin />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <PublicProtectedRoute>
                  <AdminLayout><AdminReviews /></AdminLayout>
                </PublicProtectedRoute>
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

            {/* Booking page — no header/footer */}
            <Route path="/booking" element={<Booking />} />

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
<Route path="/rates-and-zones" element={<RatesAndZones />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/faq" element={<Faq />} />
                      <Route path="/airport-transfers/:slug" element={<TransferRoute />} />
                      <Route path="/tours/:slug" element={<Tour />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/thank-you" element={<ThankYou />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                  <WhatsAppWidget />
                  <CookieConsent />
                  {/* Desktop booking modal — rendered outside Layout so it overlays everything */}
                  <DeferredBookingModal />
                </>
              }
            />
          </Routes>
          </Suspense>
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
