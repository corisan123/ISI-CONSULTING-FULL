/**
 * ISI Consulting — summary.js (Phase 5A)
 * Client-ready narrative from merged engines, initiatives, and roadmap.
 * Phase 8: paints narrative surfaces only. Does not change scoring or engine data.
 */
import narrativeEngine from "./narrative/narrativeEngine.js";
import { insertNarrativeSurface } from "./narrative/insertSurface.js";

function buildSummary() {
  var k = window.ISI && window.ISI.kit;
  var scoring = k ? k.readSession("isi_scoringResults") : null;
  var decision = k ? k.readSession("isi_decisionTree") : null;
  var priorities = k ? k.readSession("isi_prioritization") : null;
  var roadmap = k ? k.readSession("isi_roadmap") : null;

  if (!scoring || !decision || !priorities || !roadmap) return null;

  return {
    archetype: decision.name,
    rootCause: decision.rootCause || [],
    scores: scoring.scores,
    ratings: scoring.ratings,
    topPriorities: (priorities || []).slice(0, 5),
    roadmap: roadmap,
    narrative: decision.narrative || null,
    engines: decision.engines || [],
    scenarios: decision.scenarios || []
  };
}

function escapeHtml(str) {
  return window.ISI && window.ISI.kit
    ? window.ISI.kit.escapeHtml(str)
    : String(str);
}

function paintSummaryNarrative() {
  var pack = narrativeEngine.generateFromSession();
  insertNarrativeSurface(pack.surfaces.summaryBrief, "summaryOutput");
}

function displaySummary() {
  var summary = buildSummary();
  var container = document.getElementById("summaryOutput");
  if (!container) return;

  if (!summary) {
    container.innerHTML =
      "<p>Complete scoring, decision tree, prioritization, and roadmap first.</p>";
    paintSummaryNarrative();
    return;
  }

  var narrativeHtml = summary.narrative
    ? "<p><strong>" +
      escapeHtml(summary.narrative.headline || "") +
      "</strong></p><p>" +
      escapeHtml(summary.narrative.situation || "") +
      "</p><p>" +
      escapeHtml(summary.narrative.implication || "") +
      "</p><p>" +
      escapeHtml(summary.narrative.recommendation || "") +
      "</p>"
    : "<p>" + escapeHtml(summary.archetype) + "</p>";

  var enginesHtml = (summary.engines || [])
    .map(function (e) {
      return (
        "<li>" +
        escapeHtml(e.shortName || e.name) +
        " (" +
        escapeHtml(e.firm) +
        "): " +
        escapeHtml(e.archetype.name) +
        "</li>"
      );
    })
    .join("");

  var rootCauseHtml = (summary.rootCause || [])
    .map(function (rc) {
      return "<li>" + escapeHtml(rc) + "</li>";
    })
    .join("");

  var prioritiesHtml = (summary.topPriorities || [])
    .map(function (p) {
      return "<li>" + escapeHtml(p.name) + "</li>";
    })
    .join("");

  var roadmapHtml = (summary.roadmap || [])
    .map(function (r) {
      var source = r.items && r.items.length ? r.items : r.initiatives || [];
      var items = source
        .map(function (i) {
          var name = typeof i === "string" ? i : i.name;
          return "<li>" + escapeHtml(name || "") + "</li>";
        })
        .join("");
      return (
        "<div>" +
        "<strong>" +
        escapeHtml(r.phase) +
        "</strong>: " +
        escapeHtml(r.focus) +
        "<ul>" +
        items +
        "</ul>" +
        "</div>"
      );
    })
    .join("");

  function scoreLi(label, key) {
    var score = summary.scores[key];
    var rating = summary.ratings[key];
    return (
      "<li>" +
      escapeHtml(label) +
      ": " +
      Number(score).toFixed(1) +
      " (" +
      escapeHtml(rating) +
      ")</li>"
    );
  }

  container.innerHTML =
    '<div class="isi-card">' +
    "<h3>Executive narrative</h3>" +
    narrativeHtml +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Engines activated</h3>" +
    "<ul>" +
    enginesHtml +
    "</ul>" +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Root-Cause Analysis</h3>" +
    "<ul>" +
    rootCauseHtml +
    "</ul>" +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Category Scores</h3>" +
    "<ul>" +
    scoreLi("Revenue Engine", "revenue") +
    scoreLi("Margin Health", "margin") +
    scoreLi("Operations", "operations") +
    scoreLi("Leadership", "leadership") +
    "</ul>" +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Top Priorities</h3>" +
    "<ul>" +
    prioritiesHtml +
    "</ul>" +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Roadmap Overview</h3>" +
    roadmapHtml +
    "</div>";

  paintSummaryNarrative();
}

export { buildSummary, displaySummary };

window.buildSummary = buildSummary;
window.displaySummary = displaySummary;
window.addEventListener("load", displaySummary);
