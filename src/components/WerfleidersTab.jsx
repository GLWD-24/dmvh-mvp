import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput } from './MasterDataShell.jsx';

const blank = {
  name: '', email: '', phone: '', klantId: ''
};

export default function WerfleidersTab({ werfleiders, klanten = [], onSave, onAdd, onDelete, onResetPin, onSetPin }) {
  const [selectedId, setSelectedId] = useState(werfleiders[0]?.id || null);
  const [draft, setDraft] = useState(blank);
  const [dirty, setDirty] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');

  const current = werfleiders.find(w => w.id === selectedId);

  useEffect(() => {
    if (current) { setDraft({ ...blank, ...current }); setDirty(false); }
    else setDraft(blank);
  }, [selectedId, current?.id]);

  const update = (field, value) => {
    setDraft(d => ({ ...d, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    if (!draft.name.trim()) { alert('Naam is verplicht'); return; }
    if (selectedId) onSave(selectedId, draft);
    else { onAdd(draft); }
    setDirty(false);
  };

  const handleAddNew = () => {
    setSelectedId(null);
    setDraft(blank);
  };

  return (
    <>
      <MasterDataShell
        title="Werfleiders"
        items={werfleiders}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={handleAddNew}
        onDelete={(id) => { onDelete(id); setSelectedId(null); }}
        searchKeys={['name', 'email', 'phone']}
        renderRow={(w) => {
          const klant = klanten.find(k => k.id === w.klantId);
          return (
            <div>
              <div className="text-xs font-semibold flex items-center gap-2">
                {w.name}
                {w.pinBlocked && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">geblokkeerd</span>}
              </div>
              <div className="text-[10px] text-slate-500">{klant?.name || '—'} · {w.email}</div>
            </div>
          );
        }}
        renderForm={() => current || !selectedId ? (
          <div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Naam" required span={2}>
                <TextInput value={draft.name} onChange={v => update('name', v)} placeholder="Voornaam Naam" />
              </FormField>
              <FormField label="Email" span={2}>
                <TextInput type="email" value={draft.email} onChange={v => update('email', v)} placeholder="naam@bedrijf.be" />
              </FormField>
              <FormField label="Telefoon" span={2}>
                <TextInput value={draft.phone} onChange={v => update('phone', v)} placeholder="0475 11 22 33" />
              </FormField>
              <FormField label="Klant" span={2}>
                <select
                  value={draft.klantId || ''}
                  onChange={e => update('klantId', e.target.value || null)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="">— Geen vaste klant —</option>
                  {klanten.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
                <div className="mt-1 text-[10px] text-slate-500">
                  Een werfleider kan op meerdere werven van één klant zitten. Werven worden gekoppeld via de Werven-pagina.
                </div>
              </FormField>
            </div>

            {/* Toegang sectie */}
            {current && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">Toegang werfleider-portaal</div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-slate-900 mb-1">PIN-code</div>
                      <div className="text-[11px] text-slate-600 mb-2">
                        {current.pin
                          ? <>Werfleider kan inloggen met PIN <span className="font-mono font-medium text-slate-900">{current.pin}</span></>
                          : 'Geen PIN ingesteld — werfleider kan niet inloggen'}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {current.pinBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">
                            🔒 Geblokkeerd ({current.pinAttempts || 0}/5)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                            ✓ Actief
                          </span>
                        )}
                        {(current.pinAttempts || 0) > 0 && !current.pinBlocked && (
                          <span className="text-[10px] text-amber-700">{current.pinAttempts}/5 mislukt</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {current.pinBlocked && (
                        <button onClick={() => onResetPin && onResetPin(current.id)} className="text-[11px] px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                          Deblokkeren
                        </button>
                      )}
                      <button onClick={() => { setNewPinValue(''); setPinDialogOpen(true); }} className="text-[11px] px-3 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300">
                        Nieuwe PIN
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500">
                  Stuur de werfleider naar: <span className="font-mono">{window.location.origin}{window.location.pathname}#werfleider</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!dirty}
              className={`mt-4 text-xs px-4 py-2 rounded ${dirty ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {selectedId ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-12">Selecteer een werfleider</div>
        )}
      />

      {pinDialogOpen && current && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-[400px] max-w-[95vw] p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Nieuwe PIN-code</h3>
            <p className="text-xs text-slate-500 mb-4">Voor werfleider {current.name}</p>
            <label className="block text-xs font-medium text-slate-700 mb-1">PIN-code (6 cijfers)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={newPinValue}
              onChange={e => setNewPinValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              autoFocus
              className="w-full px-3 py-2 text-base font-mono tracking-widest border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <div className="text-[10px] text-slate-500 mt-1">
              Stuur deze PIN samen met de portaal-link naar de werfleider.
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => { setPinDialogOpen(false); setNewPinValue(''); }} className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded">Annuleren</button>
              <button
                onClick={() => {
                  if (newPinValue.length !== 6) return;
                  if (onSetPin && onSetPin(current.id, newPinValue)) {
                    setPinDialogOpen(false);
                    setNewPinValue('');
                  }
                }}
                disabled={newPinValue.length !== 6}
                className={`px-3 py-1.5 text-xs rounded ${newPinValue.length === 6 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                PIN opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
