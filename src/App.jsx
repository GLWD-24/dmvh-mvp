import React, { useState, useCallback, useEffect } from 'react';
import { seedKlanten, seedWerven, seedWorkers, seedMachines, seedWerkbonnen, seedIncomingInvoices, seedBedrijfsgegevens, seedServices, seedArtikelen, seedWerfleiders } from './data/seed.js';
import AppShell from './components/AppShell.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import BedrijfsgegevensTab from './components/BedrijfsgegevensTab.jsx';
import DienstenTab from './components/DienstenTab.jsx';
import ArtikelenTab from './components/ArtikelenTab.jsx';
import PlanningTab from './components/PlanningTab.jsx';
import InboxTab from './components/InboxTab.jsx';
import WerkbonDetailTab from './components/WerkbonDetailTab.jsx';
import FacturatieTab from './components/FacturatieTab.jsx';
import KlantenTab from './components/KlantenTab.jsx';
import WervenTab from './components/WervenTab.jsx';
import WerknemersTab from './components/WerknemersTab.jsx';
import WerfleidersTab from './components/WerfleidersTab.jsx';
import MachinesTab from './components/MachinesTab.jsx';
import UurroosterTab from './components/UurroosterTab.jsx';
import MobilePhone from './components/MobilePhone.jsx';
import Toast from './components/Toast.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import WerfleiderPortal from './components/WerfleiderPortal.jsx';

