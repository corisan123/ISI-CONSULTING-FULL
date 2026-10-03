/**
 * ISI Engine 2 — Financial & capital (proprietary).
 * Libraries: ISI.math, ISI.diligence, ISI.kits, ISI.trees — not third-party consulting SaaS.
 */
(function (global) {
  "use strict";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
  }

  function defaultInputs() {
    return {
      company: "Client company (placeholder)",
      diligenceSit: "turnaround",
      investment: 750000,
      waccPct: 10,
      taxPct: 21,
      horizonYears: 5,
      cf1: 180000,
      cf2: 240000,
      cf3: 310000,
      cf4: 340000,
      cf5: 360000,
      capexYear0: 750000,
      depreciableBasis: 720000,
      deprecLifeYears: 7,
      mcIterations: 4000,
      mcSeed: 20261003
    };
  }

  function gaapDepreciationSchedule(basis, life, years) {
    var annual = life > 0 ? basis / life : 0;
    var schedule = [];
    var i;
    for (i = 0; i < years; i++) {
      schedule.push(i < life ? annual : 0);
    }
    return { method: "straight-line (ISI module)", annual: annual, schedule: schedule };
  }

  function buildFinancialNodes() {
    return {
      "file-intake": {
        label: "Financial file intake",
        dependsOn: [],
        storeAs: "engine2-intake",
        run: function (ctx) {
          var base = defaultInputs();
          var patch = ctx.inputs || {};
          var merged = Object.assign(base, patch);
          return {
            headline: merged.company + " — financial engine loaded",
            inputs: merged
          };
        }
      },
      diligence: {
        label: "Financial due diligence gates",
        dependsOn: ["file-intake"],
        storeAs: "diligence",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var fields = {};
          if (global.ISI.diligence && global.ISI.diligence.FIELDS) {
            global.ISI.diligence.FIELDS.forEach(function (f) {
              fields[f.id] = f.value;
            });
          }
          var sit = inp.diligenceSit || "turnaround";
          var res = global.ISI.diligence.run(sit, fields, global.ISI.math);
          return {
            headline: res.tree.verdict + " — " + res.headline,
            payload: res,
            verdict: res.tree.verdict
          };
        }
      },
      "cost-of-capital": {
        label: "Cost of capital (WACC)",
        dependsOn: ["file-intake"],
        storeAs: "engine2-wacc",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var wacc = n(inp.waccPct, 10) / 100;
          return {
            headline: "WACC " + (wacc * 100).toFixed(2) + "% (ISI cost-of-capital node)",
            wacc: wacc,
            tax: n(inp.taxPct, 21) / 100
          };
        }
      },
      "capex-schedule": {
        label: "CAPEX & investment schedule",
        dependsOn: ["file-intake"],
        storeAs: "engine2-capex",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var cfs = [-Math.abs(n(inp.capexYear0, inp.investment, 0))];
          var y;
          for (y = 1; y <= n(inp.horizonYears, 5); y++) {
            cfs.push(n(inp["cf" + y], 0));
          }
          return {
            headline: "CAPEX $" + Math.abs(cfs[0]).toLocaleString() + " · " + (cfs.length - 1) + "-year stream",
            cashflows: cfs
          };
        }
      },
      "depreciation-gaap": {
        label: "Depreciation (GAAP-aligned module)",
        dependsOn: ["capex-schedule", "file-intake"],
        storeAs: "engine2-depreciation",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var dep = gaapDepreciationSchedule(
            n(inp.depreciableBasis, 720000),
            n(inp.deprecLifeYears, 7),
            n(inp.horizonYears, 5)
          );
          return {
            headline: "Depreciation $" + Math.round(dep.annual).toLocaleString() + "/yr · " + dep.method,
            schedule: dep
          };
        }
      },
      "npv-irr-pv": {
        label: "NPV · IRR · PV · payback",
        dependsOn: ["capex-schedule", "cost-of-capital", "depreciation-gaap"],
        storeAs: "margin",
        run: function (ctx) {
          var cap = ctx.get("capex-schedule");
          var waccNode = ctx.get("cost-of-capital");
          var cf = cap.cashflows.slice();
          var rate = waccNode.wacc;
          var npv = global.ISI.math.npv(rate, cf);
          var irr = global.ISI.math.irr(cf);
          var pb = global.ISI.math.payback(cf);
          var pi = global.ISI.math.profitabilityIndex(rate, cf);
          return {
            headline: npv >= 0 ? "Value-accretive at WACC" : "Value-destructive at WACC",
            metrics: { NPV: npv, IRR: irr, Payback: pb, PI: pi, rate: rate },
            cashflows: cf
          };
        }
      },
      "sensitivity-1way": {
        label: "One-way sensitivity",
        dependsOn: ["npv-irr-pv"],
        storeAs: "sensitivity-1way",
        run: function (ctx) {
          var fin = ctx.get("npv-irr-pv");
          var rate = fin.metrics.rate;
          var cf = fin.cashflows;
          var baseNpv = fin.metrics.NPV;
          var shocks = [-0.2, -0.1, 0.1, 0.2];
          var rows = shocks.map(function (pct) {
            var cf2 = cf.slice();
            if (cf2.length > 1) cf2[1] = cf2[1] * (1 + pct);
            return { shock: pct, npv: global.ISI.math.npv(rate, cf2) };
          });
          return {
            headline: "NPV swing on Y1 CF · base $" + Math.round(baseNpv).toLocaleString(),
            baseNpv: baseNpv,
            rows: rows
          };
        }
      },
      "monte-carlo": {
        label: "Monte Carlo (seeded)",
        dependsOn: ["npv-irr-pv"],
        storeAs: "montecarlo",
        run: function (ctx) {
          var fin = ctx.get("npv-irr-pv");
          var inp = ctx.get("file-intake").inputs;
          var rate = fin.metrics.rate;
          var cf = fin.cashflows;
          var pWin = 0.55;
          var mc = global.ISI.math.monteCarlo({
            iterations: n(inp.mcIterations, 4000),
            seed: n(inp.mcSeed, 20261003),
            inputs: [
              { name: "y1", type: "triangular", min: cf[1] * 0.7, mode: cf[1], max: cf[1] * 1.35 },
              { name: "capex", type: "normal", mean: Math.abs(cf[0]), stdev: Math.abs(cf[0]) * 0.08 }
            ],
            model: function (d) {
              var c = cf.slice();
              c[0] = -Math.abs(d.capex);
              c[1] = d.y1;
              return global.ISI.math.npv(rate, c);
            }
          });
          return {
            headline: "P50 NPV $" + Math.round(mc.p50).toLocaleString(),
            p10: mc.p10,
            p50: mc.p50,
            p90: mc.p90,
            mean: mc.mean,
            seed: inp.mcSeed
          };
        }
      },
      "decision-matrix": {
        label: "Capital decision matrix",
        dependsOn: ["diligence", "npv-irr-pv", "monte-carlo"],
        storeAs: "matrix",
        run: function (ctx) {
          var dd = ctx.get("diligence");
          var fin = ctx.get("npv-irr-pv");
          var mc = ctx.get("monte-carlo");
          var ddOk = dd.verdict !== "STOP";
          var score = (fin.metrics.NPV > 0 ? 0.4 : 0) + (ddOk ? 0.35 : 0) + (mc.p50 > 0 ? 0.25 : 0);
          return {
            headline: score >= 0.6 ? "Proceed with structured conditions" : "Hold — gates or tail risk",
            score: score,
            diligenceVerdict: dd.verdict,
            npv: fin.metrics.NPV
          };
        }
      },
      summary: {
        label: "Financial engine summary KPIs",
        dependsOn: ["decision-matrix", "monte-carlo", "npv-irr-pv", "diligence"],
        storeAs: "engine2-summary",
        run: function (ctx) {
          var fin = ctx.get("npv-irr-pv");
          var mc = ctx.get("monte-carlo");
          var dm = ctx.get("decision-matrix");
          var dd = ctx.get("diligence");
          return {
            headline: dm.headline,
            kpis: {
              diligence: dd.verdict,
              npv: fin.metrics.NPV,
              irr: fin.metrics.IRR,
              p50: mc.p50,
              decisionScore: dm.score
            }
          };
        }
      }
    };
  }

  function register() {
    var nodes = buildFinancialNodes();
    var engine = global.ISI.engineBus.createEngine("financial-capital", nodes);
    global.ISI.engineBus.financial = engine;
    return engine;
  }

  global.ISI = global.ISI || {};
  global.ISI.engineBus = global.ISI.engineBus || {};
  global.ISI.engineBus.registerFinancial = register;
})(typeof window !== "undefined" ? window : this);
