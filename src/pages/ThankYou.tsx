import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYou: React.FC = () => {
  const orderId = sessionStorage.getItem('orderId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Reservation Received!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            A confirmation email is on its way. No payment due now—just pay your driver upon pickup.
          </p>
          {orderId && (
            <p className="mt-2 text-sm text-gray-500">
              Booking Reference: #{orderId}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h2>
          <ol className="text-left space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-turquoise text-white rounded-full flex items-center justify-center mr-3">1</span>
              <span>Check your email for booking confirmation details</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-turquoise text-white rounded-full flex items-center justify-center mr-3">2</span>
              <span>Our dispatcher will review and confirm your booking within 30 minutes</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-turquoise text-white rounded-full flex items-center justify-center mr-3">3</span>
              <span>Have cash or card ready for payment to your driver upon pickup</span>
            </li>
          </ol>
        </div>

        {/* TODO: Integrate Stripe Pay-Link when ready */}
        
        <div>
          <Link
            to="/"
            className="btn btn-primary w-full justify-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;