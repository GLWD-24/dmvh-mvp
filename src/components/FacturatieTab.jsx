import React, { useState } from 'react';
import { exportProposalToExcel } from './excelExport.js';

const fmtEur = (n) => n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_LABELS = {
  draft: 'Concept',
  sent: 'Verzonden naar klant',
  approved: 'PO ontvangen',
  rejected: 'Afgekeurd',
  invoiced: 'Gefactureerd',
  paid: 'Betaald'
};

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  sent: 'bg-blue-100 text-blue-800 border-blue-300',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  invoiced: 'bg-purple-100 text-purple-800 border-purple-300',
  paid: 'bg-emerald-200 text-emerald-900 border-emerald-400'
};

export default function FacturatieTab({ klanten, werkbonnen, proposals, onCreate, onSend, onApprove, onReject, onConvertToInvoice, onReopen }) {
  const [klant, setKlant] = useState(klanten[0]?.name || '');
  const [period, setPeriod] = useState('April 2026');
  const [previewing, setPreviewing] = useState(null);
  const [approveDialog, setApproveDialog] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);

  const eligibleLines = werkbonnen.filter(w => w.klant === klant && w.status === 'approved' && !w.disputed);
  const subtotal = eligibleLines.reduce((s, l) => s + (l.bon || 0) * (l.rate || 0), 0);

  const handleCreate = () => {
    if (eligibleLines.length === 0) {
      alert('Geen goedgekeurde werkbonnen voor deze klant in deze periode.');
      return;
    }
    onCreate({ klant, period, lines: eligibleLines, subtotal });
  };

  const proposalsForKlant = proposals;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="text-sm font-semibold mb-3">Voorstel tot factuur opmaken</div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Klant</label>
            <select value={klant} onChange={e => setKlant(e.target.value)} className="text-xs h-8 px-2 border border-slate-300 rounded">
              {klanten.map(k => <option key={k.id || k.name}>{k.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Periode</label>
            <select value={period} onChange={e => setPeriod(e.target.value)} className="text-xs h-8 px-2 border border-slate-300 rounded">
              <option>April 2026</option>
              <option>Mei 2026</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Te factureren</span>
            <span className="text-xs h-8 px-2 flex items-center font-medium">
              {eligibleLines.length} regels · € {fmtEur(subtotal)}
            </span>
          </div>
          <button
            onClick={handleCreate}
            disabled={eligibleLines.length === 0}
            className="text-xs px-4 h-8 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Voorstel aanmaken
          </button>
        </div>
        {(() => {
          const klantObj = klanten.find(k => k.name === klant);
          const noPO = klantObj?.noPO;
          if (noPO) return <div className="mt-2 text-[11px] text-slate-500">ℹ Klant {klant} werkt zonder PO — dit is ingesteld in het klantenprofiel.</div>;
          return null;
        })()}
      </div>

      <div className="p-4 flex-1 min-h-0">
        <div className="text-sm font-semibold mb-3">Voorstellen &amp; facturen ({proposalsForKlant.length})</div>
        {proposalsForKlant.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-12">
            Nog geen voorstellen aangemaakt.<br />
            Selecteer hierboven een klant + periode en klik "Voorstel aanmaken".
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {proposalsForKlant.map(p => (
              <ProposalCard
                key={p.id}
                proposal={p}
                klanten={klanten}
                onPreview={() => setPreviewing(previewing === p.id ? null : p.id)}
                isPreviewing={previewing === p.id}
                onSend={() => onSend(p.id)}
                onOpenApprove={() => setApproveDialog(p)}
                onOpenReject={() => setRejectDialog(p)}
                onConvert={() => onConvertToInvoice(p.id)}
                onReopen={() => onReopen(p.id)}
                onExportExcel={() => {
                  const klantObj = klanten.find(k => k.name === p.klant);
                  exportProposalToExcel(p, klantObj);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {approveDialog && (
        <ApproveDialog
          proposal={approveDialog}
          klanten={klanten}
          onCancel={() => setApproveDialog(null)}
          onConfirm={(payload) => { onApprove(approveDialog.id, payload); setApproveDialog(null); }}
        />
      )}
      {rejectDialog && (
        <RejectDialog
          proposal={rejectDialog}
          onCancel={() => setRejectDialog(null)}
          onConfirm={(payload) => { onReject(rejectDialog.id, payload); setRejectDialog(null); }}
        />
      )}
    </div>
  );
}

function ProposalCard({ proposal, klanten, onPreview, isPreviewing, onSend, onOpenApprove, onOpenReject, onConvert, onReopen, onExportExcel }) {
  const klantObj = klanten.find(k => k.name === proposal.klant);
  const isInvoice = proposal.status === 'invoiced' || proposal.status === 'paid';

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold">
              {isInvoice ? 'Factuur' : 'Voorstel'} {proposal.nr}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[proposal.status]}`}>
              {STATUS_LABELS[proposal.status]}
            </span>
            {proposal.poNr && (
              <span className="text-[10px] text-slate-500">
                PO: <span className="font-mono font-medium text-slate-700">{proposal.poNr}</span>
              </span>
            )}
            {proposal.poNr === 'GEEN PO' && (
              <span className="text-[10px] text-slate-500">PO: <span className="italic">geen</span></span>
            )}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            {proposal.klant} · {proposal.period} · {proposal.lines.length} regels · <span className="font-medium">€ {fmtEur(proposal.subtotal)}</span>
          </div>
          {proposal.status === 'rejected' && proposal.rejectReason && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-[11px] text-red-900">
              <span className="font-semibold">Afgekeurd ({proposal.rejectDate}):</span> {proposal.rejectReason}
              <div className="text-[10px] text-red-700 mt-1">⚠ Werkbonnen zijn gemarkeerd als <strong>disputed</strong> en kunnen niet opnieuw gefactureerd worden tot heropening.</div>
            </div>
          )}
          {proposal.status === 'approved' && proposal.approveNote && (
            <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded p-2 text-[11px] text-emerald-900">
              <span className="font-semibold">Opmerking klant:</span> {proposal.approveNote}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onPreview}
            className="text-[11px] px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 whitespace-nowrap"
          >
            {isPreviewing ? 'Verberg PDF' : 'Bekijk PDF'}
          </button>
          <button
            onClick={onExportExcel}
            className="text-[11px] px-3 py-1 rounded border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 whitespace-nowrap"
            title="Excel-export voor intern gebruik (bekijken, printen, bewerken)"
          >
            📊 Exporteer Excel
          </button>
          {proposal.status === 'draft' && (
            <button onClick={onSend} className="text-[11px] px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
              Verzenden naar klant
            </button>
          )}
          {proposal.status === 'sent' && (
            <>
              <button onClick={onOpenApprove} className="text-[11px] px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                Goedkeuring registreren
              </button>
              <button onClick={onOpenReject} className="text-[11px] px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50">
                Afkeuring registreren
              </button>
            </>
          )}
          {proposal.status === 'approved' && (
            <button onClick={onConvert} className="text-[11px] px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700">
              Definitieve factuur
            </button>
          )}
          {proposal.status === 'rejected' && (
            <button onClick={onReopen} className="text-[11px] px-3 py-1 rounded border border-slate-300 hover:bg-slate-50">
              Heropenen
            </button>
          )}
        </div>
      </div>

      {isPreviewing && <PdfPreview proposal={proposal} klant={klantObj} />}
    </div>
  );
}

function PdfPreview({ proposal, klant }) {
  const isInvoice = proposal.status === 'invoiced' || proposal.status === 'paid';
  const title = isInvoice ? 'FACTUUR' : 'VOORSTEL TOT FACTURATIE';
  const subtotal = proposal.subtotal;
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  return (
    <div className="border-t border-slate-200 p-5 bg-white text-xs">
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
          <div className={`font-semibold text-sm ${isInvoice ? 'text-purple-800' : 'text-blue-800'}`}>{title}</div>
          <div className="text-slate-500">
            Nr. {proposal.nr}<br />
            Datum: {proposal.createdDate}<br />
            Periode: {proposal.period}
          </div>
          {proposal.poNr && proposal.poNr !== 'GEEN PO' && (
            <div className="mt-1 text-slate-700"><span className="text-slate-500">PO ref:</span> <span className="font-mono">{proposal.poNr}</span></div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-2 mb-3">
        <div className="text-[10px] text-slate-500 uppercase">Factuur aan</div>
        <div className="font-semibold">{proposal.klant}</div>
        {klant && <div className="text-slate-600 text-[11px]">{klant.address}</div>}
        {klant && <div className="text-slate-600 text-[11px]">BTW: {klant.vat}</div>}
      </div>

      {!isInvoice && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3 text-[11px] text-blue-900">
          ⚠ Dit document is een <strong>voorstel tot facturatie</strong>. Gelieve goed te keuren met PO-nummer of af te keuren met reden. De definitieve factuur volgt na uw goedkeuring.
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
            <th className="text-left py-1">Datum</th>
            <th className="text-left">Bestuurder</th>
            <th className="text-left">Werf</th>
            <th className="text-left">Machine</th>
            <th className="text-right">Uren</th>
            <th className="text-right">Tarief</th>
            <th className="text-right">Bedrag</th>
          </tr>
        </thead>
        <tbody>
          {proposal.lines.map(l => (
            <tr key={l.id} className="border-b border-slate-100">
              <td className="py-1">{l.date}</td>
              <td>{l.worker}</td>
              <td className="text-slate-500">{l.werf}</td>
              <td>{l.machine}</td>
              <td className="text-right">{(l.bon || 0).toFixed(1)}</td>
              <td className="text-right">€ {fmtEur(l.rate || 0)}</td>
              <td className="text-right">€ {fmtEur((l.bon || 0) * (l.rate || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-1/2 mt-3 text-[11px]">
        <div className="flex justify-between py-0.5"><span>Subtotaal</span><span>€ {fmtEur(subtotal)}</span></div>
        <div className="flex justify-between py-0.5 text-slate-500"><span>BTW 21%</span><span>€ {fmtEur(vat)}</span></div>
        <div className="flex justify-between py-1 border-t border-slate-200 font-semibold"><span>Totaal</span><span>€ {fmtEur(total)}</span></div>
      </div>

      {isInvoice && klant && (
        <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600">
          Betaling binnen <strong>{klant.terms} dagen</strong> na factuurdatum op rekening van Demaecker &amp; Vanhaecke.
        </div>
      )}
    </div>
  );
}

function ApproveDialog({ proposal, klanten, onCancel, onConfirm }) {
  const klantObj = klanten.find(k => k.name === proposal.klant);
  const klantNoPO = klantObj?.noPO;
  const [poNr, setPoNr] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('04/05/2026');
  const [noPO, setNoPO] = useState(klantNoPO || false);

  const canConfirm = noPO || poNr.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold">Goedkeuring registreren</h3>
            <p className="text-xs text-slate-500 mt-0.5">Voorstel {proposal.nr} · {proposal.klant} · € {fmtEur(proposal.subtotal)}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={noPO} onChange={e => setNoPO(e.target.checked)} />
            Klant werkt zonder PO {klantNoPO && <span className="text-[10px] text-slate-500 ml-1">(standaard voor deze klant)</span>}
          </label>
          {!noPO && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">PO nummer <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={poNr}
                onChange={e => setPoNr(e.target.value)}
                placeholder="bv. PO-2026-04-1234 of 4500987654"
                className="w-full h-8 px-2 text-xs border border-slate-300 rounded font-mono"
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Datum ontvangst</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-32 h-8 px-2 text-xs border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Opmerking (optioneel)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="bv. extra info uit email klant..."
              className="w-full text-xs p-2 border border-slate-300 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">
            Annuleren
          </button>
          <button
            onClick={() => onConfirm({ poNr: noPO ? 'GEEN PO' : poNr.trim(), note: note.trim(), date })}
            disabled={!canConfirm}
            className="text-xs px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Goedkeuring registreren
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectDialog({ proposal, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('04/05/2026');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold">Afkeuring registreren</h3>
            <p className="text-xs text-slate-500 mt-0.5">Voorstel {proposal.nr} · {proposal.klant} · € {fmtEur(proposal.subtotal)}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3 text-[11px] text-amber-900">
          ⚠ Bij afkeuring worden de werkbonnen gemarkeerd als <strong>disputed</strong>. Tot heropening van het voorstel kunnen ze niet opnieuw gefactureerd worden.
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Reden van afkeuring <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              placeholder="bv. uren niet correct, verkeerde tarief, dispute over werf X..."
              className="w-full text-xs p-2 border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Datum afgekeurd</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-32 h-8 px-2 text-xs border border-slate-300 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">
            Annuleren
          </button>
          <button
            onClick={() => onConfirm({ reason: reason.trim(), date })}
            disabled={!reason.trim()}
            className="text-xs px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Afkeuring registreren
          </button>
        </div>
      </div>
    </div>
  );
}

