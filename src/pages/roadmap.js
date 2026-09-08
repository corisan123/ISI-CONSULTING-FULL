/**
 * Roadmap page — Truth Collective visual polish (Phase 7)
 * Wraps existing roadmap markup. Does not build roadmap data.
 */
import { DiagnosticLayout } from "../ui/layouts/DiagnosticLayout.js";
import { mountDiagnosticPage, onReady, placeholderRegion } from "../ui/layouts/adopt.js";
import { RoadmapPhase } from "../ui/components/RoadmapPhase.js";
import { EngineTag } from "../ui/components/EngineTag.js";

function mount() {
  var layout = DiagnosticLayout({
    kicker: "Step 5 · Roadmap",
    title: "Execution Roadmap",
    subtitle: "30 / 60 / 90 / 180-day phases. Live plan from the existing builder renders in the track below."
  });

  layout.tags.appendChild(EngineTag({ engine: "growth" }));
  layout.tags.appendChild(EngineTag({ engine: "expansion" }));
  layout.tags.appendChild(EngineTag({ engine: "alignment" }));

  var region = placeholderRegion("Phase rhythm");
  region.body.classList.add("tc-roadmap-preview");
  region.body.appendChild(
    RoadmapPhase({
      phase: 1,
      title: "30 days",
      focus: "Stabilize and confirm the binding constraint.",
      items: ["Stand up the operating cadence"]
    })
  );
  region.body.appendChild(
    RoadmapPhase({
      phase: 2,
      title: "60 days",
      focus: "Convert diagnosis into owned work.",
      items: ["Assign initiative owners"]
    })
  );
  layout.placeholders.appendChild(region);

  mountDiagnosticPage({ page: "roadmap", layout: layout });

  var output = document.getElementById("roadmapOutput");
  if (output) output.classList.add("tc-roadmap-track");
}

onReady(mount);
