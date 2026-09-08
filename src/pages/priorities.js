/**
 * Priorities page — Truth Collective visual structure (Phase 7)
 * Wraps existing priority list markup. Does not rank or generate initiatives.
 */
import { DiagnosticLayout } from "../ui/layouts/DiagnosticLayout.js";
import { mountDiagnosticPage, onReady, placeholderRegion } from "../ui/layouts/adopt.js";
import { InitiativeBlock } from "../ui/components/InitiativeBlock.js";
import { EngineTag } from "../ui/components/EngineTag.js";
import { Card } from "../ui/components/Card.js";

function mount() {
  var layout = DiagnosticLayout({
    kicker: "Step 4 · Priorities",
    title: "Priority Recommendations",
    subtitle: "Ranked initiatives from the existing engine still render in the list below."
  });

  layout.tags.appendChild(EngineTag({ engine: "growth" }));
  layout.tags.appendChild(EngineTag({ engine: "expansion" }));
  layout.tags.appendChild(EngineTag({ engine: "alignment" }));

  var region = placeholderRegion("Initiative placeholders");
  region.body.appendChild(
    InitiativeBlock({
      title: "Initiative placeholder",
      description: "Visual block only. Live priorities continue to fill the existing list.",
      engine: "growth"
    })
  );
  region.body.appendChild(
    InitiativeBlock({
      title: "Second initiative placeholder",
      description: "Shows spacing, gold accent, and engine tag treatment.",
      engine: "alignment"
    })
  );
  region.body.appendChild(
    Card({
      title: "Live list",
      body: "The existing ranked-initiative container stays in the content slot."
    })
  );
  layout.placeholders.appendChild(region);

  mountDiagnosticPage({ page: "priorities", layout: layout });
}

onReady(mount);
