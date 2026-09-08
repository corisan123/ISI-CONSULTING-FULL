/**
 * Tree page — Truth Collective visual structure (Phase 7)
 * Wraps existing decision-tree markup. Does not activate engines.
 */
import { DiagnosticLayout } from "../ui/layouts/DiagnosticLayout.js";
import { mountDiagnosticPage, onReady, placeholderRegion } from "../ui/layouts/adopt.js";
import { EngineTag } from "../ui/components/EngineTag.js";
import { Panel } from "../ui/components/Panel.js";
import { Card } from "../ui/components/Card.js";

function mount() {
  var layout = DiagnosticLayout({
    kicker: "Step 3 · Control system",
    title: "Decision Tree Control System",
    subtitle: "Engine tags below are visual labels. Activation still runs from the existing control system."
  });

  layout.tags.appendChild(EngineTag({ engine: "growth" }));
  layout.tags.appendChild(EngineTag({ engine: "expansion" }));
  layout.tags.appendChild(EngineTag({ engine: "alignment" }));

  var region = placeholderRegion("Engine placeholders");
  region.body.appendChild(
    Panel({
      title: "Three service engines",
      subtitle: "Growth · Expansion · Alignment",
      compact: true
    })
  );
  region.body.appendChild(
    Card({
      title: "Control output",
      body: "The live tree still renders into the existing results container in the slot below."
    })
  );
  layout.placeholders.appendChild(region);

  mountDiagnosticPage({ page: "tree", layout: layout });
}

onReady(mount);
