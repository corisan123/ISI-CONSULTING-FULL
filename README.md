# ISI Consulting Platform

Marketing site, intake forms, and Stage 2 diagnostic input for ISI Consulting. Consulting-grade HTML with shared navigation, navy/steel/gold styling, and client-side form handlers. No backend; Blocks 2A–2C are client-side (input → scoring → decision tree). ROI / prioritization / roadmap (2D–2E) not started.

## Project root

`/workspace/isi-consulting`

---

## Block 1A — Website Pages (Content Only)

| Page | Path |
|------|------|
| Homepage | `website/index.html` |
| About ISI Consulting | `website/about.html` |
| Iron Sharpens Iron Philosophy | `website/philosophy.html` |
| Services Overview | `website/services/index.html` |
| Fractional Business Development | `website/services/fractional-business-development.html` |
| Corporate Turnaround | `website/services/corporate-turnaround.html` |
| Sales Process Maturity | `website/services/sales-process-maturity.html` |
| Operational Alignment | `website/services/operational-alignment.html` |
| Leadership Alignment | `website/services/leadership-alignment.html` |
| Growth & Turnaround Diagnostic (Flagship) | `website/services/growth-turnaround-diagnostic.html` |
| Contact | `website/contact.html` |
| Schedule Consultation | `website/schedule.html` |
| Case Study Template | `website/templates/case-study.html` |
| Blog Template | `website/templates/blog.html` |
| Resource Library Template | `website/templates/resource-library.html` |

### Shared assets (1A)

- `website/css/site.css` — consulting-grade styles (navy / steel / gold accents)
- `website/js/site.js` — mobile nav, current-page marking, generic `data-validate` form hooks
- `website/assets/` — media + lead-magnet placeholder download

---

## Block 1B — Website Forms ✅ COMPLETE

Structured intake for onboarding → discovery → consultation, plus Contact and Lead Magnet. Client-side validation only; latest submission stored in `sessionStorage` for a future diagnostic engine.

### Checklist (Sections 1–5)

- [x] Section 1 — Client Intake (`forms/client-intake.html` + `submitClientIntake`)
- [x] Section 2 — Discovery Questionnaire (`forms/discovery.html` + `submitDiscovery`)
- [x] Section 3 — Consultation Scheduling (`schedule.html` + `submitSchedule`)
- [x] Section 4 — Contact Form (`contact.html` + `submitContact`)
- [x] Section 5 — Lead Magnet (`forms/lead-magnet.html` + `submitLeadMagnet` + placeholder download)

### Forms & pages

| Form | Path | Handler | sessionStorage key |
|------|------|---------|-------------------|
| Client Intake | `website/forms/client-intake.html` | `submitClientIntake()` | `isi_clientIntake` |
| Discovery Questionnaire | `website/forms/discovery.html` | `submitDiscovery()` | `isi_discovery` |
| Consultation Scheduling | `website/schedule.html` | `submitSchedule()` | `isi_schedule` |
| Contact | `website/contact.html` | `submitContact()` | `isi_contact` |
| Lead Magnet | `website/forms/lead-magnet.html` | `submitLeadMagnet()` | `isi_leadMagnet` |
| Forms index | `website/forms/index.html` | — | — |

### Field IDs

**Client Intake** (`#clientIntakeForm`): `companyName`, `contactName`, `email`, `phone`, `industry` (AEC, Manufacturing, Building Products, Automation, Construction, Other), `challenge`. `data-next="discovery.html"`.

**Discovery** (`#discoveryForm`): `annualRevenue`, `grossMargin`, `ebitda`, `pipelineValue`, `closeRate`, `avgDealSize`, `salesCycle`, `customerConcentration`, `salesTeamCapacity`, `costToServe`, `bottlenecks`. Uses `.isi-form-grid`. `data-next="../schedule.html"`.

**Schedule** (`#scheduleForm`): `schedName`, `schedEmail`, `schedDate`, `schedTime`. Calendar embed remains a placeholder above the form.

**Contact** (`#contactForm`): `contactNameField`, `contactEmailField`, `contactMessageField`. Sidebar keeps email/phone/hours + Client Intake link.

**Lead Magnet** (`#leadMagnetForm`): `leadEmail`. On success downloads `website/assets/isi-growth-diagnostic-guide-placeholder.txt`. Compact card on `website/templates/resource-library.html` links to the full form.

### JS & CSS

