import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Plane, Map, Check, ChevronLeft, Globe, Building2, Droplets,
  Sunset, CheckCircle2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';
import { useBooking } from '../../contexts/BookingContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = 'airport' | 'tour' | '';
type TransferDir = 'arrival' | 'departure' | '';
type TourType = 'island_tour' | 'city_tour' | 'waterfall_tour' | 'sunset_tour' | '';
type Duration = 'half_day' | 'full_day' | '';

interface FormState {
  service_type: ServiceType;
  transfer_direction: TransferDir;
  flight_number: string;
  airline: string;
  pickup_location: string;
  dropoff_location: string;
  booking_date: string;
  pickup_time: string;
  tour_type: TourType;
  hotel_address: string;
  duration_preference: Duration;
  passengers: number;
  luggage_count: number;
  has_accessibility: boolean;
  accessibility_needs: string;
  special_requests: string;
  full_name: string;
  email: string;
  phone: string;
  agreed: boolean;
}

const initial: FormState = {
  service_type: '',
  transfer_direction: '',
  flight_number: '',
  airline: '',
  pickup_location: '',
  dropoff_location: '',
  booking_date: '',
  pickup_time: '',
  tour_type: '',
  hotel_address: '',
  duration_preference: '',
  passengers: 1,
  luggage_count: 0,
  has_accessibility: false,
  accessibility_needs: '',
  special_requests: '',
  full_name: '',
  email: '',
  phone: '',
  agreed: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

const inputCls = 'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00B8B8] focus:border-[#00B8B8] outline-none transition text-base';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';
const errorCls = 'mt-1 text-xs text-red-600';

function isValidEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Stepper: React.FC<{
  value: number; onChange: (n: number) => void;
  min: number; max: number; label: string;
}> = ({ value, onChange, min, max, label }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <div className="flex items-center gap-5 mt-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label={`Decrease ${label}`}
        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl font-bold hover:border-[#00B8B8] hover:text-[#00B8B8] transition-colors disabled:opacity-40"
        disabled={value <= min}
      >
        −
      </button>
      <span className="text-2xl font-bold w-8 text-center tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label={`Increase ${label}`}
        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl font-bold hover:border-[#00B8B8] hover:text-[#00B8B8] transition-colors disabled:opacity-40"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  </div>
);

const ToggleBtn: React.FC<{
  active: boolean; onClick: () => void; children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      'flex-1 min-h-[48px] py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all',
      active
        ? 'border-[#00B8B8] bg-[#00B8B8] text-white'
        : 'border-gray-200 text-gray-700 hover:border-[#00B8B8]/50',
    )}
  >
    {children}
  </button>
);

const SummaryRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  mode?: 'modal' | 'page';
}

const STEP_LABELS = ['Service', 'Trip Details', 'Passengers', 'Contact', 'Confirm'];

