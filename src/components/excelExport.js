// Simple internal Excel export — single-sheet view of a proposal.
// For D&V's own use: review, print, share with collega's, edit if needed.

import * as XLSX from 'xlsx';

const fmt = (n) => Number(n || 0);

export function exportProposalToExcel(proposal, klant) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['DEMAECKER & VANHAECKE'],
    ['Dorpweg 35, 8377 Zuienkerke-Meetkerke · BTW BE 0420.343.659 · Tel. 050/31 63 27'],
    [],
    [proposal.status === 'invoiced' || proposal.status === 'paid' ? 'FACTUUR' : 'VOORSTEL TOT FACTURATIE'],
    [],
    ['Nr', proposal.nr],
    ['Datum', proposal.createdDate],
    ['Periode', proposal.period],
    ['Status', statusLabel(proposal.status)],
    proposal.poNr ? ['PO referentie', proposal.poNr === 'GEEN PO' ? '(geen)' : proposal.poNr] : null,
    [],
    ['Klant', proposal.klant],
    klant?.address ? ['Adres', klant.address] : null,
    klant?.vat ? ['BTW', klant.vat] : null,
    klant?.contact ? ['Contact', klant.contact] : null,
    klant?.terms ? ['Betaaltermijn', `${klant.terms} dagen`] : null,
    [],
  ].filter(Boolean);

  // Line table headers
  const tableHeaderRowIdx = rows.length + 1; // 1-indexed for Excel formulas
  rows.push(['Datum', 'Bestuurder', 'Werf', 'Machine', 'Uren', 'Tarief (€/u)', 'Bedrag (€)', 'Opmerking']);

  const firstDataRow = rows.length + 1;
  proposal.lines.forEach((l, i) => {
    const rowIdx = firstDataRow + i;
    rows.push([
      l.date,
      l.worker,
      l.werf,
      l.machine,
      fmt(l.bon),
      fmt(l.rate),
      { f: `E${rowIdx}*F${rowIdx}` }, // live Excel formula
      l.nota || ''
    ]);
  });
  const lastDataRow = firstDataRow + proposal.lines.length - 1;

  // Totals
  rows.push([]);
  rows.push([
    '', '', '', 'TOTAAL',
    { f: `SUM(E${firstDataRow}:E${lastDataRow})` },
    '',
    { f: `SUM(G${firstDataRow}:G${lastDataRow})` },
    ''
  ]);
  const subtotalRow = rows.length;
  rows.push(['', '', '', 'BTW 21%', '', '', { f: `G${subtotalRow}*0.21` }, '']);
  const vatRow = rows.length;
  rows.push(['', '', '', 'TOTAAL INCL. BTW', '', '', { f: `G${subtotalRow}+G${vatRow}` }, '']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 },  // Datum
    { wch: 22 },  // Bestuurder
    { wch: 22 },  // Werf
    { wch: 18 },  // Machine
    { wch: 8 },   // Uren
    { wch: 12 },  // Tarief
    { wch: 14 },  // Bedrag
    { wch: 30 }   // Opmerking
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Voorstel');

  const filename = `${proposal.status === 'invoiced' || proposal.status === 'paid' ? 'factuur' : 'voorstel'}_${proposal.nr}_${proposal.klant.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}

function statusLabel(s) {
  return {
    draft: 'Concept',
    sent: 'Verzonden naar klant',
    approved: 'PO ontvangen',
    rejected: 'Afgekeurd',
    invoiced: 'Gefactureerd',
    paid: 'Betaald'
  }[s] || s;
}
