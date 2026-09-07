# Stage 4 — QA Report (Blocks 4A + 4B)

**Date:** 2026-08-23  
**Status:** PASS (with fixes applied)

## Block 4A — File Structure

| Area | Path | Status |
|------|------|--------|
| Components | `src/components/` (isiHeader, isiNav) | OK |
| Engine | `src/engine/` (isiConfig, isiDiagnosticEngine) | OK |
| Styles | `src/styles/isi.css` | OK |
| Data models | `src/data/*.json` | OK |
| Diagnostic pages | `website/diagnostic/*.html` | OK |
| Naming | `decisionTree.html` (not decision-tree) | OK |
| Alias | `input.html` → redirects to `index.html` | Added |

No orphaned critical scripts. Marketing site under `website/` is intentional (Stage 1).

## Block 4B — Load Order

Verified on all 7 pages:

1. `isiHeader.js` + `injectIsiHeader()`
2. `isiNav.js` + `injectIsiNav(STEP)`
3. `isiConfig.js` **then** `isiDiagnosticEngine.js` (config must precede engine)
4. Page logic (end of body)
5. `export.js` / `saveShare.js` on roadmap, dashboard, summary

Nav inserts after header root (no race putting nav above brand bar).

## Routing

| From | Continue → |
|------|------------|
| Input (`index.html`) | `scoring.html` |
| Scoring | `decisionTree.html` |
| Decision Tree | `prioritization.html` |
| Prioritization | `roadmap.html` |
| Roadmap | `dashboard.html` |
| Dashboard | `summary.html` |
| Summary | (no forward Continue; Back / Schedule) |

**Fix applied:** Input page now has explicit `href="scoring.html"` Continue link (form Save Input still validates + redirects).

## Nav steps + progress

| Page | Step | Fill |
|------|------|------|
| Input | `input` | ~14% |
| Scoring | `scoring` | ~29% → rounded 29% / target 28% |
| Decision | `decision` | ~43% / target 42% |
| Prioritization | `prioritization` | 57% |
| Roadmap | `roadmap` | ~71% |
| Dashboard | `dashboard` | ~86% / target 85% |
| Summary | `summary` | 100% |

Progress uses `Math.round((index+1)/7*100)`.

## Buttons (stubs present)

Export / Save-Share / Automation / Dev Console wired on Dashboard, Summary, Roadmap as designed.

## Notes

- Brief listed engine before config; **runtime requires config first** — kept correct order.
- Full pipeline integrity (4C) should be run manually in browser with sample data next.
