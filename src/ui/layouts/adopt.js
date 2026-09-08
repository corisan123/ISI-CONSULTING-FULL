/**
 * Layout helpers — Truth Collective (Phase 7)
 * Moves existing page nodes into a layout slot. Does not touch engine code.
 */
import { applyCssVars } from "../designSystem.js";
import { AppShell, adoptShell } from "./AppShell.js";
import { Panel } from "../components/Panel.js";

export function placeholderRegion(label) {
  var wrap = Panel({
    className: "tc-placeholder-region",
    compact: true
  });
  wrap.setAttribute("data-placeholder", "true");

  var body = wrap.querySelector(".tc-panel__body");
  var cap = document.createElement("p");
  cap.className = "tc-caption tc-placeholder-region__label";
  cap.textContent = label || "Visual placeholder";
  body.appendChild(cap);

  var inner = document.createElement("div");
  inner.className = "tc-placeholder-region__body";
  body.appendChild(inner);

  wrap.body = inner;
  return wrap;
}

export function adoptExistingPage(layout) {
  var page = document.querySelector(".isi-page");
  if (!page || !layout) return null;

  page.classList.add("tc-page");
  var heading = page.querySelector(":scope > h2, :scope > h1");
  if (heading) heading.classList.add("tc-legacy-title");

  var dest = layout.slot || layout.main;
  while (page.firstChild) dest.appendChild(page.firstChild);
  page.appendChild(layout);
  return page;
}

export function mountDiagnosticPage(options) {
  options = options || {};
  if (document.body.dataset.tcMounted) return options.layout;

  document.body.dataset.tcMounted = options.page || "1";
  applyCssVars(document.documentElement);

  var shell = AppShell({ page: options.page });
  adoptShell(shell);

  var layout = options.layout;
  if (!layout) return shell;

  var page = document.querySelector(".isi-page");
  if (page) {
    adoptExistingPage(layout);
  } else {
    var root = document.getElementById("tc-page-root") || shell.content;
    root.appendChild(layout);
  }
  return layout;
}

export function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}
