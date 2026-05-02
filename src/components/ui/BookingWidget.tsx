import React, { useState } from 'react';
import { Shield, Plane, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';

type Tab = 'airport' | 'tour';

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  passengers: string;
  booking_date: string;
  pickup_time: string;
  special_requests: string;
  // Airport Transfer
  transfer_direction: 'arrival' | 'departure' | '';
  flight_number: string;
  airline: string;
  pickup_location: string;
  dropoff_location: string;
  luggage_count: string;
  // Island Tour
  tour_type: string;
  hotel_address: string;
  duration_preference: string;
  has_accessibility: boolean;
  accessibility_needs: string;
}

const initial: FormState = {
  full_name: '',
  email: '',
  phone: '',
  passengers: '1',
  booking_date: '',
  pickup_time: '',
  special_requests: '',
  transfer_direction: '',
  flight_number: '',
  airline: '',
  pickup_location: '',
  dropoff_location: '',
  luggage_count: '0',
  tour_type: '',
  hotel_address: '',
  duration_preference: '',
  has_accessibility: false,
  accessibility_needs: '',
};

const cx = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const inputBase =
  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none transition text-sm';

const fieldInput = (hasError?: string) =>
  cx(inputBase, hasError ? 'border-red-500' : 'border-gray-300');

const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

