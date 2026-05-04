// Seed data drawn from the original USEIT2000 screenshots.
// Replace with real API calls when wiring the backend.

export const seedKlanten = [
  { id: 'k1', name: 'AVEVE AALTER', address: 'Markt 12, 9880 Aalter', vat: 'BE 0420.343.659', terms: 30, contact: 'J. Maes', phone: '09 374 12 34', email: 'j.maes@aveve-aalter.be', mobile: '0475 11 22 33', fax: '09 374 12 35', noPO: true },
  { id: 'k2', name: 'AGRO ENERGIEK', address: 'Industrieweg 5, 9930 Zomergem', vat: 'BE 0451.221.118', terms: 30, contact: 'P. Verstraete', phone: '09 372 88 99', email: 'info@agroenergiek.be', mobile: '0496 55 44 33', fax: '', noPO: false },
  { id: 'k3', name: 'BESIX', address: 'Avenue des Communautés 100, 1200 Brussel', vat: 'BE 0407.573.196', terms: 60, contact: 'K. Bogaert', phone: '02 402 62 11', email: 'k.bogaert@besix.com', mobile: '0477 88 99 00', fax: '02 402 62 12', noPO: false },
  { id: 'k4', name: 'ASWEBO ROESELARE', address: 'Bruggesteenweg 145, 8800 Roeselare', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck', phone: '051 26 30 30', email: 'w.oosterlinck@aswebo.be', mobile: '0498 12 34 56', fax: '', noPO: false },
  { id: 'k5', name: 'ASWEBO ZEEBRUGGE', address: 'Kustlaan 1, 8380 Zeebrugge', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck', phone: '050 54 12 34', email: 'w.oosterlinck@aswebo.be', mobile: '0498 12 34 56', fax: '', noPO: false },
  { id: 'k6', name: 'KESTELEYN Charles', address: 'Burgstraat 88, 9000 Gent', vat: 'BE 0512.998.224', terms: 30, contact: 'C. Kesteleyn', phone: '09 224 55 66', email: 'charles@kesteleyn.be', mobile: '0475 99 88 77', fax: '', noPO: true },
  { id: 'k7', name: 'HYE', address: 'Noordlaan 22, 2030 Antwerpen', vat: 'BE 0404.882.001', terms: 45, contact: 'M. Hye', phone: '03 541 22 33', email: 'm.hye@hye.be', mobile: '0476 33 22 11', fax: '03 541 22 34', noPO: false },
  { id: 'k8', name: 'JONCKHEERE', address: 'Spinnerijstraat 7, 8800 Roeselare', vat: 'BE 0405.117.299', terms: 30, contact: 'F. Jonckheere', phone: '051 23 45 67', email: 'info@jonckheere.be', mobile: '', fax: '', noPO: false }
];

// Werven: klantId references seedKlanten.id. Werven represent specific projects/locations
// per klant. A klant can have multiple werven (e.g. ARTES DEPRET has 2, D E C has 6).
// `omschrijving` = optional project descriptor (e.g. "Onderhoud patrimonium 543",
// "Zeebrugge kaaimuur boudewijnkanaal", "Antwerpen", "Brugge").
export const seedWerven = [
  // AVEVE AALTER
  { id: 'aveve-1', klantId: 'k1', omschrijving: 'Aalter', address: 'Aalter', status: 'open', assignments: [] },
  // AGRO ENERGIEK
  { id: 'agro-1', klantId: 'k2', omschrijving: 'Zomergem', address: 'Zomergem', status: 'open', assignments: [] },
  // BESIX
  { id: 'besix-1', klantId: 'k3', omschrijving: 'Winterdijk', address: 'Winterdijk', status: 'open', assignments: [] },
  // ASWEBO ROESELARE — multiple werven illustrated like real planning
  { id: 'aswebo-r-1', klantId: 'k4', omschrijving: 'Roeselare', address: 'Roeselare', status: 'open', assignments: [] },
  { id: 'aswebo-r-2', klantId: 'k4', omschrijving: 'Heist kaaimuur', address: 'Heist', status: 'open', assignments: [] },
  // ASWEBO ZEEBRUGGE
  { id: 'aswebo-z-1', klantId: 'k5', omschrijving: 'Zeebrugge', address: 'Zeebrugge', status: 'open', assignments: [] },
  // KESTELEYN Charles
  { id: 'kest-1', klantId: 'k6', omschrijving: 'Gent Ragnar laden', address: 'Gent', status: 'open', assignments: [] },
  // HYE — 2 werven
  { id: 'hye-1', klantId: 'k7', omschrijving: 'Antwerpen', address: 'Antwerpen', status: 'open', assignments: [] },
  { id: 'hye-2', klantId: 'k7', omschrijving: 'Onderhoud patrimonium 543', address: 'Brugge', status: 'open', assignments: [] },
  // JONCKHEERE
  { id: 'jonck-1', klantId: 'k8', omschrijving: 'Roeselare', address: 'Roeselare', status: 'open', assignments: [] }
];

export const seedWorkers = [
  { id: 'w1', name: 'DEBRUYCKER', type: 'employee', function: 'Bestuurder', hireDate: '15/03/2018', uurloon1: 24.50, uurloon2: 36.75 },
  { id: 'w2', name: 'EECKLOO FREDERIK', type: 'employee', function: 'Bestuurder', hireDate: '01/06/2015', uurloon1: 26.00, uurloon2: 39.00 },
  { id: 'w3', name: 'INGELBRECHT BART', type: 'employee', function: 'Bestuurder', hireDate: '12/09/2011', uurloon1: 27.50, uurloon2: 41.25 },
  { id: 'w4', name: 'DEMEULENAERE GINO', type: 'subcontractor', function: 'Bestuurder', hireDate: '20/01/2020', uurloon1: 52.00, uurloon2: 65.00 },
  { id: 'w6', name: 'BOGAERT KRISTOF', type: 'employee', function: 'Bestuurder', hireDate: '07/11/2008', uurloon1: 28.75, uurloon2: 43.10 },
  { id: 'w7', name: 'KIMPE MANUEL', type: 'subcontractor', function: 'Bestuurder', hireDate: '14/02/2022', uurloon1: 48.50, uurloon2: 60.00 },
  { id: 'w8', name: 'OA HAECK JAN', type: 'employee', function: 'Chauffeur', hireDate: '22/08/2016', uurloon1: 23.50, uurloon2: 35.25 }
];

export const seedMachines = [
  { id: 'm1', code: 'Bobcat 3', group: 'Bobcat', description: 'Bobcat S150 skid steer loader', rate: 65, color: '#F59E0B' },
  { id: 'm2', code: 'Atlas L 23', group: 'Bandenkraan', description: 'Atlas L 23 mobile crane', rate: 85, color: '#3B82F6' },
  { id: 'm3', code: 'Sen 835.44', group: 'Bandenkraan', description: 'Sennebogen 835 wheel material handler', rate: 95, color: '#3B82F6' },
  { id: 'm4', code: 'ZX210.08 WD', group: 'Bandenkraan', description: 'Hitachi ZX210 W-6 wheeled excavator', rate: 90, color: '#3B82F6' },
  { id: 'm5', code: 'LR 160.22', group: 'Rupskraan', description: 'Liebherr LR 160 crawler crane', rate: 110, color: '#10B981' },
  { id: 'm6', code: 'ZX140.13 WD', group: 'Bandenkraan', description: 'Hitachi ZX140 W-6 wheeled excavator', rate: 80, color: '#3B82F6' },
  { id: 'm7', code: 'Volvo A30F', group: 'Dumper', description: 'Volvo A30F articulated dump truck', rate: 95, color: '#EF4444' },
  { id: 'm8', code: 'Bobcat 9', group: 'Bobcat', description: 'Bobcat S590 skid steer loader', rate: 70, color: '#F59E0B' },
  { id: 'm9', code: 'ZX130.200 Amfibi', group: 'Rupskraan', description: 'Hitachi ZX130 amphibious excavator', rate: 130, color: '#10B981' },
  { id: 'm10', code: 'Kramer Fiat 1', group: 'Bandenlader', description: 'Kramer wheel loader', rate: 75, color: '#8B5CF6' },
  { id: 'm11', code: 'Dieplader 4as1', group: 'Dieplader', description: '4-axle low loader trailer', rate: 60, color: '#6B7280' },
  { id: 'm12', code: 'MAN 8x8', group: 'Vrachtwagens', description: 'MAN 8x8 heavy haul truck', rate: 85, color: '#EC4899' }
];

// Werkbon entries also serve as the Uurrooster source data.
// fiche = internal/payroll hours, bon = billable hours to klant.
// For subcontractor work, incomingInvoiceId tracks whether the OA has invoiced D&V yet.
export const seedWerkbonnen = [
  // AGRO ENERGIEK Zomergem — recurring work
  { id: 'wb-1001', nr: 431720, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '14/04/2026', fiche: 8.5, bon: 8.5, rate: 95, status: 'approved', nota: '', incomingInvoiceId: null },
  { id: 'wb-1002', nr: 431721, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '15/04/2026', fiche: 8.0, bon: 8.0, rate: 95, status: 'approved', nota: '', incomingInvoiceId: null },
  { id: 'wb-1003', nr: 431722, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat 9', date: '15/04/2026', fiche: 7.5, bon: 7.5, rate: 70, status: 'approved', nota: 'TURF — naakte verhuur, klant bestuurt', incomingInvoiceId: null },
  { id: 'wb-1004', nr: 431723, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat 9', date: '28/04/2026', fiche: 8.0, bon: 8.0, rate: 70, status: 'approved', nota: 'naakte verhuur', incomingInvoiceId: null },

  // BESIX Winterdijk — heavy recurring schedule
  { id: 'wb-1010', nr: 431730, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'ZX210.08 WD', date: '01/04/2026', fiche: 7.5, bon: 7.5, rate: 90, status: 'approved', nota: 'Vandammesluis Vo', incomingInvoiceId: null },
  { id: 'wb-1011', nr: 431731, klant: 'BESIX', werf: 'Winterdijk', worker: 'KIMPE MANUEL', machine: 'ZX210.08 WD', date: '02/04/2026', fiche: 7.5, bon: 7.5, rate: 90, status: 'approved', nota: 'Vandammesluis Vo', incomingInvoiceId: 'oa-inv-001' },
  { id: 'wb-1012', nr: 431732, klant: 'BESIX', werf: 'Winterdijk', worker: 'OA HAECK JAN', machine: 'cont', date: '02/04/2026', fiche: 2.25, bon: 6.0, rate: 75, status: 'approved', nota: 'Argex ophalen', incomingInvoiceId: null },
  { id: 'wb-1013', nr: 431733, klant: 'BESIX', werf: 'Winterdijk', worker: 'KIMPE MANUEL', machine: 'ZX140.13 WD', date: '16/04/2026', fiche: 8.0, bon: 8.0, rate: 80, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null },
  { id: 'wb-1014', nr: 431734, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'ZX140.13 WD', date: '17/04/2026', fiche: 8.0, bon: 8.0, rate: 80, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null },
  { id: 'wb-1015', nr: 431735, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '20/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null },
  { id: 'wb-1016', nr: 431736, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '22/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null },
  { id: 'wb-1017', nr: 431737, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '27/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null },
  { id: 'wb-1018', nr: 431738, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '28/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null },

  // ASWEBO Roeselare
  { id: 'wb-1020', nr: 431740, klant: 'ASWEBO ROESELARE', werf: 'Roeselare', worker: 'INGELBRECHT BART', machine: 'Atlas L 23', date: '08/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: '', incomingInvoiceId: null },
  { id: 'wb-1021', nr: 431741, klant: 'ASWEBO ROESELARE', werf: 'Roeselare', worker: 'INGELBRECHT BART', machine: 'Atlas L 23', date: '09/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: '', incomingInvoiceId: null },

  // HYE — subcontractor (DEMEULENAERE GINO) — invoice missing!
  { id: 'wb-1030', nr: 431750, klant: 'HYE', werf: 'Antwerpen', worker: 'DEMEULENAERE GINO', machine: 'LR 160.22', date: '06/04/2026', fiche: 8.5, bon: 8.5, rate: 110, status: 'approved', nota: 'kraan rups', incomingInvoiceId: null },
  { id: 'wb-1031', nr: 431751, klant: 'HYE', werf: 'Antwerpen', worker: 'DEMEULENAERE GINO', machine: 'LR 160.22', date: '07/04/2026', fiche: 9.0, bon: 9.0, rate: 110, status: 'approved', nota: 'kraan rups', incomingInvoiceId: null },
  { id: 'wb-1032', nr: 431752, klant: 'HYE', werf: 'Antwerpen', worker: 'DEMEULENAERE GINO', machine: 'LR 160.22', date: '08/04/2026', fiche: 8.0, bon: 8.0, rate: 110, status: 'approved', nota: '', incomingInvoiceId: null },

  // KESTELEYN — DEMEULENAERE GINO again — earlier invoice already received
  { id: 'wb-1040', nr: 431760, klant: 'KESTELEYN Charles', werf: 'Gent', worker: 'DEMEULENAERE GINO', machine: 'Sen 835.44', date: '03/04/2026', fiche: 8.0, bon: 8.0, rate: 95, status: 'approved', nota: 'Gent', incomingInvoiceId: 'oa-inv-002' },

  // AVEVE AALTER
  { id: 'wb-1050', nr: 431770, klant: 'AVEVE AALTER', werf: 'Aalter', worker: 'DEBRUYCKER', machine: 'Bobcat 3', date: '13/04/2026', fiche: 8.0, bon: 8.0, rate: 65, status: 'approved', nota: '', incomingInvoiceId: null },
  { id: 'wb-1051', nr: 431771, klant: 'AVEVE AALTER', werf: 'Aalter', worker: 'INGELBRECHT BART', machine: 'Atlas L 23', date: '13/04/2026', fiche: 4.0, bon: 4.0, rate: 85, status: 'approved', nota: 'VM', incomingInvoiceId: null },
  { id: 'wb-1052', nr: 431772, klant: 'JONCKHEERE', werf: 'Roeselare', worker: 'ingelbrecht bart', machine: 'Atlas L 23', date: '13/04/2026', fiche: 4.0, bon: 4.0, rate: 85, status: 'approved', nota: 'NM', incomingInvoiceId: null }
];

// Tracks subcontractor (OA) incoming invoices
export const seedIncomingInvoices = [
  { id: 'oa-inv-001', oaName: 'KIMPE MANUEL', invoiceNr: 'KM-2026-04-12', dateReceived: '15/04/2026', amount: 675.00, status: 'received' },
  { id: 'oa-inv-002', oaName: 'DEMEULENAERE GINO', invoiceNr: 'DEG-26-074', dateReceived: '10/04/2026', amount: 760.00, status: 'paid' }
];

export const machineGroups = ['Bandenkraan', 'Bandenlader', 'Bobcat', 'Borstelmachine', 'Dieplader', 'Dumper', 'Minigraafmachine', 'Rupskraan', 'Tractor', 'Vrachtwagens'];
export const workerFunctions = ['Bestuurder', 'Arbeider', 'Chauffeur', 'Voorman', 'Magazijn'];
