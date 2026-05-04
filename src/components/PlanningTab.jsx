import React from 'react';

export default function PlanningTab({ werven, workers, machines, onAssign, onRemove }) {
  const isWorkerAssigned = (id) => werven.some(w => w.assignments.some(a => a.workerId === id));
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
                      return (
                        <span key={a.id} className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-0.5 text-[10px] mr-1 mt-1">
                          {wk ? wk.name.split(' ')[0] : ''}
                          {wk && mc ? ' · ' : ''}
                          {mc ? mc.code : ''}
                          <button onClick={() => onRemove(a.id)} className="text-slate-400 hover:text-red-500 ml-1">×</button>
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
                const taken = isWorkerAssigned(w.id);
                return (
                  <div
                    key={w.id}
                    draggable={!taken}
                    onDragStart={e => e.dataTransfer.setData('text/plain', `worker:${w.id}`)}
                    className={`bg-white/95 rounded px-2 py-1 text-[11px] text-slate-900 ${taken ? 'opacity-30 cursor-not-allowed' : 'cursor-grab hover:bg-white'}`}
                  >
                    {w.name}
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
    </div>
  );
}
