import React, { useState } from 'react';

// Helper: render worker name with proper casing based on assignment half
const renderName = (workerName, half) => {
  if (!workerName) return '';
  if (half === 'pm') return workerName.toLowerCase();
  return workerName; // 'full' or 'am' = caps
};

export default function PlanningTab({ werven, workers, machines, onAssign, onRemove, onSplit }) {
  const [splitDialog, setSplitDialog] = useState(null);
  // splitDialog shape: { sourceWerfId, sourceAssignmentId, workerId, machineId }

  // A worker is "fully booked" if they have a 'full' assignment OR both 'am' and 'pm' assignments.
  const workerStatus = (workerId) => {
    let assignments = [];
    werven.forEach(w => {
      w.assignments.forEach(a => {
        if (a.workerId === workerId) assignments.push(a);
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
    const [kind, id] = data.split(':');
    onAssign(werfId, kind, id);
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button className="px-3 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">
          VANDAAG
        </button>
        <span className="text-sm font-medium text-red-700">maandag 4 mei 2026</span>
        <span className="ml-auto text-xs text-slate-500">Sleep een werknemer + machine naar een werf</span>
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

                      return (
                        <span
                          key={a.id}
                          className={`inline-flex items-center gap-1 bg-white border ${half === 'pm' ? 'border-amber-300' : 'border-slate-200'} rounded-full px-2 py-0.5 text-[10px] mr-1 mt-1`}
                        >
                          {halfLabel && (
                            <span className={`text-[8px] font-semibold px-1 rounded ${halfBadgeColor}`}>{halfLabel}</span>
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
            <div className="text-[10px] font-semibold text-blue-200 mb-2">WERKNEMERS</div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto thin-scroll">
              {workers.map(w => {
                const status = workerStatus(w.id);
                const draggable = status !== 'booked';
                const labelSuffix = status === 'am-only' ? ' (NM vrij)' : status === 'partial' ? ' (partieel)' : '';
                const opacity = status === 'booked' ? 'opacity-30' : status === 'am-only' ? 'opacity-70' : '';
                return (
                  <div
                    key={w.id}
                    draggable={draggable}
                    onDragStart={e => e.dataTransfer.setData('text/plain', `worker:${w.id}`)}
                    className={`bg-white/95 rounded px-2 py-1 text-[11px] text-slate-900 ${opacity} ${draggable ? 'cursor-grab hover:bg-white' : 'cursor-not-allowed'}`}
                    title={status === 'am-only' ? 'NM nog vrij — sleep om PM toe te wijzen' : ''}
                  >
                    {w.name}
                    {labelSuffix && <span className="text-slate-500 text-[9px] ml-1">{labelSuffix}</span>}
                    {w.type === 'subcontractor' && (
                      <span className="ml-1 text-[9px] text-amber-700 bg-amber-100 px-1 rounded">onderaannemer</span>
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
                    onDragStart={e => e.dataTransfer.setData('text/plain', `machine:${m.id}`)}
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

  const pmWerf = werven.find(w => w.id === pmWerfId);
  const finalPmMachine = sameMachine ? dialog.machineId : pmMachineId;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold">Dubbele werknemer maken</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className="uppercase font-medium">{dialog.workerName}</span> verdelen over twee werven (AM / PM)
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-3 mb-4">
          {/* AM column */}
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
            <input
              type="number" step="0.5" min="0" max="12"
              value={amHours}
              onChange={e => setAmHours(parseFloat(e.target.value) || 0)}
              className="w-20 h-7 px-2 text-xs border border-slate-300 rounded"
            />
          </div>

          {/* PM column */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-semibold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">NM</span>
              <span className="text-xs font-semibold lowercase">{dialog.workerName.toLowerCase()}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-1">Werf</div>
            <select
              value={pmWerfId}
              onChange={e => setPmWerfId(e.target.value)}
              className="w-full h-7 px-2 text-xs border border-slate-300 rounded mb-2 bg-white"
            >
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
                <select
                  value={pmMachineId}
                  onChange={e => setPmMachineId(e.target.value)}
                  className="w-full h-7 px-2 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="">— Kies machine —</option>
                  {machines.filter(m => m.id !== dialog.machineId).map(m => (
                    <option key={m.id} value={m.id}>{m.group} · {m.code}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mb-1">Uren</div>
            <input
              type="number" step="0.5" min="0" max="12"
              value={pmHours}
              onChange={e => setPmHours(parseFloat(e.target.value) || 0)}
              className="w-20 h-7 px-2 text-xs border border-slate-300 rounded"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 mb-4">
          Totaal {(amHours + pmHours).toFixed(1)} u
          {amHours + pmHours > 9 && <span className="text-amber-700 ml-2">⚠ overuren</span>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-xs px-4 py-2 rounded border border-slate-300 hover:bg-slate-50"
          >
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
