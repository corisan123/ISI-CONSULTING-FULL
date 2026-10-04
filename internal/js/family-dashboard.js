/**
 * Family-aware KPI dashboard — reads last runs from practice store for the active engagement family.
 */
(function (global) {
  "use strict";

  var ENGINE_KPI_LABELS = {
    commercial: {
      company: "Engagement file",
      diligence: "Diligence",
      pipelineScore: "Pipeline integrity",
      tollgate: "Tollgate",
      treeBest: "Best path",
      ev: "Expected value",
      sensitivityTop: "Top sensitivity driver",
      mcP50: "Monte Carlo P50 EV",
      mcPPositive: "P(EV > 0)",
      interventionsActive: "Active interventions",
      matrixBest: "Matrix best",
      rootcauseKeep: "Root-cause KEEP count"
    }
  };

  function formatEngineKpi(key, val) {
    if (val == null) return "—";
    if (key === "mcPPositive" && typeof val === "number") return (val * 100).toFixed(0) + "%";
    if (key === "pipelineScore" && typeof val === "number" && val <= 1) return (val * 100).toFixed(0) + "%";
    if (typeof val === "number" && isFinite(val)) {
      if (key === "ev" || key === "mcP50" || key === "npv") return "$" + Math.round(val).toLocaleString();
      if (Math.abs(val) > 0 && Math.abs(val) < 1) return val.toFixed(3);
      return Number.isInteger(val) ? String(val) : val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return String(val);
  }

  function kpiTitle(familyId, key) {
    var map = ENGINE_KPI_LABELS[familyId] || {};
    return map[key] || key.replace(/-/g, " ");
  }

  function headlineForResult(id, row) {
    if (!row || !row.payload) return null;
    var p = row.payload;
    if (id === "matrix" && p.best && p.best.label) {
      return { status: "Run", detail: "Best: " + p.best.label };
    }
    if (p.kpis && typeof p.kpis === "object") {
      return { status: "Summary", detail: p.headline || "Engine summary KPIs stored." };
    }
    if (p.headline) return { status: "Run", detail: p.headline };
    if (p.result && p.result.headline) return { status: "Run", detail: p.result.headline };
    if (p.tree && p.tree.verdict) return { status: p.tree.verdict, detail: p.headline || "" };
    if (p.p50 != null) return { status: "P50 " + Math.round(p.p50), detail: "" };
    if (p.verdict) return { status: String(p.verdict), detail: p.headline || "" };
    return { status: "Run", detail: row.at || "" };
  }

  function paint() {
    var fam = global.ISI.engagementFamilies.get();
    var data = global.ISI.store.read();
    var title = document.getElementById("famTitle");
    var sub = document.getElementById("famSub");
    var grid = document.getElementById("kpiGrid");
    var busNote = document.getElementById("busNote");
    if (!grid) return;
    if (title) title.textContent = fam.label;
    var engineId =
      global.ISI.engineBus && global.ISI.engineBus.mapClientGroup
        ? global.ISI.engineBus.mapClientGroup(fam.id)
        : null;
    var graph =
      engineId && global.ISI.engineBus.readGraph
        ? global.ISI.engineBus.readGraph(engineId)
        : null;
    var summaryNode = graph && graph.nodes && graph.nodes.summary;
    var engineKpis = summaryNode && summaryNode.output && summaryNode.output.kpis;

    if (sub) {
      sub.textContent =
        (engineId ? "Proprietary engine: " + engineId + ". " : "") +
        "Client intake: " +
        fam.clientIntake;
    }
    if (busNote) {
      if (engineKpis) {
        busNote.textContent =
          "Engine bus summary (v" +
          (graph.version || 0) +
          "): " +
          (summaryNode.output.headline || "Run complete.") +
          " · Tiles below are live from the last full engine run.";
      } else {
        busNote.textContent =
          "No engine summary in this browser yet. Open " +
          fam.entryLabel +
          ", click Run full engine, then return here. Empty chain slots are hidden until a program runs.";
      }
    }

    grid.innerHTML = "";
    var tileCount = 0;

    if (engineKpis) {
      Object.keys(engineKpis).forEach(function (key) {
        var val = engineKpis[key];
        var card = document.createElement("div");
        card.className = "pr-card";
        card.innerHTML =
          "<div class='tb-tag'>live KPI</div><h3>" +
          kpiTitle(fam.id, key) +
          "</h3><p>" +
          formatEngineKpi(key, val) +
          "</p>";
        grid.appendChild(card);
        tileCount++;
      });
    } else {
      (fam.summaryKeys || []).forEach(function (key) {
        var row = data.results[key];
        var h = headlineForResult(key, row);
        if (!h) return;
        var card = document.createElement("div");
        card.className = "pr-card";
        card.innerHTML =
          "<div class='tb-tag'>" +
          key +
          "</div><h3>" +
          h.status +
          "</h3><p>" +
          (h.detail || "") +
          "</p>";
        grid.appendChild(card);
        tileCount++;
      });
    }

    if (!tileCount) {
      grid.innerHTML =
        "<div class='pr-card' style='grid-column:1/-1'>" +
        "<h3>No activated KPIs yet</h3>" +
        "<p class='lede'>Run the proprietary engine for this family (" +
        "<a href='" +
        fam.entryHref +
        "'>" +
        fam.entryLabel +
        "</a>), then publish the client summary at " +
        "<a href='/client/summary.html?group=" +
        fam.id +
        "'>/client/summary.html?group=" +
        fam.id +
        "</a>.</p></div>";
    }

    var entry = document.getElementById("entryLink");
    if (entry) {
      entry.href = fam.entryHref;
      entry.textContent = fam.entryLabel;
    }
  }

  global.ISI = global.ISI || {};
  global.ISI.familyDashboard = { paint: paint };
})(typeof window !== "undefined" ? window : this);
