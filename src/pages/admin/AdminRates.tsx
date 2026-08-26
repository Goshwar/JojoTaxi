import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  Pencil, Check, X, Plus, Trash2, Eye, EyeOff,
  ArrowUp, ArrowDown, UploadCloud, Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { roundTripFare, discountLabel, formatRatesUpdated } from '../../data/zones';
import { TRANSFER_ROUTES } from '../../data/transferRoutes';

/**
 * Zone pricing — the numbers the public site publishes.
 *
 * Editing here changes what visitors see immediately: /rates-and-zones, the
 * corridor landing pages and the FAQ price answer all re-read this table in
 * the browser. What it does NOT change on its own is the prerendered HTML a
 * search crawler downloads, or llms.txt, because those are files on disk.
 * "Publish" rebuilds them. The banner in this page says so, because an owner
 * who does not know that will assume Google saw the change.
 */

interface ZoneRate {
  id: string;
  zone_key: string;
  name: string;
  areas: string;
  uvf_usd: number;
  slu_usd: number;
  sort_order: number;
  active: boolean;
  updated_at: string;
}

interface PricingSettings {
  round_trip_discount: number;
  rates_updated: string;
  last_published_at: string | null;
  updated_at: string;
}

interface ServiceRateRow {
  id: string;
  service_key: string;
  name: string;
  price_usd: number;
  price_unit: 'flat' | 'hourly';
  summary: string;
  includes: string[];
  sort_order: number;
  active: boolean;
}

type ServiceDraft = {
  service_key: string;
  name: string;
  price_usd: number;
  price_unit: 'flat' | 'hourly';
  summary: string;
  /** Edited as one bullet per line; split on save. */
  includes: string;
};

const emptyService: ServiceDraft = {
  service_key: '', name: '', price_usd: 0, price_unit: 'flat', summary: '', includes: '',
};

/** Textarea lines → array, dropping blanks so a stray newline is not a bullet. */
const toBullets = (text: string): string[] =>
  text.split('\n').map((line) => line.trim()).filter(Boolean);

type Draft = {
  zone_key: string;
  name: string;
  areas: string;
  uvf_usd: number;
  slu_usd: number;
};

const emptyDraft: Draft = { zone_key: '', name: '', areas: '', uvf_usd: 0, slu_usd: 0 };

/** 'Zone 6' → 'zone-6'. Only ever suggested for new zones; keys never change. */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    // Strip combining accents so "Soufrière" keys as 'soufriere', not 'soufri-re'.
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Corridor pages that would lose their fare if this zone disappeared. */
const routesUsingZone = (zoneKey: string) =>
  TRANSFER_ROUTES.filter((route) => route.zoneKey === zoneKey);

const inputClass =
  'border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-turquoise focus:outline-none';

