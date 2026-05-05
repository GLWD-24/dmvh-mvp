import React, { useState, useEffect, useRef } from 'react';

// MultiSelectPopover: shows a list of items with checkboxes.
// items: array of { id, label, sublabel? }
// selectedIds: Set<string>
// onConfirm: (Set<string>) => void
// onCreateNew: () => void  (optional — opens "create new" dialog)
export default function MultiSelectPopover({
  items, selectedIds, onConfirm, onCancel, onCreateNew, title = 'Toevoegen', createNewLabel = '+ Nieuwe aanmaken'
}) {
  const [picked, setPicked] = useState(new Set(selectedIds));
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCancel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCancel]);

  const toggle = (id) => {
    setPicked(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const filteredItems = search.trim()
    ? items.filter(it => it.label.toLowerCase().includes(search.toLowerCase())
        || (it.sublabel || '').toLowerCase().includes(search.toLowerCase()))
    : items;

  const newCount = [...picked].filter(id => !selectedIds.has(id)).length;
  const removeCount = [...selectedIds].filter(id => !picked.has(id)).length;

  return (
    <div ref={ref} className="absolute bottom-full left-0 mb-2 bg-white border border-slate-300 rounded-lg shadow-xl w-72 max-h-[400px] flex flex-col z-50">
      <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-base leading-none">×</button>
      </div>
      <div className="px-2 py-1.5 border-b border-slate-100">
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Zoeken..."
          className="w-full text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-blue-400"
        />
      </div>
      <div className="overflow-y-auto flex-1">
        {filteredItems.length === 0 ? (
          <div className="text-center text-[11px] text-slate-400 py-4">Geen resultaten</div>
        ) : (
          filteredItems.map(it => {
            const checked = picked.has(it.id);
            return (
              <label
                key={it.id}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] cursor-pointer hover:bg-slate-50 ${checked ? 'bg-blue-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(it.id)}
                  className="cursor-pointer"
                />
                <span className="flex-1 truncate">
                  <span className="text-slate-900">{it.label}</span>
                  {it.sublabel && <span className="text-slate-500 ml-1">· {it.sublabel}</span>}
                </span>
                {it.badge && <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800">{it.badge}</span>}
              </label>
            );
          })
        )}
      </div>
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="px-3 py-1.5 text-[11px] text-left text-blue-700 hover:bg-blue-50 border-t border-slate-200 font-medium"
        >
          {createNewLabel}
        </button>
      )}
      <div className="px-2 py-1.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {newCount > 0 || removeCount > 0
            ? `${newCount > 0 ? `+${newCount} ` : ''}${removeCount > 0 ? `−${removeCount}` : ''}`
            : 'Geen wijziging'}
        </span>
        <div className="flex gap-1">
          <button
            onClick={onCancel}
            className="text-[11px] px-2 py-1 rounded text-slate-600 hover:bg-slate-100"
          >
            Annuleren
          </button>
          <button
            onClick={() => onConfirm(picked)}
            className="text-[11px] px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Bevestigen
          </button>
        </div>
      </div>
    </div>
  );
}
