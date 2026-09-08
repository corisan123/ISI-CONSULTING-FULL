/**
 * Packet page — Phase 9 visual shell. Does not compute diagnostic data.
 */
import { DiagnosticLayout } from "../ui/layouts/DiagnosticLayout.js";
import { mountDiagnosticPage, onReady } from "../ui/layouts/adopt.js";
import packetEngine from "../packet/packetEngine.js";

function mount() {
  var layout = DiagnosticLayout({
    kicker: "Client packet",
    title: "Diagnostic Packet",
    subtitle: "Confidential, contract-ready assembly of narrative, results, roadmap, and illustrative ROI."
  });
  mountDiagnosticPage({ page: "packet", layout: layout });
}

async function paint() {
  var host = document.getElementById("packetOutput");
  if (!host) return;
  host.textContent = "Assembling packet…";
  try {
    var packet = await packetEngine.assembleFromSession();
    packetEngine.renderPacket(host, packet);
  } catch (err) {
    host.textContent = "Unable to assemble the packet. Complete scoring, decision tree, prioritization, and roadmap first.";
  }
}

onReady(function () {
  mount();
  paint();
});
