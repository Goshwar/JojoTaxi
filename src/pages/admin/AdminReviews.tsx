import React, { useEffect, useState } from 'react';
import { Star, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  photo_urls: string[];
  approved: boolean;
  created_at: string;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') q = q.eq('approved', false);
    if (filter === 'approved') q = q.eq('approved', true);
    const { data } = await q;
    setReviews(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const setApproval = async (id: string, approved: boolean) => {
    setUpdating(id);
    await supabase.from('reviews').update({ approved }).eq('id', id);
    setUpdating(null);
    load();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    setUpdating(id);
    await supabase.from('reviews').delete().eq('id', id);
    setUpdating(null);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h1>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'pending', 'approved'] as const).map((s) => (
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
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900">{r.name}</span>
                    <span className="text-sm text-gray-400">{r.location}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={14} className={s <= r.rating ? 'fill-yellow text-yellow' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow/20 text-yellow-800'}`}>
                      {r.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
                  {r.photo_urls?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {r.photo_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!r.approved && (
                    <button
                      disabled={updating === r.id}
                      onClick={() => setApproval(r.id, true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {r.approved && (
                    <button
                      disabled={updating === r.id}
                      onClick={() => setApproval(r.id, false)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    disabled={updating === r.id}
                    onClick={() => deleteReview(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                  >
                    <X size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
