# ISI Consulting — Deployment Guide

**Stack:** static HTML + CSS + vanilla JS. **No build step.**

Serve the **repository root** of `ISI-CONSULTING-FULL`. Do not set the host root to `website/`. Absolute URLs (`/src/...`, `/diagnostic/...`, `/website/...`) will 404 if the server root is wrong. `file://` cannot fetch engine JSON.

## Production layout

| Path | Role |
|------|------|
| `/index.html` | Diagnostic input (entry) |
| `/diagnostic/*.html` | Scoring through summary |
| `/src/engines/` | Growth, Expansion, Alignment + orchestrator |
| `/src/data/` and `/src/data/engines/` | Models (must be published) |
| `/src/styles/isi.css` | Diagnostic stylesheet |
| `/src/components/` | Header / nav HTML fragments |
| `/website/` | Marketing, forms, schedule, legal |
| `/assets/` | Optional |

Architecture: **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Local preview

```bash
cd /path/to/ISI-CONSULTING-FULL
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Save Input → scoring → **Run Multi-Engine Tree** → continue through summary.

## Hosting on Vercel

1. Import the Git repo. **Root Directory:** blank (repo root).
2. **Build Command:** empty. **Output Directory:** empty / `.`.
3. Framework Preset: **Other**.

`vercel.json` at repo root enables clean URLs. Do not add a rewrite that hides `/src`.

## Hosting on Netlify

1. Base directory: repo root. Build command: empty. Publish directory: `.`

`netlify.toml` is in the repo.

## Hosting on GitHub Pages

Deploy from the **repository root** (or `docs/` only if you copy the full tree). Project Pages under a subpath break absolute `/src` fetches unless you use a custom domain at site root.

## What must be published

| Path | Required |
|------|----------|
| `index.html` | Yes |
| `diagnostic/*.html` | Yes |
| `src/**` including `src/engines/` and `src/data/engines/*.json` | Yes |
| `website/` | If marketing/forms/schedule links matter |
| `archive/` | No |

Network 200s after deploy:

- `/src/styles/isi.css`
- `/src/components/isiHeader.html`, `isiNav.html`
- `/src/data/scoringModel.json`
- `/src/data/decisionControl.json`
- `/src/data/engines/growthModel.json`
- `/src/data/engines/expansionModel.json`
- `/src/data/engines/alignmentModel.json`

## sessionStorage (client-only)

`isi_input`, `isi_scoringResults`, `isi_decisionTree`, `isi_engines`, `isi_prioritization`, `isi_roadmap`. Dual-write of `isi_diagnosticInput` remains for older sessions.

## Smoke checklist

1. `/` loads input + header/nav; strategic context selects are required.
2. Save Input → `/diagnostic/scoring.html`; Run Scoring.
3. Decision tree page: **Run Multi-Engine Tree** — more than one engine may activate.
4. Priorities show firm + engine tags; roadmap phases are not identical copies.
5. Dashboard/summary show binding constraint and activated engines.
6. No 404s for `/src/engines/*.js` or `/src/data/engines/*.json`.

## Marketing site

Diagnostic CTAs should point to `/diagnostic/input.html` (or `/` on this host). Discovery / Schedule: `/website/forms/discovery.html`, `/website/schedule.html`.

## Squarespace / WordPress

See **INTEGRATION-SQUARESPACE-WORDPRESS.md**. Keep the diagnostic on this static host; link “Start Diagnostic” to the deployed root.
