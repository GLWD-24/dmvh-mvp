import React, { useState, useCallback } from 'react';
import { seedKlanten, seedWerven, seedWorkers, seedMachines, seedWerkbonnen } from './data/seed.js';
import PlanningTab from './components/PlanningTab.jsx';
import InboxTab from './components/InboxTab.jsx';
import InvoiceTab from './components/InvoiceTab.jsx';
import KlantenTab from './components/KlantenTab.jsx';
import WerknemersTab from './components/WerknemersTab.jsx';
import MachinesTab from './components/MachinesTab.jsx';
import MobilePhone from './components/MobilePhone.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const [klanten, setKlanten] = useState(seedKlanten);
  const [werven, setWerven] = useState(seedWerven.map(w => ({ ...w, assignments: [] })));
  const [workers, setWorkers] = useState(seedWorkers);
  const [machines, setMachines] = useState(seedMachines);
  const [werkbonnen, setWerkbonnen] = useState(seedWerkbonnen);
  const [tab, setTab] = useState('planning');
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState({ text: 'Ready', kind: 'info' });
  const [mobile, setMobile] = useState({ screen: 'today', currentWerkbon: null });

  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 2400);
  };

  const handleAssign = useCallback((werfId, kind, id) => {
    setWerven(prev => prev.map(w => {
      if (w.id !== werfId) return w;
      let last = w.assignments[w.assignments.length - 1];
      if (!last || (last.workerId && last.machineId)) {
        last = { id: 'a' + Date.now() + Math.random(), workerId: null, machineId: null };
        const next = { ...w, assignments: [...w.assignments, last] };
        if (kind === 'worker') last.workerId = id;
        if (kind === 'machine') last.machineId = id;
        return next;
      }
      const updated = w.assignments.map(a => a === last ? { ...a, [kind === 'worker' ? 'workerId' : 'machineId']: id } : a);
      return { ...w, assignments: updated };
    }));
    const target = werven.find(w => w.id === werfId);
    if (target) showToast('Toegewezen aan ' + target.klant);
  }, [werven]);

  const handleRemove = useCallback((aid) => {
    setWerven(prev => prev.map(w => ({ ...w, assignments: w.assignments.filter(a => a.id !== aid) })));
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
        hours: 8, remarks: '', opSign: false, clientSign: false
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
        date: '04/05/2026', hours: wb.hours, rate: 85, status: 'submitted'
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
        if (w.id === 'aveve') return { ...w, assignments: [{ id: 'a-d1', workerId: 'w1', machineId: 'm1' }] };
        if (w.id === 'agro') return { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] };
        return w;
      }));
      setStatus({ text: 'Planning opgeslagen — push verzonden', kind: 'success' });
      showToast('2 toewijzingen opgeslagen, mobile bijgewerkt');
    } else if (n === 2) {
      setWerven(prev => prev.map(w => w.id === 'agro' && w.assignments.length === 0
        ? { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] } : w));
      setMobile({ screen: 'today', currentWerkbon: null });
      setStatus({ text: 'Mobile actief', kind: 'info' });
      showToast('Open de telefoon rechts en doorloop de werkbon', 'info');
    } else if (n === 3) {
      setWerven(prev => prev.map(w => w.id === 'agro' && w.assignments.length === 0
        ? { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] } : w));
      setWerkbonnen(prev => prev.some(w => w.status === 'submitted')
        ? prev
        : [...prev, { id: 'wb-demo', nr: 431728, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '04/05/2026', hours: 8.0, rate: 85, status: 'submitted' }]);
      setTab('inbox');
      setStatus({ text: '1 werkbon ter goedkeuring', kind: 'warn' });
    } else if (n === 4) {
      setTab('invoice');
      setStatus({ text: 'Klik Genereer PDF', kind: 'info' });
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
                  { id: 'invoice', label: 'Facturen' },
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
                  werven={werven} workers={workers} machines={machines}
                  onAssign={handleAssign} onRemove={handleRemove}
                />
              )}
              {tab === 'inbox' && (
                <InboxTab werkbonnen={werkbonnen} onApprove={handleApprove} onReject={handleReject} />
              )}
              {tab === 'invoice' && (
                <InvoiceTab klanten={klanten} werkbonnen={werkbonnen} />
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
            werven={werven} workers={workers} machines={machines}
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
