import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput } from './MasterDataShell.jsx';

const blank = {
  name: '', address: '', vat: '', terms: 30, contact: '',
  phone: '', email: '', mobile: '', fax: '', noPO: false
};

export default function KlantenTab({ klanten, werven, onSave, onAdd, onDelete }) {
  const [selectedId, setSelectedId] = useState(klanten[0]?.id || null);
  const [draft, setDraft] = useState(blank);
  const [dirty, setDirty] = useState(false);

  const current = klanten.find(k => k.id === selectedId);

  useEffect(() => {
    if (current) { setDraft(current); setDirty(false); }
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
    const newKlant = { ...blank, id: 'k-' + Date.now(), name: 'Nieuwe klant' };
    onAdd(newKlant);
    setSelectedId(newKlant.id);
  };

  return (
    <MasterDataShell
      title="Klanten"
      items={klanten}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onAdd={handleAdd}
      onDelete={onDelete}
      searchKeys={['name', 'vat', 'contact']}
      renderRow={(k) => (
        <div>
          <div className="font-medium">{k.name}</div>
          <div className="text-[10px] text-slate-500">{k.address || '—'}</div>
        </div>
      )}
      renderForm={() => current ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold">{draft.name || 'Nieuwe klant'}</div>
            {dirty && <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Niet opgeslagen</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Naam" required span={2}>
              <TextInput value={draft.name} onChange={v => update('name', v)} />
            </FormField>
            <FormField label="Adres" span={2}>
              <TextInput value={draft.address} onChange={v => update('address', v)} placeholder="Straat 1, 9000 Gent" />
            </FormField>
            <FormField label="BTW nr">
              <TextInput value={draft.vat} onChange={v => update('vat', v)} placeholder="BE 0xxx.xxx.xxx" />
            </FormField>
            <FormField label="Betaaltermijn (dagen)">
              <TextInput type="number" value={draft.terms} onChange={v => update('terms', v)} />
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
          </div>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`mt-4 text-xs px-4 py-2 rounded ${dirty ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Opslaan
          </button>

          {selectedId && werven && (
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
        <div className="text-center text-xs text-slate-400 py-12">Selecteer een klant</div>
      )}
    />
  );
}
