# Handoff — next Cursor Desktop chat (ISI only)

**Read this file first.** Then read `.cursor/rules/visibility-tiers.mdc` and `.cursor/rules/isi-desktop-only.mdc`.

This handoff is for **Cursor Desktop Agent** on `C:\Users\dreid\GitHub\ISI-CONSULTING-FULL`. It is **not** for Cursor Cloud, not for a Cloud Task, and not for Truth Collective.

Date of this snapshot: 23 September 2026.

---

## How Daniel should start the next chat

1. **Close this Grok thread.** Do not keep coding in it. It has been running since 7 September, got compacted, landed on Grok 4.6, and keeps stopping.
2. At the bottom of Agent, set **Model → Composer** (or Auto). **Effort High** is fine. Leave **Fast** off.
3. If you see **Canvas: TC evaluation layer map**, do not Open it. Close / deselect it. That canvas is Truth Collective and does not belong in this window.
4. **105 Files** is not a document and not extra copies of the site. It is this chat’s context chip (how many files Agent attached). In the **new** chat it should not follow you. If it does, click the chip and clear extra attachments. Do **not** delete website files.
5. New Agent chat, this folder only. First message: `@HANDOFF.md` then: *Finish remaining public-site edits so we can publish. Do not use Cloud. Do not touch Truth Collective.*
6. Do **not** commit or push until Daniel says **commit and push**. Cloudflare Pages deploys from GitHub `main`. The internet site is older until that happens.

---

## Lane lock (non-negotiable)

| Lane | What |
|------|------|
| **This Desktop window** | ISI Consulting only |
| **Cursor Cloud** | **Off limits** for this repo. Used for a different business. Never mix. |
| **Truth Collective / TC staging / Claude-on-TC** | **Off limits.** No files, palettes, canvases, docs, or “while we’re here” edits. |

- Firm: ISI Consulting, LLC. Site: isiconsults.com. GitHub: `corisan123/ISI-CONSULTING-FULL`. Cloudflare Pages project: `isiconsultingproject`.
- Operator: Daniel Reid, MBA, PMP, LEED AP. Mount Gilead, NC. Phone 484.750.7338. Emails: `dreid@isiconsults.com`, `contact@isiconsults.com`.
- Palette: navy `#0F1F3D`, gold `#C9A235`. Never TC colors.
- Copy: spell out **Business Development**. Do not name employers or clients. No “HE”. Universities OK as credentials. Resume numbers are operator proof, not invented client claims.
- Niche locked: strategy; business/financial solutions; startup business plans; PM consulting; coaching/training; manufacturing best practice; predominantly construction and AEC.
- **Fractional Business Development leadership is the tollgate.** Other catalog work opens only after that seat is honest.

If a request would mix TC or Cloud into this repo, refuse and stay on ISI Desktop.

---

## Visibility (already a project rule)

- **Public** (`/website/`): marketing, method copy, **screenshots / stylized renderings** of programs. Describe what ISI does. Show what output looks like. **No** live Monte Carlo, trees, matrices, NPV, scoring, or engines. **No** links to `/internal/`, `/src/`, `/client/`, `/intelligence/` engines.
- **Gated**: intake questionnaires, glimpse pages, fillable NDA / needs / after-tollgate docs, client results later. Client sees findings (KPIs, bands, synopsis). **Not** weights, formulas, distributions, initiative library, model architecture.
- **Internal** (`/internal/`, `/src/`, `/intelligence/`): engines. Practice bench. Production `_redirects` send `/internal/*`, `/src/*`, `/client/*`, `/intelligence/*` to 404. Local http-server still serves them. Never copy engine JS into `/website/`.
- Trade secret is the IP vehicle. `protect.js` on public pages is not a substitute for keeping engines off those pages.

Claude (wording only) uses `website/COPY-FOR-CLAUDE.md`. Do not ask Claude to rewrite HTML, JS, or formulas.

---

## Why the live site is old

Cloudflare Pages builds from **GitHub `main`**.

