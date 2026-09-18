/**
 * ISI Consulting — engagement synthesis
 * One rollup. Unique constraints. No duplicate workstreams.
 * Used by the client resolution dashboard and the practice results board.
 */
(function (global) {
  "use strict";

  function unique(items, keyFn) {
    var seen = {};
    var out = [];
    (items || []).forEach(function (item) {
      if (!item) return;
      var k = (keyFn ? keyFn(item) : String(item)).toLowerCase().replace(/\s+/g, " ").trim();
      if (!k || seen[k]) return;
      seen[k] = true;
      out.push(item);
    });
    return out;
  }

  function money(n) {
    if (!isFinite(n)) return "—";
    var abs = Math.abs(n);
    var sign = n < 0 ? "−" : "";
    if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return sign + "$" + (abs / 1e3).toFixed(0) + "K";
    return sign + "$" + Math.round(abs).toLocaleString("en-US");
  }

  function pct(n) {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) <= 1) return (n * 100).toFixed(1) + "%";
    return n.toFixed(1) + "%";
  }

  function payload(results, id) {
    return results[id] && results[id].payload ? results[id].payload : null;
  }

  function synthesize() {
    var storeApi = global.ISI && global.ISI.store;
    var store = storeApi ? storeApi.read() : { engagement: {}, results: {}, bus: {}, kpis: {} };
    var results = store.results || {};
    var bus = store.bus || {};
    var eng = store.engagement || {};
    var diag = storeApi && storeApi.readDiagnosticInput ? storeApi.readDiagnosticInput() : null;

    var rc = payload(results, "rootcause") || bus.rootcause;
    var dd = payload(results, "diligence") || bus.diligence;
    var tree = payload(results, "tree-bid") || bus.tree;
    var mc = payload(results, "montecarlo") || bus.montecarlo;
    var matrix = bus.matrix;
    var study = bus.study;
    var iv = payload(results, "interventions") || bus.interventions;
    var ops = payload(results, "operations");
    var margin = payload(results, "margin");
    var capital = payload(results, "capital");
    var supply = payload(results, "supply");

    var constraints = [];
    if (rc && rc.keep) {
      rc.keep.forEach(function (x) {
        constraints.push({ id: x.id || x.label, label: x.label, family: "Diagnosis", evidence: (x.fired || []).join("; "), status: "KEEP" });
      });
    }
    if (dd && dd.tests) {
      dd.tests.forEach(function (t) {
        if (t.rating === "Red" || t.rating === "Yellow") {
          constraints.push({ id: "dd-" + t.label, label: t.label, family: "Diligence", evidence: t.because || t.display, status: t.rating });
        }
      });
    }
    if (ops && ops.result && ops.result.branches) {
      ops.result.branches.forEach(function (b) {
        if (b.rating === "Red" || b.rating === "Yellow") {
          constraints.push({ id: "ops-" + b.id, label: b.id, family: "Throughput", evidence: b.evidence, status: b.rating });
        }
      });
    }
    if (capital && capital.result && capital.result.branches) {
      capital.result.branches.forEach(function (b) {
        if (b.rating === "Red" || b.rating === "Yellow") {
          constraints.push({ id: "cap-" + b.id, label: b.id, family: "Project", evidence: b.evidence, status: b.rating });
        }
      });
    }
    if (supply && supply.result && supply.result.branches) {
      supply.result.branches.forEach(function (b) {
        if (b.rating === "Red" || b.rating === "Yellow") {
          constraints.push({ id: "sup-" + b.id, label: b.id, family: "Supply", evidence: b.evidence, status: b.rating });
        }
      });
    }
    constraints = unique(constraints, function (c) { return c.family + ":" + c.label; });

    var killed = [];
    if (rc && rc.killed) {
      rc.killed.forEach(function (x) {
        killed.push({ label: x.label, why: (x.failed && x.failed.join) ? x.failed.join("; ") : "Did not survive the test." });
      });
    }
    killed = unique(killed, function (k) { return k.label; });

    var kpis = [];
    if (dd && dd.metrics) {
      kpis.push({ label: "Current ratio", value: isFinite(dd.metrics.current) ? dd.metrics.current.toFixed(2) + "x" : "—" });
      kpis.push({ label: "DSCR", value: isFinite(dd.metrics.dscr) ? dd.metrics.dscr.toFixed(2) + "x" : "—" });
      kpis.push({ label: "Cash cycle", value: isFinite(dd.metrics.ccc) ? Math.round(dd.metrics.ccc) + " days" : "—" });
      kpis.push({ label: "QoE EBITDA", value: money(dd.metrics.qoe) });
      kpis.push({ label: "NPV", value: money(dd.metrics.npv) });
    }
    if (diag) {
      if (diag.revenue != null) kpis.push({ label: "Revenue (input)", value: money(Number(diag.revenue)) });
      if (diag.ebitda != null) kpis.push({ label: "EBITDA % (input)", value: String(diag.ebitda) + "%" });
      if (diag.closeRate != null) kpis.push({ label: "Close rate (input)", value: String(diag.closeRate) + "%" });
    }
    if (tree && tree.best) {
      kpis.push({ label: "Quantified path EV", value: money(tree.best.ev) });
    }
    kpis = unique(kpis, function (k) { return k.label; });

    var probabilities = null;
    if (mc && (mc.p10 != null || mc.p50 != null)) {
      probabilities = {
        p10: money(mc.p10),
        p50: money(mc.p50),
        p90: money(mc.p90),
        mean: money(mc.mean)
      };
    }

    var implementation = [];
    if (study && study.workstreams) {
      study.workstreams.forEach(function (w, i) {
        implementation.push({
          phase: i < 2 ? "Days 1–30" : i < 4 ? "Days 31–60" : "Days 61–90",
          name: w.name,
          owner: w.owner,
          method: w.method,
          lane: w.swimlane
        });
      });
    } else if (iv && iv.active) {
      iv.active.forEach(function (m, i) {
        implementation.push({
          phase: i === 0 ? "Days 1–30" : i === 1 ? "Days 31–60" : "Days 61–90",
          name: m.name || m,
          owner: "Named owner in SOW",
          method: "Activated from intake gap",
          lane: "Engagement"
        });
      });
    }
    implementation = unique(implementation, function (p) { return p.phase + ":" + p.name; });

    var winner = matrix && matrix.best ? matrix.best.label : (tree && tree.best ? tree.best.label : null);
    var verdict = (dd && dd.tree && dd.tree.verdict) || (rc && rc.headline) || "File not yet run";
    var narrative = (bus.packet && bus.packet.narrative) ||
      (dd && dd.clientNarrative) ||
      (rc && rc.headline) ||
      "Run diagnosis and diligence in this browser. This board only reports what those programs proved.";

    return {
      company: eng.company || (bus.intake && bus.intake.companyName) || "Client company",
      industry: eng.industry || "",
      constraintFamily: eng.constraint || "",
      verdict: verdict,
      narrative: narrative,
      winner: winner,
      kpis: kpis,
      probabilities: probabilities,
      constraints: constraints,
      killed: killed,
      implementation: implementation,
      studyLabel: study && study.label,
      ready: !!(rc || dd || diag)
    };
  }

  global.ISI = global.ISI || {};
  global.ISI.synthesis = {
    run: synthesize,
    unique: unique,
    money: money,
    pct: pct
  };
})(typeof window !== "undefined" ? window : this);
