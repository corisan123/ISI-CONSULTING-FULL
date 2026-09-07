/**
 * ISI Consulting — roadmap.js (Phase 5A)
 * Phased 30/60/90/180 plan from merged engine initiatives (distinct per phase).
 */
(function (global) {
  "use strict";

  var RESULT_KEY = "isi_roadmap";

  async function buildRoadmap() {
    var k = global.ISI && global.ISI.kit;
    var tree = k ? k.readSession("isi_decisionTree") : null;
    var priorities = k ? k.readSession("isi_prioritization") : null;
    var roadmap;

    if (tree && tree.roadmap && tree.roadmap.length) {
      roadmap = tree.roadmap;
    } else if (priorities && priorities.length && k) {
      roadmap = k.phaseRoadmap(priorities);
    } else {
      console.warn("No isi_prioritization in sessionStorage.");
      return;
    }

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
    return global.ISI && global.ISI.kit
      ? global.ISI.kit.escapeHtml(str)
      : String(str);
  }

  function labelOf(i) {
    if (typeof i === "string") return i;
    return (i && i.name) || "";
  }

  function displayRoadmap() {
    var container = document.getElementById("roadmapOutput");
    if (!container) return;

    var k = global.ISI && global.ISI.kit;
    var roadmap = k ? k.readSession(RESULT_KEY) : null;
    if (!roadmap) return;

    container.innerHTML = roadmap
      .map(function (r) {
        var source = r.items && r.items.length ? r.items : r.initiatives || [];
        var items = source
          .map(function (i) {
            var extra =
              typeof i === "object" && i.engineName
                ? ' <span class="isi-tag">' + escapeHtml(i.engineName) + "</span>"
                : "";
            return "<li>" + escapeHtml(labelOf(i)) + extra + "</li>";
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
