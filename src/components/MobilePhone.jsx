import React, { useRef, useEffect, useState } from 'react';

/**
 * Werknemer-app — vereenvoudigde flow voor einde-van-de-dag invullen.
 *
 * Schermen:
 *  - 'today'      : tegels van werven waar EECKLOO FREDERIK vandaag op staat
 *  - 'werkbon'    : bon-formulier voor één gekozen werf
 *  - 'submitted'  : bevestiging na indienen
 *
 * Filosofie: geen knoppen tijdens de dag (de werknemer vergeet ze toch). De bon wordt
 * 's avonds ingevuld met start-uur, eind-uur, pauzeminuten, opmerking, en handtekeningen.
 * Werfleider-niet-aanwezig disabled de werfleider-handtekening.
 */

const HARDCODED_WORKER_NAME = 'EECKLOO FREDERIK';

// HH:MM string parser (geeft minuten-since-midnight terug, of null)
const parseHM = (s) => {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
};

// Decimaal uren formatteren (vb. 7.53 u)
const fmtHours = (decHours) => {
  if (decHours === null || decHours === undefined || isNaN(decHours)) return '—';
  return `${decHours.toFixed(2).replace('.', ',')} u`;
};

function SignaturePad({ label, signed, onSign, disabled = false }) {
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
  }, [disabled]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const start = (e) => {
    if (disabled) return;
    e.preventDefault();
    drawingRef.current = true;
    lastPosRef.current = getPos(e);
  };
  const move = (e) => {
    if (!drawingRef.current || disabled) return;
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
    if (drawingRef.current && !disabled) {
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
        className={`w-full h-14 rounded border ${
          disabled ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
          : signed ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-white'
        }`}
      />
    </div>
  );
}

