import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput, Select } from './MasterDataShell.jsx';
import { machineGroups } from '../data/seed.js';

const blank = {
  code: '', group: 'Bandenkraan', description: '', rate: 0, color: '#3B82F6'
};

const colorPresets = [
  { value: '#3B82F6', label: 'Blauw' },
  { value: '#10B981', label: 'Groen' },
  { value: '#F59E0B', label: 'Oranje' },
  { value: '#EF4444', label: 'Rood' },
  { value: '#8B5CF6', label: 'Paars' },
  { value: '#EC4899', label: 'Roze' },
  { value: '#6B7280', label: 'Grijs' }
];

export default function MachinesTab({ machines, onSave, onAdd, onDelete }) {
  const [selectedId, setSelectedId] = useState(machines[0]?.id || null);
  const [draft, setDraft] = useState(blank);
  const [dirty, setDirty] = useState(false);

  const current = machines.find(m => m.id === selectedId);

  useEffect(() => {
    if (current) { setDraft(current); setDirty(false); }
  }, [selectedId, current?.id]);

  const update = (field, value) => {
    setDraft(d => ({ ...d, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    if (!draft.code.trim()) { alert('Code is verplicht'); return; }
    onSave(selectedId, draft);
    setDirty(false);
  };

  const handleAdd = () => {
    const newMachine = { ...blank, id: 'm-' + Date.now(), code: 'NIEUW' };
    onAdd(newMachine);
    setSelectedId(newMachine.id);
  };

  return (
    <MasterDataShell
      title="Machines"
      items={machines}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onAdd={handleAdd}
      onDelete={onDelete}
      searchKeys={['code', 'description', 'group']}
      groupBy="group"
      renderRow={(m) => (
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: m.color || '#6B7280' }}
            title={m.color}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{m.code}</div>
            <div className="text-[10px] text-slate-500 truncate">{m.description}</div>
          </div>
          <span className="text-[10px] text-slate-500 whitespace-nowrap">€ {(m.rate || 0).toFixed(0)}/u</span>
        </div>
      )}
      renderForm={() => current ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: draft.color }}
              />
              <div className="text-sm font-semibold">{draft.code || 'Nieuwe machine'}</div>
            </div>
            {dirty && <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Niet opgeslagen</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Code (intern nr)" required>
              <TextInput value={draft.code} onChange={v => update('code', v)} placeholder="ZX140.06 WD" />
            </FormField>

            <FormField label="Groep">
              <Select value={draft.group} onChange={v => update('group', v)} options={machineGroups} />
            </FormField>

            <FormField label="Beschrijving (merk + model)" span={2}>
              <TextInput value={draft.description} onChange={v => update('description', v)} placeholder="Hitachi ZX140 W-6 wheeled excavator" />
            </FormField>

            <FormField label="Tarief (€/uur)">
              <TextInput type="number" step="0.50" value={draft.rate} onChange={v => update('rate', v)} />
            </FormField>

            <FormField label="Kleur (planning view)">
              <div className="flex gap-1.5 flex-wrap items-center h-8">
                {colorPresets.map(c => (
                  <button
                    key={c.value}
                    onClick={() => update('color', c.value)}
                    title={c.label}
                    className={`w-6 h-6 rounded ${draft.color === c.value ? 'ring-2 ring-offset-1 ring-slate-700' : 'hover:ring-1 hover:ring-slate-400'}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </FormField>
          </div>

          <div className="mt-3 bg-slate-100 rounded p-3">
            <div className="text-[10px] text-slate-500 mb-1">Voorbeeld in planning</div>
            <div className="inline-flex items-center gap-2 bg-white rounded px-2 py-1 text-xs border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: draft.color }} />
              <span className="font-medium">{draft.code || '...'}</span>
              <span className="text-slate-400">{draft.group}</span>
            </div>
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
        <div className="text-center text-xs text-slate-400 py-12">Selecteer een machine</div>
      )}
    />
  );
}
