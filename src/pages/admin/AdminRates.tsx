import React, { useEffect, useState } from 'react';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Rate {
  id: string;
  airport: 'UVF' | 'SLU';
  destination: string;
  one_way_usd: number;
  round_trip_usd: number;
  updated_at: string;
}

const emptyRate = { airport: 'UVF' as const, destination: '', one_way_usd: 0, round_trip_usd: 0 };

const AdminRates: React.FC = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, Partial<Rate>>>({});
  const [adding, setAdding] = useState(false);
  const [newRate, setNewRate] = useState({ ...emptyRate });
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('rates').select('*').order('airport').order('destination');
    setRates(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveEdit = async (id: string) => {
    const patch = editing[id];
    if (!patch) return;
    setSaving(id);
    await supabase.from('rates').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    setSaving(null);
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
    load();
  };

  const cancelEdit = (id: string) => {
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const deleteRate = async (id: string) => {
    if (!confirm('Delete this rate?')) return;
    await supabase.from('rates').delete().eq('id', id);
    load();
  };

  const addRate = async () => {
    if (!newRate.destination) return;
    setSaving('new');
    await supabase.from('rates').insert([{ ...newRate, updated_at: new Date().toISOString() }]);
    setSaving(null);
    setAdding(false);
    setNewRate({ ...emptyRate });
    load();
  };

  const uvf = rates.filter(r => r.airport === 'UVF');
  const slu = rates.filter(r => r.airport === 'SLU');

  const RateTable = ({ group, label }: { group: Rate[]; label: string }) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-3">{label}</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Destination</th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium">One Way (USD)</th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium">Round Trip (USD)</th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {group.map((r) => {
              const isEditing = !!editing[r.id];
              const e = editing[r.id] ?? {};
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        className="border border-gray-300 rounded px-2 py-1 w-40 text-sm focus:ring-1 focus:ring-turquoise"
                        value={e.destination ?? r.destination}
                        onChange={ev => setEditing(p => ({ ...p, [r.id]: { ...p[r.id], destination: ev.target.value } }))}
                      />
                    ) : r.destination}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-sm text-right focus:ring-1 focus:ring-turquoise"
                        value={e.one_way_usd ?? r.one_way_usd}
                        onChange={ev => setEditing(p => ({ ...p, [r.id]: { ...p[r.id], one_way_usd: Number(ev.target.value) } }))}
                      />
                    ) : `$${r.one_way_usd}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-sm text-right focus:ring-1 focus:ring-turquoise"
                        value={e.round_trip_usd ?? r.round_trip_usd}
                        onChange={ev => setEditing(p => ({ ...p, [r.id]: { ...p[r.id], round_trip_usd: Number(ev.target.value) } }))}
                      />
                    ) : `$${r.round_trip_usd}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button disabled={saving === r.id} onClick={() => saveEdit(r.id)} className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">
                            <Check size={14} />
                          </button>
                          <button onClick={() => cancelEdit(r.id)} className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditing(p => ({ ...p, [r.id]: {} }))} className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteRate(r.id)} className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rates</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 transition-colors"
        >
          <Plus size={16} /> Add Rate
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border border-turquoise/40 p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">New Rate</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Airport</label>
              <select
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise"
                value={newRate.airport}
                onChange={e => setNewRate(p => ({ ...p, airport: e.target.value as 'UVF' | 'SLU' }))}
              >
                <option value="UVF">UVF</option>
                <option value="SLU">SLU</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Destination</label>
              <input
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise"
                value={newRate.destination}
                onChange={e => setNewRate(p => ({ ...p, destination: e.target.value }))}
                placeholder="e.g., Rodney Bay"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">One Way (USD)</label>
              <input
                type="number"
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise"
                value={newRate.one_way_usd}
                onChange={e => setNewRate(p => ({ ...p, one_way_usd: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Round Trip (USD)</label>
              <input
                type="number"
                className="border border-gray-300 rounded px-2 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise"
                value={newRate.round_trip_usd}
                onChange={e => setNewRate(p => ({ ...p, round_trip_usd: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button disabled={saving === 'new'} onClick={addRate} className="px-4 py-2 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 disabled:opacity-50 transition-colors">
              Save
            </button>
            <button onClick={() => { setAdding(false); setNewRate({ ...emptyRate }); }} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-turquoise" /> Loading…
        </div>
      ) : (
        <>
          <RateTable group={uvf} label="UVF – Hewanorra International Airport" />
          <RateTable group={slu} label="SLU – George F. L. Charles Airport" />
        </>
      )}
    </div>
  );
};

export default AdminRates;
