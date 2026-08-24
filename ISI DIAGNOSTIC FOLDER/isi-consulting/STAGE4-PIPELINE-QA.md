# Stage 4 — Block 4C Pipeline Integrity QA

**Date:** 2026-08-23  
**Result:** **Block 4C: PASS**

## Sample run

Realistic mid-market industrial profile used for logic simulation:

- Revenue $25M · Margin 22% · EBITDA 6% · Pipeline $4M · Close 18% · Deal $120k · Cycle 120d  
- Customer concentration 45% · Sales capacity 6 FTE · CTS 28% · Leadership 5  

**Outcomes:**

| Layer | Result |
|-------|--------|
| Ratings | Revenue Red · Margin Red · Operations Yellow · Leadership Yellow |
| Archetype | **Margin Collapse** (`margin_collapse`) |
| Top priority | **Margin Repair Program** |
| Roadmap | 4 phases, top initiatives assigned |

Fixture: `qa-pipeline-fixture.json`

## 1. Data flow (sessionStorage)

| Step | Read | Write | Status |
|------|------|-------|--------|
| Input | — | `isi_input` (+ legacy `isi_diagnosticInput`) | **PASS** (fix applied) |
| Scoring | `isi_input` (fallback legacy) | `isi_scoringResults` | **PASS** |
| Decision Tree | `isi_scoringResults` | `isi_decisionTree` | **PASS** |
| Prioritization | `isi_decisionTree` | `isi_prioritization` | **PASS** |
| Roadmap | `isi_prioritization` | `isi_roadmap` | **PASS** |
| Dashboard / Summary | all layers via page JS + `isiDiagnosticEngine.getSummary()` | — | **PASS** |

### Fix applied
Canonical key aligned to brief **`isi_input`**. Input dual-writes legacy `isi_diagnosticInput`. Scoring and engine prefer `isi_input`.

## 2. Visual integrity

| Page | `.isi-page` | `.isi-section` | `.isi-card` | Header/Nav/Footer | Status |
|------|-------------|----------------|-------------|-------------------|--------|
| Input | ✓ | ✓ | ✓ | ✓ | PASS |
| Scoring | ✓ | ✓ | ✓ | ✓ | PASS |
| Decision Tree | ✓ | ✓ | ✓ | ✓ | PASS |
| Prioritization | ✓ | ✓ | ✓ | ✓ | PASS (card class on `#priorityList`) |
| Roadmap | ✓ | ✓ | ✓ | ✓ | PASS (card class on `#roadmapOutput`) |
| Dashboard | ✓ | ✓ | ✓ | ✓ | PASS |
| Summary | ✓ | ✓ | ✓ | ✓ | PASS |

## 3. Engine integrity

`isiDiagnosticEngine.getSummary()` returns object with:

- `scoring` · `decision` · `priorities` · `roadmap`

No undefined keys in simulated run. Developer Console button on Dashboard/Summary calls `console.log(isiDiagnosticEngine.getSummary())`.

## 4. Action integrity (wiring verified in HTML)

| Action | Wired | Status |
|--------|-------|--------|
| Download Summary | `downloadSummary()` | PASS (stub alert) |
| Print Diagnostic | `printDiagnostic()` | PASS (native print) |
| Email Summary | `emailSummary()` | PASS (stub alert) |
| Save Diagnostic | `saveDiagnostic()` | PASS (stub alert) |
| Share Diagnostic | `shareDiagnostic()` | PASS (stub alert) |
| Export JSON | `isiDiagnosticEngine.exportJSON()` | PASS |
| Send to CRM | `sendToCRM()` | PASS |
| Trigger Webhook | `sendToWebhook()` | PASS |
| Save to Cloud | `saveToCloud()` | PASS |
| Log Summary | `getSummary()` | PASS |

## 5. Full pipeline

Logic simulation: **PASS** end-to-end with non-empty scoring, archetype, priorities, and roadmap.  
Browser click-through recommended for visual FOUC/print dialog confirmation (static host: `cd /workspace/isi-consulting && python3 -m http.server 8080` → `/website/diagnostic/`).

Nav steps + progress bar verified in Block 4B; unchanged.

## Final confirmation

**Block 4C: PASS**
