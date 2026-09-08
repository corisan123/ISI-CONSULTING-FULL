/**
 * Scoring page — Truth Collective visual structure (Phase 7)
 * Wraps existing scoring results markup. Does not run or alter scoring.
 */
import { ResultsLayout } from "../ui/layouts/ResultsLayout.js";
import { mountDiagnosticPage, onReady, placeholderRegion } from "../ui/layouts/adopt.js";
import { Metric } from "../ui/components/Metric.js";
import { ScoreBar } from "../ui/components/ScoreBar.js";
import { Card } from "../ui/components/Card.js";

function mount() {
  var layout = ResultsLayout({
    kicker: "Step 2 · Scoring",
    title: "Diagnostic Scoring Results",
    subtitle: "Category scores from the existing scoring engine appear in the main column."
  });

  var region = placeholderRegion("Metric placeholders");
  region.body.appendChild(Metric({ label: "Revenue Engine", value: "—", hint: "Placeholder" }));
  region.body.appendChild(Metric({ label: "Margin Health", value: "—", hint: "Placeholder" }));
  region.body.appendChild(Metric({ label: "Operations", value: "—", hint: "Placeholder" }));
  region.body.appendChild(Metric({ label: "Leadership", value: "—", hint: "Placeholder" }));
  region.body.appendChild(ScoreBar({ label: "Overall", value: 0 }));
  layout.placeholders.appendChild(region);

  var note = placeholderRegion("Score surface");
  note.body.appendChild(
    Card({
      title: "Live results",
      body: "The scoring engine still writes into the results container below. These tiles are structure only."
    })
  );
  layout.placeholders.appendChild(note);

  mountDiagnosticPage({ page: "scoring", layout: layout });
}

onReady(mount);