const BookingModal: React.FC<Props> = ({ mode = 'modal' }) => {
  const navigate = useNavigate();
  const { isOpen, closeModal } = useBooking();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (mode === 'modal') {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, mode]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleClose = async () => {
    const result = await Swal.fire({
      title: 'Leave booking?',
      text: 'Your booking details will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00B8B8',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, exit',
      cancelButtonText: 'Stay',
    });
    if (result.isConfirmed) {
      setForm(initial);
      setStep(1);
      setErrors({});
      if (mode === 'modal') closeModal();
      else navigate('/');
    }
  };

  // ── Step validation ──────────────────────────────────────────────────────────

  const validate = (s: number): boolean => {
    const e: typeof errors = {};

    if (s === 1) {
      if (!form.service_type) e.service_type = 'Please select a service type';
    }

    if (s === 2) {
      if (!form.booking_date) e.booking_date = 'Date is required';
      if (!form.pickup_time) e.pickup_time = 'Pickup time is required';

      if (form.service_type === 'airport') {
        if (!form.transfer_direction) e.transfer_direction = 'Select Arrival or Departure';
        if (!form.flight_number.trim()) e.flight_number = 'Flight number is required';
        if (!form.pickup_location.trim()) e.pickup_location = 'Pickup location is required';
        if (!form.dropoff_location.trim()) e.dropoff_location = 'Drop-off location is required';
      } else {
        if (!form.tour_type) e.tour_type = 'Select a tour type';
        if (!form.hotel_address.trim()) e.hotel_address = 'Hotel / pickup address is required';
        if (!form.duration_preference) e.duration_preference = 'Select a duration';
      }
    }

    if (s === 4) {
      if (!form.full_name.trim()) e.full_name = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!isValidEmail(form.email)) e.email = 'Enter a valid email address';
      if (!form.phone.trim()) e.phone = 'Phone / WhatsApp is required';
    }

    if (s === 5) {
      if (!form.agreed) e.agreed = 'You must agree to the cancellation policy';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canProceed = (): boolean => {
    if (step === 1) return !!form.service_type;
    if (step === 2) {
      const base = !!form.booking_date && !!form.pickup_time;
      if (form.service_type === 'airport')
        return base && !!form.transfer_direction && !!form.flight_number.trim() && !!form.pickup_location.trim() && !!form.dropoff_location.trim();
      return base && !!form.tour_type && !!form.hotel_address.trim() && !!form.duration_preference;
    }
    if (step === 3) return true;
    if (step === 4) return !!form.full_name.trim() && isValidEmail(form.email) && !!form.phone.trim();
    return form.agreed;
  };

  const goNext = () => {
    if (!validate(step)) return;
    setStep(s => (s < 5 ? (s + 1) as any : s));
  };

  const goBack = () => {
    setErrors({});
    setStep(s => (s > 1 ? (s - 1) as any : s));
  };

  const goToStep = (s: 1 | 2 | 3 | 4 | 5) => {
    setErrors({});
    setStep(s);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate(5)) return;
    setSubmitting(true);
    setSubmitError('');

    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    const booking_ref = `FTT-${dateStamp}-${rand}`;

    const base = {
      booking_ref,
      booking_type: form.service_type === 'airport' ? 'airport_transfer' : 'island_tour',
      status: 'pending',
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      passengers: form.passengers,
      booking_date: form.booking_date,
      pickup_time: form.pickup_time,
      special_requests: form.special_requests.trim() || null,
    };

    const payload = form.service_type === 'airport'
      ? {
          ...base,
          transfer_direction: form.transfer_direction || null,
          flight_number: form.flight_number.trim(),
          airline: form.airline.trim() || null,
          pickup_location: form.pickup_location.trim(),
          dropoff_location: form.dropoff_location.trim(),
          luggage_count: form.luggage_count,
        }
      : {
          ...base,
          tour_type: form.tour_type || null,
          hotel_address: form.hotel_address.trim(),
          duration_preference: form.duration_preference || null,
          accessibility_needs: form.has_accessibility ? (form.accessibility_needs.trim() || null) : null,
        };

    const { error: dbError } = await supabase.from('bookings').insert([payload]);

    if (dbError) {
      setSubmitting(false);
      setSubmitError('We could not save your booking. Please try again or contact us directly.');
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

    sessionStorage.setItem('bookingRef', booking_ref);

    await Swal.fire({
      title: 'Booking Received!',
      html: `Your booking reference is <strong>${booking_ref}</strong>.<br/>We'll confirm your reservation shortly.`,
      icon: 'success',
      confirmButtonColor: '#FFC845',
      confirmButtonText: 'Great!',
    });

    setForm(initial);
    setStep(1);
    if (mode === 'modal') closeModal();
    navigate('/thank-you');
  };

  // ── Render steps ─────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What can we help with?</h2>
        <p className="text-gray-500">Choose a service to get started</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Airport Transfer card */}
        <button
          type="button"
          onClick={() => {
            if (form.service_type !== 'airport') {
              set('service_type', 'airport');
              // Clear tour fields when switching
              setForm(p => ({ ...p, service_type: 'airport', tour_type: '', hotel_address: '', duration_preference: '' }));
            }
          }}
          className={cx(
            'flex-1 p-6 rounded-2xl border-2 text-left transition-all',
            form.service_type === 'airport'
              ? 'border-[#00B8B8] bg-[#00B8B8]/8 shadow-md'
              : 'border-gray-200 hover:border-[#00B8B8]/50 bg-white',
          )}
        >
          <div className={cx('w-14 h-14 rounded-xl flex items-center justify-center mb-4',
            form.service_type === 'airport' ? 'bg-[#00B8B8] text-white' : 'bg-gray-100 text-gray-500'
          )}>
            <Plane size={28} />
          </div>
          <div className="font-bold text-gray-900 text-lg mb-1">Airport Transfer</div>
          <div className="text-sm text-gray-500">Fixed rates from UVF &amp; SLU airports</div>
          {form.service_type === 'airport' && (
            <div className="mt-3 flex items-center gap-1 text-[#00B8B8] text-sm font-semibold">
              <CheckCircle2 size={16} /> Selected
            </div>
          )}
        </button>

        {/* Island Tour card */}
        <button
          type="button"
          onClick={() => {
            if (form.service_type !== 'tour') {
              setForm(p => ({
                ...p, service_type: 'tour',
                transfer_direction: '', flight_number: '', airline: '',
                pickup_location: '', dropoff_location: '', luggage_count: 0,
              }));
            }
          }}
          className={cx(
            'flex-1 p-6 rounded-2xl border-2 text-left transition-all',
            form.service_type === 'tour'
              ? 'border-[#00B8B8] bg-[#00B8B8]/8 shadow-md'
              : 'border-gray-200 hover:border-[#00B8B8]/50 bg-white',
          )}
        >
          <div className={cx('w-14 h-14 rounded-xl flex items-center justify-center mb-4',
            form.service_type === 'tour' ? 'bg-[#00B8B8] text-white' : 'bg-gray-100 text-gray-500'
          )}>
            <Map size={28} />
          </div>
          <div className="font-bold text-gray-900 text-lg mb-1">Island Tour</div>
          <div className="text-sm text-gray-500">Explore St. Lucia with a local expert</div>
          {form.service_type === 'tour' && (
            <div className="mt-3 flex items-center gap-1 text-[#00B8B8] text-sm font-semibold">
              <CheckCircle2 size={16} /> Selected
            </div>
          )}
        </button>
      </div>
      {errors.service_type && <p className={errorCls}>{errors.service_type}</p>}
    </div>
  );

  const renderStep2Airport = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Trip Details</h2>
        <p className="text-gray-500 text-sm">Airport Transfer</p>
      </div>

      <div>
        <label className={labelCls}>Transfer Direction *</label>
        <div className="flex gap-3 mt-1">
          <ToggleBtn active={form.transfer_direction === 'arrival'} onClick={() => set('transfer_direction', 'arrival')}>
            ✈ Arrival
          </ToggleBtn>
          <ToggleBtn active={form.transfer_direction === 'departure'} onClick={() => set('transfer_direction', 'departure')}>
            ✈ Departure
          </ToggleBtn>
        </div>
        {errors.transfer_direction && <p className={errorCls}>{errors.transfer_direction}</p>}
      </div>

      <div>
        <label htmlFor="flight_number" className={labelCls}>Flight Number *</label>
        <input
          id="flight_number" type="text" placeholder="e.g. AA 1234"
          className={cx(inputCls, errors.flight_number ? 'border-red-400' : 'border-gray-300')}
          value={form.flight_number}
          onChange={e => set('flight_number', e.target.value)}
        />
        {errors.flight_number && <p className={errorCls}>{errors.flight_number}</p>}
      </div>

      <div>
        <label htmlFor="airline" className={labelCls}>
          Airline <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="airline" type="text" placeholder="e.g. American Airlines"
          className={cx(inputCls, 'border-gray-300')}
          value={form.airline}
          onChange={e => set('airline', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="pickup_location" className={labelCls}>Pickup Location *</label>
        <input
          id="pickup_location" type="text" placeholder="e.g. Hewanorra Airport (UVF)"
          className={cx(inputCls, errors.pickup_location ? 'border-red-400' : 'border-gray-300')}
          value={form.pickup_location}
          onChange={e => set('pickup_location', e.target.value)}
        />
        {errors.pickup_location && <p className={errorCls}>{errors.pickup_location}</p>}
      </div>

      <div>
        <label htmlFor="dropoff_location" className={labelCls}>Drop-off Location *</label>
        <input
          id="dropoff_location" type="text" placeholder="e.g. Sandals Resort, Rodney Bay"
          className={cx(inputCls, errors.dropoff_location ? 'border-red-400' : 'border-gray-300')}
          value={form.dropoff_location}
          onChange={e => set('dropoff_location', e.target.value)}
        />
        {errors.dropoff_location && <p className={errorCls}>{errors.dropoff_location}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking_date" className={labelCls}>Date *</label>
          <input
            id="booking_date" type="date" min={today}
            className={cx(inputCls, errors.booking_date ? 'border-red-400' : 'border-gray-300')}
            value={form.booking_date}
            onChange={e => set('booking_date', e.target.value)}
          />
          {errors.booking_date && <p className={errorCls}>{errors.booking_date}</p>}
        </div>
        <div>
          <label htmlFor="pickup_time" className={labelCls}>Pickup Time *</label>
          <input
            id="pickup_time" type="time"
            className={cx(inputCls, errors.pickup_time ? 'border-red-400' : 'border-gray-300')}
            value={form.pickup_time}
            onChange={e => set('pickup_time', e.target.value)}
          />
          {errors.pickup_time && <p className={errorCls}>{errors.pickup_time}</p>}
        </div>
      </div>
    </div>
  );

  const tourOptions: { value: TourType; label: string; icon: React.ReactNode }[] = [
    { value: 'island_tour', label: 'Island Tour', icon: <Globe size={22} /> },
    { value: 'city_tour', label: 'City Tour', icon: <Building2 size={22} /> },
    { value: 'waterfall_tour', label: 'Waterfall Tour', icon: <Droplets size={22} /> },
    { value: 'sunset_tour', label: 'Sunset Tour', icon: <Sunset size={22} /> },
  ];

  const renderStep2Tour = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Trip Details</h2>
        <p className="text-gray-500 text-sm">Island Tour</p>
      </div>

      <div>
        <label className={labelCls}>Tour Type *</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {tourOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('tour_type', opt.value)}
              className={cx(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-all min-h-[80px] justify-center',
                form.tour_type === opt.value
                  ? 'border-[#00B8B8] bg-[#00B8B8]/8 text-[#00B8B8]'
                  : 'border-gray-200 text-gray-700 hover:border-[#00B8B8]/40',
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        {errors.tour_type && <p className={errorCls}>{errors.tour_type}</p>}
      </div>

      <div>
        <label htmlFor="hotel_address" className={labelCls}>Hotel / Pickup Address *</label>
        <input
          id="hotel_address" type="text" placeholder="Hotel name or full pickup address"
          className={cx(inputCls, errors.hotel_address ? 'border-red-400' : 'border-gray-300')}
          value={form.hotel_address}
          onChange={e => set('hotel_address', e.target.value)}
        />
        {errors.hotel_address && <p className={errorCls}>{errors.hotel_address}</p>}
      </div>

      <div>
        <label className={labelCls}>Duration *</label>
        <div className="flex gap-3 mt-1">
          <ToggleBtn active={form.duration_preference === 'half_day'} onClick={() => set('duration_preference', 'half_day')}>
            Half Day (~4h)
          </ToggleBtn>
          <ToggleBtn active={form.duration_preference === 'full_day'} onClick={() => set('duration_preference', 'full_day')}>
            Full Day (~8h)
          </ToggleBtn>
        </div>
        {errors.duration_preference && <p className={errorCls}>{errors.duration_preference}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking_date_t" className={labelCls}>Date *</label>
          <input
            id="booking_date_t" type="date" min={today}
            className={cx(inputCls, errors.booking_date ? 'border-red-400' : 'border-gray-300')}
            value={form.booking_date}
            onChange={e => set('booking_date', e.target.value)}
          />
          {errors.booking_date && <p className={errorCls}>{errors.booking_date}</p>}
        </div>
        <div>
          <label htmlFor="pickup_time_t" className={labelCls}>Pickup Time *</label>
          <input
            id="pickup_time_t" type="time"
            className={cx(inputCls, errors.pickup_time ? 'border-red-400' : 'border-gray-300')}
            value={form.pickup_time}
            onChange={e => set('pickup_time', e.target.value)}
          />
          {errors.pickup_time && <p className={errorCls}>{errors.pickup_time}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Passengers &amp; Luggage</h2>
        <p className="text-gray-500 text-sm">Tell us who's travelling</p>
      </div>

      <Stepper value={form.passengers} onChange={v => set('passengers', v)} min={1} max={10} label="Number of Passengers *" />

      {form.service_type === 'airport' && (
        <Stepper value={form.luggage_count} onChange={v => set('luggage_count', v)} min={0} max={10} label="Luggage Count" />
      )}

      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls}>Accessibility Needs</label>
          <button
            type="button"
            role="switch"
            aria-checked={form.has_accessibility}
            onClick={() => set('has_accessibility', !form.has_accessibility)}
            className={cx(
              'w-12 h-6 rounded-full transition-colors relative',
              form.has_accessibility ? 'bg-[#00B8B8]' : 'bg-gray-300',
            )}
          >
            <span className={cx(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              form.has_accessibility ? 'translate-x-6' : 'translate-x-0.5',
            )} />
          </button>
        </div>
        {form.has_accessibility && (
          <textarea
            className={cx(inputCls, 'border-gray-300 mt-3')}
            rows={3}
            placeholder="Describe your accessibility requirements"
            value={form.accessibility_needs}
            onChange={e => set('accessibility_needs', e.target.value)}
          />
        )}
      </div>

      <div>
        <label htmlFor="special_requests" className={labelCls}>
          Special Requests <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="special_requests"
          className={cx(inputCls, 'border-gray-300')}
          rows={3}
          maxLength={300}
          placeholder="Any special requests or requirements"
          value={form.special_requests}
          onChange={e => set('special_requests', e.target.value)}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{form.special_requests.length}/300</p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Contact Info</h2>
        <p className="text-gray-500 text-sm">We'll use this to confirm your booking</p>
      </div>

      <div>
        <label htmlFor="full_name" className={labelCls}>Full Name *</label>
        <input
          id="full_name" type="text" placeholder="Your full name"
          className={cx(inputCls, errors.full_name ? 'border-red-400' : 'border-gray-300')}
          value={form.full_name}
          onChange={e => set('full_name', e.target.value)}
        />
        {errors.full_name && <p className={errorCls}>{errors.full_name}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>Email *</label>
        <input
          id="email" type="email" placeholder="you@example.com"
          className={cx(inputCls, errors.email ? 'border-red-400' : 'border-gray-300')}
          value={form.email}
          onChange={e => set('email', e.target.value)}
        />
        {errors.email && <p className={errorCls}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={labelCls}>Phone / WhatsApp *</label>
        <input
          id="phone" type="tel" placeholder="+1 758 000 0000"
          className={cx(inputCls, errors.phone ? 'border-red-400' : 'border-gray-300')}
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
        />
        {errors.phone && <p className={errorCls}>{errors.phone}</p>}
        <p className="mt-2 text-xs text-gray-400">
          We'll send your confirmation to this email and may WhatsApp you if needed.
        </p>
      </div>
    </div>
  );

  const fmtDate = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const fmtTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  const tourLabels: Record<string, string> = {
    island_tour: 'Island Tour', city_tour: 'City Tour',
    waterfall_tour: 'Waterfall Tour', sunset_tour: 'Sunset Tour',
  };

  const renderStep5 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Review &amp; Confirm</h2>
        <p className="text-gray-500 text-sm">Check your details before confirming</p>
      </div>

      {/* Service */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Service</h3>
          <button type="button" onClick={() => goToStep(1)} className="text-sm text-[#00B8B8] font-semibold hover:underline">Edit</button>
        </div>
        <SummaryRow label="Type" value={form.service_type === 'airport' ? 'Airport Transfer' : 'Island Tour'} />
      </div>

      {/* Trip Details */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Trip Details</h3>
          <button type="button" onClick={() => goToStep(2)} className="text-sm text-[#00B8B8] font-semibold hover:underline">Edit</button>
        </div>
        {form.service_type === 'airport' ? (
          <>
            <SummaryRow label="Direction" value={form.transfer_direction === 'arrival' ? 'Arrival' : 'Departure'} />
            <SummaryRow label="Flight" value={form.flight_number} />
            {form.airline && <SummaryRow label="Airline" value={form.airline} />}
            <SummaryRow label="Pickup" value={form.pickup_location} />
            <SummaryRow label="Drop-off" value={form.dropoff_location} />
          </>
        ) : (
          <>
            <SummaryRow label="Tour" value={tourLabels[form.tour_type] || form.tour_type} />
            <SummaryRow label="Hotel / Pickup" value={form.hotel_address} />
            <SummaryRow label="Duration" value={form.duration_preference === 'half_day' ? 'Half Day' : 'Full Day'} />
          </>
        )}
        <SummaryRow label="Date" value={fmtDate(form.booking_date)} />
        <SummaryRow label="Pickup Time" value={fmtTime(form.pickup_time)} />
      </div>

      {/* Passengers */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Passengers</h3>
          <button type="button" onClick={() => goToStep(3)} className="text-sm text-[#00B8B8] font-semibold hover:underline">Edit</button>
        </div>
        <SummaryRow label="Passengers" value={form.passengers} />
        {form.service_type === 'airport' && <SummaryRow label="Luggage" value={`${form.luggage_count} bag${form.luggage_count !== 1 ? 's' : ''}`} />}
        {form.has_accessibility && <SummaryRow label="Accessibility" value={form.accessibility_needs || 'Yes (details not specified)'} />}
        {form.special_requests && <SummaryRow label="Special Requests" value={form.special_requests} />}
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Contact</h3>
          <button type="button" onClick={() => goToStep(4)} className="text-sm text-[#00B8B8] font-semibold hover:underline">Edit</button>
        </div>
        <SummaryRow label="Name" value={form.full_name} />
        <SummaryRow label="Email" value={form.email} />
        <SummaryRow label="Phone" value={form.phone} />
      </div>

      {/* Pricing note */}
      <div className="bg-[#FFC845]/10 border border-[#FFC845] rounded-xl p-4 text-sm text-gray-700">
        <strong>Pricing confirmed on booking</strong> — fixed rates, no surprises.
      </div>

      {/* Cancellation policy */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={e => set('agreed', e.target.checked)}
          className="mt-0.5 w-5 h-5 accent-[#00B8B8] flex-shrink-0"
        />
        <span className="text-sm text-gray-700">
          I agree to the <span className="text-[#00B8B8] font-semibold">cancellation policy</span> — free cancellation up to 24 hours before pickup.
        </span>
      </label>
      {errors.agreed && <p className={errorCls}>{errors.agreed}</p>}

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {submitError}
        </div>
      )}
    </div>
  );

  // ── Progress bar ─────────────────────────────────────────────────────────────

  const renderProgress = () => (
    <div>
      <div className="flex gap-1 mb-3">
        {STEP_LABELS.map((_, i) => {
          const s = i + 1;
          const done = step > s;
          const active = step === s;
          return (
            <div
              key={i}
              className={cx(
                'flex-1 h-1.5 rounded-full transition-all duration-300',
                done ? 'bg-[#00B8B8]' : active ? 'bg-[#00B8B8]' : 'bg-gray-200',
              )}
            />
          );
        })}
      </div>
      <div className="flex justify-between">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const active = step === s;
          return (
            <div key={i} className="flex flex-col items-center" style={{ width: '20%' }}>
              <div className={cx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1',
                done ? 'bg-[#00B8B8] text-white' : active ? 'bg-[#00B8B8] text-white' : 'bg-gray-200 text-gray-400',
              )}>
                {done ? <Check size={12} /> : s}
              </div>
              <span className={cx(
                'text-[10px] text-center leading-tight hidden sm:block',
                active ? 'text-[#00B8B8] font-semibold' : done ? 'text-[#00B8B8]' : 'text-gray-400',
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Navigation buttons ────────────────────────────────────────────────────────

  const renderNav = () => {
    const isLast = step === 5;
    const proceed = canProceed();
    return (
      <div className="flex gap-3 pt-6 pb-safe">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors min-h-[48px]"
          >
            <ChevronLeft size={18} /> Back
          </button>
        )}
        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !proceed}
            className="flex-1 py-4 rounded-xl bg-[#00B8B8] text-white font-bold text-lg hover:bg-[#00B8B8]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {submitting ? 'Confirming…' : 'Confirm Booking'}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!proceed}
            className="flex-1 py-4 rounded-xl bg-[#00B8B8] text-white font-bold text-lg hover:bg-[#00B8B8]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            Next
          </button>
        )}
      </div>
    );
  };

  // ── Compose form body ─────────────────────────────────────────────────────────

  const body = (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Header bar — fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <span className="font-bold text-gray-900 text-lg">Book Your Trip</span>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close booking"
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress bar — fixed below header */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-5 pb-3 border-b border-gray-100 bg-white">
        {renderProgress()}
      </div>

      {/* Scrollable step content — min-h-0 is required for overflow-y-auto to activate in a flex column */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        {step === 1 && renderStep1()}
        {step === 2 && form.service_type === 'airport' && renderStep2Airport()}
        {step === 2 && form.service_type === 'tour' && renderStep2Tour()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>

      {/* Nav buttons — fixed at bottom */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-3 border-t border-gray-100 bg-white" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        {renderNav()}
      </div>
    </div>
  );

  // ── Modal mode ────────────────────────────────────────────────────────────────

  if (mode === 'modal') {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        {/* Backdrop — does NOT close modal on click */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}>
          {body}
        </div>
      </div>
    );
  }

  // ── Page mode ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ paddingBottom: '200px' }}>
      {/* Minimal header */}
      <div className="bg-[#00B8B8] text-white py-3 px-4 text-center font-bold text-sm">
        FUNtastic Taxi &amp; Tours
      </div>
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {body}
      </div>
    </div>
  );
};

export default BookingModal;
