import React, { useState, useMemo } from 'react';
import { exportProposalToExcel } from './excelExport.js';

const fmtEur = (n) => n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Interne 6 statussen blijven bestaan voor backwards-compat en audit-trail.
// De UI groepeert in 3 fases: te-controleren / goedgekeurd / verzonden.
const STATUS_LABELS = {
  draft: 'Te controleren',
  sent: 'Verzonden',
  approved: 'Goedgekeurd',
  rejected: 'Afgekeurd',
  invoiced: 'Verzonden',
  paid: 'Verzonden — betaald'
};

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  sent: 'bg-blue-100 text-blue-800 border-blue-300',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  invoiced: 'bg-blue-100 text-blue-800 border-blue-300',
  paid: 'bg-emerald-200 text-emerald-900 border-emerald-400'
};

// Mapping intern -> UI-fase
const PHASE_OF = {
  draft: 'todo',
  rejected: 'todo',     // afgekeurd valt terug in 'te controleren'
  approved: 'done',     // klant gaf groen licht / kantoor heeft goedgekeurd
  sent: 'sent',
  invoiced: 'sent',
  paid: 'sent'
};

const TABS = [
  { id: 'todo', label: 'Te controleren', icon: '📝' },
  { id: 'done', label: 'Goedgekeurd', icon: '✓' },
  { id: 'sent', label: 'Verzonden', icon: '📤' }
];

// dd/mm/yyyy → Date object voor vergelijking
const parseDateNL = (s) => {
  if (!s) return null;
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
};
// yyyy-mm-dd (HTML date input) → Date
const parseDateISO = (s) => s ? new Date(s + 'T00:00:00') : null;

