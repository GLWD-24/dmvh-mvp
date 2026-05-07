import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput } from './MasterDataShell.jsx';

const blank = {
  klantId: '', omschrijving: '', address: '', status: 'open',
  startDate: '', endDate: ''
};

export default function WervenTab({ werven, klanten, werfleiders = [], onSave, onAdd, onDelete }) {
  const [selectedId, setSelectedId] = useState(werven[0]?.id || null);
  const [draft, setDraft] = useState(blank);
  const [filter, setFilter] = useState('open'); // 'open' | 'closed' | 'all'

  useEffect(() => {
    if (selectedId) {
      const found = werven.find(w => w.id === selectedId);
      setDraft(found ? { ...blank, ...found } : blank);
    } else {
      setDraft(blank);
    }
  }, [selectedId, werven]);

  const update = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const handleSave = () => {
    if (!draft.klantId || !draft.omschrijving.trim()) return;
    if (selectedId) {
      onSave(selectedId, draft);
    } else {
      const id = onAdd(draft);
      if (id) setSelectedId(id);
    }
  };

  const handleAddNew = () => {
    setSelectedId(null);
    setDraft({ ...blank, klantId: klanten[0]?.id || '' });
  };

  // Apply filter to items
  const filteredItems = werven.filter(w => {
    if (filter === 'open') return !w.endDate;
    if (filter === 'closed') return !!w.endDate;
    return true;
  });

  return (
    <MasterDataShell
      title="Werven"
      items={filteredItems}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onAdd={handleAddNew}
      onDelete={(id) => { onDelete(id); setSelectedId(null); }}
      searchKeys={['klantId', 'omschrijving', 'address']}
      groupBy={(w) => {
        const k = klanten.find(x => x.id === w.klantId);
        return k?.name || 'Onbekende klant';
      }}
      renderRow={(w) => {
        const klant = klanten.find(k => k.id === w.klantId);
        return (
          <div>
            <div className="text-xs font-semibold flex items-center gap-2">
              {w.omschrijving || '(geen naam)'}
              {w.endDate && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">afgesloten</span>}
            </div>
            <div className="text-[10px] text-slate-500">
              {klant?.name} · {w.address}
            </div>
          </div>
        );
      }}
      renderForm={() => (
        <div>
          <div className="flex gap-2 mb-3">
            {['open', 'closed', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  filter === f
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {f === 'open' ? 'Open' : f === 'closed' ? 'Afgesloten' : 'Alle'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Klant" required span={2}>
              <select
                value={draft.klantId}
                onChange={e => update('klantId', e.target.value)}
                className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="">— Selecteer klant —</option>
                {klanten.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </FormField>
            <FormField label="Werf naam / omschrijving" required span={2}>
              <TextInput value={draft.omschrijving} onChange={v => update('omschrijving', v)} placeholder="bv. Onderhoud patrimonium 543" />
            </FormField>
            <FormField label="Adres / locatie" span={2}>
              <TextInput value={draft.address} onChange={v => update('address', v)} placeholder="bv. Aalter, Roeselare..." />
            </FormField>
            <FormField label="Start datum">
              <TextInput value={draft.startDate} onChange={v => update('startDate', v)} placeholder="DD/MM/YYYY" />
            </FormField>
            <FormField label="Eind datum">
              <TextInput value={draft.endDate} onChange={v => update('endDate', v)} placeholder="leeg = open werf" />
            </FormField>
            <FormField label="Status" span={2}>
              <select
                value={draft.status}
                onChange={e => update('status', e.target.value)}
                className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="open">Open</option>
                <option value="closed">Afgesloten</option>
              </select>
            </FormField>
            <FormField label="Werfleider" span={2}>
              <select
                value={draft.werfleiderId || ''}
                onChange={e => update('werfleiderId', e.target.value || null)}
                className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="">— Geen werfleider —</option>
                {werfleiders
                  .filter(wl => !draft.klantId || wl.klantId === draft.klantId || !wl.klantId)
                  .map(wl => (
                    <option key={wl.id} value={wl.id}>
                      {wl.name}{wl.email ? ` — ${wl.email}` : ''}
                    </option>
                  ))}
              </select>
              {draft.werfleiderId && (() => {
                const wl = werfleiders.find(x => x.id === draft.werfleiderId);
                return wl ? (
                  <div className="mt-1 text-[10px] text-slate-500">
                    📞 {wl.phone || '—'} · ✉ {wl.email || '—'}
                  </div>
                ) : null;
              })()}
            </FormField>
          </div>

          {draft.startDate && draft.endDate && (
            <div className="mt-3 text-[11px] text-slate-600 bg-slate-100 rounded p-2">
              Duur: {(() => {
                const parse = (s) => { const [d, m, y] = s.split('/'); return new Date(+y, +m - 1, +d); };
                const a = parse(draft.startDate);
                const b = parse(draft.endDate);
                const days = Math.floor((b - a) / 86400000);
                return `${days} dagen`;
              })()}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!draft.klantId || !draft.omschrijving.trim()}
              className="text-xs px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300"
            >
              {selectedId ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </div>
      )}
    />
  );
}
