/**
 * Renders one of the four adaptable diagnostic kits.
 */
(function () {
  "use strict";

  function qs(name) {
    var m = new URLSearchParams(location.search).get("kit");
    return m || name;
  }

  function ratingClass(r) {
    if (r === "Green") return "pos";
    if (r === "Red") return "neg";
    return "";
  }

  function boot() {
    var id = window.ISI_KIT || qs("margin");
    var kit = ISI.kits[id];
    if (!kit) {
      document.getElementById("app").innerHTML = "<p>Unknown diagnostic kit.</p>";
      return;
    }
    ISI.shell.render("diag");
    var app = document.getElementById("app");
    var fields = kit.fields
      .map(function (f) {
        return (
          '<div><label for="' +
          f.id +
          '">' +
          f.label +
          "</label><input id=\"" +
          f.id +
          '" name="' +
          f.id +
          '" type="number" step="any" value="' +
          f.value +
          '"></div>'
        );
      })
      .join("");
    var mece = kit.mece
      .map(function (b) {
        return "<li><span class='node'>" + b.label + "</span> — " + b.cut + "</li>";
      })
      .join("");
    app.innerHTML =
      '<div class="pr-wrap">' +
      '<p class="pr-kicker">Diagnostic kit · placeholders pre-loaded</p>' +
      "<h1>" +
      kit.title +
      "</h1>" +
      '<p class="lede">' +
      kit.purpose +
      " Replace the numbers in consultation. Logic is live in this page.</p>" +
      '<div class="banner">MECE cut: four buckets, no overlap. Depth is the rating + evidence on each branch — not a generic profit tree.</div>' +
      '<form id="kitForm" class="pr-panel"><h2>Inputs</h2><div class="pr-form-grid">' +
      fields +
      '</div><div class="pr-actions"><button type="submit" class="btn btn-gold">Run diagnostic</button>' +
      '<button type="button" class="btn btn-ghost" id="printBtn">Print / PDF</button></div></form>' +
      '<div class="pr-panel"><h2>Issue tree (MECE)</h2><div class="tree"><ul>' +
      mece +
      "</ul></div></div>" +
      '<div id="out"></div></div>';

    document.getElementById("kitForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      var data = {};
      kit.fields.forEach(function (f) {
        data[f.id] = document.getElementById(f.id).value;
      });
      var result = kit.run(data, ISI.math);
      ISI.store.saveResult(kit.id, { inputs: data, result: result });
      ISI.store.setKpis(data);
      var metrics = Object.keys(result.metrics)
        .map(function (k) {
          var v = result.metrics[k];
          var shown =
            Math.abs(v) >= 1000
              ? ISI.shell.money(v)
              : typeof v === "number" && Math.abs(v) <= 2 && k.match(/IRR|SPI|CPI|PI|margin|Creep/i)
                ? (v > 2 ? v.toFixed(2) : (v * (k.indexOf("IRR") >= 0 || k.indexOf("margin") >= 0 || k.indexOf("Creep") >= 0 ? 100 : 1)).toFixed(2) + (k.indexOf("IRR") >= 0 || k.indexOf("margin") >= 0 || k.indexOf("Creep") >= 0 ? "%" : ""))
                : isFinite(v)
                  ? Number(v).toFixed(2)
                  : "—";
          if (k === "IRR") shown = (result.metrics.IRR * 100).toFixed(1) + "%";
          if (k === "EBITDA_margin" || k === "scopeCreep") shown = (v * 100).toFixed(1) + "%";
          if (k === "CPI" || k === "SPI" || k === "PI" || k === "TCPI") shown = isFinite(v) ? v.toFixed(2) : "—";
          if (k === "Payback" || k === "DiscountedPayback") shown = isFinite(v) ? v.toFixed(1) + " yrs" : "beyond horizon";
          if (k === "turns" || k === "weeklyGap" || k === "oee" || k === "scrap" || k === "wipDays" || k === "otif" || k === "fillRate" || k === "mape" || k === "daysOnHand")
            shown = isFinite(v) ? Number(v).toFixed(1) : "—";
          return '<div class="pr-metric"><div class="lbl">' + k.replace(/_/g, " ") + '</div><div class="val">' + shown + "</div></div>";
        })
        .join("");
      var rows = result.branches
        .map(function (b) {
          return (
            "<tr><td>" +
            b.id +
            '</td><td class="' +
            ratingClass(b.rating) +
            '">' +
            b.rating +
            "</td><td>" +
            b.evidence +
            "</td></tr>"
          );
        })
        .join("");
      var extra = "";
      if (result.cashflows) {
        extra =
          '<p class="formula">NPV = Σ CF<sub>t</sub> / (1+r)<sup>t</sup> &nbsp;|&nbsp; IRR solves NPV = 0 &nbsp;|&nbsp; r = ' +
          (result.rate * 100).toFixed(1) +
          "%</p>";
      }
      document.getElementById("out").innerHTML =
        '<div class="pr-panel"><h2>Results</h2><p><strong>' +
        result.headline +
        "</strong></p>" +
        extra +
        '<div class="pr-metrics">' +
        metrics +
        "</div>" +
        '<table class="pr-table"><thead><tr><th>Branch</th><th>Rating</th><th>Evidence</th></tr></thead><tbody>' +
        rows +
        "</tbody></table>" +
        '<p class="lede" style="margin-top:1rem">Pyramid close: lead with the headline, group the red/yellow branches, then the numbers above. Next: open Monte Carlo or Risk if uncertainty on the inputs is material.</p>' +
        '<div class="pr-actions"><a class="btn btn-navy" href="/internal/index.html#dashboard">Send to dashboard</a>' +
        '<a class="btn btn-ghost" href="/internal/tools/montecarlo.html">Quantify uncertainty</a></div></div>';
    });

    document.getElementById("printBtn").addEventListener("click", function () {
      window.print();
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
