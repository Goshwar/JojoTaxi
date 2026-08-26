import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plane, Map } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';
import {
  Booking, BookingStatus, BookingType,
  bookingRoute, bookingTypeLabel, durationLabel, notifyBookingStatus,
  tourTypeLabel, transferDirectionLabel,
} from '../../lib/bookings';

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow/20 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

/*
 * Dispatch works one service at a time: a transfer is met at a terminal against
 * a flight number, a tour is collected from a hotel lobby. The two were listed
 * together with neither one's fields on screen, so this page splits them and
 * then shows each booking the columns that actually apply to it.
 */
const SERVICE_TABS: { key: BookingType | 'all'; label: string; icon?: typeof Plane }[] = [
  { key: 'all', label: 'All Bookings' },
  { key: 'airport_transfer', label: 'Airport Transfers', icon: Plane },
  { key: 'island_tour', label: 'Island Tours', icon: Map },
];

const STATUS_TABS: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'cancelled'];

/** Labelled cells for the expanded panel, keyed off what the booking actually is. */
const detailFields = (b: Booking): [string, string][] =>
  b.booking_type === 'airport_transfer'
    ? [
        ['Direction', transferDirectionLabel(b.transfer_direction)],
        ['Flight Number', b.flight_number || '—'],
        ['Airline', b.airline || '—'],
        ['Pickup', b.pickup_location || '—'],
        ['Drop-off', b.dropoff_location || '—'],
        ['Luggage', `${b.luggage_count ?? 0} bag(s)`],
      ]
    : [
        ['Tour', tourTypeLabel(b.tour_type)],
        ['Hotel / Pickup', b.hotel_address || '—'],
        ['Duration', durationLabel(b.duration_preference)],
        ['Accessibility Needs', b.accessibility_needs || 'None'],
      ];

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [service, setService] = useState<BookingType | 'all'>('all');
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (service !== 'all') q = q.eq('booking_type', service);
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [service, filter]);

  /** Pending count per service, so an unworked tour cannot hide behind transfers. */
  const pendingByService = useMemo(() => {
    const counts: Record<string, number> = { all: 0, airport_transfer: 0, island_tour: 0 };
    for (const b of bookings) {
      if (b.status !== 'pending') continue;
      counts.all += 1;
      counts[b.booking_type] = (counts[b.booking_type] ?? 0) + 1;
    }
    return counts;
  }, [bookings]);

  const setStatus = async (booking: Booking, status: BookingStatus) => {
    let decline_reason: string | null = booking.decline_reason;

    if (status === 'cancelled') {
      const { isConfirmed, value } = await Swal.fire({
        title: 'Cancel this booking?',
        input: 'text',
        inputLabel: 'Reason for the customer (optional)',
        inputPlaceholder: 'e.g. No vehicle available for that time',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, cancel it',
        cancelButtonText: 'Keep booking',
      });
      if (!isConfirmed) return;
      decline_reason = (value as string)?.trim() || null;
    }

    setUpdating(booking.id);
    const patch: Partial<Booking> = { status, updated_at: new Date().toISOString() };
    if (status === 'cancelled') patch.decline_reason = decline_reason;

    const { error } = await supabase.from('bookings').update(patch).eq('id', booking.id);
    setUpdating(null);

    if (error) {
      await Swal.fire({
        title: 'Could not update booking',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#FFC845',
      });
      return;
    }

    // Tell the customer. Moving back to pending is an internal correction, so
    // it stays silent — there is no "your booking is un-confirmed" email.
    if (status !== 'pending') {
      notifyBookingStatus({ ...booking, decline_reason }, status, decline_reason ?? undefined);
    }

    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      {/* Service tabs — which operation this booking belongs to */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {SERVICE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setService(key); setExpanded(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              service === key
                ? 'bg-turquoise text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {Icon && <Icon size={16} />}
            {label}
            {pendingByService[key] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                service === key ? 'bg-white/25 text-white' : 'bg-yellow/30 text-yellow-800'
              }`}>
                {pendingByService[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-turquoise" /> Loading…
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const isTransfer = b.booking_type === 'airport_transfer';
            const TypeIcon = isTransfer ? Plane : Map;

            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${
                        isTransfer ? 'bg-turquoise/10 text-turquoise' : 'bg-yellow/20 text-yellow-800'
                      }`}
                      title={bookingTypeLabel(b.booking_type)}
                    >
                      <TypeIcon size={13} />
                      {bookingTypeLabel(b.booking_type)}
                    </span>
                    <span className="font-mono text-xs text-gray-400">{b.booking_ref}</span>
                    <span className="font-semibold text-gray-900">{b.full_name}</span>
                    <span className="text-sm text-gray-500">{bookingRoute(b)}</span>
                    <span className="text-sm text-gray-500">{b.booking_date} {b.pickup_time}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  {expanded === b.id
                    ? <ChevronUp size={18} className="text-gray-400 shrink-0" />
                    : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                </button>

                {expanded === b.id && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      {([
                        ['Email', b.email],
                        ['Phone / WhatsApp', b.phone],
                        ['Passengers', String(b.passengers)],
                        ...detailFields(b),
                        ['Special Requests', b.special_requests || '—'],
                        ['Submitted', new Date(b.created_at).toLocaleString()],
                        ...(b.decline_reason ? [['Cancellation Reason', b.decline_reason] as [string, string]] : []),
                      ] as [string, string][]).map(([label, val]) => (
                        <div key={label}>
                          <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                          <p className="text-gray-800 font-medium break-words">{val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {b.status !== 'confirmed' && (
                        <button
                          disabled={updating === b.id}
                          onClick={() => setStatus(b, 'confirmed')}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status !== 'pending' && (
                        <button
                          disabled={updating === b.id}
                          onClick={() => setStatus(b, 'pending')}
                          className="px-3 py-1.5 bg-yellow text-gray-900 text-sm rounded-lg hover:bg-yellow/90 disabled:opacity-50 transition-colors"
                        >
                          Mark Pending
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          disabled={updating === b.id}
                          onClick={() => setStatus(b, 'cancelled')}
                          className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
