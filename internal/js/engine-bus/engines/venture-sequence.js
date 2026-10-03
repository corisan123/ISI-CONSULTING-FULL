/**

 * ISI Engine 4 — Venture & sequence (proprietary).

 * Unit economics, runway, kill conditions — no growth diagnostic theater.

 */

(function (global) {

  "use strict";



  function n(v, d) {

    var x = Number(v);

    return isFinite(x) ? x : d;

  }



  function defaultInputs() {

    return {

      company: "Venture (placeholder)",

      cashOnHand: 850000,

      monthlyBurn: 72000,

      monthlyRevenue: 38000,

      contributionMarginPct: 42,

      cac: 1200,

      ltv: 4800,

      namedBuyers: 2,

      diligenceSit: "capital",

      killRunwayMonths: 6

    };

  }



  function buildVentureNodes() {

    return {

      "file-intake": {

        label: "Venture file intake",

        dependsOn: [],

        storeAs: "engine4-intake",

        run: function (ctx) {

          var merged = Object.assign(defaultInputs(), ctx.inputs || {});

          if (global.ISI.store) {

            global.ISI.store.setEngagement({ company: merged.company, constraint: "venture" });

          }

          return { headline: merged.company + " — venture sequence loaded", inputs: merged };

        }

      },

      "venture-diligence": {

        label: "Venture diligence gate",

        dependsOn: ["file-intake"],

        storeAs: "diligence",

        run: function (ctx) {

          var sit = ctx.get("file-intake").inputs.diligenceSit || "capital";

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

      "unit-economics": {

        label: "Unit economics",

        dependsOn: ["file-intake"],

        storeAs: "engine4-unit-econ",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var cm = n(inp.contributionMarginPct, 40) / 100;

          var rev = n(inp.monthlyRevenue, 0);

          var contribution = rev * cm;

          var cac = n(inp.cac, 0);

          var ltv = n(inp.ltv, 0);

          var ltvCac = cac > 0 ? ltv / cac : NaN;

          var paybackMonths = contribution > 0 ? cac / (contribution / Math.max(1, n(inp.activeCustomers, 40))) : NaN;

          var healthy = ltvCac >= 3 && cm >= 0.35;

          return {

            headline: healthy ? "Unit economics support scale tests" : "Unit economics weak — fix before growth spend",

            metrics: { contributionMonthly: contribution, ltvCac: ltvCac, cm: cm, paybackMonths: paybackMonths },

            healthy: healthy

          };

        }

      },

      runway: {

        label: "Runway & burn",

        dependsOn: ["file-intake", "unit-economics"],

        storeAs: "engine4-runway",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var ue = ctx.get("unit-economics");

          var cash = n(inp.cashOnHand, 0);

          var burn = n(inp.monthlyBurn, 0);

          var rev = n(inp.monthlyRevenue, 0);

          var netBurn = Math.max(0, burn - ue.metrics.contributionMonthly);

          var runwayMonths = netBurn > 0 ? cash / netBurn : 999;

          return {

            headline: "Runway ~" + (runwayMonths > 120 ? "120+" : runwayMonths.toFixed(1)) + " months at current net burn",

            runwayMonths: runwayMonths,

            netBurn: netBurn,

            cash: cash

          };

        }

      },

      "kill-conditions": {

        label: "Kill conditions & sequence gate",

        dependsOn: ["runway", "venture-diligence", "unit-economics", "file-intake"],

        storeAs: "engine4-kill",

        run: function (ctx) {

          var inp = ctx.get("file-intake").inputs;

          var rw = ctx.get("runway");

          var ue = ctx.get("unit-economics");

          var dd = ctx.get("venture-diligence").verdict;

          var killMonths = n(inp.killRunwayMonths, 6);

          var buyers = n(inp.namedBuyers, 0);

          var kills = [];

          if (rw.runwayMonths < killMonths) kills.push("Runway below " + killMonths + " months");

          if (!ue.healthy) kills.push("Unit economics fail LTV/CAC or contribution floor");

          if (buyers < 1) kills.push("No named buyer with a price test");

          if (dd === "STOP") kills.push("Diligence STOP — recast thesis before sequence");

          var verdict = kills.length ? "KILL_OR_RECAST" : "SEQUENCE_OK";

          return {

            headline: verdict === "SEQUENCE_OK" ? "Venture sequence may proceed to 90-day proof" : "Kill / recast: " + kills[0],

            verdict: verdict,

            kills: kills,

            runwayMonths: rw.runwayMonths

          };

        }

      },

      summary: {

        label: "Venture engine summary KPIs",

        dependsOn: ["kill-conditions", "runway", "unit-economics", "venture-diligence"],

        storeAs: "engine4-summary",

        run: function (ctx) {

          var kill = ctx.get("kill-conditions");

          var rw = ctx.get("runway");

          var ue = ctx.get("unit-economics");

          var dd = ctx.get("venture-diligence");

          return {

            headline: kill.headline,

            kpis: {

              diligence: dd.verdict,

              runwayMonths: rw.runwayMonths,

              ltvCac: ue.metrics.ltvCac,

              sequence: kill.verdict,

              killCount: kill.kills.length

            }

          };

        }

      }

    };

  }



  function register() {

    var nodes = buildVentureNodes();

    var engine = global.ISI.engineBus.createEngine("venture-sequence", nodes);

    global.ISI.engineBus.venture = engine;

    return engine;

  }



  global.ISI = global.ISI || {};

  global.ISI.engineBus = global.ISI.engineBus || {};

  global.ISI.engineBus.registerVenture = register;

})(typeof window !== "undefined" ? window : this);

