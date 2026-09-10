# ISI Consulting — Deployment Guide

**Stack:** static HTML + CSS + vanilla JS. **No build step.**

Serve the **repository root** of `ISI-CONSULTING-FULL`. Do not set the host root to `website/`. Absolute URLs (`/src/...`, `/diagnostic/...`, `/website/...`) will 404 if the server root is wrong. `file://` cannot fetch engine JSON.

## Production layout

| Path | Role |
|------|------|
| `/` → `/website/index.html` | Marketing homepage (redirect; root `index.html` is not the diagnostic) |
| `/website/*.html` | Marketing, forms, schedule, legal |
| `/diagnostic/input.html` | Diagnostic input (entry) |
| `/diagnostic/*.html` | Scoring through summary and packet |
| `/404.html` | Real not-found page (not the diagnostic form) |
| `/src/engines/` | Growth, Expansion, Alignment + orchestrator |
| `/src/data/` and `/src/data/engines/` | Models (must be published) |
| `/src/styles/isi.css` | Diagnostic stylesheet |
| `/src/components/` | Header / nav HTML fragments |
| `/assets/` | Optional |

Architecture: **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Local preview

```bash
cd /path/to/ISI-CONSULTING-FULL
python3 -m http.server 8080
```

Open `http://localhost:8080/website/index.html`. Diagnostic entry: `http://localhost:8080/diagnostic/input.html`. Save Input → scoring → **Run Multi-Engine Tree** → continue through summary.

## Hosting on Vercel

1. Import the Git repo. **Root Directory:** blank (repo root).
2. **Build Command:** empty. **Output Directory:** empty / `.`.
3. Framework Preset: **Other**.

`vercel.json` at repo root **disables** clean URLs so `/diagnostic/scoring.html` is the only canonical form. Do not add a rewrite that hides `/src`. Do not add `/* → /index.html`.

## Hosting on Netlify

1. Base directory: repo root. Build command: empty. Publish directory: `.`

`netlify.toml` is in the repo.

## Hosting on Cloudflare Pages

**Do not** set Root Directory to `isi-consulting/website`, `website/`, or `src/`. Those are not the production app.

| Cloudflare setting | Value |
|--------------------|--------|
| Repository | `corisan123/ISI-CONSULTING-FULL` (this repo) |
| Production branch | `main` |
| Framework preset | **None** |
| Root directory | **empty** (repository root `/`) |
| Build command | **empty** / skipped |
| Build output directory | **`/`** (same as `.` — there is no compiled `dist/`) |

The marketing homepage lives at `/website/index.html`. `_redirects` sends `/` there. Absolute URLs (`/src/ui/theme.css`, `/diagnostic/packet.html`, `/src/packet/packetEngine.js`) only work if Pages publishes the whole repo from `/`.

**Required files in the published output:** `_redirects`, `_headers`, `404.html`, `robots.txt`. Confirm the deployed output does **not** contain `/* /index.html 200` (SPA catch-all). If a dashboard Redirect Rule or Pages “SPA / not found” setting still maps unknown paths to `/index.html`, delete it — the GitHub deploy will otherwise keep serving the diagnostic form for broken links.

After connect: Pages → project → **Settings → Builds & deployment**. Clear any leftover Root Directory (`isi-consulting/website`). Framework preset **None**. Save. **Retry deployment** from `main`.

If Copilot connected or reversed GitHub yesterday: confirm the Pages project still points at `corisan123/ISI-CONSULTING-FULL`, branch `main`, empty root. Disable **GitHub Pages** on that repo if Cloudflare is the intended host — `https://corisan123.github.io/ISI-CONSULTING-FULL/` was live on 9 Sep 2026 and is a second public copy.

Network 200s unique to later phases: `/src/ui/theme.css`, `/diagnostic/packet.html`, `/src/packet/packetEngine.js`.

## Hosting on GitHub Pages

Deploy from the **repository root** (or `docs/` only if you copy the full tree). Project Pages under a subpath break absolute `/src` fetches unless you use a custom domain at site root.

## What must be published

| Path | Required |
|------|----------|
| `index.html` | Yes (redirects `/` to `/website/index.html`) |
| `404.html`, `_redirects`, `_headers`, `robots.txt` | Yes |
| `diagnostic/*.html` | Yes |
| `website/` | Yes — homepage and marketing |
| `src/**` including `src/engines/` and `src/data/engines/*.json` | Yes |
| `website/` | If marketing/forms/schedule links matter |
| `archive/` | No |

Network 200s after deploy:

- `/src/styles/isi.css`
- `/src/components/isiHeader.html`, `isiNav.html`
- `/src/data/scoringModel.json`
- `/src/data/decisionControl.json`
- `/src/data/engines/growthModel.json`
- `/src/data/engines/expansionModel.json`
- `/src/data/engines/alignmentModel.json`

## sessionStorage (client-only)

`isi_input`, `isi_scoringResults`, `isi_decisionTree`, `isi_engines`, `isi_prioritization`, `isi_roadmap`. Dual-write of `isi_diagnosticInput` remains for older sessions.

## Smoke checklist

1. `/` redirects to `/website/index.html` (marketing home). `/this-is-not-a-page` serves `404.html`, not the diagnostic form.
2. `/diagnostic/input.html` loads input + header/nav; strategic context selects are required.
3. Save Input → `/diagnostic/scoring.html`; Run Scoring.
4. Decision tree page: **Run Multi-Engine Tree** — more than one engine may activate.
5. Priorities show firm + engine tags; roadmap phases are not identical copies.
6. Dashboard/summary show binding constraint and activated engines.
7. No 404s for `/src/engines/*.js` or `/src/data/engines/*.json`.

## Marketing site

Diagnostic CTAs should point to `/diagnostic/input.html`. Discovery / Schedule: `/website/forms/discovery.html`, `/website/schedule.html`.

## Squarespace / WordPress

See **INTEGRATION-SQUARESPACE-WORDPRESS.md**. Keep the diagnostic on this static host; link “Start Diagnostic” to `/diagnostic/input.html`.