const AdminRates: React.FC = () => {
  const [zones, setZones] = useState<ZoneRate[]>([]);
  const [services, setServices] = useState<ServiceRateRow[]>([]);
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(emptyService);
  const [addingService, setAddingService] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [adding, setAdding] = useState(false);
  const [newZone, setNewZone] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [zoneResult, serviceResult, settingsResult] = await Promise.all([
      supabase.from('zone_rates').select('*').order('sort_order').order('name'),
      supabase.from('service_rates').select('*').order('sort_order').order('name'),
      supabase.from('pricing_settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    setZones(zoneResult.data ?? []);
    setServices(serviceResult.data ?? []);
    setSettings(settingsResult.data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const discount = settings?.round_trip_discount ?? 0.1;

  /** The published site is behind whenever prices moved after the last build. */
  const isStale = useMemo(() => {
    if (!settings) return false;
    if (!settings.last_published_at) return true;
    return new Date(settings.last_published_at) < new Date(settings.updated_at);
  }, [settings]);

  const fail = (message: string) =>
    Swal.fire({ icon: 'error', title: 'Could not save', text: message });

  const startEdit = (zone: ZoneRate) => {
    setEditingId(zone.id);
    setDraft({
      zone_key: zone.zone_key,
      name: zone.name,
      areas: zone.areas,
      uvf_usd: zone.uvf_usd,
      slu_usd: zone.slu_usd,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!draft.name.trim()) return fail('A zone needs a name.');
    setBusy(editingId);
    // zone_key is intentionally not editable: transferRoutes.ts references it,
    // and changing it here would silently break a corridor page's fare.
    const { error } = await supabase
      .from('zone_rates')
      .update({
        name: draft.name.trim(),
        areas: draft.areas.trim(),
        uvf_usd: draft.uvf_usd,
        slu_usd: draft.slu_usd,
      })
      .eq('id', editingId);
    setBusy(null);
    if (error) return fail(error.message);
    setEditingId(null);
    load();
  };

  const addZone = async () => {
    const name = newZone.name.trim();
    if (!name) return fail('A zone needs a name.');
    const key = (newZone.zone_key.trim() || slugify(name));
    if (!key) return fail('Could not derive a zone key from that name — set one manually.');
    if (zones.some((z) => z.zone_key === key)) return fail(`A zone with the key "${key}" already exists.`);

    setBusy('new');
    const { error } = await supabase.from('zone_rates').insert([{
      zone_key: key,
      name,
      areas: newZone.areas.trim(),
      uvf_usd: newZone.uvf_usd,
      slu_usd: newZone.slu_usd,
      sort_order: zones.length ? Math.max(...zones.map((z) => z.sort_order)) + 1 : 1,
    }]);
    setBusy(null);
    if (error) return fail(error.message);
    setAdding(false);
    setNewZone(emptyDraft);
    load();
  };

  const toggleActive = async (zone: ZoneRate) => {
    const used = routesUsingZone(zone.zone_key);
    if (zone.active && used.length) {
      const confirmed = await Swal.fire({
        icon: 'warning',
        title: 'Hide this zone?',
        html:
          `<p>${used.length} transfer page${used.length === 1 ? '' : 's'} price from this zone ` +
          `and will fall back to the last published fare:</p>` +
          `<p style="margin-top:.5rem"><strong>${used.map((r) => r.destination).join(', ')}</strong></p>`,
        showCancelButton: true,
        confirmButtonText: 'Hide anyway',
        confirmButtonColor: '#00B8B8',
      });
      if (!confirmed.isConfirmed) return;
    }
    const { error } = await supabase
      .from('zone_rates')
      .update({ active: !zone.active })
      .eq('id', zone.id);
    if (error) return fail(error.message);
    load();
  };

  const move = async (zone: ZoneRate, direction: -1 | 1) => {
    const ordered = [...zones].sort((a, b) => a.sort_order - b.sort_order);
    const index = ordered.findIndex((z) => z.id === zone.id);
    const swapWith = ordered[index + direction];
    if (!swapWith) return;
    setBusy(zone.id);
    await Promise.all([
      supabase.from('zone_rates').update({ sort_order: swapWith.sort_order }).eq('id', zone.id),
      supabase.from('zone_rates').update({ sort_order: zone.sort_order }).eq('id', swapWith.id),
    ]);
    setBusy(null);
    load();
  };

  const deleteZone = async (zone: ZoneRate) => {
    const used = routesUsingZone(zone.zone_key);
    if (used.length) {
      // Refused rather than warned: routeFare() throws on an unknown zone key,
      // which fails the next build rather than producing a priceless page.
      // Better to say so here than to break a deploy.
      return Swal.fire({
        icon: 'error',
        title: 'This zone is in use',
        html:
          `<p>These transfer pages take their fare from <strong>${zone.name}</strong>:</p>` +
          `<p style="margin-top:.5rem"><strong>${used.map((r) => r.destination).join(', ')}</strong></p>` +
          `<p style="margin-top:.75rem">Hide the zone instead, or have a developer repoint those ` +
          `pages in <code>src/data/transferRoutes.ts</code> first.</p>`,
      });
    }

    const confirmed = await Swal.fire({
      icon: 'warning',
      title: `Delete ${zone.name}?`,
      text: 'This removes the zone from the public rates table. It cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmed.isConfirmed) return;

    const { error } = await supabase.from('zone_rates').delete().eq('id', zone.id);
    if (error) return fail(error.message);
    load();
  };

  const startServiceEdit = (service: ServiceRateRow) => {
    setAddingService(false);
    setEditingService(service.id);
    setServiceDraft({
      service_key: service.service_key,
      name: service.name,
      price_usd: service.price_usd,
      price_unit: service.price_unit,
      summary: service.summary,
      includes: (service.includes ?? []).join('\n'),
    });
  };

  const saveService = async () => {
    const name = serviceDraft.name.trim();
    if (!name) return fail('A tour or charter needs a name.');

    const payload = {
      name,
      price_usd: serviceDraft.price_usd,
      price_unit: serviceDraft.price_unit,
      summary: serviceDraft.summary.trim(),
      includes: toBullets(serviceDraft.includes),
    };

    setBusy(editingService ?? 'new-service');
    let error;
    if (editingService) {
      // service_key is fixed once created, same reasoning as zone_key.
      ({ error } = await supabase.from('service_rates').update(payload).eq('id', editingService));
    } else {
      const key = serviceDraft.service_key.trim() || slugify(name);
      if (!key) {
        setBusy(null);
        return fail('Could not derive a key from that name — set one manually.');
      }
      if (services.some((s) => s.service_key === key)) {
        setBusy(null);
        return fail(`A tour or charter with the key "${key}" already exists.`);
      }
      ({ error } = await supabase.from('service_rates').insert([{
        ...payload,
        service_key: key,
        sort_order: services.length ? Math.max(...services.map((s) => s.sort_order)) + 1 : 1,
      }]));
    }
    setBusy(null);
    if (error) return fail(error.message);

    setEditingService(null);
    setAddingService(false);
    setServiceDraft(emptyService);
    load();
  };

  const toggleServiceActive = async (service: ServiceRateRow) => {
    const { error } = await supabase
      .from('service_rates')
      .update({ active: !service.active })
      .eq('id', service.id);
    if (error) return fail(error.message);
    load();
  };

  const deleteService = async (service: ServiceRateRow) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: `Delete ${service.name}?`,
      text: 'This removes the card from the public rates page. It cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmed.isConfirmed) return;
    const { error } = await supabase.from('service_rates').delete().eq('id', service.id);
    if (error) return fail(error.message);
    load();
  };

  const saveDiscount = async (percent: number) => {
    if (Number.isNaN(percent) || percent < 0 || percent >= 100) {
      return fail('The round-trip discount must be between 0 and 99%.');
    }
    const { error } = await supabase
      .from('pricing_settings')
      .update({ round_trip_discount: percent / 100 })
      .eq('id', 1);
    if (error) return fail(error.message);
    load();
  };

  const publish = async () => {
    const confirmed = await Swal.fire({
      icon: 'question',
      title: 'Publish to search engines & AI?',
      text: 'Rebuilds the site so crawlers, Google and AI assistants see the current prices. Takes about two minutes.',
      showCancelButton: true,
      confirmButtonText: 'Publish',
      confirmButtonColor: '#00B8B8',
    });
    if (!confirmed.isConfirmed) return;

    setPublishing(true);
    // The build hook is held as a secret by the `publish-site` Edge Function,
    // which checks the caller is a signed-in admin before using it. It is
    // deliberately not a VITE_ variable: those are inlined into the client
    // bundle, and the hook URL is enough on its own to burn the site's build
    // minutes. invoke() also gives a readable response, so this can report
    // what actually happened rather than guessing.
    const { data, error } = await supabase.functions.invoke('publish-site', { method: 'POST' });
    setPublishing(false);

    if (error) {
      // The function answers with { error } JSON; FunctionsHttpError carries
      // the original Response so that message can be shown instead of a bare
      // "non-2xx status code".
      let message = error.message;
      const response = (error as { context?: Response }).context;
      if (response && typeof response.json === 'function') {
        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          // Keep the generic message if the body is not JSON.
        }
      }
      return Swal.fire({ icon: 'error', title: 'Could not publish', text: message });
    }

    await load();
    Swal.fire({
      icon: 'success',
      title: 'Build started',
      text: data?.warning ??
        'Netlify is rebuilding the site. Static pages and llms.txt will show the new prices in about two minutes.',
      confirmButtonColor: '#00B8B8',
    });
  };

  const ordered = useMemo(
    () => [...zones].sort((a, b) => a.sort_order - b.sort_order),
    [zones]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rates &amp; Zones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {settings
              ? `Prices last changed ${formatRatesUpdated(settings.rates_updated)}`
              : 'Zone pricing published across the site'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={publish}
            disabled={publishing}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
              isStale
                ? 'bg-yellow text-gray-900 hover:bg-yellow/90'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UploadCloud size={16} />
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 transition-colors"
          >
            <Plus size={16} /> Add Zone
          </button>
        </div>
      </div>

      {/* What actually happens when you save. Without this an owner reasonably
          assumes a price edit reaches Google straight away. */}
      <div className="flex gap-3 bg-turquoise/5 border border-turquoise/30 rounded-xl p-4 mb-6 text-sm">
        <Info size={18} className="text-turquoise flex-shrink-0 mt-0.5" />
        <div className="text-gray-700">
          <p>
            Saving updates the rates table, the transfer pages and the FAQ answer for
            visitors <strong>straight away</strong>.
          </p>
          <p className="mt-1">
            Google and AI assistants read the published copy of the site, which only
            changes when it is rebuilt.{' '}
            {isStale ? (
              <strong className="text-yellow-700">
                The published copy is currently behind — press Publish.
              </strong>
            ) : (
              <span className="text-green-700">The published copy is up to date.</span>
            )}
          </p>
          {settings?.last_published_at && (
            <p className="mt-1 text-gray-500">
              Last published {new Date(settings.last_published_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border border-turquoise/40 p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">New Zone</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Zone name</label>
              <input
                className={`${inputClass} w-full`}
                value={newZone.name}
                onChange={(e) => setNewZone((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Zone 6"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Areas covered</label>
              <input
                className={`${inputClass} w-full`}
                value={newZone.areas}
                onChange={(e) => setNewZone((p) => ({ ...p, areas: e.target.value }))}
                placeholder="e.g., Dennery, Micoud"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From UVF (USD)</label>
              <input
                type="number"
                className={`${inputClass} w-full text-right`}
                value={newZone.uvf_usd}
                onChange={(e) => setNewZone((p) => ({ ...p, uvf_usd: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From SLU (USD)</label>
              <input
                type="number"
                className={`${inputClass} w-full text-right`}
                value={newZone.slu_usd}
                onChange={(e) => setNewZone((p) => ({ ...p, slu_usd: Number(e.target.value) }))}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Reference key: <code>{newZone.zone_key.trim() || slugify(newZone.name) || '—'}</code>{' '}
            — used by developers to link a transfer page to this zone. It cannot be changed later.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              disabled={busy === 'new'}
              onClick={addZone}
              className="px-4 py-2 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setAdding(false); setNewZone(emptyDraft); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">Zone</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">Areas covered</th>
                    <th className="px-4 py-3 text-right text-gray-600 font-medium">From UVF</th>
                    <th className="px-4 py-3 text-right text-gray-600 font-medium">From SLU</th>
                    <th className="px-4 py-3 text-right text-gray-600 font-medium">
                      Round trip ({discountLabel(discount)} off)
                    </th>
                    <th className="px-4 py-3 text-right text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordered.map((zone, index) => {
                    const isEditing = editingId === zone.id;
                    const uvf = isEditing ? draft.uvf_usd : zone.uvf_usd;
                    return (
                      <tr
                        key={zone.id}
                        className={`hover:bg-gray-50 ${zone.active ? '' : 'opacity-50'}`}
                      >
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              className={`${inputClass} w-28`}
                              value={draft.name}
                              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                            />
                          ) : (
                            <div>
                              <span className="font-medium text-gray-800">{zone.name}</span>
                              {!zone.active && (
                                <span className="ml-2 text-xs text-gray-400">hidden</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              className={`${inputClass} w-full min-w-[14rem]`}
                              value={draft.areas}
                              onChange={(e) => setDraft((p) => ({ ...p, areas: e.target.value }))}
                            />
                          ) : (
                            <span className="text-gray-600">{zone.areas}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              className={`${inputClass} w-20 text-right`}
                              value={draft.uvf_usd}
                              onChange={(e) => setDraft((p) => ({ ...p, uvf_usd: Number(e.target.value) }))}
                            />
                          ) : `$${zone.uvf_usd}`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              className={`${inputClass} w-20 text-right`}
                              value={draft.slu_usd}
                              onChange={(e) => setDraft((p) => ({ ...p, slu_usd: Number(e.target.value) }))}
                            />
                          ) : `$${zone.slu_usd}`}
                        </td>
                        {/* Derived, never stored: a round-trip column someone can
                            edit is a round-trip column that disagrees with the
                            one-way price it is supposed to be based on. */}
                        <td className="px-4 py-3 text-right text-gray-500">
                          ${roundTripFare(uvf, discount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  disabled={busy === zone.id}
                                  onClick={saveEdit}
                                  title="Save"
                                  className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  title="Cancel"
                                  className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  disabled={index === 0 || busy === zone.id}
                                  onClick={() => move(zone, -1)}
                                  title="Move up"
                                  className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  disabled={index === ordered.length - 1 || busy === zone.id}
                                  onClick={() => move(zone, 1)}
                                  title="Move down"
                                  className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                                >
                                  <ArrowDown size={14} />
                                </button>
                                <button
                                  onClick={() => toggleActive(zone)}
                                  title={zone.active ? 'Hide from the public site' : 'Show on the public site'}
                                  className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                >
                                  {zone.active ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button
                                  onClick={() => startEdit(zone)}
                                  title="Edit"
                                  className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => deleteZone(zone)}
                                  title="Delete"
                                  className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {ordered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No zones yet. The public site will keep showing the last published
                        prices until you add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Island tours and hourly charter. Cards rather than a table row:
              the feature bullets are multi-line, and a textarea inside a table
              cell is a worse editing experience than it looks. */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-800">Island tours &amp; hourly charter</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                The three cards below the transfer table on the public rates page.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setServiceDraft(emptyService);
                setAddingService(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 transition-colors"
            >
              <Plus size={15} /> Add
            </button>
          </div>

          {(addingService || editingService) && (
            <div className="bg-white rounded-xl border border-turquoise/40 p-5 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                {editingService ? 'Edit' : 'New tour or charter'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Name</label>
                  <input
                    className={`${inputClass} w-full`}
                    value={serviceDraft.name}
                    onChange={(e) => setServiceDraft((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Half-Day Island Tour"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price (USD)</label>
                  <input
                    type="number"
                    className={`${inputClass} w-full text-right`}
                    value={serviceDraft.price_usd}
                    onChange={(e) => setServiceDraft((p) => ({ ...p, price_usd: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Charged</label>
                  <select
                    className={`${inputClass} w-full`}
                    value={serviceDraft.price_unit}
                    onChange={(e) =>
                      setServiceDraft((p) => ({ ...p, price_unit: e.target.value as 'flat' | 'hourly' }))
                    }
                  >
                    <option value="flat">Flat rate</option>
                    <option value="hourly">Per hour</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">
                  Summary — shown under the price
                </label>
                <input
                  className={`${inputClass} w-full`}
                  value={serviceDraft.summary}
                  onChange={(e) => setServiceDraft((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="e.g., Up to 4 people, 4 hours"
                />
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">
                  What&apos;s included — one per line
                </label>
                <textarea
                  rows={4}
                  className={`${inputClass} w-full font-mono text-xs`}
                  value={serviceDraft.includes}
                  onChange={(e) => setServiceDraft((p) => ({ ...p, includes: e.target.value }))}
                  placeholder={'Customizable itinerary\nProfessional driver/guide'}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  disabled={busy === (editingService ?? 'new-service')}
                  onClick={saveService}
                  className="px-4 py-2 bg-turquoise text-white text-sm rounded-lg hover:bg-turquoise/90 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setAddingService(false);
                    setServiceDraft(emptyService);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-xl border border-gray-200 p-4 ${service.active ? '' : 'opacity-50'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{service.name}</p>
                    <p className="text-2xl font-bold text-turquoise mt-1">
                      {service.price_unit === 'hourly' ? `$${service.price_usd}/hr` : `$${service.price_usd}`}
                    </p>
                    <p className="text-xs text-gray-500">{service.summary}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleServiceActive(service)}
                      title={service.active ? 'Hide from the public site' : 'Show on the public site'}
                      className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {service.active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => startServiceEdit(service)}
                      title="Edit"
                      className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteService(service)}
                      title="Delete"
                      className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {(service.includes ?? []).map((item) => (
                    <li key={item} className="text-xs text-gray-600 flex gap-1.5">
                      <span className="text-turquoise">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {!service.active && <p className="text-xs text-gray-400 mt-3">Hidden from the site</p>}
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-gray-400 md:col-span-3 py-6 text-center">
                No tours or charters. The section is hidden on the public rates page.
              </p>
            )}
          </div>

          {/* The discount is published as a number in llms.txt and as copy on
              two public pages, so it belongs in the database, not in JSX. */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-md">
            <h2 className="font-semibold text-gray-800 mb-1">Round-trip discount</h2>
            <p className="text-xs text-gray-500 mb-3">
              A round trip is charged as two one-way UVF fares, less this percentage.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={99}
                defaultValue={Math.round(discount * 100)}
                key={discount}
                className={`${inputClass} w-24 text-right`}
                onBlur={(e) => {
                  const next = Number(e.target.value);
                  if (next !== Math.round(discount * 100)) saveDiscount(next);
                }}
              />
              <span className="text-sm text-gray-500">% off</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRates;
