/**
 * ISI Consulting — decision tree control system (Phase 5A)
 * Live modeling tool: quantitative + qualitative + strategic branches,
 * multi-engine activation, scenarios, narrative.
 */
(function (global) {
  "use strict";

  var SCORING_KEY = "isi_scoringResults";
  var RESULT_KEY = "isi_decisionTree";
  var ENGINES_KEY = "isi_engines";

  function evaluateTree(ratings) {
    ratings = ratings || {};
    var order = [
      { key: "margin", id: "margin_collapse", name: "Margin Collapse" },
      { key: "revenue", id: "revenue_stalled", name: "Revenue Engine Stalled" },
      { key: "operations", id: "ops_bottleneck", name: "Operational Bottleneck" },
      { key: "leadership", id: "leadership_misalignment", name: "Leadership Misalignment" }
    ];
    for (var i = 0; i < order.length; i++) {
      if (ratings[order[i].key] === "Red") {
        return { id: order[i].id, name: order[i].name, rootCause: [] };
      }
    }
    var allGreen = ["revenue", "margin", "operations", "leadership"].every(function (k) {
      return ratings[k] === "Green";
    });
    if (allGreen) {
      return { id: "healthy_growth", name: "Healthy Growth Platform", rootCause: [] };
    }
    return { id: "constrained_growth", name: "Constrained Growth", rootCause: [] };
  }

  async function runDecisionTree() {
    var k = global.ISI && global.ISI.kit;
    if (!k || typeof global.ISI.orchestrate !== "function") {
      alert("Multi-engine control system failed to load.");
      return null;
    }

    var scoring = k.readScoring();
    if (!scoring || !scoring.ratings) {
      console.warn("No isi_scoringResults in sessionStorage.");
      return null;
    }

    var input = k.readInput() || {};
    var selected;
    try {
      selected = await global.ISI.orchestrate({ input: input, scoring: scoring });
    } catch (err) {
      console.warn("Decision control failed:", err);
      alert("Could not run the multi-engine decision tree.");
      return null;
    }

    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(selected));
      sessionStorage.setItem(ENGINES_KEY, JSON.stringify(selected.engines || []));
      sessionStorage.setItem("isi_prioritization", JSON.stringify(selected.initiatives || []));
      sessionStorage.setItem("isi_roadmap", JSON.stringify(selected.roadmap || []));
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
    }

    console.log("Decision Tree Result:", selected);
    return selected;
  }

  function ratingClass(rating) {
    return global.ISI && global.ISI.kit
      ? global.ISI.kit.ratingClass(rating)
      : "rating-red";
  }

  function escapeHtml(str) {
    return global.ISI && global.ISI.kit
      ? global.ISI.kit.escapeHtml(str)
      : String(str);
  }

  function branchBlock(title, rows) {
    if (!rows || !rows.length) return "";
    var html = '<div class="isi-branch-card"><h4>' + escapeHtml(title) + "</h4><ul>";
    rows.forEach(function (row) {
      html +=
        "<li><strong>" +
        escapeHtml(row.engine) +
        ":</strong> " +
        escapeHtml(row.reason) +
        "</li>";
    });
    html += "</ul></div>";
    return html;
  }

  function displayDecisionTree() {
    var container = document.getElementById("decisionTreeResults");
    if (!container) return;

    var selected = global.ISI && global.ISI.kit
      ? global.ISI.kit.readSession(RESULT_KEY)
      : null;
    if (!selected || !selected.name) return;

    var html = "";
    html += '<div class="isi-archetype">';
    html += "<h3>" + escapeHtml(selected.name) + "</h3>";
    html +=
      '<p class="isi-archetype-summary"><strong>' +
      escapeHtml((selected.narrative && selected.narrative.headline) || selected.name) +
      "</strong></p>";
    html +=
      "<p>Activated engines: " +
      escapeHtml((selected.activated || []).join(", ") || "growth") +
      "</p>";
    html += "</div>";

    if (selected.narrative) {
      html += '<div class="isi-narrative isi-card">';
      html += "<h4>Strategic narrative</h4>";
      html += "<p>" + escapeHtml(selected.narrative.situation || "") + "</p>";
      html += "<p>" + escapeHtml(selected.narrative.implication || "") + "</p>";
      html += "<p><strong>Recommendation.</strong> " + escapeHtml(selected.narrative.recommendation || "") + "</p>";
      html += "</div>";
    }

    html += '<div class="isi-branch-grid">';
    html += branchBlock("Quantitative branches", selected.branches && selected.branches.quantitative);
    html += branchBlock("Qualitative branches", selected.branches && selected.branches.qualitative);
    html += branchBlock("Strategic branches", selected.branches && selected.branches.strategic);
    html += "</div>";

    (selected.engines || []).forEach(function (eng) {
      html += '<div class="isi-engine-card isi-card">';
      html +=
        "<h3>" +
        escapeHtml(eng.shortName || eng.name) +
        ' <span class="isi-tag">' +
        escapeHtml(eng.firm) +
        "</span> <span class=\"rating-badge " +
        ratingClass(eng.rating) +
        '">' +
        escapeHtml(eng.rating) +
        "</span> " +
        Number(eng.score).toFixed(1) +
        "</h3>";
      html +=
        "<p><strong>" +
        escapeHtml(eng.archetype.name) +
        "</strong> — " +
        escapeHtml(eng.family) +
        "</p>";
      html += '<ul class="isi-module-list">';
      (eng.modules || []).forEach(function (m) {
        html +=
          "<li>" +
          escapeHtml(m.name) +
          ': <span class="rating-badge ' +
          ratingClass(m.rating) +
          '">' +
          escapeHtml(m.rating) +
          "</span> " +
          Number(m.score).toFixed(0) +
          (m.finding ? " — " + escapeHtml(m.finding) : "") +
          "</li>";
      });
      html += "</ul></div>";
    });

    if (selected.scenarios && selected.scenarios.length) {
      html += "<h4>Scenario modeling</h4>";
      html += '<div class="isi-scenario-grid">';
      selected.scenarios.forEach(function (sc) {
        var proj = sc.projected || { scores: {}, ratings: {} };
        html += '<div class="isi-card isi-scenario">';
        html += "<h3>" + escapeHtml(sc.name) + "</h3>";
        html += "<p>" + escapeHtml(sc.description || "") + "</p>";
        html += "<p><strong>180-day projection</strong></p><ul>";
        ["revenue", "margin", "operations", "leadership"].forEach(function (key) {
          var label = key.charAt(0).toUpperCase() + key.slice(1);
          html +=
            "<li>" +
            escapeHtml(label) +
            ': <span class="rating-badge ' +
            ratingClass(proj.ratings[key]) +
            '">' +
            escapeHtml(proj.ratings[key] || "—") +
            "</span> " +
            (proj.scores[key] != null ? Number(proj.scores[key]).toFixed(1) : "") +
            "</li>";
        });
        html += "</ul></div>";
      });
      html += "</div>";
    }

    html += '<div class="isi-root-cause"><h4>Root causes</h4><ul>';
    (selected.rootCause || []).forEach(function (c) {
      html += "<li>" + escapeHtml(c) + "</li>";
    });
    html += "</ul></div>";

    if (selected.ratings) {
      html += '<div class="isi-archetype-ratings"><h4>Shared vital signs</h4>';
      [
        { key: "revenue", label: "Revenue Engine" },
        { key: "margin", label: "Margin Health" },
        { key: "operations", label: "Operations" },
        { key: "leadership", label: "Leadership" }
      ].forEach(function (c) {
        var score =
          selected.scores && selected.scores[c.key] != null
            ? Number(selected.scores[c.key]).toFixed(1)
            : null;
        html +=
          '<p class="scoring-line">' +
          escapeHtml(c.label) +
          ': <span class="rating-badge ' +
          ratingClass(selected.ratings[c.key]) +
          '">' +
          escapeHtml(selected.ratings[c.key] || "") +
          "</span>";
        if (score !== null) html += " (" + score + ")";
        html += "</p>";
      });
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
