/**

 * ISI Engine 2 — Financial & capital (proprietary).

 * Libraries: ISI.math, ISI.diligence, ISI.kits, ISI.trees — not third-party consulting SaaS.

 */

(function (global) {

  "use strict";



  var UNSET_COMPANY = "Engagement file (unset)";



  function n(v, d) {

    var x = Number(v);

    return isFinite(x) ? x : d;

  }



  function parseRevenue(str) {

    if (!str) return 0;

    var raw = String(str);

    var num = Number(raw.replace(/[^0-9.]/g, ""));

    if (!isFinite(num) || num <= 0) return 0;

    if (/m\b|million/i.test(raw) && num < 1000) return num * 1000000;

    if (/k\b|thousand/i.test(raw) && num < 1000) return num * 1000;

    if (num < 500 && !/[.$]/.test(raw)) return num * 1000000;

    return num;

  }



  function diligenceSitFromIntake(intake) {

    var decision = String(intake.finDecision || intake["Decision this quarter"] || "").toLowerCase();

    if (/acquire|capex|invest|expand|fund|hire|capital project/i.test(decision)) return "capital";

    if (/sell|divest|recap|refinanc/i.test(decision)) return "commercial";

    if (intake.cashTightness === "The constraint" || intake.coveragePressure === "The gate") {

      return "turnaround";

    }

    return "turnaround";

  }



  function loadIntake(ctx) {

    var patch = ctx.inputs || {};

    var d = {};

    try {

      d = JSON.parse(sessionStorage.getItem("isi_clientIntake") || "{}");

    } catch (e) {

      d = {};

    }

    if (!d.companyName) {

      d.companyName = UNSET_COMPANY;

    }

    return Object.assign({ company: d.companyName }, d, patch);

  }



  function defaultInputs() {

    return {

      company: UNSET_COMPANY,

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

      mcSeed: 20261003,

      pricePressure: 6

    };

  }



  function inputsFromIntake(intake, base) {

    var merged = Object.assign({}, base);

    merged.company = intake.companyName || intake.company || UNSET_COMPANY;

    merged.diligenceSit = diligenceSitFromIntake(intake);

    var rev = n(intake.revenue, 0) || parseRevenue(intake["Annual revenue"]);

    if (rev > 0) {

      merged.revenue = rev;

      var capex = Math.round(rev * 0.04);

      merged.investment = capex;

      merged.capexYear0 = capex;

      merged.depreciableBasis = Math.round(capex * 0.96);

      var ebitda = Math.round(rev * 0.08);

      merged.cf1 = Math.round(ebitda * 0.45);

      merged.cf2 = Math.round(ebitda * 0.55);

      merged.cf3 = Math.round(ebitda * 0.65);

      merged.cf4 = Math.round(ebitda * 0.7);

      merged.cf5 = Math.round(ebitda * 0.75);

    }

    if (/low|none/i.test(intake.jobProfitVisibility || intake["Job profit visibility"] || "")) {

      merged.pricePressure = 8;

    } else if (/closeout/i.test(intake.jobProfitVisibility || "")) {

      merged.pricePressure = 7;

    }

    if (intake.coveragePressure === "The gate") {

      merged.waccPct = Math.max(merged.waccPct, 12);

    }

    merged._intake = intake;

    return merged;

  }



  function gaapDepreciationSchedule(basis, life, years) {

    var annual = life > 0 ? basis / life : 0;

    var schedule = [];

    var i;

    for (i = 0; i < years; i++) {

      schedule.push(i < life ? annual : 0);

    }

    return { method: "ISI GAAP straight-line module", annual: annual, schedule: schedule };

  }



  function kitFieldsFromInputs(inp) {

    return {

      revenue: n(inp.revenue, 25000000),

      ebitda: n(inp.revenue, 25000000) * 0.08,

      investment: n(inp.capexYear0, inp.investment, 0),

      cf1: n(inp.cf1, 0),

      cf2: n(inp.cf2, 0),

      cf3: n(inp.cf3, 0),

      cf4: n(inp.cf4, 0),

      cf5: n(inp.cf5, 0),

      rate: n(inp.waccPct, 10),

      tax: n(inp.taxPct, 21),

      da: n(inp.depreciableBasis, 720000) / Math.max(1, n(inp.deprecLifeYears, 7)),

      pricePressure: n(inp.pricePressure, 6)

    };

  }



  function buildFinancialNodes() {

    return {

      "file-intake": {

        label: "ISI Financial File Intake module",

        dependsOn: [],

        storeAs: "engine2-intake",

        run: function (ctx) {

          var intake = loadIntake(ctx);

          var base = defaultInputs();

          var merged = inputsFromIntake(intake, base);

          Object.assign(merged, ctx.inputs || {});

          merged.company = merged.company || intake.companyName || UNSET_COMPANY;

          if (global.ISI.store) {

            global.ISI.store.setEngagement({

              company: merged.company,

              industry: intake.trade,

              constraint: "financial",

              family: "financial"

            });

          }

          return {

            headline: merged.company + " — ISI financial & capital bus loaded",

            inputs: merged,

            intake: intake

          };

        }

      },

      diligence: {

        label: "ISI Capital Gate — diligence gates",

        dependsOn: ["file-intake"],

        storeAs: "diligence",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var intake = ctx.get("file-intake").intake;

          var fields = {};

          if (global.ISI.diligence && global.ISI.diligence.FIELDS) {

            global.ISI.diligence.FIELDS.forEach(function (f) {

              fields[f.id] = f.value;

            });

          }

          if (intake && /growth story anyway/i.test(intake.stopAllowed || intake["Will a STOP be allowed"] || "")) {

            fields.managementHonesty = "low";

          }

          var sit = inp.diligenceSit || "turnaround";

          var res = global.ISI.diligence.run(sit, fields, global.ISI.math);

          return {

            headline: res.tree.verdict + " — ISI Capital Gate: " + res.headline,

            payload: res,

            verdict: res.tree.verdict

          };

        }

      },

      "cost-of-capital": {

        label: "ISI WACC module",

        dependsOn: ["file-intake"],

        storeAs: "engine2-wacc",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var wacc = n(inp.waccPct, 10) / 100;

          return {

            headline: "ISI WACC module · " + (wacc * 100).toFixed(2) + "% all-in",

            wacc: wacc,

            tax: n(inp.taxPct, 21) / 100

          };

        }

      },

      "capex-schedule": {

        label: "ISI CAPEX & investment schedule module",

        dependsOn: ["file-intake"],

        storeAs: "engine2-capex",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var cfs = [-Math.abs(n(inp.capexYear0, inp.investment, 0))];

          var y;

          var horizon = n(inp.horizonYears, 5);

          for (y = 1; y <= horizon; y++) {

            cfs.push(n(inp["cf" + y], 0));

          }

          return {

            headline:

              "ISI CAPEX schedule · $" +

              Math.abs(cfs[0]).toLocaleString() +

              " year 0 · " +

              (cfs.length - 1) +

              "-year incremental stream",

            cashflows: cfs

          };

        }

      },

      "depreciation-gaap": {

        label: "ISI GAAP depreciation schedule module",

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

            headline:

              "ISI GAAP depreciation · $" +

              Math.round(dep.annual).toLocaleString() +

              "/yr · " +

              dep.method,

            schedule: dep

          };

        }

      },

      "margin-capital-kit": {

        label: "ISI Margin & Capital diagnostic kit",

        dependsOn: ["file-intake", "cost-of-capital", "capex-schedule"],

        storeAs: "engine2-margin-kit",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var kit = global.ISI.kits && global.ISI.kits.margin;

          if (!kit || !kit.run) {

            return { headline: "Margin kit unavailable", branches: [] };

          }

          var res = kit.run(kitFieldsFromInputs(inp), global.ISI.math);

          return {

            headline: "ISI Margin & Capital kit · " + res.headline,

            metrics: res.metrics,

            branches: res.branches,

            cashflows: res.cashflows,

            rate: res.rate

          };

        }

      },

      "npv-irr-pv": {

        label: "ISI NPV–IRR–PI stack",

        dependsOn: ["capex-schedule", "cost-of-capital", "depreciation-gaap", "margin-capital-kit"],

        storeAs: "engine2-npv-stack",

        run: function (ctx) {

          var cap = ctx.get("capex-schedule");

          var waccNode = ctx.get("cost-of-capital");

          var kitNode = ctx.get("margin-capital-kit");

          var cf = cap.cashflows.slice();

          var rate = waccNode.wacc;

          var npv = global.ISI.math.npv(rate, cf);

          var irr = global.ISI.math.irr(cf);

          var pb = global.ISI.math.payback(cf);

          var pi = global.ISI.math.profitabilityIndex(rate, cf);

          var dpb = global.ISI.math.discountedPayback(rate, cf);

          return {

            headline:

              npv >= 0

                ? "ISI NPV–IRR–PI stack · value-accretive at WACC"

                : "ISI NPV–IRR–PI stack · value-destructive at WACC",

            metrics: { NPV: npv, IRR: irr, Payback: pb, DiscountedPayback: dpb, PI: pi, rate: rate },

            cashflows: cf,

            kitBranches: kitNode.branches || []

          };

        }

      },

      "sensitivity-1way": {

        label: "ISI One-Way Tornado (NPV)",

        dependsOn: ["npv-irr-pv", "file-intake"],

        storeAs: "sensitivity-1way",

        run: function (ctx) {

          var fin = ctx.get("npv-irr-pv");

          var inp = ctx.get("file-intake").inputs;

          var rate = fin.metrics.rate;

          var cf = fin.cashflows;

          var base = {

            wacc: rate * 100,

            cf1: cf.length > 1 ? cf[1] : n(inp.cf1, 0)

          };

          var rows = global.ISI.trees.oneWay(

            base,

            [

              { key: "wacc", label: "WACC", pct: 0.15 },

              { key: "cf1", label: "Year 1 incremental CF", pct: 0.2 }

            ],

            function (b) {

              var r = n(b.wacc, rate * 100) / 100;

              var c = cf.slice();

              if (c.length > 1) c[1] = n(b.cf1, c[1]);

              return global.ISI.math.npv(r, c);

            }

          );

          return {

            headline: "ISI One-Way Tornado · largest swing: " + rows[0].label,

            baseNpv: fin.metrics.NPV,

            topSwing: rows[0].label,

            rows: rows

          };

        }

      },

      "monte-carlo": {

        label: "ISI Seeded Monte Carlo (capital)",

        dependsOn: ["npv-irr-pv", "file-intake"],

        storeAs: "montecarlo",

        run: function (ctx) {

          var fin = ctx.get("npv-irr-pv");

          var inp = ctx.get("file-intake").inputs;

          var rate = fin.metrics.rate;

          var cf = fin.cashflows;

          var mc = global.ISI.math.monteCarlo({

            iterations: n(inp.mcIterations, 4000),

            seed: n(inp.mcSeed, 20261003),

            inputs: [

              {

                name: "y1",

                type: "triangular",

                min: cf[1] * 0.7,

                mode: cf[1],

                max: cf[1] * 1.35

              },

              {

                name: "capex",

                type: "normal",

                mean: Math.abs(cf[0]),

                stdev: Math.abs(cf[0]) * 0.08

              },

              {

                name: "waccBump",

                type: "triangular",

                min: -0.015,

                mode: 0,

                max: 0.025

              }

            ],

            model: function (d) {

              var c = cf.slice();

              c[0] = -Math.abs(d.capex);

              c[1] = d.y1;

              return global.ISI.math.npv(rate + d.waccBump, c);

            }

          });

          var pPositive = mc.values.filter(function (v) {

            return v > 0;

          }).length / mc.iterations;

          return {

            headline:

              "ISI Seeded Monte Carlo · P50 NPV $" +

              Math.round(mc.p50).toLocaleString() +

              " · P(NPV>0) " +

              (pPositive * 100).toFixed(0) +

              "%",

            p10: mc.p10,

            p50: mc.p50,

            p90: mc.p90,

            mean: mc.mean,

            pPositive: pPositive,

            seed: n(inp.mcSeed, 20261003)

          };

        }

      },

      "decision-matrix": {

        label: "ISI Capital Decision Matrix",

        dependsOn: ["diligence", "npv-irr-pv", "monte-carlo", "sensitivity-1way"],

        storeAs: "matrix",

        run: function (ctx) {

          var dd = ctx.get("diligence");

          var fin = ctx.get("npv-irr-pv");

          var mc = ctx.get("monte-carlo");

          var sens = ctx.get("sensitivity-1way");

          var alts = [

            {

              id: "proceed",

              label: "Proceed — full deployment",

              npv: fin.metrics.NPV,

              mcP50: mc.p50,

              diligenceOk: dd.verdict !== "STOP" ? 1 : 0.1

            },

            {

              id: "phase",

              label: "Phase — gate spend by milestone",

              npv: fin.metrics.NPV * 0.85,

              mcP50: mc.p50 * 0.9,

              diligenceOk: dd.verdict === "STOP" ? 0.35 : 0.75

            },

            {

              id: "hold",

              label: "Hold — fix gates first",

              npv: Math.min(0, fin.metrics.NPV * 0.2),

              mcP50: Math.min(mc.p50, 0),

              diligenceOk: dd.verdict === "STOP" ? 0.9 : 0.25

            }

          ];

          var matrix = global.ISI.trees.decisionMatrix(alts, [

            {

              id: "npv",

              label: "NPV at WACC",

              weight: 0.35,

              score: function (a) {

                return a.npv;

              },

              normalize: function (v) {

                var m = Math.max.apply(

                  null,

                  alts.map(function (x) {

                    return Math.abs(x.npv);

                  })

                ) || 1;

                return (v / m + 1) / 2;

              }

            },

            {

              id: "mc",

              label: "Monte Carlo P50",

              weight: 0.25,

              score: function (a) {

                return a.mcP50;

              },

              normalize: function (v) {

                var m = Math.max.apply(

                  null,

                  alts.map(function (x) {

                    return Math.abs(x.mcP50);

                  })

                ) || 1;

                return (v / m + 1) / 2;

              }

            },

            {

              id: "dd",

              label: "Clears ISI Capital Gate",

              weight: 0.25,

              score: function (a) {

                return a.diligenceOk;

              },

              normalize: function (v) {

                return v;

              }

            },

            {

              id: "risk",

              label: "Sensitivity headroom",

              weight: 0.15,

              score: function () {

                return fin.metrics.NPV > 0 && sens.rows && sens.rows[0] ? 0.8 : 0.35;

              },

              normalize: function (v) {

                return v;

              }

            }

          ]);

          if (global.ISI.store) {

            global.ISI.store.saveResult("matrix", matrix);

          }

          var ddOk = dd.verdict !== "STOP";

          var score =

            (fin.metrics.NPV > 0 ? 0.4 : 0) + (ddOk ? 0.35 : 0) + (mc.p50 > 0 ? 0.25 : 0);

          return {

            headline:

              matrix.best.label +

              " · ISI Capital Decision Matrix score " +

              score.toFixed(2),

            score: score,

            matrixScore: matrix.best ? matrix.best.total : 0,

            matrixBest: matrix.best.label,

            diligenceVerdict: dd.verdict,

            npv: fin.metrics.NPV,

            matrix: matrix

          };

        }

      },

      summary: {

        label: "ISI Financial Engine summary KPIs",

        dependsOn: [

          "decision-matrix",

          "monte-carlo",

          "npv-irr-pv",

          "diligence",

          "cost-of-capital",

          "sensitivity-1way",

          "margin-capital-kit"

        ],

        storeAs: "engine2-summary",

        run: function (ctx) {

          var fin = ctx.get("npv-irr-pv");

          var mc = ctx.get("monte-carlo");

          var dm = ctx.get("decision-matrix");

          var dd = ctx.get("diligence");

          var wacc = ctx.get("cost-of-capital");

          var sens = ctx.get("sensitivity-1way");

          var intake = ctx.get("file-intake").inputs;

          return {

            headline: dm.headline,

            kpis: {

              company: intake.company,

              diligence: dd.verdict,

              wacc: wacc.wacc,

              npv: fin.metrics.NPV,

              irr: fin.metrics.IRR,

              pi: fin.metrics.PI,

              payback: fin.metrics.Payback,

              sensitivityTop: sens.topSwing,

              mcP50: mc.p50,

              mcPPositive: mc.pPositive,

              matrixBest: dm.matrixBest,

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


