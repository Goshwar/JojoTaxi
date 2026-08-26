/*
 * One description of a booking, shared by the form that creates it and the
 * admin screen that works it.
 *
 * The two used to carry their own private copies of the shape, and they drifted:
 * the form wrote the live column names while the admin list read the ones from
 * `supabase/migrations/20260422025600_add_bookings_contact_rates_fleet.sql`,
 * which was never applied. Bookings saved correctly and then rendered blank.
 * Everything that names a `bookings` column now names it here.
 */

/** What the customer is buying. Mirrors the `bookings_booking_type_check` constraint. */
export type BookingType = 'airport_transfer' | 'island_tour';

/** Mirrors `bookings_status_check`. Postgres rejects anything else outright. */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type TransferDirection = 'arrival' | 'departure';
export type TourType = 'island_tour' | 'city_tour' | 'waterfall_tour' | 'sunset_tour';
export type DurationPreference = 'half_day' | 'full_day';

/** A row of `public.bookings` as the live database actually defines it. */
export interface Booking {
  id: string;
  created_at: string;
  updated_at: string | null;
  booking_ref: string;
  booking_type: BookingType;
  status: BookingStatus;

  full_name: string;
  email: string;
  phone: string;
  passengers: number;
  booking_date: string;
  pickup_time: string;
  special_requests: string | null;

  // Airport transfers only.
  transfer_direction: TransferDirection | null;
  flight_number: string | null;
  airline: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  luggage_count: number | null;

  // Island tours only.
  tour_type: TourType | null;
  hotel_address: string | null;
  duration_preference: DurationPreference | null;
  accessibility_needs: string | null;

  admin_notes: string | null;
  decline_reason: string | null;
}

// ─── Display labels ───────────────────────────────────────────────────────────

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  airport_transfer: 'Airport Transfer',
  island_tour: 'Island Tour',
};

export const TOUR_TYPE_LABELS: Record<TourType, string> = {
  island_tour: 'Island Tour',
  city_tour: 'City Tour',
  waterfall_tour: 'Waterfall Tour',
  sunset_tour: 'Sunset Tour',
};

export const DURATION_LABELS: Record<DurationPreference, string> = {
  half_day: 'Half Day',
  full_day: 'Full Day',
};

export const TRANSFER_DIRECTION_LABELS: Record<TransferDirection, string> = {
  arrival: 'Arrival (airport pickup)',
  departure: 'Departure (airport drop-off)',
};

const labelOr = <T extends string>(map: Record<T, string>, key: T | null, fallback = '—') =>
  key ? map[key] ?? key : fallback;

export const bookingTypeLabel = (t: BookingType) => BOOKING_TYPE_LABELS[t] ?? t;
export const tourTypeLabel = (t: TourType | null) => labelOr(TOUR_TYPE_LABELS, t);
export const durationLabel = (d: DurationPreference | null) => labelOr(DURATION_LABELS, d);
export const transferDirectionLabel = (d: TransferDirection | null) =>
  labelOr(TRANSFER_DIRECTION_LABELS, d);

/**
 * The one-line "where is this going" summary. An airport transfer is a route;
 * a tour is a product collected from a hotel. Showing a transfer's columns for
 * a tour is how the admin list came to read `—  →  —` for every tour booking.
 */
export const bookingRoute = (b: Booking): string =>
  b.booking_type === 'airport_transfer'
    ? `${b.pickup_location || '—'} → ${b.dropoff_location || '—'}`
    : `${tourTypeLabel(b.tour_type)} · from ${b.hotel_address || '—'}`;

// ─── Creating a booking ───────────────────────────────────────────────────────

/** `FTT-YYYYMMDD-NNNN`. Generated client-side; `booking_ref` is UNIQUE. */
export const makeBookingRef = (): string => {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `FTT-${dateStamp}-${rand}`;
};

/** The fields every booking carries, whatever it is. */
export interface BookingContact {
  full_name: string;
  email: string;
  phone: string;
  passengers: number;
  booking_date: string;
  pickup_time: string;
  special_requests: string;
}