export default function MobilePhone({
  state, werven, workers, machines, artikelen = [],
  onClockIn, onSubmitWerkbon, onReset
}) {
  // Vind alle werven van vandaag waar de hardcoded werknemer op staat
  const myAssignments = [];
  werven.forEach(w => {
    (w.assignments || []).forEach(a => {
      const wk = workers.find(x => x.id === a.workerId);
      if (wk && wk.name === HARDCODED_WORKER_NAME) {
        myAssignments.push({ werf: w, assignment: a });
      }
    });
  });

  const renderToday = () => {
    if (myAssignments.length === 0) {
      return (
        <div className="text-center px-3 py-12 text-[11px] text-slate-500">
          Geen toewijzing voor vandaag.<br /><br />
          Wacht op planning vanuit het kantoor.
        </div>
      );
    }

    return (
      <div className="p-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Vandaag · maandag 4 mei</div>
        <div className="text-[11px] text-slate-600 mb-3">
          {myAssignments.length === 1
            ? '1 werf — vul je bon in'
            : `${myAssignments.length} werven — kies welke je wil afsluiten`}
        </div>
        <div className="flex flex-col gap-2">
          {myAssignments.map(({ werf, assignment }) => {
            const machine = machines.find(m => m.id === assignment.machineId);
            return (
              <button
                key={`${werf.id}-${assignment.id}`}
                onClick={() => onClockIn(werf, machine, assignment)}
                className="w-full text-left bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50/50 active:bg-blue-100 transition"
              >
                <div className="text-[12px] font-semibold text-slate-900">{werf.klant}</div>
                <div className="text-[10px] text-slate-500 mb-1.5">{werf.omschrijving || werf.address}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {machine && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {machine.color && <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: machine.color }} />}
                      {machine.code}
                    </span>
                  )}
                  {!machine && (
                    <span className="text-[10px] text-slate-400 italic">geen machine</span>
                  )}
                </div>
                <div className="text-[10px] text-blue-700 mt-2 font-medium">Bon invullen →</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWerkbon = () => <WerkbonForm wb={state.currentWerkbon} onUpdate={onSubmitWerkbon} />;

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

/**
 * WerkbonForm — einde-van-de-dag formulier.
 * Velden: start-uur, eind-uur, pauze (minuten), opmerking, werfleider afwezig, 2 handtekeningen.
 * Berekent automatisch totaal-uren = (eind - start) - pauze.
 */
function WerkbonForm({ wb, onUpdate }) {
  if (!wb) return null;

  const startMin = parseHM(wb.startStr);
  const endMin = parseHM(wb.endStr);
  const pauseMin = parseInt(wb.pauseMin || '0', 10) || 0;

  // Compute totaal in minuten en in decimale uren
  let totalMin = null;
  let totalErr = null;
  if (startMin !== null && endMin !== null) {
    if (endMin <= startMin) {
      totalErr = 'Eind-uur moet na start-uur';
    } else {
      const grossMin = endMin - startMin;
      if (pauseMin >= grossMin) {
        totalErr = 'Pauze is langer dan werktijd';
      } else {
        totalMin = grossMin - pauseMin;
      }
    }
  }
  const totalHours = totalMin !== null ? Math.round((totalMin / 60) * 100) / 100 : null;

  const canSubmit =
    totalHours !== null &&
    totalHours > 0 &&
    !!wb.opSign &&
    (wb.werfleiderAfwezig || !!wb.werfleiderSign);

  const handleField = (patch) => {
    onUpdate({ ...wb, ...patch }, 'update');
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onUpdate({ ...wb, hours: totalHours }, 'submit');
  };

  return (
    <div className="p-3">
      <div className="text-xs font-semibold mb-2">Werkbon</div>

      {/* Werf-info */}
      <div className="text-[10px] bg-slate-100 rounded-lg p-2 mb-3 leading-relaxed">
        <div><span className="text-slate-500">Klant:</span> <span className="font-medium">{wb.klant}</span></div>
        <div><span className="text-slate-500">Werf:</span> {wb.werf}</div>
        {wb.machine && wb.machine !== '—' && (
          <div><span className="text-slate-500">Machine:</span> {wb.machine}</div>
        )}
        <div><span className="text-slate-500">Datum:</span> 04/05/2026</div>
      </div>

      {/* Tijden */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[9px] text-slate-500 uppercase tracking-wider">Start uur</label>
          <input
            type="time"
            value={wb.startStr || ''}
            onChange={e => handleField({ startStr: e.target.value })}
            className="w-full text-sm p-1.5 border border-slate-300 rounded mt-0.5"
          />
        </div>
        <div>
          <label className="text-[9px] text-slate-500 uppercase tracking-wider">Eind uur</label>
          <input
            type="time"
            value={wb.endStr || ''}
            onChange={e => handleField({ endStr: e.target.value })}
            className="w-full text-sm p-1.5 border border-slate-300 rounded mt-0.5"
          />
        </div>
      </div>

      {/* Pauze */}
      <div className="mb-2">
        <label className="text-[9px] text-slate-500 uppercase tracking-wider">Pauze (minuten)</label>
        <input
          type="number"
          min="0"
          step="5"
          value={wb.pauseMin || ''}
          onChange={e => handleField({ pauseMin: e.target.value })}
          placeholder="0"
          className="w-full text-sm p-1.5 border border-slate-300 rounded mt-0.5"
        />
      </div>

      {/* Totaal preview */}
      <div className={`rounded-lg p-2.5 mb-3 text-center border ${
        totalErr ? 'bg-red-50 border-red-200' :
        totalHours !== null ? 'bg-emerald-50 border-emerald-200' :
        'bg-slate-50 border-slate-200'
      }`}>
        <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">
          {totalErr ? <span className="text-red-700">Fout</span> : 'Totaal werktijd'}
        </div>
        <div className={`text-2xl font-mono font-semibold tabular-nums ${
          totalErr ? 'text-red-700' :
          totalHours !== null ? 'text-emerald-800' : 'text-slate-400'
        }`}>
          {totalErr ? '—' : totalHours !== null ? fmtHours(totalHours) : '—'}
        </div>
        {totalErr && <div className="text-[10px] text-red-700 mt-1">{totalErr}</div>}
      </div>

      {/* Opmerking */}
      <label className="text-[9px] text-slate-500 uppercase tracking-wider">Opmerking</label>
      <textarea
        rows={2}
        value={wb.remarks || ''}
        onChange={e => handleField({ remarks: e.target.value })}
        placeholder="Optioneel — bv. extra werken, materiaal achtergelaten..."
        className="w-full text-xs p-1.5 border border-slate-300 rounded mt-0.5 mb-3"
      />

      {/* Werfleider afwezig */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!wb.werfleiderAfwezig}
          onChange={e => handleField({
            werfleiderAfwezig: e.target.checked,
            // Als werfleider afwezig wordt aangevinkt, wis zijn handtekening
            werfleiderSign: e.target.checked ? false : wb.werfleiderSign
          })}
          className="w-4 h-4 rounded border-slate-300"
        />
        <span className="text-[11px] text-slate-700">Werfleider niet aanwezig</span>
      </label>

      {/* Handtekeningen */}
      <div className="text-[10px] font-semibold text-slate-700 mb-1">Handtekening</div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <SignaturePad
          label="Bestuurder"
          signed={wb.opSign}
          onSign={() => handleField({ opSign: true })}
        />
        <SignaturePad
          label={wb.werfleiderAfwezig ? 'Werfleider (afwezig)' : 'Werfleider'}
          signed={wb.werfleiderSign}
          onSign={() => handleField({ werfleiderSign: true })}
          disabled={!!wb.werfleiderAfwezig}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-2.5 rounded-lg text-[11px] font-semibold ${
          canSubmit
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        Werkbon definitief indienen
      </button>
      {!canSubmit && (
        <div className="text-[9px] text-slate-500 text-center mt-1.5">
          {totalHours === null ? 'Vul start- en eind-uur in' :
           totalErr ? 'Corrigeer de tijden' :
           !wb.opSign ? 'Bestuurder moet tekenen' :
           !wb.werfleiderAfwezig && !wb.werfleiderSign ? 'Werfleider moet tekenen of vink "afwezig" aan' :
           ''}
        </div>
      )}
    </div>
  );
}
