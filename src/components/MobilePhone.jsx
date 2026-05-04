import React, { useRef, useEffect, useState } from 'react';

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

  const start = (e) => { e.preventDefault(); drawingRef.current = true; lastPosRef.current = getPos(e); };
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
  const end = () => { if (drawingRef.current) { drawingRef.current = false; onSign(); } };

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

// Format milliseconds → HH:MM (geen seconden, scheelt re-renders)
const fmtTime = (ms) => {
  const total = Math.max(0, Math.floor(ms / 60000)); // total minutes
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  return `${h}:${m}`;
};

// Format Unix timestamp → HH:MM (lokale tijd) voor tonen "gestart om 07:32"
const fmtClock = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Decimal hours from ms (e.g. 7,53) — what gets stored as werkbon.hours
const hoursFromMs = (ms) => Math.round((ms / 3600000) * 100) / 100;

export default function MobilePhone({
  state, werven, workers, machines,
  onClockIn, onSubmitWerkbon, onReset
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
          Inklokken &amp; werkbon openen
        </button>
      </div>
    );
  };

  const renderWerkbon = () => <WerkbonScreen wb={state.currentWerkbon} onUpdate={onSubmitWerkbon} />;

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
      <div className="w-[260px] h-[560px] bg-slate-900 rounded-[28px] p-2 shadow-lg">
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

