import React, { useState, useCallback } from 'react';
import { seedKlanten, seedWerven, seedWorkers, seedMachines, seedWerkbonnen, seedIncomingInvoices } from './data/seed.js';
import PlanningTab from './components/PlanningTab.jsx';
import InboxTab from './components/InboxTab.jsx';
import FacturatieTab from './components/FacturatieTab.jsx';
import KlantenTab from './components/KlantenTab.jsx';
import WerknemersTab from './components/WerknemersTab.jsx';
import MachinesTab from './components/MachinesTab.jsx';
import UurroosterTab from './components/UurroosterTab.jsx';
import MobilePhone from './components/MobilePhone.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const [klanten, setKlanten] = useState(seedKlanten);
  const [werven, setWerven] = useState(seedWerven.map(w => ({ ...w, assignments: w.assignments || [] })));
  const [workers, setWorkers] = useState(seedWorkers);
  const [machines, setMachines] = useState(seedMachines);
  const [werkbonnen, setWerkbonnen] = useState(seedWerkbonnen);
  const [incomingInvoices] = useState(seedIncomingInvoices);
  const [proposals, setProposals] = useState([]);

  // Decorate werven with klant name from klanten lookup so components don't need refactoring
  const klantenById = klanten.reduce((acc, k) => { acc[k.id] = k; return acc; }, {});
  const decoratedWerven = werven.map(w => ({
    ...w,
    klant: klantenById[w.klantId]?.name || w.klant || '—'
  }));
  const [tab, setTab] = useState('planning');
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState({ text: 'Ready', kind: 'info' });
  const [mobile, setMobile] = useState({ screen: 'today', currentWerkbon: null });

  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 2400);
  };

  const handleAssign = useCallback((werfId, kind, id, instanceKey) => {
    setWerven(prev => prev.map(w => {
      if (w.id !== werfId) return w;
      let last = w.assignments[w.assignments.length - 1];
      // Last assignment is "open" if missing one slot, OR if it's a HEMZELF-machine combo and a worker is being dropped
      const isHemzelfReplacement = last && kind === 'worker' && last.workerId === 'HEMZELF';
      const lastIncomplete = last && (
        (last.workerId && !last.machineId) ||
        (!last.workerId && last.machineId) ||
        isHemzelfReplacement
      );

      if (lastIncomplete) {
        const updated = w.assignments.map(a => {
          if (a !== last) return a;
          if (kind === 'worker') {
            return { ...a, workerId: id, instanceKey: instanceKey || 'main' };
          }
          return { ...a, machineId: id };
        });
        return { ...w, assignments: updated };
      }

      // Create new assignment
      const newAssignment = {
        id: 'a' + Date.now() + Math.random(),
        workerId: null,
        machineId: null,
        half: 'full',
        hours: 8,
        instanceKey: instanceKey || 'main'
      };
      if (kind === 'worker') {
        newAssignment.workerId = id;
      } else if (kind === 'machine') {
        // Solo machine drop = naakte verhuur (HEMZELF, OA = 0)
        newAssignment.workerId = 'HEMZELF';
        newAssignment.machineId = id;
      }
      return { ...w, assignments: [...w.assignments, newAssignment] };
    }));
    const target = decoratedWerven.find(w => w.id === werfId);
    if (target) {
      showToast(kind === 'machine' && !target.assignments.length
        ? `Naakte verhuur aan ${target.klant} (HEMZELF)`
        : 'Toegewezen aan ' + target.klant);
    }
  }, [werven]);

  const handleRemove = useCallback((aid) => {
    setWerven(prev => prev.map(w => ({ ...w, assignments: w.assignments.filter(a => a.id !== aid) })));
  }, []);

  const handleDuplicate = useCallback((workerId) => {
    setWorkers(prev => prev.map(w =>
      w.id === workerId ? { ...w, duplicates: (w.duplicates || 0) + 1 } : w
    ));
    showToast('Dubbele werknemer toegevoegd aan pool');
  }, []);

  const handleUpdateAssignment = useCallback((aid, patch) => {
    setWerven(prev => prev.map(w => ({
      ...w,
      assignments: w.assignments.map(a => a.id === aid ? { ...a, ...patch } : a)
    })));
  }, []);

  const handleSplit = useCallback((source, payload) => {
    // source: { sourceWerfId, sourceAssignmentId, workerId, machineId }
    // payload: { pmWerfId, amHours, pmHours, pmMachineId }
    setWerven(prev => prev.map(w => {
      // Mark source assignment as AM half with new hours
      if (w.id === source.sourceWerfId) {
        return {
          ...w,
          assignments: w.assignments.map(a =>
            a.id === source.sourceAssignmentId
              ? { ...a, half: 'am', hours: payload.amHours }
              : a
          )
        };
      }
      // Add a new PM assignment to the chosen pm werf
      if (w.id === payload.pmWerfId) {
        const pmAssignment = {
          id: 'a' + Date.now() + Math.random(),
          workerId: source.workerId,
          machineId: payload.pmMachineId,
          half: 'pm',
          hours: payload.pmHours
        };
        return { ...w, assignments: [...w.assignments, pmAssignment] };
      }
      return w;
    }));
    showToast('Werknemer gesplitst over 2 werven');
  }, []);

  // Werkbonnen
  const handleApprove = (id) => {
    setWerkbonnen(prev => prev.map(w => w.id === id ? { ...w, status: 'approved' } : w));
    const wb = werkbonnen.find(w => w.id === id);
    showToast('Werkbon #' + wb.nr + ' goedgekeurd');
    setStatus({ text: 'Goedgekeurd', kind: 'success' });
  };
  const handleReject = (id) => {
    setWerkbonnen(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
    showToast('Werkbon afgewezen', 'warn');
  };

  const handleWerkbonUpdate = (id, patch) => {
    setWerkbonnen(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
    showToast('Uren bijgewerkt');
  };

  // Proposals — voorstel tot facturatie lifecycle
  const proposalCreate = ({ klant, period, lines, subtotal }) => {
    const seq = proposals.length + 1;
    const nr = `V2026-${String(421 + seq).padStart(4, '0')}`;
    const newProposal = {
      id: 'p-' + Date.now(),
      nr,
      klant,
      period,
      subtotal,
      lines: lines.map(l => ({ ...l })),
      lineIds: lines.map(l => l.id),
      status: 'draft',
      createdDate: '04/05/2026',
      poNr: null,
      approveNote: null,
      rejectReason: null,
      rejectDate: null
    };
    setProposals(prev => [newProposal, ...prev]);
    showToast(`Voorstel ${nr} aangemaakt`);
    setStatus({ text: 'Voorstel klaar — verzend naar klant', kind: 'info' });
  };

  const proposalSend = (id) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'sent' } : p));
    showToast('Voorstel verzonden naar klant');
    setStatus({ text: 'In afwachting van klant', kind: 'warn' });
  };

  const proposalApprove = (id, { poNr, note, date }) => {
    setProposals(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'approved', poNr, approveNote: note, approveDate: date } : p
    ));
    showToast('Goedkeuring + PO geregistreerd', 'success');
    setStatus({ text: 'PO ontvangen — klaar voor facturatie', kind: 'success' });
  };

  const proposalReject = (id, { reason, date }) => {
    const proposal = proposals.find(p => p.id === id);
    setProposals(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'rejected', rejectReason: reason, rejectDate: date } : p
    ));
    // Mark linked werkbonnen as disputed
    if (proposal) {
      setWerkbonnen(prev => prev.map(w =>
        proposal.lineIds.includes(w.id) ? { ...w, disputed: true } : w
      ));
    }
    showToast('Afkeuring geregistreerd — werkbonnen disputed', 'warn');
    setStatus({ text: 'Voorstel afgekeurd', kind: 'warn' });
  };

  const proposalConvert = (id) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      const seq = prev.filter(x => x.status === 'invoiced' || x.status === 'paid').length + 1;
      const invoiceNr = `F2026-${String(720 + seq).padStart(4, '0')}`;
      return { ...p, status: 'invoiced', nr: invoiceNr, invoiceDate: '04/05/2026' };
    }));
    // Mark linked werkbonnen as invoiced
    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      setWerkbonnen(prev => prev.map(w =>
        proposal.lineIds.includes(w.id) ? { ...w, status: 'invoiced' } : w
      ));
    }
    showToast('Definitieve factuur gegenereerd');
    setStatus({ text: 'Factuur klaar voor verzending', kind: 'success' });
  };

  const proposalReopen = (id) => {
    const proposal = proposals.find(p => p.id === id);
    setProposals(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'draft', rejectReason: null, rejectDate: null } : p
    ));
    // Clear disputed flag on linked werkbonnen
    if (proposal) {
      setWerkbonnen(prev => prev.map(w =>
        proposal.lineIds.includes(w.id) ? { ...w, disputed: false } : w
      ));
    }
    showToast('Voorstel heropend — werkbonnen vrij');
  };

  // Klanten CRUD
  const klantSave = (id, patch) => {
    setKlanten(prev => prev.map(k => k.id === id ? { ...k, ...patch } : k));
    showToast('Klant opgeslagen');
  };
  const klantAdd = (newKlant) => {
    setKlanten(prev => [...prev, newKlant]);
    showToast('Nieuwe klant toegevoegd');
  };
  const klantDelete = (id) => {
    setKlanten(prev => prev.filter(k => k.id !== id));
    showToast('Klant verwijderd', 'warn');
  };

  // Werknemers CRUD
  const workerSave = (id, patch) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
    showToast('Werknemer opgeslagen');
  };
  const workerAdd = (newWorker) => {
    setWorkers(prev => [...prev, newWorker]);
    showToast('Nieuwe werknemer toegevoegd');
  };
  const workerDelete = (id) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    showToast('Werknemer verwijderd', 'warn');
  };

  // Machines CRUD
  const machineSave = (id, patch) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    showToast('Machine opgeslagen');
  };
  const machineAdd = (newMachine) => {
    setMachines(prev => [...prev, newMachine]);
    showToast('Nieuwe machine toegevoegd');
  };
  const machineDelete = (id) => {
    setMachines(prev => prev.filter(m => m.id !== id));
    showToast('Machine verwijderd', 'warn');
  };

  // Mobile handlers
  const mobileClockIn = (werf, machine) => {
    setMobile({
      screen: 'werkbon',
      currentWerkbon: {
        klant: werf.klant, werf: werf.address, machine: machine?.code || '—',
        hours: 0,
        phase: 'idle',
        segments: [],
        pauses: [],
        remarks: '',
        opSign: false,
        clientSign: false
      }
    });
  };
  const mobileSubmit = (wb, action) => {
    if (action === 'update') {
      setMobile(m => ({ ...m, currentWerkbon: wb }));
      return;
    }
    if (action === 'submit') {
      const newNr = 431723 + werkbonnen.length + 1;
      setWerkbonnen(prev => [...prev, {
        id: 'wb-' + Date.now(), nr: newNr, klant: wb.klant, werf: wb.werf,
        worker: 'EECKLOO FREDERIK', machine: wb.machine,
        date: '04/05/2026', fiche: wb.hours, bon: wb.hours, rate: 85, status: 'submitted', nota: wb.remarks || '', incomingInvoiceId: null
      }]);
      setMobile({ screen: 'submitted', currentWerkbon: null });
      setStatus({ text: 'Werkbon ingediend', kind: 'success' });
    }
  };

  // Demo flow auto-scripts
  const runFlow = (n) => {
    if (n === 1) {
      setTab('planning');
      setWerven(prev => prev.map(w => {
        if (w.id === 'aveve-1') return { ...w, assignments: [{ id: 'a-d1', workerId: 'w1', machineId: 'm1' }] };
        if (w.id === 'agro-1') return { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] };
        return w;
      }));
      setStatus({ text: 'Planning opgeslagen — push verzonden', kind: 'success' });
      showToast('2 toewijzingen opgeslagen, mobile bijgewerkt');
    } else if (n === 2) {
      setWerven(prev => prev.map(w => w.id === 'agro-1' && w.assignments.length === 0
        ? { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] } : w));
      setMobile({ screen: 'today', currentWerkbon: null });
      setStatus({ text: 'Mobile actief', kind: 'info' });
      showToast('Open de telefoon rechts en doorloop de werkbon', 'info');
    } else if (n === 3) {
      setWerven(prev => prev.map(w => w.id === 'agro-1' && w.assignments.length === 0
        ? { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] } : w));
      setWerkbonnen(prev => prev.some(w => w.status === 'submitted')
        ? prev
        : [...prev, { id: 'wb-demo', nr: 431728, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '04/05/2026', fiche: 8.0, bon: 8.0, rate: 95, status: 'submitted', nota: '', incomingInvoiceId: null }]);
      setTab('inbox');
      setStatus({ text: '1 werkbon ter goedkeuring', kind: 'warn' });
    } else if (n === 4) {
      setTab('invoice');
      // Auto-create a proposal for AGRO ENERGIEK to demonstrate the flow
      const lines = werkbonnen.filter(w => w.klant === 'AGRO ENERGIEK' && w.status === 'approved' && !w.disputed);
      const subtotal = lines.reduce((s, l) => s + (l.bon || 0) * (l.rate || 0), 0);
      if (lines.length > 0 && !proposals.some(p => p.klant === 'AGRO ENERGIEK')) {
        proposalCreate({ klant: 'AGRO ENERGIEK', period: 'April 2026', lines, subtotal });
      }
      setStatus({ text: 'Voorstel aangemaakt — bekijk PDF, verzend, en verwerk PO', kind: 'info' });
    } else if (n === 5) {
      setTab('klanten');
      setStatus({ text: 'Wijzig velden en klik Opslaan', kind: 'info' });
    }
  };

  const submittedCount = werkbonnen.filter(w => w.status === 'submitted').length;

  const statusStyles = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warn: 'bg-amber-50 text-amber-700'
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">DV</div>
            <div>
              <h1 className="text-lg font-semibold">USEIT2026</h1>
              <p className="text-xs text-slate-500">Demaecker &amp; Vanhaecke — clickable MVP prototype</p>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-slate-500 mr-1">Demo flow</span>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => runFlow(n)}
              className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50"
            >
              {['1. Plan Monday', '2. Mobile werkbon', '3. Approve', '4. Invoice PDF', '5. Edit klant'][n-1]}
            </button>
          ))}
          <span className={`ml-auto text-xs px-3 py-1 rounded-full ${statusStyles[status.kind]}`}>
            {status.text}
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col min-h-[640px]">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50 overflow-x-auto">
              <div className="flex gap-1 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-xs text-slate-500 shrink-0">Planner — D&amp;V</span>
              <nav className="ml-auto flex gap-1 shrink-0">
                {[
                  { id: 'planning', label: 'Planning' },
                  { id: 'inbox', label: 'Werkbonnen', badge: submittedCount },
                  { id: 'uurrooster', label: 'Uurrooster' },
                  { id: 'invoice', label: 'Facturatie' },
                  { id: 'klanten', label: 'Klanten' },
                  { id: 'werknemers', label: 'Werknemers' },
                  { id: 'machines', label: 'Machines' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`text-xs px-3 py-1 rounded ${tab === t.id ? 'bg-white border border-slate-200 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {t.label}
                    {t.badge > 0 && (
                      <span className="ml-1 inline-block bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded-full">
                        {t.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {tab === 'planning' && (
                <PlanningTab
                  werven={decoratedWerven} workers={workers} machines={machines}
                  onAssign={handleAssign} onRemove={handleRemove} onSplit={handleSplit}
                  onDuplicate={handleDuplicate}
                  onUpdateAssignment={handleUpdateAssignment}
                />
              )}
              {tab === 'inbox' && (
                <InboxTab werkbonnen={werkbonnen} onApprove={handleApprove} onReject={handleReject} />
              )}
              {tab === 'uurrooster' && (
                <UurroosterTab
                  werkbonnen={werkbonnen}
                  workers={workers}
                  machines={machines}
                  klanten={klanten}
                  incomingInvoices={incomingInvoices}
                  onUpdate={handleWerkbonUpdate}
                />
              )}
              {tab === 'invoice' && (
                <FacturatieTab
                  klanten={klanten}
                  werkbonnen={werkbonnen}
                  proposals={proposals}
                  onCreate={proposalCreate}
                  onSend={proposalSend}
                  onApprove={proposalApprove}
                  onReject={proposalReject}
                  onConvertToInvoice={proposalConvert}
                  onReopen={proposalReopen}
                />
              )}
              {tab === 'klanten' && (
                <KlantenTab klanten={klanten} onSave={klantSave} onAdd={klantAdd} onDelete={klantDelete} />
              )}
              {tab === 'werknemers' && (
                <WerknemersTab workers={workers} onSave={workerSave} onAdd={workerAdd} onDelete={workerDelete} />
              )}
              {tab === 'machines' && (
                <MachinesTab machines={machines} onSave={machineSave} onAdd={machineAdd} onDelete={machineDelete} />
              )}
            </div>
          </div>

          <MobilePhone
            state={mobile}
            werven={decoratedWerven} workers={workers} machines={machines}
            onClockIn={mobileClockIn}
            onSubmitWerkbon={mobileSubmit}
            onReset={() => setMobile({ screen: 'today', currentWerkbon: null })}
          />
        </div>

        <footer className="mt-6 text-xs text-slate-400 text-center">
          Prototype — geen backend, state reset bij refresh.
        </footer>
      </div>

      <Toast message={toast?.message} kind={toast?.kind} />
    </div>
  );
}