- `website/js/forms.js` — `submitClientIntake`, `submitDiscovery`, `submitSchedule`, `submitContact`, `submitLeadMagnet` (exposed on `window`); validates required fields; `console.log`s payload; prefers `.form-success` over `alert`; writes JSON to `sessionStorage`; optional `data-next` navigation after success; lead magnet triggers placeholder download.
- `website/js/site.js` — nav + legacy `data-validate` helper (Contact no longer uses it).
- `website/css/site.css` — `.isi-form`, `.isi-form-grid`, refined focus rings / padding / gold primary buttons.

### Flow

1. Client Intake → (optional) Discovery  
2. Discovery → Schedule  
3. Or jump to Schedule / Contact / Lead Magnet directly  

Footer **Engage** links on homepage, contact, schedule, forms/*, and resource library include Forms, Client Intake, Lead Magnet, and Resources.

### Not in this block (later)

- Contact / CRM backend wiring
- Final Growth Diagnostic Guide PDF (placeholder `.txt` ships for now)
- Calendar embed / sync
- Diagnostic scoring UI reading `sessionStorage`

---

---

## Block 1C — Legal Pages ✅ COMPLETE (Sections 1–3)

**Stage 1 Website Infrastructure is complete.** Static legal content with shared header/nav/footer. **Diagnostic engine = Block 2** (not wired here). No new JS for legal pages beyond `site.js`.

### Checklist

- [x] Section 1 — Non-Disclosure & Confidentiality Notice (`website/legal/nda.html`)
- [x] Section 2 — Terms of Engagement (`website/legal/terms.html`)
- [x] Section 3 — Privacy Policy & Consulting Disclaimer (`website/legal/privacy.html`, `website/legal/disclaimer.html`)

### Pages

| Page | Path | Footer label |
|------|------|--------------|
| Legal index | `website/legal/index.html` | Legal index |
| Confidentiality Notice | `website/legal/nda.html` | Confidentiality Notice |
| Terms of Engagement | `website/legal/terms.html` | Terms of Engagement |
| Privacy Policy | `website/legal/privacy.html` | Privacy Policy |
| Consulting Disclaimer | `website/legal/disclaimer.html` | Consulting Disclaimer |

### Structure & CSS

- Shared chrome: relative paths from `/legal/` (`../css/site.css`, `../js/site.js`, `../index.html`, etc.)
- Content: `main` → `article.isi-page` → `section.isi-section`
- Cross-links: NDA → Terms; Terms §3 → NDA; Privacy → NDA + Contact; Disclaimer → Terms (Limitation of Liability)
- `website/css/site.css` additions:
  - `.isi-page`, `.isi-section` — prose legal/content layout
  - Form aliases: `.isi-label`, `.isi-input`, `.isi-button` (map to existing `.isi-form` label/input/primary button styles; `.isi-form` unchanged)
- Footer **Legal** column on: `index.html`, `contact.html`, `schedule.html`, `forms/index.html`, `forms/client-intake.html`, `forms/discovery.html`, `forms/lead-magnet.html`, `services/index.html`, and `legal/*.html` (Confidentiality Notice, Terms of Engagement, Privacy Policy, Consulting Disclaimer; Legal index on `legal/*`)

### Not in this block

- Diagnostic engine / Block 2 wiring
- Backend CRM or e-signature

### How to view

```bash
cd /workspace/isi-consulting/website && python3 -m http.server 8080
```

- http://localhost:8080/legal/
- http://localhost:8080/legal/nda.html
- http://localhost:8080/legal/terms.html
- http://localhost:8080/legal/privacy.html
- http://localhost:8080/legal/disclaimer.html


---

## Block 2A — Diagnostic Input Model ✅ COMPLETE (Sections 1–3)

Master input for the Growth & Turnaround Diagnostic. Continue → `scoring.html` (Block 2B).

| Artifact | Path |
|----------|------|
| Input UI | `website/diagnostic/index.html` (`#diagnosticInputForm`) |
| Handler | `website/js/diagnostic-input.js` → `submitDiagnosticInput()` |
| Field map (docs) | `website/diagnostic/input-model.json` |
| Canonical template | `src/data/diagnosticInput.json` (overwritten dynamically by engine later) |

**Data flow:** Validate → Log (`Diagnostic Input:`) → Store `sessionStorage.isi_diagnosticInput` → Alert (“Diagnostic input saved. Proceeding to scoring.”).

**Canonical keys:** `revenue`, `margin`, `ebitda`, `pipeline`, `closeRate`, `dealSize`, `salesCycle`, `customerConcentration`, `salesCapacity`, `costToServe`, `bottlenecks`, `leadership`.

**Stage 2:** 2A–2C done. 2D ROI / prioritization and 2E Roadmap+Dashboard not started.

---



## Block 2B — Scoring Engine ✅ COMPLETE

Transforms `isi_diagnosticInput` into weighted category scores (0–100) and Red / Yellow / Green ratings. Client-side only; no decision tree / ROI / roadmap yet.

| Artifact | Path |
|----------|------|
| Scoring model | `src/data/scoringModel.json` (weights + thresholds) |
| Scoring engine | `src/scoring.js` → `runScoringEngine()`, `displayResults()`, `runAndDisplay()` |
| Results UI | `website/diagnostic/scoring.html` |

**Data flow:** Read `sessionStorage.isi_diagnosticInput` → fetch scoring model → calculate Revenue / Margin / Operations / Leadership → write `sessionStorage.isi_scoringResults` as `{ scores, ratings }` → `console.log("Scoring Results:", …)`.

**Thresholds:** Green ≥ 75, Yellow ≥ 50, else Red (from `scoringModel.json`).

**UX:** Scoring runs only on **Run Scoring** click. If results already exist, `displayResults()` renders them on page load. Continue on diagnostic input alerts then redirects to `scoring.html`. Scoring page links **Continue to Decision Tree** → `decisionTree.html`.

**Fetch path:** Default `../../src/data/scoringModel.json` (from `website/diagnostic/`); falls back to `/src/data/scoringModel.json` when serving from project root. Override via `window.ISI_SCORE_MODEL_URL`.

**Stage 2:** 2A–2C done. **2D prioritization / ROI not started.** 2E Roadmap+Dashboard not started.

### How to test (2B)

```bash
# Preferred: serve project root so /src and relative paths both work
cd /workspace/isi-consulting && python3 -m http.server 8080
```

- http://localhost:8080/website/diagnostic/ → fill form → Continue → scoring page
- Click **Run Scoring** → Console `Scoring Results:` + `sessionStorage.isi_scoringResults`
- Reload scoring page → prior results display without re-running

Or from `website/` only (relative fetch still works):

```bash
cd /workspace/isi-consulting/website && python3 -m http.server 8080
```

- http://localhost:8080/diagnostic/scoring.html
- http://localhost:8080/diagnostic/decisionTree.html

---

## Block 2C — Decision Tree Engine ✅ COMPLETE

Transforms `isi_scoringResults` ratings into a diagnostic archetype and root-cause list (“You are here”). Client-side only; no ROI / prioritization / roadmap yet.

| Artifact | Path |
|----------|------|
| Decision tree model | `src/data/decisionTree.json` (five archetypes exactly as brief) |
| Decision tree engine | `src/decisionTree.js` → `runDecisionTree()`, `displayDecisionTree()`, `matchesArchetype()`, `runAndDisplayDecisionTree()` |
| Archetype UI | `website/diagnostic/decisionTree.html` |

**Data flow:** Read `sessionStorage.isi_scoringResults` → fetch decision tree JSON → evaluate archetypes **in order** (first full match wins) → write `sessionStorage.isi_decisionTree` as `{ archetypeId, archetypeName, rootCause, ratings, scores, summary }` → `console.log("Decision Tree Result:", …)`.

**Match logic:** String condition → exact rating equality; array condition → rating is included; all listed categories must pass (AND). Empty `conditions` never matches via the loop.

**Fallback (JS only):** If no archetype matches, apply **Unclassified Pattern** (`unclassified`) in `decisionTree.js` — not added as a sixth entry in `decisionTree.json` (keeps the brief five exact). Root causes: multiple categories under pressure; no single dominant red flag; requires cross-functional prioritization.

**Archetypes (order):** `revenue_stalled` → `margin_collapse` → `ops_bottleneck` → `leadership_misalignment` → `healthy_growth` → (JS) `unclassified`.

**UX:** Runs only on **Run Decision Tree** click. If `isi_decisionTree` already exists, `displayDecisionTree()` renders on load. Guards with alert if scoring has not been run. Footer/nav notes **Prioritization — Block 2D** (not started). Scoring page includes **Continue to Decision Tree**.

**Fetch path:** Default `../../src/data/decisionTree.json` (from `website/diagnostic/`); falls back to `/src/data/decisionTree.json`. Override via `window.ISI_DECISION_TREE_URL`.

**Stage 2:** 2A + 2B + 2C done. **2D prioritization / ROI not started.** 2E Roadmap+Dashboard not started.

### How to test (2C)

```bash
# Preferred: serve project root so /src and relative paths both work
cd /workspace/isi-consulting && python3 -m http.server 8080
```

- http://localhost:8080/website/diagnostic/ → fill form → Continue → scoring
- Click **Run Scoring** → then **Continue to Decision Tree**
- Click **Run Decision Tree** → Console `Decision Tree Result:` + `sessionStorage.isi_decisionTree`
- Confirm archetype name, “You are here: …”, root-cause list, and R/Y/G badges
- Reload decision tree page → prior result displays without re-running
- Without scoring: alert / hint to run scoring first

Or from `website/` only (relative fetch still works):

```bash
cd /workspace/isi-consulting/website && python3 -m http.server 8080
```

- http://localhost:8080/diagnostic/decisionTree.html

---

## How to view / test

```bash
cd /workspace/isi-consulting/website && python3 -m http.server 8080
```

Then open:

- http://localhost:8080/
- http://localhost:8080/forms/
- http://localhost:8080/forms/client-intake.html
- http://localhost:8080/forms/discovery.html
- http://localhost:8080/schedule.html
- http://localhost:8080/contact.html
- http://localhost:8080/forms/lead-magnet.html
- http://localhost:8080/templates/resource-library.html
- http://localhost:8080/diagnostic/ (or `/website/diagnostic/` if serving project root)
- http://localhost:8080/diagnostic/scoring.html
- http://localhost:8080/diagnostic/decisionTree.html

In DevTools → Console, submit each form and confirm the log + `sessionStorage` keys `isi_clientIntake`, `isi_discovery`, `isi_schedule`, `isi_contact`, `isi_leadMagnet`. Lead magnet should also download the placeholder guide.

## Block 2D — Prioritization + ROI Engine ✅ COMPLETE (Sections 1–3)

| Artifact | Path |
|----------|------|
| Model | `src/data/prioritizationModel.json` |
| Engine | `src/prioritization.js` → `runPrioritizationEngine()`, `calculatePriority()`, `displayPriorities()` |
| UI | `website/diagnostic/prioritization.html` (`#priorityList`) |
| Roadmap placeholder | `website/diagnostic/roadmap.html` (Block 2E) |

**Data flow:** Read `isi_decisionTree` → filter initiatives by `decision.id` → `priorityScore = roi * 100 - effort * 50` → sort desc → store `isi_prioritization` → display cards on load / after Generate Priorities.

**Routing:** Decision Tree → Prioritization → Roadmap (2E placeholder).

**Stage 2:** 2A–2D done. **2E** Roadmap + Dashboard + Summary not started.

---

## Block 2E — Roadmap + Dashboard + Summary ✅ COMPLETE (Sections 1–3)

**Stage 2 Diagnostic Engine is complete.**

| Section | Artifacts |
|---------|-----------|
| 1 Roadmap | `src/data/roadmapModel.json`, `src/roadmap.js`, `website/diagnostic/roadmap.html` |
| 2 Dashboard | `src/dashboard.js`, `website/diagnostic/dashboard.html` |
| 3 Summary | `src/summary.js`, `website/diagnostic/summary.html` |

**End-to-end flow:** Input → Scoring → Decision Tree → Prioritization → Roadmap → Dashboard → Executive Summary.

**sessionStorage keys:** `isi_diagnosticInput`, `isi_scoringResults`, `isi_decisionTree`, `isi_prioritization`, `isi_roadmap`.

---

## Block 3A — UX Polish + Styling System (COMPLETE — Sections 1–3)

### Section 1 — CSS System ✅

| Artifact | Path |
|----------|------|
| Design system | `src/styles/isi.css` |

Tokens: `--isi-blue` #003366, `--isi-gold` #C9A86A, `--isi-cyan` #0099CC, `--isi-bg` #F5F7FA, Inter, cards 8px / shadow, primary/secondary/accent buttons, `.isi-diag-nav` step states (active/complete/future). Linked on diagnostic HTML pages. Includes `.isi-footer` and `body.isi-diagnostic` min-height shell.

### Section 2 — Navigation Component ✅

| Artifact | Path |
|----------|------|
| Markup | `src/components/isiNav.html` |
| Logic | `src/components/isiNav.js` → `injectIsiNav(step)` |

Injected on all diagnostic pages with correct `data-step`. Progress fill = (index+1)/7. Active/complete/future classes applied.

### Section 3 — Page Polish ✅

All pages under `website/diagnostic/` use shared shell: `injectIsiNav` → `.isi-page` > `h2` + `.isi-section` content → Continue / secondary actions → `.isi-footer`. Removed legacy `site-header`, multi-column `site-footer`, and `page-header` band. Result containers and engine scripts preserved. Content blocks use `.isi-card` with `h3` section headers (Input, Category Scores, Root-Cause Analysis, Ranked Initiatives, Phased Roadmap, Executive Snapshot, Client Deliverable).

| File | Nav step | Title | Continue → |
|------|----------|-------|------------|
| `index.html` (brief: input) | `input` | Business Diagnostic Input | form → `scoring.html` |
| `scoring.html` | `scoring` | Diagnostic Scoring Results | `decisionTree.html` |
| `decisionTree.html` (brief: decision-tree) | `decision` | Diagnostic Archetype | `prioritization.html` |
| `prioritization.html` | `prioritization` | Priority Recommendations | `roadmap.html` |
| `roadmap.html` | `roadmap` | Execution Roadmap | `dashboard.html` |
| `dashboard.html` | `dashboard` | Diagnostic Dashboard | `summary.html` |
| `summary.html` | `summary` | Executive Summary | Back to `dashboard.html` + Schedule |

---



## Block 3B — Export + Integrations ✅ COMPLETE (Sections 1–3)

### Section 1 — Export ✅ COMPLETE

| Artifact | Path |
|----------|------|
| Export helpers | `src/export.js` → `downloadSummary()`, `printDiagnostic()`, `emailSummary()` |
| Wired on | `website/diagnostic/dashboard.html`, `summary.html`, `roadmap.html` |

**Behavior:** Print uses `window.print()`. Download Summary and Email Summary are **stubs** (alert placeholders) — PDF generation and email wiring land in a future release.

**UI:** Below continue/actions and above `.isi-footer`, an Export Options block with secondary Download / Print buttons and accent Email button. Script: `../../src/export.js`.

**3A polish (finish):** Diagnostic content blocks use `.isi-card` with page-level `h3` section headers (Diagnostic Input, Category Scores, Root-Cause Analysis, Ranked Initiatives, Phased Roadmap, Executive Snapshot, Client Deliverable). `scoring.js` `displayResults` renders category lines as `<p class="scoring-line">` inside `#scoringResults.isi-card`.

### Section 2 — Header + Footer ✅ COMPLETE

| Artifact | Path |
|----------|------|
| Header markup | `src/components/isiHeader.html` |
| Header inject | `src/components/isiHeader.js` → `injectIsiHeader()` |
| Nav order fix | `src/components/isiNav.js` inserts after `.isi-header-root` / `.isi-header` when present |
| Styles | `src/styles/isi.css` — `--isi-white`, `.isi-header*` , updated `.isi-footer` |

**Order:** Header → Nav → Progress → content (nav uses `insertAdjacentElement('afterend')` on header when available; else prepend).

**Footer (all diagnostic pages):** © 2026 ISI Consulting — The Truth Collective / Diagnostic Engine v1.0 — All Rights Reserved / Contact: support@truthcollective.io

### Section 3 — Save / Share ✅ COMPLETE

| Artifact | Path |
|----------|------|
| Stubs | `src/saveShare.js` → `saveDiagnostic()`, `shareDiagnostic()` |
| Wired on | `website/diagnostic/dashboard.html`, `summary.html`, `roadmap.html` |

**UI:** Save & Share section near Export Options (secondary Save + accent Share). Both are alert stubs for a future release.

## Block 3C — Automation Hooks + Future API Layer ✅ COMPLETE

| Artifact | Path |
|----------|------|
| Config stubs | `src/engine/isiConfig.js` |
| Engine wrapper | `src/engine/isiDiagnosticEngine.js` |

**API:** `isiDiagnosticEngine.getInput/getScoring/getDecisionTree/getPrioritization/getRoadmap/getSummary` + stubs `sendToCRM`, `sendToWebhook`, `saveToCloud`, `exportJSON`. Reads live sessionStorage keys (`isi_diagnosticInput`, etc.).

**UI:** Automation Hooks on dashboard / summary / roadmap. Developer Console on dashboard / summary. Engine scripts on all diagnostic pages.

**Stage 3 Packaging complete** (3A UX · 3B Export/Brand · 3C Automation).

---