function WerkbonScreen({ wb, onUpdate }) {
  // Werkbon state machine: idle | running | paused | stopped
  const phase = wb?.phase || 'idle';

  // Battery-friendly UI ticker:
  // - Updates only every 30 seconds (not every second)
  // - Pauses when tab/screen is hidden (page visibility API)
  // - Triggers a single re-render on visibility change to catch up
  // - State (start/stop times) is stored as timestamps, never as accumulating elapsed values,
  //   so the clock recovers correctly across reloads, sleep, or backgrounding.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (phase !== 'running') return;

    let intervalId = null;
    const startTicker = () => {
      if (intervalId) return;
      intervalId = setInterval(() => setTick(t => t + 1), 30000); // 30s
    };
    const stopTicker = () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setTick(t => t + 1); // catch-up render
        startTicker();
      } else {
        stopTicker(); // suspend ticker when phone in pocket / app backgrounded
      }
    };

    if (document.visibilityState === 'visible') startTicker();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopTicker();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [phase]);

  if (!wb) return null;

  // Compute elapsed work time (excluding pauses)
  const computeElapsed = () => {
    const segments = wb.segments || [];
    let total = 0;
    segments.forEach(seg => {
      if (seg.end) total += seg.end - seg.start;
      else if (phase === 'running') total += Date.now() - seg.start;
    });
    return total;
  };
  const elapsedMs = computeElapsed();

  // Compute total pause time
  const pauseMs = (() => {
    const pauses = wb.pauses || [];
    let total = 0;
    pauses.forEach(p => {
      if (p.end) total += p.end - p.start;
      else if (phase === 'paused') total += Date.now() - p.start;
    });
    return total;
  })();

  const handleStart = () => {
    const now = Date.now();
    onUpdate({
      ...wb,
      phase: 'running',
      startTime: now,
      segments: [{ start: now, end: null }],
      pauses: []
    }, 'update');
  };

  const handlePause = () => {
    const now = Date.now();
    const segments = (wb.segments || []).map(s =>
      s.end === null ? { ...s, end: now } : s
    );
    const pauses = [...(wb.pauses || []), { start: now, end: null }];
    onUpdate({ ...wb, phase: 'paused', segments, pauses }, 'update');
  };

  const handleResume = () => {
    const now = Date.now();
    const pauses = (wb.pauses || []).map(p =>
      p.end === null ? { ...p, end: now } : p
    );
    const segments = [...(wb.segments || []), { start: now, end: null }];
    onUpdate({ ...wb, phase: 'running', segments, pauses }, 'update');
  };

  const handleStop = () => {
    const now = Date.now();
    const segments = (wb.segments || []).map(s =>
      s.end === null ? { ...s, end: now } : s
    );
    const pauses = (wb.pauses || []).map(p =>
      p.end === null ? { ...p, end: now } : p
    );
    // Recompute final elapsed time from completed segments
    const finalMs = segments.reduce((sum, s) => sum + (s.end - s.start), 0);
    onUpdate({
      ...wb,
      phase: 'stopped',
      segments,
      pauses,
      hours: hoursFromMs(finalMs),
      stopTime: now
    }, 'update');
  };

  const handleSubmit = () => {
    onUpdate(wb, 'submit');
  };

  return (
    <div className="p-3">
      <div className="text-xs font-semibold mb-2">Werkbon</div>
      <div className="text-[10px] bg-slate-100 rounded-lg p-2 mb-3 leading-relaxed">
        <div><span className="text-slate-500">Klant:</span> {wb.klant}</div>
        <div><span className="text-slate-500">Werf:</span> {wb.werf}</div>
        <div><span className="text-slate-500">Machine:</span> {wb.machine}</div>
        <div><span className="text-slate-500">Datum:</span> 04/05/2026</div>
      </div>

      {/* Live timer display */}
      <div className={`rounded-lg p-3 mb-3 text-center ${
        phase === 'running' ? 'bg-emerald-50 border border-emerald-200' :
        phase === 'paused' ? 'bg-amber-50 border border-amber-200' :
        phase === 'stopped' ? 'bg-slate-100 border border-slate-300' :
        'bg-slate-50 border border-slate-200'
      }`}>
        <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">
          {phase === 'idle' && 'Klaar om te starten'}
          {phase === 'running' && <span className="text-emerald-700">● Bezig</span>}
          {phase === 'paused' && <span className="text-amber-700">⏸ Gepauzeerd</span>}
          {phase === 'stopped' && 'Gestopt — bevestiging vereist'}
        </div>
        <div className={`font-mono text-3xl font-semibold tabular-nums tracking-tight ${
          phase === 'running' ? 'text-emerald-800' :
          phase === 'paused' ? 'text-amber-800' :
          'text-slate-800'
        }`}>
          {fmtTime(elapsedMs)}
        </div>
        {wb.startTime && phase !== 'idle' && (
          <div className="text-[9px] text-slate-500 mt-1">
            Gestart om {fmtClock(wb.startTime)}
            {phase === 'stopped' && wb.stopTime && <> · gestopt om {fmtClock(wb.stopTime)}</>}
          </div>
        )}
        {pauseMs > 0 && (
          <div className="text-[9px] text-slate-500 mt-0.5">
            Totaal pauze: {fmtTime(pauseMs)}
          </div>
        )}
      </div>

      {/* Buttons by phase */}
      {phase === 'idle' && (
        <button
          onClick={handleStart}
          className="w-full py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center gap-2"
        >
          ▶ START
        </button>
      )}

      {phase === 'running' && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={handlePause}
            className="py-3 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 active:bg-amber-700 flex items-center justify-center gap-1"
          >
            ⏸ PAUZE
          </button>
          <button
            onClick={handleStop}
            className="py-3 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-1"
          >
            ■ STOP
          </button>
        </div>
      )}

      {/* Demo helper: visible only while running, fast-forwards the clock by 1h */}
      {(phase === 'running' || phase === 'paused') && (
        <button
          onClick={() => {
            const segments = (wb.segments || []).map((s, i, arr) => {
              if (i === arr.length - 1) {
                // shift the start time back by 1h to simulate elapsed time
                return { ...s, start: s.start - 3600000 };
              }
              return s;
            });
            onUpdate({ ...wb, segments }, 'update');
          }}
          className="w-full py-1.5 rounded-md bg-slate-100 text-slate-500 text-[10px] hover:bg-slate-200 mb-2 border border-dashed border-slate-300"
          title="Demo: voeg 1 uur toe aan de tijdregistratie"
        >
          🚀 Demo +1u (alleen voor prototype)
        </button>
      )}

      {phase === 'paused' && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={handleResume}
            className="py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center gap-1"
          >
            ▶ HERVAT
          </button>
          <button
            onClick={handleStop}
            className="py-3 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-1"
          >
            ■ STOP
          </button>
        </div>
      )}

      {/* Stopped → confirmation summary + signatures + submit */}
      {phase === 'stopped' && (
        <div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Samenvatting</div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-600">Gestart</span>
              <span className="font-mono">{fmtClock(wb.startTime)}</span>
            </div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-600">Gestopt</span>
              <span className="font-mono">{fmtClock(wb.stopTime)}</span>
            </div>
            {pauseMs > 0 && (
              <div className="flex justify-between text-[11px] mb-0.5 text-slate-500">
                <span>Totaal pauze</span>
                <span className="font-mono">{fmtTime(pauseMs)}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] pt-1.5 mt-1 border-t border-slate-200">
              <span className="text-slate-700 font-medium">Netto werktijd</span>
              <span className="font-mono font-semibold">{fmtTime(elapsedMs)} ({wb.hours?.toFixed(2)} u)</span>
            </div>
          </div>

          <label className="text-[10px] text-slate-500">Opmerkingen</label>
          <textarea
            rows={2}
            value={wb.remarks || ''}
            onChange={e => onUpdate({ ...wb, remarks: e.target.value }, 'update')}
            placeholder="Optioneel — bv. extra werken..."
            className="w-full text-xs p-1.5 border border-slate-300 rounded mb-3"
          />

          <div className="text-[10px] font-semibold text-slate-700 mb-1">Handtekening &amp; afsluiten</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <SignaturePad label="Bestuurder" signed={wb.opSign} onSign={() => onUpdate({ ...wb, opSign: true }, 'update')} />
            <SignaturePad label="Klant" signed={wb.clientSign} onSign={() => onUpdate({ ...wb, clientSign: true }, 'update')} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!wb.opSign || !wb.clientSign}
            className={`w-full py-2.5 rounded-lg text-[11px] font-semibold ${
              wb.opSign && wb.clientSign
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Werkbon definitief indienen
          </button>
          {(!wb.opSign || !wb.clientSign) && (
            <div className="text-[9px] text-slate-500 text-center mt-1.5">
              Beide handtekeningen vereist
            </div>
          )}
        </div>
      )}
    </div>
  );
}
