/**
 * Summary page — Truth Collective visual polish (Phase 7)
 * Wraps existing executive summary markup. Does not compute the deliverable.
 */
import { DiagnosticLayout } from "../ui/layouts/DiagnosticLayout.js";
import { mountDiagnosticPage, onReady, placeholderRegion } from "../ui/layouts/adopt.js";
import { Metric } from "../ui/components/Metric.js";
import { EngineTag } from "../ui/components/EngineTag.js";

function mount() {
  var layout = DiagnosticLayout({
    kicker: "Step 7 · Summary",
    title: "Executive Summary",
    subtitle: "Client-ready narrative, scores, priorities, and roadmap — written for a board-level read."
  });
  layout.classList.add("tc-summary-layout");

  layout.tags.appendChild(EngineTag({ engine: "growth" }));
  layout.tags.appendChild(EngineTag({ engine: "expansion" }));
  layout.tags.appendChild(EngineTag({ engine: "alignment" }));

  var metrics = placeholderRegion("At a glance");
  metrics.body.classList.add("tc-summary-metrics");
  metrics.body.appendChild(Metric({ label: "Archetype", value: "—", hint: "See narrative" }));
  metrics.body.appendChild(Metric({ label: "Top priority", value: "—", hint: "See list below" }));
  metrics.body.appendChild(Metric({ label: "Next phase", value: "—", hint: "See roadmap" }));
  layout.placeholders.appendChild(metrics);

  mountDiagnosticPage({ page: "summary", layout: layout });

  var output = document.getElementById("summaryOutput");
  if (output) output.classList.add("tc-summary-deliverable");
}

onReady(mount);
