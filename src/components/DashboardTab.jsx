import React from 'react';

/**
 * Dashboard — landingsscherm met de kerncijfers.
 * Inspiratie: Linear, Notion, Plan-grid voor bouw.
 * Voor DMVH: vandaag-planning, late werkbonnen, openstaande facturen.
 */

function StatCard({ label, value, hint, accent = 'slate', icon }) {
  const accentMap = {
    slate: 'text-slate-700 border-slate-200',
    blue: 'text-blue-700 border-blue-200',
    amber: 'text-amber-700 border-amber-200',
    emerald: 'text-emerald-700 border-emerald-200',
    red: 'text-red-700 border-red-200'
  };
  return (
    <div className={`bg-white border rounded-lg p-4 ${accentMap[accent]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</span>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      <div className="text-2xl font-semibold text-slate-900 leading-tight">{value}</div>
      {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wide">{title}</h3>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function DashboardTab({ klanten, werven, workers, machines, werkbonnen, proposals, onNavigate }) {
  // Compute KPIs
  const today = '07/05/2026';
  const dailyOpen = werven.filter(w => w.status !== 'closed').length;
  const lateBonnen = werkbonnen.filter(b => b.status === 'unknown').length;
  const submittedBonnen = werkbonnen.filter(b => b.status === 'submitted').length;
  const openProposals = proposals.filter(p => ['draft', 'sent'].includes(p.status)).length;
  const onbetaaldeFacturen = proposals.filter(p => p.status === 'invoiced').length;
  const activeWorkers = workers.filter(w => !w.uitDienst).length;
  const activeMachines = machines.filter(m => m.active !== false).length;

  // "Te ophalen" — machines die bij een klant achtergelaten zijn en moeten opgehaald worden.
  // Auto-afgeleid: een assignment heeft een machine maar geen werknemer en geen HEMZELF.
  const teOphalen = [];
  werven.forEach(w => {
    (w.assignments || []).forEach(a => {
      const isHemzelf = a.workerId === 'HEMZELF';
      const hasWorker = a.workerId && !isHemzelf;
      const hasMachine = !!a.machineId;
      if (hasMachine && !hasWorker && !isHemzelf) {
        const mc = machines.find(x => x.id === a.machineId);
        teOphalen.push({
          assignmentId: a.id,
          werfId: w.id,
          klant: w.klant || '—',
          omschrijving: w.omschrijving || '',
          machineCode: mc?.code || '—',
          machineGroup: mc?.group || '',
          opmerking: a.opmerking || ''
        });
      }
    });
  });

  // Recent activity — laatste werkbonnen
  const recentBonnen = [...werkbonnen]
    .filter(b => b.status === 'approved' || b.status === 'submitted')
    .sort((a, b) => {
      const da = a.date.split('/').reverse().join('');
      const db = b.date.split('/').reverse().join('');
      return db.localeCompare(da);
    })
    .slice(0, 6);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-slate-900 mb-1">Dashboard</h2>
        <p className="text-[13px] text-slate-500">Overzicht voor vandaag — donderdag 7 mei 2026</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Open werven"
          value={dailyOpen}
          hint="Actieve projecten"
          accent="blue"
        />
        <StatCard
          label="Late werkbonnen"
          value={lateBonnen}
          hint={lateBonnen > 0 ? '⚠ WhatsApp herinnering nodig' : 'Alles up-to-date'}
          accent={lateBonnen > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          label="Te beoordelen"
          value={submittedBonnen}
          hint="Werkbonnen wachten op approval"
          accent={submittedBonnen > 0 ? 'amber' : 'slate'}
        />
        <StatCard
          label="Openstaande facturen"
          value={onbetaaldeFacturen}
          hint={`${openProposals} voorstellen in pipeline`}
          accent="slate"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Recent activity */}
        <SectionCard
          title="Recente werkbonnen"
          action={
            <button
              onClick={() => onNavigate('uurrooster')}
              className="text-[11px] text-blue-700 hover:text-blue-900 font-medium"
            >
              Alle bekijken →
            </button>
          }
        >
          <ul className="divide-y divide-slate-100">
            {recentBonnen.length === 0 && (
              <li className="px-4 py-6 text-center text-[12px] text-slate-400">Geen recente werkbonnen</li>
            )}
            {recentBonnen.map(b => (
              <li key={b.id} className="px-4 py-2.5 flex items-center justify-between text-[12px]">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 truncate">{b.klant} — {b.werf}</div>
                  <div className="text-slate-500 text-[11px]">
                    {b.worker} · {b.machine} · {b.bon}u · {b.date}
                  </div>
                </div>
                <span className={`shrink-0 ml-3 text-[10px] px-2 py-0.5 rounded font-medium ${
                  b.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {b.status === 'approved' ? 'Goedgekeurd' : 'Ingediend'}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Quick stats */}
        <SectionCard title="Bedrijfsoverzicht">
          <div className="divide-y divide-slate-100">
            <div className="px-4 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Klanten</span>
              <span className="font-medium text-slate-900">{klanten.filter(k => !k.type || k.type === 'klant').length}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Leveranciers</span>
              <span className="font-medium text-slate-900">{klanten.filter(k => k.type === 'leverancier').length}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Architecten</span>
              <span className="font-medium text-slate-900">{klanten.filter(k => k.type === 'architect').length}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Prospecten</span>
              <span className="font-medium text-slate-900">{klanten.filter(k => k.type === 'prospect').length}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Werknemers (actief)</span>
              <span className="font-medium text-slate-900">{activeWorkers}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Machines (actief)</span>
              <span className="font-medium text-slate-900">{activeMachines}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Open werven</span>
              <span className="font-medium text-slate-900">{werven.filter(w => w.status === 'open').length}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Quick actions */}
      <SectionCard title="Snel naar">
        <div className="grid grid-cols-4 gap-px bg-slate-100">
          {[
            { label: 'Vandaag plannen', target: 'planning', desc: 'Werknemers & machines toewijzen' },
            { label: 'Werkbonnen', target: 'inbox', desc: 'Goedkeuren & corrigeren', badge: submittedBonnen },
            { label: 'Uurrooster', target: 'uurrooster', desc: 'Uren overzicht per werknemer' },
            { label: 'Facturatie', target: 'invoice', desc: 'Voorstellen & facturen' }
          ].map(a => (
            <button
              key={a.target}
              onClick={() => onNavigate(a.target)}
              className="bg-white text-left px-4 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-slate-900 group-hover:text-blue-700">{a.label}</span>
                {a.badge > 0 && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{a.badge}</span>}
              </div>
              <p className="text-[11px] text-slate-500">{a.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Te ophalen — alleen tonen als er items zijn */}
      {teOphalen.length > 0 && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-orange-200 flex items-center justify-between bg-orange-100/60">
            <div className="flex items-center gap-2">
              <span className="text-orange-700 text-base">🚛</span>
              <h3 className="text-[13px] font-semibold text-orange-900 uppercase tracking-wide">Te ophalen</h3>
              <span className="text-[11px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded font-medium">{teOphalen.length}</span>
            </div>
            <button
              onClick={() => onNavigate('planning')}
              className="text-[11px] text-orange-700 hover:text-orange-900 font-medium"
            >
              Ga naar planning →
            </button>
          </div>
          <ul className="divide-y divide-orange-100">
            {teOphalen.map(item => (
              <li key={item.assignmentId} className="px-4 py-2.5 flex items-center justify-between text-[12px] hover:bg-orange-50">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 truncate">
                    {item.klant} {item.omschrijving && <span className="text-slate-500">— {item.omschrijving}</span>}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <span className="font-medium text-orange-800">{item.machineCode}</span>
                    {item.machineGroup && <span className="text-slate-500"> · {item.machineGroup}</span>}
                    {item.opmerking && <span className="text-slate-500"> · {item.opmerking}</span>}
                  </div>
                </div>
                <span className="shrink-0 ml-3 text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded font-medium uppercase">
                  Niet factureren
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
