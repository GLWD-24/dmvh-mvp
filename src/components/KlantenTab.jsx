import React, { useState } from 'react';

export default function KlantenTab({ klanten, onUpdate }) {
  const [selected, setSelected] = useState(klanten[0]?.name || '');
  const [terms, setTerms] = useState(klanten[0]?.terms || 30);

  const k = klanten.find(x => x.name === selected) || klanten[0];

  React.useEffect(() => { setTerms(k?.terms || 30); }, [k?.name]);

  return (
    <div className="p-4 grid grid-cols-[0.9fr_1.1fr] gap-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Klanten</div>
        <div className="flex flex-col gap-0.5 max-h-[360px] overflow-y-auto">
          {klanten.map(x => (
            <button
              key={x.name}
              onClick={() => setSelected(x.name)}
              className={`text-left text-xs px-2 py-1.5 rounded ${x.name === selected ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-slate-100'}`}
            >
              {x.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <div className="text-sm font-semibold mb-3">{k.name}</div>
        <div className="grid grid-cols-[110px_1fr] gap-y-2 gap-x-3 text-xs">
          <span className="text-slate-500">Adres</span><span>{k.address}</span>
          <span className="text-slate-500">BTW nr</span><span>{k.vat}</span>
          <span className="text-slate-500">Contact</span><span>{k.contact}</span>
          <span className="text-slate-500">Betaaltermijn</span>
          <span>
            <input
              type="number"
              value={terms}
              onChange={e => setTerms(parseInt(e.target.value, 10) || 0)}
              className="w-20 h-7 text-xs px-2 border border-slate-300 rounded"
            />{' '}
            <span className="text-slate-500">dagen</span>
          </span>
        </div>
        <button
          onClick={() => onUpdate(k.name, { terms })}
          className="mt-4 text-xs px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Opslaan
        </button>
      </div>
    </div>
  );
}
