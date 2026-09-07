# Stage 4 - Block 4D Deployment Checklist

> **Historical (Stage 4, Aug 2026).** Current layout, engines, and deploy steps: [README.md](README.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md). Production diagnostic lives at repo root with `/src/engines/` and `/src/data/engines/`. `website/diagnostic/` is **not** the live flow.

**Date:** 2026-08-23
**Goal:** Production-ready static tree; root = diagnostic entry; no build tooling.

## Structure

- [x] `/index.html` — production diagnostic input (host entry)
- [x] `/diagnostic/input.html` — same content as root index
- [x] `/diagnostic/scoring.html`
- [x] `/diagnostic/decisionTree.html`
- [x] `/diagnostic/prioritization.html`
- [x] `/diagnostic/roadmap.html`
- [x] `/diagnostic/dashboard.html`
- [x] `/diagnostic/summary.html`
- [x] `/src/components/` — isiHeader.js/html, isiNav.js/html
- [x] `/src/engine/` — isiConfig.js, isiDiagnosticEngine.js
- [x] `/src/styles/isi.css` — sole stylesheet for production diagnostic pages
- [x] `/src/data/*.json` — kept for engines
- [x] `/src/scoring.js`, decisionTree.js, prioritization.js, roadmap.js, dashboard.js, summary.js
- [x] `/src/export.js`, saveShare.js
- [x] `/src/diagnostic-input.js` — copied from website/js/ (STORAGE isi_input)
- [x] `/assets/.gitkeep`
- [x] `website/` marketing site retained (Stage 1)

## Paths

- [x] All production HTML script/link hrefs use absolute `/src/...`
- [x] Page / Continue / Back / nav links use `/diagnostic/...`
- [x] `isiNav.html` links absolute `/diagnostic/*.html`
- [x] `isiNav.js` / `isiHeader.js` prefer `/src/components/...` first
- [x] Scoring / decisionTree / prioritization / roadmap prefer `/src/data/...` absolute fetches
- [x] No `../` in href/src under `diagnostic/` + root `index.html`
- [x] No `../css/site.css` on production diagnostic pages (form utilities in isi.css)
- [x] `website/diagnostic/` also updated to absolute paths (servable from project root)

## Load order (each diagnostic page)

1. isiHeader.js then injectIsiHeader()
2. isiNav.js then injectIsiNav(STEP)
3. isiConfig.js then isiDiagnosticEngine.js
4. Page logic (`/src/<page>.js` or diagnostic-input.js)
5. export.js / saveShare.js last on roadmap, dashboard, summary

## Routing

| From | Continue |
|------|----------|
| `/` or `/diagnostic/input.html` | `/diagnostic/scoring.html` |
| Scoring | `/diagnostic/decisionTree.html` |
| Decision Tree | `/diagnostic/prioritization.html` |
| Prioritization | `/diagnostic/roadmap.html` |
| Roadmap | `/diagnostic/dashboard.html` |
| Dashboard | `/diagnostic/summary.html` |
| Summary | Back dashboard; Schedule `/website/schedule.html` |

## Docs

- [x] DEPLOYMENT.md
- [x] STAGE4-DEPLOYMENT-CHECKLIST.md (this file)
- [x] RELEASE-NOTES-v1.0.md

## Deploy targets (no build)

- [ ] Vercel — root directory = project root, empty build
- [ ] Netlify — publish `.`, empty build
- [ ] GitHub Pages — site root / custom domain preferred for absolute paths

## Confirm

- [x] No package manager or SPA/SSR framework required for diagnostic
- [x] JSON model paths intact (`/src/data/*.json` + relative fallback)
