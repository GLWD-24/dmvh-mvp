import React, { useState } from 'react';

const fmt = (n) => n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoiceTab({ klanten, werkbonnen }) {
  const [klant, setKlant] = useState(klanten[0]?.name || '');
  const [period, setPeriod] = useState('April 2026');
  const [generated, setGenerated] = useState(false);

  const lines = werkbonnen.filter(w => w.klant === klant && w.status === 'approved');
  const subtotal = lines.reduce((s, l) => s + (l.bon ?? l.hours ?? 0) * (l.rate || 85), 0);
  const vat = subtotal * 0.21;
  const grand = subtotal + vat;

  return (
    <div className="p-4">
      <div className="text-sm font-semibold mb-3">Factuur genereren</div>

      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider">Klant</label>
          <select value={klant} onChange={e => { setKlant(e.target.value); setGenerated(false); }} className="text-xs h-8 px-2 border border-slate-300 rounded">
            {klanten.map(k => <option key={k.name}>{k.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider">Periode</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="text-xs h-8 px-2 border border-slate-300 rounded">
            <option>April 2026</option>
            <option>Mei 2026</option>
          </select>
        </div>
        <button
          onClick={() => setGenerated(true)}
          className="text-xs px-4 h-8 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Genereer PDF
        </button>
      </div>

      {generated && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 text-xs">
          <div className="flex justify-between mb-4">
            <div>
              <div className="font-semibold text-sm">Demaecker &amp; Vanhaecke</div>
              <div className="text-slate-500 leading-relaxed">
                Dorpweg 35, 8377 Zuienkerke<br />
                BTW BE 0420.343.659<br />
                Tel. 050/31 63 27
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm">FACTUUR</div>
              <div className="text-slate-500">
                Nr. F2026-0421<br />
                Datum: 04/05/2026<br />
                Periode: {period}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 mb-3">
            <div className="text-[10px] text-slate-500 uppercase">Factuur aan</div>
            <div className="font-semibold">{klant}</div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                <th className="text-left py-1">Datum</th>
                <th className="text-left">Bestuurder</th>
                <th className="text-left">Machine</th>
                <th className="text-right">Uren</th>
                <th className="text-right">Tarief</th>
                <th className="text-right">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-slate-400 py-3">Geen goedgekeurde werkbonnen voor deze klant.</td></tr>
              ) : lines.map(l => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-1">{l.date}</td>
                  <td>{l.worker}</td>
                  <td>{l.machine}</td>
                  <td className="text-right">{(l.bon ?? l.hours ?? 0).toFixed(1)}</td>
                  <td className="text-right">€ {fmt(l.rate || 85)}</td>
                  <td className="text-right">€ {fmt((l.bon ?? l.hours ?? 0) * (l.rate || 85))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto w-1/2 mt-3 text-[11px]">
            <div className="flex justify-between py-0.5"><span>Subtotaal</span><span>€ {fmt(subtotal)}</span></div>
            <div className="flex justify-between py-0.5 text-slate-500"><span>BTW 21%</span><span>€ {fmt(vat)}</span></div>
            <div className="flex justify-between py-1 border-t border-slate-200 font-semibold"><span>Totaal</span><span>€ {fmt(grand)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
