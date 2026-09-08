/**
 * Dashboard page — Truth Collective visual polish (Phase 7)
 * Wraps existing dashboard markup. Does not compute the snapshot.
 */
import { ResultsLayout } from "../ui/layouts/ResultsLayout.js";
import { mountDiagnosticPage, onReady, placeholderRegion } from "../ui/layouts/adopt.js";
import { Metric } from "../ui/components/Metric.js";
import { ScoreBar } from "../ui/components/ScoreBar.js";
import { EngineTag } from "../ui/components/EngineTag.js";

function mount() {
  var layout = ResultsLayout({
    kicker: "Step 6 · Dashboard",
    title: "Diagnostic Dashboard",
    subtitle: "Executive snapshot of ratings, activated engines, top priority, and next phase."
  });

  layout.tags.appendChild(EngineTag({ engine: "growth" }));
  layout.tags.appendChild(EngineTag({ engine: "expansion" }));
  layout.tags.appendChild(EngineTag({ engine: "alignment" }));

  var region = placeholderRegion("Dashboard metrics");
  region.body.appendChild(Metric({ label: "Revenue", value: "—", hint: "Live rating below" }));
  region.body.appendChild(Metric({ label: "Margin", value: "—", hint: "Live rating below" }));
  region.body.appendChild(Metric({ label: "Operations", value: "—", hint: "Live rating below" }));
  region.body.appendChild(Metric({ label: "Leadership", value: "—", hint: "Live rating below" }));
  region.body.appendChild(ScoreBar({ label: "Overall", value: 0 }));
  layout.placeholders.appendChild(region);

  mountDiagnosticPage({ page: "dashboard", layout: layout });

  var output = document.getElementById("dashboardOutput");
  if (output) output.classList.add("tc-dashboard-grid");
}

onReady(mount);