export default function App() {
  const [klanten, setKlanten] = useState(seedKlanten);
  const [werven, setWerven] = useState(seedWerven.map(w => ({ ...w, assignments: w.assignments || [] })));
  const [workers, setWorkers] = useState(seedWorkers);
  const [machines, setMachines] = useState(seedMachines);
  const [services, setServices] = useState(seedServices);
  const [artikelen, setArtikelen] = useState(seedArtikelen);
  const [werfleiders, setWerfleiders] = useState(seedWerfleiders);
  const [bedrijf, setBedrijf] = useState(seedBedrijfsgegevens);
  const [werkbonnen, setWerkbonnen] = useState(seedWerkbonnen);
  const [incomingInvoices] = useState(seedIncomingInvoices);
  const [proposals, setProposals] = useState([]);

  // Datum-state (gelift uit PlanningTab) — bepaalt welke assignments getoond worden.
  // assignmentsByDate is een map: { 'YYYY-MM-DD': { werfId: [assignment, ...] } }
  // Wanneer de gebruiker naar een andere dag navigeert, wordt eerst de huidige dag-assignments
  // opgeslagen, daarna worden de assignments van de nieuwe dag geladen (of leeg).
  const todayKey = (() => {
    const d = new Date(2026, 4, 4); // demo "today" = 4 mei 2026
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [currentDateKey, setCurrentDateKey] = useState(todayKey);
  const [assignmentsByDate, setAssignmentsByDate] = useState(() => {
    // Initialiseer history met de seed-assignments onder de "today" key,
    // zodat ze niet verloren gaan als de gebruiker naar een andere dag en terug navigeert.
    const initial = {};
    seedWerven.forEach(w => { initial[w.id] = w.assignments || []; });
    return { [todayKey]: initial };
  });

  // Wanneer de datum verandert: huidige werven.assignments wegschrijven naar history
  // onder de oude key, daarna currentDateKey aanpassen (de useEffect hieronder laadt
  // dan automatisch de assignments van de nieuwe dag, of maakt ze leeg).
  const handleDateChange = useCallback((newDate) => {
    const newKey = dateKey(newDate);
    if (newKey === currentDateKey) return;
    // Snapshot de huidige werven.assignments onder de huidige (oude) key
    const snapshot = {};
    werven.forEach(w => { snapshot[w.id] = w.assignments || []; });
    setAssignmentsByDate(prev => ({ ...prev, [currentDateKey]: snapshot }));
    setCurrentDateKey(newKey);
  }, [currentDateKey, werven]);

  // Effect-vrije laad-logica: wanneer currentDateKey verandert, herlaadt werven.assignments
  // vanuit assignmentsByDate. Omdat we geen useEffect willen voor deze MVP, doen we de laad-actie
  // direct in handleDateChange via een tweede setter-callback die op de meest recente assignmentsByDate kijkt.
  useEffect(() => {
    setWerven(prev => prev.map(w => {
      const stored = assignmentsByDate[currentDateKey];
      if (stored && stored[w.id] !== undefined) {
        return { ...w, assignments: stored[w.id] };
      }
      // Geen entry voor deze datum → lege planning
      return { ...w, assignments: [] };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDateKey]);

  // Decorate werven with klant name from klanten lookup so components don't need refactoring
  const klantenById = klanten.reduce((acc, k) => { acc[k.id] = k; return acc; }, {});
  const decoratedWerven = werven.map(w => ({
    ...w,
    klant: klantenById[w.klantId]?.name || w.klant || '—'
  }));
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState({ text: 'Ready', kind: 'info' });
  const [mobile, setMobile] = useState({ screen: 'today', currentWerkbon: null });
  const [showMobile, setShowMobile] = useState(false);

  // Welke werkbon-detail open staat (nul = geen)
  const [selectedWerkbonId, setSelectedWerkbonId] = useState(null);

  // Hash-routing voor deelbare links naar bonnen: #werkbon/{id}
  // Werkt voor admin (intern), werfleider (eigen tab) en publieke read-only links.
  useEffect(() => {
    const checkHash = () => {
      const m = window.location.hash.match(/^#werkbon\/([\w-]+)/);
      if (m) {
        setSelectedWerkbonId(m[1]);
        setTab('werkbonDetail');
      } else if (window.location.hash === '#werfleider') {
        setTab('werfleiderLogin');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const openWerkbonDetail = (id) => {
    setSelectedWerkbonId(id);
    setTab('werkbonDetail');
    window.location.hash = `werkbon/${id}`;
  };
  const closeWerkbonDetail = () => {
    setSelectedWerkbonId(null);
    setTab('inbox');
    if (window.location.hash.startsWith('#werkbon/')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleUpdateWerkbon = (id, patch) => {
    setWerkbonnen(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
    showToast('Werkbon bijgewerkt');
  };

  // ========== AUTH (kantoor / admin) ==========
  // currentUser: null = niet ingelogd | { role, name, email, loginAt, lastActivity }
  // Sessie wordt bewaard in localStorage. Geldig zolang lastActivity binnen ADMIN_SESSION_MS.
  const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000; // 8 uur
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('dmvh.currentUser');
      if (!raw) return null;
      const u = JSON.parse(raw);
      if (!u || !u.role) return null;
      // Sessie verlopen?
      if (u.role === 'admin') {
        const last = u.lastActivity || u.loginAt || 0;
        if (Date.now() - last > ADMIN_SESSION_MS) {
          localStorage.removeItem('dmvh.currentUser');
          return null;
        }
      }
      return u;
    } catch {
      return null;
    }
  });

  // Persist currentUser in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dmvh.currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dmvh.currentUser');
    }
  }, [currentUser]);

  // Activity tracker — bij elke klik/keystroke vernieuw lastActivity (alleen voor admin)
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const refresh = () => {
      setCurrentUser(u => u ? { ...u, lastActivity: Date.now() } : u);
    };
    // Throttle: max 1x per minuut updaten om setState-spam te vermijden
    let last = 0;
    const handler = () => {
      const now = Date.now();
      if (now - last > 60000) {
        last = now;
        refresh();
      }
    };
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  // Auto-logout check elke minuut voor admins
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const interval = setInterval(() => {
      const last = currentUser.lastActivity || currentUser.loginAt || 0;
      if (Date.now() - last > ADMIN_SESSION_MS) {
        setCurrentUser(null);
        showToast('Sessie verlopen — meld opnieuw aan', 'warn');
      }
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // ========== WERKNEMER AUTH (telefoon, PIN-based) ==========
  // loggedInWorkerId blijft permanent bewaard in localStorage tot expliciete logout.
  // pinAttempts/pinBlocked staan op de werknemer-record zelf (zie seedWorkers).
  const [loggedInWorkerId, setLoggedInWorkerId] = useState(() => {
    try {
      return localStorage.getItem('dmvh.workerId') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (loggedInWorkerId) {
      localStorage.setItem('dmvh.workerId', loggedInWorkerId);
    } else {
      localStorage.removeItem('dmvh.workerId');
    }
  }, [loggedInWorkerId]);

  // PIN poging: { ok, blocked, attemptsLeft }. Bij 5x fout → pinBlocked = true.
  const handlePinAttempt = (workerId, pin) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return { ok: false, blocked: false, attemptsLeft: 0 };
    if (worker.pinBlocked) return { ok: false, blocked: true, attemptsLeft: 0 };

    if (worker.pin === pin) {
      // Geslaagd → reset counter, log in
      setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, pinAttempts: 0 } : w));
      setLoggedInWorkerId(workerId);
      // Init mobile state op "today"
      setMobile({ screen: 'today', currentWerkbon: null });
      return { ok: true, blocked: false, attemptsLeft: 5 };
    }

    // Mislukt → tel poging op
    const newAttempts = (worker.pinAttempts || 0) + 1;
    const willBlock = newAttempts >= 5;
    setWorkers(prev => prev.map(w => w.id === workerId
      ? { ...w, pinAttempts: newAttempts, pinBlocked: willBlock }
      : w
    ));
    if (willBlock) {
      showToast(`${worker.name} is geblokkeerd na 5 verkeerde pogingen`, 'warn');
    }
    return { ok: false, blocked: willBlock, attemptsLeft: Math.max(0, 5 - newAttempts) };
  };

  const handleWorkerLogout = () => {
    setLoggedInWorkerId(null);
    setMobile({ screen: 'today', currentWerkbon: null });
  };

  // ========== WERFLEIDER AUTH (werkbon goedkeuring via eigen login) ==========
  // Werfleider logt in via /werfleider URL-tab. Hash-route based: window.location.hash = '#werfleider'
  // De werfleider ziet enkel werkbonnen van werven waar hij/zij aangewezen is.
  const [loggedInWerfleiderId, setLoggedInWerfleiderId] = useState(() => {
    try { return localStorage.getItem('dmvh.werfleiderId') || null; } catch { return null; }
  });
  useEffect(() => {
    if (loggedInWerfleiderId) {
      localStorage.setItem('dmvh.werfleiderId', loggedInWerfleiderId);
    } else {
      localStorage.removeItem('dmvh.werfleiderId');
    }
  }, [loggedInWerfleiderId]);

  const handleWerfleiderPinAttempt = (werfleiderId, pin) => {
    const wl = werfleiders.find(w => w.id === werfleiderId);
    if (!wl) return { ok: false, blocked: false, attemptsLeft: 0 };
    if (wl.pinBlocked) return { ok: false, blocked: true, attemptsLeft: 0 };
    if (wl.pin === pin) {
      setWerfleiders(prev => prev.map(w => w.id === werfleiderId ? { ...w, pinAttempts: 0 } : w));
      setLoggedInWerfleiderId(werfleiderId);
      return { ok: true, blocked: false, attemptsLeft: 5 };
    }
    const newAttempts = (wl.pinAttempts || 0) + 1;
    const willBlock = newAttempts >= 5;
    setWerfleiders(prev => prev.map(w => w.id === werfleiderId
      ? { ...w, pinAttempts: newAttempts, pinBlocked: willBlock }
      : w
    ));
    if (willBlock) showToast(`${wl.name} is geblokkeerd na 5 verkeerde pogingen`, 'warn');
    return { ok: false, blocked: willBlock, attemptsLeft: Math.max(0, 5 - newAttempts) };
  };

  const handleWerfleiderLogout = () => setLoggedInWerfleiderId(null);

  // Werfleider keurt een werkbon goed of af
  const handleWerfleiderApprove = (werkbonId, decision) => {
    setWerkbonnen(prev => prev.map(w => w.id === werkbonId
      ? { ...w, status: decision === 'approve' ? 'approved' : 'rejected', werfleiderApprovedBy: loggedInWerfleiderId, werfleiderApprovedAt: Date.now() }
      : w
    ));
    showToast(decision === 'approve' ? 'Werkbon goedgekeurd' : 'Werkbon afgewezen');
  };

  // Werfleider CRUD
  const werfleiderAdd = (data) => {
    const newWl = {
      id: 'wl-' + Date.now(),
      pin: String(Math.floor(100000 + Math.random() * 900000)),
      pinAttempts: 0,
      pinBlocked: false,
      ...data
    };
    setWerfleiders(prev => [...prev, newWl]);
    showToast('Werfleider toegevoegd');
  };
  const werfleiderSave = (id, patch) => {
    setWerfleiders(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
    showToast('Werfleider opgeslagen');
  };
  const werfleiderDelete = (id) => {
    setWerfleiders(prev => prev.filter(w => w.id !== id));
    setWerven(prev => prev.map(w => w.werfleiderId === id ? { ...w, werfleiderId: null } : w));
    showToast('Werfleider verwijderd', 'warn');
  };
  const werfleiderResetPin = (id) => {
    setWerfleiders(prev => prev.map(w => w.id === id
      ? { ...w, pinAttempts: 0, pinBlocked: false } : w));
    showToast('Werfleider gedeblokkeerd');
  };
  const werfleiderSetPin = (id, newPin) => {
    if (!/^\d{6}$/.test(newPin)) {
      showToast('PIN moet 6 cijfers zijn', 'warn');
      return false;
    }
    setWerfleiders(prev => prev.map(w => w.id === id
      ? { ...w, pin: newPin, pinAttempts: 0, pinBlocked: false } : w));
    showToast('Nieuwe PIN ingesteld');
    return true;
  };

  // Beheerder-functie: deblokkeer een werknemer + reset PIN-pogingen
  const handleResetWorkerPin = (workerId) => {
    setWorkers(prev => prev.map(w => w.id === workerId
      ? { ...w, pinAttempts: 0, pinBlocked: false }
      : w
    ));
    showToast('Werknemer gedeblokkeerd');
  };

  // Beheerder-functie: nieuwe PIN instellen voor een werknemer
  const handleSetWorkerPin = (workerId, newPin) => {
    if (!/^\d{6}$/.test(newPin)) {
      showToast('PIN moet 6 cijfers zijn', 'warn');
      return false;
    }
    setWorkers(prev => prev.map(w => w.id === workerId
      ? { ...w, pin: newPin, pinAttempts: 0, pinBlocked: false }
      : w
    ));
    showToast('Nieuwe PIN ingesteld');
    return true;
  };

  const handleLogin = (user) => {
    setCurrentUser({ ...user, lastActivity: Date.now() });
  };
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 2400);
  };

  const handleAssign = useCallback((werfId, kind, id, instanceKey) => {
    setWerven(prev => prev.map(w => {
      if (w.id !== werfId) return w;
      let last = w.assignments[w.assignments.length - 1];
      // Last assignment is "open" if missing one slot, OR if it's a HEMZELF-machine combo and a worker is being dropped
      const isHemzelfReplacement = last && kind === 'worker' && last.workerId === 'HEMZELF';
      const lastIncomplete = last && (
        (last.workerId && !last.machineId) ||
        (!last.workerId && last.machineId) ||
        isHemzelfReplacement
      );

      if (lastIncomplete) {
        const updated = w.assignments.map(a => {
          if (a !== last) return a;
          if (kind === 'worker') {
            return { ...a, workerId: id, instanceKey: instanceKey || 'main' };
          }
          return { ...a, machineId: id };
        });
        return { ...w, assignments: updated };
      }

      // Create new assignment
      const newAssignment = {
        id: 'a' + Date.now() + Math.random(),
        workerId: null,
        machineId: null,
        half: 'full',
        hours: 8,
        instanceKey: instanceKey || 'main'
      };
      if (kind === 'worker') {
        newAssignment.workerId = id;
      } else if (kind === 'machine') {
        // Solo machine drop = naakte verhuur (HEMZELF, OA = 0)
        newAssignment.workerId = 'HEMZELF';
        newAssignment.machineId = id;
      }
      return { ...w, assignments: [...w.assignments, newAssignment] };
    }));
    const target = decoratedWerven.find(w => w.id === werfId);
    if (target) {
      showToast(kind === 'machine' && !target.assignments.length
        ? `Naakte verhuur aan ${target.klant} (HEMZELF)`
        : 'Toegewezen aan ' + target.klant);
    }
  }, [werven]);

  const handleRemove = useCallback((aid) => {
    setWerven(prev => prev.map(w => ({ ...w, assignments: w.assignments.filter(a => a.id !== aid) })));
  }, []);

  const handleDuplicate = useCallback((workerId) => {
    setWorkers(prev => prev.map(w =>
      w.id === workerId ? { ...w, duplicates: (w.duplicates || 0) + 1 } : w
    ));
    showToast('Dubbele werknemer toegevoegd aan pool');
  }, []);

  const handleUpdateAssignment = useCallback((aid, patch) => {
    setWerven(prev => prev.map(w => ({
      ...w,
      assignments: w.assignments.map(a => a.id === aid ? { ...a, ...patch } : a)
    })));
  }, []);

  const handleUpdateWerf = useCallback((werfId, patch) => {
    setWerven(prev => prev.map(w => w.id === werfId ? { ...w, ...patch } : w));
  }, []);

  // Kopieer hele dagplanning naar de volgende dag.
  // Snapshot huidige werven.assignments → assignmentsByDate[nextDateKey]
  const handleCopyDay = useCallback((sourceDate) => {
    const next = new Date(sourceDate);
    next.setDate(next.getDate() + 1);
    const nextKey = dateKey(next);
    setAssignmentsByDate(prev => {
      const snapshot = {};
      werven.forEach(w => {
        // Deep-clone assignments en geef nieuwe ids zodat ze losstaan van vandaag
        snapshot[w.id] = (w.assignments || []).map(a => ({
          ...a,
          id: 'a' + Date.now() + Math.random()
        }));
      });
      return { ...prev, [nextKey]: snapshot };
    });
    const dStr = `${String(next.getDate()).padStart(2, '0')}/${String(next.getMonth() + 1).padStart(2, '0')}/${next.getFullYear()}`;
    showToast(`Planning gekopieerd naar ${dStr}`);
  }, [werven]);

  const handleAddWerf = useCallback((data) => {
    const today = new Date(2026, 4, 4);
    const startStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const newWerf = {
      id: 'w-' + Date.now(),
      klantId: data.klantId,
      omschrijving: data.omschrijving,
      address: data.address,
      status: 'open',
      startDate: startStr,
      endDate: null,
      assignments: []
    };
    setWerven(prev => [...prev, newWerf]);
    showToast('Werf toegevoegd');
  }, []);

  const handleAddWorker = useCallback((data) => {
    const today = new Date(2026, 4, 4);
    const hireStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const newWorker = {
      id: 'w-' + Date.now(),
      hireDate: hireStr,
      endDate: null,
      ...data
    };
    setWorkers(prev => [...prev, newWorker]);
    showToast(`${data.type === 'subcontractor' ? 'Onderaannemer' : 'Werknemer'} toegevoegd`);
  }, []);

  const handleAddMachineFromPlanning = useCallback((data) => {
    const newMachine = {
      id: 'm-' + Date.now(),
      ...data
    };
    setMachines(prev => [...prev, newMachine]);
    showToast('Machine toegevoegd');
  }, []);

  // Daily pool: which werven/workers/machines are on today's planning view.
  // Default: include everything that's not closed (so the demo has data to show).
  const [dailyPool, setDailyPool] = useState({
    werven: new Set(seedWerven.filter(w => !w.endDate).map(w => w.id)),
    workers: new Set(seedWorkers.filter(w => !w.endDate).map(w => w.id)),
    machines: new Set(seedMachines.filter(m => !m.endDate).map(m => m.id)),
    artikelen: new Set(seedArtikelen.filter(a => a.active !== false).slice(0, 8).map(a => a.id))
  });

  const handleAddToPool = useCallback((kind, ids) => {
    setDailyPool(prev => ({ ...prev, [kind]: new Set(ids) }));
    showToast(`Dagplanning bijgewerkt`);
  }, []);

  const handleRemoveFromPool = useCallback((kind, id) => {
    setDailyPool(prev => {
      const next = new Set(prev[kind]);
      next.delete(id);
      return { ...prev, [kind]: next };
    });

    // Also clear assignments referencing the removed item from werven
    if (kind === 'workers') {
      setWerven(prev => prev.map(w => ({
        ...w,
        assignments: w.assignments.filter(a => a.workerId !== id)
      })));
    } else if (kind === 'machines') {
      setWerven(prev => prev.map(w => ({
        ...w,
        assignments: w.assignments.filter(a => a.machineId !== id)
      })));
    }
    // For werven removal: keep assignments inside the werf (in case it's added back later)
    showToast('Uit dagplanning gehaald');
  }, []);

  // Create-from-planning handlers: create master data record + auto-add to dailyPool
  const handleCreateWerfFromPlanning = useCallback((data) => {
    const today = new Date(2026, 4, 4);
    const startStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const id = 'w-' + Date.now();
    const newWerf = {
      id,
      klantId: data.klantId,
      omschrijving: data.omschrijving,
      address: data.address,
      status: 'open',
      startDate: startStr,
      endDate: null,
      assignments: []
    };
    setWerven(prev => [...prev, newWerf]);
    setDailyPool(prev => ({ ...prev, werven: new Set([...prev.werven, id]) }));
    showToast('Werf aangemaakt en toegevoegd aan dagplanning');
  }, []);

  const handleCreateWorkerFromPlanning = useCallback((data) => {
    const today = new Date(2026, 4, 4);
    const hireStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const id = 'w-' + Date.now();
    const newWorker = {
      id,
      hireDate: hireStr,
      endDate: null,
      ...data
    };
    setWorkers(prev => [...prev, newWorker]);
    setDailyPool(prev => ({ ...prev, workers: new Set([...prev.workers, id]) }));
    showToast(`${data.type === 'subcontractor' ? 'Onderaannemer' : 'Werknemer'} aangemaakt en toegevoegd`);
  }, []);

  const handleCreateMachineFromPlanning = useCallback((data) => {
    const id = 'm-' + Date.now();
    const newMachine = {
      id,
      endDate: null,
      ...data
    };
    setMachines(prev => [...prev, newMachine]);
    setDailyPool(prev => ({ ...prev, machines: new Set([...prev.machines, id]) }));
    showToast('Machine aangemaakt en toegevoegd aan dagplanning');
  }, []);

  const handleSplit = useCallback((source, payload) => {
    // source: { sourceWerfId, sourceAssignmentId, workerId, machineId }
    // payload: { pmWerfId, amHours, pmHours, pmMachineId }
    setWerven(prev => prev.map(w => {
      // Mark source assignment as AM half with new hours
      if (w.id === source.sourceWerfId) {
        return {
          ...w,
          assignments: w.assignments.map(a =>
            a.id === source.sourceAssignmentId
              ? { ...a, half: 'am', hours: payload.amHours }
              : a
          )
        };
      }
      // Add a new PM assignment to the chosen pm werf
      if (w.id === payload.pmWerfId) {
        const pmAssignment = {
          id: 'a' + Date.now() + Math.random(),
          workerId: source.workerId,
          machineId: payload.pmMachineId,
          half: 'pm',
          hours: payload.pmHours
        };
        return { ...w, assignments: [...w.assignments, pmAssignment] };
      }
      return w;
    }));
    showToast('Werknemer gesplitst over 2 werven');
  }, []);

  // Werkbonnen
  const handleApprove = (id) => {
    setWerkbonnen(prev => prev.map(w => w.id === id ? { ...w, status: 'approved' } : w));
    const wb = werkbonnen.find(w => w.id === id);
    showToast('Werkbon #' + wb.nr + ' goedgekeurd');
    setStatus({ text: 'Goedgekeurd', kind: 'success' });
  };
  const handleReject = (id) => {
    setWerkbonnen(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
    showToast('Werkbon afgewezen', 'warn');
  };

  const handleWerkbonUpdate = (id, patch) => {
    setWerkbonnen(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
    showToast('Uren bijgewerkt');
  };

  // Proposals — voorstel tot facturatie lifecycle
  const proposalCreate = ({ klant, period, lines, subtotal }) => {
    const seq = proposals.length + 1;
    const nr = `V2026-${String(421 + seq).padStart(4, '0')}`;
    const newProposal = {
      id: 'p-' + Date.now(),
      nr,
      klant,
      period,
      subtotal,
      lines: lines.map(l => ({ ...l })),
      lineIds: lines.map(l => l.id),
      status: 'draft',
      createdDate: '04/05/2026',
      poNr: null,
      approveNote: null,
      rejectReason: null,
      rejectDate: null
    };
    setProposals(prev => [newProposal, ...prev]);
    showToast(`Voorstel ${nr} aangemaakt`);
    setStatus({ text: 'Voorstel klaar — verzend naar klant', kind: 'info' });
  };

  const proposalSend = (id) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'sent' } : p));
    showToast('Voorstel verzonden naar klant');
    setStatus({ text: 'In afwachting van klant', kind: 'warn' });
  };

  const proposalApprove = (id, { poNr, note, date }) => {
    setProposals(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'approved', poNr, approveNote: note, approveDate: date } : p
    ));
    showToast('Goedkeuring + PO geregistreerd', 'success');
    setStatus({ text: 'PO ontvangen — klaar voor facturatie', kind: 'success' });
  };

  const proposalReject = (id, { reason, date }) => {
    const proposal = proposals.find(p => p.id === id);
    setProposals(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'rejected', rejectReason: reason, rejectDate: date } : p
    ));
    // Mark linked werkbonnen as disputed
    if (proposal) {
      setWerkbonnen(prev => prev.map(w =>
        proposal.lineIds.includes(w.id) ? { ...w, disputed: true } : w
      ));
    }
    showToast('Afkeuring geregistreerd — werkbonnen disputed', 'warn');
    setStatus({ text: 'Voorstel afgekeurd', kind: 'warn' });
  };

  const proposalConvert = (id) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      const seq = prev.filter(x => x.status === 'invoiced' || x.status === 'paid').length + 1;
      const invoiceNr = `F2026-${String(720 + seq).padStart(4, '0')}`;
      return { ...p, status: 'invoiced', nr: invoiceNr, invoiceDate: '04/05/2026' };
    }));
    // Mark linked werkbonnen as invoiced
    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      setWerkbonnen(prev => prev.map(w =>
        proposal.lineIds.includes(w.id) ? { ...w, status: 'invoiced' } : w
      ));
    }
    showToast('Definitieve factuur gegenereerd');
    setStatus({ text: 'Factuur klaar voor verzending', kind: 'success' });
  };

  const proposalReopen = (id) => {
    const proposal = proposals.find(p => p.id === id);
    setProposals(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'draft', rejectReason: null, rejectDate: null } : p
    ));
    // Clear disputed flag on linked werkbonnen
    if (proposal) {
      setWerkbonnen(prev => prev.map(w =>
        proposal.lineIds.includes(w.id) ? { ...w, disputed: false } : w
      ));
    }
    showToast('Voorstel heropend — werkbonnen vrij');
  };

  // Klanten CRUD
  const klantSave = (id, patch) => {
    setKlanten(prev => prev.map(k => k.id === id ? { ...k, ...patch } : k));
    showToast('Klant opgeslagen');
  };
  const klantAdd = (newKlant) => {
    setKlanten(prev => [...prev, newKlant]);
    showToast('Nieuwe klant toegevoegd');
  };
  const klantDelete = (id) => {
    setKlanten(prev => prev.filter(k => k.id !== id));
    showToast('Klant verwijderd', 'warn');
  };

  // Werknemers CRUD
  const workerSave = (id, patch) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
    showToast('Werknemer opgeslagen');
  };
  const workerAdd = (newWorker) => {
    setWorkers(prev => [...prev, newWorker]);
    showToast('Nieuwe werknemer toegevoegd');
  };
  const workerDelete = (id) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    showToast('Werknemer verwijderd', 'warn');
  };

  // Machines CRUD
  const machineSave = (id, patch) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    showToast('Machine opgeslagen');
  };
  const machineAdd = (newMachine) => {
    setMachines(prev => [...prev, newMachine]);
    showToast('Nieuwe machine toegevoegd');
  };
  const machineDelete = (id) => {
    setMachines(prev => prev.filter(m => m.id !== id));
    showToast('Machine verwijderd', 'warn');
  };

  // Services / diensten CRUD (manuren, transport, etc.)
  const serviceSave = (id, patch) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    showToast('Dienst opgeslagen');
  };
  const serviceAdd = (newService) => {
    setServices(prev => [...prev, newService]);
    showToast('Nieuwe dienst toegevoegd');
  };
  const serviceDelete = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
    showToast('Dienst verwijderd', 'warn');
  };

  // Artikelen CRUD (GPS, buizen, trilplaten, etc.)
  const artikelSave = (id, patch) => {
    setArtikelen(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
    showToast('Artikel opgeslagen');
  };
  const artikelAdd = (newArtikel) => {
    setArtikelen(prev => [...prev, newArtikel]);
    showToast('Nieuw artikel toegevoegd');
  };
  const artikelDelete = (id) => {
    setArtikelen(prev => prev.filter(a => a.id !== id));
    showToast('Artikel verwijderd', 'warn');
  };

  // Bedrijfsgegevens (settings)
  const bedrijfSave = (newBedrijf) => {
    setBedrijf(newBedrijf);
    showToast('Bedrijfsgegevens opgeslagen');
  };

  // Werven CRUD (master data tab)
  const werfSave = (id, patch) => {
    setWerven(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
    showToast('Werf opgeslagen');
  };
  const werfAdd = (newWerf) => {
    const today = new Date(2026, 4, 4);
    const startStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const id = 'w-' + Date.now();
    const w = {
      id,
      status: 'open',
      startDate: startStr,
      endDate: null,
      assignments: [],
      ...newWerf
    };
    setWerven(prev => [...prev, w]);
    showToast('Nieuwe werf toegevoegd');
    return id;
  };
  const werfDelete = (id) => {
    setWerven(prev => prev.filter(w => w.id !== id));
    setDailyPool(prev => {
      const next = new Set(prev.werven);
      next.delete(id);
      return { ...prev, werven: next };
    });
    showToast('Werf verwijderd', 'warn');
  };

  // Mobile handlers
  // De werknemer kiest een werf op de today-tegels en krijgt een leeg bon-formulier.
  const mobileClockIn = (werf, machine, assignment) => {
    setMobile({
      screen: 'werkbon',
      currentWerkbon: {
        klant: werf.klant,
        werf: werf.omschrijving || werf.address,
        werfId: werf.id,
        assignmentId: assignment?.id || null,
        machine: machine?.code || '—',
        // Form fields — leeg bij start, werknemer vult ze in
        startStr: '',
        endStr: '',
        pauseMin: '',
        remarks: '',
        werfleiderAfwezig: false,
        opSign: false,
        werfleiderSign: false,
        hours: 0
      }
    });
  };
  const mobileSubmit = (wb, action) => {
    if (action === 'update') {
      setMobile(m => ({ ...m, currentWerkbon: wb }));
      return;
    }
    if (action === 'submit') {
      const newNr = 431723 + werkbonnen.length + 1;
      const loggedInWorker = workers.find(w => w.id === loggedInWorkerId);
      const workerName = loggedInWorker?.name || 'ONBEKEND';
      setWerkbonnen(prev => [...prev, {
        id: 'wb-' + Date.now(),
        nr: newNr,
        klant: wb.klant,
        werf: wb.werf,
        worker: workerName,
        machine: wb.machine,
        date: '04/05/2026',
        fiche: wb.hours,
        bon: wb.hours,
        rate: 85,
        status: 'submitted',
        nota: wb.remarks || '',
        startStr: wb.startStr,
        endStr: wb.endStr,
        pauseMin: wb.pauseMin,
        werfleiderAfwezig: !!wb.werfleiderAfwezig,
        incomingInvoiceId: null
      }]);
      setMobile({ screen: 'submitted', currentWerkbon: null });
      setStatus({ text: 'Werkbon ingediend', kind: 'success' });
    }
  };

  // Demo flow auto-scripts
  const runFlow = (n) => {
    if (n === 1) {
      setTab('planning');
      setWerven(prev => prev.map(w => {
        if (w.id === 'aveve-1') return { ...w, assignments: [{ id: 'a-d1', workerId: 'w1', machineId: 'm1' }] };
        if (w.id === 'agro-1') return { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] };
        return w;
      }));
      setStatus({ text: 'Planning opgeslagen — push verzonden', kind: 'success' });
      showToast('2 toewijzingen opgeslagen, mobile bijgewerkt');
    } else if (n === 2) {
      setWerven(prev => prev.map(w => w.id === 'agro-1' && w.assignments.length === 0
        ? { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] } : w));
      setMobile({ screen: 'today', currentWerkbon: null });
      setStatus({ text: 'Mobile actief', kind: 'info' });
      showToast('Open de telefoon rechts en doorloop de werkbon', 'info');
    } else if (n === 3) {
      setWerven(prev => prev.map(w => w.id === 'agro-1' && w.assignments.length === 0
        ? { ...w, assignments: [{ id: 'a-d2', workerId: 'w2', machineId: 'm3' }] } : w));
      setWerkbonnen(prev => prev.some(w => w.status === 'submitted')
        ? prev
        : [...prev, { id: 'wb-demo', nr: 431728, klant: 'AGRO ENERGIEK', werf: 'Zomergem', worker: 'EECKLOO FREDERIK', machine: 'Sen 835.44', date: '04/05/2026', fiche: 8.0, bon: 8.0, rate: 95, status: 'submitted', nota: '', incomingInvoiceId: null }]);
      setTab('inbox');
      setStatus({ text: '1 werkbon ter goedkeuring', kind: 'warn' });
    } else if (n === 4) {
      setTab('invoice');
      // Auto-create a proposal for AGRO ENERGIEK to demonstrate the flow
      const lines = werkbonnen.filter(w => w.klant === 'AGRO ENERGIEK' && w.status === 'approved' && !w.disputed);
      const subtotal = lines.reduce((s, l) => s + (l.bon || 0) * (l.rate || 0), 0);
      if (lines.length > 0 && !proposals.some(p => p.klant === 'AGRO ENERGIEK')) {
        proposalCreate({ klant: 'AGRO ENERGIEK', period: 'April 2026', lines, subtotal });
      }
      setStatus({ text: 'Voorstel aangemaakt — bekijk PDF, verzend, en verwerk PO', kind: 'info' });
    } else if (n === 5) {
      setTab('klanten');
      setStatus({ text: 'Wijzig velden en klik Opslaan', kind: 'info' });
    }
  };

  const submittedCount = werkbonnen.filter(w => w.status === 'submitted').length;

  const statusStyles = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warn: 'bg-amber-50 text-amber-700'
  };

  // Demo flow definitions for sidebar
  const demoFlowItems = [
    { label: 'Plan Monday', onClick: () => runFlow(1) },
    { label: 'Mobile werkbon', onClick: () => { setShowMobile(true); runFlow(2); } },
    { label: 'Approve werkbon', onClick: () => runFlow(3) },
    { label: 'Invoice PDF', onClick: () => runFlow(4) },
    { label: 'Edit klant', onClick: () => runFlow(5) }
  ];

  // Badges for sidebar items
  const badges = {
    inbox: submittedCount
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <DashboardTab
            klanten={klanten}
            werven={decoratedWerven}
            workers={workers}
            machines={machines}
            artikelen={artikelen}
            werkbonnen={werkbonnen}
            proposals={proposals}
            onNavigate={setTab}
          />
        );
      case 'planning':
        return (
          <PlanningTab
            werven={decoratedWerven} klanten={klanten} workers={workers} machines={machines}
            artikelen={artikelen}
            dailyPool={dailyPool}
            onAddToPool={handleAddToPool}
            onRemoveFromPool={handleRemoveFromPool}
            onAssign={handleAssign} onRemove={handleRemove} onSplit={handleSplit}
            onDuplicate={handleDuplicate}
            onUpdateAssignment={handleUpdateAssignment}
            onUpdateWerf={handleUpdateWerf}
            onCopyDay={handleCopyDay}
            currentDate={(() => { const [y, m, d] = currentDateKey.split('-').map(Number); return new Date(y, m - 1, d); })()}
            onDateChange={handleDateChange}
            onCreateWerf={handleCreateWerfFromPlanning}
            onCreateWorker={handleCreateWorkerFromPlanning}
            onCreateMachine={handleCreateMachineFromPlanning}
          />
        );
      case 'inbox':
        return <InboxTab werkbonnen={werkbonnen} onApprove={handleApprove} onReject={handleReject} onOpenDetail={openWerkbonDetail} />;
      case 'werkbonDetail':
        return (
          <WerkbonDetailTab
            werkbonId={selectedWerkbonId}
            werkbonnen={werkbonnen}
            onUpdateWerkbon={handleUpdateWerkbon}
            onApprove={handleApprove}
            onReject={handleReject}
            onBack={closeWerkbonDetail}
            mode="admin"
          />
        );;
      case 'uurrooster':
        return (
          <UurroosterTab
            werkbonnen={werkbonnen}
            workers={workers}
            machines={machines}
            klanten={klanten}
            incomingInvoices={incomingInvoices}
            onUpdate={handleWerkbonUpdate}
          />
        );
      case 'invoice':
        return (
          <FacturatieTab
            klanten={klanten}
            werkbonnen={werkbonnen}
            proposals={proposals}
            onCreate={proposalCreate}
            onSend={proposalSend}
            onApprove={proposalApprove}
            onReject={proposalReject}
            onConvertToInvoice={proposalConvert}
            onReopen={proposalReopen}
          />
        );
      case 'klanten':
        return <KlantenTab klanten={klanten} werven={werven} onSave={klantSave} onAdd={klantAdd} onDelete={klantDelete} />;
      case 'werven':
        return <WervenTab werven={werven} klanten={klanten} werfleiders={werfleiders} onSave={werfSave} onAdd={werfAdd} onDelete={werfDelete} />;
      case 'werfleiders':
        return <WerfleidersTab werfleiders={werfleiders} klanten={klanten} onSave={werfleiderSave} onAdd={werfleiderAdd} onDelete={werfleiderDelete} onResetPin={werfleiderResetPin} onSetPin={werfleiderSetPin} />;
      case 'werknemers':
        return <WerknemersTab workers={workers} onSave={workerSave} onAdd={workerAdd} onDelete={workerDelete} onResetPin={handleResetWorkerPin} onSetPin={handleSetWorkerPin} />;
      case 'machines':
        return <MachinesTab machines={machines} onSave={machineSave} onAdd={machineAdd} onDelete={machineDelete} />;
      case 'artikelen':
        return <ArtikelenTab artikelen={artikelen} onSave={artikelSave} onAdd={artikelAdd} onDelete={artikelDelete} />;
      case 'diensten':
        return <DienstenTab services={services} onSave={serviceSave} onAdd={serviceAdd} onDelete={serviceDelete} />;
      case 'bedrijf':
        return <BedrijfsgegevensTab bedrijf={bedrijf} onSave={bedrijfSave} />;
      default:
        return <div className="p-6 text-slate-400">Onbekend scherm</div>;
    }
  };

  // Detecteer of we op werfleider-route zijn
  const [isWerfleiderRoute, setIsWerfleiderRoute] = useState(() => window.location.hash === '#werfleider');
  useEffect(() => {
    const onHash = () => setIsWerfleiderRoute(window.location.hash === '#werfleider');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <>
      {/* Werfleider portaal — aparte route, eigen login + alleen bonnen-goedkeuren */}
      {isWerfleiderRoute ? (
        <WerfleiderPortal
          werfleiders={werfleiders}
          werven={decoratedWerven}
          werkbonnen={werkbonnen}
          loggedInWerfleiderId={loggedInWerfleiderId}
          onPinAttempt={handleWerfleiderPinAttempt}
          onLogout={handleWerfleiderLogout}
          onApprove={(id) => handleWerfleiderApprove(id, 'approve')}
          onReject={(id) => handleWerfleiderApprove(id, 'reject')}
        />
      ) : !currentUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
      <AppShell
        activeTab={tab}
        onTabChange={setTab}
        badges={badges}
        demoFlow={demoFlowItems}
        statusBadge={status.text !== 'Ready' ? { text: status.text, kind: status.kind } : null}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {renderContent()}
      </AppShell>
      )}

      {/* Mobile phone — verstopt achter demo, opent als overlay rechtsonder */}
      {showMobile && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 border-b border-slate-200">
            <span className="text-[10px] uppercase tracking-wider font-medium text-slate-600">Operator app — demo</span>
            <button
              onClick={() => setShowMobile(false)}
              className="text-slate-400 hover:text-slate-700 text-xs px-1.5"
              title="Sluiten"
            >
              ✕
            </button>
          </div>
          <MobilePhone
            state={mobile}
            werven={decoratedWerven} workers={workers} machines={machines}
            artikelen={artikelen}
            onClockIn={mobileClockIn}
            onSubmitWerkbon={mobileSubmit}
            onReset={() => setMobile({ screen: 'today', currentWerkbon: null })}
            loggedInWorkerId={loggedInWorkerId}
            onWorkerLogin={(id) => setLoggedInWorkerId(id)}
            onWorkerLogout={handleWorkerLogout}
            onPinAttempt={handlePinAttempt}
          />
        </div>
      )}

      <Toast message={toast?.message} kind={toast?.kind} />
    </>
  );
}
