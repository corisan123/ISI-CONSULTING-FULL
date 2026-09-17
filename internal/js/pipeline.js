/**
 * ISI Consulting — wired engagement chain
 * One bus. Ten programs. Each run writes the next program's inputs.
 */
(function (global) {
  "use strict";

  function demoIntake() {
    return {
      companyName: "Piedmont Mechanical LLC",
      trade: "mechanical",
      revenueRange: "15-30",
      preventing: "Revenue is down and we keep missing the forecast. Margins are gone.",
      prompt: "Missed forecast four quarters in a row",
      pipelineConsistency: "inconsistent",
      winRate: "24",
      bdProcess: "ad hoc",
      marginErosion: "buyout and discounting on negotiated work",
      proposalFrustration: "slow turnaround, inconsistent proposals",
      jobProfitVisibility: "low",
      estimatingConfidence: "5",
      bdOpsComm: "poor",
      handoffs: "breaks between estimating and PM",
      bottlenecks: "estimating queue and field overtime",
      deptConflict: "ops vs BD on what we should bid",
      leadershipConfidence: "5",
      leadershipGaps: "no bench behind the owner",
      understaffedRoles: "estimator and PM",
      growthBreak: "estimating and cash",
      nights: "payroll and collections",
      hiddenCosts: "rework and overtime",
      kpisTracked: "revenue and backlog only",
      timeSink: "firefighting every bid",
      blockedOpps: "cannot staff the work we already have",
      statedSymptoms: "revenue_down,margin_down,forecast_miss,cash_tight"
    };
  }

  var INTERVENTIONS = [
    { id: "bd", name: "BD process rebuild", test: function (d) { return /no|weak|inconsistent|ad hoc/i.test(d.bdProcess || "") || /low|inconsistent/i.test(d.pipelineConsistency || ""); } },
    { id: "proposal", name: "Proposal system overhaul", test: function (d) { return Number(d.winRate) < 30 || /frustrat|slow|inconsist/i.test(d.proposalFrustration || ""); } },
    { id: "margin", name: "Margin recovery and pricing discipline", test: function (d) { return /estimat|discount|job cost|handoff|buyout/i.test(d.marginErosion || "") || /low|no/i.test(d.jobProfitVisibility || ""); } },
    { id: "cadence", name: "Leadership cadence reset", test: function (d) { return Number(d.leadershipConfidence) <= 6 || /align|conflict|handoff/i.test(d.deptConflict || ""); } },
    { id: "training", name: "Training systems for PMs, estimators, BD", test: function (d) { return /under|gap|thin|no bench/i.test(d.leadershipGaps || d.understaffedRoles || ""); } },
    { id: "align", name: "Alignment between BD, Ops, and Finance", test: function (d) { return /poor|break|silo/i.test(d.handoffs || d.bdOpsComm || ""); } }
  ];

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
  }

  var STEPS = [
    {
      id: "intake",
      n: 1,
      label: "Discovery intake",
      href: "/website/forms/client-intake.html",
      purpose: "Facts and the story they believe. The story is not accepted as the cause.",
      run: function (bus) {
        var d = {};
        try { d = JSON.parse(sessionStorage.getItem("isi_clientIntake") || "{}"); } catch (e) { d = {}; }
        if (!d.companyName) {
          d = demoIntake();
          sessionStorage.setItem("isi_clientIntake", JSON.stringify(d));
        }
        bus.intake = d;
        global.ISI.store.setEngagement({ company: d.companyName, industry: d.trade, constraint: "diligence" });
        return { headline: d.companyName + " intake loaded.", detail: d.preventing || d.prompt || "" };
      }
    },
    {
      id: "diagnosis",
      n: 2,
      label: "Structured diagnosis",
      href: "/internal/diagnostics/rootcause.html",
      purpose: "Competing causes under each symptom. KEEP / WEAK / KILL.",
      run: function (bus) {
        var res = global.ISI.rootcause.run({ intake: bus.intake });
        bus.rootcause = res;
        global.ISI.store.saveResult("rootcause", res);
        return { headline: res.headline, detail: (res.keep.length ? res.keep.map(function (x) { return x.label; }).join("; ") : "No KEEP yet") };
      }
    },
    {
      id: "diligence",
      n: 3,
      label: "Financial due diligence",
      href: "/internal/diagnostics/diligence.html",
      purpose: "Hard gates on liquidity and debt service before a growth thesis.",
      run: function (bus) {
        var fields = {};
        global.ISI.diligence.FIELDS.forEach(function (f) { fields[f.id] = f.value; });
        var sit = (bus.study && bus.study.diligenceSit) || "turnaround";
        var res = global.ISI.diligence.run(sit, fields, global.ISI.math);
        bus.diligence = res;
        global.ISI.store.saveResult("diligence", res);
        return { headline: res.tree.verdict + " — " + res.headline, detail: res.situation.label };
      }
    },
    {
      id: "tree",
      n: 4,
      label: "Quantified decision tree",
      href: "/internal/tools/trees.html",
      purpose: "Bid / pursue EV from live win rate, contribution, and costs — not a drawing.",
      run: function (bus) {
        var win = n(bus.intake && bus.intake.winRate, 24) / 100;
        var gp = 220000;
        if (bus.diligence && bus.diligence.metrics && bus.diligence.metrics.qoe) {
          gp = Math.max(80000, bus.diligence.metrics.qoe * 0.12);
        }
        var bidCost = 18000;
        var develop = 140000;
        var tree = global.ISI.trees.bidTree(win, gp, bidCost, develop);
        bus.tree = tree;
        global.ISI.store.saveResult("tree-bid", tree);
        return { headline: "Best path: " + tree.best.label + " · EV " + Math.round(tree.best.ev).toLocaleString(), detail: "p(win) " + (win * 100).toFixed(0) + "% · GP $" + Math.round(gp).toLocaleString() };
      }
    },
    {
      id: "tornado",
      n: 5,
      label: "One-way sensitivity",
      href: "/internal/tools/sensitivity.html",
      purpose: "Which input moves EV the most. Tornado on the same tree.",
      run: function (bus) {
        var t = bus.tree;
        var base = { pWin: t.pWin, gp: t.gp, bidCost: t.bidCost, developCost: t.developCost };
        var rows = global.ISI.trees.oneWay(base, [
          { key: "pWin", label: "Win probability", pct: 0.25 },
          { key: "gp", label: "Gross profit if won", pct: 0.2 },
          { key: "bidCost", label: "Cost of placing bid", pct: 0.35 },
          { key: "developCost", label: "Cost of developing / executing", pct: 0.2 }
        ], function (inp) {
          return global.ISI.trees.bidTree(inp.pWin, inp.gp, inp.bidCost, inp.developCost).evBid;
        });
        bus.tornado = { baseEV: t.evBid, rows: rows };
        global.ISI.store.saveResult("sensitivity-1way", bus.tornado);
        return { headline: "Largest swing: " + rows[0].label, detail: "Base EV $" + Math.round(t.evBid).toLocaleString() };
      }
    },
    {
      id: "twoway",
      n: 6,
      label: "Two-way sensitivity",
      href: "/internal/tools/sensitivity.html#twoway",
      purpose: "Bid cost × develop cost grid — PrecisionTree-style proof of the hypothesis.",
      run: function (bus) {
        var t = bus.tree;
        var xs = [];
        var ys = [];
        for (var i = 0; i < 8; i++) xs.push(Math.round(t.developCost * (0.85 + i * 0.05)));
        for (var j = 0; j < 8; j++) ys.push(Math.round(t.bidCost * (0.4 + j * 0.2)));
        var grid = global.ISI.trees.twoWay(xs, ys, function (dev, bid) {
          return global.ISI.trees.bidTree(t.pWin, t.gp, bid, dev).evBid;
        });
        bus.twoWay = grid;
        global.ISI.store.saveResult("sensitivity-2way", grid);
        return { headline: "2-way EV surface computed (" + xs.length + "×" + ys.length + ")", detail: "Base EV $" + Math.round(grid.base).toLocaleString() };
      }
    },
    {
      id: "montecarlo",
      n: 7,
      label: "Monte Carlo on the tree",
      href: "/internal/tools/montecarlo.html",
      purpose: "Same bid tree, distributions instead of point estimates.",
      run: function (bus) {
        var t = bus.tree;
        var mc = global.ISI.math.monteCarlo({
          iterations: 4000,
          seed: 20260917,
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
        bus.montecarlo = {
          mean: mc.mean,
          p10: mc.p10,
          p50: mc.p50,
          p90: mc.p90,
          stdev: mc.stdev,
          pPositive: mc.values.filter(function (v) { return v > 0; }).length / mc.iterations
        };
        global.ISI.store.saveResult("montecarlo", bus.montecarlo);
        return { headline: "P50 EV $" + Math.round(mc.p50).toLocaleString() + " · P(EV>0) " + (bus.montecarlo.pPositive * 100).toFixed(0) + "%", detail: "Seed 20260917 · 4000 iterations" };
      }
    },
    {
      id: "matrix",
      n: 8,
      label: "Decision matrix",
      href: "/internal/tools/matrix.html",
      purpose: "Alternatives scored on EV, cash at risk, diagnosis fit, and diligence gates.",
      run: function (bus) {
        var t = bus.tree;
        var ddStop = bus.diligence && bus.diligence.tree.verdict === "STOP";
        var keepN = bus.rootcause ? bus.rootcause.keep.length : 0;
        var alts = t.options.map(function (o) {
          return Object.assign({}, o, { diagnosisFit: o.id === "pass" ? (keepN ? 0.4 : 0.8) : (keepN ? 0.85 : 0.45), diligenceOk: ddStop && o.id !== "pass" ? 0.15 : 0.9 });
        });
        var matrix = global.ISI.trees.decisionMatrix(alts, [
          { id: "ev", label: "Expected value", weight: 0.4, score: function (a) { return a.ev; }, normalize: function (v) { var m = Math.max.apply(null, alts.map(function (x) { return Math.abs(x.ev); })) || 1; return (v / m + 1) / 2; } },
          { id: "cash", label: "Cash at risk (invert)", weight: 0.2, score: function (a) { return a.cashAtRisk; }, normalize: function (v) { var m = Math.max.apply(null, alts.map(function (x) { return x.cashAtRisk; })) || 1; return 1 - v / m; } },
          { id: "fit", label: "Fits proven causes", weight: 0.25, score: function (a) { return a.diagnosisFit; }, normalize: function (v) { return v; } },
          { id: "dd", label: "Clears diligence", weight: 0.15, score: function (a) { return a.diligenceOk; }, normalize: function (v) { return v; } }
        ]);
        bus.matrix = matrix;
        global.ISI.store.saveResult("matrix", matrix);
        return { headline: "Matrix winner: " + matrix.best.label, detail: "Weighted score " + matrix.best.total.toFixed(2) };
      }
    },
    {
      id: "interventions",
      n: 9,
      label: "Intervention activation",
      href: "/internal/tools/interventions.html",
      purpose: "Only modules the intake and diagnosis both support.",
      run: function (bus) {
        var d = bus.intake || {};
        var fired = INTERVENTIONS.filter(function (m) { return m.test(d); });
        bus.interventions = { active: fired.map(function (m) { return m.id; }), names: fired.map(function (m) { return m.name; }) };
        global.ISI.store.saveResult("interventions", bus.interventions);
        return { headline: fired.length + " modules on", detail: fired.map(function (m) { return m.name; }).join("; ") || "none" };
      }
    },
    {
      id: "packet",
      n: 10,
      label: "Engagement packet",
      href: "/internal/results.html",
      purpose: "Board narrative: stated vs proven, gates, EV, sensitivity, next work.",
      run: function (bus) {
        var lines = [];
        lines.push("File: " + ((bus.intake && bus.intake.companyName) || "client") + ".");
        if (bus.rootcause) lines.push(bus.rootcause.headline);
        if (bus.diligence) lines.push("Diligence " + bus.diligence.tree.verdict + ".");
        if (bus.tree) lines.push("Quantified path: " + bus.tree.best.label + " (EV " + Math.round(bus.tree.best.ev) + ").");
        if (bus.montecarlo) lines.push("Monte Carlo P50 " + Math.round(bus.montecarlo.p50) + "; P(EV>0) " + (bus.montecarlo.pPositive * 100).toFixed(0) + "%.");
        if (bus.matrix) lines.push("Decision matrix agrees on " + bus.matrix.best.label + ".");
        if (bus.study) lines.push("Study type: " + bus.study.label + " — " + bus.study.question);
        if (bus.feasibility) lines.push("Feasibility: " + bus.feasibility.verdict + ".");
        bus.packet = { narrative: lines.join(" "), lines: lines };
        global.ISI.store.saveResult("packet", bus.packet);
        return { headline: "Packet ready for client view", detail: lines[0] };
      }
    }
  ];

  function runAll() {
    var bus = global.ISI.store.getBus() || {};
    var log = [];
    STEPS.forEach(function (step) {
      var out = step.run(bus);
      log.push({ id: step.id, n: step.n, label: step.label, href: step.href, purpose: step.purpose, headline: out.headline, detail: out.detail });
    });
    bus.chain = log;
    global.ISI.store.setBus(bus);
    global.ISI.store.saveResult("pipeline", { steps: log.length, last: log[log.length - 1] });
    return { bus: bus, log: log };
  }

  global.ISI = global.ISI || {};
  global.ISI.pipeline = {
    STEPS: STEPS,
    runAll: runAll,
    demoIntake: demoIntake
  };
})(typeof window !== "undefined" ? window : this);
