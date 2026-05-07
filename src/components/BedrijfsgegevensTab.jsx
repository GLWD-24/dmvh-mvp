import React, { useState } from 'react';

/**
 * BedrijfsgegevensTab — instellingenscherm voor bedrijfsgegevens.
 * Geport vanuit USEIT2000 Bedrijfsgegevens-tabel.
 * In productie: BTW, banknummers, contactpersoon, betaaltermijn defaults, logo upload.
 */

function Field({ label, children, hint, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, ...props }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      {...props}
    />
  );
}

function NumberInput({ value, onChange, ...props }) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      {...props}
    />
  );
}

function Section({ title, description, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function BedrijfsgegevensTab({ bedrijf, onSave }) {
  const [draft, setDraft] = useState(bedrijf);
  const [dirty, setDirty] = useState(false);

  const update = (field, value) => {
    setDraft(d => ({ ...d, [field]: value }));
    setDirty(true);
  };

  const updateBank = (which, field, value) => {
    setDraft(d => ({
      ...d,
      [which]: { ...d[which], [field]: value }
    }));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(draft);
    setDirty(false);
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-[22px] font-semibold text-slate-900 mb-1">Bedrijfsgegevens</h2>
          <p className="text-[13px] text-slate-500">
            Deze gegevens verschijnen op alle uitgaande documenten (offertes, facturen, bestelbonnen).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Niet-opgeslagen wijzigingen
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`text-[13px] px-4 py-2 rounded-md font-medium transition-colors ${
              dirty
                ? 'bg-blue-700 text-white hover:bg-blue-800'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Opslaan
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Identificatie */}
        <Section title="Bedrijfsidentificatie" description="Officiële benaming en juridische gegevens">
          <Field label="Naam" full>
            <Input value={draft.naam} onChange={v => update('naam', v)} />
          </Field>
          <Field label="BTW-nummer">
            <Input value={draft.btwNr} onChange={v => update('btwNr', v)} placeholder="BE 0000.000.000" />
          </Field>
          <Field label="HR-nummer">
            <Input value={draft.hrNr} onChange={v => update('hrNr', v)} placeholder="Brugge 00.000" />
          </Field>
          <Field label="Registratienummer" full>
            <Input value={draft.registratienr} onChange={v => update('registratienr', v)} />
          </Field>
          <Field label="Activiteiten" full hint="Verschijnt op offertes en facturen onder de bedrijfsnaam">
            <Input value={draft.activiteiten} onChange={v => update('activiteiten', v)} />
          </Field>
        </Section>

        {/* Adres */}
        <Section title="Maatschappelijke zetel">
          <Field label="Adres" full>
            <Input value={draft.adres} onChange={v => update('adres', v)} />
          </Field>
          <Field label="Postcode">
            <Input value={draft.postcode} onChange={v => update('postcode', v)} />
          </Field>
          <Field label="Gemeente">
            <Input value={draft.gemeente} onChange={v => update('gemeente', v)} />
          </Field>
          <Field label="Land">
            <Input value={draft.land} onChange={v => update('land', v)} />
          </Field>
        </Section>

        {/* Contact */}
        <Section title="Contactgegevens">
          <Field label="Telefoon">
            <Input value={draft.telefoon} onChange={v => update('telefoon', v)} />
          </Field>
          <Field label="Fax">
            <Input value={draft.fax} onChange={v => update('fax', v)} />
          </Field>
          <Field label="Email">
            <Input value={draft.email} onChange={v => update('email', v)} />
          </Field>
          <Field label="Website">
            <Input value={draft.website} onChange={v => update('website', v)} />
          </Field>
          <Field label="Contactpersoon">
            <Input value={draft.contactpersoon} onChange={v => update('contactpersoon', v)} />
          </Field>
          <Field label="Functie">
            <Input value={draft.contactFunctie} onChange={v => update('contactFunctie', v)} />
          </Field>
        </Section>

        {/* Bankgegevens */}
        <Section title="Bankrekeningen" description="Verschijnt onderaan facturen voor betaling">
          <Field label="IBAN — rekening 1">
            <Input
              value={draft.banknr1?.iban}
              onChange={v => updateBank('banknr1', 'iban', v)}
              placeholder="BE00 0000 0000 0000"
            />
          </Field>
          <Field label="BIC — rekening 1">
            <Input
              value={draft.banknr1?.bic}
              onChange={v => updateBank('banknr1', 'bic', v)}
            />
          </Field>
          <Field label="Bank — rekening 1" full>
            <Input
              value={draft.banknr1?.bank}
              onChange={v => updateBank('banknr1', 'bank', v)}
            />
          </Field>
          <Field label="IBAN — rekening 2">
            <Input
              value={draft.banknr2?.iban}
              onChange={v => updateBank('banknr2', 'iban', v)}
            />
          </Field>
          <Field label="BIC — rekening 2">
            <Input
              value={draft.banknr2?.bic}
              onChange={v => updateBank('banknr2', 'bic', v)}
            />
          </Field>
          <Field label="Bank — rekening 2" full>
            <Input
              value={draft.banknr2?.bank}
              onChange={v => updateBank('banknr2', 'bank', v)}
            />
          </Field>
        </Section>

        {/* Facturatie defaults */}
        <Section title="Facturatie standaardwaarden" description="Worden gebruikt als startpunt voor nieuwe documenten">
          <Field label="Betaaltermijn (dagen)" hint="Standaard betaaltermijn voor nieuwe facturen">
            <NumberInput value={draft.betaaltermijnDefault} onChange={v => update('betaaltermijnDefault', v)} />
          </Field>
          <Field label="BTW-tarief default (%)">
            <NumberInput value={draft.btwTariefDefault} onChange={v => update('btwTariefDefault', v)} />
          </Field>
          <Field label="Factuurnummer prefix" hint="Bijv. F2026- → F2026-001, F2026-002, ...">
            <Input value={draft.factuurNummerStart} onChange={v => update('factuurNummerStart', v)} />
          </Field>
          <Field label="Offertenummer prefix">
            <Input value={draft.offerteNummerStart} onChange={v => update('offerteNummerStart', v)} />
          </Field>
        </Section>

        {/* Logo */}
        <Section title="Logo" description="Verschijnt op de hoofding van facturen en offertes">
          <Field label="Logo upload" full hint="Upload een PNG of JPG, maximaal 1 MB. Aanbevolen: 400×400 px transparant.">
            <div className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center">
              <p className="text-[12px] text-slate-500 mb-2">Sleep een afbeelding hierheen of</p>
              <button className="text-[12px] text-blue-700 font-medium hover:underline">
                Bestand kiezen
              </button>
              <p className="text-[10px] text-slate-400 mt-2">Nog geen logo geüpload</p>
            </div>
          </Field>
        </Section>
      </div>

      {/* Save bar bottom */}
      {dirty && (
        <div className="sticky bottom-0 mt-6 -mx-6 px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-end gap-2 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => { setDraft(bedrijf); setDirty(false); }}
            className="text-[13px] px-4 py-2 rounded-md text-slate-600 hover:bg-slate-100"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="text-[13px] px-4 py-2 rounded-md bg-blue-700 text-white hover:bg-blue-800 font-medium"
          >
            Wijzigingen opslaan
          </button>
        </div>
      )}
    </div>
  );
}