- Remote `origin/main` last published commit: `e9491d4` (18 Sep 2026) — public programs, staff engines, tracking dashboard, Claude copy file.
- This PC is **2 commits ahead** of origin and **not pushed**:
  - `05f3f36` Fix intake fields, grouped discovery, contact email delivery, and 484 phone.
  - `3e54f5b` Replace placeholder guide with real content and add five group intakes plus client diagnostic glimpses.
- **Plus a large uncommitted working tree** (almost the entire public site, redirects, diagnostic stubs, fillable docs, new service pages). That work exists only on this computer until commit + push.

Do not start a Cloud Agent. Cloud starts from GitHub and would miss the uncommitted work.

---

## What was completed in the long Desktop thread (7–19 Sep, plus 19 Sep fillable placement)

Public / gated site (static HTML/CSS/vanilla JS, no build; serve repo root; relative `.html` on public pages):

- Catalog: Fractional BD tollgate; PM page; startup business plan page; decision-support page; BD interior links to revenue-operations and sales-process-maturity. PM no longer shares operational-alignment as if they were the same product.
- Forms: FormSubmit to `dreid1253@yahoo.com` with `_cc` `contact@isiconsults.com`. Relative next URLs. Peek intake path relative.
- Public diagnostic HTML under `/diagnostic/` is **intake stubs**; working copies at `/internal/diagnostic/`. Production `/diagnostic/*` redirects to intake.
- Fillable Writer replacements (type on the page, sessionStorage `isi_fillable_*`, Print / Save as PDF, typed-name signatures, “not legal advice”):
  - `website/css/docs.css`, `website/js/docs.js` (docs.css variables namespaced on `.paper` so they do not override site chrome)
  - Step 1 notice: `website/legal/nda.html` → continues to Mutual NDA
  - Step 2 fillable Mutual NDA: `website/legal/nda-agreement.html`
  - Step 3 intake hub + five group intakes + glimpses (glimpse primary CTA is now **Continue to needs**)
  - Step 4 needs: `website/forms/discovery-needs.html` (paper fillable, 8 sections)
  - Step 5 schedule: `website/schedule.html` with the 5-step indicator
  - After the tollgate (not homepage): `website/forms/benefit-statement.html`, `website/forms/onboarding.html`, `website/legal/exclusivity.html`
  - Wired on `website/forms/index.html` (sequence + after-tollgate section) and `website/legal/index.html` (fillable legal cards)
  - Exclusivity also linked from `website/services/fractional-business-development.html` (“if required”), not a homepage catalog peer
- `_redirects` pretty URLs added for `/legal/nda-agreement`, `/legal/exclusivity`, `/forms/onboarding`, `/forms/benefit-statement`
- Internal practice copies: `internal/documents/*`, `internal/css/docs.css`, `internal/js/docs.js` (will 404 on production if `/internal/*` redirect wins)

**Do not put fillable docs on the homepage.** Do not link `/internal/` from public pages.

Legal templates are working skeletons. Counsel reviews before a client signs. Benefit statement is **typed estimates only**, no live ROI calculator.

Prior copy/link pass: FAQ, em dashes, formulas line, footer duplicates.

---

## Gated sequence (correct positions)

1. Confidentiality notice → `/website/legal/nda.html`
2. Fillable Mutual NDA → `/website/legal/nda-agreement.html`
3. Intake by group → `/website/forms/intake.html` (then group form → glimpse)
4. Needs and expectations → `/website/forms/discovery-needs.html`
5. Schedule → `https://calendly.com/contact-isi-consulting` / `/website/schedule.html`

After the tollgate: benefit statement, onboarding checklist, exclusivity **only if the file requires it**.

`website/forms/discovery.html` is the older group questionnaire hub, not a homepage product. Step 4 for clients is **discovery-needs**.

---

## Remaining work for the next Desktop Agent

Code pass on 23 Sep 2026 (Desktop, this repo) finished the list below. Do not invent a new product. Do not reopen TC. Stop until Daniel says **commit and push**.

**Code (done this pass)**

