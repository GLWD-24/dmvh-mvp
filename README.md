# dmvh-mvp

Clickable MVP prototype to replace **USEIT2000** at Demaecker & Vanhaecke — planning board, mobile werkbon signing, invoicing, master data.

## Live demo

Once deployed: **https://glwd-24.github.io/dmvh-mvp/**

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build

```bash
npm run build
```

## Deploy

This repo is pre-configured to auto-deploy to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

To enable Pages once: go to **Settings → Pages → Source → GitHub Actions** in the GitHub repo.

## Demo flows

The five buttons at the top of the UI auto-script each MVP scenario:

1. Plan Monday 4 May 2026 — drag DEBRUYCKER + Bobcat 3 onto AVEVE AALTER
2. Operator's day on mobile — fill werkbon, capture signatures, submit
3. Planner approves the submitted werkbon
4. Generate invoice PDF from approved werkbonnen
5. Edit klant master data

## Project structure

```
src/
├── App.jsx              Top-level state + tab orchestration
├── main.jsx             React entrypoint
├── index.css            Tailwind + global styles
├── data/seed.js         Klanten, werven, werknemers, machines, werkbonnen
└── components/
    ├── PlanningTab.jsx  Drag-and-drop daily view
    ├── InboxTab.jsx     Werkbonnen approval queue
    ├── InvoiceTab.jsx   Invoice generator
    ├── KlantenTab.jsx   Master data editor
    ├── MobilePhone.jsx  Operator app simulator with signature pads
    └── Toast.jsx        Notifications
```

## Tech

React 18, Vite, Tailwind CSS. No backend yet — state lives in memory and resets on reload.
