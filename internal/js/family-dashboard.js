/**
 * Family-aware KPI dashboard — reads last runs from practice store for the active engagement family.
 */
(function (global) {
  "use strict";

  function headlineForResult(id, row) {
    if (!row || !row.payload) return { status: "Not run", detail: "" };
    var p = row.payload;
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
    if (!grid) return;
    if (title) title.textContent = fam.label;
    if (sub) {
      sub.textContent =
        "Chain: " +
        fam.pipelineSteps.join(" → ") +
        ". Client intake: " +
        fam.clientIntake;
    }
    grid.innerHTML = "";
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
