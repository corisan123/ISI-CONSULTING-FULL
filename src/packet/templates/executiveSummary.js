/**
 * Packet executive summary — grades, stats, canvas-rendered narrative.
 */
import { renderNarrativeCanvas } from "../protect.js";

function metric(label, value) {
  var el = document.createElement("div");
  el.className = "isi-packet-metric";
  var l = document.createElement("span");
  l.className = "isi-packet-metric__label";
  l.textContent = label;
  var v = document.createElement("span");
  v.className = "isi-packet-metric__value";
  v.textContent = value;
  el.appendChild(l);
  el.appendChild(v);
  return el;
}

export function renderExecutiveSummary(packet) {
  var section = document.createElement("section");
  section.className = "isi-packet-section";
  var h = document.createElement("h2");
  h.textContent = "Executive Summary";
  section.appendChild(h);

  var stats = packet.statistics || {};
  var grid = document.createElement("div");
  grid.className = "isi-packet-metrics";
  grid.appendChild(metric("Binding constraint", stats.archetype || "—"));
  grid.appendChild(metric("Composite grade", stats.compositeGrade || "—"));
  grid.appendChild(metric("Average score", stats.averageScore != null ? String(stats.averageScore) : "—"));
  grid.appendChild(metric("Weakest vital sign", stats.weakestLabel || "—"));
  section.appendChild(grid);

  var grades = packet.diagnostic && packet.diagnostic.grades ? packet.diagnostic.grades : {};
  var table = document.createElement("div");
  table.className = "isi-packet-grades";
  ["revenue", "margin", "operations", "leadership"].forEach(function (key) {
    var g = grades[key] || {};
    var row = document.createElement("div");
    row.className = "isi-packet-grade";
    row.setAttribute("data-band", g.band || "");
    var name = document.createElement("span");
    name.textContent = g.label || key;
    var letter = document.createElement("strong");
    letter.textContent = (g.letter || "—") + "  " + (g.score != null ? g.score : "—") + "  " + (g.band || "");
    row.appendChild(name);
    row.appendChild(letter);
    table.appendChild(row);
  });
  section.appendChild(table);

  var brief = packet.narrative && packet.narrative.surfaces && packet.narrative.surfaces.summaryBrief;
  if (brief) {
    var canvas = renderNarrativeCanvas(
      [
        { kind: "label", label: "Executive brief" },
        { kind: "lead", text: brief.lead },
        { kind: "body", text: (brief.insights || []).join(" ") },
        { kind: "body", text: brief.rationale },
        { kind: "body", text: brief.nextPhaseFraming }
      ],
      { width: 720 }
    );
    section.appendChild(canvas);
  }

  return section;
}

export default renderExecutiveSummary;
