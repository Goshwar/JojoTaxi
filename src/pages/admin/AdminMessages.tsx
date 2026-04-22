import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MailOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread');

  const load = async () => {
    setLoading(true);
    let q = supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (filter === 'unread') q = q.eq('read', false);
    if (filter === 'read') q = q.eq('read', true);
    const { data } = await q;
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const markRead = async (id: string, read: boolean) => {
    await supabase.from('contact_messages').update({ read }).eq('id', id);
    load();
  };

  const handleExpand = async (id: string, isRead: boolean) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next && !isRead) await markRead(id, true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Messages</h1>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'unread', 'read'] as const).map((s) => (
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
      ) : messages.length === 0 ? (
        <p className="text-gray-500">No messages found.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`bg-white rounded-xl border overflow-hidden ${m.read ? 'border-gray-200' : 'border-turquoise/40'}`}>
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => handleExpand(m.id, m.read)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {m.read ? <MailOpen size={16} className="text-gray-400 shrink-0" /> : <Mail size={16} className="text-turquoise shrink-0" />}
                  <span className={`font-semibold ${m.read ? 'text-gray-700' : 'text-gray-900'}`}>{m.name}</span>
                  <span className="text-sm text-gray-500">{m.email}</span>
                  {m.subject && <span className="text-sm text-gray-500 italic">"{m.subject}"</span>}
                  <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
                  {!m.read && <span className="bg-turquoise text-white text-xs px-2 py-0.5 rounded-full">New</span>}
                </div>
                {expanded === m.id ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
              </button>

              {expanded === m.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    {[['Phone', m.phone || '—'], ['Subject', m.subject || '—']].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                        <p className="text-gray-800 font-medium">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                    {m.message}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your inquiry')}`}
                      className="px-3 py-1.5 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 transition-colors"
                    >
                      Reply by Email
                    </a>
                    {m.read ? (
                      <button
                        onClick={() => markRead(m.id, false)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Mark Unread
                      </button>
                    ) : (
                      <button
                        onClick={() => markRead(m.id, true)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Mark Read
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

export default AdminMessages;
