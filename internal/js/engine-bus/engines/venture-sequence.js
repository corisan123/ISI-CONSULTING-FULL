/**
 * ISI Engine 4 — Venture & sequence (proprietary).
 * Unit economics, runway, kill conditions, diligence, sensitivity, MC, matrix.
 */
(function (global) {
  "use strict";

  var UNSET_COMPANY = "Engagement file (unset)";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
  }

  function parseWeeks(str, fallback) {
    if (!str) return fallback;
    var m = String(str).match(/(\d+(?:\.\d+)?)/);
    return m ? n(m[1], fallback) : fallback;
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
      cashOnHand: 850000,
      monthlyBurn: 72000,
      monthlyRevenue: 38000,
      contributionMarginPct: 42,
      cac: 1200,
      ltv: 4800,
      activeCustomers: 40,
      namedBuyers: 2,
      diligenceSit: "capital",
      killRunwayMonths: 6,
      mcIterations: 4000,
      mcSeed: 20261004
    };
  }

  function diligenceSitFromIntake(intake) {
    var kind = String(intake.fileType || intake["File type"] || "").toLowerCase();
    if (/turnaround|recast|stressed/i.test(kind)) return "turnaround";
    if (/both/i.test(kind)) return "capital";
    return "capital";
  }

  function inputsFromIntake(intake, base) {
    var merged = Object.assign({}, base);
    merged.company = intake.companyName || intake.company || UNSET_COMPANY;
    merged.diligenceSit = diligenceSitFromIntake(intake);
    var weeks = parseWeeks(intake.runwayWeeks || intake["Runway weeks"], 0);
    if (weeks > 0) {
      var netBurnGuess = Math.max(5000, n(merged.monthlyBurn, 72000) - n(merged.monthlyRevenue, 38000) * 0.4);
      merged.cashOnHand = Math.round((weeks / 4.33) * netBurnGuess);
      if (weeks < 14) {
        merged.monthlyBurn = Math.max(merged.monthlyBurn, 85000);
        merged.killRunwayMonths = Math.min(merged.killRunwayMonths, 4);
      } else if (weeks < 24) {
        merged.killRunwayMonths = Math.min(merged.killRunwayMonths, 5);
      }
    }
    var buyer = intake.namedBuyer || intake["Named buyer or concentration"] || "";
    if (String(buyer).trim().length > 2) {
      merged.namedBuyers = Math.max(1, merged.namedBuyers);
    } else {
      merged.namedBuyers = 0;
    }
    var ue = intake.unitEconKnown || intake["Unit economics known"] || "";
    if (/not yet/i.test(ue)) {
      merged.ltv = Math.min(merged.ltv, 3200);
      merged.cac = Math.max(merged.cac, 1500);
      merged.contributionMarginPct = Math.min(merged.contributionMarginPct, 32);
    } else if (/partial/i.test(ue)) {
      merged.contributionMarginPct = Math.min(merged.contributionMarginPct, 38);
    }
    if (/plan first|not sure/i.test(intake.acceptsDiligence || intake["Accepts diligence next"] || "")) {
      merged.diligenceSit = "turnaround";
    }
    merged._intake = intake;
    return merged;
  }

  function sequenceIntegrity(intake) {
    var score = 0;
    var notes = [];
    var buyer = intake.namedBuyer || intake["Named buyer or concentration"] || "";
    if (String(buyer).trim().length > 2) score += 0.3;
    else notes.push("No named buyer or concentration on file");
    var offer = intake.offer || intake["Offer in one sentence"] || "";
    if (String(offer).trim().length > 12) score += 0.2;
    else notes.push("Offer not stated as who pays for what");
    var ue = intake.unitEconKnown || intake["Unit economics known"] || "";
    if (/modeled|partial/i.test(ue)) score += 0.2;
    else notes.push("Unit economics not modeled");
    var kill = intake.killCondition || intake["Kill condition"] || "";
    if (/\d/.test(kill) && kill.length > 8) score += 0.2;
    else notes.push("Kill condition lacks dated number");
    if (/yes|acceptable|cash and thesis/i.test(intake.acceptsDiligence || intake["Accepts diligence next"] || "")) {
      score += 0.1;
    } else {
      notes.push("Diligence sequence not accepted upfront");
    }
    return { score: Math.min(1, score), notes: notes };
  }

  function runwayFromInputs(inp, contributionMonthly) {
    var cash = n(inp.cashOnHand, 0);
    var burn = n(inp.monthlyBurn, 0);
    var netBurn = Math.max(0, burn - n(contributionMonthly, 0));
    var runwayMonths = netBurn > 0 ? cash / netBurn : 999;
    return { cash: cash, netBurn: netBurn, runwayMonths: runwayMonths };
  }

  function buildVentureNodes() {
    return {
      "file-intake": {
        label: "ISI Venture File Intake module",
        dependsOn: [],
        storeAs: "engine4-intake",
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
              constraint: "venture",
              family: "venture"
            });
          }
          return {
            headline: merged.company + " — ISI venture & sequence bus loaded",
            inputs: merged,
            intake: intake
          };
        }
      },
      "venture-sequence-integrity": {
        label: "ISI Venture Sequence Integrity module",
        dependsOn: ["file-intake"],
        storeAs: "engine4-sequence-integrity",
        run: function (ctx) {
          var intake = ctx.get("file-intake").intake;
          var seq = sequenceIntegrity(intake);
          return {
            headline: "Sequence integrity " + (seq.score * 100).toFixed(0) + "% — fundable sequence vs slide",
            score: seq.score,
            notes: seq.notes
          };
        }
      },
      "venture-diligence": {
        label: "ISI Venture Diligence Gate",
        dependsOn: ["file-intake"],
        storeAs: "diligence",
        run: function (ctx) {
          var sit = ctx.get("file-intake").inputs.diligenceSit || "capital";
          var fields = {};
          if (global.ISI.diligence && global.ISI.diligence.FIELDS) {
            global.ISI.diligence.FIELDS.forEach(function (f) {
              fields[f.id] = f.value;
            });
          }
          var res = global.ISI.diligence.run(sit, fields, global.ISI.math);
          return {
            headline: res.tree.verdict + " — " + res.headline,
            verdict: res.tree.verdict,
            payload: res
          };
        }
      },
      "unit-economics": {
        label: "ISI Unit Economics module",
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
          var cust = Math.max(1, n(inp.activeCustomers, 40));
          var paybackMonths = contribution > 0 ? cac / (contribution / cust) : NaN;
          var healthy = ltvCac >= 3 && cm >= 0.35;
          return {
            headline: healthy
              ? "Unit economics support scale tests"
              : "Unit economics weak — fix before growth spend",
            metrics: {
              contributionMonthly: contribution,
              ltvCac: ltvCac,
              cm: cm,
              paybackMonths: paybackMonths
            },
            healthy: healthy,
            contributionMonthly: contribution
          };
        }
      },
      runway: {
        label: "ISI Runway & Burn module",
        dependsOn: ["file-intake", "unit-economics"],
        storeAs: "engine4-runway",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var ue = ctx.get("unit-economics");
          var rw = runwayFromInputs(inp, ue.contributionMonthly);
          return {
            headline:
              "Runway ~" +
              (rw.runwayMonths > 120 ? "120+" : rw.runwayMonths.toFixed(1)) +
              " months at current net burn",
            runwayMonths: rw.runwayMonths,
            netBurn: rw.netBurn,
            cash: rw.cash
          };
        }
      },
      "kill-conditions": {
        label: "ISI Kill Conditions & Sequence Gate",
        dependsOn: ["runway", "venture-diligence", "unit-economics", "file-intake", "venture-sequence-integrity"],
        storeAs: "engine4-kill",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var rw = ctx.get("runway");
          var ue = ctx.get("unit-economics");
          var dd = ctx.get("venture-diligence").verdict;
          var seq = ctx.get("venture-sequence-integrity");
          var killMonths = n(inp.killRunwayMonths, 6);
          var buyers = n(inp.namedBuyers, 0);
          var kills = [];
          if (rw.runwayMonths < killMonths) kills.push("Runway below " + killMonths + " months");
          if (!ue.healthy) kills.push("Unit economics fail LTV/CAC or contribution floor");
          if (buyers < 1) kills.push("No named buyer with a price test");
          if (dd === "STOP") kills.push("Diligence STOP — recast thesis before sequence");
          if (seq.score < 0.45) kills.push("Sequence integrity too weak for fundable proof");
          var verdict = kills.length ? "KILL_OR_RECAST" : "SEQUENCE_OK";
          return {
            headline:
              verdict === "SEQUENCE_OK"
                ? "Venture sequence may proceed to 90-day proof"
                : "Kill / recast: " + kills[0],
            verdict: verdict,
            kills: kills,
            runwayMonths: rw.runwayMonths
          };
        }
      },
      "venture-sensitivity": {
        label: "ISI One-Way Tornado (runway months)",
        dependsOn: ["runway", "unit-economics", "file-intake"],
        storeAs: "sensitivity-1way",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var ue = ctx.get("unit-economics");
          var baseRw = ctx.get("runway").runwayMonths;
          var baseInp = Object.assign({}, inp);
          var rows = global.ISI.trees.oneWay(
            { monthlyRevenue: baseInp.monthlyRevenue, monthlyBurn: baseInp.monthlyBurn },
            [
              { key: "monthlyRevenue", label: "Monthly revenue", pct: 0.2 },
              { key: "monthlyBurn", label: "Monthly burn", pct: 0.15 }
            ],
            function (b) {
              var trial = Object.assign({}, baseInp, {
                monthlyRevenue: n(b.monthlyRevenue, baseInp.monthlyRevenue),
                monthlyBurn: n(b.monthlyBurn, baseInp.monthlyBurn)
              });
              var cm = n(trial.contributionMarginPct, 40) / 100;
              var contrib = n(trial.monthlyRevenue, 0) * cm;
              return runwayFromInputs(trial, contrib).runwayMonths;
            }
          );
          return {
            headline: "ISI One-Way Tornado · largest swing: " + rows[0].label,
            baseRunway: baseRw,
            topSwing: rows[0].label,
            rows: rows
          };
        }
      },
      "venture-monte-carlo": {
        label: "ISI Seeded Monte Carlo (runway months)",
        dependsOn: ["runway", "unit-economics", "file-intake"],
        storeAs: "montecarlo",
        run: function (ctx) {
          var inp = ctx.get("file-intake").inputs;
          var ue = ctx.get("unit-economics");
          var cm = ue.metrics.cm;
          var mc = global.ISI.math.monteCarlo({
            iterations: n(inp.mcIterations, 4000),
            seed: n(inp.mcSeed, 20261004),
            inputs: [
              {
                name: "monthlyRevenue",
                type: "triangular",
                min: n(inp.monthlyRevenue, 38000) * 0.65,
                mode: n(inp.monthlyRevenue, 38000),
                max: n(inp.monthlyRevenue, 38000) * 1.35
              },
              {
                name: "monthlyBurn",
                type: "normal",
                mean: n(inp.monthlyBurn, 72000),
                stdev: n(inp.monthlyBurn, 72000) * 0.12
              }
            ],
            model: function (d) {
              var trial = Object.assign({}, inp, {
                monthlyRevenue: d.monthlyRevenue,
                monthlyBurn: d.monthlyBurn
              });
              var contrib = d.monthlyRevenue * cm;
              return runwayFromInputs(trial, contrib).runwayMonths;
            }
          });
          var threshold = n(inp.killRunwayMonths, 6);
          var pPositive = 0;
          if (mc.values && mc.values.length) {
            var above = 0;
            for (var vi = 0; vi < mc.values.length; vi++) {
              if (mc.values[vi] >= threshold) above++;
            }
            pPositive = above / mc.values.length;
          } else if (isFinite(mc.p50)) {
            pPositive = mc.p50 >= threshold ? 0.55 : 0.35;
          }
          return {
            headline:
              "ISI Seeded Monte Carlo · P50 runway " +
              (mc.p50 > 120 ? "120+" : mc.p50.toFixed(1)) +
              " mo",
            p10: mc.p10,
            p50: mc.p50,
            p90: mc.p90,
            mean: mc.mean,
            pPositive: pPositive,
            seed: n(inp.mcSeed, 20261004)
          };
        }
      },
      "venture-decision-matrix": {
        label: "ISI Venture Sequence Decision Matrix",
        dependsOn: [
          "kill-conditions",
          "venture-diligence",
          "venture-monte-carlo",
          "venture-sensitivity",
          "venture-sequence-integrity",
          "runway"
        ],
        storeAs: "matrix",
        run: function (ctx) {
          var kill = ctx.get("kill-conditions");
          var dd = ctx.get("venture-diligence");
          var mc = ctx.get("venture-monte-carlo");
          var seq = ctx.get("venture-sequence-integrity");
          var rw = ctx.get("runway");
          var alts = [
            {
              id: "recast",
              label: "Recast thesis — cut burn, reset offer",
              runway: mc.p50 * 1.05,
              integrity: seq.score * 0.9,
              diligenceOk: dd.verdict !== "STOP" ? 0.75 : 0.95
            },
            {
              id: "proof90",
              label: "90-day proof — named buyer price test",
              runway: rw.runwayMonths,
              integrity: seq.score,
              diligenceOk: dd.verdict === "GO" ? 0.9 : dd.verdict === "CAUTION" ? 0.7 : 0.35
            },
            {
              id: "bridge",
              label: "Bridge capital — extend runway, fix unit econ",
              runway: rw.runwayMonths * 1.35,
              integrity: seq.score * 0.85,
              diligenceOk: dd.verdict !== "STOP" ? 0.65 : 0.25
            },
            {
              id: "sequence",
              label: "Full sequence — scale after gates clear",
              runway: mc.p90,
              integrity: Math.min(1, seq.score + 0.1),
              diligenceOk: kill.verdict === "SEQUENCE_OK" ? 0.95 : 0.4
            }
          ];
          var matrix = global.ISI.trees.decisionMatrix(alts, [
            {
              id: "runway",
              label: "Runway months (modeled)",
              weight: 0.35,
              score: function (a) { return a.runway; },
              normalize: function (v) {
                var m = Math.max.apply(null, alts.map(function (x) { return x.runway; })) || 1;
                return Math.min(1, v / m);
              }
            },
            {
              id: "integrity",
              label: "Sequence integrity",
              weight: 0.25,
              score: function (a) { return a.integrity; },
              normalize: function (v) { return v; }
            },
            {
              id: "dd",
              label: "Clears venture diligence",
              weight: 0.2,
              score: function (a) { return a.diligenceOk; },
              normalize: function (v) { return v; }
            },
            {
              id: "kill",
              label: "Kill gate clear",
              weight: 0.2,
              score: function () {
                return kill.verdict === "SEQUENCE_OK" ? 1 : 0.35;
              },
              normalize: function (v) { return v; }
            }
          ]);
          if (global.ISI.store) {
            global.ISI.store.saveResult("matrix", matrix);
          }
          var score =
            (kill.verdict === "SEQUENCE_OK" ? 0.35 : 0.1) +
            (dd.verdict !== "STOP" ? 0.25 : 0.05) +
            Math.min(1, mc.p50 / Math.max(1, n(ctx.get("file-intake").inputs.killRunwayMonths, 6))) * 0.2 +
            seq.score * 0.2;
          return {
            headline: matrix.best.label + " · ISI venture sequence score " + score.toFixed(2),
            score: score,
            matrixBest: matrix.best.label,
            matrix: matrix,
            sequence: kill.verdict
          };
        }
      },
      summary: {
        label: "ISI Venture Engine summary KPIs",
        dependsOn: [
          "venture-decision-matrix",
          "venture-monte-carlo",
          "venture-sensitivity",
          "kill-conditions",
          "runway",
          "unit-economics",
          "venture-diligence",
          "venture-sequence-integrity"
        ],
        storeAs: "engine4-summary",
        run: function (ctx) {
          var kill = ctx.get("kill-conditions");
          var rw = ctx.get("runway");
          var ue = ctx.get("unit-economics");
          var dd = ctx.get("venture-diligence");
          var sens = ctx.get("venture-sensitivity");
          var mc = ctx.get("venture-monte-carlo");
          var dm = ctx.get("venture-decision-matrix");
          var intake = ctx.get("file-intake").inputs;
          return {
            headline: dm.headline,
            kpis: {
              company: intake.company,
              diligence: dd.verdict,
              runwayMonths: rw.runwayMonths,
              ltvCac: ue.metrics.ltvCac,
              sequence: kill.verdict,
              killCount: kill.kills.length,
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
    var nodes = buildVentureNodes();
    var engine = global.ISI.engineBus.createEngine("venture-sequence", nodes);
    global.ISI.engineBus.venture = engine;
    return engine;
  }

  global.ISI = global.ISI || {};
  global.ISI.engineBus = global.ISI.engineBus || {};
  global.ISI.engineBus.registerVenture = register;
})(typeof window !== "undefined" ? window : this);