export interface AirportDetails {
  transfer_direction: TransferDirection | '';
  flight_number: string;
  airline: string;
  pickup_location: string;
  dropoff_location: string;
  luggage_count: number;
}

export interface TourDetails {
  tour_type: TourType | '';
  hotel_address: string;
  duration_preference: DurationPreference | '';
  accessibility_needs: string | null;
}

export type NewBooking =
  & { booking_ref: string; booking_type: BookingType; status: BookingStatus }
  & Omit<BookingContact, 'special_requests'>
  & { special_requests: string | null }
  & Partial<Record<keyof AirportDetails | keyof TourDetails, unknown>>;

/**
 * Builds the row to insert.
 *
 * The branch matters beyond tidiness: `bookings_tour_type_check` and
 * `bookings_duration_preference_check` reject an empty string, so a transfer
 * must omit the tour columns rather than send `''` for them, and vice versa.
 */
export const buildBookingPayload = (
  booking_type: BookingType,
  contact: BookingContact,
  details: AirportDetails | TourDetails,
  booking_ref: string = makeBookingRef(),
): NewBooking => {
  const base = {
    booking_ref,
    booking_type,
    status: 'pending' as const,
    full_name: contact.full_name.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
    passengers: Number(contact.passengers),
    booking_date: contact.booking_date,
    pickup_time: contact.pickup_time,
    special_requests: contact.special_requests.trim() || null,
  };

  if (booking_type === 'airport_transfer') {
    const d = details as AirportDetails;
    return {
      ...base,
      transfer_direction: d.transfer_direction || null,
      flight_number: d.flight_number.trim(),
      airline: d.airline.trim() || null,
      pickup_location: d.pickup_location.trim(),
      dropoff_location: d.dropoff_location.trim(),
      luggage_count: Number(d.luggage_count),
    };
  }

  const d = details as TourDetails;
  return {
    ...base,
    tour_type: d.tour_type || null,
    hotel_address: d.hotel_address.trim(),
    duration_preference: d.duration_preference || null,
    accessibility_needs: d.accessibility_needs?.trim() || null,
  };
};

// ─── n8n notifications ────────────────────────────────────────────────────────

/*
 * Both webhooks are fire-and-forget. A booking that is safely in Postgres is
 * already a booking; failing the customer's submit because Gmail or Render is
 * having a bad minute would lose it for no gain.
 */
const postWebhook = (url: string | undefined, body: unknown) => {
  if (!url) return;
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
};

/**
 * `FTT — New Booking Received` — emails the admin an approve/decline pair and
 * the customer a "we have it" receipt. It branches on `booking_type`, so the
 * whole row goes over as-is.
 */
export const notifyNewBooking = (payload: NewBooking) =>
  postWebhook(import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined, payload);

/**
 * `FTT — Booking Status Update` — the customer-facing half of a decision made
 * in the admin panel. Until this existed on the button, confirming a booking
 * here updated Postgres and told the customer nothing; only the approve link
 * in the admin's email ever sent them anything.
 *
 * That workflow's switch reads `confirmed` / `declined`, while the column is
 * constrained to `confirmed` / `cancelled`. The database wins and the mapping
 * lives here, at the boundary, so only this function knows both vocabularies.
 */
export const notifyBookingStatus = (
  booking: Booking,
  status: Exclude<BookingStatus, 'pending'>,
  decline_reason?: string,
) =>
  postWebhook(import.meta.env.VITE_N8N_STATUS_WEBHOOK_URL as string | undefined, {
    booking_ref: booking.booking_ref,
    status: status === 'cancelled' ? 'declined' : 'confirmed',
    customer_name: booking.full_name,
    customer_email: booking.email,
    booking_type_label: bookingTypeLabel(booking.booking_type),
    booking_date: booking.booking_date,
    pickup_time: booking.pickup_time,
    decline_reason: decline_reason ?? booking.decline_reason ?? '',
  });
