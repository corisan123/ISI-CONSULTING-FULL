# Inventory — live, coded, accepts input

Status: **working in the browser** (sessionStorage). Not live on isiconsults.com until commit + push. Public pages hide source paths. Staff pages accept numbers.

## A. Client-first website (marketing)

| Page | Accepts input? | What it is |
| --- | --- | --- |
| `/website/index.html` (site home) | No (copy + peek desk) | Fractional Business Development tollgate, program photos, demonstration dashboard image |
| `/website/about.html` | No | Operator track record by **sector**, not employer |
| `/website/services/index.html` | No | Catalog. Flagship = fractional Business Development |
| `/website/services/fractional-business-development.html` | No | Tollgate offer |
| `/website/programs.html` | Click-through | Photos of each program + desk home view |
| `/website/peek.html` | **Yes — three toys only** | Win rate, 3-year NPV, CPI/SPI. All other tools grey |
| `/website/start.html` | Toggle + chips | Consult vs intake routing |
| `/website/forms/client-intake.html` | **Yes** | Nine-section intake → `isi_clientIntake` |
| `/website/forms/discovery.html` | **Yes** | Metrics toward diagnostic |
| `/website/contact.html` | Form UI (no server mail yet) | Phone, email, Calendly |
| `/website/system.html` | No | Unified Growth System in words |
| `/website/problems.html` | No | Symptom patterns |
| `/website/faq.html` | Accordion | Questions |
| `/website/legal/*` | No | Terms, privacy, disclaimer, NDA notice |
| `/website/content.json` | Edited by staff | Phone, email, homepage `copy` keys |

Peek toys are **not** the engagement engines. They are a marketing glimpse.

## B. Diagnostic glimpse (public, limited)

| Page | Accepts input? | What it is |
| --- | --- | --- |
| `/diagnostic/input.html` | **Yes** | Growth & Turnaround input → scoring |
| `/diagnostic/scoring.html` | Derived | Scores from input |
| `/diagnostic/finance.html` | Derived | Finance tab on the glimpse |
| `/diagnostic/decisionTree.html` | Derived | Tree on the glimpse |
| `/diagnostic/prioritization.html` | Derived | Priorities |
| `/diagnostic/roadmap.html` | Derived | Roadmap |
| `/diagnostic/dashboard.html` | Derived | Snapshot (developer console removed) |
| `/diagnostic/summary.html` | Derived | Summary |
| `/diagnostic/packet.html` | Derived | Packet preview |

Labeled as a glimpse. Not the full internal suite.

## C. Staff bench (engagement — fully coded)

### Control

| Page | Accepts input? | Role |
| --- | --- | --- |
| `/internal/index.html` | **Yes** | Company, constraint family, session |
| `/internal/study.html` | **Yes** | Study type → workstreams, MECE, methods, proof |
| `/internal/pipeline.html` | **Yes** (run) | Ten-program chain, one bus |
| `/internal/toolbox.html` | **Yes** | A-la-carte formulas and programs |
| `/internal/programs.html` | Links | Constraint catalog |
| `/internal/results.html` | Reads session | Practice results |
| `/internal/packet.html` | Reads bus | Study 1-pager |

### Diagnostics

| Page | Accepts input? | Algorithm |
| --- | --- | --- |
| `/internal/diagnostics/rootcause.html` | **Yes** | KEEP / WEAK / KILL |
| `/internal/diagnostics/diligence.html` | **Yes** | Liquidity, DSCR, CCC, QoE, NPV, STOP/CAUTION/GO |
| `/internal/diagnostics/margin.html` | **Yes** | NPV, IRR, payback, PI |
| `/internal/diagnostics/operations.html` | **Yes** | Constraint, OEE, scrap, WIP, OTIF |
| `/internal/diagnostics/capital.html` | **Yes** | CPI, SPI, EAC, VAC, TCPI |
| `/internal/diagnostics/supply.html` | **Yes** | Turns, DOH, MAPE, trapped capital |

### Tools and Excel-class programs

| Page | Accepts input? | Role |
| --- | --- | --- |
| `/internal/tools/finance.html` | **Yes** | NPV, PV, IRR, MIRR, WACC, ROI, tornado |
| `/internal/tools/roi-throughput.html` | **Yes** | T, I, OE, exploit vs capex |
| `/internal/tools/regression.html` | **Yes** | OLS, R², LINEST equivalent |
| `/internal/tools/stats.html` | **Yes** | 15+ procedures, SPC, tests |
| `/internal/tools/mece.html` | **Yes** | Issue trees, overlap audit |
| `/internal/tools/matrix.html` | **Yes** | Chain matrix + a-la-carte scorer |
| `/internal/tools/trees.html` | **Yes** | EV, diagnostic, constraint, stage-gate, win-loss |
| `/internal/tools/montecarlo.html` | **Yes** | Seeded P10/P50/P90 |
| `/internal/tools/sensitivity.html` | **Yes** | Tornado, two-way |
| `/internal/tools/scenarios.html` | **Yes** | Base / up / down / stress |
| `/internal/tools/pivot.html` | **Yes** | Group, CSV, Excel XML |
| `/internal/tools/roadmap.html` | **Yes** | Timeline, swimlane, kanban |
| `/internal/tools/ppm.html` | **Yes** | Portfolio trade-offs |
| `/internal/tools/risk.html` | **Yes** | EMV register |
| `/internal/tools/kpis.html` | **Yes** | Activate measures by kit |
| `/internal/tools/supply-chain.html` | **Yes** | Flow / inventory map |
| `/internal/tools/interventions.html` | Reads intake | Modules fire from gaps |

### Documents (templates, not legal advice)

| Page | Accepts input? | Role |
| --- | --- | --- |
| `/internal/documents/nda.html` | **Yes** | Fill names, print |
| `/internal/documents/sow.html` | **Yes** | Scope skeleton |
| `/internal/documents/exclusivity.html` | **Yes** | Letter skeleton |

## D. Client room (what leadership sees)

| Page | Accepts input? | Role |
| --- | --- | --- |
| `/client/index.html` | Reads session | Diligence path in plain language |
| `/client/resolution.html` | Reads session | **Resolution dashboard**: unique constraints, KPIs, P10/P50/P90 if run, killed stories once, 90-day implementation load, print |

## Throughput of an engagement (expected result)

Intake facts → diagnosis (keep/kill) → diligence gate → matched kit → quantified path → unique constraint list → 90-day owners → packet + resolution dashboard in the room.

If diligence is STOP, the growth thesis is recast before kits are sold.
