/**
 * Tree page — layout chrome around the live decision-tree visual.
 * Does not activate engines; src/decisionTree.js owns the path math and SVG.
 */
import { DiagnosticLayout } from "../ui/layouts/DiagnosticLayout.js";
import { mountDiagnosticPage, onReady } from "../ui/layouts/adopt.js";
import { EngineTag } from "../ui/components/EngineTag.js";

function mount() {
  var layout = DiagnosticLayout({
    kicker: "Step 3 · Control system",
    title: "Decision Tree Control System",
    subtitle:
      "Live path through quantitative, qualitative, and strategic tests. Gold is taken; gray was tested and not taken."
  });

  layout.tags.appendChild(EngineTag({ engine: "growth" }));
  layout.tags.appendChild(EngineTag({ engine: "expansion" }));
  layout.tags.appendChild(EngineTag({ engine: "alignment" }));

  mountDiagnosticPage({ page: "tree", layout: layout });

  if (typeof window.displayDecisionTree === "function") {
    window.displayDecisionTree();
  }
}

onReady(mount);
