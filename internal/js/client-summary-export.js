/**
 * ISI Consulting — publish engine-bus output to client summary snapshot.
 * Internal only. Strips methods; client pages render snapshot only.
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "isi_client_summary";

  function money(n) {
    if (!isFinite(n)) return "—";
    var abs = Math.abs(n);
    var sign = n < 0 ? "−" : "";
    if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return sign + "$" + (abs / 1e3).toFixed(0) + "K";
    return sign + "$" + Math.round(abs).toLocaleString("en-US");
  }

  function pctRate(n) {
    if (!isFinite(n)) return "—";
    var x = Math.abs(n) <= 1 ? n * 100 : n;
    return x.toFixed(2) + "%";
  }

  function pctProb(n) {
    if (!isFinite(n)) return "—";
    return (n * 100).toFixed(0) + "%";
  }

  function programRail(graph) {
    var log = (graph && graph.lastRun) || [];
    return log.map(function (row) {
      return { id: row.id, name: row.label, headline: row.headline };
    });
  }

  function buildFinancialSnapshot(engine) {
    var g = engine.read();
    var sum = engine.getNodeOutput("summary");
    var mc = engine.getNodeOutput("monte-carlo");
    var sens = engine.getNodeOutput("sensitivity-1way");
    var dd = engine.getNodeOutput("diligence");
    var wacc = engine.getNodeOutput("cost-of-capital");
    var capex = engine.getNodeOutput("capex-schedule");
    var dep = engine.getNodeOutput("depreciation-gaap");
    var marginKit = engine.getNodeOutput("margin-capital-kit");
    var fin = engine.getNodeOutput("npv-irr-pv");
    var dm = engine.getNodeOutput("decision-matrix");
    if (!sum || !sum.kpis) {
      return { ok: false, error: "Run the full financial engine before publishing." };
    }
    var k = sum.kpis;
    var drivers = (sens && sens.rows ? sens.rows : []).slice(0, 4).map(function (r) {
      return {
        label: r.label,
        lowNpv: money(r.lowAbs),
        highNpv: money(r.base + r.high),
        swing: money(Math.abs(r.high - r.low))
      };
    });
    return {
      ok: true,
      payload: {
        schema: 1,
        publishedAt: new Date().toISOString(),
        group: "financial",
        engineId: "financial-capital",
        graphVersion: g.version || 0,
        title: "ISI Financial & Capital Diagnostic Summary",
        company: k.company || "Engagement file (unset)",
        verdict: k.diligence || (dd && dd.verdict) || "—",
        headline: sum.headline || dm.headline || "",
        narrative:
          "Capital gate, cost of capital, investment case, depreciation, value stack, tornado sensitivity, and seeded Monte Carlo were applied as named ISI programs. When inputs or risk levels change in consultation, the engine re-runs and this summary is republished.",
        sections: [
          {
            id: "capital-gate",
            title: "ISI Capital Gate",
            metrics: [
              { label: "Gate verdict", value: String(k.diligence || "—") },
              { label: "Gate narrative", value: (dd && dd.headline) || "—" }
            ]
          },
          {
            id: "cost-and-investment",
            title: "Cost of capital & investment",
            metrics: [
              { label: "ISI WACC module", value: pctRate(k.wacc) },
              { label: "Investment / CAPEX", value: (capex && capex.headline) || money(Math.abs((fin.cashflows || [0])[0])) },
              { label: "ISI GAAP depreciation", value: (dep && dep.headline) || "—" },
              { label: "ISI Margin & Capital kit", value: (marginKit && marginKit.headline) || "—" }
            ]
          },
          {
            id: "value-stack",
            title: "ISI NPV–IRR–PI stack",
            metrics: [
              { label: "NPV @ WACC", value: money(k.npv) },
              { label: "IRR", value: pctRate(k.irr) },
              { label: "Profitability index", value: isFinite(k.pi) ? Number(k.pi).toFixed(2) : "—" },
              { label: "Payback (years)", value: isFinite(k.payback) ? Number(k.payback).toFixed(2) : "—" }
            ]
          },
          {
            id: "range",
            title: "ISI Seeded Monte Carlo (capital)",
            bands: {
              p10: mc && mc.p10 != null ? money(mc.p10) : "—",
              p50: money(k.mcP50),
              p90: mc && mc.p90 != null ? money(mc.p90) : "—",
              pPositive: pctProb(k.mcPPositive),
              mean: mc && mc.mean != null ? money(mc.mean) : "—"
            },
            note: "Probability bands on NPV — a range for discussion, not a forecast guarantee."
          },
          {
            id: "sensitivity",
            title: "ISI One-Way Tornado (NPV)",
            topDriver: k.sensitivityTop || (sens && sens.topSwing) || "—",
            drivers: drivers
          },
          {
            id: "decision",
            title: "ISI Capital Decision Matrix",
            metrics: [
              { label: "Recommended path", value: String(k.matrixBest || "—") },
              { label: "Decision score", value: isFinite(k.decisionScore) ? Number(k.decisionScore).toFixed(2) : "—" }
            ],
            text: (dm && dm.headline) || sum.headline || ""
          }
        ],
        programs: programRail(g),
        disclaimer:
          "Confidential engagement summary. Method weights, formulas, and source engines remain ISI trade secret. Republished when upstream inputs change."
      }
    };
  }

  function buildCommercialSnapshot(engine) {
    var g = engine.read();
    var sum = engine.getNodeOutput("summary");
    if (!sum || !sum.kpis) {
      return { ok: false, error: "Run the full commercial engine before publishing." };
    }
    var k = sum.kpis;
    var tg = engine.getNodeOutput("tollgate-decision");
    return {
      ok: true,
      payload: {
        schema: 1,
        publishedAt: new Date().toISOString(),
        group: "commercial",
        engineId: "commercial-tollgate",
        graphVersion: g.version || 0,
        title: "ISI Commercial & Tollgate Diagnostic Summary",
        company: k.company || "Engagement file (unset)",
        verdict: k.tollgate || "—",
        headline: sum.headline || (tg && tg.headline) || "",
        narrative:
          "Qualification, pipeline integrity, commercial tree, sensitivity, Monte Carlo, and fractional BD tollgate ran as named ISI programs. Input or win-rate changes trigger a full bus recompute before republish.",
        sections: [
          {
            id: "tollgate",
            title: "Fractional BD tollgate",
            metrics: [
              { label: "Tollgate", value: String(k.tollgate || "—") },
              { label: "Diligence", value: String(k.diligence || "—") },
              { label: "Pipeline score", value: String(k.pipelineScore != null ? k.pipelineScore : "—") }
            ]
          },
          {
            id: "commercial-value",
            title: "Commercial decision path",
            metrics: [
              { label: "Best path", value: String(k.treeBest || "—") },
              { label: "Expected value", value: money(k.ev) },
              { label: "Top sensitivity", value: String(k.sensitivityTop || "—") },
              { label: "MC P50 EV", value: money(k.mcP50) },
              { label: "P(EV>0)", value: pctProb(k.mcPPositive) },
              { label: "Active interventions", value: String(k.interventionsActive != null ? k.interventionsActive : "0") },
              { label: "Matrix best", value: String(k.matrixBest || "—") },
              { label: "Root cause KEEP", value: String(k.rootcauseKeep != null ? k.rootcauseKeep : "—") }
            ]
          }
        ],
        programs: programRail(g),
        disclaimer:
          "Confidential engagement summary. Scoring weights and tree math remain ISI trade secret."
      }
    };
  }

  function saveSnapshot(payload) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      sessionStorage.setItem("isi_active_engagement_group", payload.group);
      return true;
    } catch (e) {
      return false;
    }
  }

  function publishFinancial() {
    if (!global.ISI.engineBus || !global.ISI.engineBus.financial) {
      return { ok: false, error: "Financial engine not loaded." };
    }
    var built = buildFinancialSnapshot(global.ISI.engineBus.financial);
    if (!built.ok) return built;
    if (!saveSnapshot(built.payload)) {
      return { ok: false, error: "Could not write client summary to session." };
    }
    return { ok: true, href: "/client/summary.html?group=financial" };
  }

  function publishCommercial() {
    if (!global.ISI.engineBus || !global.ISI.engineBus.commercial) {
      return { ok: false, error: "Commercial engine not loaded." };
    }
    var built = buildCommercialSnapshot(global.ISI.engineBus.commercial);
    if (!built.ok) return built;
    if (!saveSnapshot(built.payload)) {
      return { ok: false, error: "Could not write client summary to session." };
    }
    return { ok: true, href: "/client/summary.html?group=commercial" };
  }

  function buildOperationsSnapshot(engine) {
    var g = engine.read();
    var sum = engine.getNodeOutput("summary");
    var mc = engine.getNodeOutput("ops-monte-carlo");
    var sens = engine.getNodeOutput("ops-sensitivity");
    var dd = engine.getNodeOutput("ops-diligence");
    var ops = engine.getNodeOutput("constraint-ops");
    var gate = engine.getNodeOutput("capex-gate");
    var dm = engine.getNodeOutput("ops-decision-matrix");
    var pip = engine.getNodeOutput("ops-pipeline-integrity");
    if (!sum || !sum.kpis) {
      return { ok: false, error: "Run the full operations engine before publishing." };
    }
    var k = sum.kpis;
    var drivers = (sens && sens.rows ? sens.rows : []).slice(0, 4).map(function (r) {
      var lo = r.lowAbs != null ? r.lowAbs : r.base + r.low;
      var hi = r.highAbs != null ? r.highAbs : r.base + r.high;
      return {
        label: r.label,
        lowNpv: money(lo),
        highNpv: money(hi),
        swing: money(Math.abs(hi - lo))
      };
    });
    return {
      ok: true,
      payload: {
        schema: 1,
        publishedAt: new Date().toISOString(),
        group: "operations",
        engineId: "operations-throughput",
        graphVersion: g.version || 0,
        title: "ISI Operations & Throughput Diagnostic Summary",
        company: k.company || "Engagement file (unset)",
        verdict: k.diligence || (dd && dd.verdict) || "—",
        headline: sum.headline || (dm && dm.headline) || "",
        narrative:
          "Constraint identification, throughput diligence, exploit-vs-elevate ROI, CAPEX deferral, tornado sensitivity, and seeded Monte Carlo ran as named ISI programs. Republish after intake or floor metric changes.",
        sections: [
          {
            id: "constraint",
            title: "ISI Constraint ID module",
            metrics: [
              { label: "Weekly throughput gap", value: String(k.weeklyGap != null ? k.weeklyGap : "—") },
              { label: "Constraint OEE", value: (k.oee != null ? Number(k.oee).toFixed(0) : "—") + "%" },
              { label: "Lost throughput (annual $)", value: money(k.lostThroughput) },
              { label: "Kit headline", value: (ops && ops.headline) || "—" }
            ]
          },
          {
            id: "diligence-gate",
            title: "ISI Throughput Diligence Gate",
            metrics: [
              { label: "Gate verdict", value: String(k.diligence || "—") },
              { label: "Gate narrative", value: (dd && dd.headline) || "—" },
              { label: "Handoff / flow integrity", value: pip && pip.score != null ? (pip.score * 100).toFixed(0) + "%" : "—" }
            ]
          },
          {
            id: "capex-deferral",
            title: "ISI CAPEX deferral gate",
            metrics: [
              { label: "CAPEX gate", value: String(k.capexGate || "—") },
              { label: "Exploit recovery (modeled)", value: money(gate && gate.exploitRecovery) },
              { label: "Proposed CAPEX", value: money(gate && gate.proposedCapex) }
            ]
          },
          {
            id: "range",
            title: "ISI Seeded Monte Carlo (throughput $)",
            bands: {
              p10: mc && mc.p10 != null ? money(mc.p10) : "—",
              p50: money(k.mcP50),
              p90: mc && mc.p90 != null ? money(mc.p90) : "—",
              mean: mc && mc.mean != null ? money(mc.mean) : "—"
            },
            note: "Probability bands on throughput $ at risk / recovery — for discussion, not a forecast guarantee."
          },
          {
            id: "sensitivity",
            title: "ISI One-Way Tornado (lost throughput $)",
            topDriver: k.sensitivityTop || (sens && sens.topSwing) || "—",
            drivers: drivers
          },
          {
            id: "decision",
            title: "ISI Exploit vs CAPEX Decision Matrix",
            metrics: [
              { label: "Recommended path", value: String(k.matrixBest || "—") },
              { label: "Decision score", value: isFinite(k.decisionScore) ? Number(k.decisionScore).toFixed(2) : "—" }
            ],
            text: (dm && dm.headline) || sum.headline || ""
          }
        ],
        programs: programRail(g),
        disclaimer:
          "Confidential engagement summary. Throughput weights and kit math remain ISI trade secret."
      }
    };
  }

  function publishOperations() {
    if (!global.ISI.engineBus || !global.ISI.engineBus.operations) {
      return { ok: false, error: "Operations engine not loaded." };
    }
    var built = buildOperationsSnapshot(global.ISI.engineBus.operations);
    if (!built.ok) return built;
    if (!saveSnapshot(built.payload)) {
      return { ok: false, error: "Could not write client summary to session." };
    }
    return { ok: true, href: "/client/summary.html?group=operations" };
  }

  function readSnapshot() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  global.ISI = global.ISI || {};
  global.ISI.clientSummaryExport = {
    STORAGE_KEY: STORAGE_KEY,
    buildFinancialSnapshot: buildFinancialSnapshot,
    buildCommercialSnapshot: buildCommercialSnapshot,
    buildOperationsSnapshot: buildOperationsSnapshot,
    publishFinancial: publishFinancial,
    publishCommercial: publishCommercial,
    publishOperations: publishOperations,
    readSnapshot: readSnapshot
  };
})(typeof window !== "undefined" ? window : this);
