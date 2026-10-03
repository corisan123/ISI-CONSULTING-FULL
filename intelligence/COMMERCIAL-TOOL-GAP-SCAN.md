# Commercial tool landscape — gap scan for ISI engines (reference only)

**Daniel’s rule (Oct 2026):** Lists of vendor tools, strategies, and checklists he sends are **reference points only** — **not mandatory**. Composer and Task **may ignore** any item that is a poor fit for ISI’s five engines, tiers, and trade-secret model. No requirement to implement backlog rows below.

**Do not copy** vendor code, UI, or formulas from R, Python stacks, @Risk, Crystal Ball, Gurobi, Anaplan, DataRobot, Power BI, etc. When something *is* worth adding, implement it as **proprietary** `ISI.*` modules and **engine-bus nodes** with **named programs** (copyright traceability).

Last updated: 3 Oct 2026.

---

## Product architecture (what clients get)

| Layer | What it is |
|-------|------------|
| **Five proprietary engines** (`internal/js/engine-bus/engines/*.js`) | Engagement-class buses: commercial-tollgate, financial-capital, operations-throughput, venture-sequence, project-program |
| **Internal program library** (`/internal/tools/`, `/internal/diagnostics/`, `ISI.kits`, `ISI.math`, `ISI.trees`, …) | Reusable math — wired **into** engines as nodes, not sold as separate SaaS |
| **Legacy labels** `growth`, `expansion`, `alignment` | Old **study/orchestrator** names in `engagement-families.js` + classic growth spine — **not** the five-engine product map. Retire as default spine; do not market as “three service engines.” |
| **Client summary** (`/client/summary.html`) | Results + named programs only — no weights |

---

## Gap scan vs commercial categories

Legend: **Have** = in repo and/or engines 1–3 bus | **Partial** = tool page exists, not full bus integration | **Gap** = ISI should add as proprietary module

### Statistical, econometric & probability

| Reference tools | ISI today | Gap / ISI opportunity |
|-----------------|-----------|-------------------------|
| R / Python / Stata / SAS / SPSS / MATLAB / EViews | **Partial:** `regression.html`, `stats.html` (OLS, tests, SPC-style) | Panel/pooled data, formal econometric scenarios, distribution fitting UI → **ISI Guided Stats module** nodes; keep internal |
| Minitab (SPC, capability) | **Partial:** stats bench + ops OEE/scrap | **ISI SPC & capability gate** node on Engine 3 for quality / market-share loss files |

### Sensitivity, scenario & simulation

| Reference tools | ISI today | Gap / ISI opportunity |
|-----------------|-----------|-------------------------|
| @Risk / Crystal Ball / ModelRisk / GoldSim | **Have:** seeded MC, triangular/normal in `ISI.math.monteCarlo`; engines 1–3 | Correlation between inputs, explicit **scenario sets** (base/up/down/stress) as bus nodes from `scenarios.html` |
| Analytica (influence diagrams) | **Partial:** dependency bus, not influence diagram UX | **ISI Influence Map** (client sees arrows + outcomes only on summary) |
| TreeAge (trees + sensitivity) | **Have:** `ISI.trees` bid/diagnostic, 1-way tornado in engines | Two-way grids, **risk-adjusted EMV** register link from `risk.html` |
| Simul8 / Arena (DES) | **Gap** | Lightweight **ISI Step-Flow simulator** (throughput/queue), not Arena clone — Engine 3 optional node |

### Decision science & optimization

| Reference tools | ISI today | Gap / ISI opportunity |
|-----------------|-----------|-------------------------|
| Gurobi / CPLEX / OR-Tools / AIMMS | **Gap** (no LP/MIP) | **ISI Capital/portfolio optimizer** for capex ranking under constraint — small JS LP when needed |
| Frontline / Excel solver | **Partial:** matrix + trees | Explicit **constraint-set** what-if for Engine 2 CAPEX portfolio |

### Financial modeling & corporate finance

