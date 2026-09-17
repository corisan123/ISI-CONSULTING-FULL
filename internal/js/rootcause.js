/**
 * ISI Consulting — symptom vs root-cause engine
 * Client-stated problems are hypotheses. Tests keep or kill them.
 */
(function (global) {
  "use strict";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : (d == null ? NaN : d);
  }

  function has(text, re) {
    return re.test(String(text || ""));
  }

  function intake() {
    try {
      return JSON.parse(sessionStorage.getItem("isi_clientIntake") || "{}");
    } catch (err) {
      return {};
    }
  }

  var SYMPTOMS = {
    revenue_down: {
      id: "revenue_down",
      label: "Revenue is declining / share is slipping",
      whyNotCause: "Revenue is a result. The cause is in win rate, mix, capacity, or demand quality.",
      hypotheses: ["win_rate", "pipeline_fiction", "capacity_choke", "price_mix", "market_demand"]
    },
    margin_down: {
      id: "margin_down",
      label: "Margins are compressing",
      whyNotCause: "Margin is a result. The cause is price, estimating, buyout, mix, or job-cost blindness.",
      hypotheses: ["estimating", "discounting", "buyout", "job_cost_blind", "overhead", "mix_shift"]
    },
    forecast_miss: {
      id: "forecast_miss",
      label: "Revenue forecasts miss, repeatedly",
      whyNotCause: "A miss is a measurement of a broken commercial system — not itself the diagnosis.",
      hypotheses: ["pipeline_fiction", "no_stages", "cycle_time", "capacity_choke", "win_rate"]
    },
    cash_tight: {
      id: "cash_tight",
      label: "Cash is always tight",
      whyNotCause: "Cash tightness is a result of cycle, unprofitable work, debt service, or growth that consumes NWC.",
      hypotheses: ["cash_cycle", "unprofitable_work", "debt_service", "growth_wc"]
    },
    late_jobs: {
      id: "late_jobs",
      label: "Jobs run late / OTIF is slipping",
      whyNotCause: "Lateness is a result. The cause is a constraint, handoffs, or selling work the plant cannot absorb.",
      hypotheses: ["constraint", "handoffs", "capacity_choke", "estimating"]
    },
    growth_stall: {
      id: "growth_stall",
      label: "We cannot grow / 20% more would break us",
      whyNotCause: "A growth stall is a constraint statement. The work is naming which constraint.",
      hypotheses: ["owner_bandwidth", "estimating", "capacity_choke", "pipeline_fiction", "handoffs"]
    },
    leadership_drag: {
      id: "leadership_drag",
      label: "Leadership is overloaded / decisions stall",
      whyNotCause: "Overwhelm is a symptom of missing cadence, unclear rights, and no bench.",
      hypotheses: ["owner_bandwidth", "cadence", "handoffs", "job_cost_blind"]
    }
  };

  var HYPOTHESES = {
    win_rate: {
      id: "win_rate",
      label: "Win rate / proposal engine is the leak",
      layer: "commercial",
      tests: [
        { id: "wr", label: "Win rate below 30%", run: function (ctx) { return n(ctx.winRate, 100) < 30; } },
        { id: "proc", label: "BD process is ad hoc or person-dependent", run: function (ctx) { return /ad hoc|partial|no/i.test(ctx.bdProcess || ""); } },
        { id: "prop", label: "Proposal system is a stated frustration", run: function (ctx) { return has(ctx.proposalFrustration, /slow|inconsist|frustrat|template|late|win/i); } }
      ]
    },
    pipeline_fiction: {
      id: "pipeline_fiction",
      label: "Pipeline is not a forecast — it is a list",
      layer: "commercial",
      tests: [
        { id: "feast", label: "Pipeline is feast-famine or inconsistent", run: function (ctx) { return /inconsist|uneven|feast/i.test(ctx.pipelineConsistency || ""); } },
        { id: "acc", label: "Forecast accuracy below 80%", run: function (ctx) { return n(ctx.forecastAccuracy, 100) < 80; } },
        { id: "prompt", label: "Client framed the hire around missed numbers", run: function (ctx) { return has(ctx.prompt, /forecast|miss|pipeline|predict/i); } }
      ]
    },
    no_stages: {
      id: "no_stages",
      label: "No stage-gate: everything in the funnel is treated as real",
      layer: "commercial",
      tests: [
        { id: "adhoc", label: "No documented BD process", run: function (ctx) { return /ad hoc/i.test(ctx.bdProcess || ""); } },
        { id: "kpi", label: "KPIs tracked do not include stage conversion", run: function (ctx) { return ctx.kpisTracked ? !/stage|conversion|win rate|pipeline/i.test(ctx.kpisTracked) : true; } }
      ]
    },
    cycle_time: {
      id: "cycle_time",
      label: "Proposal / decision cycle is too long for the forecast horizon",
      layer: "commercial",
      tests: [
        { id: "frust", label: "Cycle or speed shows up in proposal frustration", run: function (ctx) { return has(ctx.proposalFrustration, /slow|cycle|late|time|turnaround/i); } },
        { id: "bottle", label: "Bottleneck named in proposals", run: function (ctx) { return has(ctx.bottlenecks, /propos|estimat|bid/i); } }
      ]
    },
    capacity_choke: {
      id: "capacity_choke",
      label: "Sold work exceeds the constraint — growth is blocked by delivery",
      layer: "operations",
      tests: [
        { id: "util", label: "Constraint utilization ≥ 90%", run: function (ctx) { return n(ctx.constraintUtil, 0) >= 90; } },
        { id: "break", label: "Client says 20–30% growth would break a delivery function", run: function (ctx) { return has(ctx.growthBreak, /pm|estimat|crew|shop|cash|ops|field|capacity/i); } },
        { id: "block", label: "Opportunities cannot be pursued", run: function (ctx) { return has(ctx.blockedOpps, /staff|crew|estimat|capacity|cash/i); } }
      ]
    },
    price_mix: {
      id: "price_mix",
      label: "Price or mix is the commercial leak, not volume",
      layer: "margin",
      tests: [
        { id: "gm", label: "Gross margin below 22%", run: function (ctx) { return n(ctx.grossMargin, 100) < 22; } },
        { id: "erode", label: "Margin erosion named as discount or mix", run: function (ctx) { return has(ctx.marginErosion, /discount|price|mix|negotiat|buyout/i); } }
      ]
    },
    market_demand: {
      id: "market_demand",
      label: "The market itself collapsed (often the client's first story)",
      layer: "commercial",
      tests: [
        { id: "win_ok", label: "Win rate still healthy (>35%) while revenue falls", run: function (ctx) { return n(ctx.winRate, 0) >= 35 && n(ctx.revenueYoY, 0) < 0; } },
        { id: "pipe_ok", label: "Pipeline is consistent while revenue falls", run: function (ctx) { return /consistent/i.test(ctx.pipelineConsistency || "") && n(ctx.revenueYoY, 0) < 0; } }
      ]
    },
    estimating: {
      id: "estimating",
      label: "Estimating accuracy is the hidden leak",
      layer: "margin",
      tests: [
        { id: "conf", label: "Estimating confidence ≤ 6/10", run: function (ctx) { return n(ctx.estimatingConfidence, 10) <= 6; } },
        { id: "erode", label: "Erosion named in estimating or buyout", run: function (ctx) { return has(ctx.marginErosion, /estimat|buyout|takeoff|allowance/i); } },
        { id: "gap", label: "Estimator bench is thin", run: function (ctx) { return has(ctx.understaffedRoles + ctx.leadershipGaps, /estimat/i); } }
      ]
    },
    discounting: {
      id: "discounting",
      label: "Discounting to win is destroying contribution",
      layer: "margin",
      tests: [
        { id: "disc", label: "Discounting named in erosion", run: function (ctx) { return has(ctx.marginErosion, /discount|to win|buy the job|price down/i); } },
        { id: "wr_low", label: "Win rate still low despite discounting", run: function (ctx) { return has(ctx.marginErosion, /discount/i) && n(ctx.winRate, 100) < 32; } }
      ]
    },
    buyout: {
      id: "buyout",
      label: "Buyout and vendor leakage after the estimate",
      layer: "margin",
      tests: [
        { id: "bo", label: "Buyout named as erosion", run: function (ctx) { return has(ctx.marginErosion, /buyout|vendor|sub|procurement/i); } },
        { id: "hand", label: "Handoff break between estimate and field", run: function (ctx) { return has(ctx.handoffs, /estimat|pm|buyout|field/i); } }
      ]
    },
    job_cost_blind: {
      id: "job_cost_blind",
      label: "No live job-profit visibility — the firm cannot see the leak",
      layer: "finance",
      tests: [
        { id: "vis", label: "Job profit visibility is low or after closeout", run: function (ctx) { return /low|partial|no/i.test(ctx.jobProfitVisibility || ""); } },
        { id: "hidden", label: "Hidden costs are suspected, not measured", run: function (ctx) { return has(ctx.hiddenCosts, /./); } }
      ]
    },
    overhead: {
      id: "overhead",
      label: "Overhead grew faster than contribution",
      layer: "finance",
      tests: [
        { id: "em", label: "EBITDA margin below 6% while revenue is not collapsing", run: function (ctx) { return n(ctx.ebitdaMargin, 100) < 6 && n(ctx.revenueYoY, -99) > -8; } },
        { id: "oh", label: "Overhead or G&A named in hidden costs", run: function (ctx) { return has(ctx.hiddenCosts, /overhead|g&a|sga|admin|office/i); } }
      ]
    },
    mix_shift: {
      id: "mix_shift",
      label: "Work mix shifted to lower-contribution jobs",
      layer: "margin",
      tests: [
        { id: "mix", label: "Mix named in erosion or goals", run: function (ctx) { return has(ctx.marginErosion + ctx.preventing, /mix|negotiat|hard bid|public|private/i); } },
        { id: "gm2", label: "Gross margin declining while win rate holds", run: function (ctx) { return n(ctx.grossMargin, 100) < 24 && n(ctx.winRate, 0) >= 28; } }
      ]
    },
    cash_cycle: {
      id: "cash_cycle",
      label: "Cash conversion cycle is trapping operating cash",
      layer: "finance",
      tests: [
        { id: "dso", label: "DSO above 50 days", run: function (ctx) { return n(ctx.dso, 0) > 50; } },
        { id: "ccc", label: "CCC above 70 days (from diligence if run)", run: function (ctx) { return n(ctx.ccc, 0) > 70; } },
        { id: "cash", label: "Cash/nights language in intake", run: function (ctx) { return has(ctx.nights + ctx.preventing + ctx.growthBreak, /cash|collect|retainage|ar|payroll/i); } }
      ]
    },
    unprofitable_work: {
      id: "unprofitable_work",
      label: "The firm is funding work that does not contribute",
      layer: "finance",
      tests: [
        { id: "em2", label: "EBITDA margin below 5%", run: function (ctx) { return n(ctx.ebitdaMargin, 100) < 5; } },
        { id: "blind", label: "Cannot see job profit", run: function (ctx) { return /low|no/i.test(ctx.jobProfitVisibility || ""); } }
      ]
    },
    debt_service: {
      id: "debt_service",
      label: "Debt service is consuming cash that looks like an ops problem",
      layer: "finance",
      tests: [
        { id: "dscr", label: "DSCR below 1.25 (diligence)", run: function (ctx) { return n(ctx.dscr, 99) < 1.25; } },
        { id: "int", label: "Interest coverage below 2.0", run: function (ctx) { return n(ctx.icr, 99) < 2; } }
      ]
    },
    growth_wc: {
      id: "growth_wc",
      label: "Growth is consuming working capital faster than profit can fund it",
      layer: "finance",
      tests: [
        { id: "revup", label: "Revenue growing while cash is named as the break", run: function (ctx) { return n(ctx.revenueYoY, 0) > 0 && has(ctx.growthBreak, /cash|ar|inventory|wc/i); } },
        { id: "nwc", label: "NWC increase is material vs EBITDA", run: function (ctx) { return n(ctx.nwcIncrease, 0) > 0.4 * Math.abs(n(ctx.ebitda, 1)); } }
      ]
    },
    constraint: {
      id: "constraint",
      label: "A physical or policy constraint is starving throughput",
      layer: "operations",
      tests: [
        { id: "util2", label: "Constraint utilization ≥ 90%", run: function (ctx) { return n(ctx.constraintUtil, 0) >= 90; } },
        { id: "bn", label: "Recurring bottleneck named", run: function (ctx) { return has(ctx.bottlenecks, /./); } }
      ]
    },
    handoffs: {
      id: "handoffs",
      label: "Handoffs between BD, estimating, PM, and field are the leak",
      layer: "operations",
      tests: [
        { id: "comm", label: "BD–ops communication is poor or uneven", run: function (ctx) { return /poor|uneven/i.test(ctx.bdOpsComm || ""); } },
        { id: "br", label: "Handoffs described as breaking", run: function (ctx) { return has(ctx.handoffs, /break|estimat|pm|field|sil/i); } }
      ]
    },
    owner_bandwidth: {
      id: "owner_bandwidth",
      label: "The owner is the constraint — no bench, no cadence",
      layer: "leadership",
      tests: [
        { id: "conf", label: "Leadership confidence ≤ 6", run: function (ctx) { return n(ctx.leadershipConfidence, 10) <= 6; } },
        { id: "bench", label: "No bench / understaffed leadership seats", run: function (ctx) { return has(ctx.leadershipGaps + ctx.understaffedRoles, /bench|owner|estimat|pm|bd/i); } },
        { id: "time", label: "Owner time sink is firefighting", run: function (ctx) { return has(ctx.timeSink, /fire|every|all|estimat|propos|put out/i); } }
      ]
    },
    cadence: {
      id: "cadence",
      label: "No operating cadence — issues reappear because they are never closed",
      layer: "leadership",
      tests: [
        { id: "conf2", label: "Leadership confidence ≤ 6", run: function (ctx) { return n(ctx.leadershipConfidence, 10) <= 6; } },
        { id: "conflict", label: "Department conflict named", run: function (ctx) { return has(ctx.deptConflict, /./); } }
      ]
    }
  };

  var NUMERIC_FIELDS = [
    { id: "revenueYoY", label: "Revenue change YoY (%)", value: -6 },
    { id: "grossMargin", label: "Gross margin (%)", value: 26 },
    { id: "ebitdaMargin", label: "EBITDA margin (%)", value: 7.2 },
    { id: "ebitda", label: "EBITDA ($)", value: 1800000 },
    { id: "forecastAccuracy", label: "Forecast hit rate last 4 quarters (%)", value: 62 },
    { id: "winRate", label: "Win rate (%)", value: 24 },
    { id: "dso", label: "DSO (days)", value: 58 },
    { id: "ccc", label: "Cash conversion cycle (days)", value: 74 },
    { id: "dscr", label: "DSCR (x)", value: 1.15 },
    { id: "icr", label: "Interest coverage (x)", value: 2.4 },
    { id: "constraintUtil", label: "Constraint utilization (%)", value: 93 },
    { id: "nwcIncrease", label: "YoY NWC increase ($)", value: 520000 }
  ];

  function mergeCtx(intakeData, numeric, diligenceMetrics) {
    var ctx = Object.assign({}, intakeData || {}, numeric || {});
    if (diligenceMetrics) {
      if (ctx.ccc == null || ctx.ccc === "") ctx.ccc = diligenceMetrics.ccc;
      if (ctx.dso == null || ctx.dso === "") ctx.dso = diligenceMetrics.dso;
      if (ctx.dscr == null || ctx.dscr === "") ctx.dscr = diligenceMetrics.dscr;
      if (ctx.icr == null || ctx.icr === "") ctx.icr = diligenceMetrics.icr;
      if (ctx.ebitda == null || ctx.ebitda === "") ctx.ebitda = diligenceMetrics.qoe;
      if (diligenceMetrics.ebitdaMargin != null && (ctx.ebitdaMargin == null || ctx.ebitdaMargin === "")) {
        ctx.ebitdaMargin = diligenceMetrics.ebitdaMargin * 100;
      }
    }
    return ctx;
  }

  function scoreHypothesis(h, ctx) {
    var fired = [];
    var missed = [];
    h.tests.forEach(function (t) {
      var ok = false;
      try { ok = !!t.run(ctx); } catch (e) { ok = false; }
      (ok ? fired : missed).push(t.label);
    });
    var status = "KILL";
    if (fired.length >= 2) status = "KEEP";
    else if (fired.length === 1) status = "WEAK";
    return {
      id: h.id,
      label: h.label,
      layer: h.layer,
      status: status,
      score: fired.length,
      of: h.tests.length,
      fired: fired,
      missed: missed
    };
  }

  function detectSymptoms(intakeData) {
    var text = [
      intakeData.preventing, intakeData.prompt, intakeData.nights,
      intakeData.marginErosion, intakeData.growthBreak, intakeData.statedSymptoms
    ].join(" ").toLowerCase();
    var selected = {};
    if (intakeData.statedSymptoms) {
      String(intakeData.statedSymptoms).split(",").forEach(function (s) {
        selected[s.trim()] = true;
      });
    }
    Object.keys(SYMPTOMS).forEach(function (id) {
      var s = SYMPTOMS[id];
      if (selected[id]) return;
      if (id === "revenue_down" && /revenue|sales|share|top line/.test(text)) selected[id] = true;
      if (id === "margin_down" && /margin|profit|ebitda|gross/.test(text)) selected[id] = true;
      if (id === "forecast_miss" && /forecast|predict|missed number/.test(text)) selected[id] = true;
      if (id === "cash_tight" && /cash|payroll|collect/.test(text)) selected[id] = true;
      if (id === "late_jobs" && /late|otif|schedule|delay/.test(text)) selected[id] = true;
      if (id === "growth_stall" && /grow|scale|20%|break/.test(text)) selected[id] = true;
      if (id === "leadership_drag" && /overwhelm|bandwidth|owner|decision/.test(text)) selected[id] = true;
    });
    return Object.keys(selected).filter(function (k) { return selected[k] && SYMPTOMS[k]; });
  }

  function run(opts) {
    opts = opts || {};
    var d = opts.intake || intake();
    var store = global.ISI && global.ISI.store ? global.ISI.store.read() : { results: {} };
    var dil = store.results && store.results.diligence && store.results.diligence.payload;
    var metrics = dil && dil.metrics;
    var ctx = mergeCtx(d, opts.numeric, metrics);
    var symptomIds = (opts.symptoms && opts.symptoms.length) ? opts.symptoms : detectSymptoms(d);
    if (!symptomIds.length) symptomIds = ["revenue_down", "margin_down"];

    var stated = symptomIds.map(function (id) { return SYMPTOMS[id]; });
    var seen = {};
    var scored = [];
    symptomIds.forEach(function (sid) {
      (SYMPTOMS[sid].hypotheses || []).forEach(function (hid) {
        if (seen[hid] || !HYPOTHESES[hid]) return;
        seen[hid] = true;
        scored.push(scoreHypothesis(HYPOTHESES[hid], ctx));
      });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    var keep = scored.filter(function (x) { return x.status === "KEEP"; });
    var weak = scored.filter(function (x) { return x.status === "WEAK"; });
    var killed = scored.filter(function (x) { return x.status === "KILL"; });

    var headline;
    if (!keep.length) {
      headline = "No root cause cleared two independent tests. The file is still at symptom level — gather the missing measures before prescribing.";
    } else {
      headline = "Proven root causes (survived two or more tests): " + keep.map(function (x) { return x.label; }).join("; ") + ".";
    }

    var next = [];
    keep.concat(weak).forEach(function (x) {
      if (x.layer === "finance" && next.indexOf("/internal/diagnostics/diligence.html") < 0) next.push("/internal/diagnostics/diligence.html");
      if (x.layer === "commercial" && next.indexOf("/diagnostic/input.html") < 0) next.push("/diagnostic/input.html");
      if (x.layer === "operations" && next.indexOf("/internal/diagnostics/operations.html") < 0) next.push("/internal/diagnostics/operations.html");
      if (x.layer === "margin" && next.indexOf("/internal/diagnostics/margin.html") < 0) next.push("/internal/diagnostics/margin.html");
      if (x.layer === "leadership" && next.indexOf("/internal/tools/interventions.html") < 0) next.push("/internal/tools/interventions.html");
    });

    return {
      company: d.companyName || (store.engagement && store.engagement.company) || "This company",
      stated: stated,
      keep: keep,
      weak: weak,
      killed: killed,
      scored: scored,
      headline: headline,
      next: next,
      ctxUsed: {
        winRate: ctx.winRate,
        forecastAccuracy: ctx.forecastAccuracy,
        grossMargin: ctx.grossMargin,
        ebitdaMargin: ctx.ebitdaMargin,
        dso: ctx.dso,
        constraintUtil: ctx.constraintUtil
      }
    };
  }

  global.ISI = global.ISI || {};
  global.ISI.rootcause = {
    SYMPTOMS: SYMPTOMS,
    HYPOTHESES: HYPOTHESES,
    NUMERIC_FIELDS: NUMERIC_FIELDS,
    intake: intake,
    detectSymptoms: detectSymptoms,
    run: run
  };
})(typeof window !== "undefined" ? window : this);
