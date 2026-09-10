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

  function liveDetection() {
    if (!global.ISI || typeof global.ISI.detectDomains !== "function") return null;
    var k = global.ISI.kit;
    var scoring = k && k.readScoring ? k.readScoring() : null;
    if (!scoring || !scoring.ratings) return null;
    return global.ISI.detectDomains({
      input: (k && k.readInput && k.readInput()) || {},
      scoring: scoring
    });
  }

  function svgEsc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function box(x, y, w, h, title, sub, state, id) {
    var fill =
      state === "on" ? "#fff8e8" : state === "bind" ? "#003366" : state === "root" ? "#002244" : "#ffffff";
    var stroke = state === "on" || state === "bind" || state === "root" ? "#c9a86a" : "#c5ccd6";
    var titleFill = state === "bind" || state === "root" ? "#ffffff" : "#1a2332";
    var subFill = state === "bind" || state === "root" ? "rgba(255,255,255,0.72)" : "#5a6577";
    var sw = state === "on" || state === "bind" || state === "root" ? "2.25" : "1.25";
    return (
      '<g class="isi-tree-node isi-tree-node--' +
      svgEsc(state) +
      '" data-node="' +
      svgEsc(id) +
      '" transform="translate(' +
      x +
      "," +
      y +
      ')">' +
      '<rect width="' +
      w +
      '" height="' +
      h +
      '" rx="8" fill="' +
      fill +
      '" stroke="' +
      stroke +
      '" stroke-width="' +
      sw +
      '"/>' +
      '<text x="12" y="24" fill="' +
      titleFill +
      '" font-size="13" font-weight="700" font-family="Inter, system-ui, sans-serif">' +
      svgEsc(title) +
      "</text>" +
      '<text x="12" y="42" fill="' +
      subFill +
      '" font-size="11" font-family="Inter, system-ui, sans-serif">' +
      svgEsc(sub) +
      "</text>" +
      "</g>"
    );
  }

  function link(x1, y1, x2, y2, on, dashed) {
    var color = on ? "#c9a86a" : "#c5ccd6";
    var width = on ? "2.5" : "1.25";
    var dash = dashed ? ' stroke-dasharray="6 5"' : "";
    return (
      '<path d="M' +
      x1 +
      " " +
      y1 +
      " C" +
      (x1 + 48) +
      " " +
      y1 +
      "," +
      (x2 - 48) +
      " " +
      y2 +
      "," +
      x2 +
      " " +
      y2 +
      '" fill="none" stroke="' +
      color +
      '" stroke-width="' +
      width +
      '"' +
      dash +
      "/>"
    );
  }

  function renderOverviewSvg(detection, selected) {
    var walk = (detection && detection.walk) || [];
    var activated = (detection && detection.activated) || [];
    var ratings = (detection && detection.ratings) || {};
    var branchMeta = (global.ISI && global.ISI.branchMeta) || [
      { id: "quantitative", label: "Quantitative" },
      { id: "qualitative", label: "Qualitative" },
      { id: "strategic", label: "Strategic" }
    ];
    var engineMeta = (global.ISI && global.ISI.engineMeta) || [
      { id: "growth", label: "Growth" },
      { id: "expansion", label: "Expansion" },
      { id: "alignment", label: "Alignment" }
    ];

    function firedCount(branch) {
      return walk.filter(function (n) {
        return n.branch === branch && n.fired;
      }).length;
    }
    function totalCount(branch) {
      return walk.filter(function (n) {
        return n.branch === branch;
      }).length;
    }
    function branchOn(branch) {
      return firedCount(branch) > 0;
    }
    function engineOn(id) {
      return activated.indexOf(id) !== -1;
    }
    function branchToEngine(branch, engine) {
      return walk.some(function (n) {
        return n.branch === branch && n.engine === engine && n.fired;
      });
    }

    var vital =
      "Rev " +
      (ratings.revenue || "—") +
      " · Mar " +
      (ratings.margin || "—") +
      " · Ops " +
      (ratings.operations || "—") +
      " · Lead " +
      (ratings.leadership || "—");

    var bindName = (selected && selected.name) || (detection && detection.defaulted ? "Growth (default)" : "Binding constraint");
    if (bindName.length > 28) bindName = bindName.slice(0, 26) + "…";

    var html = '<svg class="isi-tree-svg" viewBox="0 0 980 360" role="img" aria-labelledby="isiTreeTitle isiTreeDesc">';
    html += '<title id="isiTreeTitle">Live diagnostic decision tree</title>';
    html +=
      '<desc id="isiTreeDesc">Path from client scores through quantitative, qualitative, and strategic tests into Growth, Expansion, and Alignment engines, ending at the binding constraint.</desc>';

    html += link(180, 170, 250, 62, branchOn("quantitative") || !!(detection && detection.defaulted), detection && detection.defaulted && !branchOn("quantitative"));
    html += link(180, 180, 250, 168, branchOn("qualitative"));
    html += link(180, 190, 250, 274, branchOn("strategic"));

    function pairExists(branch, engine) {
      return walk.some(function (n) {
        return n.branch === branch && n.engine === engine;
      });
    }

    branchMeta.forEach(function (b) {
      engineMeta.forEach(function (e) {
        if (!pairExists(b.id, e.id)) return;
        var by = b.id === "quantitative" ? 62 : b.id === "qualitative" ? 168 : 274;
        var ey = e.id === "growth" ? 62 : e.id === "expansion" ? 168 : 274;
        var on = branchToEngine(b.id, e.id);
        var isDefault =
          detection && detection.defaulted && b.id === "quantitative" && e.id === "growth";
        html += link(400, by, 500, ey, on || isDefault, isDefault && !on);
      });
    });

    engineMeta.forEach(function (e) {
      var ey = e.id === "growth" ? 62 : e.id === "expansion" ? 168 : 274;
      html += link(650, ey, 740, 180, engineOn(e.id), detection && detection.defaulted && e.id === "growth");
    });

    html += box(20, 140, 160, 80, "Client scores", vital, "root", "root");
    html += box(
      250,
      30,
      150,
      64,
      "Quantitative",
      firedCount("quantitative") + " of " + totalCount("quantitative") + " fired",
      branchOn("quantitative") ? "on" : "off",
      "quantitative"
    );
    html += box(
      250,
      136,
      150,
      64,
      "Qualitative",
      firedCount("qualitative") + " of " + totalCount("qualitative") + " fired",
      branchOn("qualitative") ? "on" : "off",
      "qualitative"
    );
    html += box(
      250,
      242,
      150,
      64,
      "Strategic",
      firedCount("strategic") + " of " + totalCount("strategic") + " fired",
      branchOn("strategic") ? "on" : "off",
      "strategic"
    );
    html += box(500, 30, 150, 64, "Growth", "Bain", engineOn("growth") ? "on" : "off", "growth");
    html += box(500, 136, 150, 64, "Expansion", "Deloitte", engineOn("expansion") ? "on" : "off", "expansion");
    html += box(500, 242, 150, 64, "Alignment", "McKinsey", engineOn("alignment") ? "on" : "off", "alignment");
    html += box(740, 140, 220, 80, "Binding constraint", bindName, "bind", "binding");
    html += "</svg>";
    return html;
  }

  function renderWalkList(detection) {
    var walk = (detection && detection.walk) || [];
    var branchMeta = (global.ISI && global.ISI.branchMeta) || [];
    var html = '<ol class="isi-dtree">';
    branchMeta.forEach(function (branch) {
      var rows = walk.filter(function (n) {
        return n.branch === branch.id;
      });
      var fired = rows.filter(function (n) {
        return n.fired;
      }).length;
      html += '<li class="isi-dtree-branch">';
      html +=
        '<div class="isi-dtree-branch__head"><span class="isi-dtree-branch__name">' +
        escapeHtml(branch.label) +
        '</span><span class="isi-dtree-branch__q">' +
        escapeHtml(branch.question || "") +
        '</span><span class="isi-dtree-branch__count">' +
        fired +
        " of " +
        rows.length +
        " taken</span></div>";
      html += '<ol class="isi-dtree-tests">';
      rows.forEach(function (n) {
        html +=
          '<li class="isi-dtree-test' +
          (n.fired ? " is-fired" : " is-idle") +
          '" data-test="' +
          escapeHtml(n.id) +
          '">';
        html +=
          '<span class="isi-dtree-test__gate" aria-hidden="true">' + (n.fired ? "Yes" : "No") + "</span>";
        html += '<div class="isi-dtree-test__body">';
        html += "<strong>" + escapeHtml(n.question) + "</strong>";
        html += '<p class="isi-dtree-test__meta">' + escapeHtml(n.label) + " → " + escapeHtml(n.engine) + "</p>";
        html += '<p class="isi-dtree-test__evidence">' + escapeHtml(n.evidence) + "</p>";
        html += "</div></li>";
      });
      html += "</ol></li>";
    });
    html += "</ol>";
    if (detection && detection.defaulted) {
      html +=
        '<p class="isi-tree-default">No test fired. Growth still runs so every client gets a commercial diagnosis (dashed path on the diagram).</p>';
    }
    return html;
  }

  function ensureVisualHost() {
    var host = document.getElementById("decisionTreeVisual");
    if (host) return host;
    var results = document.getElementById("decisionTreeResults");
    host = document.createElement("div");
    host.id = "decisionTreeVisual";
    host.className = "isi-tree-stage";
    host.setAttribute("aria-live", "polite");
    if (results && results.parentNode) {
      results.parentNode.insertBefore(host, results);
    }
    return host;
  }

  function renderLiveTree(selected) {
    var host = ensureVisualHost();
    if (!host) return;

    var detection = liveDetection();
    var idleWalk = null;
    if (!detection && global.ISI && typeof global.ISI.detectDomains === "function") {
      idleWalk = global.ISI.detectDomains({ input: {}, scoring: { ratings: {}, scores: {} } });
    }
    var model = detection || idleWalk;
    if (!model) {
      host.innerHTML =
        '<p class="scoring-hint">The visual tree loads with the control system. Refresh this page if the diagram is missing.</p>';
      return;
    }

    var caption = detection
      ? "Gold is the path this client's scores and inputs take. Gray branches were tested and not taken. Each Yes/No row is the live evidence for that test."
      : "Complete scoring, then return. The diagram is the real control tree — every test will light when this client's data hits a threshold.";

    var html = "";
    html += '<div class="isi-tree-legend" aria-hidden="true">';
    html += '<span class="isi-tree-legend__item isi-tree-legend__item--on">Taken path</span>';
    html += '<span class="isi-tree-legend__item isi-tree-legend__item--off">Tested, not taken</span>';
    html += '<span class="isi-tree-legend__item isi-tree-legend__item--bind">Binding constraint</span>';
    html += "</div>";
    html += '<p class="isi-tree-caption">' + escapeHtml(caption) + "</p>";
    html += '<div class="isi-tree-svg-wrap">' + renderOverviewSvg(model, selected) + "</div>";
    html += renderWalkList(model);
    host.innerHTML = html;
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
    var selected = global.ISI && global.ISI.kit
      ? global.ISI.kit.readSession(RESULT_KEY)
      : null;
    renderLiveTree(selected);

    var container = document.getElementById("decisionTreeResults");
    if (!container) return;
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
