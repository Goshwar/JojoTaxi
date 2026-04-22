import React, { useEffect, useState } from 'react';
import { Pencil, Check, X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Vehicle {
  id: string;
  name: string;
  description: string;
  capacity: number;
  luggage_capacity: number;
  image_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

const emptyVehicle = { name: '', description: '', capacity: 1, luggage_capacity: 0, image_url: '', active: true, sort_order: 0 };

const AdminFleet: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});
  const [adding, setAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ ...emptyVehicle });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('fleet_vehicles').select('*').order('sort_order').order('name');
    setVehicles(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (v: Vehicle) => {
    setEditing(v.id);
    setEditData({ name: v.name, description: v.description, capacity: v.capacity, luggage_capacity: v.luggage_capacity, image_url: v.image_url, sort_order: v.sort_order });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase.from('fleet_vehicles').update(editData).eq('id', editing);
    setSaving(false);
    setEditing(null);
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('fleet_vehicles').update({ active: !active }).eq('id', id);
    load();
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return;
    await supabase.from('fleet_vehicles').delete().eq('id', id);
    load();
  };

  const addVehicle = async () => {
    if (!newVehicle.name) return;
    setSaving(true);
    await supabase.from('fleet_vehicles').insert([newVehicle]);
    setSaving(false);
    setAdding(false);
    setNewVehicle({ ...emptyVehicle });
    load();
  };

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fleet</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 transition-colors"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border border-turquoise/40 p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">New Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Name">
              <input className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={newVehicle.name} onChange={e => setNewVehicle(p => ({ ...p, name: e.target.value }))} placeholder="Executive Sedan" />
            </F>
            <F label="Sort Order">
              <input type="number" className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={newVehicle.sort_order} onChange={e => setNewVehicle(p => ({ ...p, sort_order: Number(e.target.value) }))} />
            </F>
            <F label="Passenger Capacity">
              <input type="number" className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={newVehicle.capacity} onChange={e => setNewVehicle(p => ({ ...p, capacity: Number(e.target.value) }))} />
            </F>
            <F label="Luggage Capacity (suitcases)">
              <input type="number" className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={newVehicle.luggage_capacity} onChange={e => setNewVehicle(p => ({ ...p, luggage_capacity: Number(e.target.value) }))} />
            </F>
            <div className="md:col-span-2">
              <F label="Description">
                <textarea rows={2} className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={newVehicle.description} onChange={e => setNewVehicle(p => ({ ...p, description: e.target.value }))} />
              </F>
            </div>
            <div className="md:col-span-2">
              <F label="Image URL (optional)">
                <input className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={newVehicle.image_url} onChange={e => setNewVehicle(p => ({ ...p, image_url: e.target.value }))} placeholder="https://…" />
              </F>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button disabled={saving} onClick={addVehicle} className="px-4 py-2 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => { setAdding(false); setNewVehicle({ ...emptyVehicle }); }} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500"><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-turquoise" /> Loading…</div>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => (
            <div key={v.id} className={`bg-white rounded-xl border ${v.active ? 'border-gray-200' : 'border-gray-200 opacity-60'} p-5`}>
              {editing === v.id ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <F label="Name">
                      <input className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={editData.name ?? ''} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
                    </F>
                    <F label="Sort Order">
                      <input type="number" className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={editData.sort_order ?? 0} onChange={e => setEditData(p => ({ ...p, sort_order: Number(e.target.value) }))} />
                    </F>
                    <F label="Passenger Capacity">
                      <input type="number" className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={editData.capacity ?? 1} onChange={e => setEditData(p => ({ ...p, capacity: Number(e.target.value) }))} />
                    </F>
                    <F label="Luggage Capacity">
                      <input type="number" className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={editData.luggage_capacity ?? 0} onChange={e => setEditData(p => ({ ...p, luggage_capacity: Number(e.target.value) }))} />
                    </F>
                    <div className="md:col-span-2">
                      <F label="Description">
                        <textarea rows={2} className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={editData.description ?? ''} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} />
                      </F>
                    </div>
                    <div className="md:col-span-2">
                      <F label="Image URL">
                        <input className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-turquoise" value={editData.image_url ?? ''} onChange={e => setEditData(p => ({ ...p, image_url: e.target.value }))} />
                      </F>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={saving} onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"><Check size={14} /> Save</button>
                    <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"><X size={14} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {v.image_url ? (
                      <img src={v.image_url} alt={v.name} className="w-20 h-16 object-cover rounded-lg border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs text-gray-400">No img</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{v.name}</h3>
                        {!v.active && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Hidden</span>}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{v.description}</p>
                      <p className="text-xs text-gray-400">Up to {v.capacity} passengers · {v.luggage_capacity} suitcases</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(v.id, v.active)} className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title={v.active ? 'Hide' : 'Show'}>
                      {v.active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => startEdit(v)} className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteVehicle(v.id)} className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                      <Trash2 size={15} />
                    </button>
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

export default AdminFleet;
