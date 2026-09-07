# ISI Consulting Platform

Static HTML/CSS/vanilla JS for ISI Consulting: a marketing site plus a **multi-engine diagnostic** (Growth, Expansion, Alignment) controlled by a live decision tree.

**No build step.** Serve the **repository root**. Absolute paths (`/src/...`, `/diagnostic/...`, `/website/...`) require a local or hosted HTTP server — `file://` will not load engine models.

## Quick start

```bash
cd /path/to/ISI-CONSULTING-FULL
python3 -m http.server 8080
```

Open `http://localhost:8080/` (diagnostic input) or `http://localhost:8080/website/` (marketing).

Walk the diagnostic: Input → Scoring → **Run Multi-Engine Tree** → Priorities → Roadmap → Dashboard → Summary.

## Layout

```
/
├── index.html                 Diagnostic input (production entry)
├── diagnostic/                Flow pages (input through summary)
├── src/
│   ├── engines/               Growth, Expansion, Alignment + orchestrator
│   ├── engine/                Config + session wrapper (isiDiagnosticEngine)
│   ├── components/            Header / nav injectors
│   ├── data/
│   │   ├── scoringModel.json  Shared vital signs
│   │   ├── decisionControl.json
│   │   ├── engines/           Per-engine modules, archetypes, initiatives
│   │   └── …
│   ├── styles/isi.css
│   └── *.js                   Input, scoring, tree UI, merge displays
├── website/                   Marketing, forms, schedule, legal
├── assets/                    Optional static assets
├── archive/                   Prototypes / zip (not production)
├── ARCHITECTURE.md            Engines, decision tree, libraries
└── DEPLOYMENT.md              Vercel / Netlify / GitHub Pages
```

Do **not** serve `website/` as the app root. Do **not** deploy leftover `isi-consulting/` or `ISI DIAGNOSTIC FOLDER/` trees if they still exist on disk.

## Three service engines

| Engine | Offering | Firm lineage | Model |
|--------|----------|--------------|--------|
| **Growth** | Revenue growth & problem diagnosis | Bain Full Potential, commercial excellence, Founder’s Mentality, NPS | `src/data/engines/growthModel.json` |
| **Expansion** | New office, startup, new revenue stream | Monitor Deloitte market entry / operating model, McKinsey Three Horizons | `src/data/engines/expansionModel.json` |
| **Alignment** | BD ↔ operational excellence | McKinsey 7S / OHI / Influence Model, Deloitte Enterprise Value Map | `src/data/engines/alignmentModel.json` |

Shared vital signs (Revenue, Margin, Operations, Leadership) come from `src/scoring.js` + `src/data/scoringModel.json`. The decision tree **activates every matching engine** and merges initiatives, roadmap, narrative, and scenarios.

Details: **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Diagnostic flow

| Step | Page | Script |
|------|------|--------|
| Input | `/` and `/diagnostic/input.html` | `src/diagnostic-input.js` |
| Scoring | `/diagnostic/scoring.html` | `src/scoring.js` |
| Decision tree (control) | `/diagnostic/decisionTree.html` | `src/engines/*` + `src/decisionTree.js` |
| Priorities | `/diagnostic/prioritization.html` | merged list from the tree |
| Roadmap | `/diagnostic/roadmap.html` | 30/60/90/180, distinct per phase |
| Dashboard | `/diagnostic/dashboard.html` | `src/dashboard.js` |
| Summary | `/diagnostic/summary.html` | `src/summary.js` |

Input stores `sessionStorage.isi_input` (and legacy `isi_diagnosticInput`). Discovery on the marketing site can prefill numeric fields (`isi_discovery`).

## Marketing site

`website/` — home, about, philosophy, services, contact, schedule, forms, legal. Lead-magnet download: `/website/assets/isi-growth-diagnostic-guide-placeholder.txt`.

## Deploy

See **[DEPLOYMENT.md](DEPLOYMENT.md)**. Root directory = repo root, empty build command, publish `.`.

## Docs map

| Doc | Role |
|-----|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Multi-engine brain, diagrams, libraries |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Hosting and smoke tests |
| [INTEGRATION-SQUARESPACE-WORDPRESS.md](INTEGRATION-SQUARESPACE-WORDPRESS.md) | Embed / link from CMS |
| `STAGE4-*.md` | Historical Stage 4 QA (superseded for architecture) |

Export, CRM, webhook, and cloud save remain **stubs**.
