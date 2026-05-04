import React, { useState, useEffect } from 'react';
import MasterDataShell, { FormField, TextInput, Select } from './MasterDataShell.jsx';
import { workerFunctions } from '../data/seed.js';

const blank = {
  name: '', type: 'employee', function: 'Bestuurder',
  hireDate: '', uurloon1: 0, uurloon2: 0
};

export default function WerknemersTab({ workers, onSave, onAdd, onDelete }) {
  const [selectedId, setSelectedId] = useState(workers[0]?.id || null);
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState(blank);
  const [dirty, setDirty] = useState(false);

  const current = workers.find(w => w.id === selectedId);

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
    const newWorker = { ...blank, id: 'w-' + Date.now(), name: 'NIEUWE WERKNEMER' };
    onAdd(newWorker);
    setSelectedId(newWorker.id);
  };

  const filteredWorkers = filter === 'all' ? workers
    : workers.filter(w => w.type === filter);

  const isSubcontractor = draft.type === 'subcontractor';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 flex gap-1 border-b border-slate-200">
        {[
          { id: 'all', label: 'Alle', count: workers.length },
          { id: 'employee', label: 'Werknemers', count: workers.filter(w => w.type === 'employee').length },
          { id: 'subcontractor', label: 'Onderaannemers', count: workers.filter(w => w.type === 'subcontractor').length }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1 rounded ${filter === f.id ? 'bg-slate-200 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {f.label} <span className="text-slate-400">({f.count})</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <MasterDataShell
          title="Werknemers"
          items={filteredWorkers}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={handleAdd}
          onDelete={onDelete}
          searchKeys={['name', 'function']}
          renderRow={(w) => (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{w.name}</div>
                <div className="text-[10px] text-slate-500">{w.function}</div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${w.type === 'subcontractor' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                {w.type === 'subcontractor' ? 'OA' : 'WN'}
              </span>
            </div>
          )}
          renderForm={() => current ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{draft.name || 'Nieuwe werknemer'}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSubcontractor ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {isSubcontractor ? 'Onderaannemer' : 'Werknemer'}
                  </span>
                </div>
                {dirty && <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Niet opgeslagen</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Naam" required span={2}>
                  <TextInput value={draft.name} onChange={v => update('name', v)} />
                </FormField>

                <FormField label="Type">
                  <select
                    value={draft.type}
                    onChange={e => update('type', e.target.value)}
                    className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="employee">Werknemer (in dienst)</option>
                    <option value="subcontractor">Onderaannemer</option>
                  </select>
                </FormField>

                <FormField label="Functie">
                  <Select value={draft.function} onChange={v => update('function', v)} options={workerFunctions} />
                </FormField>

                <FormField label="Datum in dienst" span={2}>
                  <TextInput value={draft.hireDate} onChange={v => update('hireDate', v)} placeholder="DD/MM/JJJJ" />
                </FormField>

                {!isSubcontractor && (
                  <>
                    <FormField label="Uurloon 1 (regulier)">
                      <TextInput type="number" step="0.01" value={draft.uurloon1} onChange={v => update('uurloon1', v)} />
                    </FormField>
                    <FormField label="Uurloon 2 (overuren)">
                      <TextInput type="number" step="0.01" value={draft.uurloon2} onChange={v => update('uurloon2', v)} />
                    </FormField>
                  </>
                )}

                {isSubcontractor && (
                  <div className="col-span-2 bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-900">
                    💡 Onderaannemers factureren zelf hun uren aan D&V. Volg openstaande facturen op via de module <strong>Onderaannemers</strong> (komende milestone M2).
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
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12">Selecteer een werknemer</div>
          )}
        />
      </div>
    </div>
  );
}
