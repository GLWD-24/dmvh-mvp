import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput, Select } from './MasterDataShell.jsx';
import { eenheden, btwTarieven, artikelGroepen } from '../data/seed.js';

/**
 * ArtikelenTab — beheer van klein materieel dat naast de hoofdmachine
 * wordt meegegeven op een werf. Voorbeelden: GPS, trilplaat, buizen, slangen,
 * compressoren, hamers, werfbarriers.
 *
 * Verschil met:
 *   - Machines = grote machines die je bestuurt (Bobcat, Rupskraan, ...)
 *   - Diensten = uurtarieven en forfaits (Manuren, Transport, KM-vergoeding)
 *   - Artikelen = klein materieel verhuurd per dag (deze tab)
 */

const blank = {
  code: '', name: '', description: '', group: artikelGroepen[0],
  rate: 0, unit: 'dag', vat: 21, active: true
};

export default function ArtikelenTab({ artikelen, onSave, onAdd, onDelete }) {
  const [selectedId, setSelectedId] = useState(artikelen[0]?.id || null);
  const [draft, setDraft] = useState(blank);
  const [dirty, setDirty] = useState(false);

  const current = artikelen.find(a => a.id === selectedId);

  useEffect(() => {
    if (current) { setDraft(current); setDirty(false); }
  }, [selectedId, current?.id]);

  const update = (field, value) => {
    setDraft(d => ({ ...d, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    if (!draft.code.trim()) { alert('Code is verplicht'); return; }
    if (!draft.name.trim()) { alert('Naam is verplicht'); return; }
    onSave(selectedId, draft);
    setDirty(false);
  };

  const handleAdd = () => {
    const newArtikel = { ...blank, id: 'art-' + Date.now(), code: 'NIEUW' };
    onAdd(newArtikel);
    setSelectedId(newArtikel.id);
  };

  return (
    <MasterDataShell
      title="Artikelen"
      items={artikelen}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onAdd={handleAdd}
      onDelete={onDelete}
      searchKeys={['code', 'name', 'description', 'group']}
      groupBy="group"
      renderRow={(a) => (
        <div className={`${a.active === false ? 'opacity-50' : ''}`}>
          <div className="font-medium truncate flex items-center gap-1.5">
            {a.code}
            {a.active === false && <span className="text-[9px] uppercase tracking-wider text-slate-400 font-normal">inactief</span>}
          </div>
          <div className="text-[10px] text-slate-500 truncate flex items-center justify-between gap-2">
            <span className="truncate">{a.name}</span>
            <span className="text-slate-500 whitespace-nowrap shrink-0">€ {(a.rate || 0).toFixed(2)}/{a.unit || 'dag'}</span>
          </div>
        </div>
      )}
      renderForm={() => current ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold">{draft.name || 'Nieuw artikel'}</div>
            {dirty && <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Niet opgeslagen</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Code (intern nr)" required>
              <TextInput value={draft.code} onChange={v => update('code', v)} placeholder="GPS-01" />
            </FormField>

            <FormField label="Groep">
              <Select value={draft.group} onChange={v => update('group', v)} options={artikelGroepen} />
            </FormField>

            <FormField label="Naam" required span={2}>
              <TextInput value={draft.name} onChange={v => update('name', v)} placeholder="GPS Trimble graafmachine" />
            </FormField>

            <FormField label="Beschrijving" span={2}>
              <TextInput value={draft.description} onChange={v => update('description', v)} placeholder="Trimble GCS900 GPS systeem voor graafmachine" />
            </FormField>

            <FormField label="Tarief (€)">
              <TextInput type="number" step="0.01" value={draft.rate} onChange={v => update('rate', v)} />
            </FormField>

            <FormField label="Eenheid">
              <Select
                value={draft.unit || 'dag'}
                onChange={v => update('unit', v)}
                options={eenheden.map(e => e.value)}
                renderOption={v => eenheden.find(e => e.value === v)?.label || v}
              />
            </FormField>

            <FormField label="BTW (%)">
              <Select
                value={String(draft.vat ?? 21)}
                onChange={v => update('vat', Number(v))}
                options={btwTarieven.map(t => String(t.value))}
                renderOption={v => btwTarieven.find(t => String(t.value) === v)?.label || v + '%'}
              />
            </FormField>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="artikel-active"
              checked={draft.active !== false}
              onChange={e => update('active', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="artikel-active" className="text-[12px] text-slate-700 cursor-pointer">
              Artikel is actief
            </label>
            <span className="text-[11px] text-slate-400 ml-2">
              {draft.active === false ? 'Inactieve artikelen verschijnen niet in de planning' : ''}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`mt-4 text-xs px-4 py-2 rounded ${dirty ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Opslaan
          </button>
        </div>
      ) : (
        <div className="text-center text-xs text-slate-400 py-12">Selecteer een artikel</div>
      )}
    />
  );
}