| Reference tools | ISI today | Gap / ISI opportunity |
|-----------------|-----------|-------------------------|
| Excel DCF / Quantrix / Hyperion / Anaplan | **Have (Engine 2):** WACC, CAPEX, DCF-style CF, NPV/IRR/PI, GAAP D&A, MC, matrix | **Turnaround / bankruptcy avoidance:** diligence STOP/CAUTION/GO + covenant-style branches — extend **ISI Capital Gate** + **ISI Liquidity stress** node; multidimensional slices (Quantrix-like) → scenario dimensions, not spreadsheet clone |
| SAP BPC / Tagetik | **Gap** at enterprise scale | Not needed for ISI lane; **guided FP&A bridge** = export snapshot + narrative |

### Forecasting & ML

| Reference tools | ISI today | Gap / ISI opportunity |
|-----------------|-----------|-------------------------|
| Prophet / XGBoost / DataRobot / H2O | **Gap** | **ISI Demand band module** (simple trend + external driver hooks) — optional Engine 1/3; no black-box ML on client pages |
| scikit-learn class | **Partial:** regression only | Ensemble = run 2–3 simple models, show band — internal only |

### Enterprise modeling & visualization

| Reference tools | ISI today | Gap / ISI opportunity |
|-----------------|-----------|-------------------------|
| Alteryx / Palantir | **Gap** | **ISI Engagement bus** already is the workflow; add **audit log** on publish |
| Tableau / Power BI | **Partial:** client summary + family dashboard | Client-ready **Print/PDF summary** — have; live BI = later server-side |
| SPSS Modeler | **Gap** | Use **explainable rules + MC** instead of opaque models |

---

## Mapping Daniel’s engagement examples → engines

| Engagement need | Primary engine | Programs to wire (examples) |
|-----------------|----------------|----------------------------|
| Financial analysis, CAPEX, WACC, probabilistic NPV | **Engine 2** | Capital Gate, WACC, CAPEX, D&A, NPV stack, tornado, MC, matrix |
| Turnaround, avoid bankruptcy | **Engine 2** (+ diligence lib) | Liquidity/d coverage tree, QoE, FCF, stress scenarios, **defer/hold matrix** |
| Decision analysis (capex, strategic bets) | **Engines 1–2** (+ matrix/trees) | Weighted matrices, EV trees, sensitivity, MC |
| Market share loss, poor quality, low throughput | **Engine 3** (+ stats) | Constraint ID, OEE/scrap/WIP, exploit vs capex, SPC gate, tornado, MC |
| Lean / DMAIC / Kaizen + PM | **Engine 3 + 5** | **ISI DMAIC phase gate**, Kaizen burst counter, roadmap/EVM from tools → bus nodes |
| Startup / runway / kill conditions | **Engine 4** | Unit economics, sequence, diligence |
| PM recovery, EVM, change control | **Engine 5** | EVM, capital diagnostic kit, risk register |

---

## Checklist → Task backlog (prioritized after engines 4–5 acceptance)

1. **Multi-scenario bus nodes** — wire `scenarios.html` logic into each engine (not siloed MC only).
2. **Two-way sensitivity** — `ISI.trees.twoWay` on Engine 2 NPV and Engine 3 lost $.
3. **Cross-domain edge** — ops weekly gap → financial Y1 CF shock (one directed edge, documented contract).
4. **ISI DMAIC / lean program names** — Engine 3 or 5 nodes tied to `roadmap.html` / interventions.
5. **SPC / capability** — stats procedures → Engine 3 quality branch.
6. **Risk register EMV** — `risk.html` → decision matrix input on engines 1–2.
7. **Influence diagram (client-safe)** — summary-only graph from bus `dependsOn`.
8. **Lightweight step simulation** — optional Engine 3 DES-style queue.
9. **Small LP optimizer** — capex portfolio under budget (Engine 2).
10. **Explainable narrative** — extend client summary sections per family (already started).

**AI-augmented decision support:** narrative from `synthesis.js` / packet templates — not LLM inside engines until policy set; keep **human-in-loop** consulting grade.

---

## Task directive line (paste into engine Tasks)

Scan `intelligence/COMMERCIAL-TOOL-GAP-SCAN.md` for **Gap** rows relevant to the **single engine id** you are building. Implement missing capability as **ISI-named bus nodes** calling existing `ISI.*` libraries. **Never** import or transcribe commercial tool code.
