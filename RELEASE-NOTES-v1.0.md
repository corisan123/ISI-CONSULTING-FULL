# ISI Consulting - Release Notes v1.0

**Date:** 2026-08-23
**Scope:** Stages 1-4 (marketing site, diagnostic engines, UI shell, QA, deployment prep)

## Stage 1 - Marketing site and forms

- Consulting-grade static site under `website/` (home, about, philosophy, services, contact, schedule, legal, templates).
- Intake forms: client intake, discovery, schedule, contact, lead magnet.
- Client-side validation; payloads stored in sessionStorage only.
- Shared `website/css/site.css` + `website/js/site.js` / `forms.js`.

## Stage 2 - Diagnostic engines

- **Input** — validate to `isi_input` (legacy dual-write `isi_diagnosticInput`).
- **Scoring** — weighted Revenue / Margin / Operations / Leadership + Red/Yellow/Green (`isi_scoringResults`).
- **Decision tree** — archetype + root-cause (`isi_decisionTree`).
- **Prioritization** — ROI/effort ranked initiatives (`isi_prioritization`).
- **Roadmap** — 30/60/90/180 phases (`isi_roadmap`).
- JSON models in `src/data/`; page logic in `src/*.js`.

## Stage 3 - UI shell

- Shared isiHeader + isiNav (step states + progress bar).
- `src/styles/isi.css` diagnostic theme.
- isiConfig.js + isiDiagnosticEngine.js summary/export stubs.
- Dashboard + executive summary pages; export / save-share / automation hooks wired (stubs).

## Stage 4 - QA and deployment prep

- **4A/4B** — structure + load-order QA (`STAGE4-QA.md`).
- **4C** — pipeline integrity with fixture (`STAGE4-PIPELINE-QA.md`, `qa-pipeline-fixture.json`); STORAGE key aligned to `isi_input`.
- **4D** — production static tree at project root:
  - Entry: `/index.html` (= diagnostic input)
  - Flow: `/diagnostic/*.html`
  - Absolute `/src/...` and `/diagnostic/...` paths
  - `website/` retained as Stage 1 marketing
  - Docs: DEPLOYMENT.md, STAGE4-DEPLOYMENT-CHECKLIST.md, these notes

## Known stubs / limitations

- Export download / print / email — placeholder behavior.
- Save and Share — client stubs (no cloud persistence).
- CRM / webhook / cloud automation — console stubs via isiDiagnosticEngine.
- No backend, auth, or analytics.
- Marketing calendar embed remains a placeholder.
- Absolute `/` paths assume site is hosted at domain (or local server) root — not a GitHub Pages project subdirectory without a custom domain or base href.

## How to run

```bash
cd isi-consulting
python3 -m http.server 8080
# open http://localhost:8080/
```

No build step. No package manager or SPA/SSR framework required for the diagnostic.
