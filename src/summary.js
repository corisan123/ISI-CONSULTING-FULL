/**
 * ISI Consulting — summary.js (Block 2E Section 3)
 * Unified executive summary from scoring, decision tree, priorities, roadmap.
 */
(function (global) {
  "use strict";

  function buildSummary() {
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
      console.warn("Summary: failed to parse session data:", err);
      return null;
    }

    if (!scoring || !decision || !priorities || !roadmap) return null;

    return {
      archetype: decision.name,
      rootCause: decision.rootCause || [],
      scores: scoring.scores,
      ratings: scoring.ratings,
      topPriorities: priorities.slice(0, 3),
      roadmap: roadmap
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function displaySummary() {
    var summary = buildSummary();
    var container = document.getElementById("summaryOutput");
    if (!container) return;

    if (!summary) {
      container.innerHTML =
        "<p>Complete scoring, decision tree, prioritization, and roadmap first.</p>";
      return;
    }

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
        var items = (r.initiatives || [])
          .map(function (i) {
            return "<li>" + escapeHtml(i) + "</li>";
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
      "<h3>Diagnostic Archetype</h3>" +
      "<p>" +
      escapeHtml(summary.archetype) +
      "</p>" +
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
  }

  global.buildSummary = buildSummary;
  global.displaySummary = displaySummary;
})(typeof window !== "undefined" ? window : this);
