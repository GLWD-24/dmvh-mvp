import React, { useRef, useEffect } from 'react';

function SignaturePad({ label, signed, onSign }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPosRef.current = getPos(e);
  };
  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };
  const end = () => {
    if (drawingRef.current) {
      drawingRef.current = false;
      onSign();
    }
  };

  return (
    <div>
      <div className="text-[9px] text-slate-500 mb-1">{label}</div>
      <canvas
        ref={canvasRef}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        className={`w-full h-12 rounded border ${signed ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-white'}`}
      />
    </div>
  );
}

export default function MobilePhone({
  state,
  werven,
  workers,
  machines,
  onClockIn,
  onSubmitWerkbon,
  onReset
}) {
  const myAssignment = werven.find(w => w.assignments.some(a => {
    const wk = workers.find(x => x.id === a.workerId);
    return wk && wk.name === 'EECKLOO FREDERIK';
  }));

  const renderToday = () => {
    if (!myAssignment) {
      return (
        <div className="text-center px-3 py-12 text-[11px] text-slate-500">
          Geen toewijzing voor vandaag.<br /><br />
          Wacht op planning vanuit het kantoor.
        </div>
      );
    }
    const a = myAssignment.assignments.find(x => workers.find(w => w.id === x.workerId)?.name === 'EECKLOO FREDERIK');
    const machine = machines.find(m => m.id === a.machineId);

    return (
      <div className="p-3">
        <div className="text-[10px] text-slate-500">Vandaag · maandag 4 mei</div>
        <div className="text-sm font-semibold mt-1">{myAssignment.klant}</div>
        <div className="text-[11px] text-slate-500 mb-3">{myAssignment.address}</div>
        <div className="bg-slate-100 rounded-lg p-2 mb-2">
          <div className="text-[10px] text-slate-500">Machine</div>
          <div className="text-xs font-semibold">{machine ? machine.code : '—'}</div>
        </div>
        <button className="w-full py-2 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium mb-2 hover:bg-slate-200">
          📍 Navigeer
        </button>
        <button
          onClick={() => onClockIn(myAssignment, machine)}
          className="w-full py-2 rounded-lg bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700"
        >
          Inklokken &amp; werkbon starten
        </button>
      </div>
    );
  };

  const renderWerkbon = () => {
    const wb = state.currentWerkbon;
    if (!wb) return null;
    return (
      <div className="p-3">
        <div className="text-xs font-semibold mb-2">Werkbon</div>
        <div className="text-[10px] bg-slate-100 rounded-lg p-2 mb-2 leading-relaxed">
          <div><span className="text-slate-500">Klant:</span> {wb.klant}</div>
          <div><span className="text-slate-500">Werf:</span> {wb.werf}</div>
          <div><span className="text-slate-500">Machine:</span> {wb.machine}</div>
          <div><span className="text-slate-500">Datum:</span> 04/05/2026</div>
        </div>
        <label className="text-[10px] text-slate-500">Totaal uren</label>
        <input
          type="number" step="0.5" value={wb.hours}
          onChange={e => onSubmitWerkbon({ ...wb, hours: parseFloat(e.target.value) || 0 }, 'update')}
          className="w-full h-7 text-xs px-2 border border-slate-300 rounded mb-2"
        />
        <label className="text-[10px] text-slate-500">Opmerkingen</label>
        <textarea
          rows={2} value={wb.remarks}
          onChange={e => onSubmitWerkbon({ ...wb, remarks: e.target.value }, 'update')}
          className="w-full text-xs p-1.5 border border-slate-300 rounded mb-2"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <SignaturePad label="Bestuurder" signed={wb.opSign} onSign={() => onSubmitWerkbon({ ...wb, opSign: true }, 'update')} />
          <SignaturePad label="Klant" signed={wb.clientSign} onSign={() => onSubmitWerkbon({ ...wb, clientSign: true }, 'update')} />
        </div>
        <button
          onClick={() => onSubmitWerkbon(wb, 'submit')}
          disabled={!wb.opSign || !wb.clientSign}
          className={`w-full py-2 rounded-lg text-[11px] font-medium ${wb.opSign && wb.clientSign ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          Indienen
        </button>
      </div>
    );
  };

  const renderSubmitted = () => (
    <div className="text-center px-3 py-8">
      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 text-xl">✓</div>
      <div className="text-xs font-semibold">Werkbon ingediend</div>
      <div className="text-[10px] text-slate-500 mt-1">Wacht op goedkeuring planner</div>
      <button onClick={onReset} className="mt-4 w-full py-2 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium hover:bg-slate-200">
        Terug naar vandaag
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Operator app — EECKLOO Frederik</div>
      <div className="w-[260px] h-[520px] bg-slate-900 rounded-[28px] p-2 shadow-lg">
        <div className="bg-white w-full h-full rounded-[22px] overflow-hidden flex flex-col">
          <div className="h-6 flex items-center justify-center text-[10px] text-slate-400 border-b border-slate-100">9:41</div>
          <div className="flex-1 overflow-y-auto">
            {state.screen === 'today' && renderToday()}
            {state.screen === 'werkbon' && renderWerkbon()}
            {state.screen === 'submitted' && renderSubmitted()}
          </div>
        </div>
      </div>
      <button onClick={onReset} className="text-[11px] text-slate-500 hover:text-slate-800 underline">Reset mobile</button>
    </div>
  );
}
