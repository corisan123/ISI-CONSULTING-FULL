/**
 * ISI Consulting — scenario / what-if / feasibility kernel
 * Same model, four cases. Delta vs base. Sanity checks. PoC gates.
 */
(function (global) {
  "use strict";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : (d == null ? 0 : d);
  }

  function cashCase(p) {
    var ebitda = n(p.ebitda);
    var fcf = n(p.fcf, ebitda - n(p.capex) - n(p.nwc));
    var dscr = n(p.dscr, ebitda / Math.max(1, n(p.debtService, 1)));
    return { ebitda: ebitda, fcf: fcf, dscr: dscr, score: fcf };
  }

  function npvCase(p, math) {
    var rate = n(p.wacc, 11) / 100;
    var cf = [-Math.abs(n(p.investment)), n(p.cf1), n(p.cf2), n(p.cf3), n(p.cf4), n(p.cf5)];
    return {
      npv: math.npv(rate, cf),
      irr: math.irr(cf),
      payback: math.payback(cf),
      pi: math.profitabilityIndex(rate, cf),
      score: math.npv(rate, cf)
    };
  }

  function throughputCase(p) {
    var demand = n(p.demand, 1200);
    var cap = n(p.capacity, 900);
    var cu = n(p.cu, 85);
    var oee = n(p.oee, 62) / 100;
    var t = Math.min(demand, cap) * cu * 52;
    var lost = Math.max(0, demand - cap) * cu * 52;
    var exploit = cap * Math.max(0, 0.75 - oee) * cu * 52;
    return { t: t, lost: lost, exploit: exploit, util: demand / Math.max(1, cap), score: t };
  }

  function qualityCase(p) {
    var units = n(p.units, 100000);
    var defects = n(p.defects, 4200);
    var scrapCost = n(p.scrapCost, 48);
    var reworkCost = n(p.reworkCost, 22);
    var escapeCost = n(p.escapeCost, 380);
    var dpmo = units ? (defects / units) * 1e6 : 0;
    var yieldPct = units ? 1 - defects / units : 0;
    var copq = defects * (0.55 * scrapCost + 0.35 * reworkCost + 0.1 * escapeCost);
    return { dpmo: dpmo, yield: yieldPct, copq: copq, score: -copq };
  }

  function bidCase(p, trees) {
    var t = trees.bidTree(n(p.pWin, 0.24), n(p.gp, 220000), n(p.bidCost, 18000), n(p.developCost, 140000));
    return { ev: t.evBid, best: t.best.label, score: t.evBid };
  }

  function evmCase(p) {
    var bac = n(p.bac, 4.2e6);
    var ev = n(p.ev, 2.1e6);
    var ac = n(p.ac, 2.45e6);
    var pv = n(p.pv, 2.3e6);
    var cpi = ac ? ev / ac : 0;
    var spi = pv ? ev / pv : 0;
    var eac = cpi ? bac / cpi : bac;
    return { cpi: cpi, spi: spi, eac: eac, vac: bac - eac, score: bac - eac };
  }

  function applyShock(base, shock) {
    var o = {};
    Object.keys(base).forEach(function (k) { o[k] = n(base[k], 0) * (1 + n(shock[k], 0)); });
    return o;
  }

  function run(model, base, math, trees) {
    var shocks = {
      base: {},
      upside: model === "quality" ? { defects: -0.35, units: 0.05 } : model === "throughput" ? { oee: 0.12, capacity: 0.08 } : model === "bid" ? { pWin: 0.25, gp: 0.1 } : model === "evm" ? { ev: 0.12, ac: -0.05 } : { cf1: 0.15, cf2: 0.15, cf3: 0.12, ebitda: 0.12, fcf: 0.15 },
      downside: model === "quality" ? { defects: 0.4 } : model === "throughput" ? { oee: -0.1, demand: 0.05 } : model === "bid" ? { pWin: -0.3, developCost: 0.2 } : model === "evm" ? { ev: -0.1, ac: 0.12 } : { cf1: -0.2, cf2: -0.15, ebitda: -0.15, fcf: -0.25 },
      stress: model === "quality" ? { defects: 0.8, escapeCost: 0.5 } : model === "throughput" ? { capacity: -0.2, oee: -0.15 } : model === "bid" ? { pWin: -0.5, bidCost: 0.4 } : model === "evm" ? { ev: -0.2, ac: 0.25 } : { cf1: -0.4, wacc: 0.3, ebitda: -0.3, dscr: -0.25 }
    };
    function compute(p) {
      if (model === "npv") return npvCase(p, math);
      if (model === "cash") return cashCase(p);
      if (model === "throughput") return throughputCase(p);
      if (model === "quality") return qualityCase(p);
      if (model === "bid") return bidCase(p, trees);
      if (model === "evm") return evmCase(p);
      return npvCase(p, math);
    }
    var cases = {};
    Object.keys(shocks).forEach(function (name) {
      cases[name] = compute(applyShock(base, shocks[name]));
    });
    var delta = {};
    Object.keys(cases).forEach(function (name) {
      if (name === "base") return;
      delta[name] = cases[name].score - cases.base.score;
    });
    var sanity = [];
    if (cases.upside.score < cases.base.score) sanity.push("Upside scored worse than base — check shock signs.");
    if (cases.stress.score > cases.base.score) sanity.push("Stress scored better than base — check shock signs.");
    if (model === "npv" && cases.base.npv != null && Math.abs(cases.base.npv) > 50 * Math.abs(n(base.investment, 1))) sanity.push("NPV is an order of magnitude off investment — sanity-check cash flows.");
    return { model: model, cases: cases, delta: delta, sanity: sanity, shocks: shocks };
  }

  function feasibility(study, scenarios, diligence, rootcause) {
    var gates = (study && study.poc) || [];
    var dd = diligence && diligence.tree && diligence.tree.verdict;
    var keep = (rootcause && rootcause.keep) || [];
    var rows = [
      { id: "financial", label: "Financial feasibility", rating: dd === "STOP" ? "Red" : dd === "CAUTION" ? "Yellow" : "Green", because: dd ? "Diligence " + dd + "." : "Diligence not run." },
      { id: "causal", label: "Causal feasibility", rating: keep.length ? "Green" : "Yellow", because: keep.length ? keep.length + " root causes survived two tests." : "Still at symptom level." },
      { id: "scenario", label: "Scenario feasibility", rating: scenarios && scenarios.cases && scenarios.cases.stress.score < scenarios.cases.base.score ? "Green" : "Yellow", because: scenarios ? "Stress delta is computed and signed." : "Scenarios not run." },
      { id: "org", label: "Organizational feasibility", rating: study && study.workstreams.every(function (w) { return w.owner; }) ? "Green" : "Red", because: "Every workstream has a named owner (swim lane)." }
    ];
    var stop = rows.filter(function (r) { return r.rating === "Red"; });
    return {
      verdict: stop.length ? "NOT FEASIBLE as scoped" : rows.some(function (r) { return r.rating === "Yellow"; }) ? "FEASIBLE with conditions" : "FEASIBLE to proceed to PoC",
      rows: rows,
      poc: gates
    };
  }

  global.ISI = global.ISI || {};
  global.ISI.scenarios = {
    run: run,
    feasibility: feasibility,
    defaults: {
      npv: { investment: 750000, wacc: 11, cf1: 180000, cf2: 240000, cf3: 310000, cf4: 340000, cf5: 360000 },
      cash: { ebitda: 2000000, capex: 650000, nwc: 400000, fcf: 670000, dscr: 1.15, debtService: 1220000 },
      throughput: { demand: 1200, capacity: 900, cu: 85, oee: 62 },
      quality: { units: 100000, defects: 4200, scrapCost: 48, reworkCost: 22, escapeCost: 380 },
      bid: { pWin: 0.24, gp: 220000, bidCost: 18000, developCost: 140000 },
      evm: { bac: 4200000, ev: 2100000, ac: 2450000, pv: 2300000 }
    }
  };
})(typeof window !== "undefined" ? window : this);
