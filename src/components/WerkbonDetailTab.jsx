import React, { useState, useEffect } from 'react';

/**
 * WerkbonDetailTab — volledige bon-pagina met alle velden zichtbaar en aanpasbaar.
 *
 * Use cases:
 *  - Kantoor opent een bon vanuit de inbox: alle velden zichtbaar, edit, goedkeuren/afwijzen
 *  - URL gedeeld met werfleider → werfleider opent en keurt goed (read-only behalve approve)
 *  - Klant via link: read-only preview
 *
 * URL-routing via hash: #werkbon/wb-1234567890
 * App.jsx leest window.location.hash en stuurt de werkbon-id door als prop.
 */

const STATUS_LABELS = {
  submitted: { label: 'Ingediend', color: 'amber' },
  approved: { label: 'Goedgekeurd', color: 'emerald' },
  rejected: { label: 'Afgewezen', color: 'red' },
  unknown: { label: 'In behandeling', color: 'slate' }
};

const COLOR_CLASSES = {
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function WerkbonDetailTab({
  werkbonId,
  werkbonnen,
  onUpdateWerkbon,
  onApprove,
  onReject,
  onBack,
  // mode: 'admin' (edit + alles) | 'werfleider' (alleen approve/reject) | 'readonly' (alleen kijken)
  mode = 'admin'
}) {
  const wb = werkbonnen.find(w => w.id === werkbonId);
  const [draft, setDraft] = useState(wb || null);
  const [dirty, setDirty] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (wb) { setDraft(wb); setDirty(false); }
  }, [werkbonId, wb?.id]);

  if (!wb) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        Werkbon niet gevonden.
        {onBack && (
          <div className="mt-3">
            <button onClick={onBack} className="text-blue-700 hover:text-blue-900 text-xs">← Terug</button>
          </div>
        )}
      </div>
    );
  }

  const update = (field, value) => {
    setDraft(d => ({ ...d, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdateWerkbon && onUpdateWerkbon(wb.id, draft);
    setDirty(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#werkbon/${wb.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const status = STATUS_LABELS[wb.status] || STATUS_LABELS.unknown;
  const isEditable = mode === 'admin';
  const canApprove = (mode === 'admin' || mode === 'werfleider') && wb.status === 'submitted';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-sm">← Terug</button>
          )}
          <h2 className="text-lg font-semibold text-slate-900">Werkbon #{wb.nr}</h2>
          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${COLOR_CLASSES[status.color]}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="text-[11px] px-3 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5"
            title="Kopieer link naar deze bon"
          >
            {copiedLink ? '✓ Gekopieerd' : '🔗 Link kopiëren'}
          </button>
        </div>
      </div>

      {/* Werf / klant info */}
      <Section title="Klant &amp; werf">
        <Grid>
          <Field label="Klant" value={draft.klant} editable={isEditable} onChange={v => update('klant', v)} />
          <Field label="Werf" value={draft.werf} editable={isEditable} onChange={v => update('werf', v)} />
          <Field label="Datum" value={draft.date} editable={isEditable} onChange={v => update('date', v)} />
          <Field label="Bestuurder" value={draft.worker} editable={isEditable} onChange={v => update('worker', v)} />
          <Field label="Machine" value={draft.machine} editable={isEditable} onChange={v => update('machine', v)} />
        </Grid>
      </Section>

      {/* Tijden */}
      <Section title="Tijden">
        <Grid>
          <Field label="Start uur" type="time" value={draft.startStr || ''} editable={isEditable} onChange={v => update('startStr', v)} />
          <Field label="Eind uur" type="time" value={draft.endStr || ''} editable={isEditable} onChange={v => update('endStr', v)} />
          <Field label="Pauze (min)" type="number" value={draft.pauseMin || ''} editable={isEditable} onChange={v => update('pauseMin', v)} />
          <Field label="Totaal uren (bon)" type="number" step="0.01" value={draft.bon ?? draft.hours ?? 0} editable={isEditable} onChange={v => update('bon', parseFloat(v) || 0)} />
          <Field label="Fiche-uren" type="number" step="0.01" value={draft.fiche ?? draft.hours ?? 0} editable={isEditable} onChange={v => update('fiche', parseFloat(v) || 0)} hint="Loon-uren — kan afwijken van bon-uren bij verlof of correcties" />
          <Field label="Tarief (€/u)" type="number" step="0.01" value={draft.rate || 0} editable={isEditable} onChange={v => update('rate', parseFloat(v) || 0)} />
        </Grid>
        <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-[12px] flex items-center justify-between">
          <span className="text-slate-600">Totaal te factureren</span>
          <span className="font-mono font-semibold text-slate-900">
            € {((draft.bon ?? draft.hours ?? 0) * (draft.rate || 0)).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </Section>

      {/* Werfleider & handtekening */}
      <Section title="Werfleider &amp; handtekening">
        <Grid>
          <Field
            label="Werfleider niet aanwezig"
            type="checkbox"
            value={!!draft.werfleiderAfwezig}
            editable={isEditable}
            onChange={v => update('werfleiderAfwezig', v)}
          />
          <div /> {/* lege cel */}
          <Field
            label="Bestuurder getekend"
            type="checkbox"
            value={true}
            editable={false}
            hint="Werknemer heeft bij indienen getekend"
          />
          <Field
            label="Werfleider getekend"
            type="checkbox"
            value={!draft.werfleiderAfwezig}
            editable={false}
            hint={draft.werfleiderAfwezig ? 'Werfleider was niet aanwezig' : 'Werfleider heeft op werf getekend'}
          />
        </Grid>
      </Section>

      {/* Opmerking */}
      <Section title="Opmerking">
        {isEditable ? (
          <textarea
            rows={3}
            value={draft.nota || ''}
            onChange={e => update('nota', e.target.value)}
            placeholder="Geen opmerking..."
            className="w-full text-sm p-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        ) : (
          <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 min-h-[3rem] whitespace-pre-wrap">
            {draft.nota || <span className="text-slate-400 italic">— geen opmerking —</span>}
          </div>
        )}
      </Section>

      {/* Werfleider goedkeuring info */}
      {wb.werfleiderApprovedBy && (
        <div className="mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-[12px] text-emerald-900">
          ✓ Goedgekeurd door werfleider op {new Date(wb.werfleiderApprovedAt).toLocaleString('nl-BE')}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
        {isEditable && dirty && (
          <button
            onClick={handleSave}
            className="text-[12px] px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Wijzigingen opslaan
          </button>
        )}
        {canApprove && (
          <>
            <button
              onClick={() => { onReject && onReject(wb.id); }}
              className="text-[12px] px-4 py-2 rounded bg-white border border-red-300 text-red-700 hover:bg-red-50"
            >
              Afwijzen
            </button>
            <button
              onClick={() => { onApprove && onApprove(wb.id); }}
              className="text-[12px] px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Goedkeuren
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5 bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>;
}

function Field({ label, value, editable, onChange, type = 'text', step, hint }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      {type === 'checkbox' ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => editable && onChange && onChange(e.target.checked)}
            disabled={!editable}
            className="w-4 h-4 rounded border-slate-300"
          />
          <span className="text-[12px] text-slate-700">{value ? 'Ja' : 'Nee'}</span>
        </div>
      ) : editable ? (
        <input
          type={type}
          step={step}
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      ) : (
        <div className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 min-h-[2.25rem] flex items-center">
          {value || <span className="text-slate-400">—</span>}
        </div>
      )}
      {hint && <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}
