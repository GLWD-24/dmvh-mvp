# USEIT2026

Modern replacement for **USEIT2000**, the legacy Windows planning system used by **Demaecker & Vanhaecke** (Grond- en Waterbouwwerken — Zuienkerke-Meetkerke, BE).

This repo contains a **clickable MVP prototype** built with React + Vite + Tailwind. No backend yet — all state is in-memory and resets on reload. The goal is to demo the five core flows to the planner and field workers, gather feedback, and de-risk the build.

## Demo flows

The five buttons at the top of the UI auto-script each MVP scenario:

1. **Plan Monday 4 May 2026** — drag DEBRUYCKER + Bobcat 3 onto AVEVE AALTER, EECKLOO + Sen 835.44 onto AGRO ENERGIEK Zomergem
2. **Operator's day on mobile** — log in as EECKLOO, see assignment, fill werkbon, sign, submit
3. **Planner approves** the submitted werkbon
4. **Generate invoice PDF** from approved AGRO ENERGIEK werkbonnen for April 2026
5. **Edit master data** — change AVEVE AALTER's payment term

Drag-and-drop on the planner is real, both signatures use a real canvas pad, and the invoice preview is generated from the approved werkbonnen list.

## Run locally

Requires Node.js 18 or higher.

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── App.jsx              # Top-level state + tab orchestration
├── main.jsx             # React entrypoint
├── index.css            # Tailwind + global styles
├── data/
│   └── seed.js          # Klanten, werven, werknemers, machines, werkbonnen
└── components/
    ├── PlanningTab.jsx  # Drag-and-drop daily view
    ├── InboxTab.jsx     # Submitted werkbonnen approval queue
    ├── InvoiceTab.jsx   # Invoice generator + PDF preview
    ├── KlantenTab.jsx   # Master data editor
    ├── MobilePhone.jsx  # Operator mobile app simulator with signature pads
    └── Toast.jsx        # Toast notifications
```

## What's implemented vs deferred

**In the prototype:** drag-and-drop planning, mobile werkbon flow with canvas signatures, planner approval inbox, invoice PDF preview, klant master data editing, demo-flow auto-scripts.

**Deliberately faked:** invoice "PDF" is HTML (real app uses Puppeteer/WeasyPrint server-side), no auth, no backend, no offline sync, no push notifications, single hourly rate.

**Roadmap milestones** (see project brief):
- M1 — Field excellence (offline sync, photos, one-time client signing link)
- M2 — Subcontractor invoice loop
- M3 — Client portal + Peppol e-invoicing
- M4 — Week/month Gantt + conflict detection
- M5 — Exact Online sync + payroll exports + dashboards

## Push to GitHub

This is a fresh project with no git history yet. Two ways to get it onto GitHub:

### Option A — GitHub CLI (fastest)

If you have [GitHub CLI](https://cli.github.com/) installed:

```bash
git init
git add .
git commit -m "Initial MVP prototype"
gh repo create useit2026 --public --source=. --push
```

Done. Replace `--public` with `--private` if you prefer.

### Option B — Manual

1. Create an empty repo on github.com (don't add a README, .gitignore, or licence — this repo already has them).
2. Then in this folder:

```bash
git init
git add .
git commit -m "Initial MVP prototype"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/useit2026.git
git push -u origin main
```

(Replace `YOUR_USERNAME` and use the HTTPS URL `https://github.com/...` if you don't have SSH keys set up.)

## Deploy

The fastest free way to share a live demo with the planner:

- **Vercel**: `npm i -g vercel && vercel` — auto-detects Vite, deploys in ~30 seconds
- **Netlify**: drag the `dist/` folder (after `npm run build`) onto netlify.com
- **GitHub Pages**: enable Pages in the repo settings, point at the `dist/` folder via an Action

## Tech stack (current and planned)

| Layer | Now (prototype) | Planned (production) |
|---|---|---|
| Web frontend | React 18 + Vite + Tailwind | Same, plus dnd-kit for drag-drop, shadcn/ui |
| Mobile | Simulated in browser | React Native (Expo) |
| State | useState in App | TanStack Query + REST/GraphQL |
| Backend | — | NestJS or FastAPI + PostgreSQL + Redis |
| PDFs | Inline HTML preview | Puppeteer or WeasyPrint server-side |
| E-invoicing | — | Peppol Access Point (BE) |
| Accounting | — | Exact Online (later milestone) |
| Auth | — | OIDC + biometric on mobile |

## Domain glossary (NL → EN)

| Dutch | English |
|---|---|
| Klant | Customer |
| Werf | Worksite / job site |
| Werknemer | Employee / operator |
| Werkbon / Dagrapport | Daily work ticket |
| Uurrooster | Timesheet |
| Bestuurder | Operator (driver) |
| Opdrachtgever | Client / commissioning party |
| Verhuring | Rental |
| Beheer | Administration |

## Licence

Internal — Demaecker & Vanhaecke.
