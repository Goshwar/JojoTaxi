import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Star, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  pendingBookings: number;
  pendingReviews: number;
  unreadMessages: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ pendingBookings: 0, pendingReviews: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [bookings, reviews, messages] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('read', false),
      ]);
      setStats({
        pendingBookings: bookings.count ?? 0,
        pendingReviews: reviews.count ?? 0,
        unreadMessages: messages.count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: CalendarCheck, to: '/admin/bookings', color: 'bg-turquoise/10 text-turquoise' },
    { label: 'Reviews Awaiting Approval', value: stats.pendingReviews, icon: Star, to: '/admin/reviews', color: 'bg-yellow/20 text-yellow-700' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, to: '/admin/messages', color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-turquoise" />
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map(({ label, value, icon: Icon, to, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-gray-400" />
          <h2 className="font-semibold text-gray-800">Quick Links</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { to: '/admin/bookings', label: 'View all bookings' },
            { to: '/admin/reviews', label: 'Moderate reviews' },
            { to: '/admin/messages', label: 'Read messages' },
            { to: '/admin/rates', label: 'Edit rates' },
            { to: '/admin/fleet', label: 'Manage fleet' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="text-sm text-turquoise hover:underline">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
