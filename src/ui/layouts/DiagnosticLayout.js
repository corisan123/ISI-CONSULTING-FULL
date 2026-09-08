/**
 * DiagnosticLayout — Truth Collective layout (Phase 7)
 * Intro Panel + placeholder stack + content Card.
 */
import { Panel } from "../components/Panel.js";
import { Card } from "../components/Card.js";

export function DiagnosticLayout(options) {
  options = options || {};
  var root = document.createElement("div");
  root.className = "tc-diagnostic-layout";

  var introInner = document.createElement("div");
  introInner.className = "tc-diagnostic-layout__intro-inner";

  var kicker = document.createElement("p");
  kicker.className = "tc-caption tc-diagnostic-layout__kicker";
  kicker.textContent = options.kicker || "ISI Diagnostic";
  introInner.appendChild(kicker);

  var title = document.createElement("h1");
  title.className = "tc-h1 tc-diagnostic-layout__title";
  title.textContent = options.title || "";
  introInner.appendChild(title);

  if (options.subtitle) {
    var subtitle = document.createElement("p");
    subtitle.className = "tc-body tc-diagnostic-layout__subtitle";
    subtitle.textContent = options.subtitle;
    introInner.appendChild(subtitle);
  }

  var tags = document.createElement("div");
  tags.className = "tc-diagnostic-layout__tags";
  introInner.appendChild(tags);

  var intro = Panel({
    className: "tc-diagnostic-layout__intro",
    children: introInner
  });

  var placeholders = document.createElement("div");
  placeholders.className = "tc-diagnostic-layout__placeholders";

  var slot = Card({ className: "tc-diagnostic-layout__content" });

  root.appendChild(intro);
  root.appendChild(placeholders);
  root.appendChild(slot);

  root.header = intro;
  root.tags = tags;
  root.placeholders = placeholders;
  root.slot = slot;
  root.main = slot;
  return root;
}

export default DiagnosticLayout;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.DiagnosticLayout = DiagnosticLayout;
}
