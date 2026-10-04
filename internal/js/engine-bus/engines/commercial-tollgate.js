/**
 * ISI Engine 1 — Commercial / tollgate (proprietary).
 * Qualification, pipeline, commercial trees, tollgate — not generic growth spine.
 */
(function (global) {
  "use strict";

  var UNSET_COMPANY = "Engagement file (unset)";

  var INTERVENTIONS = [
    { id: "bd", name: "Business development process rebuild", test: function (d) { return /no|weak|inconsistent|ad hoc/i.test(d.bdProcess || "") || /low|inconsistent/i.test(d.pipelineConsistency || ""); } },
    { id: "proposal", name: "Proposal system overhaul", test: function (d) { return Number(d.winRate) < 30 || /frustrat|slow|inconsist/i.test(d.proposalFrustration || ""); } },
    { id: "margin", name: "Margin recovery and pricing discipline", test: function (d) { return /estimat|discount|job cost|handoff|buyout/i.test(d.marginErosion || "") || /low|no/i.test(d.jobProfitVisibility || ""); } },
    { id: "cadence", name: "Leadership cadence reset", test: function (d) { return Number(d.leadershipConfidence) <= 6 || /align|conflict|handoff/i.test(d.deptConflict || ""); } },
    { id: "training", name: "Training systems for PMs, estimators, and business development", test: function (d) { return /under|gap|thin|no bench/i.test(d.leadershipGaps || d.understaffedRoles || ""); } },
    { id: "align", name: "Alignment between business development, operations, and finance", test: function (d) { return /poor|break|silo/i.test(d.handoffs || d.bdOpsComm || ""); } }
  ];

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
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
      pWin: 0.24,
      gp: 220000,
      bidCost: 18000,
      developCost: 140000,
      diligenceSit: "commercial",
      mcIterations: 4000,
      mcSeed: 20261003
    };
  }

  function treeInputsFromCtx(ctx) {
    var inp = ctx.get("file-intake").inputs;
    var patch = ctx.inputs || {};
    return {
      pWin: patch.pWin != null ? patch.pWin : inp.pWin,
      gp: patch.gp != null ? patch.gp : inp.gp,
      bidCost: patch.bidCost != null ? patch.bidCost : inp.bidCost,
      developCost: patch.developCost != null ? patch.developCost : inp.developCost
    };
  }

  function pipelineIntegrityScore(intake) {
    var score = 0;
    var notes = [];
    if (/consistent|defined|stages/i.test(intake.pipelineConsistency || "")) {
      score += 0.25;
    } else {
      notes.push("Pipeline stages inconsistent or undefined");
    }
    if (n(intake.winRate, 100) >= 30) score += 0.2;
    else notes.push("Win rate below 30%");
    if (!/ad hoc|no|partial/i.test(intake.bdProcess || "")) score += 0.2;
    else notes.push("BD process is ad hoc or person-dependent");
    if (/forecast|conversion|cycle|margin/i.test(intake.kpisTracked || "")) score += 0.15;
    else notes.push("KPIs do not track conversion or forecast integrity");
    if (n(intake.leadershipConfidence, 10) >= 7) score += 0.2;
    else notes.push("Leadership confidence on commercial system is weak");
    return { score: Math.min(1, score), notes: notes };
  }

  function tollgateReadiness(intake, ddVerdict, pipeScore) {
    var fractionalHonest =
      !/no bench|owner only|single point/i.test(intake.leadershipGaps || "") ||
      /fractional|interim|seat/i.test(intake.understaffedRoles || "");
    var gates = {
      diligence: ddVerdict !== "STOP",
      pipeline: pipeScore >= 0.45,
      seat: fractionalHonest || n(intake.leadershipConfidence, 0) >= 6
    };
    var pass = gates.diligence && (gates.pipeline || gates.seat);
    return {
      verdict: pass ? "TOLLGATE_OPEN" : "HOLD",
      gates: gates,
      headline: pass
        ? "Commercial tollgate open — pursue structured BD / revenue ops work"
        : "Hold — fix gates or seat honesty before catalog expansion"
    };
  }

  function buildCommercialNodes() {
    return {
      "file-intake": {
        label: "Commercial file intake",
        dependsOn: [],
        storeAs: "engine1-intake",
        run: function (ctx) {
          var intake = loadIntake(ctx);
          var base = defaultInputs();
          var patch = ctx.inputs || {};
          var merged = Object.assign(base, patch, {
            company: intake.companyName || intake.company || UNSET_COMPANY
          });
          if (patch.pWin == null && intake.winRate != null && intake.winRate !== "") {
            merged.pWin = n(intake.winRate, base.pWin * 100) / 100;
          }
          merged._intake = intake;
          if (global.ISI.store) {
            global.ISI.store.setEngagement({
              company: merged.company,
              industry: intake.trade,
              constraint: "commercial",
              family: "commercial"
            });
          }
          return {
            headline: merged.company + " — commercial engine loaded",
            inputs: merged,
            intake: intake
          };
        }
      },
      qualification: {
        label: "Qualification & root-cause (commercial)",
        dependsOn: ["file-intake"],
        storeAs: "rootcause",
        run: function (ctx) {
          var intake = ctx.get("file-intake").intake;
          var res = global.ISI.rootcause.run({ intake: intake });
          return {
            headline: res.headline,
            keep: res.keep.length,
            killed: res.killed.length,
            payload: res
          };
        }
      },
      "pipeline-integrity": {
        label: "Pipeline & forecast integrity",
        dependsOn: ["file-intake"],
        storeAs: "engine1-pipeline",
        run: function (ctx) {
          var intake = ctx.get("file-intake").intake;
          var pip = pipelineIntegrityScore(intake);
          return {
            headline: "Pipeline integrity " + (pip.score * 100).toFixed(0) + "%",
            score: pip.score,
            notes: pip.notes
          };
        }
      },
      "commercial-interventions": {
        label: "Intervention activation (intake)",
        dependsOn: ["file-intake"],
        storeAs: "interventions",
        run: function (ctx) {
          var intake = ctx.get("file-intake").intake;
          var fired = INTERVENTIONS.filter(function (m) { return m.test(intake); });
          var payload = {
            active: fired.map(function (m) { return m.id; }),
            names: fired.map(function (m) { return m.name; })
          };
          return {
            headline: fired.length
              ? fired.length + " module(s) activated from intake"
              : "No intervention modules activated yet",
            count: fired.length,
            payload: payload
          };
        }
      },
      "commercial-diligence": {
        label: "Commercial diligence gates",
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
          var res = global.ISI.diligence.run(inp.diligenceSit || "commercial", fields, global.ISI.math);
          return {
            headline: res.tree.verdict + " — " + res.headline,
            verdict: res.tree.verdict,
            payload: res
          };
        }
      },
      "commercial-tree": {
        label: "Commercial decision tree (EV)",
        dependsOn: ["commercial-diligence", "file-intake"],
        storeAs: "tree-bid",
        run: function (ctx) {
          var ti = treeInputsFromCtx(ctx);
          var gp = n(ti.gp, defaultInputs().gp);
          var tree = global.ISI.trees.bidTree(ti.pWin, gp, ti.bidCost, ti.developCost);
          return {
            headline: "Best path: " + tree.best.label + " · EV $" + Math.round(tree.best.ev).toLocaleString(),
            tree: tree,
            best: tree.best
          };
        }
      },
      "commercial-sensitivity": {
        label: "One-way sensitivity (commercial tree EV)",
        dependsOn: ["commercial-tree", "file-intake"],
        storeAs: "sensitivity-1way",
        run: function (ctx) {
          var t = ctx.get("commercial-tree").tree;
          var base = { pWin: t.pWin, gp: t.gp, bidCost: t.bidCost, developCost: t.developCost };
          var rows = global.ISI.trees.oneWay(base, [
            { key: "pWin", label: "Win probability", pct: 0.25 },
            { key: "gp", label: "Gross profit if won", pct: 0.2 },
            { key: "bidCost", label: "Cost of placing bid", pct: 0.35 },
            { key: "developCost", label: "Cost of developing / executing", pct: 0.2 }
          ], function (inp) {
            return global.ISI.trees.bidTree(inp.pWin, inp.gp, inp.bidCost, inp.developCost).evBid;
          });
          return {
            headline: "Largest swing: " + rows[0].label,
            baseEV: t.evBid,
            topSwing: rows[0].label,
            rows: rows
          };
        }
      },
      "commercial-monte-carlo": {
        label: "Monte Carlo on commercial tree (seeded)",
        dependsOn: ["commercial-tree", "file-intake"],
        storeAs: "montecarlo",
        run: function (ctx) {
          var t = ctx.get("commercial-tree").tree;
          var inp = ctx.get("file-intake").inputs;
          var mc = global.ISI.math.monteCarlo({
            iterations: n(inp.mcIterations, 4000),
            seed: n(inp.mcSeed, 20261003),
            inputs: [
              { name: "pWin", type: "triangular", min: Math.max(0.05, t.pWin * 0.6), mode: t.pWin, max: Math.min(0.9, t.pWin * 1.45) },
              { name: "gp", type: "normal", mean: t.gp, stdev: t.gp * 0.18 },
              { name: "bidCost", type: "normal", mean: t.bidCost, stdev: t.bidCost * 0.12 },
              { name: "developCost", type: "triangular", min: t.developCost * 0.8, mode: t.developCost, max: t.developCost * 1.35 }
            ],
            model: function (d) {
              return global.ISI.trees.bidTree(d.pWin, d.gp, Math.abs(d.bidCost), Math.abs(d.developCost)).evBid;
            }
          });
          var pPositive = mc.values.filter(function (v) { return v > 0; }).length / mc.iterations;
          return {
            headline: "P50 EV $" + Math.round(mc.p50).toLocaleString() + " · P(EV>0) " + (pPositive * 100).toFixed(0) + "%",
            mean: mc.mean,
            p10: mc.p10,
            p50: mc.p50,
            p90: mc.p90,
            pPositive: pPositive,
            seed: n(inp.mcSeed, 20261003)
          };
        }
      },
      "tollgate-decision": {
        label: "Fractional BD tollgate",
        dependsOn: [
          "commercial-diligence",
          "pipeline-integrity",
          "commercial-tree",
          "qualification",
          "commercial-interventions"
        ],
        storeAs: "engine1-tollgate",
        run: function (ctx) {
          var intake = ctx.get("file-intake").intake;
          var dd = ctx.get("commercial-diligence").verdict;
          var pip = ctx.get("pipeline-integrity").score;
          var tg = tollgateReadiness(intake, dd, pip);
          var tree = ctx.get("commercial-tree").tree;
          var alts = tree.options.map(function (o) {
            return Object.assign({}, o, {
              diagnosisFit: ctx.get("qualification").keep >= 1 ? 0.85 : 0.45,
              diligenceOk: dd === "STOP" && o.id !== "pass" ? 0.15 : 0.9
            });
          });
          var matrix = global.ISI.trees.decisionMatrix(alts, [
            { id: "ev", label: "Expected value", weight: 0.35, score: function (a) { return a.ev; }, normalize: function (v) { var m = Math.max.apply(null, alts.map(function (x) { return Math.abs(x.ev); })) || 1; return (v / m + 1) / 2; } },
            { id: "dd", label: "Clears diligence", weight: 0.25, score: function (a) { return a.diligenceOk; }, normalize: function (v) { return v; } },
            { id: "fit", label: "Fits proven causes", weight: 0.25, score: function (a) { return a.diagnosisFit; }, normalize: function (v) { return v; } },
            { id: "tg", label: "Tollgate readiness", weight: 0.15, score: function () { return tg.verdict === "TOLLGATE_OPEN" ? 1 : 0.2; }, normalize: function (v) { return v; } }
          ]);
          global.ISI.store.saveResult("matrix", matrix);
          return {
            headline: tg.headline + " · Matrix: " + matrix.best.label,
            tollgate: tg,
            matrixBest: matrix.best.label,
            matrix: matrix
          };
        }
      },
      summary: {
        label: "Commercial engine summary KPIs",
        dependsOn: [
          "tollgate-decision",
          "commercial-tree",
          "pipeline-integrity",
          "commercial-diligence",
          "commercial-sensitivity",
          "commercial-monte-carlo",
          "commercial-interventions",
          "qualification"
        ],
        storeAs: "engine1-summary",
        run: function (ctx) {
          var tg = ctx.get("tollgate-decision");
          var tree = ctx.get("commercial-tree");
          var pip = ctx.get("pipeline-integrity");
          var dd = ctx.get("commercial-diligence");
          var sens = ctx.get("commercial-sensitivity");
          var mc = ctx.get("commercial-monte-carlo");
          var intr = ctx.get("commercial-interventions");
          var qual = ctx.get("qualification");
          return {
            headline: tg.headline,
            kpis: {
              company: ctx.get("file-intake").inputs.company,
              diligence: dd.verdict,
              pipelineScore: pip.score,
              tollgate: tg.tollgate.verdict,
              treeBest: tree.best.label,
              ev: tree.tree.best.ev,
              sensitivityTop: sens.topSwing,
              mcP50: mc.p50,
              mcPPositive: mc.pPositive,
              interventionsActive: intr.count,
              matrixBest: tg.matrixBest,
              rootcauseKeep: qual.keep
            }
          };
        }
      }
    };
  }

  function register() {
    var nodes = buildCommercialNodes();
    var engine = global.ISI.engineBus.createEngine("commercial-tollgate", nodes);
    global.ISI.engineBus.commercial = engine;
    return engine;
  }

  global.ISI = global.ISI || {};
  global.ISI.engineBus = global.ISI.engineBus || {};
  global.ISI.engineBus.registerCommercial = register;
})(typeof window !== "undefined" ? window : this);
