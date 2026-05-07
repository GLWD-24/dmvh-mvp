import React, { useState } from 'react';

/**
 * WerfleiderPortal — aparte view voor werfleider.
 *
 * Toegankelijk via URL: /#werfleider
 *
 * Flow:
 *  1. Werfleider klikt op de link "Goedkeuren" in een email/SMS, opent #werfleider
 *  2. Kiest zijn naam uit de lijst → tikt PIN
 *  3. Ziet alleen werkbonnen van zijn werven die nog 'submitted' zijn
 *  4. Klikt op een bon → detail-view → keurt goed of af
 *
 * Geen toegang tot planning, facturatie, klanten, etc.
 */

import WerkbonDetailTab from './WerkbonDetailTab.jsx';

export default function WerfleiderPortal({
  werfleiders, werven, werkbonnen,
  loggedInWerfleiderId,
  onPinAttempt,
  onLogout,
  onApprove,
  onReject
}) {
  const loggedInWerfleider = loggedInWerfleiderId
    ? werfleiders.find(w => w.id === loggedInWerfleiderId)
    : null;

  // ===== LOGIN FLOW =====
  const [authScreen, setAuthScreen] = useState('pickWerfleider');
  const [selectedWerfleiderId, setSelectedWerfleiderId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [openWerkbonId, setOpenWerkbonId] = useState(null);

  const selectedWerfleider = selectedWerfleiderId
    ? werfleiders.find(w => w.id === selectedWerfleiderId)
    : null;

  const handlePinDigit = (digit) => {
    if (pinInput.length >= 6) return;
    setPinError('');
    const next = pinInput + digit;
    setPinInput(next);
    if (next.length === 6) tryPin(next);
  };
  const handlePinBackspace = () => {
    setPinError('');
    setPinInput(p => p.slice(0, -1));
  };
  const tryPin = (pin) => {
    if (!selectedWerfleider) return;
    const result = onPinAttempt(selectedWerfleider.id, pin);
    if (result.ok) {
      setPinInput('');
      setPinError('');
    } else if (result.blocked) {
      setAuthScreen('blocked');
      setPinInput('');
    } else {
      setPinError(`Verkeerde PIN — ${result.attemptsLeft} pogingen over`);
      setPinInput('');
    }
  };

  // ===== LOGGED IN: lijst werkbonnen voor MIJN werven =====
  const myWerfIds = werven
    .filter(w => w.werfleiderId === loggedInWerfleiderId)
    .map(w => w.id);
  const myWerfNames = werven
    .filter(w => w.werfleiderId === loggedInWerfleiderId)
    .map(w => w.omschrijving || w.address);

  // Match op werf-naam (omschrijving) want werkbonnen hebben geen werfId direct
  const myWerkbonnen = werkbonnen.filter(wb =>
    myWerfNames.some(name => wb.werf === name)
  );
  const pendingBonnen = myWerkbonnen.filter(wb => wb.status === 'submitted');
  const handledBonnen = myWerkbonnen.filter(wb => wb.status !== 'submitted');

  // Detail open?
  const openWerkbon = openWerkbonId ? werkbonnen.find(w => w.id === openWerkbonId) : null;

  if (openWerkbon) {
    return (
      <div className="min-h-screen bg-slate-100">
        <TopBar werfleider={loggedInWerfleider} onLogout={onLogout} />
        <WerkbonDetailTab
          werkbonId={openWerkbon.id}
          werkbonnen={werkbonnen}
          onApprove={(id) => { onApprove(id, 'approve'); setOpenWerkbonId(null); }}
          onReject={(id) => { onApprove(id, 'reject'); setOpenWerkbonId(null); }}
          onBack={() => setOpenWerkbonId(null)}
          mode="werfleider"
        />
      </div>
    );
  }

  // ===== INGELOGDE WERFLEIDER WERKBONNEN-LIJST =====
  if (loggedInWerfleider) {
    return (
      <div className="min-h-screen bg-slate-100">
        <TopBar werfleider={loggedInWerfleider} onLogout={onLogout} />

        <div className="max-w-3xl mx-auto p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Welkom, {loggedInWerfleider.name}</h2>
          <p className="text-sm text-slate-500 mb-5">
            Werkbonnen voor {myWerfNames.length} werf{myWerfNames.length === 1 ? '' : 'ven'} van {loggedInWerfleider.name}
          </p>

          {/* Pending sectie */}
          <div className="mb-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-amber-700 mb-2">
              Goed te keuren ({pendingBonnen.length})
            </h3>
            {pendingBonnen.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-sm text-slate-500">
                Geen werkbonnen wachten op goedkeuring.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingBonnen.map(wb => (
                  <button
                    key={wb.id}
                    onClick={() => setOpenWerkbonId(wb.id)}
                    className="w-full text-left bg-white border border-amber-200 rounded-lg p-3 hover:border-amber-400 hover:bg-amber-50/30 transition"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-slate-900">Werkbon #{wb.nr}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Wacht op goedkeuring</span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div><span className="text-slate-400">Werf:</span> {wb.werf}</div>
                      <div><span className="text-slate-400">Bestuurder:</span> {wb.worker} op {wb.machine}</div>
                      <div><span className="text-slate-400">Datum:</span> {wb.date} · {wb.bon ?? wb.hours} u</div>
                    </div>
                    <div className="text-[11px] text-blue-700 mt-2 font-medium">Open bon →</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Verwerkte sectie */}
          {handledBonnen.length > 0 && (
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Verwerkt ({handledBonnen.length})
              </h3>
              <div className="flex flex-col gap-1">
                {handledBonnen.slice(0, 10).map(wb => (
                  <button
                    key={wb.id}
                    onClick={() => setOpenWerkbonId(wb.id)}
                    className="w-full text-left bg-white border border-slate-200 rounded-md p-2 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between text-[12px]">
                      <div>
                        <span className="font-medium text-slate-900">#{wb.nr}</span>
                        <span className="text-slate-500"> · {wb.werf} · {wb.worker} · {wb.date}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        wb.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        wb.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {wb.status === 'approved' ? 'Goedgekeurd' :
                         wb.status === 'rejected' ? 'Afgewezen' : wb.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== LOGIN SCHERM =====
  if (authScreen === 'pickWerfleider') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded bg-blue-900 text-white flex items-center justify-center text-sm font-bold">DV</div>
            <div className="text-slate-900">
              <div className="text-sm font-semibold leading-tight">DEMAECKER &amp;</div>
              <div className="text-sm font-semibold leading-tight">VAN HAECKE</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h1 className="text-lg font-semibold text-slate-900 mb-1">Werfleider portaal</h1>
            <p className="text-sm text-slate-500 mb-4">Wie ben jij?</p>

            <div className="flex flex-col gap-1.5">
              {werfleiders.filter(w => w.pin).map(w => (
                <button
                  key={w.id}
                  onClick={() => {
                    if (w.pinBlocked) {
                      setSelectedWerfleiderId(w.id);
                      setAuthScreen('blocked');
                    } else {
                      setSelectedWerfleiderId(w.id);
                      setAuthScreen('enterPin');
                    }
                  }}
                  className={`text-left px-3 py-2 rounded-md border text-sm transition ${
                    w.pinBlocked
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-900'
                  }`}
                >
                  <div className="font-medium">{w.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {w.pinBlocked ? '🔒 Geblokkeerd — contacteer DMVH' : w.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center text-[11px] text-slate-500">
            Geen werfleider? <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.location.reload(); }} className="text-blue-700 hover:text-blue-900">Naar kantoor-login</a>
          </div>
        </div>
      </div>
    );
  }

  if (authScreen === 'enterPin' && selectedWerfleider) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <button
              onClick={() => { setAuthScreen('pickWerfleider'); setSelectedWerfleiderId(null); setPinInput(''); setPinError(''); }}
              className="text-[12px] text-slate-500 hover:text-slate-700 mb-3"
            >
              ← Andere werfleider
            </button>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Aanmelden als</div>
            <div className="text-base font-semibold mb-4">{selectedWerfleider.name}</div>

            <div className="text-[12px] text-slate-600 mb-2">Geef je 6-cijferige PIN-code in</div>

            <div className="flex justify-center gap-2 mb-3">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full border-2 ${
                    pinInput.length > i ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5 mb-3 text-center">
                {pinError}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                <button
                  key={d}
                  onClick={() => handlePinDigit(String(d))}
                  className="aspect-square rounded-md bg-white border border-slate-200 text-xl font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100"
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                onClick={() => handlePinDigit('0')}
                className="aspect-square rounded-md bg-white border border-slate-200 text-xl font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100"
              >
                0
              </button>
              <button
                onClick={handlePinBackspace}
                className="aspect-square rounded-md bg-slate-100 border border-slate-200 text-lg text-slate-600 hover:bg-slate-200"
              >
                ⌫
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center mt-3">
              Demo-tip: PIN = <span className="font-mono">{selectedWerfleider.pin}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authScreen === 'blocked') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3 text-xl">🔒</div>
          <div className="text-base font-semibold mb-1">Account geblokkeerd</div>
          <div className="text-[12px] text-slate-600 mb-4">
            Te veel verkeerde pogingen.<br />Contacteer DMVH om je PIN te resetten.
          </div>
          <button
            onClick={() => { setAuthScreen('pickWerfleider'); setSelectedWerfleiderId(null); }}
            className="text-[12px] text-blue-700 hover:text-blue-900"
          >
            ← Andere werfleider
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function TopBar({ werfleider, onLogout }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-900 text-white flex items-center justify-center text-[10px] font-bold">DV</div>
          <span className="text-sm font-semibold text-slate-900">DMVH · Werfleider portaal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-700">{werfleider?.name}</span>
          <button
            onClick={onLogout}
            className="text-[11px] text-slate-500 hover:text-slate-800"
          >
            Afmelden
          </button>
        </div>
      </div>
    </div>
  );
}
