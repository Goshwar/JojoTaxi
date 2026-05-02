import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';

interface FormData {
  name: string;
  email: string;
  phone: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  luggage: string;
  notes: string;
  bookingRef: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    passengers: '1',
    luggage: '',
    notes: '',
    bookingRef: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.pickup) newErrors.pickup = 'Pickup location is required';
    if (!formData.dropoff) newErrors.dropoff = 'Drop-off location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorSummary = document.getElementById('error-summary');
      if (errorSummary) errorSummary.focus();
      return;
    }

    // Generate booking reference
    const dateStamp = new Date().toISOString().slice(0,10).replaceAll('-', '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingRef = `SL-${dateStamp}-${randomPart}`;

    // Update form data with booking reference
    const updatedFormData = { ...formData, bookingRef };
    setFormData(updatedFormData);

    // Build confirmation summary
    const summary = `
      <div class="text-left">
        <h3 class="text-lg font-bold mb-4">Booking Details</h3>
        <p class="text-sm text-gray-600 mb-4">Booking Reference: ${bookingRef}</p>
        <ul class="space-y-2">
          <li><strong>Full Name:</strong> ${updatedFormData.name}</li>
          <li><strong>Email:</strong> ${updatedFormData.email}</li>
          <li><strong>Phone:</strong> ${updatedFormData.phone}</li>
          <li><strong>Pickup:</strong> ${updatedFormData.pickup}</li>
          <li><strong>Drop-off:</strong> ${updatedFormData.dropoff}</li>
          <li><strong>Date:</strong> ${updatedFormData.date}</li>
          <li><strong>Time:</strong> ${updatedFormData.time}</li>
          <li><strong>Passengers:</strong> ${updatedFormData.passengers}</li>
          ${updatedFormData.luggage ? `<li><strong>Luggage:</strong> ${updatedFormData.luggage}</li>` : ''}
          ${updatedFormData.notes ? `<li><strong>Notes:</strong> ${updatedFormData.notes}</li>` : ''}
        </ul>
      </div>
    `;

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Confirm your reservation',
      html: summary,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#FFC845',
      focusConfirm: true,
      customClass: {
        container: 'booking-confirmation-modal'
      }
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);

      try {
        // Send to Make.com webhook
        const response = await fetch(import.meta.env.VITE_MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingRef,
            fullName: updatedFormData.name,
            email: updatedFormData.email,
            phone: updatedFormData.phone,
            pickupLocation: updatedFormData.pickup,
            dropoffLocation: updatedFormData.dropoff,
            pickupDate: updatedFormData.date,
            pickupTime: updatedFormData.time,
            passengers: updatedFormData.passengers,
            luggage: updatedFormData.luggage,
            notes: updatedFormData.notes
          }),
        });

        // Persist to Supabase regardless of webhook status
        await supabase.from('bookings').insert([{
          booking_ref: bookingRef,
          name: updatedFormData.name,
          email: updatedFormData.email,
          phone: updatedFormData.phone,
          pickup: updatedFormData.pickup,
          dropoff: updatedFormData.dropoff,
          pickup_date: updatedFormData.date,
          pickup_time: updatedFormData.time,
          passengers: Number(updatedFormData.passengers),
          luggage: updatedFormData.luggage,
          notes: updatedFormData.notes,
          status: 'pending',
        }]);

        if (response.ok) {
          await Swal.fire({
            title: 'Request sent',
            text: `Your booking request (${bookingRef}) has been received!`,
            icon: 'success',
            confirmButtonColor: '#FFC845'
          });

          // Store booking reference and redirect
          sessionStorage.setItem('bookingRef', bookingRef);
          window.location.href = '/thank-you';
        } else {
          throw new Error('Booking submission failed');
        }
      } catch (error) {
        await Swal.fire({
          title: 'Something went wrong',
          text: 'Please try again or contact us directly.',
          icon: 'error',
          confirmButtonColor: '#FFC845'
        });
        
        setErrors({
          submit: 'There was an error submitting your booking. Please try again or contact us directly.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form id="taxi-booking-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
      <input type="hidden" name="bookingRef" id="bookingRef" value={formData.bookingRef} />
      
      {Object.keys(errors).length > 0 && (
        <div 
          id="error-summary"
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          tabIndex={-1}
        >
          <p className="font-medium text-red-800 mb-2">Please correct the following errors:</p>
          <ul className="list-disc list-inside text-red-700">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name*
          </label>
          <input
            type="text"
            id="name"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number*
        </label>
        <input
          type="tel"
          id="phone"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location*
          </label>
          <input
            type="text"
            id="pickup"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise ${
              errors.pickup ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Hewanorra Airport (UVF)"
            value={formData.pickup}
            onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
            required
            aria-invalid={errors.pickup ? 'true' : 'false'}
            aria-describedby={errors.pickup ? 'pickup-error' : undefined}
          />
          {errors.pickup && (
            <p id="pickup-error" className="mt-1 text-sm text-red-600">{errors.pickup}</p>
          )}
        </div>

        <div>
          <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700 mb-1">
            Drop-off Location*
          </label>
          <input
            type="text"
            id="dropoff"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise ${
              errors.dropoff ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Sandals Grande Resort"
            value={formData.dropoff}
            onChange={(e) => setFormData({ ...formData, dropoff: e.target.value })}
            required
            aria-invalid={errors.dropoff ? 'true' : 'false'}
            aria-describedby={errors.dropoff ? 'dropoff-error' : undefined}
          />
          {errors.dropoff && (
            <p id="dropoff-error" className="mt-1 text-sm text-red-600">{errors.dropoff}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Date*
          </label>
          <input
            type="date"
            id="date"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
            aria-invalid={errors.date ? 'true' : 'false'}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && (
            <p id="date-error" className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Time*
          </label>
          <input
            type="time"
            id="time"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
            aria-invalid={errors.time ? 'true' : 'false'}
            aria-describedby={errors.time ? 'time-error' : undefined}
          />
          {errors.time && (
            <p id="time-error" className="mt-1 text-sm text-red-600">{errors.time}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Passengers*
          </label>
          <select
            id="passengers"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
            value={formData.passengers}
            onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
            required
          >
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'Person' : 'People'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="luggage" className="block text-sm font-medium text-gray-700 mb-1">
            Luggage Details
          </label>
          <input
            type="text"
            id="luggage"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
            placeholder="e.g., 2 suitcases + 1 carry-on"
            value={formData.luggage}
            onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          id="notes"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
          rows={3}
          placeholder="Any special requests or information"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <button 
        type="submit"
        className="btn btn-cta w-full text-lg py-4 transition transform hover:scale-[1.02] duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Request Reservation'}
      </button>

      <p className="text-center text-gray-500 text-sm">
        Pay driver upon arrival • Free cancellation up to 24h
      </p>
    </form>
  );
};

export default ContactForm;