- Public relative links resolve. Glued em-dash leftovers are spaced as ` - `. Range dashes are ASCII hyphens. FAQ no longer lists the confidentiality notice twice.
- Fillable docs stay in the gated sequence, legal index, and Fractional Business Development “if required”. They are not in the homepage hero.
- `_redirects` still 404s `/src/*` `/internal/*` `/client/*` `/intelligence/*` and sends `/diagnostic/*` to intake. The catch-all is `/404.html`, not a diagnostic SPA fallback.
- Every public FormSubmit form posts to `dreid1253@yahoo.com` with `_cc` `contact@isiconsults.com`. Fillable documents stay on the page (sessionStorage), not FormSubmit.
- Resources page lists the real Growth Diagnostic Guide, intake, problems, and sample screens. The fake “download not yet available” cards are gone.
- `website/diagnostic/input-model.json` is removed. It named engine field keys and pointed at `/src/data/`.
- Strategy consulting page no longer calls itself the flagship. Fractional Business Development remains the tollgate.

**Still waiting on Daniel**

- If Daniel says **commit and push**: stage ISI site + redirects + rules + this handoff. **Do not** commit secrets, `.env`, or TC files. **Do not** commit Cursor `canvases/` if a TC canvas is in the workspace sidecar (those live under `~\.cursor\projects\...`, not this git tree). Warn before adding anything under `.cursor/` that is not the two rules + intended project config.
- After push, Cloudflare should replace the old internet copy. Confirm with Daniel before considering publish done.

**Account steps (Daniel only — give short click-by-click when asked, do not stall coding on these)**

- FormSubmit: confirm the first real submission (activation email).
- Cloudflare Email Routing for contact@ / dreid@ if not already live.
- Calendly: conferencing is Microsoft Teams (ISI / work account), not personal Google Meet or a consumer account.
- Then he walks the live site once.

**Do not**

- Publish engines, Monte Carlo, NPV, tree math, or scoring weights in `/website/` JS.
- Copy fillable pack to Google Drive unless he asks again (Writer sources were chat dumps; repo is source of truth).
- Mix Truth Collective.
- Use Cursor Cloud for this repo.
- Keep working in a multi-week Grok chat. If context fills, write an updated HANDOFF and stop so a fresh Composer chat can continue.

---

## Technical notes

- Static site. No Node/Python assumed on this machine. Verify by reading HTML and checking hrefs; browser MCP has often been unavailable.
- Serve from **repository root** (Cloudflare Pages publish directory = repo root). Public files live under `/website/`. Root `_redirects` and `_headers` matter.
- Cloudflare pretty-URLs strip `.html`. Do not add reverse redirects that loop.
- Practice engines stay unpublished. When a backend exists later, engines run server-side; the client gets output only.
- `website/js/docs.js` saves drafts in `sessionStorage` keys `isi_fillable_*`.
- Diagnostic public stubs vs internal working copies: do not “restore” public `/diagnostic/*.html` into live calculators.

---

## Proprietary diagnostic engines (Daniel — Oct 2026, non-negotiable)

**Not commercial software.** Names like MECE, decision trees, ROI modeling, risk simulation, and “Excel-class” finance are **reference points for sophistication only** — what the industry uses today. ISI builds **our own** implementations in this repo (`/internal/`, `/src/`, `/intelligence/`). **Do not** scope work as “integrate/buy MECE or consulting SaaS.” **Do not** treat `/internal/tools/mece.html` as “the product = MECE”; it is a **placeholder bench** until replaced or absorbed into proprietary engine modules.

**Example lists are not exhaustive.** When Daniel mentions WACC, CAPEX, IRR, NPV, PV, depreciation, probability, sensitivity, scenarios, etc., those are **examples**, not the full tool list and **not** ranked by importance. Agents must **infer the full toolkit** each engine needs (diligence gates, QoE, working capital, throughput accounting, EVM, Monte Carlo, regression/SPC, portfolio trade-offs, stage-gates, kill conditions, and others already in `intelligence/INVENTORY.md` and `/internal/tools/`) and **wire them**, not stop at whatever Daniel typed in one message.

