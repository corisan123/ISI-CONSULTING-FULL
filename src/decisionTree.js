/**
 * ISI Consulting — decisionTree.js (Block 2C Section 2)
 * Reads scoring ratings → evaluates archetypes → stores isi_decisionTree.
 * Display helpers retained for decisionTree.html (Block 2C UI).
 */
(function (global) {
  "use strict";

  var SCORING_KEY = "isi_scoringResults";
  var RESULT_KEY = "isi_decisionTree";

  var ABSOLUTE_TREE_URL = "/src/data/decisionTree.json";

  var TREE_URL =
    (typeof window !== "undefined" && window.ISI_DECISION_TREE_URL) ||
    ABSOLUTE_TREE_URL;

  async function fetchDecisionTree() {
    var urls = [TREE_URL];
    if (TREE_URL !== ABSOLUTE_TREE_URL) {
      urls.push(ABSOLUTE_TREE_URL);
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
    throw lastErr || new Error("Unable to load decision tree");
  }

  function evaluateTree(ratings, archetypes) {
    for (var i = 0; i < archetypes.length; i++) {
      var arch = archetypes[i];
      var match = true;
      var conditions = arch.conditions || {};

      for (var key in conditions) {
        if (!Object.prototype.hasOwnProperty.call(conditions, key)) continue;
        var condition = conditions[key];

        if (Array.isArray(condition)) {
          if (condition.indexOf(ratings[key]) === -1) {
            match = false;
            break;
          }
        } else if (ratings[key] !== condition) {
          match = false;
          break;
        }
      }

      if (match) return arch;
    }

    return {
      id: "unclassified",
      name: "Unclassified Pattern",
      rootCause: ["Mixed signals across categories"]
    };
  }

  async function runDecisionTree() {
    var scoring;
    try {
      var raw = sessionStorage.getItem(SCORING_KEY);
      if (!raw) {
        console.warn("No isi_scoringResults in sessionStorage.");
        return;
      }
      scoring = JSON.parse(raw);
    } catch (err) {
      console.warn("Unable to read scoring results:", err);
      return;
    }

    if (!scoring || !scoring.ratings) return;

    var tree;
    try {
      tree = await fetchDecisionTree();
    } catch (err) {
      console.warn("Failed to load decision tree:", err);
      alert("Could not load the decision tree model.");
      return;
    }

    var selected = evaluateTree(scoring.ratings, tree.archetypes || []);

    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(selected));
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
    }

    console.log("Decision Tree Result:", selected);
    return selected;
  }

  function ratingClass(rating) {
    var r = String(rating || "").toLowerCase();
    if (r === "green") return "rating-green";
    if (r === "yellow") return "rating-yellow";
    return "rating-red";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function displayDecisionTree() {
    var container = document.getElementById("decisionTreeResults");
    if (!container) return;

    var raw;
    try {
      raw = sessionStorage.getItem(RESULT_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    var selected;
    try {
      selected = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!selected || !selected.name) return;

    var scoringRaw = null;
    var scoring = null;
    try {
      scoringRaw = sessionStorage.getItem(SCORING_KEY);
      if (scoringRaw) scoring = JSON.parse(scoringRaw);
    } catch (err) {
      scoring = null;
    }

    var html = "";
    html += '<div class="isi-archetype">';
    html += "<h3>" + escapeHtml(selected.name) + "</h3>";
    html +=
      '<p class="isi-archetype-summary"><strong>You are here: ' +
      escapeHtml(selected.name) +
      "</strong></p>";
    html += "</div>";

    html += '<div class="isi-root-cause">';
    html += "<h4>Root causes</h4><ul>";
    var causes = selected.rootCause || [];
    for (var i = 0; i < causes.length; i++) {
      html += "<li>" + escapeHtml(causes[i]) + "</li>";
    }
    html += "</ul></div>";

    if (scoring && scoring.ratings) {
      var cats = [
        { key: "revenue", label: "Revenue Engine" },
        { key: "margin", label: "Margin Health" },
        { key: "operations", label: "Operations" },
        { key: "leadership", label: "Leadership" }
      ];
      html += '<div class="isi-archetype-ratings"><h4>Category ratings</h4>';
      for (var j = 0; j < cats.length; j++) {
        var c = cats[j];
        var rating = scoring.ratings[c.key];
        var score =
          scoring.scores && scoring.scores[c.key] != null
            ? Number(scoring.scores[c.key]).toFixed(1)
            : null;
        html +=
          '<p class="scoring-line">' +
          escapeHtml(c.label) +
          ': <span class="rating-badge ' +
          ratingClass(rating) +
          '">' +
          escapeHtml(rating) +
          "</span>";
        if (score !== null) html += " (" + score + ")";
        html += "</p>";
      }
      html += "</div>";
    }

    container.innerHTML = html;
  }

  async function runAndDisplayDecisionTree() {
    await runDecisionTree();
    displayDecisionTree();
  }

  global.evaluateTree = evaluateTree;
  global.runDecisionTree = runDecisionTree;
  global.displayDecisionTree = displayDecisionTree;
  global.runAndDisplayDecisionTree = runAndDisplayDecisionTree;
})(typeof window !== "undefined" ? window : this);