export default function FacturatieTab({ klanten, werkbonnen, proposals, onCreate, onSend, onSendBulk, onUpdateLine, onApprove, onReject, onConvertToInvoice, onReopen }) {
  // ===== VIEW STATE =====
  // 'list' = bulklijst-scherm (start), 'detail' = fiche van één voorstel
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  // Filter-state
  const [tab, setTab] = useState('todo');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  // Voor 'Nieuw voorstel'-paneel bovenaan de lijst
  const [showCreate, setShowCreate] = useState(false);
  const [newKlant, setNewKlant] = useState(klanten[0]?.name || '');
  const [newPeriod, setNewPeriod] = useState('April 2026');

  // Dialogs
  const [approveDialog, setApproveDialog] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  // ===== AFGELEIDE DATA =====

  // Filter proposals volgens tab + datum + zoek
  const filtered = useMemo(() => {
    const fromD = parseDateISO(dateFrom);
    const toD = parseDateISO(dateTo);
    if (toD) toD.setHours(23, 59, 59);

    return proposals.filter(p => {
      if (PHASE_OF[p.status] !== tab) return false;
      const pDate = parseDateNL(p.createdDate);
      if (fromD && pDate && pDate < fromD) return false;
      if (toD && pDate && pDate > toD) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.klant.toLowerCase().includes(q)
          && !p.nr.toLowerCase().includes(q)
          && !p.period.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [proposals, tab, dateFrom, dateTo, search]);

  // Tellingen per tab (voor badges)
  const tabCounts = useMemo(() => {
    const c = { todo: 0, done: 0, sent: 0 };
    proposals.forEach(p => { c[PHASE_OF[p.status]] = (c[PHASE_OF[p.status]] || 0) + 1; });
    return c;
  }, [proposals]);

  // Voor 'Nieuw voorstel'-paneel: hoeveel werkbonnen zijn factureerbaar?
  const eligibleLines = werkbonnen.filter(w => w.klant === newKlant && w.status === 'approved' && !w.disputed);
  const newSubtotal = eligibleLines.reduce((s, l) => s + (l.bon || 0) * (l.rate || 0), 0);

  // ===== ACTIES =====

  const handleCreate = () => {
    if (eligibleLines.length === 0) {
      alert('Geen goedgekeurde werkbonnen voor deze klant in deze periode.');
      return;
    }
    onCreate({ klant: newKlant, period: newPeriod, lines: eligibleLines, subtotal: newSubtotal });
    setShowCreate(false);
  };

  const openDetail = (id) => {
    setSelectedId(id);
    setView('detail');
  };
  const backToList = () => {
    setView('list');
    setSelectedId(null);
  };

  // Navigeer < of > binnen de huidige gefilterde lijst
  const navigateInList = (direction) => {
    if (filtered.length === 0) return;
    const idx = filtered.findIndex(p => p.id === selectedId);
    if (idx === -1) return;
    const nextIdx = direction === 'next'
      ? Math.min(filtered.length - 1, idx + 1)
      : Math.max(0, idx - 1);
    setSelectedId(filtered[nextIdx].id);
  };

  const handleBulkSend = () => {
    const ids = filtered.filter(p => p.status === 'approved').map(p => p.id);
    if (ids.length === 0) return;
    onSendBulk(ids);
    setBulkConfirm(false);
  };

  // ===== RENDER =====

  // Detail-scherm (na dubbelklik)
  if (view === 'detail' && selectedId) {
    const proposal = proposals.find(p => p.id === selectedId);
    if (!proposal) {
      // Voorstel verdwenen tussen klikken (bv. status gewijzigd, niet meer in filter)
      setView('list');
      return null;
    }
    return (
      <DetailView
        proposal={proposal}
        klanten={klanten}
        siblings={filtered}
        onBack={backToList}
        onPrev={() => navigateInList('prev')}
        onNext={() => navigateInList('next')}
        onApprove={() => setApproveDialog(proposal)}
        onReject={() => setRejectDialog(proposal)}
        onSend={() => onSend(proposal.id)}
        onUpdateLine={(lineId, patch) => onUpdateLine(proposal.id, lineId, patch)}
        onConvert={() => onConvertToInvoice(proposal.id)}
        onReopen={() => onReopen(proposal.id)}
        onExportExcel={() => {
          const klantObj = klanten.find(k => k.name === proposal.klant);
          exportProposalToExcel(proposal, klantObj);
        }}
        approveDialog={approveDialog}
        rejectDialog={rejectDialog}
        onCloseApprove={() => setApproveDialog(null)}
        onCloseReject={() => setRejectDialog(null)}
        onConfirmApprove={(payload) => { onApprove(approveDialog.id, payload); setApproveDialog(null); }}
        onConfirmReject={(reason) => { onReject(rejectDialog.id, reason); setRejectDialog(null); }}
      />
    );
  }

  // Lijst-scherm (start)
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header met titel en 'Nieuw voorstel' */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Facturatie</h2>
          <button
            onClick={() => setShowCreate(s => !s)}
            className="text-[12px] px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {showCreate ? '× Sluiten' : '+ Nieuw voorstel'}
          </button>
        </div>

        {/* Inklapbaar 'Nieuw voorstel'-paneel */}
        {showCreate && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider">Klant</label>
              <select
                value={newKlant}
                onChange={e => setNewKlant(e.target.value)}
                className="h-8 px-2 text-xs border border-slate-300 rounded bg-white min-w-[200px]"
              >
                {klanten.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider">Periode</label>
              <input
                type="text"
                value={newPeriod}
                onChange={e => setNewPeriod(e.target.value)}
                placeholder="bv. April 2026"
                className="h-8 px-2 text-xs border border-slate-300 rounded bg-white"
              />
            </div>
            <div className="flex flex-col gap-1 mr-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Te factureren</span>
              <span className="text-xs font-medium">
                {eligibleLines.length} regel{eligibleLines.length === 1 ? '' : 's'} · € {fmtEur(newSubtotal)}
              </span>
            </div>
            <button
              onClick={handleCreate}
              disabled={eligibleLines.length === 0}
              className={`h-8 px-3 text-xs rounded ${eligibleLines.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              Voorstel aanmaken
            </button>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-1 mb-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-[12px] px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                tab === t.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0 rounded-full ${
                tab === t.id ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
              }`}>
                {tabCounts[t.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Filters: datum + zoek */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Vanaf</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-300 rounded bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Tot</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-300 rounded bg-white"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="h-8 px-2 text-[11px] text-slate-500 hover:text-slate-800"
            >
              × wis datums
            </button>
          )}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Zoek</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Klant, nummer, periode..."
              className="h-8 px-2 text-xs border border-slate-300 rounded bg-white"
            />
          </div>
        </div>
      </div>

      {/* LIJST */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-12">
            {proposals.length === 0
              ? 'Nog geen voorstellen aangemaakt. Klik op "+ Nieuw voorstel".'
              : `Geen voorstellen in "${TABS.find(t => t.id === tab)?.label}" met deze filters.`}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Datum</th>
                <th className="text-left px-2 py-2 font-medium">Voorstel nr.</th>
                <th className="text-left px-2 py-2 font-medium">Klant</th>
                <th className="text-left px-2 py-2 font-medium">Periode</th>
                <th className="text-right px-2 py-2 font-medium">Regels</th>
                <th className="text-right px-2 py-2 font-medium">Bedrag</th>
                <th className="text-left px-2 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Actie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const klantObj = klanten.find(k => k.name === p.klant);
                return (
                  <tr
                    key={p.id}
                    onDoubleClick={() => openDetail(p.id)}
                    className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition"
                    title="Dubbelklik om te openen"
                  >
                    <td className="px-4 py-2 text-slate-600">{p.createdDate}</td>
                    <td className="px-2 py-2 font-mono text-[11px] font-medium">{p.nr}</td>
                    <td className="px-2 py-2 font-medium text-slate-900">{p.klant}</td>
                    <td className="px-2 py-2 text-slate-600">{p.period}</td>
                    <td className="px-2 py-2 text-right text-slate-600">{p.lines.length}</td>
                    <td className="px-2 py-2 text-right font-medium">€ {fmtEur(p.subtotal)}</td>
                    <td className="px-2 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                      {p.poNr && (
                        <span className="ml-1 text-[10px] text-slate-500">PO: {p.poNr === 'GEEN PO' ? '—' : p.poNr}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDetail(p.id); }}
                        className="text-[11px] px-2 py-1 text-blue-700 hover:bg-blue-100 rounded"
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* FOOTER met bulk-knop alleen op Goedgekeurd-tab */}
      {tab === 'done' && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-600">
            {filtered.length} goedgekeurd{filtered.length === 1 ? '' : 'e'} voorstel{filtered.length === 1 ? '' : 'len'} in deze selectie
          </span>
          <button
            onClick={() => setBulkConfirm(true)}
            disabled={filtered.length === 0}
            className={`text-[12px] px-4 py-2 rounded font-medium ${
              filtered.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            📤 Verzend alles ({filtered.length}) naar klanten
          </button>
        </div>
      )}

      {/* Bulk-bevestiging dialog */}
      {bulkConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw] p-5">
            <h3 className="text-base font-semibold mb-2">Bulk verzending bevestigen</h3>
            <p className="text-sm text-slate-700 mb-4">
              Je staat op het punt <strong>{filtered.length} voorstel{filtered.length === 1 ? '' : 'len'}</strong> tegelijk te verzenden naar de respectieve klanten. Hun status wordt op <strong>Verzonden</strong> gezet en ze verschijnen niet meer in dit tabblad.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-4 text-[11px] text-amber-900">
              ⚠ Deze actie kan niet ongedaan gemaakt worden via één klik. Individuele voorstellen kan je later wel heropenen via de detail-pagina.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBulkConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded"
              >
                Annuleren
              </button>
              <button
                onClick={handleBulkSend}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ja, verzend allemaal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve / Reject dialogs (kunnen ook vanuit lijst geopend worden in toekomst) */}
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
          onConfirm={(reason) => { onReject(rejectDialog.id, reason); setRejectDialog(null); }}
        />
      )}
    </div>
  );
}

// =============================================================================
// DETAIL VIEW — fiche van één voorstel
// =============================================================================
function DetailView({
  proposal, klanten, siblings,
  onBack, onPrev, onNext,
  onApprove, onReject, onSend, onUpdateLine, onConvert, onReopen, onExportExcel,
  approveDialog, rejectDialog, onCloseApprove, onCloseReject,
  onConfirmApprove, onConfirmReject
}) {
  const klantObj = klanten.find(k => k.name === proposal.klant);
  const idx = siblings.findIndex(s => s.id === proposal.id);
  const total = siblings.length;
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

  // Welke acties zijn beschikbaar in de huidige fase?
  const phase = PHASE_OF[proposal.status];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header met terug-knop en navigatie */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white shrink-0 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-[12px] text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          ← Terug naar lijst
        </button>
        <div className="h-5 w-px bg-slate-300" />

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {proposal.klant}
          </span>
          <span className="text-xs text-slate-500 truncate">
            · {proposal.period} · {proposal.nr}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[proposal.status]}`}>
            {STATUS_LABELS[proposal.status]}
          </span>
        </div>

        {/* Navigatie pijlen */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className={`w-7 h-7 rounded flex items-center justify-center ${
              isFirst ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Vorige (in huidige selectie)"
          >
            ←
          </button>
          <span className="text-[11px] text-slate-500 px-2">
            {idx + 1} / {total}
          </span>
          <button
            onClick={onNext}
            disabled={isLast}
            className={`w-7 h-7 rounded flex items-center justify-center ${
              isLast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Volgende (in huidige selectie)"
          >
            →
          </button>
        </div>
      </div>

      {/* Acties-strook */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0 flex items-center gap-2 flex-wrap">
        {phase === 'todo' && (
          <>
            <button
              onClick={onApprove}
              className="text-[12px] px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              ✓ Goedkeuren
            </button>
            <button
              onClick={onReject}
              className="text-[12px] px-3 py-1.5 rounded bg-white border border-red-300 text-red-700 hover:bg-red-50"
            >
              Afwijzen
            </button>
          </>
        )}
        {phase === 'done' && (
          <button
            onClick={onSend}
            className="text-[12px] px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            📤 Verzenden naar klant
          </button>
        )}
        {phase === 'sent' && proposal.status === 'sent' && (
          <button
            onClick={onConvert}
            className="text-[12px] px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700"
          >
            Omzetten naar definitieve factuur
          </button>
        )}
        {(proposal.status === 'sent' || proposal.status === 'rejected') && (
          <button
            onClick={onReopen}
            className="text-[12px] px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            ↺ Heropenen
          </button>
        )}

        <span className="ml-auto flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="text-[12px] px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50"
          >
            📊 Excel export
          </button>
        </span>
      </div>

      {/* Reject reason banner */}
      {proposal.status === 'rejected' && proposal.rejectReason && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded p-2 text-[11px] text-red-900">
          <span className="font-semibold">Afgekeurd ({proposal.rejectDate}):</span> {proposal.rejectReason}
        </div>
      )}
      {proposal.status === 'approved' && proposal.approveNote && (
        <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-200 rounded p-2 text-[11px] text-emerald-900">
          <span className="font-semibold">Opmerking klant:</span> {proposal.approveNote}
        </div>
      )}

      {/* PDF preview altijd zichtbaar */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded">
          <PdfPreview proposal={proposal} klant={klantObj} onUpdateLine={onUpdateLine} />
        </div>
      </div>

      {/* Dialogs */}
      {approveDialog && (
        <ApproveDialog
          proposal={approveDialog}
          klanten={klanten}
          onCancel={onCloseApprove}
          onConfirm={onConfirmApprove}
        />
      )}
      {rejectDialog && (
        <RejectDialog
          proposal={rejectDialog}
          onCancel={onCloseReject}
          onConfirm={onConfirmReject}
        />
      )}
    </div>
  );
}


function PdfPreview({ proposal, klant, onUpdateLine }) {
  const isInvoice = proposal.status === 'invoiced' || proposal.status === 'paid';
  const title = isInvoice ? 'FACTUUR' : 'VOORSTEL TOT FACTURATIE';
  const subtotal = proposal.subtotal;
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  // Bewerken alleen toegestaan in 'draft' (Concept) status — daarna bevroren.
  const canEdit = proposal.status === 'draft' && typeof onUpdateLine === 'function';

  // Combineer Machine + Bestuurder. Bij HEMZELF (naakte verhuur) toon enkel machine.
  const formatMachineWorker = (line) => {
    const isHemzelf = !line.worker
      || line.worker === 'HEMZELF'
      || /hemzelf/i.test(line.worker);
    if (isHemzelf || !line.worker) return line.machine || '—';
    return `${line.machine} — ${line.worker}`;
  };

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

      {canEdit && (
        <div className="text-[10px] text-slate-500 italic mb-1">
          Uren en tarief zijn bewerkbaar tot het voorstel verzonden is. Klik in de cel om aan te passen.
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
            <th className="text-left py-1">Datum</th>
            <th className="text-left">Werf</th>
            <th className="text-left">Machine + bestuurder</th>
            <th className="text-right">Uren</th>
            <th className="text-right">Tarief</th>
            <th className="text-right">Bedrag</th>
          </tr>
        </thead>
        <tbody>
          {proposal.lines.map(l => (
            <tr key={l.id} className="border-b border-slate-100">
              <td className="py-1">{l.date}</td>
              <td className="text-slate-500">{l.werf}</td>
              <td>{formatMachineWorker(l)}</td>
              <td className="text-right">
                {canEdit ? (
                  <EditableCell
                    value={l.bon || 0}
                    decimals={2}
                    onChange={(v) => onUpdateLine(l.id, { bon: v })}
                    suffix=""
                  />
                ) : (
                  (l.bon || 0).toFixed(1)
                )}
              </td>
              <td className="text-right">
                {canEdit ? (
                  <EditableCell
                    value={l.rate || 0}
                    decimals={2}
                    onChange={(v) => onUpdateLine(l.id, { rate: v })}
                    prefix="€ "
                  />
                ) : (
                  <>€ {fmtEur(l.rate || 0)}</>
                )}
              </td>
              <td className="text-right font-medium">€ {fmtEur((l.bon || 0) * (l.rate || 0))}</td>
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

/**
 * Inline-editeerbare numerieke cel.
 * Klik = focus, comma of punt als decimaal-separator, tab/enter/blur = commit.
 * Ongeldige input → revert naar laatste geldige waarde.
 */
function EditableCell({ value, decimals = 2, onChange, prefix = '', suffix = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(String(value).replace('.', ','));
    setEditing(true);
  };

  const commit = () => {
    const normalized = String(draft).replace(',', '.').trim();
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  if (editing) {
    return (
      <input
        type="text"
        inputMode="decimal"
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commit(); }
          else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        }}
        onFocus={e => e.target.select()}
        className="w-20 text-right px-1 py-0.5 border border-blue-400 rounded bg-blue-50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="text-right px-1 py-0.5 rounded hover:bg-blue-50 hover:ring-1 hover:ring-blue-300 cursor-text border border-transparent transition"
      title="Klik om te bewerken"
    >
      {prefix}{Number(value).toFixed(decimals).replace('.', ',')}{suffix}
    </button>
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