**Target architecture: 4–5 heavily coded diagnostic engines**, each for a **class of similar consulting engagements** (shared intake/discovery + shared internal math and dependency graph). Dissimilar engagement classes get a **different engine**, not a relabeled single spine.

| Engine | Similar project needs (examples) | Client-facing (gated only) | Internal (locked) |
|--------|----------------------------------|----------------------------|-------------------|
| **1 — Commercial / tollgate** | Fractional BD, revenue ops, sales maturity, commercial decision support | `intake-commercial`, glimpse, group-keyed needs | Qualification, pipeline hygiene, forecast integrity, commercial trees, tollgate — **not** generic growth scoring for every file |
| **2 — Financial & capital** | Turnaround, expansion, strategy with money, CAPEX / investment cases | `intake-financial`, glimpse, needs | Diligence → cost of capital → investment / CAPEX → cash flows → NPV/IRR/PV/MIRR → GAAP-aligned depreciation schedules → sensitivity → Monte Carlo → risk → matrix; **dependency bus** recalc downstream when upstream changes |
| **3 — Operations & throughput** | Manufacturing, operational alignment, constraint / quality / supply | `intake-operations`, glimpse, needs | Constraint ID, throughput accounting, OEE/scrap/WIP, exploit-vs-elevate, working-capital tied to ops — proprietary ops engine |
| **4 — Venture & sequence** | Startup business plan, spin-out, recast thesis | `intake-venture`, glimpse, needs | Unit economics, runway, kill conditions, diligence gate — **no** “growth diagnostic theater” as default |
| **5 — Project & program** (and/or leadership where distinct) | PM recovery, EVM, change control; leadership/coaching when behavior-only | `intake-project`, `intake-coaching`, glimpses, needs | EVM recovery engine vs **coaching scorecard engine** (no NPV chain) — may split to five engines or sub-modules under engine 5 |

**Visibility:** Intake and discovery questionnaires live on **`/website/forms/`** (client-facing, no engine JS). **Engines run only on internal paths**; production `_redirects` 404 `/internal/*`, `/src/*`, `/intelligence/*`. Client sees **outputs** (KPIs, bands, narrative) when Daniel chooses to deliver — **not** formulas, weights, or architecture.

**Dependency rule:** Each engine maintains a **directed graph** of programs. When an upstream input changes (intake fact, diligence gate, CAPEX, constraint metric), **dependent nodes re-run automatically** in session — no manual re-opening every tool.

**IP:** Code and methods are **ISI trade secret** (`intelligence/PROTECTION.md`). Copyright registration is **after** test/prove on Desktop — not before.

**Desktop only.** No Cursor Cloud **Agents** for this repo (Cloud = Truth Collective WP lane). **Cursor Task** on Desktop with **`environment: local`** (default) may run parallel subagents on this repo to build engines; **never** `environment: cloud` for ISI. Composer orchestrates site work + Task directives.

---

## Engagement families (client vs internal) — routing table

**Goal:** Client **intake/discovery** maps to one of the **4–5 engines** above. Six **routing labels** on the site can map to five engines (e.g. commercial vs coaching). Trade secret stays off `/website/`.

### Client-facing (gated `/website/forms/` + `/website/glimpse/`)

| Family | Service pages (examples) | Intake | Glimpse | Needs (step 4) |
|--------|--------------------------|--------|---------|----------------|
| `commercial` | Fractional BD, revenue ops, sales maturity, decision support | `intake-commercial.html` | `glimpse/commercial.html` | `discovery-needs.html?group=commercial` |
| `financial` | Corporate turnaround, strategy consulting | `intake-financial.html` | `glimpse/financial.html` | `?group=financial` |
| `operations` | Manufacturing / operational alignment | `intake-operations.html` | `glimpse/operations.html` | `?group=operations` |
| `venture` | Startup business plan | `intake-venture.html` | `glimpse/venture.html` | `?group=venture` |
| `coaching` | Leadership alignment / coaching | `intake-coaching.html` | `glimpse/coaching.html` | `?group=coaching` |
| `project` | Project management consulting | `intake-project.html` | `glimpse/project.html` | `?group=project` |

