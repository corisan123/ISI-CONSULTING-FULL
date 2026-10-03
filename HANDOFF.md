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

## Engagement families (client vs internal) — Daniel’s requirement

**Goal:** Each consulting family gets its own **discovery path** on the client site and its own **wired engine chain** on the internal bench. Startups ≠ growth/expansion ≠ fractional BD ≠ PM recovery. Trade secret stays off `/website/`; clients see glimpses and (later) a KPI dashboard, not formulas.

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
- **Gated client dashboard** (KPIs, charts, auto-update when upstream inputs change): **not built yet**. Public `summary` must not ship engine math. Target: `/client/` or milestone-delivered HTML fed by **server-side** runs later; until then, internal `/internal/diagnostic/dashboard.html` + `/src/engine/` is the practice bench only.
- **Email/contact:** FormSubmit wired to Yahoo + `_cc` contact@; Daniel must **activate** FormSubmit once on first live submit. Cloudflare email routing for contact@ / dreid@ is account work.
- **Favicon / logo (23 Sep):** Daniel supplied sword-mark favicon + full **ISI CONSULTING / IRON SHARPENS IRON** wordmark. Repo files: `website/images/favicon.png` (tab icon), `website/images/logo-header.jpg` (header). `content.json` + `site.js` inject favicon and wordmark on pages that load `site.js`. Hard-refresh if the old gold bracket icon is cached.
- **Templates** (`website/templates/blog.html`, `case-study.html`): marked example / noindex; not homepage products. Replace with real posts only when copy exists.

### Internal (practice — `/internal/`, `/src/`, `/intelligence/`)

**Today:** Many standalone tools (NPV/IRR/WACC, Monte Carlo, trees, matrix, MECE, diligence, margin, ops, capital) listed in `internal/js/engines.js` and `intelligence/INVENTORY.md`, but the **classic diagnostic spine** (`/src/engine/isiDiagnosticEngine.js` + `/internal/diagnostic/*.html`) is still **one growth-input → scoring → tree → summary** path.

**Required (multi-week, Desktop only):**

1. **Family router** on `internal/index.html` / `internal/study.html`: pick family → load preset workstream + which tools are in the chain.
2. **Per-family bundles** (examples):
   - **Venture:** business-plan structure, unit economics, runway, diligence gate, kill condition (no generic growth scoring).
   - **Financial / expansion:** diligence → WACC → CAPEX → NPV/IRR/PV → scenarios → Monte Carlo → matrix → wired pipeline.
   - **Commercial:** pipeline/qualification scoring → forecast hygiene → tollgate (not full factory MECE unless file requires).
   - **Operations:** throughput / constraint → ROI-throughput → capex gate.
   - **Project:** EVM recovery → change-control → schedule/cost branches.
   - **Coaching:** behavior scorecard only; no NPV engine.
3. **Summary / dashboard page:** Replace static `internal/diagnostic/summary.html` copy with a **dependency graph**: when any upstream session key changes, KPI tiles and chart placeholders refresh from stored runs (still browser session until backend). This is the “intelligent Summary” Daniel described; it belongs **internal/gated**, not `/website/`.
4. Keep Excel-grade math in `/internal/tools/` and `/src/`; do not copy weights into `/website/js/`.

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
5. Stop at commit/push until Daniel says **commit and push**.
6. When he does, commit a message that explains why (publish the unpublished Desktop site so Cloudflare can replace the old live copy), then push `main`.
