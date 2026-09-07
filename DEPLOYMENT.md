# ISI Consulting - Deployment Guide (Stage 4 / Block 4D)

**Stack:** static HTML + CSS + vanilla JS. **No build step.**
No package manager or SPA/SSR framework required for the diagnostic.

## Production layout (canonical)

- `/index.html` — entry (diagnostic input)
- `/diagnostic/` — full diagnostic flow
- `/src/` — components, engines, styles, data, page JS
- `/assets/` — optional static assets
- `/website/` — Stage 1 marketing site (kept; not production entry)

Serve the **project root** (`isi-consulting/`), not `website/`.

## Local preview

```bash
cd /path/to/isi-consulting
python3 -m http.server 8080
```

Open `http://localhost:8080/` then walk `/diagnostic/scoring.html` through `/diagnostic/summary.html`.

Absolute paths (`/src/...`, `/diagnostic/...`) require serving from project root. `file://` will not load `/src` fetches.

## Hosting on Vercel

1. Import the Git repo (or CLI from project root).
2. **Root Directory:** leave blank / project root (do **not** set to `website/`).
3. **Build Command:** leave empty (no build).
4. **Output Directory:** leave empty / `.` (static files as-is).
5. Framework Preset: **Other**.
6. Deploy. Entry URL serves `/index.html` as diagnostic input.

Optional `vercel.json`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

## Hosting on Netlify

1. New site from Git (or drag-and-drop the project folder).
2. **Base directory:** project root.
3. **Build command:** empty.
4. **Publish directory:** `.`
5. Deploy.

Optional `netlify.toml`:

```toml
[build]
  publish = "."
  command = ""
```

## Hosting on GitHub Pages

1. Push repo to GitHub.
2. Settings > Pages > Deploy from branch.
3. Source folder must be the **repository root** (or `docs/` if used).
4. Project pages under a repo subpath resolve absolute `/` to the domain root. Prefer a custom domain or user/org site root for absolute paths.

## What must be published

| Path | Required |
|------|----------|
| `index.html` | Yes - entry |
| `diagnostic/*.html` | Yes |
| `src/**` (JS, CSS, components, `data/*.json`) | Yes - engines fetch JSON |
| `assets/` | Optional |
| `website/` | Optional for Stage 1; keep for forms/schedule links |

Do **not** omit `src/data/*.json` - engines load models via fetch of `/src/data/...`.

## sessionStorage keys (client-only)

| Key | Writer |
|-----|--------|
| `isi_input` | Input (`diagnostic-input.js`); dual-writes legacy `isi_diagnosticInput` |
| `isi_scoringResults` | Scoring |
| `isi_decisionTree` | Decision tree |
| `isi_prioritization` | Prioritization |
| `isi_roadmap` | Roadmap |

Nothing is posted to a server in Stage 1-4. Export / CRM / webhook / cloud hooks are stubs.

## Smoke checklist after deploy

1. `/` loads input form + header/nav.
2. Save Input navigates to `/diagnostic/scoring.html`.
3. Run Scoring; Continue through decision tree, prioritization, roadmap, dashboard, summary.
4. Network: `/src/styles/isi.css`, `/src/components/*.html`, `/src/data/*.json` return 200.
5. No 404s for `/src/...` or `/diagnostic/...`.

## Marketing site

`website/` remains the Stage 1 marketing / forms site. Production diagnostic entry is **root** `/`.
Links from diagnostic to Discovery / Schedule use `/website/forms/discovery.html` and `/website/schedule.html`.

## Squarespace / WordPress

See **INTEGRATION-SQUARESPACE-WORDPRESS.md**.

Add a **Run Diagnostic** button on isiconsults.com (or WordPress) pointing to the deployed diagnostic root URL. Keep the diagnostic on its own static host.
