import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput, Select } from './MasterDataShell.jsx';
import { klantTypes } from '../data/seed.js';

const blank = {
  name: '', address: '', vat: '', terms: 30, contact: '',
  phone: '', email: '', mobile: '', fax: '', noPO: false, type: 'klant'
};

// Helper: get type info
const typeInfo = (type) => klantTypes.find(t => t.value === type) || klantTypes[0];

const typeColors = {
  klant: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  leverancier: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  prospect: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  architect: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  prive: { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500' }
};

export default function KlantenTab({ klanten, werven, onSave, onAdd, onDelete }) {
  const [selectedId, setSelectedId] = useState(klanten[0]?.id || null);
  const [draft, setDraft] = useState(blank);
  const [dirty, setDirty] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const current = klanten.find(k => k.id === selectedId);

  useEffect(() => {
    if (current) { setDraft({ ...blank, ...current }); setDirty(false); }
  }, [selectedId, current?.id]);

  const update = (field, value) => {
    setDraft(d => ({ ...d, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    if (!draft.name.trim()) { alert('Naam is verplicht'); return; }
    onSave(selectedId, draft);
    setDirty(false);
  };

  const handleAdd = () => {
    const newKlant = { ...blank, id: 'k-' + Date.now(), name: 'Nieuwe klant', type: typeFilter !== 'all' ? typeFilter : 'klant' };
    onAdd(newKlant);
    setSelectedId(newKlant.id);
  };

  // Filter klanten by type
  const filteredKlanten = typeFilter === 'all'
    ? klanten
    : klanten.filter(k => (k.type || 'klant') === typeFilter);

  // Counts per type for filter chips
  const counts = klantTypes.reduce((acc, t) => {
    acc[t.value] = klanten.filter(k => (k.type || 'klant') === t.value).length;
    return acc;
  }, { all: klanten.length });

  return (
    <div className="h-full flex flex-col">
      {/* Type filter chips */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto shrink-0">
        <button
          onClick={() => setTypeFilter('all')}
          className={`text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
            typeFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle <span className="opacity-70 ml-1">{counts.all}</span>
        </button>
        {klantTypes.map(t => {
          const c = typeColors[t.value] || typeColors.klant;
          const isActive = typeFilter === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : `${c.bg} ${c.text} hover:opacity-80`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : c.dot}`} />
              {t.label}
              <span className="opacity-70">{counts[t.value] || 0}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0">
    <MasterDataShell
      title={typeFilter === 'all' ? 'Alle relaties' : klantTypes.find(t => t.value === typeFilter)?.label + 'en'}
      items={filteredKlanten}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onAdd={handleAdd}
      onDelete={onDelete}
      searchKeys={['name', 'vat', 'contact']}
      renderRow={(k) => {
        const t = k.type || 'klant';
        const c = typeColors[t] || typeColors.klant;
        return (
          <div className="flex items-start gap-2">
            <span className={`w-1 self-stretch rounded-full ${c.dot} shrink-0 mt-0.5`} title={typeInfo(t).label} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{k.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{k.address || '—'}</div>
            </div>
          </div>
        );
      }}
      renderForm={() => current ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">{draft.name || 'Nieuwe relatie'}</div>
              {(() => {
                const t = draft.type || 'klant';
                const c = typeColors[t] || typeColors.klant;
                return (
                  <span className={`text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>
                    {typeInfo(t).label}
                  </span>
                );
              })()}
            </div>
            {dirty && <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Niet opgeslagen</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type" required>
              <Select
                value={draft.type || 'klant'}
                onChange={v => update('type', v)}
                options={klantTypes.map(t => t.value)}
                renderOption={v => klantTypes.find(t => t.value === v)?.label || v}
              />
            </FormField>
            <FormField label="Betaaltermijn (dagen)">
              <TextInput type="number" value={draft.terms} onChange={v => update('terms', v)} />
            </FormField>
            <FormField label="Naam" required span={2}>
              <TextInput value={draft.name} onChange={v => update('name', v)} />
            </FormField>
            <FormField label="Adres" span={2}>
              <TextInput value={draft.address} onChange={v => update('address', v)} placeholder="Straat 1, 9000 Gent" />
            </FormField>
            <FormField label="BTW nr" span={2}>
              <TextInput value={draft.vat} onChange={v => update('vat', v)} placeholder="BE 0xxx.xxx.xxx" />
            </FormField>
            <FormField label="Contactpersoon" span={2}>
              <TextInput value={draft.contact} onChange={v => update('contact', v)} />
            </FormField>
            <FormField label="Telefoon">
              <TextInput value={draft.phone} onChange={v => update('phone', v)} />
            </FormField>
            <FormField label="Mobiel">
              <TextInput value={draft.mobile} onChange={v => update('mobile', v)} />
            </FormField>
            <FormField label="Email" span={2}>
              <TextInput type="email" value={draft.email} onChange={v => update('email', v)} />
            </FormField>
            <FormField label="Fax">
              <TextInput value={draft.fax} onChange={v => update('fax', v)} />
            </FormField>
            {(draft.type === 'klant' || !draft.type) && (
              <div className="col-span-2 mt-2 pt-3 border-t border-slate-200">
                <label className="flex items-start gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!draft.noPO}
                    onChange={e => update('noPO', e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">Klant werkt zonder PO</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Voorstellen tot factuur kunnen goedgekeurd worden zonder PO-nummer in te vullen.
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`mt-4 text-xs px-4 py-2 rounded ${dirty ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Opslaan
          </button>

          {selectedId && werven && (draft.type === 'klant' || !draft.type) && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span>Werven van deze klant</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({werven.filter(w => w.klantId === selectedId).length})
                </span>
              </div>
              {(() => {
                const klantWerven = werven.filter(w => w.klantId === selectedId);
                if (klantWerven.length === 0) {
                  return <div className="text-[11px] text-slate-400 italic">Nog geen werven gekoppeld aan deze klant.</div>;
                }
                return (
                  <div className="flex flex-col gap-1.5">
                    {klantWerven.map(w => (
                      <div key={w.id} className="bg-white border border-slate-200 rounded p-2 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium flex items-center gap-2">
                            {w.omschrijving || '(geen naam)'}
                            {w.endDate ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">afgesloten</span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">open</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {w.address}
                            {w.startDate && <> · sinds {w.startDate}</>}
                            {w.endDate && <> · afgesloten op {w.endDate}</>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="text-[10px] text-slate-400 mt-2 italic">
                💡 Werven beheer je in het Werven tabblad.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-xs text-slate-400 py-12">Selecteer een relatie</div>
      )}
    />
      </div>
    </div>
  );
}