**23 Sep 2026 pass:** Service CTAs now point at the matching intake (not generic hub). `discovery-needs.js` reads `?group=` or last intake in `sessionStorage` and shows family-specific Section 8. Hub lists six families.

**Still client-facing before “100%”:**

- Retire or clearly label `forms/discovery.html` (legacy multi-tab questionnaire) so prospects are not sent to a second generic form.
- Optional: separate `discovery-needs-*.html` per family if counsel wants distinct PDFs (today: one page, group-keyed drafts in `isi_fillable_discovery-needs_<group>`).
- **Gated client summary dashboard:** `/client/summary.html` (noindex). Consultant runs internal engine → **Publish client summary** on `commercial-engine.html` or `financial-engine.html` → snapshot in `isi_client_summary` (results only — no formulas). Client view: capital gate, WACC/CAPEX/depreciation headlines, NPV–IRR–PI stack, Monte Carlo bands, tornado drivers, decision matrix, ordered **ISI program names** for copyright traceability. Republish after bus invalidate/recompute. Production `_redirects` still 404 `/client/*` until milestone delivery (local http-server for practice). Legacy rollup: `/client/resolution.html` via `synthesis.js`.
- **Email/contact:** FormSubmit wired to Yahoo + `_cc` contact@; Daniel must **activate** FormSubmit once on first live submit. Cloudflare email routing for contact@ / dreid@ is account work.
- **Favicon / logo (23 Sep):** Daniel supplied sword-mark favicon + full **ISI CONSULTING / IRON SHARPENS IRON** wordmark. Repo files: `website/images/favicon.png` (tab icon), `website/images/logo-header.jpg` (header). `content.json` + `site.js` inject favicon and wordmark on pages that load `site.js`. Hard-refresh if the old gold bracket icon is cached.
- **Templates** (`website/templates/blog.html`, `case-study.html`): marked example / noindex; not homepage products. Replace with real posts only when copy exists.

### Internal (practice — `/internal/`, `/src/`, `/intelligence/`)

**Today:** Many standalone tools (NPV/IRR/WACC, Monte Carlo, trees, matrix, MECE, diligence, margin, ops, capital) listed in `internal/js/engines.js`. **3 Oct 2026:** `internal/js/engagement-families.js` + `ISI.pipeline.runForFamily()` wire **six client intake families** to distinct program chains on `/internal/pipeline.html`; `internal/family-dashboard.html` shows family KPI tiles from session runs. The **classic growth spine** (`/src/engine/isiDiagnosticEngine.js` + scoring → tree → summary) still serves **commercial** only; other families are routed to diligence/kits/EVM paths instead of one generic ten-step chain.

### Engine completion gate (one at a time — Oct 2026)

Work **Engine 1 → 5** in order. **Do not start N+1** until N passes all checks. Task subagents: **one engine id per Task**, `environment: local`, follow `.cursor/rules/engine-task-protocol.mdc`.

