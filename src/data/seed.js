// Seed data drawn from the original USEIT2000 screenshots.
// Replace with real API calls when wiring the backend.

export const seedKlanten = [
  { id: 'k1', name: 'AVEVE AALTER', address: 'Markt 12, 9880 Aalter', vat: 'BE 0420.343.659', terms: 30, contact: 'J. Maes', phone: '09 374 12 34', email: 'j.maes@aveve-aalter.be', mobile: '0475 11 22 33', fax: '09 374 12 35' },
  { id: 'k2', name: 'AGRO ENERGIEK', address: 'Industrieweg 5, 9930 Zomergem', vat: 'BE 0451.221.118', terms: 30, contact: 'P. Verstraete', phone: '09 372 88 99', email: 'info@agroenergiek.be', mobile: '0496 55 44 33', fax: '' },
  { id: 'k3', name: 'BESIX', address: 'Avenue des Communautés 100, 1200 Brussel', vat: 'BE 0407.573.196', terms: 60, contact: 'K. Bogaert', phone: '02 402 62 11', email: 'k.bogaert@besix.com', mobile: '0477 88 99 00', fax: '02 402 62 12' },
  { id: 'k4', name: 'ASWEBO ROESELARE', address: 'Bruggesteenweg 145, 8800 Roeselare', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck', phone: '051 26 30 30', email: 'w.oosterlinck@aswebo.be', mobile: '0498 12 34 56', fax: '' },
  { id: 'k5', name: 'ASWEBO ZEEBRUGGE', address: 'Kustlaan 1, 8380 Zeebrugge', vat: 'BE 0406.661.452', terms: 45, contact: 'W. Oosterlinck', phone: '050 54 12 34', email: 'w.oosterlinck@aswebo.be', mobile: '0498 12 34 56', fax: '' },
  { id: 'k6', name: 'KESTELEYN Charles', address: 'Burgstraat 88, 9000 Gent', vat: 'BE 0512.998.224', terms: 30, contact: 'C. Kesteleyn', phone: '09 224 55 66', email: 'charles@kesteleyn.be', mobile: '0475 99 88 77', fax: '' },
  { id: 'k7', name: 'HYE', address: 'Noordlaan 22, 2030 Antwerpen', vat: 'BE 0404.882.001', terms: 45, contact: 'M. Hye', phone: '03 541 22 33', email: 'm.hye@hye.be', mobile: '0476 33 22 11', fax: '03 541 22 34' },
  { id: 'k8', name: 'JONCKHEERE', address: 'Spinnerijstraat 7, 8800 Roeselare', vat: 'BE 0405.117.299', terms: 30, contact: 'F. Jonckheere', phone: '051 23 45 67', email: 'info@jonckheere.be', mobile: '', fax: '' }
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
  { id: 'w1', name: 'DEBRUYCKER', type: 'employee', function: 'Bestuurder', hireDate: '15/03/2018', uurloon1: 24.50, uurloon2: 36.75 },
  { id: 'w2', name: 'EECKLOO FREDERIK', type: 'employee', function: 'Bestuurder', hireDate: '01/06/2015', uurloon1: 26.00, uurloon2: 39.00 },
  { id: 'w3', name: 'INGELBRECHT BART', type: 'employee', function: 'Bestuurder', hireDate: '12/09/2011', uurloon1: 27.50, uurloon2: 41.25 },
  { id: 'w4', name: 'DEMEULENAERE GINO', type: 'subcontractor', function: 'Bestuurder', hireDate: '20/01/2020', uurloon1: 0, uurloon2: 0 },
  { id: 'w5', name: 'HEMZELF', type: 'employee', function: 'Arbeider', hireDate: '03/05/2019', uurloon1: 22.00, uurloon2: 33.00 },
  { id: 'w6', name: 'BOGAERT KRISTOF', type: 'employee', function: 'Bestuurder', hireDate: '07/11/2008', uurloon1: 28.75, uurloon2: 43.10 },
  { id: 'w7', name: 'KIMPE MANUEL', type: 'subcontractor', function: 'Bestuurder', hireDate: '14/02/2022', uurloon1: 0, uurloon2: 0 },
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

// A small history of approved werkbonnen so the invoice flow has data on day one.
export const seedWerkbonnen = [
  { id: 'wb-1001', nr: 431720, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '14/04/2026', hours: 8.5, rate: 85, status: 'approved' },
  { id: 'wb-1002', nr: 431721, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '15/04/2026', hours: 8.0, rate: 85, status: 'approved' },
  { id: 'wb-1003', nr: 431722, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat.Rups', date: '15/04/2026', hours: 7.5, rate: 75, status: 'approved' },
  { id: 'wb-1004', nr: 431723, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'HEMZELF', machine: 'Bobcat.Rups', date: '28/04/2026', hours: 8.0, rate: 75, status: 'approved' }
];

export const machineGroups = ['Bandenkraan', 'Bandenlader', 'Bobcat', 'Borstelmachine', 'Dieplader', 'Dumper', 'Minigraafmachine', 'Rupskraan', 'Tractor', 'Vrachtwagens'];
export const workerFunctions = ['Bestuurder', 'Arbeider', 'Chauffeur', 'Voorman', 'Magazijn'];
