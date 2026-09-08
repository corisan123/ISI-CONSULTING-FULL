/**
 * ISI Consulting — dashboard.js (Phase 5A)
 * Executive snapshot across activated engines, narrative, and roadmap.
 * Phase 8: paints narrative surfaces only. Does not change scoring or engine data.
 */
import narrativeEngine from "./narrative/narrativeEngine.js";
import { insertNarrativeSurface } from "./narrative/insertSurface.js";

function buildDashboard() {
  var k = window.ISI && window.ISI.kit;
  var scoring = k ? k.readSession("isi_scoringResults") : null;
  var decision = k ? k.readSession("isi_decisionTree") : null;
  var priorities = k ? k.readSession("isi_prioritization") : null;
  var roadmap = k ? k.readSession("isi_roadmap") : null;

  if (!scoring || !decision || !priorities || !roadmap) return null;

  return {
    categories: scoring.ratings,
    scores: scoring.scores,
    archetype: decision.name,
    narrative: decision.narrative || null,
    engines: decision.engines || [],
    activated: decision.activated || [],
    topPriority: (priorities[0] && priorities[0].name) || "No priorities available",
    nextPhase: (roadmap[0] && roadmap[0].phase) || "No roadmap available"
  };
}

function escapeHtml(str) {
  return window.ISI && window.ISI.kit
    ? window.ISI.kit.escapeHtml(str)
    : String(str);
}

function ratingClass(rating) {
  return window.ISI && window.ISI.kit
    ? window.ISI.kit.ratingClass(rating)
    : "rating-red";
}

function paintDashboardNarrative() {
  var pack = narrativeEngine.generateFromSession();
  insertNarrativeSurface(pack.surfaces.dashboardLead, "dashboardOutput");
}

function displayDashboard() {
  var dashboard = buildDashboard();
  var container = document.getElementById("dashboardOutput");
  if (!container) return;
  if (!dashboard) {
    container.innerHTML =
      "<p>Complete scoring, decision tree, prioritization, and roadmap first.</p>";
    paintDashboardNarrative();
    return;
  }

  function scoreLine(label, key) {
    var rating = dashboard.categories[key];
    var score =
      dashboard.scores && dashboard.scores[key] != null
        ? " (" + Number(dashboard.scores[key]).toFixed(1) + ")"
        : "";
    return (
      "<li>" +
      escapeHtml(label) +
      ': <span class="rating-badge ' +
      ratingClass(rating) +
      '">' +
      escapeHtml(rating) +
      "</span>" +
      score +
      "</li>"
    );
  }

  var engineHtml = (dashboard.engines || [])
    .map(function (e) {
      return (
        "<li>" +
        escapeHtml(e.shortName || e.name) +
        ' <span class="isi-tag">' +
        escapeHtml(e.firm) +
        '</span> <span class="rating-badge ' +
        ratingClass(e.rating) +
        '">' +
        escapeHtml(e.rating) +
        "</span> — " +
        escapeHtml(e.archetype.name) +
        "</li>"
      );
    })
    .join("");

  var narrative = dashboard.narrative
    ? "<p>" + escapeHtml(dashboard.narrative.headline || "") + "</p>"
    : "<p>" + escapeHtml(dashboard.archetype) + "</p>";

  container.innerHTML =
    '<div class="isi-card">' +
    "<h3>Binding constraint</h3>" +
    narrative +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Activated engines</h3>" +
    "<ul>" +
    (engineHtml || "<li>None</li>") +
    "</ul>" +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Category Ratings</h3>" +
    "<ul>" +
    scoreLine("Revenue Engine", "revenue") +
    scoreLine("Margin Health", "margin") +
    scoreLine("Operations", "operations") +
    scoreLine("Leadership", "leadership") +
    "</ul>" +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Top Priority</h3>" +
    "<p>" +
    escapeHtml(dashboard.topPriority) +
    "</p>" +
    "</div>" +
    '<div class="isi-card">' +
    "<h3>Next Roadmap Phase</h3>" +
    "<p>" +
    escapeHtml(dashboard.nextPhase) +
    "</p>" +
    "</div>";

  paintDashboardNarrative();
}

export { buildDashboard, displayDashboard };

window.buildDashboard = buildDashboard;
window.displayDashboard = displayDashboard;
window.addEventListener("load", displayDashboard);
