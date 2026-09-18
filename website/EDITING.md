# Edit the ISI site without touching HTML

**Claude copy file (this is the one to open):** `website/COPY-FOR-CLAUDE.md`

Change sentences there. Then tell Desktop to sync and commit. Do not let Claude rewrite the HTML or the engines.

## How to open the site without corrupting files

Use the browser. Bookmark URLs. Do not Save As into GitHub. Staff map: `intelligence/ACCESS.md` and `/internal/training.html`.

Open `website/content.json` for phone, email, hours, and homepage sentences.

## Contact, phone, email

Open `website/content.json`. Change `phone`, `email`, `hours`. Save. After deploy, every page that loads `js/site.js` picks this up.

## Logo and favicon

Replace these files. Keep the **same file names**:

- `website/images/logo.png` — header mark
- `website/images/favicon.png` — browser tab icon

Square PNG, navy `#0F1F3D` and gold `#C9A235`.

## Photos (grayscale until hover)

Replace, same names:

- `website/images/fractional-bd.jpg`
- `website/images/construction-aec.jpg`
- `website/images/manufacturing-shop.jpg`
- `website/images/engagement-table.jpg`
- `website/images/program-commercial.jpg`
- `website/images/program-strategy.jpg`
- `website/images/program-finance.jpg`
- `website/images/program-pm.jpg`
- `website/images/program-coaching.jpg`
- `website/images/program-startup.jpg`
- `website/images/program-dashboard.jpg` — demonstration desk / KPI home view

Wide photos (16:9) look best. Do not name employers or clients in file names or alt text.

## Method diagrams (ISI programs)

These are drawings, not the live engines. Replace the `.svg` files if you have better art:

- `website/images/monte-carlo.svg`
- `website/images/benchmarking.svg`
- `website/images/mece.svg`
- `website/images/decision-tree.svg`
- `website/images/decision-matrix.svg`

## What not to do

Do not paste live Monte Carlo, trees, or matrices onto the public site. Pictures of the method and a demonstration desk (a few live toys, the rest grey) are fine. The working programs stay in `/internal/`. The public diagnostic is a glimpse, not the full kit. Never name specific companies without a signed waiver.
