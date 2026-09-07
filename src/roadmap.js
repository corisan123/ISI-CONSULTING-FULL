/**
 * ISI Consulting — roadmap.js (Block 2E Section 1)
 * Ranked priorities → 30/60/90/180 phases → isi_roadmap.
 */
(function (global) {
  "use strict";

  var PRIORITY_KEY = "isi_prioritization";
  var RESULT_KEY = "isi_roadmap";

  var ABSOLUTE_MODEL_URL = "/src/data/roadmapModel.json";

  var MODEL_URL =
    (typeof window !== "undefined" && window.ISI_ROADMAP_MODEL_URL) ||
    ABSOLUTE_MODEL_URL;

  async function fetchRoadmapModel() {
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
    throw lastErr || new Error("Unable to load roadmap model");
  }

  async function buildRoadmap() {
    var priorities;
    try {
      var raw = sessionStorage.getItem(PRIORITY_KEY);
      if (!raw) {
        console.warn("No isi_prioritization in sessionStorage.");
        return;
      }
      priorities = JSON.parse(raw);
    } catch (err) {
      console.warn("Unable to read prioritization results:", err);
      return;
    }

    if (!priorities) return;

    var model;
    try {
      model = await fetchRoadmapModel();
    } catch (err) {
      console.warn("Failed to load roadmap model:", err);
      alert("Could not load the roadmap model.");
      return;
    }

    var roadmap = (model.phases || []).map(function (phase) {
      return {
        phase: phase.name,
        focus: phase.focus,
        initiatives: priorities.slice(0, 2).map(function (p) {
          return p.name;
        })
      };
    });

    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(roadmap));
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
    }

    console.log("Roadmap:", roadmap);
    displayRoadmap();
    return roadmap;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function displayRoadmap() {
    var container = document.getElementById("roadmapOutput");
    if (!container) return;

    var raw;
    try {
      raw = sessionStorage.getItem(RESULT_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    var roadmap;
    try {
      roadmap = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!roadmap) return;

    container.innerHTML = roadmap
      .map(function (r) {
        var items = (r.initiatives || [])
          .map(function (i) {
            return "<li>" + escapeHtml(i) + "</li>";
          })
          .join("");
        return (
          '<div class="isi-card">' +
          "<h3>" +
          escapeHtml(r.phase) +
          "</h3>" +
          "<p><strong>Focus:</strong> " +
          escapeHtml(r.focus) +
          "</p>" +
          "<ul>" +
          items +
          "</ul>" +
          "</div>"
        );
      })
      .join("");
  }

  global.buildRoadmap = buildRoadmap;
  global.displayRoadmap = displayRoadmap;
})(typeof window !== "undefined" ? window : this);
