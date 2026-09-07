/**
 * ISI Consulting — prioritization.js (Phase 5A)
 * Unified ranked list from activated engines (or re-merge from isi_engines).
 */
(function (global) {
  "use strict";

  var RESULT_KEY = "isi_prioritization";

  function calculatePriority(roi, effort) {
    return Number(roi) * 100 - Number(effort) * 50;
  }

  async function runPrioritizationEngine() {
    var k = global.ISI && global.ISI.kit;
    var tree = k ? k.readSession("isi_decisionTree") : null;
    var ranked = (tree && tree.initiatives) || [];

    if (!ranked.length) {
      console.warn("No multi-engine initiatives. Run the decision tree first.");
      return;
    }

    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(ranked));
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
    }

    console.log("Prioritization Results:", ranked);
    displayPriorities();
    return ranked;
  }

  function escapeHtml(str) {
    return global.ISI && global.ISI.kit
      ? global.ISI.kit.escapeHtml(str)
      : String(str);
  }

  function displayPriorities() {
    var container = document.getElementById("priorityList");
    if (!container) return;

    var k = global.ISI && global.ISI.kit;
    var priorities = k ? k.readSession(RESULT_KEY) : null;
    if (!priorities) return;

    if (!Array.isArray(priorities) || !priorities.length) {
      container.innerHTML =
        "<p>No initiatives yet. Run the decision tree so engines can activate and merge their libraries.</p>";
      return;
    }

    container.innerHTML = priorities
      .map(function (p) {
        return (
          '<div class="isi-card">' +
          "<h3>" +
          escapeHtml(p.name) +
          "</h3>" +
          '<p><span class="isi-tag">' +
          escapeHtml(p.firm || "") +
          "</span> <span class=\"isi-tag\">" +
          escapeHtml(p.engineName || p.engineId || "") +
          "</span> Horizon " +
          escapeHtml(String(p.horizon || "")) +
          "</p>" +
          "<p>" +
          escapeHtml(p.summary || "") +
          "</p>" +
          "<p>Priority Score: " +
          Number(p.priorityScore).toFixed(1) +
          " · ROI " +
          (Number(p.roi) * 100).toFixed(0) +
          "% · Effort " +
          (Number(p.effort) * 100).toFixed(0) +
          "%</p>" +
          "</div>"
        );
      })
      .join("");
  }

  global.calculatePriority = calculatePriority;
  global.runPrioritizationEngine = runPrioritizationEngine;
  global.displayPriorities = displayPriorities;
  global.displayPrioritization = displayPriorities;
})(typeof window !== "undefined" ? window : this);
