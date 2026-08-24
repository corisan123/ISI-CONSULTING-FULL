/**
 * ISI Consulting — dashboard.js (Block 2E Section 2)
 * Unified executive snapshot from scoring, decision tree, priorities, roadmap.
 */
(function (global) {
  "use strict";

  function buildDashboard() {
    var scoring;
    var decision;
    var priorities;
    var roadmap;

    try {
      scoring = JSON.parse(sessionStorage.getItem("isi_scoringResults"));
      decision = JSON.parse(sessionStorage.getItem("isi_decisionTree"));
      priorities = JSON.parse(sessionStorage.getItem("isi_prioritization"));
      roadmap = JSON.parse(sessionStorage.getItem("isi_roadmap"));
    } catch (err) {
      console.warn("Dashboard: failed to parse session data:", err);
      return null;
    }

    if (!scoring || !decision || !priorities || !roadmap) return null;

    return {
      categories: scoring.ratings,
      scores: scoring.scores,
      archetype: decision.name,
      topPriority: (priorities[0] && priorities[0].name) || "No priorities available",
      nextPhase: (roadmap[0] && roadmap[0].phase) || "No roadmap available"
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ratingClass(rating) {
    var r = String(rating || "").toLowerCase();
    if (r === "green") return "rating-green";
    if (r === "yellow") return "rating-yellow";
    return "rating-red";
  }

  function displayDashboard() {
    var dashboard = buildDashboard();
    var container = document.getElementById("dashboardOutput");
    if (!container) return;
    if (!dashboard) {
      container.innerHTML =
        "<p>Complete scoring, decision tree, prioritization, and roadmap first.</p>";
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

    container.innerHTML =
      '<div class="isi-card">' +
      "<h3>Overall Diagnostic Archetype</h3>" +
      "<p>" +
      escapeHtml(dashboard.archetype) +
      "</p>" +
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
  }

  global.buildDashboard = buildDashboard;
  global.displayDashboard = displayDashboard;
})(typeof window !== "undefined" ? window : this);
