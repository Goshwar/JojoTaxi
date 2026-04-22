import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Booking {
  id: string;
  booking_ref: string;
  name: string;
  email: string;
  phone: string;
  pickup: string;
  dropoff: string;
  pickup_date: string;
  pickup_time: string;
  passengers: number;
  luggage: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow/20 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    const { data } = filter === 'all' ? await q : await q.eq('status', filter);
    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: Booking['status']) => {
    setUpdating(id);
    await supabase.from('bookings').update({ status }).eq('id', id);
    setUpdating(null);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
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
                  <span className="font-semibold text-gray-900">{b.name}</span>
                  <span className="text-sm text-gray-500">{b.pickup} → {b.dropoff}</span>
                  <span className="text-sm text-gray-500">{b.pickup_date} {b.pickup_time}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                {expanded === b.id ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
              </button>

              {expanded === b.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    {[
                      ['Email', b.email],
                      ['Phone', b.phone],
                      ['Passengers', String(b.passengers)],
                      ['Luggage', b.luggage || '—'],
                      ['Submitted', new Date(b.created_at).toLocaleString()],
                      ['Notes', b.notes || '—'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
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
                    {b.status !== 'cancelled' && (
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
