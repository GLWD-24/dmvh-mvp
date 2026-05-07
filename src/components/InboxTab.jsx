import React from 'react';

export default function InboxTab({ werkbonnen, onApprove, onReject, onOpenDetail }) {
  const submitted = werkbonnen.filter(w => w.status === 'submitted');

  return (
    <div className="p-4">
      <div className="text-sm font-semibold mb-3">Inkomende werkbonnen</div>
      {submitted.length === 0 ? (
        <div className="text-xs text-slate-500 text-center py-8">
          Geen werkbonnen ter goedkeuring.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {submitted.map(wb => (
            <div
              key={wb.id}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition cursor-pointer"
              onClick={() => onOpenDetail && onOpenDetail(wb.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold">Werkbon #{wb.nr}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">submitted</span>
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <div><span className="text-slate-400">Klant:</span> {wb.klant} · {wb.werf}</div>
                <div><span className="text-slate-400">Bestuurder:</span> {wb.worker} op {wb.machine}</div>
                <div><span className="text-slate-400">Datum:</span> {wb.date} · {wb.bon ?? wb.hours} u</div>
                {(wb.startStr || wb.endStr) && (
                  <div><span className="text-slate-400">Tijden:</span> {wb.startStr || '—'} → {wb.endStr || '—'}{wb.pauseMin ? ` (pauze ${wb.pauseMin} min)` : ''}</div>
                )}
                <div className="text-emerald-700 mt-1">
                  ✓ Bestuurder getekend
                  {wb.werfleiderAfwezig
                    ? <span className="text-amber-700"> · ⚠ Werfleider was afwezig</span>
                    : ' · ✓ Werfleider getekend'}
                </div>
              </div>
              <div className="flex gap-2 mt-2 items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onApprove(wb.id); }}
                  className="text-[11px] px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                >
                  Goedkeuren
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReject(wb.id); }}
                  className="text-[11px] px-3 py-1 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Afwijzen
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenDetail && onOpenDetail(wb.id); }}
                  className="text-[11px] px-3 py-1 rounded text-blue-700 hover:bg-blue-50 ml-auto"
                >
                  Open volledig →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
