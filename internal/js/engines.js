/**
 * Live analytics for each diagnostic engine last run in this browser.
 */
(function () {
  "use strict";

  var ENGINES = [
    { id: "diligence", label: "Financial due diligence", href: "/internal/diagnostics/diligence.html", family: "Cash / gate" },
    { id: "rootcause", label: "Structured diagnosis", href: "/internal/diagnostics/rootcause.html", family: "Cause" },
    { id: "growth", label: "Growth diagnostic (glimpse)", href: "/diagnostic/input.html", family: "Commercial", fromInput: true },
    { id: "margin", label: "Margin & capital", href: "/internal/diagnostics/margin.html", family: "Capital" },
    { id: "operations", label: "Operations & throughput", href: "/internal/diagnostics/operations.html", family: "Constraint" },
    { id: "capital", label: "Capital projects", href: "/internal/diagnostics/capital.html", family: "Project" },
    { id: "supply", label: "Supply & inventory", href: "/internal/diagnostics/supply.html", family: "Working capital" },
    { id: "montecarlo", label: "Monte Carlo", href: "/internal/tools/montecarlo.html", family: "Uncertainty" },
    { id: "tree-bid", label: "Quantified tree", href: "/internal/tools/trees.html", family: "Path" },
    { id: "finance", label: "NPV / IRR / WACC", href: "/internal/tools/finance.html", family: "Finance" },
    { id: "roi-throughput", label: "Throughput ROI", href: "/internal/tools/roi-throughput.html", family: "TOC" },
    { id: "regression", label: "OLS / LINEST", href: "/internal/tools/regression.html", family: "Stats" },
    { id: "stats", label: "Statistics bench", href: "/internal/tools/stats.html", family: "Stats" },
    { id: "mece", label: "MECE", href: "/internal/tools/mece.html", family: "Structure" },
    { id: "matrix", label: "Decision matrix", href: "/internal/tools/matrix.html", family: "Choice" },
    { id: "scenarios", label: "Scenarios", href: "/internal/tools/scenarios.html", family: "What-if" },
    { id: "risk", label: "Risk EMV", href: "/internal/tools/risk.html", family: "Risk" },
    { id: "pipeline", label: "Wired chain", href: "/internal/pipeline.html", family: "Engagement" }
  ];

  function headline(id, row, diag) {
    if (!row && !(id === "growth" && diag)) return { status: "Not run", detail: "Open the engine, enter numbers, run." };
    var p = row && row.payload;
    if (id === "growth" && diag) {
      return { status: "Input stored", detail: "Revenue " + (diag.revenue || "—") + " · close rate " + (diag.closeRate || "—") };
    }
    if (!p) return { status: "Saved", detail: row.at || "" };
    if (p.result && p.result.headline) return { status: "Run", detail: p.result.headline };
    if (p.headline) return { status: "Run", detail: p.headline };
    if (p.tree && p.tree.verdict) return { status: p.tree.verdict, detail: p.headline || p.tree.verdict };
    if (p.keep) return { status: p.keep.length + " KEEP", detail: p.headline || "" };
    if (p.p50 != null) return { status: "P50 " + ISI.shell.money(p.p50), detail: "P10 " + ISI.shell.money(p.p10) + " · P90 " + ISI.shell.money(p.p90) };
    if (p.best) return { status: p.best.label, detail: "EV " + ISI.shell.money(p.best.ev) };
    if (p.mean != null) return { status: "Mean " + ISI.shell.money(p.mean), detail: "" };
    return { status: "Run", detail: row.at || "" };
  }

  function paint() {
    ISI.shell.render("train");
    var data = ISI.store.read();
    var diag = ISI.store.readDiagnosticInput();
    var grid = document.getElementById("grid");
    grid.innerHTML = "";
    ENGINES.forEach(function (e) {
      var row = data.results[e.id];
      if (e.id === "margin" || e.id === "operations" || e.id === "capital" || e.id === "supply") {
        row = data.results[e.id];
      }
      var h = headline(e.id, row, diag);
      var a = document.createElement("a");
      a.className = "pr-card";
      a.href = e.href;
      a.innerHTML =
        "<div class='tb-tag'>" + e.family + "</div>" +
        "<h3>" + e.label + "</h3>" +
        "<p><strong>" + h.status + "</strong><br>" + h.detail + "</p>" +
        "<div class='go'>" + (row || (e.fromInput && diag) ? "Re-run with new numbers →" : "Open and enter inputs →") + "</div>";
      grid.appendChild(a);
    });
    var syn = ISI.synthesis ? ISI.synthesis.run() : null;
    var roll = document.getElementById("roll");
    if (syn) {
      roll.innerHTML =
        "<div class='pr-metric'><div class='lbl'>File</div><div class='val'>" + syn.company + "</div></div>" +
        "<div class='pr-metric'><div class='lbl'>Verdict</div><div class='val'>" + syn.verdict + "</div></div>" +
        "<div class='pr-metric'><div class='lbl'>Constraints</div><div class='val'>" + syn.constraints.length + "</div></div>" +
        "<div class='pr-metric'><div class='lbl'>Workstreams</div><div class='val'>" + syn.implementation.length + "</div></div>" +
        "<div class='pr-metric'><div class='lbl'>Runs logged</div><div class='val'>" + (data.log || []).length + "</div></div>";
    }
    var logEl = document.getElementById("log");
    if (logEl) {
      var log = data.log || [];
      if (!log.length) {
        logEl.innerHTML = "<p class='lede'>No runs in this browser session yet. Open any engine, enter numbers, run.</p>";
      } else {
        logEl.innerHTML =
          "<table class='pr-table'><thead><tr><th>When</th><th>Kind</th><th>Detail</th></tr></thead><tbody>" +
          log.map(function (row) {
            return "<tr><td>" + (row.at || "") + "</td><td>" + (row.kind || "") + "</td><td>" + (row.detail || "") + "</td></tr>";
          }).join("") +
          "</tbody></table>";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", paint);
})();
