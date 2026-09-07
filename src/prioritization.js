/**
 * ISI Consulting — prioritization.js (Block 2D)
 * Filter initiatives by archetype → priority score → rank → isi_prioritization.
 */
(function (global) {
  "use strict";

  var DECISION_KEY = "isi_decisionTree";
  var RESULT_KEY = "isi_prioritization";

  var ABSOLUTE_MODEL_URL = "/src/data/prioritizationModel.json";

  var MODEL_URL =
    (typeof window !== "undefined" && window.ISI_PRIORITIZATION_MODEL_URL) ||
    ABSOLUTE_MODEL_URL;

  function calculatePriority(roi, effort) {
    return roi * 100 - effort * 50;
  }

  async function fetchPrioritizationModel() {
    var urls = [MODEL_URL];
    if (MODEL_URL !== ABSOLUTE_MODEL_URL) {
      urls.push(ABSOLUTE_MODEL_URL);
    }

    var lastErr = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var res = await fetch(urls[i]);
        if (!res.ok) {
          lastErr = new Error("HTTP " + res.status + " for " + urls[i]);
          continue;
        }
        return await res.json();
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Unable to load prioritization model");
  }

  async function runPrioritizationEngine() {
    var decision;
    try {
      var raw = sessionStorage.getItem(DECISION_KEY);
      if (!raw) {
        console.warn("No isi_decisionTree in sessionStorage.");
        return;
      }
      decision = JSON.parse(raw);
    } catch (err) {
      console.warn("Unable to read decision tree result:", err);
      return;
    }

    if (!decision || !decision.id) return;

    var model;
    try {
      model = await fetchPrioritizationModel();
    } catch (err) {
      console.warn("Failed to load prioritization model:", err);
      alert("Could not load the prioritization model.");
      return;
    }

    var initiatives = (model.initiatives || []).filter(function (i) {
      return i.drivers && i.drivers.indexOf(decision.id) !== -1;
    });

    var ranked = initiatives
      .map(function (i) {
        return {
          id: i.id,
          name: i.name,
          roi: i.roi,
          effort: i.effort,
          priorityScore: calculatePriority(i.roi, i.effort)
        };
      })
      .sort(function (a, b) {
        return b.priorityScore - a.priorityScore;
      });

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
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function displayPriorities() {
    var container = document.getElementById("priorityList");
    if (!container) return;

    var raw;
    try {
      raw = sessionStorage.getItem(RESULT_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    var priorities;
    try {
      priorities = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!priorities) return;

    if (!Array.isArray(priorities) || !priorities.length) {
      container.innerHTML =
        "<p>No initiatives mapped to this archetype yet.</p>";
      return;
    }

    container.innerHTML = priorities
      .map(function (p) {
        return (
          '<div class="isi-card">' +
          "<h3>" +
          escapeHtml(p.name) +
          "</h3>" +
          "<p>Priority Score: " +
          Number(p.priorityScore).toFixed(1) +
          "</p>" +
          "<p>ROI Potential: " +
          (Number(p.roi) * 100).toFixed(0) +
          "%</p>" +
          "<p>Effort Level: " +
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
