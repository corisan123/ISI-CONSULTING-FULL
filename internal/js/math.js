/**
 * ISI Consulting — quantitative kernel
 * Finance, Monte Carlo, and statistics. Deterministic given a seed.
 */
(function (global) {
  "use strict";

  function isNum(n) {
    return typeof n === "number" && isFinite(n);
  }

  function toNum(v, fallback) {
    var n = Number(v);
    return isFinite(n) ? n : fallback;
  }

  function round(n, d) {
    var p = Math.pow(10, d == null ? 2 : d);
    return Math.round(n * p) / p;
  }

  function mean(arr) {
    if (!arr.length) return NaN;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }

  function sum(arr) {
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s;
  }

  function min(arr) {
    return Math.min.apply(null, arr);
  }

  function max(arr) {
    return Math.max.apply(null, arr);
  }

  function variance(arr, sample) {
    if (arr.length < 2) return 0;
    var m = mean(arr);
    var s = 0;
    for (var i = 0; i < arr.length; i++) {
      var d = arr[i] - m;
      s += d * d;
    }
    return s / (arr.length - (sample === false ? 0 : 1));
  }

  function stdev(arr, sample) {
    return Math.sqrt(variance(arr, sample));
  }

  function quantile(arr, q) {
    if (!arr.length) return NaN;
    var a = arr.slice().sort(function (x, y) { return x - y; });
    var pos = (a.length - 1) * q;
    var lo = Math.floor(pos);
    var hi = Math.ceil(pos);
    if (lo === hi) return a[lo];
    return a[lo] * (hi - pos) + a[hi] * (pos - lo);
  }

  function median(arr) {
    return quantile(arr, 0.5);
  }

  function percentileRank(arr, value) {
    var c = 0;
    for (var i = 0; i < arr.length; i++) if (arr[i] <= value) c++;
    return arr.length ? (c / arr.length) * 100 : NaN;
  }

  /* ---------- finance ---------- */

  function pv(fv, r, n) {
    if (r === -1) return NaN;
    return fv / Math.pow(1 + r, n);
  }

  function fv(pv0, r, n) {
    return pv0 * Math.pow(1 + r, n);
  }

  function pva(pmt, r, n) {
    if (r === 0) return pmt * n;
    return pmt * (1 - Math.pow(1 + r, -n)) / r;
  }

  function npv(rate, cashflows) {
    var total = 0;
    for (var t = 0; t < cashflows.length; t++) {
      total += cashflows[t] / Math.pow(1 + rate, t);
    }
    return total;
  }

  function irr(cashflows, guess) {
    var r = guess == null ? 0.1 : guess;
    var i;
    for (i = 0; i < 80; i++) {
      var f = 0;
      var df = 0;
      for (var t = 0; t < cashflows.length; t++) {
        var d = Math.pow(1 + r, t);
        f += cashflows[t] / d;
        if (t > 0) df -= (t * cashflows[t]) / Math.pow(1 + r, t + 1);
      }
      if (Math.abs(df) < 1e-12) break;
      var next = r - f / df;
      if (!isFinite(next)) break;
      if (Math.abs(next - r) < 1e-8) return next;
      r = next;
    }
    var lo = -0.99;
    var hi = 10;
    var flo = npv(lo, cashflows);
    var fhi = npv(hi, cashflows);
    if (flo * fhi > 0) return NaN;
    for (i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2;
      var fm = npv(mid, cashflows);
      if (Math.abs(fm) < 1e-8) return mid;
      if (flo * fm <= 0) {
        hi = mid;
        fhi = fm;
      } else {
        lo = mid;
        flo = fm;
      }
    }
    return (lo + hi) / 2;
  }

  function mirr(cashflows, financeRate, reinvestRate) {
    var n = cashflows.length - 1;
    if (n <= 0) return NaN;
    var pos = 0;
    var neg = 0;
    for (var t = 0; t < cashflows.length; t++) {
      if (cashflows[t] >= 0) pos += cashflows[t] * Math.pow(1 + reinvestRate, n - t);
      else neg += cashflows[t] / Math.pow(1 + financeRate, t);
    }
    if (neg >= 0) return NaN;
    return Math.pow(pos / -neg, 1 / n) - 1;
  }

  function payback(cashflows) {
    var cum = 0;
    for (var t = 0; t < cashflows.length; t++) {
      var next = cum + cashflows[t];
      if (cum < 0 && next >= 0 && cashflows[t] !== 0) {
        return (t - 1) + (-cum / cashflows[t]);
      }
      cum = next;
      if (cum >= 0) return t;
    }
    return NaN;
  }

  function discountedPayback(rate, cashflows) {
    var cum = 0;
    for (var t = 0; t < cashflows.length; t++) {
      var disc = cashflows[t] / Math.pow(1 + rate, t);
      var next = cum + disc;
      if (cum < 0 && next >= 0 && disc !== 0) {
        return (t - 1) + (-cum / disc);
      }
      cum = next;
      if (cum >= 0) return t;
    }
    return NaN;
  }

  function cagr(begin, end, years) {
    if (begin <= 0 || years <= 0) return NaN;
    return Math.pow(end / begin, 1 / years) - 1;
  }

  function ebitdaFromNi(ni, interest, tax, da) {
    return ni + interest + tax + da;
  }

  function ebitdaFromEbit(ebit, da) {
    return ebit + da;
  }

  function ebitdaMargin(ebitda, revenue) {
    return revenue ? ebitda / revenue : NaN;
  }

  function roi(gain, cost) {
    return cost ? (gain - cost) / cost : NaN;
  }

  function breakEvenUnits(fixed, price, variable) {
    var contrib = price - variable;
    return contrib ? fixed / contrib : NaN;
  }

  function capexPv(capex, r, n) {
    return pv(capex, r, n);
  }

  function wacc(e, d, re, rd, tax) {
    var v = e + d;
    if (!v) return NaN;
    return (e / v) * re + (d / v) * rd * (1 - tax);
  }

  function parseCashflows(text, investment) {
    var parts = String(text || "")
      .split(/[,\s;]+/)
      .map(function (x) { return Number(x); })
      .filter(function (x) { return isFinite(x); });
    var cf0 = -Math.abs(toNum(investment, 0));
    if (!parts.length) return [cf0];
    if (parts[0] < 0) return parts;
    return [cf0].concat(parts);
  }

  function profitabilityIndex(rate, cashflows) {
    if (!cashflows.length) return NaN;
    var inv = -cashflows[0];
    if (inv <= 0) return NaN;
    var pvInflows = 0;
    for (var t = 1; t < cashflows.length; t++) {
      pvInflows += cashflows[t] / Math.pow(1 + rate, t);
    }
    return pvInflows / inv;
  }

  /* ---------- RNG / distributions ---------- */

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function boxMuller(rng) {
    var u = rng();
    var v = rng();
    if (u <= 0) u = 1e-12;
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function sampleDist(spec, rng) {
    var type = (spec.type || "normal").toLowerCase();
    if (type === "fixed") return toNum(spec.value, 0);
    if (type === "uniform") {
      var a = toNum(spec.min, 0);
      var b = toNum(spec.max, 1);
      return a + (b - a) * rng();
    }
    if (type === "triangular") {
      var lo = toNum(spec.min, 0);
      var hi = toNum(spec.max, 1);
      var mode = toNum(spec.mode, (lo + hi) / 2);
      var u = rng();
      var fc = (mode - lo) / (hi - lo || 1);
      if (u < fc) return lo + Math.sqrt(u * (hi - lo) * (mode - lo));
      return hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode));
    }
    if (type === "lognormal") {
      var mu = toNum(spec.mu, 0);
      var sigma = toNum(spec.sigma, 0.25);
      return Math.exp(mu + sigma * boxMuller(rng));
    }
    var m = toNum(spec.mean, 0);
    var s = toNum(spec.stdev, 1);
    return m + s * boxMuller(rng);
  }

  /**
   * Monte Carlo. model(samples) returns a number.
   * specs: [{name, type, ...dist}]
   */
  function monteCarlo(opts) {
    var iterations = Math.max(100, Math.min(20000, opts.iterations || 5000));
    var seed = opts.seed == null ? 20260917 : opts.seed;
    var rng = mulberry32(seed);
    var specs = opts.inputs || [];
    var model = opts.model;
    var values = new Array(iterations);
    var i;
    var t0 = Date.now();
    for (i = 0; i < iterations; i++) {
      var draws = {};
      for (var s = 0; s < specs.length; s++) {
        draws[specs[s].name] = sampleDist(specs[s], rng);
      }
      values[i] = model(draws);
    }
    var elapsed = Date.now() - t0;
    return {
      iterations: iterations,
      seed: seed,
      elapsedMs: elapsed,
      mean: mean(values),
      stdev: stdev(values),
      min: min(values),
      max: max(values),
      p10: quantile(values, 0.1),
      p50: quantile(values, 0.5),
      p90: quantile(values, 0.9),
      p5: quantile(values, 0.05),
      p95: quantile(values, 0.95),
      values: values
    };
  }

  function histogram(values, bins) {
    bins = bins || 24;
    var lo = min(values);
    var hi = max(values);
    if (lo === hi) return { bins: [lo], counts: [values.length], min: lo, max: hi };
    var width = (hi - lo) / bins;
    var counts = [];
    var edges = [];
    var b;
    for (b = 0; b < bins; b++) {
      counts[b] = 0;
      edges[b] = lo + b * width;
    }
    for (var i = 0; i < values.length; i++) {
      var idx = Math.min(bins - 1, Math.floor((values[i] - lo) / width));
      counts[idx]++;
    }
    return { bins: edges, counts: counts, min: lo, max: hi, width: width };
  }

  /* ---------- stats ---------- */

  function parseSeries(text) {
    return String(text || "")
      .split(/[\s,;]+/)
      .map(Number)
      .filter(isFinite);
  }

  function describe(arr) {
    if (!arr.length) return null;
    var m = mean(arr);
    var sd = stdev(arr);
    var n = arr.length;
    var m3 = 0;
    var m4 = 0;
    for (var i = 0; i < n; i++) {
      var z = (arr[i] - m) / (sd || 1);
      m3 += z * z * z;
      m4 += z * z * z * z;
    }
    var skew = n > 2 ? (n / ((n - 1) * (n - 2))) * (m3 * Math.pow(sd, 3) / Math.pow(sd || 1, 3)) : 0;
    if (!isFinite(skew)) skew = m3 / n;
    var kurt = n > 3 ? m4 / n - 3 : 0;
    return {
      n: n,
      mean: m,
      median: median(arr),
      stdev: sd,
      variance: variance(arr),
      min: min(arr),
      max: max(arr),
      q1: quantile(arr, 0.25),
      q3: quantile(arr, 0.75),
      iqr: quantile(arr, 0.75) - quantile(arr, 0.25),
      range: max(arr) - min(arr),
      skew: skew,
      kurtosis: kurt,
      cv: m ? sd / m : NaN
    };
  }

  function pearson(x, y) {
    var n = Math.min(x.length, y.length);
    if (n < 3) return NaN;
    var mx = mean(x.slice(0, n));
    var my = mean(y.slice(0, n));
    var num = 0;
    var dx = 0;
    var dy = 0;
    for (var i = 0; i < n; i++) {
      var a = x[i] - mx;
      var b = y[i] - my;
      num += a * b;
      dx += a * a;
      dy += b * b;
    }
    var den = Math.sqrt(dx * dy);
    return den ? num / den : NaN;
  }

  function linreg(x, y) {
    var n = Math.min(x.length, y.length);
    var mx = mean(x.slice(0, n));
    var my = mean(y.slice(0, n));
    var sxx = 0;
    var sxy = 0;
    var i;
    for (i = 0; i < n; i++) {
      sxx += (x[i] - mx) * (x[i] - mx);
      sxy += (x[i] - mx) * (y[i] - my);
    }
    var slope = sxx ? sxy / sxx : 0;
    var intercept = my - slope * mx;
    var ssRes = 0;
    var ssTot = 0;
    for (i = 0; i < n; i++) {
      var pred = intercept + slope * x[i];
      ssRes += (y[i] - pred) * (y[i] - pred);
      ssTot += (y[i] - my) * (y[i] - my);
    }
    var r2 = ssTot ? 1 - ssRes / ssTot : 1;
    return { n: n, slope: slope, intercept: intercept, r2: r2, r: pearson(x, y) };
  }

  function forecastExpSmooth(arr, alpha, periods) {
    alpha = alpha == null ? 0.3 : alpha;
    periods = periods || 6;
    if (!arr.length) return [];
    var level = arr[0];
    var fitted = [level];
    for (var i = 1; i < arr.length; i++) {
      level = alpha * arr[i] + (1 - alpha) * level;
      fitted.push(level);
    }
    var fc = [];
    for (var p = 0; p < periods; p++) fc.push(level);
    return { fitted: fitted, forecast: fc, level: level, alpha: alpha };
  }

  function movingAverage(arr, k) {
    k = k || 3;
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var start = Math.max(0, i - k + 1);
      out.push(mean(arr.slice(start, i + 1)));
    }
    return out;
  }

  function jarqueBera(arr) {
    var d = describe(arr);
    if (!d || d.n < 8) return { jb: NaN, pApprox: NaN };
    var n = d.n;
    var jb = (n / 6) * (d.skew * d.skew + (d.kurtosis * d.kurtosis) / 4);
    var p = Math.exp(-0.5 * jb);
    return { jb: jb, pApprox: p, skew: d.skew, kurtosis: d.kurtosis };
  }

  function tTestTwoSample(a, b) {
    var na = a.length;
    var nb = b.length;
    var ma = mean(a);
    var mb = mean(b);
    var va = variance(a);
    var vb = variance(b);
    var se = Math.sqrt(va / na + vb / nb);
    var t = se ? (ma - mb) / se : 0;
    var df = na + nb - 2;
    return { t: t, df: df, meanA: ma, meanB: mb, diff: ma - mb, se: se };
  }

  function chiSquare2x2(a, b, c, d) {
    var n = a + b + c + d;
    var expected = function (r, col) { return (r * col) / n; };
    var e11 = expected(a + b, a + c);
    var e12 = expected(a + b, b + d);
    var e21 = expected(c + d, a + c);
    var e22 = expected(c + d, b + d);
    var x2 =
      Math.pow(a - e11, 2) / e11 +
      Math.pow(b - e12, 2) / e12 +
      Math.pow(c - e21, 2) / e21 +
      Math.pow(d - e22, 2) / e22;
    return { chi2: x2, n: n };
  }

  function kMeans1D(arr, k, seed) {
    k = k || 3;
    var rng = mulberry32(seed || 1);
    var pts = arr.slice().sort(function (x, y) { return x - y; });
    var cents = [];
    var i;
    for (i = 0; i < k; i++) cents.push(pts[Math.floor(rng() * pts.length)] || 0);
    var assign = [];
    var iter;
    for (iter = 0; iter < 25; iter++) {
      assign = pts.map(function (x) {
        var best = 0;
        var bd = Infinity;
        for (var c = 0; c < k; c++) {
          var d = Math.abs(x - cents[c]);
          if (d < bd) {
            bd = d;
            best = c;
          }
        }
        return best;
      });
      var sums = [];
      var counts = [];
      for (i = 0; i < k; i++) {
        sums[i] = 0;
        counts[i] = 0;
      }
      for (i = 0; i < pts.length; i++) {
        sums[assign[i]] += pts[i];
        counts[assign[i]]++;
      }
      for (i = 0; i < k; i++) if (counts[i]) cents[i] = sums[i] / counts[i];
    }
    return { centroids: cents, assignment: assign, k: k };
  }

  function controlLimits(arr) {
    var m = mean(arr);
    var sd = stdev(arr);
    return {
      mean: m,
      ucl: m + 3 * sd,
      lcl: m - 3 * sd,
      uwl: m + 2 * sd,
      lwl: m - 2 * sd,
      stdev: sd,
      points: arr
    };
  }

  function spearman(x, y) {
    function ranks(a) {
      var idx = a.map(function (v, i) { return { v: v, i: i }; });
      idx.sort(function (p, q) { return p.v - q.v; });
      var r = new Array(a.length);
      for (var i = 0; i < idx.length; i++) r[idx[i].i] = i + 1;
      return r;
    }
    return pearson(ranks(x), ranks(y));
  }

  function mannWhitney(a, b) {
    var combined = a.map(function (v) { return { v: v, g: 0 }; })
      .concat(b.map(function (v) { return { v: v, g: 1 }; }));
    combined.sort(function (x, y) { return x.v - y.v; });
    var r0 = 0;
    for (var i = 0; i < combined.length; i++) {
      if (combined[i].g === 0) r0 += i + 1;
    }
    var n1 = a.length;
    var n2 = b.length;
    var u1 = r0 - (n1 * (n1 + 1)) / 2;
    var u2 = n1 * n2 - u1;
    return { u: Math.min(u1, u2), u1: u1, u2: u2, n1: n1, n2: n2 };
  }

  function ratio(a, b) {
    b = Number(b);
    if (!b) return NaN;
    return Number(a) / b;
  }

  function currentRatio(ca, cl) {
    return ratio(ca, cl);
  }

  function quickRatio(ca, inventory, cl) {
    return ratio(Number(ca) - Number(inventory), cl);
  }

  function nwc(ca, cl) {
    return Number(ca) - Number(cl);
  }

  function dso(ar, revenue) {
    return ratio(ar, revenue) * 365;
  }

  function dio(inventory, cogs) {
    return ratio(inventory, cogs) * 365;
  }

  function dpo(ap, cogs) {
    return ratio(ap, cogs) * 365;
  }

  function ccc(ar, inventory, ap, revenue, cogs) {
    return dso(ar, revenue) + dio(inventory, cogs) - dpo(ap, cogs);
  }

  function interestCoverage(ebit, interest) {
    return ratio(ebit, interest);
  }

  function dscr(ebitda, interest, principal) {
    return ratio(ebitda, Number(interest) + Number(principal));
  }

  function netDebt(debt, cash) {
    return Number(debt) - Number(cash);
  }

  function netDebtToEbitda(debt, cash, ebitda) {
    return ratio(netDebt(debt, cash), ebitda);
  }

  function fcfBridge(ebitda, capex, nwcIncrease, cashTax) {
    return Number(ebitda) - Number(capex) - Number(nwcIncrease) - Number(cashTax);
  }

  function qoe(ebitda, addbacks, oneTime) {
    return Number(ebitda) + Number(addbacks) - Number(oneTime);
  }

  function ev(equityValue, debt, cash) {
    return Number(equityValue) + netDebt(debt, cash);
  }

  function evEbitda(equityValue, debt, cash, ebitda) {
    return ratio(ev(equityValue, debt, cash), ebitda);
  }

  function backlogCover(backlog, revenue) {
    return ratio(backlog, revenue);
  }

  function concentration(top, revenue) {
    return ratio(top, revenue);
  }

  function impliedEquity(ebitda, multiple, debt, cash) {
    return Number(ebitda) * Number(multiple) - netDebt(debt, cash);
  }

  global.ISI = global.ISI || {};
  global.ISI.math = {
    isNum: isNum,
    toNum: toNum,
    round: round,
    mean: mean,
    sum: sum,
    min: min,
    max: max,
    variance: variance,
    stdev: stdev,
    quantile: quantile,
    median: median,
    percentileRank: percentileRank,
    pv: pv,
    fv: fv,
    pva: pva,
    npv: npv,
    irr: irr,
    mirr: mirr,
    payback: payback,
    discountedPayback: discountedPayback,
    cagr: cagr,
    ebitdaFromNi: ebitdaFromNi,
    ebitdaFromEbit: ebitdaFromEbit,
    ebitdaMargin: ebitdaMargin,
    roi: roi,
    breakEvenUnits: breakEvenUnits,
    capexPv: capexPv,
    wacc: wacc,
    parseCashflows: parseCashflows,
    profitabilityIndex: profitabilityIndex,
    mulberry32: mulberry32,
    sampleDist: sampleDist,
    monteCarlo: monteCarlo,
    histogram: histogram,
    parseSeries: parseSeries,
    describe: describe,
    pearson: pearson,
    spearman: spearman,
    linreg: linreg,
    forecastExpSmooth: forecastExpSmooth,
    movingAverage: movingAverage,
    jarqueBera: jarqueBera,
    tTestTwoSample: tTestTwoSample,
    chiSquare2x2: chiSquare2x2,
    kMeans1D: kMeans1D,
    controlLimits: controlLimits,
    mannWhitney: mannWhitney,
    currentRatio: currentRatio,
    quickRatio: quickRatio,
    nwc: nwc,
    dso: dso,
    dio: dio,
    dpo: dpo,
    ccc: ccc,
    interestCoverage: interestCoverage,
    dscr: dscr,
    netDebt: netDebt,
    netDebtToEbitda: netDebtToEbitda,
    fcfBridge: fcfBridge,
    qoe: qoe,
    ev: ev,
    evEbitda: evEbitda,
    backlogCover: backlogCover,
    concentration: concentration,
    impliedEquity: impliedEquity
  };
})(typeof window !== "undefined" ? window : this);
