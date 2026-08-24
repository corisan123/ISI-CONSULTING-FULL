# Squarespace + WordPress — “Run Diagnostic” Integration

The diagnostic is a **static app** hosted separately (Vercel / Netlify / GitHub Pages / Azure Static Web Apps).  
Squarespace (isiconsults.com) and WordPress only need a **button or link** that opens the diagnostic entry URL.

**Production entry:** `https://YOUR-DIAGNOSTIC-DOMAIN/`  
(or `https://YOUR-DIAGNOSTIC-DOMAIN/diagnostic/input.html`)

Replace `YOUR-DIAGNOSTIC-DOMAIN` with your live host after deploy.

---

## Squarespace (ISI Consulting)

### Option A — Button block (recommended)

1. Edit the page (Home, Services, or Diagnostic flagship).
2. Add a **Button** block.
3. Label: **Run Diagnostic**
4. Link: `https://YOUR-DIAGNOSTIC-DOMAIN/`
5. Open in: **New tab** (recommended so the marketing site stays open).
6. Style: primary / filled to match navy brand.

### Option B — Text link

```html
<a href="https://YOUR-DIAGNOSTIC-DOMAIN/" target="_blank" rel="noopener">Run Diagnostic</a>
```

Paste via a **Code** block if you need custom HTML.

### Option C — Code block styled like ISI

```html
<a
  href="https://YOUR-DIAGNOSTIC-DOMAIN/"
  target="_blank"
  rel="noopener noreferrer"
  style="
    display:inline-block;
    background:#003366;
    color:#fff;
    font-family:Inter, system-ui, sans-serif;
    font-weight:500;
    font-size:16px;
    padding:14px 22px;
    border-radius:8px;
    text-decoration:none;
  "
>Run Diagnostic</a>
```

### Notes for Squarespace

- Do **not** embed the full diagnostic inside Squarespace iframes unless you accept sessionStorage quirks cross-origin.
- Prefer a full navigation to the diagnostic host.
- After Vercel deploy, update the button URL once and reuse site-wide.

---

## WordPress

### Option A — Button block (Gutenberg)

1. Add a **Buttons** block.
2. Text: **Run Diagnostic**
3. Link: `https://YOUR-DIAGNOSTIC-DOMAIN/`
4. Open in new tab.

### Option B — Custom HTML block

```html
<a class="isi-run-diagnostic" href="https://YOUR-DIAGNOSTIC-DOMAIN/" target="_blank" rel="noopener noreferrer">
  Run Diagnostic
</a>
```

Add CSS in Appearance → Customize → Additional CSS:

```css
.isi-run-diagnostic {
  display: inline-block;
  background: #003366;
  color: #fff !important;
  font-weight: 500;
  padding: 14px 22px;
  border-radius: 8px;
  text-decoration: none;
}
.isi-run-diagnostic:hover {
  background: #004080;
}
```

### Option C — Menu item

Appearance → Menus → add Custom Link → URL = diagnostic root → Label = **Run Diagnostic**.

---

## What not to do

- Do not copy `/src` files into Squarespace/WordPress theme folders.
- Do not expect Squarespace form blocks to drive the diagnostic engine.
- Do not use `file://` links.

The marketing site sells and routes. The diagnostic host runs the product.