| # | Id | Test URL | Acceptance (all required) |
|---|-----|----------|---------------------------|
| 1 | `commercial-tollgate` | `/internal/commercial-engine.html` | [x] Full run log (intake → qualification → pipeline → interventions → diligence → tree → 1-way sensitivity → seeded Monte Carlo → tollgate/matrix → summary). [x] Summary KPIs include diligence, pipeline, tollgate, EV, sensitivity top, MC P50/P(EV>0), interventions count, matrix best, root-cause KEEP. [x] Invalidate from `file-intake` when win rate shocks (tree reads live `ctx.inputs`). [x] `isi_clientIntake` from `website/js/intake-group.js` commercial mapping; empty session shows **Engagement file (unset)** — no demo placeholder company. [x] `engagement-families.js` commercial `summaryKeys` match Engine 1 `storeAs` ids. [x] Self-test button on test page asserts summary + required nodes. **Manual test (local http-server on repo root, port 8080):** open `http://localhost:8080/internal/commercial-engine.html` → **Run full engine** → confirm log lists all programs including sensitivity, Monte Carlo, interventions → confirm KPI grid populated → **Win rate +10 pts** → EV and MC P50 change → **Self-test** → green pass line → open `http://localhost:8080/internal/family-dashboard.html` → commercial family shows bus summary + store tiles. Optional: submit `website/forms/intake-commercial.html` first so session `isi_clientIntake` carries company name into engine headline. |
| 2 | `financial-capital` | `/internal/financial-engine.html` | [x] Full run log (intake → ISI Capital Gate diligence → WACC → CAPEX → GAAP depreciation → Margin & Capital kit → NPV–IRR–PI stack → one-way tornado → seeded Monte Carlo → capital decision matrix → summary). [x] Summary KPIs include company, diligence, wacc, npv, irr, pi, payback, sensitivity top, mcP50, mcPPositive, matrixBest, decisionScore. [x] Invalidate from `file-intake` when WACC or Y1 CF shocks (downstream NPV / MC / matrix / summary recompute). [x] `isi_clientIntake` from `website/js/intake-group.js` financial mapping; empty session shows **Engagement file (unset)** — no demo placeholder company. [x] `engagement-families.js` financial `summaryKeys` match Engine 2 `storeAs` ids. [x] Self-test button on test page asserts summary + required node ids. **Manual test (local http-server on repo root, port 8080):** open `http://localhost:8080/internal/financial-engine.html` → **Run full engine** → confirm log lists ISI Capital Gate, WACC, CAPEX, GAAP depreciation, Margin kit, NPV stack, tornado, Monte Carlo, matrix → confirm KPI grid populated → **WACC +2 pts** → NPV and MC P50 change → **Shock Y1 CF +20%** → NPV rises → **Self-test** → green pass line → open `http://localhost:8080/internal/family-dashboard.html` → set financial family (or run from financial intake first) → bus summary + store tiles. Optional: submit `website/forms/intake-financial.html` first so session `isi_clientIntake` carries company name and revenue-scaled defaults into the engine headline. |
| 3 | `operations-throughput` | `/internal/operations-engine.html` | [x] Full run log (intake → root-cause → handoff integrity → constraint ID → throughput diligence → exploit-vs-elevate ROI → CAPEX deferral → one-way tornado → seeded Monte Carlo → exploit/CAPEX matrix → summary). [x] Summary KPIs include company, diligence, weeklyGap, oee, lostThroughput, capexGate, sensitivityTop, mcP50, matrixBest, decisionScore. [x] Invalidate from `file-intake` when proposed CAPEX or OEE shocks (downstream gate / MC / matrix / summary recompute). [x] `isi_clientIntake` from `website/js/intake-group.js` operations mapping; empty session shows **Engagement file (unset)** — no demo placeholder company. [x] `engagement-families.js` operations `summaryKeys` match Engine 3 `storeAs` ids. [x] Self-test button on test page asserts summary + required node ids. [x] **Publish client summary** → `publishOperations()` in `client-summary-export.js`. **Manual test (local http-server on repo root, port 8080):** open `http://localhost:8080/internal/operations-engine.html` → **Run full engine** → confirm log lists ISI Throughput File Intake, Constraint ID, Throughput Diligence Gate, Exploit-vs-Elevate ROI, CAPEX deferral, tornado, Monte Carlo, matrix → confirm KPI grid populated → **Proposed CAPEX +$200K** → CAPEX gate / matrix may shift → **OEE +8 pts** → MC P50 and lost T respond if gap-bound → **Self-test** → green pass line → **Publish client summary** → open `http://localhost:8080/client/summary.html?group=operations` → open `http://localhost:8080/internal/family-dashboard.html` → operations family shows bus summary + store tiles. Optional: submit `website/forms/intake-operations.html` first so session `isi_clientIntake` carries company name and OTIF/WIP/capex hints into the engine headline. |
| 4 | `venture-sequence` | `/internal/venture-engine.html` | [x] Full run log (intake → sequence integrity → venture diligence → unit economics → runway → kill conditions → one-way tornado → seeded Monte Carlo → sequence matrix → summary). [x] Summary KPIs include company, diligence, runwayMonths, ltvCac, sequence, killCount, sensitivityTop, mcP50, mcPPositive, matrixBest, decisionScore. [x] Invalidate from `file-intake` when monthly burn or revenue shocks (downstream runway / kill / MC / matrix / summary recompute). [x] `isi_clientIntake` from `website/js/intake-group.js` venture mapping; empty session shows **Engagement file (unset)** — no demo placeholder company. [x] `engagement-families.js` venture `summaryKeys` match Engine 4 `storeAs` ids. [x] Self-test button on test page asserts summary + required node ids. [x] **Publish client summary** → `publishVenture()` in `client-summary-export.js`. **Manual test (local http-server on repo root, port 8080):** open `http://localhost:8080/internal/venture-engine.html` → **Run full engine** → confirm log lists ISI Venture File Intake, Sequence Integrity, Venture Diligence Gate, Unit Economics, Runway, Kill Conditions, tornado, Monte Carlo, matrix → confirm KPI grid populated → **Monthly burn +$15K** → runway and MC P50 fall → **Monthly revenue −20%** → runway falls → **Self-test** → green pass line → **Publish client summary** → open `http://localhost:8080/client/summary.html?group=venture` → open `http://localhost:8080/internal/family-dashboard.html` → venture family shows bus summary + store tiles. Optional: submit `website/forms/intake-venture.html` first so session `isi_clientIntake` carries company name and runway-week hints into the engine headline. |
| 5 | `project-program` | `/internal/project-engine.html` | blocked |

