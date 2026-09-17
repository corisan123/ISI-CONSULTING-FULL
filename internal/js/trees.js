/**
 * ISI Consulting — decision-tree kernel
 * Multiple tree types. Expected value, diagnostic fire, constraint, sequential option.
 */
(function (global) {
  "use strict";

  function evChance(branches) {
    var p = 0;
    var v = 0;
    branches.forEach(function (b) {
      p += Number(b.p) || 0;
      v += (Number(b.p) || 0) * (Number(b.value) || 0);
    });
    return { ev: v, pSum: p };
  }

  function bestDecision(options) {
    var best = null;
    options.forEach(function (o) {
      if (!best || o.ev > best.ev) best = o;
    });
    return best;
  }

  function diagnosticFire(tests, input) {
    return tests.map(function (t) {
      var fired = t.eval(input);
      return {
        id: t.id,
        label: t.label,
        fired: !!fired.fired,
        evidence: fired.evidence,
        engine: t.engine
      };
    });
  }

  function sequential(pSuccess, valueWin, valueLose, costNow, costLater) {
    var pursue = -costNow + pSuccess * valueWin + (1 - pSuccess) * valueLose;
    var wait = -costLater * 0.5 + (pSuccess * 0.85) * valueWin + (1 - pSuccess * 0.85) * valueLose;
    var pass = 0;
    var rows = [
      { id: "pursue", label: "Pursue now", ev: pursue },
      { id: "pilot", label: "Pilot / stage the spend", ev: wait },
      { id: "pass", label: "Pass", ev: pass }
    ];
    return { rows: rows, best: bestDecision(rows), pSuccess: pSuccess };
  }

  /**
   * Bid / no-bid tree (PrecisionTree-style quantified decision).
   * Always pay bidCost. If win, receive gp and pay developCost.
   */
  function bidTree(pWin, gp, bidCost, developCost) {
    pWin = Math.max(0, Math.min(1, Number(pWin) || 0));
    gp = Number(gp) || 0;
    bidCost = Number(bidCost) || 0;
    developCost = Number(developCost) || 0;
    var evWin = gp - developCost;
    var evLose = 0;
    var evBid = -bidCost + pWin * evWin + (1 - pWin) * evLose;
    var evNo = 0;
    var evJV = -bidCost * 0.55 + pWin * 0.9 * (evWin * 0.55);
    var options = [
      { id: "bid", label: "Bid alone", ev: evBid, cashAtRisk: bidCost + pWin * developCost },
      { id: "jv", label: "Joint venture / share the bid", ev: evJV, cashAtRisk: bidCost * 0.55 + pWin * developCost * 0.55 },
      { id: "pass", label: "No-bid", ev: evNo, cashAtRisk: 0 }
    ];
    return {
      pWin: pWin,
      gp: gp,
      bidCost: bidCost,
      developCost: developCost,
      evWin: evWin,
      evBid: evBid,
      evNo: evNo,
      evJV: evJV,
      options: options,
      best: bestDecision(options)
    };
  }

  function oneWay(base, vary, model) {
    return vary.map(function (v) {
      var lowIn = Object.assign({}, base);
      var highIn = Object.assign({}, base);
      lowIn[v.key] = Number(base[v.key]) * (1 - (v.pct || 0.2));
      highIn[v.key] = Number(base[v.key]) * (1 + (v.pct || 0.2));
      var mid = model(base);
      var lo = model(lowIn);
      var hi = model(highIn);
      return {
        key: v.key,
        label: v.label || v.key,
        base: mid,
        low: lo - mid,
        high: hi - mid,
        lowAbs: lo,
        highAbs: hi
      };
    }).sort(function (a, b) {
      return Math.max(Math.abs(b.low), Math.abs(b.high)) - Math.max(Math.abs(a.low), Math.abs(a.high));
    });
  }

  function twoWay(xVals, yVals, fn) {
    var grid = [];
    var pct = [];
    var base = fn(xVals[Math.floor(xVals.length / 2)], yVals[Math.floor(yVals.length / 2)]);
    yVals.forEach(function (y) {
      var row = [];
      var prow = [];
      xVals.forEach(function (x) {
        var v = fn(x, y);
        row.push(v);
        prow.push(base ? ((v - base) / Math.abs(base)) * 100 : 0);
      });
      grid.push(row);
      pct.push(prow);
    });
    return { values: grid, pct: pct, base: base, x: xVals, y: yVals };
  }

  function decisionMatrix(alternatives, criteria) {
    var scored = alternatives.map(function (alt) {
      var total = 0;
      var cells = criteria.map(function (c) {
        var raw = typeof c.score === "function" ? c.score(alt) : Number(alt[c.id]);
        var nrm = c.normalize ? c.normalize(raw) : raw;
        var w = Number(c.weight) || 0;
        total += w * nrm;
        return { id: c.id, raw: raw, normalized: nrm, weighted: w * nrm };
      });
      return { id: alt.id, label: alt.label, total: total, cells: cells, ev: alt.ev };
    });
    scored.sort(function (a, b) { return b.total - a.total; });
    return { rows: scored, best: scored[0] || null, criteria: criteria };
  }

  global.ISI = global.ISI || {};
  global.ISI.trees = {
    evChance: evChance,
    bestDecision: bestDecision,
    diagnosticFire: diagnosticFire,
    sequential: sequential,
    bidTree: bidTree,
    oneWay: oneWay,
    twoWay: twoWay,
    decisionMatrix: decisionMatrix
  };
})(typeof window !== "undefined" ? window : this);
