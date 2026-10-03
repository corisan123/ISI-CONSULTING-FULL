/**

 * ISI Engine 3 — Operations & throughput (proprietary).

 */

(function (global) {

  "use strict";



  function n(v, d) {

    var x = Number(v);

    return isFinite(x) ? x : d;

  }



  function kitFields(kitId) {

    var kit = global.ISI.kits && global.ISI.kits[kitId];

    var fields = {};

    if (!kit || !kit.fields) return fields;

    kit.fields.forEach(function (f) {

      fields[f.id] = f.value;

    });

    return fields;

  }



  function defaultInputs() {

    return {

      company: "Client company (placeholder)",

      diligenceSit: "throughput",

      exploitThresholdPct: 0.35,

      proposedCapex: 450000

    };

  }



  function buildOperationsNodes() {

    return {

      "file-intake": {

        label: "Operations file intake",

        dependsOn: [],

        storeAs: "engine3-intake",

        run: function (ctx) {

          var base = defaultInputs();

          var merged = Object.assign(base, ctx.inputs || {});

          if (global.ISI.store) {

            global.ISI.store.setEngagement({ company: merged.company, constraint: "operations" });

          }

          return { headline: merged.company + " — operations engine loaded", inputs: merged };

        }

      },

      "constraint-ops": {

        label: "Constraint identification (ops kit)",

        dependsOn: ["file-intake"],

        storeAs: "operations",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var fields = kitFields("operations");

          Object.keys(inp).forEach(function (k) {

            if (fields[k] != null || isFinite(Number(inp[k]))) fields[k] = inp[k];

          });

          var res = global.ISI.kits.operations.run(fields);

          return {

            headline: res.headline,

            metrics: res.metrics,

            branches: res.branches

          };

        }

      },

      "ops-diligence": {

        label: "Throughput diligence gates",

        dependsOn: ["file-intake"],

        storeAs: "diligence",

        run: function (ctx) {

          var sit = ctx.get("file-intake").inputs.diligenceSit || "throughput";

          var fields = {};

          global.ISI.diligence.FIELDS.forEach(function (f) {

            fields[f.id] = f.value;

          });

          var res = global.ISI.diligence.run(sit, fields, global.ISI.math);

          return {

            headline: res.tree.verdict + " — " + res.headline,

            verdict: res.tree.verdict,

            payload: res

          };

        }

      },

      "roi-throughput": {

        label: "Throughput ROI (exploit vs elevate)",

        dependsOn: ["constraint-ops"],

        storeAs: "roi-throughput",

        run: function (ctx) {

          var ops = ctx.get("constraint-ops");

          var lost = n(ops.metrics && ops.metrics.annualContributionAtRisk, 120000);

          return {

            headline: "Exploit path — lost T about $" + Math.round(lost).toLocaleString() + "/yr",

            metrics: { lostThroughput: lost, exploitFirst: true },

            lostThroughput: lost

          };

        }

      },

      "capex-gate": {

        label: "CAPEX gate (exploit before buy)",

        dependsOn: ["roi-throughput", "ops-diligence", "file-intake"],

        storeAs: "engine3-capex-gate",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var lost = ctx.get("roi-throughput").lostThroughput;

          var capex = n(inp.proposedCapex, 450000);

          var threshold = n(inp.exploitThresholdPct, 0.35);

          var exploitRecovery = lost * threshold;

          var dd = ctx.get("ops-diligence").verdict;

          var deferCapex = exploitRecovery >= capex * 0.15 || dd === "CAUTION";

          var verdict = deferCapex ? "DEFER_CAPEX" : "CAPEX_REVIEW";

          return {

            headline: verdict === "DEFER_CAPEX"

              ? "Defer capacity capex — exploit constraint first"

              : "Capex may be justified after exploit proof",

            verdict: verdict,

            exploitRecovery: exploitRecovery,

            proposedCapex: capex,

            diligence: dd

          };

        }

      },

      summary: {

        label: "Operations engine summary KPIs",

        dependsOn: ["capex-gate", "constraint-ops", "ops-diligence"],

        storeAs: "engine3-summary",

        run: function (ctx) {

          var ops = ctx.get("constraint-ops");

          var roi = ctx.get("roi-throughput");

          var gate = ctx.get("capex-gate");

          var dd = ctx.get("ops-diligence");

          return {

            headline: gate.headline,

            kpis: {

              diligence: dd.verdict,

              weeklyGap: ops.metrics.weeklyGap,

              lostThroughput: roi.lostThroughput,

              capexGate: gate.verdict,

              oee: ops.metrics.oee

            }

          };

        }

      }

    };

  }



  function register() {

    var nodes = buildOperationsNodes();

    var engine = global.ISI.engineBus.createEngine("operations-throughput", nodes);

    global.ISI.engineBus.operations = engine;

    return engine;

  }



  global.ISI = global.ISI || {};

  global.ISI.engineBus = global.ISI.engineBus || {};

  global.ISI.engineBus.registerOperations = register;

})(typeof window !== "undefined" ? window : this);