const BookingWidget: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('airport');
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setChecked = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.checked }));

  const switchTab = (t: Tab) => {
    setTab(t);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.phone.trim()) e.phone = 'Phone / WhatsApp number is required';
    if (!form.booking_date) e.booking_date = 'Date is required';
    if (!form.pickup_time) e.pickup_time = 'Pickup time is required';

    if (tab === 'airport') {
      if (!form.transfer_direction) e.transfer_direction = 'Please select Arrival or Departure';
      if (!form.flight_number.trim()) e.flight_number = 'Flight number is required';
      if (!form.pickup_location.trim()) e.pickup_location = 'Pickup location is required';
      if (!form.dropoff_location.trim()) e.dropoff_location = 'Drop-off location is required';
    } else {
      if (!form.tour_type) e.tour_type = 'Please select a tour type';
      if (!form.hotel_address.trim()) e.hotel_address = 'Hotel / pickup address is required';
      if (!form.duration_preference) e.duration_preference = 'Please select a duration';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    const booking_ref = `FTT-${dateStamp}-${rand}`;

    const base = {
      booking_ref,
      booking_type: tab === 'airport' ? 'airport_transfer' : 'island_tour',
      status: 'pending',
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      passengers: Number(form.passengers),
      booking_date: form.booking_date,
      pickup_time: form.pickup_time,
      special_requests: form.special_requests.trim() || null,
    };

    const payload =
      tab === 'airport'
        ? {
            ...base,
            transfer_direction: form.transfer_direction || null,
            flight_number: form.flight_number.trim(),
            airline: form.airline.trim() || null,
            pickup_location: form.pickup_location.trim(),
            dropoff_location: form.dropoff_location.trim(),
            luggage_count: Number(form.luggage_count),
          }
        : {
            ...base,
            tour_type: form.tour_type,
            hotel_address: form.hotel_address.trim(),
            duration_preference: form.duration_preference,
            accessibility_needs: form.has_accessibility
              ? form.accessibility_needs.trim() || null
              : null,
          };

    const { error: dbError } = await supabase.from('bookings').insert([payload]);

    if (dbError) {
      setSubmitting(false);
      await Swal.fire({
        title: 'Booking Failed',
        text: 'We could not save your booking. Please try again or contact us directly.',
        icon: 'error',
        confirmButtonColor: '#FFC845',
      });
      return;
    }

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    await Swal.fire({
      title: 'Booking Received!',
      html: `Your booking reference is <strong>${booking_ref}</strong>.<br/>We will confirm your reservation shortly.`,
      icon: 'success',
      confirmButtonColor: '#FFC845',
    });

    sessionStorage.setItem('bookingRef', booking_ref);
    navigate('/thank-you');
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {(['airport', 'tour'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={cx(
                'flex-1 py-4 text-sm font-semibold transition-colors focus:outline-none',
                tab === t
                  ? 'bg-[#00B8B8] text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              )}
            >
              {t === 'airport' ? 'Airport Transfer' : 'Island Tour'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5" noValidate>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium text-red-800 mb-2">Please correct the following:</p>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* ── Shared fields ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className={labelCls}>Full Name *</label>
              <input
                id="full_name"
                type="text"
                className={fieldInput(errors.full_name)}
                value={form.full_name}
                onChange={set('full_name')}
                aria-invalid={!!errors.full_name}
              />
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
            </div>

            <div>
              <label htmlFor="email" className={labelCls}>Email *</label>
              <input
                id="email"
                type="email"
                className={fieldInput(errors.email)}
                value={form.email}
                onChange={set('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelCls}>Phone / WhatsApp (with country code) *</label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 758 000 0000"
                className={fieldInput(errors.phone)}
                value={form.phone}
                onChange={set('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="passengers" className={labelCls}>Number of Passengers *</label>
              <select
                id="passengers"
                className={fieldInput()}
                value={form.passengers}
                onChange={set('passengers')}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="booking_date" className={labelCls}>Date *</label>
              <input
                id="booking_date"
                type="date"
                min={today}
                className={fieldInput(errors.booking_date)}
                value={form.booking_date}
                onChange={set('booking_date')}
                aria-invalid={!!errors.booking_date}
              />
              {errors.booking_date && <p className="mt-1 text-xs text-red-600">{errors.booking_date}</p>}
            </div>

            <div>
              <label htmlFor="pickup_time" className={labelCls}>Pickup Time *</label>
              <input
                id="pickup_time"
                type="time"
                className={fieldInput(errors.pickup_time)}
                value={form.pickup_time}
                onChange={set('pickup_time')}
                aria-invalid={!!errors.pickup_time}
              />
              {errors.pickup_time && <p className="mt-1 text-xs text-red-600">{errors.pickup_time}</p>}
            </div>
          </div>

          {/* ── Airport Transfer fields ── */}
          {tab === 'airport' && (
            <>
              <div>
                <p className={labelCls}>Transfer Direction *</p>
                <div className="flex gap-6 mt-1">
                  {(['arrival', 'departure'] as const).map(dir => (
                    <label key={dir} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="transfer_direction"
                        value={dir}
                        checked={form.transfer_direction === dir}
                        onChange={() => setForm(prev => ({ ...prev, transfer_direction: dir }))}
                        className="w-4 h-4 accent-[#00B8B8]"
                      />
                      <span className="capitalize text-sm text-gray-700">{dir}</span>
                    </label>
                  ))}
                </div>
                {errors.transfer_direction && (
                  <p className="mt-1 text-xs text-red-600">{errors.transfer_direction}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="flight_number" className={labelCls}>Flight Number *</label>
                  <input
                    id="flight_number"
                    type="text"
                    placeholder="e.g. AA 1234"
                    className={fieldInput(errors.flight_number)}
                    value={form.flight_number}
                    onChange={set('flight_number')}
                    aria-invalid={!!errors.flight_number}
                  />
                  {errors.flight_number && <p className="mt-1 text-xs text-red-600">{errors.flight_number}</p>}
                </div>

                <div>
                  <label htmlFor="airline" className={labelCls}>
                    Airline <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="airline"
                    type="text"
                    placeholder="e.g. American Airlines"
                    className={fieldInput()}
                    value={form.airline}
                    onChange={set('airline')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pickup_location" className={labelCls}>Pickup Location *</label>
                  <input
                    id="pickup_location"
                    type="text"
                    placeholder="e.g. Hewanorra Airport, Hotel name"
                    className={fieldInput(errors.pickup_location)}
                    value={form.pickup_location}
                    onChange={set('pickup_location')}
                    aria-invalid={!!errors.pickup_location}
                  />
                  {errors.pickup_location && <p className="mt-1 text-xs text-red-600">{errors.pickup_location}</p>}
                </div>

                <div>
                  <label htmlFor="dropoff_location" className={labelCls}>Drop-off Location *</label>
                  <input
                    id="dropoff_location"
                    type="text"
                    placeholder="e.g. Sandals Resort, Rodney Bay"
                    className={fieldInput(errors.dropoff_location)}
                    value={form.dropoff_location}
                    onChange={set('dropoff_location')}
                    aria-invalid={!!errors.dropoff_location}
                  />
                  {errors.dropoff_location && <p className="mt-1 text-xs text-red-600">{errors.dropoff_location}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="luggage_count" className={labelCls}>Luggage Count *</label>
                <select
                  id="luggage_count"
                  className={fieldInput()}
                  value={form.luggage_count}
                  onChange={set('luggage_count')}
                >
                  {Array.from({ length: 11 }, (_, i) => i).map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Bag' : 'Bags'}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* ── Island Tour fields ── */}
          {tab === 'tour' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tour_type" className={labelCls}>Tour Type *</label>
                  <select
                    id="tour_type"
                    className={fieldInput(errors.tour_type)}
                    value={form.tour_type}
                    onChange={set('tour_type')}
                    aria-invalid={!!errors.tour_type}
                  >
                    <option value="">Select a tour</option>
                    <option value="island_tour">Island Tour</option>
                    <option value="city_tour">City Tour</option>
                    <option value="waterfall_tour">Waterfall Tour</option>
                    <option value="sunset_tour">Sunset Tour</option>
                  </select>
                  {errors.tour_type && <p className="mt-1 text-xs text-red-600">{errors.tour_type}</p>}
                </div>

                <div>
                  <label htmlFor="duration_preference" className={labelCls}>Duration *</label>
                  <select
                    id="duration_preference"
                    className={fieldInput(errors.duration_preference)}
                    value={form.duration_preference}
                    onChange={set('duration_preference')}
                    aria-invalid={!!errors.duration_preference}
                  >
                    <option value="">Select duration</option>
                    <option value="half_day">Half Day</option>
                    <option value="full_day">Full Day</option>
                  </select>
                  {errors.duration_preference && <p className="mt-1 text-xs text-red-600">{errors.duration_preference}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="hotel_address" className={labelCls}>Hotel / Pickup Address *</label>
                <input
                  id="hotel_address"
                  type="text"
                  placeholder="Hotel name or full pickup address"
                  className={fieldInput(errors.hotel_address)}
                  value={form.hotel_address}
                  onChange={set('hotel_address')}
                  aria-invalid={!!errors.hotel_address}
                />
                {errors.hotel_address && <p className="mt-1 text-xs text-red-600">{errors.hotel_address}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.has_accessibility}
                    onChange={setChecked('has_accessibility')}
                    className="w-4 h-4 accent-[#00B8B8]"
                  />
                  <span className="text-sm font-medium text-gray-700">I have accessibility needs</span>
                </label>
                {form.has_accessibility && (
                  <textarea
                    className={cx(inputBase, 'border-gray-300 mt-3')}
                    rows={2}
                    placeholder="Please describe your accessibility requirements"
                    value={form.accessibility_needs}
                    onChange={set('accessibility_needs')}
                  />
                )}
              </div>
            </>
          )}

          {/* ── Special Requests (shared) ── */}
          <div>
            <label htmlFor="special_requests" className={labelCls}>
              Special Requests{' '}
              <span className="font-normal text-gray-400">(optional, max 300 characters)</span>
            </label>
            <textarea
              id="special_requests"
              className={cx(inputBase, 'border-gray-300')}
              rows={3}
              maxLength={300}
              placeholder="Any special requests or requirements"
              value={form.special_requests}
              onChange={set('special_requests')}
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {form.special_requests.length}/300
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn btn-cta text-lg py-4 transition transform hover:scale-[1.02] duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Request Reservation'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            Pay driver upon arrival &bull; Free cancellation up to 24h
          </p>
        </form>
      </div>

      {/* Trust badges */}
      <div className="mt-8 bg-gray-50 py-6 -mx-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Star className="text-yellow" size={20} />
            <span className="text-gray-700 font-medium">5-Star Tripadvisor / Google</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="text-turquoise" size={20} />
            <span className="text-gray-700 font-medium">100% Licensed &amp; Insured Drivers</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Plane className="text-turquoise" size={20} />
            <span className="text-gray-700 font-medium">Real-time Flight Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;
