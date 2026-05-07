import React, { useState, useMemo } from 'react';

/**
 * Reusable master-data layout: searchable list on the left, edit form on the right.
 * Children render the form fields for the selected record.
 */
export default function MasterDataShell({
  title,
  items,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  searchKeys = ['name'],
  renderRow,
  renderForm,
  groupBy = null
}) {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedItem = items.find(it => it.id === selectedId);
  const itemLabel = selectedItem?.name || selectedItem?.code || selectedItem?.klant || 'dit item';

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => searchKeys.some(k => String(i[k] || '').toLowerCase().includes(q)));
  }, [items, search, searchKeys]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    return filtered.reduce((acc, item) => {
      const key = item[groupBy] || 'Overig';
      (acc[key] = acc[key] || []).push(item);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  return (
    <div className="p-4 grid grid-cols-[0.85fr_1.15fr] gap-4 h-full">
      <div className="flex flex-col min-h-0">
        <div className="flex gap-2 mb-2">
          <input
            type="search"
            placeholder="Zoeken..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 h-8 px-2 text-xs border border-slate-300 rounded"
          />
          <button
            onClick={onAdd}
            className="text-xs px-3 h-8 rounded bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
          >
            + Nieuw
          </button>
        </div>
        <div className="text-[10px] text-slate-500 mb-1">{filtered.length} {title.toLowerCase()}</div>
        <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 rounded">
          {grouped ? (
            Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, groupItems]) => (
              <div key={groupName}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 sticky top-0 border-b border-slate-200">
                  {groupName} <span className="text-slate-400 font-normal">({groupItems.length})</span>
                </div>
                {groupItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left text-xs px-2 py-1.5 border-b border-slate-100 ${item.id === selectedId ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-50'}`}
                  >
                    {renderRow(item)}
                  </button>
                ))}
              </div>
            ))
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full text-left text-xs px-2 py-1.5 border-b border-slate-100 ${item.id === selectedId ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-50'}`}
              >
                {renderRow(item)}
              </button>
            ))
          )}
          {filtered.length === 0 && (
            <div className="text-xs text-slate-400 text-center py-6">Geen resultaten</div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 overflow-y-auto">
        {renderForm()}
        {selectedId && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs px-3 py-1.5 rounded text-red-700 hover:bg-red-50 border border-red-200 flex items-center gap-1.5"
            >
              <span>🗑</span> Verwijderen
            </button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[420px] p-5">
            <h3 className="text-base font-semibold text-red-700 mb-2">Verwijderen?</h3>
            <p className="text-xs text-slate-700 mb-4">
              Ben je zeker dat je <strong>{itemLabel}</strong> definitief wil verwijderen?
              Deze actie kan niet ongedaan gemaakt worden. Historische werkbonnen blijven bewaard.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50"
              >
                Annuleren
              </button>
              <button
                onClick={() => { onDelete(selectedId); setConfirmDelete(false); }}
                className="text-xs px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                🗑 Definitief verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FormField({ label, children, required = false, span = 1 }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, type = 'text', placeholder = '', step }) {
  return (
    <input
      type={type}
      step={step}
      value={value || ''}
      placeholder={placeholder}
      onChange={e => onChange(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
      className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

export function Select({ value, onChange, options, renderOption }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
    >
      {options.map(o => <option key={o} value={o}>{renderOption ? renderOption(o) : o}</option>)}
    </select>
  );
}
