import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Status = 'pending' | 'confirmed' | 'declined' | 'cancelled';

// Matches the live `bookings` table, not supabase/migrations (see CLAUDE.md).
interface Booking {
  id: string;
  booking_ref: string;
  booking_type: 'airport_transfer' | 'island_tour';
  status: Status;
  full_name: string;
  email: string;
  phone: string;
  passengers: number;
  booking_date: string;
  pickup_time: string;
  special_requests: string | null;
  transfer_direction: string | null;
  flight_number: string | null;
  airline: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  luggage_count: number | null;
  tour_type: string | null;
  hotel_address: string | null;
  duration_preference: string | null;
  accessibility_needs: string | null;
  decline_reason: string | null;
  created_at: string;
}

// `declined` is set by the n8n email-approval link; `cancelled` by this page.
const STATUSES: Status[] = ['pending', 'confirmed', 'declined', 'cancelled'];

const STATUS_COLORS: Record<Status, string> = {
  pending: 'bg-yellow/20 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  declined: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const label = (v: string | null) => (v ? v.replace(/_/g, ' ') : '—');

const route = (b: Booking) =>
  b.booking_type === 'airport_transfer'
    ? `${b.pickup_location ?? '—'} → ${b.dropoff_location ?? '—'}`
    : `${label(b.tour_type)} from ${b.hotel_address ?? '—'}`;

const details = (b: Booking): [string, string][] => [
  ['Email', b.email],
  ['Phone', b.phone],
  ['Passengers', String(b.passengers)],
  ...(b.booking_type === 'airport_transfer'
    ? ([
        ['Direction', label(b.transfer_direction)],
        ['Flight', [b.flight_number, b.airline].filter(Boolean).join(' · ') || '—'],
        ['Luggage', b.luggage_count != null ? `${b.luggage_count} bag(s)` : '—'],
      ] as [string, string][])
    : ([
        ['Duration', label(b.duration_preference)],
        ['Accessibility', b.accessibility_needs || '—'],
      ] as [string, string][])),
  ['Submitted', new Date(b.created_at).toLocaleString()],
  ['Notes', b.special_requests || '—'],
  ...(b.status === 'declined' && b.decline_reason
    ? ([['Decline reason', b.decline_reason]] as [string, string][])
    : []),
];

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    const { data } = filter === 'all' ? await q : await q.eq('status', filter);
    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: Status) => {
    setUpdating(id);
    await supabase.from('bookings').update({ status }).eq('id', id);
    setUpdating(null);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-turquoise text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-mono text-xs text-gray-400">{b.booking_ref}</span>
                  <span className="font-semibold text-gray-900">{b.full_name}</span>
                  <span className="text-sm text-gray-500">{route(b)}</span>
                  <span className="text-sm text-gray-500">{b.booking_date} {b.pickup_time?.slice(0, 5)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                {expanded === b.id ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
              </button>

              {expanded === b.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    {details(b).map(([name, val]) => (
                      <div key={name}>
                        <p className="text-gray-400 text-xs mb-0.5">{name}</p>
                        <p className="text-gray-800 font-medium">{val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {b.status !== 'confirmed' && (
                      <button
                        disabled={updating === b.id}
                        onClick={() => setStatus(b.id, 'confirmed')}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {b.status !== 'pending' && (
                      <button
                        disabled={updating === b.id}
                        onClick={() => setStatus(b.id, 'pending')}
                        className="px-3 py-1.5 bg-yellow text-gray-900 text-sm rounded-lg hover:bg-yellow/90 disabled:opacity-50 transition-colors"
                      >
                        Mark Pending
                      </button>
                    )}
                    {b.status !== 'cancelled' && b.status !== 'declined' && (
                      <button
                        disabled={updating === b.id}
                        onClick={() => setStatus(b.id, 'cancelled')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
