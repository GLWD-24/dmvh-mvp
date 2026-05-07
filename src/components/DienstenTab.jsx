import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput, Select } from './MasterDataShell.jsx';
import { eenheden, btwTarieven } from '../data/seed.js';

/**
 * DienstenTab — beheer van diensten (niet-machine items).
 * In USEIT2000 zaten deze in dezelfde Artikelen-tabel (groep "Manuren" of "Overige").
 * In de nieuwe app gescheiden van machines voor duidelijkheid.
 *
 * Voorbeelden: manuren, transport, kilometervergoeding, voertuigbegeleiding.
 */

const blank = {
  code: '', name: '', description: '', rate: 0, unit: 'uur', vat: 21, active: true
};

export default function DienstenTab({ services, onSave, onAdd, onDelete }) {
  const [selectedId, setSelectedId] = useState(services[0]?.id || null);
  const [draft, setDraft] = useState(blank);
  const [dirty, setDirty] = useState(false);

  const current = services.find(s => s.id === selectedId);

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
    const newService = { ...blank, id: 's-' + Date.now(), code: 'NIEUW' };
    onAdd(newService);
    setSelectedId(newService.id);
  };

  return (
    <MasterDataShell
      title="Diensten"
      items={services}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onAdd={handleAdd}
      onDelete={onDelete}
      searchKeys={['code', 'name', 'description']}
      renderRow={(s) => (
        <div className={`${s.active === false ? 'opacity-50' : ''}`}>
          <div className="font-medium truncate flex items-center gap-1.5">
            {s.code}
            {s.active === false && <span className="text-[9px] uppercase tracking-wider text-slate-400 font-normal">inactief</span>}
          </div>
          <div className="text-[10px] text-slate-500 truncate flex items-center justify-between gap-2">
            <span className="truncate">{s.name}</span>
            <span className="text-slate-500 whitespace-nowrap shrink-0">€ {(s.rate || 0).toFixed(2)}/{s.unit || 'u'}</span>
          </div>
        </div>
      )}
      renderForm={() => current ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold">{draft.name || 'Nieuwe dienst'}</div>
            {dirty && <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Niet opgeslagen</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Code (intern nr)" required>
              <TextInput value={draft.code} onChange={v => update('code', v)} placeholder="MAN-01" />
            </FormField>

            <FormField label="Eenheid">
              <Select
                value={draft.unit || 'uur'}
                onChange={v => update('unit', v)}
                options={eenheden.map(e => e.value)}
                renderOption={v => eenheden.find(e => e.value === v)?.label || v}
              />
            </FormField>

            <FormField label="Naam" required span={2}>
              <TextInput value={draft.name} onChange={v => update('name', v)} placeholder="Manuren standaard" />
            </FormField>

            <FormField label="Beschrijving" span={2}>
              <TextInput value={draft.description} onChange={v => update('description', v)} placeholder="Bestuurder uurloon basis" />
            </FormField>

            <FormField label="Tarief (€)">
              <TextInput type="number" step="0.01" value={draft.rate} onChange={v => update('rate', v)} />
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
              id="service-active"
              checked={draft.active !== false}
              onChange={e => update('active', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="service-active" className="text-[12px] text-slate-700 cursor-pointer">
              Dienst is actief
            </label>
            <span className="text-[11px] text-slate-400 ml-2">
              {draft.active === false ? 'Inactieve diensten verschijnen niet bij het factureren' : ''}
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
        <div className="text-center text-xs text-slate-400 py-12">Selecteer een dienst</div>
      )}
    />
  );
}
