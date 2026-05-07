import React, { useState, useRef, useEffect } from 'react';
import MultiSelectPopover from './MultiSelectPopover.jsx';

const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const DAYS_NL = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const DAYS_NL_SHORT = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

const formatDate = (d) => {
  const dayIdx = (d.getDay() + 6) % 7; // Mon = 0
  return `${DAYS_NL[dayIdx]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`;
};
const formatShort = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const todayDate = () => new Date(2026, 4, 4); // mocked "today" = 4 mei 2026

const renderName = (workerName, half) => {
  if (!workerName) return '';
  if (half === 'pm') return workerName.toLowerCase();
  return workerName;
};

export default function PlanningTab({
  werven, klanten, workers, machines, artikelen = [],
  dailyPool, onAddToPool, onRemoveFromPool,
  onAssign, onRemove, onSplit, onDuplicate, onUpdateAssignment,
  onUpdateWerf,
  onCopyDay,
  onCreateWerf, onCreateWorker, onCreateMachine
}) {
  const [splitDialog, setSplitDialog] = useState(null);
  const [currentDate, setCurrentDate] = useState(todayDate());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [printPreview, setPrintPreview] = useState(false);

  // Selection state for the − button
  const [selectedWerfId, setSelectedWerfId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [selectedArtikelId, setSelectedArtikelId] = useState(null);

  // Popover state for + button
  const [addWerfPopover, setAddWerfPopover] = useState(false);
  const [addWorkerPopover, setAddWorkerPopover] = useState(false);
  const [addMachinePopover, setAddMachinePopover] = useState(false);
  const [addArtikelPopover, setAddArtikelPopover] = useState(false);

  // "Create new" dialog state — triggered from inside the popover
  const [createWerfDialog, setCreateWerfDialog] = useState(false);
  const [createWorkerDialog, setCreateWorkerDialog] = useState(false);
  const [createMachineDialog, setCreateMachineDialog] = useState(false);

  const calendarRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (calendarOpen && calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calendarOpen]);

  const shiftDate = (delta) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    setCurrentDate(next);
  };

  // Booking lookup that takes duplicate instances into account
  const workerStatus = (workerId, instanceKey) => {
    let assignments = [];
    werven.forEach(w => {
      w.assignments.forEach(a => {
        if (a.workerId === workerId && (a.instanceKey || 'main') === (instanceKey || 'main')) {
          assignments.push(a);
        }
      });
    });
    if (assignments.length === 0) return 'free';
    if (assignments.some(a => a.half === 'full')) return 'booked';
    const hasAM = assignments.some(a => a.half === 'am');
    const hasPM = assignments.some(a => a.half === 'pm');
    if (hasAM && hasPM) return 'booked';
    if (hasAM) return 'am-only';
    return 'partial';
  };

  const isMachineAssigned = (id) => werven.some(w => w.assignments.some(a => a.machineId === id));

  const handleDrop = (werfId, e, target) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const [kind, id, instanceKey] = data.split(':');
    // If target specifies a row + slot (extra1/extra2), handle differently
    if (target && target.assignmentId && (target.slot === 'extra1' || target.slot === 'extra2')) {
      if (kind === 'artikel') {
        onUpdateAssignment(target.assignmentId, { [target.slot + 'Id']: id });
      }
      return;
    }
    onAssign(werfId, kind, id, instanceKey);
  };

  // Dubbelklik op een cel → item terug naar pool (clear veld op assignment).
  // Als hierdoor zowel werknemer als machine leeg zijn én geen extras, dan rij verwijderen.
  const handleClearCell = (assignment, slot) => {
    const patch = {};
    if (slot === 'worker') patch.workerId = null;
    if (slot === 'machine') patch.machineId = null;
    if (slot === 'extra1') patch.extra1Id = null;
    if (slot === 'extra2') patch.extra2Id = null;

    const after = { ...assignment, ...patch };
    const isEmpty = !after.workerId && !after.machineId && !after.extra1Id && !after.extra2Id;
    if (isEmpty) {
      onRemove(assignment.id);
    } else {
      onUpdateAssignment(assignment.id, patch);
    }
  };

  const handlePrint = () => {
    setPrintPreview(true);
    setTimeout(() => {
      window.print();
      setPrintPreview(false);
    }, 100);
  };

  // Build a list of worker-instances for the pool: main + any duplicates flagged on werknemer
  const workerInstances = workers.flatMap(w => {
    const dupCount = w.duplicates || 0;
    const result = [{ ...w, instanceKey: 'main', displayLabel: w.name }];
    for (let i = 1; i <= dupCount; i++) {
      result.push({ ...w, instanceKey: `dup${i}`, displayLabel: `${w.name} (${i + 1})`, isDuplicate: true });
    }
    return result;
  });

  return (
    <div className="p-4">
      {/* Date nav bar */}
      <div className="flex items-center gap-2 mb-4 relative">
        <button
          onClick={() => setCurrentDate(todayDate())}
          className="px-3 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
        >
          VANDAAG
        </button>
        <button
          onClick={() => shiftDate(-1)}
          className="w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600"
          title="Vorige dag"
        >
          ◀
        </button>
        <button
          onClick={() => setCalendarOpen(o => !o)}
          className={`text-sm font-medium px-3 py-1 rounded ${isSameDay(currentDate, todayDate()) ? 'text-red-700' : 'text-slate-800'} hover:bg-slate-100 border border-transparent hover:border-slate-200`}
          title="Klik om kalender te openen"
        >
          {formatDate(currentDate)}
        </button>
        <button
          onClick={() => shiftDate(1)}
          className="w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600"
          title="Volgende dag"
        >
          ▶
        </button>

        <span className="ml-auto text-xs text-slate-500">Sleep een werknemer + machine naar een werf</span>
        <button
          onClick={() => {
            if (window.confirm('Volledige planning van vandaag kopiëren naar morgen?\n\nDit kopieert alle werven, werknemers, machines en hun toewijzingen naar de volgende dag.')) {
              if (onCopyDay) onCopyDay(currentDate);
            }
          }}
          className="ml-2 px-3 py-1 text-xs rounded bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-1"
          title="Kopieer planning van vandaag naar morgen"
        >
          ⇒ Kopieer naar morgen
        </button>
        <button
          onClick={handlePrint}
          className="ml-1 px-3 py-1 text-xs rounded bg-slate-800 text-white hover:bg-slate-900 flex items-center gap-1"
          title="Dagplanning afdrukken"
        >
          🖨 Print PDF
        </button>

        {calendarOpen && (
          <div ref={calendarRef} className="absolute top-10 left-32 z-30">
            <Calendar
              date={currentDate}
              onPick={(d) => { setCurrentDate(d); setCalendarOpen(false); }}
              onClose={() => setCalendarOpen(false)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Werven</div>
          <div className="flex flex-col gap-2">
            {werven.filter(w => dailyPool.werven.has(w.id)).map(w => {
              const isSelected = selectedWerfId === w.id;
              return (
              <div
                key={w.id}
                onClick={() => setSelectedWerfId(isSelected ? null : w.id)}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-blue-400'); }}
                onDragLeave={e => e.currentTarget.classList.remove('ring-2', 'ring-blue-400')}
                onDrop={e => handleDrop(w.id, e)}
                className={`bg-white border rounded-lg overflow-hidden transition cursor-pointer ${
                  isSelected ? 'border-blue-500 ring-1 ring-blue-300' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Werf header — klant + werf-naam + werf-opmerking */}
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-slate-900">{w.klant}</span>
                    <span className="text-[10px] text-slate-500">{w.omschrijving || w.address}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider shrink-0">Opmerking werf:</span>
                    <input
                      type="text"
                      value={w.werfNota || ''}
                      onChange={e => { e.stopPropagation(); onUpdateWerf && onUpdateWerf(w.id, { werfNota: e.target.value }); }}
                      onClick={e => e.stopPropagation()}
                      placeholder="bv. toegang via Westkant, contactpersoon Jan +32 470..."
                      className="flex-1 text-[10px] bg-transparent border-0 outline-none focus:bg-white focus:px-1 focus:rounded text-slate-700 placeholder-slate-300"
                    />
                  </div>
                </div>

                {/* Toewijzingen tabel — header altijd zichtbaar, ook bij lege werf */}
                <table className="w-full text-[10px]" onClick={e => e.stopPropagation()}>
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[8.5px] uppercase tracking-wider text-slate-400">
                      <th className="text-left px-2 py-1 font-medium w-[26%]">Werknemer</th>
                      <th className="text-left px-2 py-1 font-medium w-[22%]">Machine</th>
                      <th className="text-left px-2 py-1 font-medium w-[16%]">Extra 1</th>
                      <th className="text-left px-2 py-1 font-medium w-[16%]">Extra 2</th>
                      <th className="text-left px-2 py-1 font-medium w-[20%]">Opmerking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.assignments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-3 text-center text-[10px] text-slate-400 italic">
                          Sleep een werknemer + machine hier...
                        </td>
                      </tr>
                    )}
                    {w.assignments.map(a => {
                        const isHemzelf = a.workerId === 'HEMZELF';
                        const wk = isHemzelf ? null : workers.find(x => x.id === a.workerId);
                        const mc = machines.find(x => x.id === a.machineId);
                        const ex1 = a.extra1Id ? artikelen.find(x => x.id === a.extra1Id) : null;
                        const ex2 = a.extra2Id ? artikelen.find(x => x.id === a.extra2Id) : null;
                        const half = a.half || 'full';
                        const halfLabel = half === 'am' ? 'VM' : half === 'pm' ? 'NM' : null;
                        const canSplit = (wk || isHemzelf) && half === 'full';
                        const isDup = a.instanceKey && a.instanceKey !== 'main';

                        return (
                          <tr key={a.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 group">
                            {/* Werknemer */}
                            <td
                              className={`px-2 py-1.5 align-top ${(wk || isHemzelf) ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                              onDoubleClick={() => { if (wk || isHemzelf) handleClearCell(a, 'worker'); }}
                              title={(wk || isHemzelf) ? 'Dubbelklik om werknemer te verwijderen' : ''}
                            >
                              <div className="flex items-center gap-1 flex-wrap">
                                {halfLabel && (
                                  <span className={`text-[8px] font-semibold px-1 rounded ${half === 'am' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{halfLabel}</span>
                                )}
                                {isDup && (
                                  <span className="text-[8px] font-semibold px-1 rounded bg-purple-100 text-purple-800" title="Dubbele werknemer instantie">×2</span>
                                )}
                                {isHemzelf && (
                                  <span className="text-slate-700 italic" title="Naakte machineverhuur — klant bestuurt zelf">HEMZELF</span>
                                )}
                                {wk && (
                                  <span className={`text-slate-900 ${half === 'pm' ? 'lowercase' : ''}`}>
                                    {renderName(wk.name, half)}
                                  </span>
                                )}
                                {!wk && !isHemzelf && (
                                  <span className="text-slate-300 italic text-[9px]">— sleep werknemer —</span>
                                )}
                                {canSplit && !isHemzelf && (
                                  <button
                                    onClick={() => setSplitDialog({
                                      sourceWerfId: w.id,
                                      sourceAssignmentId: a.id,
                                      workerName: wk.name,
                                      workerId: a.workerId,
                                      machineId: a.machineId
                                    })}
                                    className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition"
                                    title="VM/NM splitsen"
                                  >
                                    ⊕
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Machine */}
                            <td
                              className={`px-2 py-1.5 align-top ${mc ? 'cursor-pointer hover:bg-red-50' : ''}`}
                              onDoubleClick={() => { if (mc) handleClearCell(a, 'machine'); }}
                              title={mc ? 'Dubbelklik om machine te verwijderen' : ''}
                            >
                              {mc ? (
                                <span className="inline-flex items-center gap-1">
                                  {mc.color && (
                                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: mc.color }} />
                                  )}
                                  <span className="text-slate-900">{mc.code}</span>
                                </span>
                              ) : (
                                <span className="text-slate-300 italic text-[9px]">— sleep machine —</span>
                              )}
                            </td>

                            {/* Extra 1 — drop zone + dubbelklik om te verwijderen */}
                            <td
                              className={`px-2 py-1.5 align-top border-l border-slate-100 ${ex1 ? 'cursor-pointer hover:bg-amber-50' : 'bg-slate-50/30'}`}
                              onDoubleClick={() => { if (ex1) handleClearCell(a, 'extra1'); }}
                              onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('bg-amber-100', 'ring-1', 'ring-amber-400'); }}
                              onDragLeave={e => { e.currentTarget.classList.remove('bg-amber-100', 'ring-1', 'ring-amber-400'); }}
                              onDrop={e => {
                                e.stopPropagation();
                                e.currentTarget.classList.remove('bg-amber-100', 'ring-1', 'ring-amber-400');
                                handleDrop(w.id, e, { assignmentId: a.id, slot: 'extra1' });
                              }}
                              title={ex1 ? `${ex1.name} — dubbelklik om te verwijderen` : 'Sleep een artikel hier'}
                            >
                              {ex1 ? (
                                <span className="text-amber-700 font-medium">{ex1.code}</span>
                              ) : (
                                <span className="text-slate-300 italic text-[9px]">+ artikel</span>
                              )}
                            </td>

                            {/* Extra 2 — drop zone + dubbelklik om te verwijderen */}
                            <td
                              className={`px-2 py-1.5 align-top border-l border-slate-100 ${ex2 ? 'cursor-pointer hover:bg-amber-50' : 'bg-slate-50/30'}`}
                              onDoubleClick={() => { if (ex2) handleClearCell(a, 'extra2'); }}
                              onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('bg-amber-100', 'ring-1', 'ring-amber-400'); }}
                              onDragLeave={e => { e.currentTarget.classList.remove('bg-amber-100', 'ring-1', 'ring-amber-400'); }}
                              onDrop={e => {
                                e.stopPropagation();
                                e.currentTarget.classList.remove('bg-amber-100', 'ring-1', 'ring-amber-400');
                                handleDrop(w.id, e, { assignmentId: a.id, slot: 'extra2' });
                              }}
                              title={ex2 ? `${ex2.name} — dubbelklik om te verwijderen` : 'Sleep een artikel hier'}
                            >
                              {ex2 ? (
                                <span className="text-amber-700 font-medium">{ex2.code}</span>
                              ) : (
                                <span className="text-slate-300 italic text-[9px]">+ artikel</span>
                              )}
                            </td>

                            {/* Opmerking */}
                            <td className="px-2 py-1.5 align-top border-l border-slate-100 relative">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={a.opmerking || ''}
                                  onChange={e => onUpdateAssignment(a.id, { opmerking: e.target.value })}
                                  placeholder="—"
                                  className="flex-1 text-[10px] bg-transparent border-0 outline-none focus:bg-white focus:px-1 focus:rounded text-slate-700 placeholder-slate-300 min-w-0"
                                />
                                <button
                                  onClick={() => onRemove(a.id)}
                                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0"
                                  title="Rij verwijderen"
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              </div>
              );
            })}
          </div>
          {/* +/− toolbar — items toevoegen aan/verwijderen uit dagplanning */}
          <div className="flex gap-1.5 mt-2 px-1 items-center relative">
            <button
              onClick={() => setAddWerfPopover(true)}
              className="w-8 h-8 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-base font-semibold flex items-center justify-center leading-none"
              title="Werven aan dagplanning toevoegen"
            >
              +
            </button>
            <button
              onClick={() => {
                if (!selectedWerfId) return;
                onRemoveFromPool('werven', selectedWerfId);
                setSelectedWerfId(null);
              }}
              disabled={!selectedWerfId}
              className="w-8 h-8 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 text-base font-semibold flex items-center justify-center leading-none"
              title={selectedWerfId ? 'Geselecteerde werf uit dagplanning halen' : 'Selecteer eerst een werf'}
            >
              −
            </button>
            {selectedWerfId && (
              <span className="text-[10px] text-slate-500 italic">
                klik − om uit dagplanning te halen
              </span>
            )}
            {addWerfPopover && (
              <MultiSelectPopover
                title="Werven aan dagplanning toevoegen"
                items={werven.filter(w => !w.endDate).map(w => ({
                  id: w.id,
                  label: w.klant,
                  sublabel: w.omschrijving || w.address
                }))}
                selectedIds={dailyPool.werven}
                onConfirm={(ids) => { onAddToPool('werven', ids); setAddWerfPopover(false); }}
                onCancel={() => setAddWerfPopover(false)}
                onCreateNew={() => { setAddWerfPopover(false); setCreateWerfDialog(true); }}
                createNewLabel="+ Nieuwe werf aanmaken"
              />
            )}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Resources</div>

          <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-900 rounded-lg p-2">
            <div className="text-[10px] font-semibold text-blue-200 mb-2">WERKNEMERS</div>
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto thin-scroll">
              {workerInstances.filter(w => dailyPool.workers.has(w.id)).map(w => {
                const status = workerStatus(w.id, w.instanceKey);
                const draggable = status !== 'booked';
                const labelSuffix = status === 'am-only' ? ' (NM vrij)' : status === 'partial' ? ' (partieel)' : '';
                const opacity = status === 'booked' ? 'opacity-30' : status === 'am-only' ? 'opacity-70' : '';
                const isSelected = selectedWorkerId === w.id && !w.isDuplicate;
                return (
                  <div
                    key={`${w.id}-${w.instanceKey}`}
                    draggable={draggable}
                    onDragStart={e => e.dataTransfer.setData('text/plain', `worker:${w.id}:${w.instanceKey}`)}
                    onClick={() => !w.isDuplicate && setSelectedWorkerId(isSelected ? null : w.id)}
                    className={`rounded px-2 py-1 text-[11px] flex items-center gap-1 ${
                      isSelected ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400' : 'bg-white/95 text-slate-900'
                    } ${opacity} ${draggable ? 'cursor-grab hover:bg-white' : 'cursor-not-allowed'}`}
                    title={status === 'am-only' ? 'NM nog vrij — sleep om PM toe te wijzen' : ''}
                  >
                    {w.isDuplicate && <span className="text-[8px] font-semibold px-1 rounded bg-purple-100 text-purple-800">×2</span>}
                    <span className="flex-1 truncate">
                      {w.name}
                      {labelSuffix && <span className="text-slate-500 text-[9px] ml-1">{labelSuffix}</span>}
                    </span>
                    {w.type === 'subcontractor' && (
                      <span className="text-[9px] text-amber-700 bg-amber-100 px-1 rounded">OA</span>
                    )}
                    {!w.isDuplicate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(w.id); }}
                        className="text-purple-600 hover:text-purple-800 text-[12px] leading-none"
                        title="Dubbele werknemer aanmaken — werknemer verschijnt nog een keer in de pool"
                      >
                        ⧉
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {/* +/− toolbar — werknemers in/uit dagplanning */}
            <div className="flex gap-1.5 mt-2 items-center relative">
              <button
                onClick={() => setAddWorkerPopover(true)}
                className="w-8 h-8 rounded bg-blue-800 hover:bg-blue-700 text-blue-100 text-base font-semibold flex items-center justify-center border border-blue-700 leading-none"
                title="Werknemers aan dagplanning toevoegen"
              >
                +
              </button>
              <button
                onClick={() => {
                  if (!selectedWorkerId) return;
                  onRemoveFromPool('workers', selectedWorkerId);
                  setSelectedWorkerId(null);
                }}
                disabled={!selectedWorkerId}
                className="w-8 h-8 rounded bg-blue-800 hover:bg-blue-700 text-blue-100 text-base font-semibold flex items-center justify-center border border-blue-700 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                title={selectedWorkerId ? 'Geselecteerde werknemer uit dagplanning halen' : 'Selecteer eerst een werknemer'}
              >
                −
              </button>
              {selectedWorkerId && (
                <span className="text-[9px] text-blue-200 italic">
                  klik − om uit dagplanning te halen
                </span>
              )}
              {addWorkerPopover && (
                <MultiSelectPopover
                  title="Werknemers aan dagplanning toevoegen"
                  items={workers.filter(w => !w.endDate).map(w => ({
                    id: w.id,
                    label: w.name,
                    sublabel: w.function,
                    badge: w.type === 'subcontractor' ? 'OA' : null
                  }))}
                  selectedIds={dailyPool.workers}
                  onConfirm={(ids) => { onAddToPool('workers', ids); setAddWorkerPopover(false); }}
                  onCancel={() => setAddWorkerPopover(false)}
                  onCreateNew={() => { setAddWorkerPopover(false); setCreateWorkerDialog(true); }}
                  createNewLabel="+ Nieuwe werknemer aanmaken"
                />
              )}
            </div>
          </div>

          <div className="bg-red-900 rounded-lg p-2">
            <div className="text-[10px] font-semibold text-red-200 mb-2">MACHINES</div>
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto thin-scroll">
              {machines.filter(m => dailyPool.machines.has(m.id)).map(m => {
                const taken = isMachineAssigned(m.id);
                const isSelected = selectedMachineId === m.id;
                return (
                  <div
                    key={m.id}
                    draggable={!taken}
                    onDragStart={e => e.dataTransfer.setData('text/plain', `machine:${m.id}:`)}
                    onClick={() => setSelectedMachineId(isSelected ? null : m.id)}
                    className={`rounded px-2 py-1 text-[11px] flex justify-between gap-2 ${
                      isSelected ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-400' : 'bg-white/95 text-slate-900'
                    } ${taken ? 'opacity-30 cursor-not-allowed' : 'cursor-grab hover:bg-white'}`}
                  >
                    <span className="text-slate-500 text-[10px]">{m.group}</span>
                    <span className="font-medium">{m.code}</span>
                  </div>
                );
              })}
            </div>
            {/* +/− toolbar — machines in/uit dagplanning */}
            <div className="flex gap-1.5 mt-2 items-center relative">
              <button
                onClick={() => setAddMachinePopover(true)}
                className="w-8 h-8 rounded bg-red-800 hover:bg-red-700 text-red-100 text-base font-semibold flex items-center justify-center border border-red-700 leading-none"
                title="Machines aan dagplanning toevoegen"
              >
                +
              </button>
              <button
                onClick={() => {
                  if (!selectedMachineId) return;
                  onRemoveFromPool('machines', selectedMachineId);
                  setSelectedMachineId(null);
                }}
                disabled={!selectedMachineId}
                className="w-8 h-8 rounded bg-red-800 hover:bg-red-700 text-red-100 text-base font-semibold flex items-center justify-center border border-red-700 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                title={selectedMachineId ? 'Geselecteerde machine uit dagplanning halen' : 'Selecteer eerst een machine'}
              >
                −
              </button>
              {selectedMachineId && (
                <span className="text-[9px] text-red-200 italic">
                  klik − om uit dagplanning te halen
                </span>
              )}
              {addMachinePopover && (
                <MultiSelectPopover
                  title="Machines aan dagplanning toevoegen"
                  items={machines.filter(m => !m.endDate).map(m => ({
                    id: m.id,
                    label: m.code,
                    sublabel: m.group
                  }))}
                  selectedIds={dailyPool.machines}
                  onConfirm={(ids) => { onAddToPool('machines', ids); setAddMachinePopover(false); }}
                  onCancel={() => setAddMachinePopover(false)}
                  onCreateNew={() => { setAddMachinePopover(false); setCreateMachineDialog(true); }}
                  createNewLabel="+ Nieuwe machine aanmaken"
                />
              )}
            </div>
          </div>
          </div>{/* /grid-cols-2 (werknemers + machines side by side) */}

          {/* Artikelen pool — onder de werknemers/machines pools */}
          <div className="bg-amber-900 rounded-lg p-2 mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold text-amber-200">ARTIKELEN</div>
              <div className="text-[9px] text-amber-300/70">GPS · trilplaten · buizen · ...</div>
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto thin-scroll">
              {artikelen.filter(a => dailyPool.artikelen && dailyPool.artikelen.has(a.id)).map(a => {
                const isSelected = selectedArtikelId === a.id;
                return (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('text/plain', `artikel:${a.id}:`)}
                    onClick={() => setSelectedArtikelId(isSelected ? null : a.id)}
                    className={`rounded px-2 py-1 text-[11px] flex justify-between gap-2 cursor-grab hover:bg-white ${
                      isSelected ? 'bg-orange-200 text-orange-900 ring-2 ring-orange-400' : 'bg-white/95 text-slate-900'
                    }`}
                    title={a.description}
                  >
                    <span className="text-slate-500 text-[9px] truncate">{a.group}</span>
                    <span className="font-medium truncate">{a.code}</span>
                  </div>
                );
              })}
              {(!dailyPool.artikelen || dailyPool.artikelen.size === 0) && (
                <div className="col-span-2 text-center text-[10px] text-amber-300/70 italic py-2">
                  Geen artikelen in dagplanning — klik + om toe te voegen
                </div>
              )}
            </div>
            {/* +/− toolbar — artikelen in/uit dagplanning */}
            <div className="flex gap-1.5 mt-2 items-center relative">
              <button
                onClick={() => setAddArtikelPopover(true)}
                className="w-8 h-8 rounded bg-amber-800 hover:bg-amber-700 text-amber-100 text-base font-semibold flex items-center justify-center border border-amber-700 leading-none"
                title="Artikelen aan dagplanning toevoegen"
              >
                +
              </button>
              <button
                onClick={() => {
                  if (!selectedArtikelId) return;
                  onRemoveFromPool('artikelen', selectedArtikelId);
                  setSelectedArtikelId(null);
                }}
                disabled={!selectedArtikelId}
                className="w-8 h-8 rounded bg-amber-800 hover:bg-amber-700 text-amber-100 text-base font-semibold flex items-center justify-center border border-amber-700 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                title={selectedArtikelId ? 'Geselecteerd artikel uit dagplanning halen' : 'Selecteer eerst een artikel'}
              >
                −
              </button>
              {selectedArtikelId && (
                <span className="text-[9px] text-amber-200 italic">
                  klik − om uit dagplanning te halen
                </span>
              )}
              {addArtikelPopover && (
                <MultiSelectPopover
                  title="Artikelen aan dagplanning toevoegen"
                  items={artikelen.filter(a => a.active !== false).map(a => ({
                    id: a.id,
                    label: a.code,
                    sublabel: `${a.name} · ${a.group}`
                  }))}
                  selectedIds={dailyPool.artikelen || new Set()}
                  onConfirm={(ids) => { onAddToPool('artikelen', ids); setAddArtikelPopover(false); }}
                  onCancel={() => setAddArtikelPopover(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {splitDialog && (
        <SplitDialog
          dialog={splitDialog}
          werven={werven}
          machines={machines}
          onCancel={() => setSplitDialog(null)}
          onConfirm={(payload) => {
            onSplit(splitDialog, payload);
            setSplitDialog(null);
          }}
        />
      )}

      {createWerfDialog && (
        <AddWerfDialog
          klanten={klanten}
          onCancel={() => setCreateWerfDialog(false)}
          onConfirm={(data) => {
            onCreateWerf(data);
            setCreateWerfDialog(false);
          }}
        />
      )}

      {createWorkerDialog && (
        <AddWorkerDialog
          onCancel={() => setCreateWorkerDialog(false)}
          onConfirm={(data) => {
            onCreateWorker(data);
            setCreateWorkerDialog(false);
          }}
        />
      )}

      {createMachineDialog && (
        <AddMachineDialog
          onCancel={() => setCreateMachineDialog(false)}
          onConfirm={(data) => {
            onCreateMachine(data);
            setCreateMachineDialog(false);
          }}
        />
      )}

      {printPreview && (
        <PrintView date={currentDate} werven={werven} workers={workers} machines={machines} />
      )}
    </div>
  );
}

// Mini calendar popup
function Calendar({ date, onPick }) {
  const [viewDate, setViewDate] = useState(new Date(date));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = todayDate();

  const firstOfMonth = new Date(year, month, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600"
        >◀</button>
        <span className="text-sm font-medium">{MONTHS_NL[month]} {year}</span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600"
        >▶</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {DAYS_NL_SHORT.map(d => (
          <div key={d} className="text-[9px] font-semibold text-slate-500 uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />;
          const isToday = isSameDay(c, today);
          const isSelected = isSameDay(c, date);
          const isWeekend = c.getDay() === 0 || c.getDay() === 6;
          return (
            <button
              key={i}
              onClick={() => onPick(c)}
              className={`text-xs rounded h-7 w-full ${
                isSelected ? 'bg-blue-600 text-white font-semibold' :
                isToday ? 'bg-red-50 text-red-700 font-semibold' :
                isWeekend ? 'text-slate-400 hover:bg-slate-100' :
                'hover:bg-slate-100'
              }`}
            >
              {c.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SplitDialog({ dialog, werven, machines, onCancel, onConfirm }) {
  const sourceWerf = werven.find(w => w.id === dialog.sourceWerfId);
  const otherWerven = werven.filter(w => w.id !== dialog.sourceWerfId);
  const sourceMachine = machines.find(m => m.id === dialog.machineId);

  const [pmWerfId, setPmWerfId] = useState(otherWerven[0]?.id || '');
  const [amHours, setAmHours] = useState(4);
  const [pmHours, setPmHours] = useState(4);
  const [sameMachine, setSameMachine] = useState(true);
  const [pmMachineId, setPmMachineId] = useState('');

  const finalPmMachine = sameMachine ? dialog.machineId : pmMachineId;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold">Werknemer splitsen (VM / NM)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className="uppercase font-medium">{dialog.workerName}</span> verdelen over twee werven
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-semibold uppercase bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">VM</span>
              <span className="text-xs font-semibold uppercase">{dialog.workerName}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-1">Werf</div>
            <div className="text-xs font-medium mb-2">{sourceWerf?.klant}</div>
            <div className="text-[10px] text-slate-500 mb-1">Machine</div>
            <div className="text-xs mb-2">{sourceMachine?.code || '—'}</div>
            <div className="text-[10px] text-slate-500 mb-1">Uren</div>
            <input type="number" step="0.5" min="0" max="12" value={amHours}
              onChange={e => setAmHours(parseFloat(e.target.value) || 0)}
              className="w-20 h-7 px-2 text-xs border border-slate-300 rounded" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-semibold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">NM</span>
              <span className="text-xs font-semibold lowercase">{dialog.workerName.toLowerCase()}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-1">Werf</div>
            <select value={pmWerfId} onChange={e => setPmWerfId(e.target.value)}
              className="w-full h-7 px-2 text-xs border border-slate-300 rounded mb-2 bg-white">
              {otherWerven.map(w => <option key={w.id} value={w.id}>{w.klant}</option>)}
            </select>
            <div className="text-[10px] text-slate-500 mb-1">Machine</div>
            <div className="flex flex-col gap-1 mb-2">
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input type="radio" checked={sameMachine} onChange={() => setSameMachine(true)} />
                Zelfde ({sourceMachine?.code || '—'})
              </label>
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input type="radio" checked={!sameMachine} onChange={() => setSameMachine(false)} />
                Andere:
              </label>
              {!sameMachine && (
                <select value={pmMachineId} onChange={e => setPmMachineId(e.target.value)}
                  className="w-full h-7 px-2 text-xs border border-slate-300 rounded bg-white">
                  <option value="">— Kies machine —</option>
                  {machines.filter(m => m.id !== dialog.machineId).map(m => (
                    <option key={m.id} value={m.id}>{m.group} · {m.code}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mb-1">Uren</div>
            <input type="number" step="0.5" min="0" max="12" value={pmHours}
              onChange={e => setPmHours(parseFloat(e.target.value) || 0)}
              className="w-20 h-7 px-2 text-xs border border-slate-300 rounded" />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 mb-4">
          Totaal {(amHours + pmHours).toFixed(1)} u
          {amHours + pmHours > 9 && <span className="text-amber-700 ml-2">⚠ overuren</span>}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">
            Annuleren
          </button>
          <button
            onClick={() => onConfirm({ pmWerfId, amHours, pmHours, pmMachineId: finalPmMachine })}
            disabled={!pmWerfId || (!sameMachine && !pmMachineId)}
            className="text-xs px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Splitsen
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Add dialogs =====

function AddWerfDialog({ klanten, onCancel, onConfirm }) {
  const [klantId, setKlantId] = useState(klanten[0]?.id || '');
  const [omschrijving, setOmschrijving] = useState('');
  const [address, setAddress] = useState('');

  const canSubmit = klantId && omschrijving.trim() && address.trim();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[460px] max-w-[95vw] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold">Nieuwe werf toevoegen</h3>
            <p className="text-xs text-slate-500 mt-0.5">Werf voor een bestaande klant aanmaken</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Klant <span className="text-red-500">*</span></label>
            <select
              value={klantId}
              onChange={e => setKlantId(e.target.value)}
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
            >
              {klanten.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Werf naam / omschrijving <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={omschrijving}
              onChange={e => setOmschrijving(e.target.value)}
              placeholder="bv. Onderhoud patrimonium 543, Kaaimuur Boudewijnkanaal..."
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Adres / locatie <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="bv. Aalter, Roeselare, Antwerpen Hoboken..."
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">Annuleren</button>
          <button
            onClick={() => onConfirm({ klantId, omschrijving: omschrijving.trim(), address: address.trim() })}
            disabled={!canSubmit}
            className="text-xs px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Werf aanmaken
          </button>
        </div>
      </div>
    </div>
  );
}

function AddWorkerDialog({ onCancel, onConfirm }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('employee');
  const [func, setFunc] = useState('Bestuurder');
  const [uurloon1, setUurloon1] = useState(25);
  const [uurloon2, setUurloon2] = useState(37.5);
  const [oaTarief, setOaTarief] = useState(50);
  const [oaTariefOver, setOaTariefOver] = useState(60);

  const isOA = type === 'subcontractor';
  const canSubmit = name.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold">Nieuwe werknemer toevoegen</h3>
            <p className="text-xs text-slate-500 mt-0.5">Werknemer of onderaannemer aanmaken</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Naam <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              placeholder="bv. JANSSENS PIETER"
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
            >
              <option value="employee">Werknemer</option>
              <option value="subcontractor">Onderaannemer (OA)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Functie</label>
            <select
              value={func}
              onChange={e => setFunc(e.target.value)}
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
            >
              <option>Bestuurder</option>
              <option>Arbeider</option>
              <option>Chauffeur</option>
              <option>Voorman</option>
              <option>Magazijn</option>
            </select>
          </div>

          {!isOA && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Uurloon 1 (regulier)</label>
                <input
                  type="number" step="0.5"
                  value={uurloon1}
                  onChange={e => setUurloon1(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Uurloon 2 (overuren)</label>
                <input
                  type="number" step="0.5"
                  value={uurloon2}
                  onChange={e => setUurloon2(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
                />
              </div>
            </>
          )}

          {isOA && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">OA-tarief regulier</label>
                <input
                  type="number" step="1"
                  value={oaTarief}
                  onChange={e => setOaTarief(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">OA-tarief overuren</label>
                <input
                  type="number" step="1"
                  value={oaTariefOver}
                  onChange={e => setOaTariefOver(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">Annuleren</button>
          <button
            onClick={() => onConfirm(isOA
              ? { name: name.trim(), type, function: func, uurloon1: 0, uurloon2: 0, oaTarief, oaTariefOver }
              : { name: name.trim(), type, function: func, uurloon1, uurloon2 }
            )}
            disabled={!canSubmit}
            className="text-xs px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Werknemer aanmaken
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMachineDialog({ onCancel, onConfirm }) {
  const [code, setCode] = useState('');
  const [group, setGroup] = useState('Bandenkraan');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState(85);
  const [color, setColor] = useState('#3B82F6');

  const colorPresets = [
    { c: '#3B82F6', label: 'Blauw' },
    { c: '#F59E0B', label: 'Oranje' },
    { c: '#10B981', label: 'Groen' },
    { c: '#EF4444', label: 'Rood' },
    { c: '#8B5CF6', label: 'Paars' },
    { c: '#EC4899', label: 'Roze' },
    { c: '#6B7280', label: 'Grijs' }
  ];

  const canSubmit = code.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold">Nieuwe machine toevoegen</h3>
            <p className="text-xs text-slate-500 mt-0.5">Machine in het wagenpark registreren</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Machine code <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="bv. ZX140.13 WD, Bobcat 9, Sen 835.44"
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Groep</label>
            <select
              value={group}
              onChange={e => setGroup(e.target.value)}
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded bg-white"
            >
              <option>Bandenkraan</option>
              <option>Bandenlader</option>
              <option>Bobcat</option>
              <option>Borstelmachine</option>
              <option>Dieplader</option>
              <option>Dumper</option>
              <option>Minigraafmachine</option>
              <option>Rupskraan</option>
              <option>Tractor</option>
              <option>Vrachtwagens</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Tarief (€/u)</label>
            <input
              type="number" step="1"
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value) || 0)}
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Beschrijving</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="optioneel — bv. Hitachi ZX140 W-6 wheeled excavator"
              className="w-full h-8 px-2 text-xs border border-slate-300 rounded"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Kleur (voor planning pill)</label>
            <div className="flex gap-1.5">
              {colorPresets.map(p => (
                <button
                  key={p.c}
                  type="button"
                  onClick={() => setColor(p.c)}
                  className={`w-7 h-7 rounded ${color === p.c ? 'ring-2 ring-offset-1 ring-slate-700' : 'ring-1 ring-slate-300'}`}
                  style={{ backgroundColor: p.c }}
                  title={p.label}
                />
              ))}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px]">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
              {code || 'voorbeeld'}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50">Annuleren</button>
          <button
            onClick={() => onConfirm({ code: code.trim(), group, description: description.trim(), rate, color })}
            disabled={!canSubmit}
            className="text-xs px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Machine aanmaken
          </button>
        </div>
      </div>
    </div>
  );
}

// Print view — A4 layout matching USEIT2000 planning document
function PrintView({ date, werven, workers, machines }) {
  // Group werven by klant
  const klantenGroups = {};
  werven.forEach(w => {
    const klantName = w.klant || '—';
    if (!klantenGroups[klantName]) klantenGroups[klantName] = [];
    klantenGroups[klantName].push(w);
  });
  const sortedKlanten = Object.keys(klantenGroups).sort();

  // Compute idle (unassigned) machines and workers
  const assignedMachineIds = new Set();
  const assignedWorkerIds = new Set();
  werven.forEach(w => {
    w.assignments.forEach(a => {
      if (a.machineId) assignedMachineIds.add(a.machineId);
      if (a.workerId && a.workerId !== 'HEMZELF') assignedWorkerIds.add(a.workerId);
    });
  });
  const idleMachines = machines.filter(m => !assignedMachineIds.has(m.id));
  const idleWorkers = workers.filter(w => !assignedWorkerIds.has(w.id));

  // Group idle machines by their `group` field (Bandenkraan, Bobcat, etc.)
  const idleMachinesByGroup = {};
  idleMachines.forEach(m => {
    if (!idleMachinesByGroup[m.group]) idleMachinesByGroup[m.group] = [];
    idleMachinesByGroup[m.group].push(m);
  });

  // Format planning header date as DAG D/MM/YYYY (e.g. "DINSDAG 5/05/2026")
  const headerDate = (() => {
    const dayIdx = (date.getDay() + 6) % 7;
    return `${DAYS_NL[dayIdx].toUpperCase()} ${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  })();
  const printedOn = formatDate(new Date());

  // Helper: render assignment in 3-column row format (werknemer | machine | opmerking)
  const renderAssignment = (a) => {
    const isHemzelf = a.workerId === 'HEMZELF';
    const wk = isHemzelf ? null : workers.find(x => x.id === a.workerId);
    const mc = machines.find(x => x.id === a.machineId);
    const half = a.half || 'full';
    const isDup = a.instanceKey && a.instanceKey !== 'main';
    const lowercaseName = half === 'pm';
    return {
      worker: isHemzelf
        ? 'HEMZELF'
        : wk
          ? (lowercaseName ? wk.name.toLowerCase() : wk.name)
          : '',
      machine: mc?.code || '',
      machineColor: mc?.color || '#3B82F6',
      opmerking: a.opmerking || '',
      isDup
    };
  };

  return (
    <div className="print-only fixed inset-0 bg-white z-[9999] overflow-auto" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
          @page { margin: 1cm; size: A4; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
        @media screen {
          .print-only { display: block !important; padding: 24px; }
        }
        .useit-klant {
          font-style: italic;
          font-weight: 700;
          color: #1e3a8a;
          text-decoration: underline;
          font-size: 12px;
          padding-top: 8px;
          padding-bottom: 2px;
          border-bottom: 0.5px solid #cbd5e1;
        }
        .useit-row {
          display: grid;
          grid-template-columns: 32px 1fr 1fr 1fr;
          font-size: 11px;
          line-height: 1.4;
          padding: 1px 0;
        }
        .useit-row .indent { width: 32px; }
        .useit-machine { color: #1e40af; }
        .useit-machine.colored { color: #b45309; }
      `}</style>

      <div className="max-w-[190mm] mx-auto" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {/* Blue header bar like USEIT */}
        <div className="bg-blue-900 text-white flex items-center justify-between px-3 py-2 mb-1">
          <span className="text-lg italic font-bold">Planning</span>
          <span className="text-sm font-semibold tracking-wide">{headerDate}</span>
        </div>

        {/* Klant + werven blocks */}
        {sortedKlanten.map((klantName, ki) => {
          const klantWerven = klantenGroups[klantName].filter(w => w.assignments.length > 0);
          if (klantWerven.length === 0) return null;

          // Each werf becomes a sub-header (or just the klant name if only 1 werf)
          return (
            <div key={ki} className="avoid-break">
              {klantWerven.map((w, wi) => {
                // Klant-name + werf description: "ARTES DEPRET Onderhoud patrimonium 543"
                const headerLabel = w.omschrijving && w.omschrijving !== klantName
                  ? `${klantName} ${w.omschrijving}`
                  : klantName;
                return (
                  <div key={w.id}>
                    <div className="useit-klant">{headerLabel}</div>
                    {w.assignments.map(a => {
                      const r = renderAssignment(a);
                      return (
                        <div key={a.id} className="useit-row">
                          <div className="indent" />
                          <div className={r.worker === 'HEMZELF' ? 'italic' : ''}>
                            {r.worker}
                            {r.isDup && <span className="text-[9px] text-purple-700 ml-1">×2</span>}
                          </div>
                          <div className={`useit-machine ${r.machineColor !== '#3B82F6' ? 'colored' : ''}`}>{r.machine}</div>
                          <div className="text-slate-700">{r.opmerking}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* THUIS / BIJ HUURDE — werknemers niet ingezet */}
        {idleWorkers.length > 0 && (
          <div className="avoid-break mt-4">
            <div className="useit-klant">THUIS</div>
            <div className="useit-row" style={{ gridTemplateColumns: '32px 1fr', fontStyle: 'italic', color: '#475569' }}>
              <div className="indent" />
              <div>BIJ HUURDE</div>
            </div>
            {idleWorkers.map(w => (
              <div key={w.id} className="useit-row" style={{ gridTemplateColumns: '32px 1fr' }}>
                <div className="indent" />
                <div>{w.name}{w.type === 'subcontractor' && <span className="text-[9px] ml-1 text-amber-700">OA</span>}</div>
              </div>
            ))}
          </div>
        )}

        {/* Machines niet in gebruik — gegroepeerd per type */}
        {idleMachines.length > 0 && (
          <div className="mt-4 avoid-break">
            <div className="bg-slate-700 text-white text-xs italic font-semibold px-2 py-1 inline-block">
              Machines niet in gebruik
            </div>
            <div className="mt-1">
              {Object.keys(idleMachinesByGroup).sort().map(group => (
                <div key={group}>
                  {idleMachinesByGroup[group].map((m, i) => (
                    <div key={m.id} className="useit-row" style={{ gridTemplateColumns: '120px 1fr' }}>
                      <div className="text-slate-700">{i === 0 ? group : ''}</div>
                      <div className="useit-machine">{m.code}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-2 border-t border-slate-400 flex justify-between text-[10px] text-slate-700">
          <span className="font-semibold">{printedOn}</span>
          <span className="font-semibold">Pagina 1</span>
        </div>
      </div>
    </div>
  );
}
