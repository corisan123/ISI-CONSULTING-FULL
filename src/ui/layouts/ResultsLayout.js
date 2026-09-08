/**
 * ResultsLayout — Truth Collective layout (Phase 7)
 * Sidebar Panel (metrics) + main Card (live results).
 */
import { DiagnosticLayout } from "./DiagnosticLayout.js";
import { Panel } from "../components/Panel.js";

export function ResultsLayout(options) {
  var layout = DiagnosticLayout(options);
  layout.classList.add("tc-results-host");

  var split = document.createElement("div");
  split.className = "tc-results-layout";

  var sidebar = Panel({
    className: "tc-results-layout__sidebar",
    compact: true
  });
  var sidebarBody = sidebar.querySelector(".tc-panel__body");
  layout.placeholders.classList.add("tc-results-layout__metrics");
  sidebarBody.appendChild(layout.placeholders);

  layout.slot.classList.add("tc-results-layout__main");

  split.appendChild(sidebar);
  split.appendChild(layout.slot);
  layout.appendChild(split);

  layout.sidebar = sidebar;
  layout.main = layout.slot;
  layout.split = split;
  return layout;
}

export default ResultsLayout;

if (typeof window !== "undefined") {
  window.ISIUI = window.ISIUI || {};
  window.ISIUI.ResultsLayout = ResultsLayout;
}
