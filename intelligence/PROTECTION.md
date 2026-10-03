# Protection model

Three tiers. Everything Cursor builds is classified into one.

## Public (`/website/`, pretty URLs)

Marketing. Capability in, reproducibility out.

- Method description, program **screens** (stylized sample output), photography, and the high-level diagnostic Q&A already on public pages.
- These describe what ISI does and show what output looks like. They do not calculate.
- No links to `/internal/`, `/src/`, `/client/`, or working diagnostic engines.
- Copy from `website/content.json` (`data-copy` on the homepage).
- No employer or client names.

## Gated (engagement sequence)

- Client intake and diagnostic questionnaires (`/website/forms/`, `/intake`). Not a public toolkit.
- Client results dashboard (`/client/resolution.html`): that project's KPIs, probability band, constraints, 90-day load. Configured at intake. Delivered at a milestone, tollgate, or close.
- Client sees findings and a high-level synopsis. Not weights, formulas, or model architecture.

## Internal (`/internal/`, `/src/`, `/intelligence/`)

The engines. Scoring weights, distributions, decision logic, formula architecture, initiative library, models.

- Fully coded on the practice bench. `noindex`. Not in the public footer or ads.
- Never copied into public JS. View Source on a marketing page must not yield the method.
- Until a server exists, engines may run in `/internal/` only. Public and gated client pages must not execute them.

## Code and crawl

`robots.txt` disallows `/internal/`, `/client/`, `/src/`, `/intelligence/`, `/diagnostic/`.
Working engines stay under `/internal/` and are never linked from marketing.
