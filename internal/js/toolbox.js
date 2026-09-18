/**
 * ISI Consulting — a-la-carte toolbox
 * Each box is independent. Constraint kits stay on /internal/programs.html.
 */
(function (global) {
  "use strict";

  function num(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
  }

  var FAMILIES = [
    { id: "all", label: "All" },
    { id: "finance", label: "Finance" },
    { id: "diligence", label: "Diligence" },
    { id: "throughput", label: "Throughput" },
    { id: "project", label: "Project" },
    { id: "quality", label: "Quality" },
    { id: "commercial", label: "Commercial" },
    { id: "structure", label: "Structure" },
    { id: "planning", label: "Planning" },
    { id: "excel", label: "Excel" }
  ];

  var ITEMS = [
    {
      id: "npv",
      family: "finance",
      title: "NPV",
      excel: "=NPV(rate, B2:B6)+B1",
      formula: "Σ CFₜ / (1+r)ᵗ",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "rate", label: "Discount rate (%)", value: 10 },
        { id: "inv", label: "t0 outlay ($)", value: 750000 },
        { id: "cfs", label: "Cash flows", value: "180000,240000,310000,340000,360000" }
      ],
      run: function (f, m) {
        var cf = m.parseCashflows(f.cfs, num(f.inv, 0));
        return { value: m.npv(num(f.rate, 10) / 100, cf), note: "Positive NPV creates value at stated WACC." };
      }
    },
    {
      id: "irr",
      family: "finance",
      title: "IRR",
      excel: "=IRR(B1:B6)",
      formula: "r where NPV = 0",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "inv", label: "t0 outlay ($)", value: 750000 },
        { id: "cfs", label: "Cash flows", value: "180000,240000,310000,340000,360000" }
      ],
      run: function (f, m) {
        var irr = m.irr(m.parseCashflows(f.cfs, num(f.inv, 0)));
        return { value: irr, pct: true, note: "Compare to WACC, not to a slogan." };
      }
    },
    {
      id: "mirr",
      family: "finance",
      title: "MIRR",
      excel: "=MIRR(B1:B6, finance, reinvest)",
      formula: "Finance rate on negatives; reinvest positives",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "inv", label: "t0 outlay ($)", value: 750000 },
        { id: "cfs", label: "Cash flows", value: "180000,240000,310000,340000,360000" },
        { id: "fin", label: "Finance rate (%)", value: 9 },
        { id: "re", label: "Reinvest rate (%)", value: 8 }
      ],
      run: function (f, m) {
        var mirr = m.mirr(m.parseCashflows(f.cfs, num(f.inv, 0)), num(f.fin, 9) / 100, num(f.re, 8) / 100);
        return { value: mirr, pct: true, note: "Use when IRR assumes an unrealistic reinvestment rate." };
      }
    },
    {
      id: "pv",
      family: "finance",
      title: "Present value",
      excel: "=PV(rate, nper, 0, -fv)",
      formula: "FV / (1+r)ⁿ",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "fv", label: "Future value ($)", value: 1000000 },
        { id: "rate", label: "Rate (%)", value: 10 },
        { id: "n", label: "Periods", value: 5 }
      ],
      run: function (f, m) {
        return { value: m.pv(num(f.fv, 0), num(f.rate, 10) / 100, num(f.n, 5)), note: "Single sum." };
      }
    },
    {
      id: "wacc",
      family: "finance",
      title: "WACC",
      excel: "=E/(E+D)*Re + D/(E+D)*Rd*(1-tax)",
      formula: "E/(E+D)·Re + D/(E+D)·Rd·(1−t)",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "e", label: "Equity ($)", value: 5000000 },
        { id: "d", label: "Debt ($)", value: 2000000 },
        { id: "re", label: "Cost of equity (%)", value: 12 },
        { id: "rd", label: "Cost of debt (%)", value: 6.5 },
        { id: "tax", label: "Tax (%)", value: 21 }
      ],
      run: function (f, m) {
        return { value: m.wacc(num(f.e, 0), num(f.d, 0), num(f.re, 12) / 100, num(f.rd, 6.5) / 100, num(f.tax, 21) / 100), pct: true, note: "Discount rate for the NPV box." };
      }
    },
    {
      id: "payback",
      family: "finance",
      title: "Payback",
      excel: "Cumulative CF crossing zero",
      formula: "Years until unrecovered outlay = 0",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "inv", label: "t0 outlay ($)", value: 750000 },
        { id: "cfs", label: "Cash flows", value: "180000,240000,310000,340000,360000" }
      ],
      run: function (f, m) {
        var pb = m.payback(m.parseCashflows(f.cfs, num(f.inv, 0)));
        return { value: pb, note: isFinite(pb) ? pb.toFixed(1) + " years undiscounted." : "Beyond horizon." };
      }
    },
    {
      id: "pi",
      family: "finance",
      title: "Profitability index",
      excel: "=NPV(rate, CFs)/ABS(t0)+1",
      formula: "PV of inflows / |t0|",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "rate", label: "Discount rate (%)", value: 10 },
        { id: "inv", label: "t0 outlay ($)", value: 750000 },
        { id: "cfs", label: "Cash flows", value: "180000,240000,310000,340000,360000" }
      ],
      run: function (f, m) {
        return { value: m.profitabilityIndex(num(f.rate, 10) / 100, m.parseCashflows(f.cfs, num(f.inv, 0))), note: "Above 1.0 is value-accretive." };
      }
    },
    {
      id: "roi",
      family: "finance",
      title: "ROI",
      excel: "=(gain-cost)/cost",
      formula: "(Gain − cost) / cost",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "gain", label: "Gain ($)", value: 240000 },
        { id: "cost", label: "Cost ($)", value: 85000 }
      ],
      run: function (f, m) {
        return { value: m.roi(num(f.gain, 0), num(f.cost, 1)), pct: true, note: "Simple return. Prefer NPV when cash timing matters." };
      }
    },
    {
      id: "cagr",
      family: "finance",
      title: "CAGR",
      excel: "=(end/begin)^(1/n)-1",
      formula: "(End / begin)^(1/n) − 1",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "begin", label: "Begin ($)", value: 18000000 },
        { id: "end", label: "End ($)", value: 25000000 },
        { id: "years", label: "Years", value: 4 }
      ],
      run: function (f, m) {
        return { value: m.cagr(num(f.begin, 1), num(f.end, 1), num(f.years, 1)), pct: true, note: "Smoothed growth. Not a forecast." };
      }
    },
    {
      id: "breakeven",
      family: "finance",
      title: "Break-even units",
      excel: "=fixed/(price-vc)",
      formula: "Fixed / (price − variable)",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "fixed", label: "Fixed cost ($)", value: 480000 },
        { id: "price", label: "Price / unit", value: 42 },
        { id: "vc", label: "Variable / unit", value: 27 }
      ],
      run: function (f, m) {
        var u = m.breakEvenUnits(num(f.fixed, 0), num(f.price, 0), num(f.vc, 0));
        return { value: u, note: isFinite(u) ? Math.ceil(u) + " units to cover fixed cost." : "Price does not cover variable cost." };
      }
    },
    {
      id: "ebitda-m",
      family: "finance",
      title: "EBITDA margin",
      excel: "=EBITDA/Revenue",
      formula: "EBITDA / revenue",
      href: "/internal/tools/finance.html",
      fields: [
        { id: "ebitda", label: "EBITDA ($)", value: 2000000 },
        { id: "rev", label: "Revenue ($)", value: 25000000 }
      ],
      run: function (f, m) {
        return { value: m.ebitdaMargin(num(f.ebitda, 0), num(f.rev, 1)), pct: true, note: "Do not treat EBITDA as cash." };
      }
    },
    {
      id: "current",
      family: "diligence",
      title: "Current ratio",
      excel: "=CA/CL",
      formula: "Current assets / current liabilities",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "ca", label: "Current assets ($)", value: 4200000 },
        { id: "cl", label: "Current liabilities ($)", value: 3100000 }
      ],
      run: function (f, m) {
        return { value: m.currentRatio(num(f.ca, 0), num(f.cl, 1)), note: "Below 1.0 is a liquidity flag." };
      }
    },
    {
      id: "quick",
      family: "diligence",
      title: "Quick ratio",
      excel: "=(CA-Inventory)/CL",
      formula: "(CA − inventory) / CL",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "ca", label: "Current assets ($)", value: 4200000 },
        { id: "inv", label: "Inventory ($)", value: 1800000 },
        { id: "cl", label: "Current liabilities ($)", value: 3100000 }
      ],
      run: function (f, m) {
        return { value: m.quickRatio(num(f.ca, 0), num(f.inv, 0), num(f.cl, 1)), note: "Strips inventory from coverage." };
      }
    },
    {
      id: "dso",
      family: "diligence",
      title: "DSO",
      excel: "=AR/Revenue*365",
      formula: "AR / revenue × 365",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "ar", label: "AR ($)", value: 2100000 },
        { id: "rev", label: "Revenue ($)", value: 25000000 }
      ],
      run: function (f, m) {
        return { value: m.dso(num(f.ar, 0), num(f.rev, 1)), note: "Days sales outstanding." };
      }
    },
    {
      id: "ccc",
      family: "diligence",
      title: "Cash conversion cycle",
      excel: "=DSO+DIO-DPO",
      formula: "DSO + DIO − DPO",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "ar", label: "AR ($)", value: 2100000 },
        { id: "inv", label: "Inventory ($)", value: 1800000 },
        { id: "ap", label: "AP ($)", value: 900000 },
        { id: "rev", label: "Revenue ($)", value: 25000000 },
        { id: "cogs", label: "COGS ($)", value: 14000000 }
      ],
      run: function (f, m) {
        return { value: m.ccc(num(f.ar, 0), num(f.inv, 0), num(f.ap, 0), num(f.rev, 1), num(f.cogs, 1)), note: "Days of cash trapped in the cycle." };
      }
    },
    {
      id: "dscr",
      family: "diligence",
      title: "DSCR",
      excel: "=EBITDA/(interest+principal)",
      formula: "EBITDA / (interest + principal)",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "ebitda", label: "EBITDA ($)", value: 2000000 },
        { id: "int", label: "Interest ($)", value: 280000 },
        { id: "prin", label: "Principal ($)", value: 420000 }
      ],
      run: function (f, m) {
        return { value: m.dscr(num(f.ebitda, 0), num(f.int, 0), num(f.prin, 0)), note: "Below 1.25 is typically a lender caution." };
      }
    },
    {
      id: "ndebitda",
      family: "diligence",
      title: "Net debt / EBITDA",
      excel: "=(Debt-Cash)/EBITDA",
      formula: "(Debt − cash) / EBITDA",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "debt", label: "Debt ($)", value: 4200000 },
        { id: "cash", label: "Cash ($)", value: 600000 },
        { id: "ebitda", label: "EBITDA ($)", value: 2000000 }
      ],
      run: function (f, m) {
        return { value: m.netDebtToEbitda(num(f.debt, 0), num(f.cash, 0), num(f.ebitda, 1)), note: "Leverage multiple." };
      }
    },
    {
      id: "qoe",
      family: "diligence",
      title: "Quality of earnings",
      excel: "=EBITDA+addbacks-oneTime",
      formula: "EBITDA + add-backs − one-time",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "ebitda", label: "Reported EBITDA ($)", value: 2000000 },
        { id: "add", label: "Add-backs ($)", value: 180000 },
        { id: "one", label: "One-time ($)", value: 90000 }
      ],
      run: function (f, m) {
        return { value: m.qoe(num(f.ebitda, 0), num(f.add, 0), num(f.one, 0)), note: "Adjusted earnings before a growth thesis." };
      }
    },
    {
      id: "evebitda",
      family: "diligence",
      title: "EV / EBITDA",
      excel: "=(Equity+Debt-Cash)/EBITDA",
      formula: "Enterprise value / EBITDA",
      href: "/internal/diagnostics/diligence.html",
      fields: [
        { id: "eq", label: "Equity value ($)", value: 12000000 },
        { id: "debt", label: "Debt ($)", value: 4200000 },
        { id: "cash", label: "Cash ($)", value: 600000 },
        { id: "ebitda", label: "EBITDA ($)", value: 2000000 }
      ],
      run: function (f, m) {
        return { value: m.evEbitda(num(f.eq, 0), num(f.debt, 0), num(f.cash, 0), num(f.ebitda, 1)), note: "Trading / implied multiple." };
      }
    },
    {
      id: "t",
      family: "throughput",
      title: "Throughput (T)",
      excel: "=MIN(demand, cap*OEE)*contrib*52",
      formula: "min(demand, capacity × OEE) × contribution × periods",
      href: "/internal/tools/roi-throughput.html",
      fields: [
        { id: "demand", label: "Weekly demand", value: 1200 },
        { id: "cap", label: "Constraint cap / week", value: 1100 },
        { id: "oee", label: "OEE (%)", value: 62 },
        { id: "cu", label: "Contribution $/unit", value: 85 }
      ],
      run: function (f) {
        var shipped = Math.min(num(f.demand, 0), num(f.cap, 0) * num(f.oee, 0) / 100);
        var t = shipped * num(f.cu, 0) * 52;
        return { value: t, note: "Annual T at the constraint. Non-constraint improvements do not raise this." };
      }
    },
    {
      id: "np-toc",
      family: "throughput",
      title: "Net profit (TOC)",
      excel: "=T-OE",
      formula: "NP = T − OE",
      href: "/internal/tools/roi-throughput.html",
      fields: [
        { id: "t", label: "Annual T ($)", value: 2900000 },
        { id: "oe", label: "Annual OE ($)", value: 2496000 }
      ],
      run: function (f) {
        return { value: num(f.t, 0) - num(f.oe, 0), note: "Throughput accounting, not local efficiency." };
      }
    },
    {
      id: "cpi",
      family: "project",
      title: "CPI",
      excel: "=EV/AC",
      formula: "Earned value / actual cost",
      href: "/internal/diagnostics/capital.html",
      fields: [
        { id: "ev", label: "EV ($)", value: 1680000 },
        { id: "ac", label: "AC ($)", value: 2150000 }
      ],
      run: function (f) {
        var cpi = num(f.ac, 1) ? num(f.ev, 0) / num(f.ac, 1) : NaN;
        return { value: cpi, note: "Below 1.0: over cost." };
      }
    },
    {
      id: "spi",
      family: "project",
      title: "SPI",
      excel: "=EV/PV",
      formula: "Earned value / planned value",
      href: "/internal/diagnostics/capital.html",
      fields: [
        { id: "ev", label: "EV ($)", value: 1680000 },
        { id: "pv", label: "PV ($)", value: 2100000 }
      ],
      run: function (f) {
        var spi = num(f.pv, 1) ? num(f.ev, 0) / num(f.pv, 1) : NaN;
        return { value: spi, note: "Below 1.0: behind schedule. SPI is not percent-complete." };
      }
    },
    {
      id: "eac",
      family: "project",
      title: "EAC",
      excel: "=AC+(BAC-EV)/CPI",
      formula: "AC + (BAC − EV) / CPI",
      href: "/internal/diagnostics/capital.html",
      fields: [
        { id: "ac", label: "AC ($)", value: 2150000 },
        { id: "bac", label: "BAC ($)", value: 4200000 },
        { id: "ev", label: "EV ($)", value: 1680000 }
      ],
      run: function (f) {
        var cpi = num(f.ac, 1) ? num(f.ev, 0) / num(f.ac, 1) : NaN;
        var eac = cpi ? num(f.ac, 0) + (num(f.bac, 0) - num(f.ev, 0)) / cpi : NaN;
        return { value: eac, note: "Estimate at completion if CPI holds." };
      }
    },
    {
      id: "spc",
      family: "quality",
      title: "Control limits",
      excel: "Mean ± 3σ",
      formula: "UCL / LCL on the plotted points",
      href: "/internal/tools/stats.html",
      fields: [
        { id: "series", label: "Series (comma)", value: "12,14,13,15,11,16,14,13,12,18,14,13" }
      ],
      run: function (f, m) {
        var arr = m.parseSeries(f.series);
        var lim = m.controlLimits(arr);
        return { value: lim.mean, note: "Mean " + (lim.mean && lim.mean.toFixed ? lim.mean.toFixed(2) : lim.mean) + " · UCL " + (lim.ucl && lim.ucl.toFixed ? lim.ucl.toFixed(2) : lim.ucl) + " · LCL " + (lim.lcl && lim.lcl.toFixed ? lim.lcl.toFixed(2) : lim.lcl) };
      }
    },
    {
      id: "growth-kit",
      family: "commercial",
      title: "Growth diagnostic",
      excel: "Live engine — not a cell formula",
      formula: "Commercial fact-base, scoring, tree, roadmap",
      href: "/diagnostic/input.html"
    },
    {
      id: "winrate",
      family: "commercial",
      title: "Win rate",
      excel: "=awards/bids",
      formula: "Awards / qualified bids",
      href: "/diagnostic/input.html",
      fields: [
        { id: "awards", label: "Awards", value: 18 },
        { id: "bids", label: "Qualified bids", value: 72 }
      ],
      run: function (f) {
        var w = num(f.bids, 1) ? num(f.awards, 0) / num(f.bids, 1) : NaN;
        return { value: w, pct: true, note: "Use qualified bids only. Unqualified volume inflates the denominator." };
      }
    },
    {
      id: "montecarlo",
      family: "structure",
      title: "Monte Carlo",
      excel: "Seeded iterations — not RAND()",
      formula: "P10 / P50 / P90 on a named case",
      href: "/internal/tools/montecarlo.html"
    },
    {
      id: "trees",
      family: "structure",
      title: "Decision tree",
      excel: "EV = Σ pᵢ × payoffᵢ",
      formula: "Quantified branches",
      href: "/internal/tools/trees.html"
    },
    {
      id: "matrix",
      family: "structure",
      title: "Decision matrix",
      excel: "=SUMPRODUCT(weights, scores)",
      formula: "Weighted alternatives",
      href: "/internal/tools/matrix.html"
    },
    {
      id: "mece",
      family: "structure",
      title: "MECE tree",
      excel: "Structure, not a formula",
      formula: "Mutually exclusive, collectively exhaustive",
      href: "/internal/tools/mece.html"
    },
    {
      id: "sensitivity",
      family: "structure",
      title: "Sensitivity",
      excel: "Data table / tornado",
      formula: "One-way, two-way, tornado",
      href: "/internal/tools/sensitivity.html"
    },
    {
      id: "scenarios",
      family: "planning",
      title: "Scenarios",
      excel: "Base / up / down / stress",
      formula: "Four cases, one kill condition",
      href: "/internal/tools/scenarios.html"
    },
    {
      id: "roadmap",
      family: "planning",
      title: "Roadmap",
      excel: "Timeline / swimlane / kanban",
      formula: "Same initiatives, switched views",
      href: "/internal/tools/roadmap.html"
    },
    {
      id: "ppm",
      family: "planning",
      title: "Portfolio (PPM)",
      excel: "Capacity vs demand",
      formula: "Trade-offs across the book",
      href: "/internal/tools/ppm.html"
    },
    {
      id: "risk",
      family: "planning",
      title: "Risk EMV",
      excel: "=p*impact",
      formula: "Probability × impact",
      href: "/internal/tools/risk.html"
    },
    {
      id: "pivot",
      family: "excel",
      title: "Pivot / Excel XML",
      excel: "Group, total, export .xml / .csv",
      formula: "Transform large tables",
      href: "/internal/tools/pivot.html"
    },
    {
      id: "stats",
      family: "excel",
      title: "Statistics bench",
      excel: "AVERAGE, STDEV.S, LINEST, …",
      formula: "Descriptive, regression, tests, clustering",
      href: "/internal/tools/stats.html"
    },
    {
      id: "regression",
      family: "excel",
      title: "Regression modeling",
      excel: "=LINEST(y,x,TRUE,TRUE)",
      formula: "ŷ = a + bX · R²",
      href: "/internal/tools/regression.html"
    }
  ];

  global.ISI = global.ISI || {};
  global.ISI.toolbox = {
    FAMILIES: FAMILIES,
    ITEMS: ITEMS
  };
})(typeof window !== "undefined" ? window : this);
