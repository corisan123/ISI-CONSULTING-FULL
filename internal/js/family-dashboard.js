/**
 * Family-aware KPI dashboard — reads last runs from practice store for the active engagement family.
 */
(function (global) {
  "use strict";

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

  function headlineForResult(id, row) {
    if (!row || !row.payload) return { status: "Not run", detail: "" };
    var p = row.payload;
    if (id === "matrix" && p.best && p.best.label) {
      return { status: "Run", detail: "Best: " + p.best.label };
    }
    if (p.headline) return { status: "Run", detail: p.headline };
    if (p.result && p.result.headline) return { status: "Run", detail: p.result.headline };
    if (p.tree && p.tree.verdict) return { status: p.tree.verdict, detail: p.headline || "" };
    if (p.p50 != null) return { status: "P50 " + Math.round(p.p50), detail: "" };
    return { status: "Saved", detail: row.at || "" };
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
    if (sub) {
      sub.textContent =
        (engineId ? "Proprietary engine: " + engineId + ". " : "") +
        "Legacy chain: " +
        fam.pipelineSteps.join(" → ") +
        ". Client intake: " +
        fam.clientIntake;
    }
    if (busNote) {
      if (summaryNode && summaryNode.output) {
        busNote.textContent =
          "Engine bus summary (v" +
          (graph.version || 0) +
          "): " +
          (summaryNode.output.headline || "Run complete.");
      } else {
        busNote.textContent =
          "Engine bus not run for this family yet. Open the proprietary engine and run the full graph.";
      }
    }
    grid.innerHTML = "";
    if (summaryNode && summaryNode.output && summaryNode.output.kpis) {
      Object.keys(summaryNode.output.kpis).forEach(function (key) {
        var val = summaryNode.output.kpis[key];
        var card = document.createElement("div");
        card.className = "pr-card";
        card.innerHTML =
          "<div class='tb-tag'>engine</div><h3>" +
          key +
          "</h3><p>" +
          formatEngineKpi(key, val) +
          "</p>";
        grid.appendChild(card);
      });
    }
    (fam.summaryKeys || []).forEach(function (key) {
      var row = data.results[key];
      var h = headlineForResult(key, row);
      var card = document.createElement("div");
      card.className = "pr-card";
      card.innerHTML =
        "<div class='tb-tag'>" +
        key +
        "</div><h3>" +
        h.status +
        "</h3><p>" +
        (h.detail || "Open the tool in the chain to populate.") +
        "</p>";
      grid.appendChild(card);
    });
    var entry = document.getElementById("entryLink");
    if (entry) entry.href = fam.entryHref;
  }

  global.ISI = global.ISI || {};
  global.ISI.familyDashboard = { paint: paint };
})(typeof window !== "undefined" ? window : this);
