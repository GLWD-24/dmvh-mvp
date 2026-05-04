import React, { useState, useRef, useEffect } from 'react';

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

export default function PlanningTab({ werven, workers, machines, onAssign, onRemove, onSplit, onDuplicate }) {
  const [splitDialog, setSplitDialog] = useState(null);
  const [currentDate, setCurrentDate] = useState(todayDate());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [printPreview, setPrintPreview] = useState(false);

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

  const handleDrop = (werfId, e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const [kind, id, instanceKey] = data.split(':');
    onAssign(werfId, kind, id, instanceKey);
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
          onClick={handlePrint}
          className="ml-2 px-3 py-1 text-xs rounded bg-slate-800 text-white hover:bg-slate-900 flex items-center gap-1"
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Werven</div>
          <div className="flex flex-col gap-2">
            {werven.map(w => (
              <div
                key={w.id}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50'); }}
                onDragLeave={e => e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50')}
                onDrop={e => handleDrop(w.id, e)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 min-h-[64px] transition"
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold">{w.klant}</span>
                  <span className="text-[10px] text-slate-400">{w.address}</span>
                </div>
                <div className="mt-1 min-h-[24px]">
                  {w.assignments.length === 0 ? (
                    <span className="text-[10px] text-slate-400">Sleep hier...</span>
                  ) : (
                    w.assignments.map(a => {
                      const wk = workers.find(x => x.id === a.workerId);
                      const mc = machines.find(x => x.id === a.machineId);
                      const half = a.half || 'full';
                      const halfLabel = half === 'am' ? 'VM' : half === 'pm' ? 'NM' : null;
                      const halfBadgeColor = half === 'am' ? 'bg-blue-100 text-blue-800' : half === 'pm' ? 'bg-amber-100 text-amber-800' : '';
                      const canSplit = wk && half === 'full';
                      const isDup = a.instanceKey && a.instanceKey !== 'main';

                      return (
                        <span
                          key={a.id}
                          className={`inline-flex items-center gap-1 bg-white border ${half === 'pm' ? 'border-amber-300' : isDup ? 'border-purple-300' : 'border-slate-200'} rounded-full px-2 py-0.5 text-[10px] mr-1 mt-1`}
                        >
                          {halfLabel && (
                            <span className={`text-[8px] font-semibold px-1 rounded ${halfBadgeColor}`}>{halfLabel}</span>
                          )}
                          {isDup && (
                            <span className="text-[8px] font-semibold px-1 rounded bg-purple-100 text-purple-800" title="Dubbele werknemer instantie">×2</span>
                          )}
                          {wk && (
                            <span className={half === 'pm' ? 'lowercase' : ''}>
                              {renderName(wk.name, half)}
                            </span>
                          )}
                          {wk && mc && ' · '}
                          {mc && mc.code}
                          {a.hours && a.hours !== 8 && (
                            <span className="text-slate-400 ml-1">{a.hours}u</span>
                          )}
                          {canSplit && (
                            <button
                              onClick={() => setSplitDialog({
                                sourceWerfId: w.id,
                                sourceAssignmentId: a.id,
                                workerName: wk.name,
                                workerId: a.workerId,
                                machineId: a.machineId
                              })}
                              className="text-blue-500 hover:text-blue-700 ml-0.5"
                              title="Dubbele werknemer maken (AM/PM splitsen)"
                            >
                              ⊕
                            </button>
                          )}
                          <button
                            onClick={() => onRemove(a.id)}
                            className="text-slate-400 hover:text-red-500 ml-1"
                            title="Verwijderen"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Resources</div>

          <div className="bg-blue-900 rounded-lg p-2 mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold text-blue-200">WERKNEMERS</div>
              <span className="text-[9px] text-blue-300">📋 Dupliceer voor 2× plannen</span>
            </div>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto thin-scroll">
              {workerInstances.map(w => {
                const status = workerStatus(w.id, w.instanceKey);
                const draggable = status !== 'booked';
                const labelSuffix = status === 'am-only' ? ' (NM vrij)' : status === 'partial' ? ' (partieel)' : '';
                const opacity = status === 'booked' ? 'opacity-30' : status === 'am-only' ? 'opacity-70' : '';
                return (
                  <div
                    key={`${w.id}-${w.instanceKey}`}
                    draggable={draggable}
                    onDragStart={e => e.dataTransfer.setData('text/plain', `worker:${w.id}:${w.instanceKey}`)}
                    className={`bg-white/95 rounded px-2 py-1 text-[11px] text-slate-900 ${opacity} flex items-center gap-1 ${draggable ? 'cursor-grab hover:bg-white' : 'cursor-not-allowed'}`}
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
                        onClick={() => onDuplicate(w.id)}
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
          </div>

          <div className="bg-red-900 rounded-lg p-2">
            <div className="text-[10px] font-semibold text-red-200 mb-2">MACHINES</div>
            <div className="flex flex-col gap-1 max-h-44 overflow-y-auto thin-scroll">
              {machines.map(m => {
                const taken = isMachineAssigned(m.id);
                return (
                  <div
                    key={m.id}
                    draggable={!taken}
                    onDragStart={e => e.dataTransfer.setData('text/plain', `machine:${m.id}:`)}
                    className={`bg-white/95 rounded px-2 py-1 text-[11px] text-slate-900 flex justify-between gap-2 ${taken ? 'opacity-30 cursor-not-allowed' : 'cursor-grab hover:bg-white'}`}
                  >
                    <span className="text-slate-500 text-[10px]">{m.group}</span>
                    <span className="font-medium">{m.code}</span>
                  </div>
                );
              })}
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

// Print view — clean A4 layout, only visible during print
function PrintView({ date, werven, workers, machines }) {
  return (
    <div className="print-only fixed inset-0 bg-white z-[9999] p-8 overflow-auto" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
          @page { margin: 1.5cm; size: A4; }
        }
        @media screen {
          .print-only { display: block !important; }
        }
      `}</style>
      <div className="max-w-[180mm] mx-auto">
        <div className="flex justify-between items-baseline border-b-2 border-slate-800 pb-2 mb-4">
          <div>
            <div className="text-xl font-bold">DEMAECKER &amp; VANHAECKE</div>
            <div className="text-xs text-slate-600">Dorpweg 35, 8377 Zuienkerke · 050/31 63 27</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600">Dagplanning</div>
            <div className="text-lg font-semibold">{formatDate(date)}</div>
          </div>
        </div>

        {werven.filter(w => w.assignments.length > 0).map(w => (
          <div key={w.id} className="mb-4 break-inside-avoid">
            <div className="flex items-baseline gap-3 bg-slate-100 px-2 py-1 border-l-4 border-slate-800">
              <span className="font-semibold text-sm">{w.klant}</span>
              <span className="text-xs text-slate-600">{w.address}</span>
            </div>
            <table className="w-full text-xs mt-1 border-collapse">
              <thead>
                <tr className="text-slate-600 text-[10px] uppercase border-b border-slate-300">
                  <th className="text-left py-1 w-12">Half</th>
                  <th className="text-left">Werknemer</th>
                  <th className="text-left">Machine</th>
                  <th className="text-right w-16">Uren</th>
                </tr>
              </thead>
              <tbody>
                {w.assignments.map(a => {
                  const wk = workers.find(x => x.id === a.workerId);
                  const mc = machines.find(x => x.id === a.machineId);
                  const half = a.half || 'full';
                  const halfLabel = half === 'am' ? 'VM' : half === 'pm' ? 'NM' : '';
                  return (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="py-1">{halfLabel}</td>
                      <td className={half === 'pm' ? 'lowercase' : ''}>
                        {wk ? renderName(wk.name, half) : '—'}
                        {a.instanceKey && a.instanceKey !== 'main' && <span className="ml-1 text-[9px] text-purple-700">×2</span>}
                      </td>
                      <td>{mc?.code || '—'}</td>
                      <td className="text-right">{a.hours || 8} u</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {werven.filter(w => w.assignments.length === 0).length > 0 && (
          <div className="mt-6 pt-3 border-t border-slate-300 text-xs text-slate-500">
            <strong>Werven zonder toewijzing:</strong>{' '}
            {werven.filter(w => w.assignments.length === 0).map(w => w.klant).join(' · ')}
          </div>
        )}

        <div className="mt-8 text-[10px] text-slate-400 text-center">
          Afgedrukt op {formatDate(new Date())} · Demaecker &amp; Vanhaecke · USEIT2026
        </div>
      </div>
    </div>
  );
}
