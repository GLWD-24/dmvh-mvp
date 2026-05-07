import React, { useState } from 'react';

/**
 * AppShell — productie-app layout met linker sidebar navigatie.
 * Inspiratie: Linear, Notion, Plan-grid. Refined utilitair voor B2B KMO bouwbedrijf.
 *
 * Structure:
 *   ┌────────┬──────────────────────────────┐
 *   │        │                              │
 *   │ Logo   │                              │
 *   │ ──────│   page content                │
 *   │ Werk   │                              │
 *   │  ◯ Dashboard                          │
 *   │  ◯ Planning                           │
 *   │  ◯ Uurrooster                         │
 *   │  ◯ Werkbonnen                         │
 *   │ Master Data                           │
 *   │  ◯ Klanten                            │
 *   │  ◯ Werven                             │
 *   │  ◯ Werknemers                         │
 *   │  ◯ Machines                           │
 *   │  ◯ Diensten                           │
 *   │ Financieel                            │
 *   │  ◯ Facturatie                         │
 *   │ ──────│                               │
 *   │ Inst.  │                              │
 *   │  ◯ Bedrijfsgegevens                   │
 *   │ [Demo▾]│                              │
 *   └────────┴──────────────────────────────┘
 */

const NAV_SECTIONS = [
  {
    label: 'Werk',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'planning', label: 'Planning', icon: 'planning' },
      { id: 'uurrooster', label: 'Uurrooster', icon: 'uurrooster' },
      { id: 'inbox', label: 'Werkbonnen', icon: 'inbox' }
    ]
  },
  {
    label: 'Master data',
    items: [
      { id: 'klanten', label: 'Klanten', icon: 'klanten' },
      { id: 'werven', label: 'Werven', icon: 'werven' },
      { id: 'werknemers', label: 'Werknemers', icon: 'werknemers' },
      { id: 'machines', label: 'Machines', icon: 'machines' },
      { id: 'artikelen', label: 'Artikelen', icon: 'artikelen' },
      { id: 'diensten', label: 'Diensten', icon: 'diensten' }
    ]
  },
  {
    label: 'Financieel',
    items: [
      { id: 'invoice', label: 'Facturatie', icon: 'invoice' }
    ]
  },
  {
    label: 'Instellingen',
    items: [
      { id: 'bedrijf', label: 'Bedrijfsgegevens', icon: 'bedrijf' }
    ]
  }
];

// Minimal hand-crafted icons in SVG — refined utilitair, geen flashy emojis
function NavIcon({ name, active }) {
  const stroke = active ? '#1E40AF' : '#64748B';
  const sw = 1.6;
  const props = { width: 16, height: 16, viewBox: '0 0 20 20', fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'dashboard': return <svg {...props}><rect x="3" y="3" width="6" height="6"/><rect x="11" y="3" width="6" height="4"/><rect x="11" y="9" width="6" height="8"/><rect x="3" y="11" width="6" height="6"/></svg>;
    case 'planning': return <svg {...props}><rect x="3" y="4" width="14" height="13" rx="1"/><path d="M3 8h14"/><path d="M7 2v4M13 2v4"/></svg>;
    case 'uurrooster': return <svg {...props}><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>;
    case 'inbox': return <svg {...props}><path d="M3 12l2-7h10l2 7"/><path d="M3 12v4h14v-4"/><path d="M3 12h4l1 2h4l1-2h4"/></svg>;
    case 'klanten': return <svg {...props}><circle cx="10" cy="7" r="3"/><path d="M4 17c0-3 2.5-5 6-5s6 2 6 5"/></svg>;
    case 'werven': return <svg {...props}><path d="M3 17V8l7-5 7 5v9"/><path d="M8 17v-5h4v5"/></svg>;
    case 'werknemers': return <svg {...props}><circle cx="7" cy="7" r="2.5"/><circle cx="14" cy="8" r="2"/><path d="M2 16c0-2.5 2-4 5-4s5 1.5 5 4"/><path d="M11 14c.5-1.5 2-2.5 4-2.5s3 1 3 2.5"/></svg>;
    case 'machines': return <svg {...props}><circle cx="6" cy="14" r="2"/><circle cx="14" cy="14" r="2"/><path d="M3 14h1M8 14h4M16 14h1"/><path d="M5 11V7h6l3 4"/><path d="M5 7L9 4h2"/></svg>;
    case 'artikelen': return <svg {...props}><path d="M3 7l7-4 7 4v6l-7 4-7-4z"/><path d="M3 7l7 4 7-4M10 11v6"/></svg>;
    case 'diensten': return <svg {...props}><path d="M5 8h10v9H5z"/><path d="M8 8V5a2 2 0 014 0v3"/></svg>;
    case 'invoice': return <svg {...props}><path d="M5 3h10v14l-3-2-2 2-2-2-3 2z"/><path d="M8 7h4M8 10h4M8 13h2"/></svg>;
    case 'bedrijf': return <svg {...props}><path d="M4 17V6l6-3 6 3v11"/><path d="M8 17v-4h4v4"/><path d="M7 8h1M11 8h1M7 11h1M11 11h1"/></svg>;
    default: return null;
  }
}

function ChevronIcon({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms' }}>
      <path d="M3 5l3 3 3-3"/>
    </svg>
  );
}

export default function AppShell({ activeTab, onTabChange, badges = {}, demoFlow, statusBadge, children }) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo header */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-200">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white flex items-center justify-center font-bold text-xs tracking-tight">DV</div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-slate-900">DEMAECKER &amp;</div>
            <div className="text-[13px] font-semibold text-slate-900 -mt-0.5">VAN HAECKE</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-3">
              <div className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{section.label}</div>
              {section.items.map(item => {
                const isActive = activeTab === item.id;
                const badge = badges[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full px-3 mx-2 my-0.5 flex items-center gap-2.5 rounded-md text-[13px] py-1.5 transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    style={{ width: 'calc(100% - 1rem)' }}
                  >
                    <NavIcon name={item.icon} active={isActive} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {badge > 0 && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-200 text-blue-900' : 'bg-red-100 text-red-700'}`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Demo flow — collapsible */}
        {demoFlow && (
          <div className="border-t border-slate-200 px-2 py-2">
            <button
              onClick={() => setDemoOpen(o => !o)}
              className="w-full px-2 py-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 hover:text-slate-700"
            >
              <ChevronIcon open={demoOpen} />
              <span>Demo flow</span>
            </button>
            {demoOpen && (
              <div className="mt-1 space-y-0.5">
                {demoFlow.map((flow, i) => (
                  <button
                    key={i}
                    onClick={flow.onClick}
                    className="w-full text-left text-[12px] px-3 py-1 rounded hover:bg-slate-100 text-slate-600"
                  >
                    {i + 1}. {flow.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer — user info */}
        <div className="border-t border-slate-200 px-3 py-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-medium text-slate-600">MV</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-slate-700 truncate">Mathias Van Haecke</div>
            <div className="text-[10px] text-slate-400 truncate">Zaakvoerder</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 shrink-0 px-6 flex items-center justify-between border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-slate-900 capitalize">
              {NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge && (
              <span className={`text-[11px] px-2.5 py-1 rounded-full ${statusBadge.kind === 'success' ? 'bg-emerald-50 text-emerald-700' : statusBadge.kind === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {statusBadge.text}
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
