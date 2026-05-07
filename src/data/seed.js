// Seed data drawn from the original USEIT2000 screenshots.
// Replace with real API calls when wiring the backend.

export const seedKlanten = [
  { id: 'k1', name: 'AVEVE AALTER', address: 'Markt 12, 9880 Aalter', vat: 'BE 0420.343.659', terms: 30, contact: 'J. Maes', phone: '09 374 12 34', email: 'j.maes@aveve-aalter.be', mobile: '0475 11 22 33', fax: '09 374 12 35', noPO: true, type: 'klant' },
  { id: 'k2', name: 'AGRO ENERGIEK', address: 'Industrieweg 5, 9930 Zomergem', vat: 'BE 0451.221.118', terms: 30, contact: 'P. Verstraete', phone: '09 372 88 99', email: 'info@agroenergiek.be', mobile: '0496 55 44 33', fax: '', noPO: false, type: 'klant' },
  { id: 'k3', name: 'BESIX', address: 'Avenue des Communautés 100, 1200 Brussel', vat: 'BE 0407.573.196', terms: 60, contact: 'K. Bogaert', phone: '02 402 62 11', email: 'k.bogaert@besix.com', mobile: '0477 88 99 00', fax: '02 402 62 12', noPO: false, type: 'klant' },
  { id: 'k4', name: 'ASWEBO ROESELARE', address: 'Bruggesteenweg 145, 8800 Roeselare', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck', phone: '051 26 30 30', email: 'w.oosterlinck@aswebo.be', mobile: '0498 12 34 56', fax: '', noPO: false, type: 'klant' },
  { id: 'k5', name: 'ASWEBO ZEEBRUGGE', address: 'Kustlaan 1, 8380 Zeebrugge', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck', phone: '050 54 12 34', email: 'w.oosterlinck@aswebo.be', mobile: '0498 12 34 56', fax: '', noPO: false, type: 'klant' },
  { id: 'k6', name: 'KESTELEYN Charles', address: 'Burgstraat 88, 9000 Gent', vat: 'BE 0512.998.224', terms: 30, contact: 'C. Kesteleyn', phone: '09 224 55 66', email: 'charles@kesteleyn.be', mobile: '0475 99 88 77', fax: '', noPO: true, type: 'klant' },
  { id: 'k7', name: 'HYE', address: 'Noordlaan 22, 2030 Antwerpen', vat: 'BE 0404.882.001', terms: 45, contact: 'M. Hye', phone: '03 541 22 33', email: 'm.hye@hye.be', mobile: '0476 33 22 11', fax: '03 541 22 34', noPO: false, type: 'klant' },
  { id: 'k8', name: 'JONCKHEERE', address: 'Spinnerijstraat 7, 8800 Roeselare', vat: 'BE 0405.117.299', terms: 30, contact: 'F. Jonckheere', phone: '051 23 45 67', email: 'info@jonckheere.be', mobile: '', fax: '', noPO: false, type: 'klant' },
  // Voorbeelden van andere types — voor demo klant_type filter
  { id: 'l1', name: 'ATLAS COPCO', address: 'Boomsesteenweg 957, 2610 Wilrijk', vat: 'BE 0403.992.060', terms: 30, contact: 'Inkoop', phone: '03 870 44 44', email: 'verkoop@atlascopco.com', mobile: '', fax: '', noPO: false, type: 'leverancier' },
  { id: 'l2', name: 'AVEVE LANDBOUW', address: 'Aarschotsesteenweg 84, 3012 Leuven', vat: 'BE 0427.260.272', terms: 30, contact: 'P. Daniels', phone: '016 23 89 89', email: 'orders@aveve.be', mobile: '', fax: '', noPO: false, type: 'leverancier' },
  { id: 'a1', name: 'A2D Architecten', address: 'Sint-Pietersnieuwstraat 1, 9000 Gent', vat: 'BE 0476.123.456', terms: 30, contact: 'Lieven De Pauw', phone: '09 225 67 89', email: 'info@a2darchitecten.be', mobile: '', fax: '', noPO: false, type: 'architect' },
  { id: 'p1', name: 'BOUWGROEP DE WIT', address: 'Industriestraat 45, 8800 Roeselare', vat: 'BE 0789.456.123', terms: 30, contact: 'J. De Wit', phone: '051 33 22 11', email: 'j.dewit@bouwgroepdewit.be', mobile: '', fax: '', noPO: false, type: 'prospect' }
];

// Werven: klantId references seedKlanten.id. Werven represent specific projects/locations
// per klant. A klant can have multiple werven (e.g. ARTES DEPRET has 2, D E C has 6).
// `omschrijving` = optional project descriptor (e.g. "Onderhoud patrimonium 543",
// "Zeebrugge kaaimuur boudewijnkanaal", "Antwerpen", "Brugge").
// `startDate` = when werf was opened. `endDate` set when closed for soft-delete + reporting.
export const seedWerven = [
  // AVEVE AALTER
  { id: 'aveve-1', klantId: 'k1', omschrijving: 'Aalter', address: 'Aalter', status: 'open', startDate: '01/03/2026', endDate: null, assignments: [] },
  // AGRO ENERGIEK
  { id: 'agro-1', klantId: 'k2', omschrijving: 'Zomergem', address: 'Zomergem', status: 'open', startDate: '15/02/2026', endDate: null, assignments: [] },
  // BESIX
  { id: 'besix-1', klantId: 'k3', omschrijving: 'Winterdijk', address: 'Winterdijk', status: 'open', startDate: '20/01/2026', endDate: null, assignments: [] },
  // ASWEBO ROESELARE — multiple werven illustrated like real planning
  { id: 'aswebo-r-1', klantId: 'k4', omschrijving: 'Roeselare', address: 'Roeselare', status: 'open', startDate: '10/03/2026', endDate: null, assignments: [] },
  { id: 'aswebo-r-2', klantId: 'k4', omschrijving: 'Heist kaaimuur', address: 'Heist', status: 'open', startDate: '05/04/2026', endDate: null, assignments: [] },
  // ASWEBO ZEEBRUGGE
  { id: 'aswebo-z-1', klantId: 'k5', omschrijving: 'Zeebrugge', address: 'Zeebrugge', status: 'open', startDate: '01/04/2026', endDate: null, assignments: [] },
  // KESTELEYN Charles
  { id: 'kest-1', klantId: 'k6', omschrijving: 'Gent Ragnar laden', address: 'Gent', status: 'open', startDate: '15/03/2026', endDate: null, assignments: [] },
  // HYE — 2 werven
  { id: 'hye-1', klantId: 'k7', omschrijving: 'Antwerpen', address: 'Antwerpen', status: 'open', startDate: '01/02/2026', endDate: null, assignments: [] },
  { id: 'hye-2', klantId: 'k7', omschrijving: 'Onderhoud patrimonium 543', address: 'Brugge', status: 'open', startDate: '20/03/2026', endDate: null, assignments: [] },
  // JONCKHEERE
  { id: 'jonck-1', klantId: 'k8', omschrijving: 'Roeselare', address: 'Roeselare', status: 'open', startDate: '10/04/2026', endDate: null, assignments: [] }
];

export const seedWorkers = [
  { id: 'w1', name: 'DEBRUYCKER', type: 'employee', function: 'Bestuurder', hireDate: '15/03/2018', uurloon1: 24.50, uurloon2: 36.75, birthDate: '12/05/1985', address: 'Brugsesteenweg 12, 8377 Zuienkerke', identityCard: '590-0123456-87' },
  { id: 'w2', name: 'EECKLOO FREDERIK', type: 'employee', function: 'Bestuurder', hireDate: '01/06/2015', uurloon1: 26.00, uurloon2: 39.00, birthDate: '23/09/1980', address: 'Kerkstraat 45, 8377 Meetkerke', identityCard: '590-0987654-21' },
  { id: 'w3', name: 'INGELBRECHT BART', type: 'employee', function: 'Bestuurder', hireDate: '12/09/2011', uurloon1: 27.50, uurloon2: 41.25, birthDate: '07/11/1975', address: 'Dorpsstraat 8, 8200 Brugge', identityCard: '590-1122334-55' },
  { id: 'w4', name: 'DEMEULENAERE GINO', type: 'subcontractor', function: 'Bestuurder', hireDate: '20/01/2020', uurloon1: 52.00, uurloon2: 65.00, birthDate: '19/03/1982', address: 'Industrielaan 22, 8000 Brugge', identityCard: '590-2233445-66' },
  { id: 'w6', name: 'BOGAERT KRISTOF', type: 'employee', function: 'Bestuurder', hireDate: '07/11/2008', uurloon1: 28.75, uurloon2: 43.10, birthDate: '30/06/1978', address: 'Vissersweg 14, 8377 Zuienkerke', identityCard: '590-3344556-77' },
  { id: 'w7', name: 'KIMPE MANUEL', type: 'subcontractor', function: 'Bestuurder', hireDate: '14/02/2022', uurloon1: 48.50, uurloon2: 60.00, birthDate: '11/02/1990', address: 'Stationsplein 3, 8000 Brugge', identityCard: '590-4455667-88' },
  { id: 'w8', name: 'OA HAECK JAN', type: 'employee', function: 'Chauffeur', hireDate: '22/08/2016', uurloon1: 23.50, uurloon2: 35.25, birthDate: '25/08/1972', address: 'Polderdreef 7, 8377 Houtave', identityCard: '590-5566778-99' }
];

export const seedMachines = [
  { id: 'm1', code: 'Bobcat 3', group: 'Bobcat', description: 'Bobcat S150 skid steer loader', rate: 65, color: '#F59E0B', unit: 'uur', active: true },
  { id: 'm2', code: 'Atlas L 23', group: 'Bandenkraan', description: 'Atlas L 23 mobile crane', rate: 85, color: '#3B82F6', unit: 'uur', active: true },
  { id: 'm3', code: 'Sen 835.44', group: 'Bandenkraan', description: 'Sennebogen 835 wheel material handler', rate: 95, color: '#3B82F6', unit: 'uur', active: true },
  { id: 'm4', code: 'ZX210.08 WD', group: 'Bandenkraan', description: 'Hitachi ZX210 W-6 wheeled excavator', rate: 90, color: '#3B82F6', unit: 'uur', active: true },
  { id: 'm5', code: 'LR 160.22', group: 'Rupskraan', description: 'Liebherr LR 160 crawler crane', rate: 110, color: '#10B981', unit: 'uur', active: true },
  { id: 'm6', code: 'ZX140.13 WD', group: 'Bandenkraan', description: 'Hitachi ZX140 W-6 wheeled excavator', rate: 80, color: '#3B82F6', unit: 'uur', active: true },
  { id: 'm7', code: 'Volvo A30F', group: 'Dumper', description: 'Volvo A30F articulated dump truck', rate: 95, color: '#EF4444', unit: 'uur', active: true },
  { id: 'm8', code: 'Bobcat 9', group: 'Bobcat', description: 'Bobcat S590 skid steer loader', rate: 70, color: '#F59E0B', unit: 'uur', active: true },
  { id: 'm9', code: 'ZX130.200 Amfibi', group: 'Rupskraan', description: 'Hitachi ZX130 amphibious excavator', rate: 130, color: '#10B981', unit: 'uur', active: true },
  { id: 'm10', code: 'Kramer Fiat 1', group: 'Bandenlader', description: 'Kramer wheel loader', rate: 75, color: '#8B5CF6', unit: 'uur', active: true },
  { id: 'm11', code: 'Dieplader 4as1', group: 'Dieplader', description: '4-axle low loader trailer', rate: 60, color: '#6B7280', unit: 'uur', active: true },
  { id: 'm12', code: 'MAN 8x8', group: 'Vrachtwagens', description: 'MAN 8x8 heavy haul truck', rate: 85, color: '#EC4899', unit: 'uur', active: true }
];

// Werkbon entries also serve as the Uurrooster source data.
// fiche = internal/payroll hours, bon = billable hours to klant.
// For subcontractor work, incomingInvoiceId tracks whether the OA has invoiced D&V yet.
export const seedWerkbonnen = [
  // AGRO ENERGIEK Zomergem — recurring work
  { id: 'wb-1001', nr: 431720, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '14/04/2026', fiche: 8.5, bon: 8.5, rate: 95, status: 'approved', nota: '', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1002', nr: 431721, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '15/04/2026', fiche: 8.0, bon: 8.0, rate: 95, status: 'approved', nota: '', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1003', nr: 431722, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat 9', date: '15/04/2026', fiche: 7.5, bon: 7.5, rate: 70, status: 'approved', nota: 'TURF — naakte verhuur, klant bestuurt', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1004', nr: 431723, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat 9', date: '28/04/2026', fiche: 8.0, bon: 8.0, rate: 70, status: 'approved', nota: 'naakte verhuur', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },

  // BESIX Winterdijk — heavy recurring schedule
  { id: 'wb-1010', nr: 431730, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'ZX210.08 WD', date: '01/04/2026', fiche: 7.5, bon: 7.5, rate: 90, status: 'approved', nota: 'Vandammesluis Vo', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1011', nr: 431731, klant: 'BESIX', werf: 'Winterdijk', worker: 'KIMPE MANUEL', machine: 'ZX210.08 WD', date: '02/04/2026', fiche: 7.5, bon: 7.5, rate: 90, status: 'approved', nota: 'Vandammesluis Vo', incomingInvoiceId: 'oa-inv-001', signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1012', nr: 431732, klant: 'BESIX', werf: 'Winterdijk', worker: 'OA HAECK JAN', machine: 'cont', date: '02/04/2026', fiche: 2.25, bon: 6.0, rate: 75, status: 'approved', nota: 'Argex ophalen', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1013', nr: 431733, klant: 'BESIX', werf: 'Winterdijk', worker: 'KIMPE MANUEL', machine: 'ZX140.13 WD', date: '16/04/2026', fiche: 8.0, bon: 8.0, rate: 80, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1014', nr: 431734, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'ZX140.13 WD', date: '17/04/2026', fiche: 8.0, bon: 8.0, rate: 80, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1015', nr: 431735, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '20/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1016', nr: 431736, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '22/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1017', nr: 431737, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '27/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1018', nr: 431738, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'MAN 8x8', date: '28/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: 'Winterdijk', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },

  // ASWEBO Roeselare
  { id: 'wb-1020', nr: 431740, klant: 'ASWEBO ROESELARE', werf: 'Roeselare', worker: 'INGELBRECHT BART', machine: 'Atlas L 23', date: '08/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: '', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1021', nr: 431741, klant: 'ASWEBO ROESELARE', werf: 'Roeselare', worker: 'INGELBRECHT BART', machine: 'Atlas L 23', date: '09/04/2026', fiche: 8.0, bon: 8.0, rate: 85, status: 'approved', nota: '', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },

  // HYE — subcontractor (DEMEULENAERE GINO) — invoice missing!
  { id: 'wb-1030', nr: 431750, klant: 'HYE', werf: 'Antwerpen', worker: 'DEMEULENAERE GINO', machine: 'LR 160.22', date: '06/04/2026', fiche: 8.5, bon: 8.5, rate: 110, status: 'approved', nota: 'kraan rups', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1031', nr: 431751, klant: 'HYE', werf: 'Antwerpen', worker: 'DEMEULENAERE GINO', machine: 'LR 160.22', date: '07/04/2026', fiche: 9.0, bon: 9.0, rate: 110, status: 'approved', nota: 'kraan rups', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1032', nr: 431752, klant: 'HYE', werf: 'Antwerpen', worker: 'DEMEULENAERE GINO', machine: 'LR 160.22', date: '08/04/2026', fiche: 8.0, bon: 8.0, rate: 110, status: 'approved', nota: '', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },

  // KESTELEYN — DEMEULENAERE GINO again — earlier invoice already received
  { id: 'wb-1040', nr: 431760, klant: 'KESTELEYN Charles', werf: 'Gent', worker: 'DEMEULENAERE GINO', machine: 'Sen 835.44', date: '03/04/2026', fiche: 8.0, bon: 8.0, rate: 95, status: 'approved', nota: 'Gent', incomingInvoiceId: 'oa-inv-002', signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },

  // AVEVE AALTER
  { id: 'wb-1050', nr: 431770, klant: 'AVEVE AALTER', werf: 'Aalter', worker: 'DEBRUYCKER', machine: 'Bobcat 3', date: '13/04/2026', fiche: 8.0, bon: 8.0, rate: 65, status: 'approved', nota: '', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1051', nr: 431771, klant: 'AVEVE AALTER', werf: 'Aalter', worker: 'INGELBRECHT BART', machine: 'Atlas L 23', date: '13/04/2026', fiche: 4.0, bon: 4.0, rate: 85, status: 'approved', nota: 'VM', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },
  { id: 'wb-1052', nr: 431772, klant: 'JONCKHEERE', werf: 'Roeselare', worker: 'ingelbrecht bart', machine: 'Atlas L 23', date: '13/04/2026', fiche: 4.0, bon: 4.0, rate: 85, status: 'approved', nota: 'NM', incomingInvoiceId: null, signedUrl: 'https://glwd-24.github.io/dmvh-mvp/sample-bon.html' },

  // ⚠ ONTBREKENDE WERKBONNEN — 'unknown' status, no signed URL, >2 days old → trigger banner + reminders
  { id: 'wb-1060', nr: 0, klant: 'BESIX', werf: 'Winterdijk', worker: 'BOGAERT KRISTOF', machine: 'ZX140.13 WD', date: '29/04/2026', fiche: 8.0, bon: 8.0, rate: 80, status: 'unknown', nota: 'Bon ontbreekt — operator vergat te tekenen', incomingInvoiceId: null, signedUrl: null },
  { id: 'wb-1061', nr: 0, klant: 'HYE', werf: 'Antwerpen', worker: 'DEMEULENAERE GINO', machine: 'LR 160.22', date: '30/04/2026', fiche: 8.5, bon: 8.5, rate: 110, status: 'unknown', nota: 'Bon ontbreekt', incomingInvoiceId: null, signedUrl: null }
];

// Tracks subcontractor (OA) incoming invoices
export const seedIncomingInvoices = [
  { id: 'oa-inv-001', oaName: 'KIMPE MANUEL', invoiceNr: 'KM-2026-04-12', dateReceived: '15/04/2026', amount: 675.00, status: 'received' },
  { id: 'oa-inv-002', oaName: 'DEMEULENAERE GINO', invoiceNr: 'DEG-26-074', dateReceived: '10/04/2026', amount: 760.00, status: 'paid' }
];

export const machineGroups = ['Bandenkraan', 'Bandenlader', 'Bobcat', 'Borstelmachine', 'Dieplader', 'Dumper', 'Minigraafmachine', 'Rupskraan', 'Tractor', 'Vrachtwagens'];
export const workerFunctions = ['Bestuurder', 'Arbeider', 'Chauffeur', 'Voorman', 'Magazijn'];

// USEIT2000 lookup tables — ported from original Access database
export const klantTypes = [
  { value: 'klant', label: 'Klant', color: 'blue' },
  { value: 'leverancier', label: 'Leverancier', color: 'amber' },
  { value: 'prospect', label: 'Prospect', color: 'slate' },
  { value: 'architect', label: 'Architect', color: 'purple' },
  { value: 'prive', label: 'Privé', color: 'pink' }
];

export const eenheden = [
  { value: 'uur', label: 'Uur' },
  { value: 'dag', label: 'Dag' },
  { value: 'halve_dag', label: 'Halve dag' },
  { value: 'm3', label: 'm³' },
  { value: 'ton', label: 'Ton' },
  { value: 'stuk', label: 'Stuk' },
  { value: 'forfait', label: 'Forfait' },
  { value: 'km', label: 'Kilometer' }
];

export const btwTarieven = [
  { value: 0, label: '0% — Vrijgesteld' },
  { value: 6, label: '6% — Verlaagd' },
  { value: 12, label: '12% — Verlaagd' },
  { value: 21, label: '21% — Standaard' }
];

// Bedrijfsgegevens — geleest uit USEIT2000 Bedrijfsgegevens-tabel
// In productie wordt dit instelbaar via het Instellingen-scherm
export const seedBedrijfsgegevens = {
  naam: 'N.V. Demaecker — Van Haecke',
  adres: 'Dorpsweg 35-37',
  postcode: '8377',
  gemeente: 'Meetkerke - Zuienkerke',
  land: 'België',
  btwNr: 'BE 0420.343.659',
  hrNr: 'Brugge 53.863',
  registratienr: '0420.343.659.05.01.11',
  telefoon: '050 31 63 27',
  fax: '050 31 64 65',
  email: 'info@demaecker-vanhaecke.be',
  website: 'www.demaecker-vanhaecke.be',
  banknr1: { iban: 'BE85 1430 4108 6170', bic: 'GEBABEBB', bank: 'BNP Paribas Fortis' },
  banknr2: { iban: 'BE38 3800 1348 9438', bic: 'BBRUBEBB', bank: 'ING' },
  contactpersoon: 'Mathias Van Haecke',
  contactFunctie: 'Zaakvoerder',
  activiteiten: 'Grond- en waterbouwwerken — Tuinbouw — Overslag',
  betaaltermijnDefault: 30,
  btwTariefDefault: 21,
  factuurNummerStart: 'F2026-',
  offerteNummerStart: 'O2026-',
  logo: null
};

// Diensten / services — niet-machine items zoals manuren, vervoer, forfaits
// In USEIT2000 zaten deze in dezelfde Artikelen-tabel onder groep 'Manuren' of 'Overige'
// In de nieuwe app gescheiden voor duidelijkheid en afzonderlijk in Master Data zichtbaar
export const seedServices = [
  { id: 's1', code: 'MAN-01', name: 'Manuren standaard', description: 'Bestuurder uurloon basis', rate: 45, unit: 'uur', vat: 21, active: true },
  { id: 's2', code: 'MAN-02', name: 'Manuren overuren', description: 'Bestuurder met overuren', rate: 65, unit: 'uur', vat: 21, active: true },
  { id: 's3', code: 'TRP-01', name: 'Transport / verzet', description: 'Verzet machine naar werf', rate: 95, unit: 'forfait', vat: 21, active: true },
  { id: 's4', code: 'BEG-01', name: 'Voertuig begeleiding uitz. vervoer', description: 'Begeleidingsvoertuig uitzonderlijk vervoer', rate: 85, unit: 'uur', vat: 21, active: true },
  { id: 's5', code: 'KM-01', name: 'Kilometervergoeding', description: 'Verplaatsing buiten werf', rate: 0.65, unit: 'km', vat: 21, active: true }
];

// Artikelen — klein materieel dat extra meegegeven wordt naast de hoofdmachine
// Voorbeelden: GPS, trilplaat, buizen, slang. Verhuurd per dag of per stuk.
// In USEIT2000 zaten dit ook onder Artikelen tabel maar zonder eigen categorie.
export const artikelGroepen = [
  'GPS & meetapparatuur',
  'Hydraulische accessoires',
  'Buizen & slangen',
  'Trillers & stampers',
  'Kleinmaterieel',
  'Veiligheid'
];

export const seedArtikelen = [
  // GPS & meetapparatuur
  { id: 'art-1', code: 'GPS-01', name: 'GPS Trimble graafmachine', description: 'Trimble GCS900 GPS systeem voor graafmachine', group: 'GPS & meetapparatuur', rate: 85, unit: 'dag', active: true },
  { id: 'art-2', code: 'GPS-02', name: 'GPS Topcon dozer', description: 'Topcon 3D systeem voor bulldozer', group: 'GPS & meetapparatuur', rate: 95, unit: 'dag', active: true },
  { id: 'art-3', code: 'LASER-01', name: 'Laser rotatie', description: 'Topcon RL-H5A roterende laser', group: 'GPS & meetapparatuur', rate: 25, unit: 'dag', active: true },

  // Hydraulische accessoires
  { id: 'art-10', code: 'HYDR-01', name: 'Hydraulische hamer 80kg', description: 'Atlas Copco SB202 hydraulische hamer', group: 'Hydraulische accessoires', rate: 75, unit: 'dag', active: true },
  { id: 'art-11', code: 'HYDR-02', name: 'Hydraulische schaar', description: 'Sloopschaar voor metaal en beton', group: 'Hydraulische accessoires', rate: 95, unit: 'dag', active: true },
  { id: 'art-12', code: 'HYDR-03', name: 'Sorteergrijper', description: 'Hydraulische sorteergrijper', group: 'Hydraulische accessoires', rate: 65, unit: 'dag', active: true },

  // Buizen & slangen
  { id: 'art-20', code: 'BUIS-200', name: 'Buis Ø200 — 6m', description: 'PVC afvoerbuis 200mm × 6m', group: 'Buizen & slangen', rate: 12, unit: 'dag', active: true },
  { id: 'art-21', code: 'BUIS-300', name: 'Buis Ø300 — 6m', description: 'PVC afvoerbuis 300mm × 6m', group: 'Buizen & slangen', rate: 18, unit: 'dag', active: true },
  { id: 'art-22', code: 'SLANG-01', name: 'Slang hogedruk', description: 'Hogedruk persslang 50m', group: 'Buizen & slangen', rate: 22, unit: 'dag', active: true },

  // Trillers & stampers
  { id: 'art-30', code: 'TRIL-01', name: 'Trilplaat 100kg', description: 'Wacker DPU 4045 trilplaat', group: 'Trillers & stampers', rate: 35, unit: 'dag', active: true },
  { id: 'art-31', code: 'TRIL-02', name: 'Trilplaat 200kg', description: 'Wacker DPU 6055 zware trilplaat', group: 'Trillers & stampers', rate: 55, unit: 'dag', active: true },
  { id: 'art-32', code: 'STAMP-01', name: 'Trilstamper', description: 'Wacker BS50-2i trilstamper', group: 'Trillers & stampers', rate: 30, unit: 'dag', active: true },

  // Kleinmaterieel
  { id: 'art-40', code: 'GENER-01', name: 'Generator 5kVA', description: 'Honda EU65is generator', group: 'Kleinmaterieel', rate: 45, unit: 'dag', active: true },
  { id: 'art-41', code: 'POMP-01', name: 'Dompelpomp', description: 'Vuilwaterdompelpomp 1.5kW', group: 'Kleinmaterieel', rate: 28, unit: 'dag', active: true },
  { id: 'art-42', code: 'COMP-01', name: 'Compressor', description: 'Atlas Copco XAS47 compressor', group: 'Kleinmaterieel', rate: 65, unit: 'dag', active: true },

  // Veiligheid
  { id: 'art-50', code: 'VEIL-01', name: 'Werfbarriers (10st)', description: 'Set 10× werfbarriers met voet', group: 'Veiligheid', rate: 18, unit: 'dag', active: true },
  { id: 'art-51', code: 'VEIL-02', name: 'Verkeerslichten', description: 'Mobiele verkeerslichten op batterij', group: 'Veiligheid', rate: 95, unit: 'dag', active: true }
];