**Current sprint:** Engine 5 — `project-program` (start only after Daniel’s optional 8080 smoke on Engine 4). **Engine 4 code acceptance:** complete (3 Oct 2026 Desktop Task). **Optional operator gate:** one local pass on `http://localhost:8080/internal/venture-engine.html` (Run full engine → burn shock → revenue shock → Self-test → publish → family dashboard).

---

**Still required (multi-week, Desktop only) — real proprietary engines, not page linking:**

1. **`/src/engine/` (or `/internal/js/engine-bus/`) dependency graph** per engine id (1–5): nodes = ISI programs; edges = data contracts; **invalidate + recompute** on upstream change.
2. **Five engine bundles** implementing the table above — reuse math from `/internal/tools/` and `/internal/js/kits.js` as **libraries**, not as the final product UX.
3. **Client intake/discovery** per group feeds **engine-specific session keys** (today FormSubmit only; practice import is a later bridge).
4. **Internal Summary / dashboard** driven by the bus — not static copy, not “growth spine only.”
5. **Retire or replace** legacy single-spine assumption in `/src/engine/isiDiagnosticEngine.js` as the default for all files.
6. Never ship engine JS, weights, or distributions on `/website/`.

**Publish rule Daniel set:** Ship the **client-facing** site when discovery routing, links, placeholders, and contact path are correct. **Engines and Summary dashboard can continue on Desktop** after first deploy; they must not block HTML deploy if tiers are respected.

---

## What the last Grok thread already told Daniel

- **105 Files** = Agent context count, not a second website. Ignore or clear the chip. New chat.
- **Open Customize** in Settings is optional (rules/skills/MCP). Not better for building the site. Project rules already apply.
- **Grok 4.6** in the model picker is not “Cursor Desktop.” Desktop is the app. Composer is the usual coding model for this project.
- Cursor Task / Cloud Agent is the **wrong** next step until local work is committed **and** only if he later wants Cloud — which this project **forbids**. Stay Desktop.

---

## First actions for the new agent (do these without asking)

1. Confirm you are on Desktop, this repo, Composer. Confirm you will not use Cloud or TC.
2. Read this file and the two `.cursor/rules/*.mdc` files.
3. `git status` and treat the **working tree** as the real site, not origin.
4. Continue engagement-family wiring and internal engine bundles per section above; finish client-facing defects before commit.
5. **Composer (Desktop Agent):** Daniel approved **autonomous commit + push to `main`** when work is coherent (Oct 3 2026). No repeated ask. **Local Task subagents do not commit** — they report to Composer; Composer merges, commits, and pushes.
6. Commit messages explain *why* (deploy-ready site, engine gate, client summary, etc.).
