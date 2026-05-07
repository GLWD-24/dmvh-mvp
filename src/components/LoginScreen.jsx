import React, { useState } from 'react';

/**
 * LoginScreen — kantoor login (desktop).
 *
 * MVP-prototype: hardcoded credentials voor demo.
 * Bij echte deploy: vervangen door supabase.auth.signInWithPassword(...)
 *
 * Demo-accounts:
 *   gilles@dmvh.be / dmvh2026
 *   planner@dmvh.be / dmvh2026
 */

const DEMO_ACCOUNTS = [
  { email: 'gilles@dmvh.be', password: 'dmvh2026', name: 'Gilles De Meester', role: 'admin' },
  { email: 'planner@dmvh.be', password: 'dmvh2026', name: 'Planner DMVH', role: 'admin' }
];

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const account = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
    );
    if (!account) {
      setError('Ongeldige email of wachtwoord');
      return;
    }
    onLogin({
      role: account.role,
      name: account.name,
      email: account.email,
      loginAt: Date.now()
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded bg-blue-900 text-white flex items-center justify-center text-sm font-bold">DV</div>
          <div className="text-slate-900">
            <div className="text-sm font-semibold leading-tight">DEMAECKER &amp;</div>
            <div className="text-sm font-semibold leading-tight">VAN HAECKE</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Aanmelden</h1>
          <p className="text-sm text-slate-500 mb-6">Planning &amp; facturatie portaal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="naam@dmvh.be"
                autoFocus
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 rounded-md text-sm"
            >
              Aanmelden
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-slate-500 hover:text-slate-700"
            >
              Demo-accounts {showHint ? '▴' : '▾'}
            </button>
            <a href="#" onClick={e => { e.preventDefault(); alert('Bij echte deploy: email-link voor wachtwoord reset.\nNu in MVP: contacteer Gilles.'); }} className="text-blue-700 hover:text-blue-900">
              Wachtwoord vergeten?
            </a>
          </div>

          {showHint && (
            <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded px-3 py-2 space-y-1">
              <div className="font-medium text-slate-700 mb-1">Voor demo, gebruik:</div>
              {DEMO_ACCOUNTS.map(a => (
                <div key={a.email} className="font-mono">
                  {a.email} <span className="text-slate-400">·</span> {a.password}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-500 space-y-1">
          <div>Werknemer? Open de DMVH-app op je telefoon.</div>
          <div>
            Werfleider? <a href="#werfleider" className="text-blue-700 hover:text-blue-900 font-medium">Open werfleider-portaal</a>
          </div>
        </div>
      </div>
    </div>
  );
}
