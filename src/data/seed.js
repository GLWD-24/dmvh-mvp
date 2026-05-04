// Seed data drawn from the original USEIT2000 screenshots.
// Replace with real API calls when wiring the backend.

export const seedKlanten = [
  { name: 'AVEVE AALTER', address: 'Aalter', vat: 'BE 0420.343.659', terms: 30, contact: 'J. Maes' },
  { name: 'AGRO ENERGIEK', address: 'Zomergem', vat: 'BE 0451.221.118', terms: 30, contact: 'P. Verstraete' },
  { name: 'BESIX', address: 'Brussel', vat: 'BE 0407.573.196', terms: 60, contact: 'K. Bogaert' },
  { name: 'ASWEBO ROESELARE', address: 'Roeselare', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck' },
  { name: 'ASWEBO ZEEBRUGGE', address: 'Zeebrugge', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck' },
  { name: 'KESTELEYN Charles', address: 'Gent', vat: 'BE 0512.998.224', terms: 30, contact: 'C. Kesteleyn' },
  { name: 'HYE', address: 'Antwerpen', vat: 'BE 0404.882.001', terms: 45, contact: 'M. Hye' },
  { name: 'JONCKHEERE', address: 'Roeselare', vat: 'BE 0405.117.299', terms: 30, contact: 'F. Jonckheere' }
];

export const seedWerven = [
  { id: 'aveve', klant: 'AVEVE AALTER', address: 'Aalter', status: 'open' },
  { id: 'agro', klant: 'AGRO ENERGIEK', address: 'Zomergem', status: 'open' },
  { id: 'besix', klant: 'BESIX', address: 'Winterdijk', status: 'open' },
  { id: 'kest', klant: 'KESTELEYN Charles', address: 'Gent', status: 'open' },
  { id: 'aswebo-r', klant: 'ASWEBO ROESELARE', address: 'Roeselare', status: 'open' },
  { id: 'hye', klant: 'HYE', address: 'Antwerpen', status: 'open' }
];

export const seedWorkers = [
  { id: 'w1', name: 'DEBRUYCKER', type: 'employee', function: 'Bestuurder' },
  { id: 'w2', name: 'EECKLOO FREDERIK', type: 'employee', function: 'Bestuurder' },
  { id: 'w3', name: 'INGELBRECHT BART', type: 'employee', function: 'Bestuurder' },
  { id: 'w4', name: 'DEMEULENAERE GINO', type: 'subcontractor', function: 'Bestuurder' },
  { id: 'w5', name: 'HEMZELF', type: 'employee', function: 'Arbeider' },
  { id: 'w6', name: 'BOGAERT KRISTOF', type: 'employee', function: 'Bestuurder' },
  { id: 'w7', name: 'KIMPE MANUEL', type: 'employee', function: 'Bestuurder' },
  { id: 'w8', name: 'OA HAECK JAN', type: 'employee', function: 'Chauffeur' }
];

export const seedMachines = [
  { id: 'm1', code: 'Bobcat 3', group: 'Bobcat' },
  { id: 'm2', code: 'Atlas L 23', group: 'Bandenkraan' },
  { id: 'm3', code: 'Sen 835.44', group: 'Bandenkraan' },
  { id: 'm4', code: 'ZX210.08 WD', group: 'Bandenkraan' },
  { id: 'm5', code: 'LR 160.22', group: 'Rupskraan' },
  { id: 'm6', code: 'ZX140.13 WD', group: 'Bandenkraan' },
  { id: 'm7', code: 'Volvo A30F', group: 'Dumper' },
  { id: 'm8', code: 'Bobcat 9', group: 'Bobcat' },
  { id: 'm9', code: 'ZX130.200 Amfibi', group: 'Rupskraan' },
  { id: 'm10', code: 'Kramer Fiat 1', group: 'Bandenlader' },
  { id: 'm11', code: 'Dieplader 4as1', group: 'Dieplader' },
  { id: 'm12', code: 'MAN 8x8', group: 'Vrachtwagens' }
];

// A small history of approved werkbonnen so the invoice flow has data on day one.
export const seedWerkbonnen = [
  { id: 'wb-1001', nr: 431720, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '14/04/2026', hours: 8.5, rate: 85, status: 'approved' },
  { id: 'wb-1002', nr: 431721, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '15/04/2026', hours: 8.0, rate: 85, status: 'approved' },
  { id: 'wb-1003', nr: 431722, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat.Rups', date: '15/04/2026', hours: 7.5, rate: 75, status: 'approved' },
  { id: 'wb-1004', nr: 431723, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat.Rups', date: '28/04/2026', hours: 8.0, rate: 75, status: 'approved' }
];
