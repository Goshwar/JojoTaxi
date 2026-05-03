import React, { useEffect, useMemo, useState } from 'react';
import { Check, Search, Star, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  name: string;
  location: string;
  service_type?: string;
  rating: number;
  comment: string;
  photo_urls?: string[];
  image_urls?: string[];
  approved: boolean;
  featured?: boolean;
  source?: string;
  review_date?: string;
  created_at: string;
}

type Tab = 'all' | 'pending' | 'approved';

function getPhotos(r: Review): string[] {
  return [...(r.image_urls ?? []), ...(r.photo_urls ?? [])];
}

function SourceBadge({ source }: { source?: string }) {
  const s = (source ?? '').toLowerCase();
  if (s === 'google')
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Google</span>;
  if (s === 'tripadvisor')
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">TripAdvisor</span>;
  if (s === 'manual')
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">Manual</span>;
  return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-700">Website</span>;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex gap-3 items-center">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 rounded" />
          <div className="h-3 w-1/3 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="h-8 w-20 bg-gray-200 rounded-lg" />
          <div className="h-8 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const AdminReviews: React.FC = () => {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    setAllReviews(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const pending = useMemo(() => allReviews.filter(r => !r.approved), [allReviews]);
  const approved = useMemo(() => allReviews.filter(r => r.approved), [allReviews]);

  const tabReviews = useMemo(
    () => (tab === 'pending' ? pending : tab === 'approved' ? approved : allReviews),
    [tab, pending, approved, allReviews]
  );

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tabReviews;
    return tabReviews.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
    );
  }, [tabReviews, search]);

  const setApproval = async (id: string, value: boolean) => {
    setUpdating(id);
    await supabase.from('reviews').update({ approved: value }).eq('id', id);
    setAllReviews(prev => prev.map(r => r.id === id ? { ...r, approved: value } : r));
    setUpdating(null);
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    setUpdating(id);
    await supabase.from('reviews').update({ featured: !current }).eq('id', id);
    setAllReviews(prev => prev.map(r => r.id === id ? { ...r, featured: !current } : r));
    setUpdating(null);
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Delete this review permanently? This cannot be undone.')) return;
    setUpdating(id);
    await supabase.from('reviews').delete().eq('id', id);
    setAllReviews(prev => prev.filter(r => r.id !== id));
    setUpdating(null);
  };

  const formatDate = (r: Review) => {
    const raw = r.review_date || r.created_at;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const emptyMessages: Record<Tab, string> = {
    pending: "You're all caught up — no pending reviews.",
    approved: 'No approved reviews yet. Approve some from the Pending tab.',
    all: 'No reviews have been submitted yet.',
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allReviews.length },
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'approved', label: 'Approved', count: approved.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-turquoise text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
            <span
              className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold ${
                tab === key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, location or comment…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-turquoise/40 focus:border-turquoise transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16">
          <Star size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium text-gray-500">
            {search.trim() ? `No reviews match "${search}"` : emptyMessages[tab]}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(r => {
            const photos = getPhotos(r);
            const busy = updating === r.id;
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left: review body */}
                  <div className="flex-1 min-w-0">
                    {/* Name · location · source badge · featured badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{r.name}</span>
                      <span className="text-sm text-gray-400">{r.location}</span>
                      <SourceBadge source={r.source} />
                      {r.featured && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow/20 text-yellow-700">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    {/* Service type + stars */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {r.service_type && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {r.service_type}
                        </span>
                      )}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= r.rating ? 'fill-yellow text-yellow' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">{r.comment}</p>

                    {/* Photo thumbnails */}
                    {photos.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {photos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Photo ${i + 1}`}
                              className="w-[60px] h-[60px] object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-400">{formatDate(r)}</p>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!r.approved ? (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => setApproval(r.id, true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => deleteReview(r.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                        >
                          <X size={14} />
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => toggleFeatured(r.id, !!r.featured)}
                          className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                            r.featured
                              ? 'bg-yellow/20 text-yellow-800 hover:bg-yellow/30'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {r.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => setApproval(r.id, false)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          Unapprove
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => deleteReview(r.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                        >
                          <X size={14} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
