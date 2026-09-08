/**
 * Input page — Truth Collective visual structure (Phase 7)
 * Wraps existing diagnostic input markup. Does not change save/validate logic.
 */
import { DiagnosticLayout } from "../ui/layouts/DiagnosticLayout.js";
import { mountDiagnosticPage, onReady, placeholderRegion } from "../ui/layouts/adopt.js";
import { Card } from "../ui/components/Card.js";
import { Panel } from "../ui/components/Panel.js";
import { EngineTag } from "../ui/components/EngineTag.js";

function mount() {
  var layout = DiagnosticLayout({
    kicker: "Step 1 · Input",
    title: "Business Diagnostic Input",
    subtitle: "Financial, commercial, and operational metrics that feed scoring."
  });

  layout.tags.appendChild(EngineTag({ engine: "growth" }));
  layout.tags.appendChild(EngineTag({ engine: "expansion" }));
  layout.tags.appendChild(EngineTag({ engine: "alignment" }));

  var region = placeholderRegion("Layout placeholders");
  region.body.appendChild(
    Panel({
      title: "How this step is used",
      subtitle: "Placeholder panel — existing form stays in the content slot below.",
      compact: true
    })
  );
  region.body.appendChild(
    Card({
      title: "In-browser only",
      body: "Values stay in sessionStorage on this device until you run scoring."
    })
  );
  layout.placeholders.appendChild(region);

  mountDiagnosticPage({ page: "input", layout: layout });
}

onReady(mount);
