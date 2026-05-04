import React, { useState, useMemo } from 'react';

const fmtEur = (n) => n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Parse DD/MM/YYYY → Date
const parseDate = (s) => {
  if (!s) return null;
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d);
};
const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const dayName = (d) => ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][d.getDay()];

export default function UurroosterTab({ werkbonnen, workers, machines, klanten, incomingInvoices, onUpdate }) {
  const [pov, setPov] = useState('werknemer');
  const [vanDate, setVanDate] = useState('01/04/2026');
  const [totDate, setTotDate] = useState('30/04/2026');
  const [filterNaam, setFilterNaam] = useState('');
  const [filterWerf, setFilterWerf] = useState('');
  const [filterKlant, setFilterKlant] = useState('');
  const [showPrices, setShowPrices] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // { id, field }

  // Filter werkbonnen by date range and other filters
  const filtered = useMemo(() => {
    const van = parseDate(vanDate);
    const tot = parseDate(totDate);
    return werkbonnen.filter(wb => {
      const d = parseDate(wb.date);
      if (!d || !van || !tot) return false;
      if (d < van || d > tot) return false;
      if (filterNaam && wb.worker !== filterNaam) return false;
      if (filterWerf && wb.werf !== filterWerf) return false;
      if (filterKlant && wb.klant !== filterKlant) return false;
      if (search) {
        const q = search.toLowerCase();
        const blob = `${wb.worker} ${wb.werf} ${wb.klant} ${wb.machine} ${wb.nota || ''}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [werkbonnen, vanDate, totDate, filterNaam, filterWerf, filterKlant, search]);

  const totalFiche = filtered.reduce((s, w) => s + (w.fiche || 0), 0);
  const totalBon = filtered.reduce((s, w) => s + (w.bon || 0), 0);
  const totalAmount = filtered.reduce((s, w) => s + (w.bon || 0) * (w.rate || 0), 0);

  // OA missing-invoice computation
  const oaWorkers = workers.filter(w => w.type === 'subcontractor');
  const oaWerkbonnen = werkbonnen.filter(wb => oaWorkers.some(w => w.name === wb.worker));
  const oaMissing = oaWerkbonnen.filter(wb => !wb.incomingInvoiceId);
  const oaReceived = oaWerkbonnen.filter(wb => wb.incomingInvoiceId);

  // Group by klant for "Per Klant" pov
  const byKlant = useMemo(() => {
    const map = {};
    filtered.forEach(wb => {
      const key = wb.klant;
      if (!map[key]) map[key] = { klant: key, lines: [], totalFiche: 0, totalBon: 0, totalAmount: 0 };
      map[key].lines.push(wb);
      map[key].totalFiche += wb.fiche || 0;
      map[key].totalBon += wb.bon || 0;
      map[key].totalAmount += (wb.bon || 0) * (wb.rate || 0);
    });
    return Object.values(map).sort((a, b) => a.klant.localeCompare(b.klant));
  }, [filtered]);

  const machineColor = (code) => machines.find(m => m.code === code)?.color || '#6B7280';

  // Inline edit handler
  const handleEdit = (id, field, value) => {
    onUpdate(id, { [field]: parseFloat(value) || 0 });
    setEditing(null);
  };

  // Export: CSV
  const exportCSV = () => {
    const cols = ['Datum', 'Naam', 'Werf', 'Klant', 'Fiche', 'Bon', 'Machine', 'Tarief', 'Bedrag', 'Nota'];
    const rows = filtered.map(wb => [
      wb.date, wb.worker, wb.werf, wb.klant,
      (wb.fiche || 0).toFixed(2).replace('.', ','),
      (wb.bon || 0).toFixed(2).replace('.', ','),
      wb.machine,
      (wb.rate || 0).toFixed(2).replace('.', ','),
      ((wb.bon || 0) * (wb.rate || 0)).toFixed(2).replace('.', ','),
      wb.nota || ''
    ]);
    const csv = [cols, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `uurrooster_${vanDate.replace(/\//g, '-')}_${totDate.replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Simple print-to-PDF via browser
    window.print();
  };

  // Unique values for filter dropdowns
  const allWorkers = [...new Set(werkbonnen.map(w => w.worker))].sort();
  const allWerven = [...new Set(werkbonnen.map(w => w.werf))].sort();
  const allKlanten = [...new Set(werkbonnen.map(w => w.klant))].sort();

  return (
    <div className="flex flex-col h-full">
      {/* Header bar — matches USEIT2000 layout */}
      <div className="bg-white border-b border-slate-200 px-4 pt-3 pb-2">
        <div className="text-xs font-semibold text-blue-900 mb-2">Uurrooster</div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-600">Van Datum:</span>
            <input type="text" value={vanDate} onChange={e => setVanDate(e.target.value)}
              className="w-24 h-7 px-2 border border-slate-300 rounded text-xs" placeholder="DD/MM/YYYY" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-600">Tot Datum:</span>
            <input type="text" value={totDate} onChange={e => setTotDate(e.target.value)}
              className="w-24 h-7 px-2 border border-slate-300 rounded text-xs" placeholder="DD/MM/YYYY" />
          </div>

          <div className="flex items-center gap-1">
            <select value={filterNaam} onChange={e => setFilterNaam(e.target.value)}
              className="h-7 px-2 border border-emerald-700 bg-emerald-50 rounded text-xs">
              <option value="">— Naam —</option>
              {allWorkers.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <select value={filterWerf} onChange={e => setFilterWerf(e.target.value)}
              className="h-7 px-2 border border-emerald-700 bg-emerald-50 rounded text-xs">
              <option value="">— Werf —</option>
              {allWerven.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <select value={filterKlant} onChange={e => setFilterKlant(e.target.value)}
              className="h-7 px-2 border border-emerald-700 bg-emerald-50 rounded text-xs">
              <option value="">— Klant —</option>
              {allKlanten.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Vrije zoekterm..." className="h-7 px-2 border border-slate-300 rounded text-xs flex-1 min-w-[120px] max-w-[200px]" />
        </div>

        {/* POV switcher */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Weergave:</span>
          {[
            { id: 'werknemer', label: 'Per werknemer' },
            { id: 'klant', label: 'Per klant' },
            { id: 'oa', label: 'Onderaannemers — openstaand', badge: oaMissing.length }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPov(p.id)}
              className={`text-xs px-3 py-1 rounded ${pov === p.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {p.label}
              {p.badge > 0 && (
                <span className={`ml-1 inline-block text-[9px] px-1.5 py-0.5 rounded-full ${pov === p.id ? 'bg-white/20' : 'bg-red-100 text-red-700'}`}>
                  {p.badge}
                </span>
              )}
            </button>
          ))}

          <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={showPrices} onChange={e => setShowPrices(e.target.checked)} className="rounded" />
            Toon tarief + bedrag
          </label>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-auto bg-slate-50">
        {pov === 'werknemer' && (
          <UurroosterTable
            rows={filtered}
            showPrices={showPrices}
            machineColor={machineColor}
            editing={editing}
            setEditing={setEditing}
            onEdit={handleEdit}
            totalFiche={totalFiche}
            totalBon={totalBon}
            totalAmount={totalAmount}
            workers={workers}
          />
        )}

        {pov === 'klant' && (
          <div>
            {byKlant.length === 0 && (
              <div className="text-center text-xs text-slate-400 py-8">Geen resultaten in deze periode</div>
            )}
            {byKlant.map(group => (
              <div key={group.klant} className="mb-3 bg-white border-b border-slate-200">
                <div className="px-3 py-2 bg-blue-900 text-white text-xs font-semibold flex justify-between">
                  <span>{group.klant}</span>
                  <span className="font-normal text-blue-200">
                    {group.lines.length} regels · {group.totalBon.toFixed(2)} u (bon)
                    {showPrices && <> · € {fmtEur(group.totalAmount)}</>}
                  </span>
                </div>
                <UurroosterTable
                  rows={group.lines}
                  showPrices={showPrices}
                  machineColor={machineColor}
                  editing={editing}
                  setEditing={setEditing}
                  onEdit={handleEdit}
                  workers={workers}
                  hideTotals
                  compact
                />
              </div>
            ))}
            {byKlant.length > 0 && (
              <div className="bg-blue-900 text-white px-3 py-2 text-xs font-semibold flex justify-between sticky bottom-0">
                <span>TOTAAL</span>
                <span>
                  {totalFiche.toFixed(2)} fiche · {totalBon.toFixed(2)} bon
                  {showPrices && <> · € {fmtEur(totalAmount)}</>}
                </span>
              </div>
            )}
          </div>
        )}

        {pov === 'oa' && (
          <div className="grid grid-cols-2 gap-2 p-3">
            {/* Missing invoices */}
            <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 text-red-900 text-xs font-semibold px-3 py-2 border-b border-red-200">
                ⚠ Verwacht — geen factuur ontvangen ({oaMissing.length})
              </div>
              {oaMissing.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">Alles in orde</div>
              ) : (
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="text-left px-2 py-1">Datum</th>
                      <th className="text-left">OA</th>
                      <th className="text-left">Werf</th>
                      <th className="text-right">Uren</th>
                      <th className="text-right">Bedrag</th>
                      <th className="text-right px-2">Ouderdom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oaMissing.sort((a, b) => parseDate(a.date) - parseDate(b.date)).map(wb => {
                      const d = parseDate(wb.date);
                      const today = new Date('2026-05-04');
                      const ageDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={wb.id} className="border-b border-slate-100">
                          <td className="px-2 py-1">{wb.date}</td>
                          <td>{wb.worker}</td>
                          <td className="text-slate-500">{wb.werf}</td>
                          <td className="text-right">{(wb.bon || 0).toFixed(1)}</td>
                          <td className="text-right">€ {fmtEur((wb.bon || 0) * (wb.rate || 0))}</td>
                          <td className={`text-right px-2 ${ageDays > 21 ? 'text-red-600 font-semibold' : ageDays > 14 ? 'text-amber-600' : 'text-slate-500'}`}>
                            {ageDays} d
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 text-xs font-semibold">
                    <tr>
                      <td colSpan={3} className="px-2 py-1 text-right text-slate-500">Totaal verwacht:</td>
                      <td className="text-right">{oaMissing.reduce((s, w) => s + (w.bon || 0), 0).toFixed(1)} u</td>
                      <td className="text-right">€ {fmtEur(oaMissing.reduce((s, w) => s + (w.bon || 0) * (w.rate || 0), 0))}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Received invoices */}
            <div className="bg-white border border-emerald-200 rounded-lg overflow-hidden">
              <div className="bg-emerald-50 text-emerald-900 text-xs font-semibold px-3 py-2 border-b border-emerald-200">
                ✓ Ontvangen ({oaReceived.length})
              </div>
              {oaReceived.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">Nog geen facturen ontvangen</div>
              ) : (
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="text-left px-2 py-1">Datum prestatie</th>
                      <th className="text-left">OA</th>
                      <th className="text-left">Factuur nr</th>
                      <th className="text-right">Uren</th>
                      <th className="text-right px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oaReceived.map(wb => {
                      const inv = incomingInvoices.find(i => i.id === wb.incomingInvoiceId);
                      return (
                        <tr key={wb.id} className="border-b border-slate-100">
                          <td className="px-2 py-1">{wb.date}</td>
                          <td>{wb.worker}</td>
                          <td className="text-slate-500">{inv?.invoiceNr || '—'}</td>
                          <td className="text-right">{(wb.bon || 0).toFixed(1)}</td>
                          <td className="text-right px-2">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${inv?.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                              {inv?.status || 'received'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with exports */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center gap-3 text-xs">
        <span className="text-slate-500">{filtered.length} regels</span>
        <button onClick={exportCSV} className="ml-auto px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50">
          📊 Excel/CSV
        </button>
        <button onClick={exportPDF} className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50">
          🖨 PDF
        </button>
      </div>
    </div>
  );
}

// The dense table itself — used in both werknemer and klant modes
function UurroosterTable({ rows, showPrices, machineColor, editing, setEditing, onEdit, workers, totalFiche, totalBon, totalAmount, hideTotals, compact }) {
  const isOA = (worker) => workers.find(w => w.name === worker)?.type === 'subcontractor';

  if (rows.length === 0 && !hideTotals) {
    return <div className="text-center text-xs text-slate-400 py-8">Geen resultaten in deze periode</div>;
  }

  const renderCell = (wb, field) => {
    const isEditing = editing && editing.id === wb.id && editing.field === field;
    const value = wb[field] || 0;
    if (isEditing) {
      return (
        <input
          type="number" step="0.25" autoFocus
          defaultValue={value}
          onBlur={e => onEdit(wb.id, field, e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditing(null); }}
          className="w-14 h-5 px-1 text-[11px] border border-blue-500 rounded text-right"
        />
      );
    }
    return (
      <span
        onClick={() => setEditing({ id: wb.id, field })}
        className="cursor-pointer hover:bg-blue-50 px-1 rounded"
        title="Klik om te bewerken"
      >
        {value > 0 ? value.toFixed(2).replace('.', ',') : '—'}
      </span>
    );
  };

  return (
    <table className="w-full text-[11px] bg-white">
      <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase border-b border-slate-300 sticky top-0">
        <tr>
          <th className="text-left px-2 py-1.5 w-32">Datum</th>
          <th className="text-left w-40">Naam</th>
          <th className="text-left w-32">Werf</th>
          <th className="text-right w-14">Fiche</th>
          <th className="text-right w-14">Bon</th>
          <th className="text-left w-32">Machine</th>
          {showPrices && <th className="text-right w-16">Tarief</th>}
          {showPrices && <th className="text-right w-20">Bedrag</th>}
          <th className="text-left">Nota</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(wb => {
          const d = parseDate(wb.date);
          const discrepancy = wb.fiche !== wb.bon;
          return (
            <tr key={wb.id} className={`border-b border-slate-100 hover:bg-slate-50 ${wb.disputed ? 'bg-red-50/40' : discrepancy ? 'bg-amber-50/30' : ''}`}>
              <td className="px-2 py-1 whitespace-nowrap">
                {d && <span className="text-slate-400 mr-1">{dayName(d).slice(0, 3)}</span>}
                {wb.date}
              </td>
              <td className="whitespace-nowrap">
                {wb.worker}
                {isOA(wb.worker) && <span className="ml-1 text-[8px] px-1 py-0.5 rounded-full bg-amber-100 text-amber-800">OA</span>}
                {wb.disputed && <span className="ml-1 text-[8px] px-1 py-0.5 rounded-full bg-red-100 text-red-800" title="Disputed na afkeuring voorstel">disputed</span>}
              </td>
              <td className="text-slate-600 truncate max-w-[120px]" title={wb.werf}>{wb.werf}</td>
              <td className="text-right pr-2">{renderCell(wb, 'fiche')}</td>
              <td className={`text-right pr-2 ${discrepancy ? 'text-amber-700 font-medium' : ''}`}>{renderCell(wb, 'bon')}</td>
              <td className="whitespace-nowrap">
                <span className="inline-block w-2 h-2 rounded-sm mr-1.5 align-middle" style={{ backgroundColor: machineColor(wb.machine) }} />
                {wb.machine}
              </td>
              {showPrices && <td className="text-right text-slate-500">€ {(wb.rate || 0).toFixed(0)}</td>}
              {showPrices && <td className="text-right font-medium">€ {fmtEur((wb.bon || 0) * (wb.rate || 0))}</td>}
              <td className="text-slate-500 truncate max-w-[140px]" title={wb.nota}>{wb.nota || ''}</td>
            </tr>
          );
        })}
      </tbody>
      {!hideTotals && (
        <tfoot className="bg-blue-900 text-white text-xs font-semibold sticky bottom-0">
          <tr>
            <td colSpan={3} className="px-2 py-1.5 text-right">TOTAAL</td>
            <td className="text-right pr-2">{(totalFiche || 0).toFixed(2).replace('.', ',')}</td>
            <td className="text-right pr-2">{(totalBon || 0).toFixed(2).replace('.', ',')}</td>
            <td></td>
            {showPrices && <td></td>}
            {showPrices && <td className="text-right pr-2">€ {fmtEur(totalAmount || 0)}</td>}
            <td></td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
