/**
 * ISI Consulting — financial due diligence kernel
 * One engine. Situation-specific modules. Live formulas. Client-visible logic.
 */
(function (global) {
  "use strict";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : (d == null ? 0 : d);
  }

  function rag(ok, warn) {
    if (ok) return "Green";
    if (warn) return "Yellow";
    return "Red";
  }

  function fmtMoney(v) {
    if (!isFinite(v)) return "—";
    var abs = Math.abs(v);
    var sign = v < 0 ? "-" : "";
    if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return sign + "$" + (abs / 1e3).toFixed(1) + "K";
    return sign + "$" + Math.round(abs).toLocaleString("en-US");
  }

  function fmtNum(v, d) {
    if (!isFinite(v)) return "—";
    return Number(v).toFixed(d == null ? 2 : d);
  }

  var SITUATIONS = {
    acquisition: {
      id: "acquisition",
      label: "Acquisition / investment diligence",
      purpose: "Quality of earnings, working capital, leverage, and valuation before money moves.",
      modules: ["liquidity", "leverage", "workingCapital", "qoe", "valuation", "coverage", "concentration", "backlog"]
    },
    turnaround: {
      id: "turnaround",
      label: "Turnaround / cash recovery",
      purpose: "Can the firm fund operations, service debt, and survive a 90-day cash squeeze.",
      modules: ["liquidity", "coverage", "workingCapital", "qoe", "leverage", "concentration"]
    },
    capital: {
      id: "capital",
      label: "Capital project / CAPEX diligence",
      purpose: "Does the spend create value after WACC, cash timing, and covenant headroom.",
      modules: ["liquidity", "coverage", "project", "valuation", "leverage"]
    },
    throughput: {
      id: "throughput",
      label: "Operations / throughput diligence",
      purpose: "Constraint cash, inventory trap, and whether margin is real or absorbed by OE.",
      modules: ["liquidity", "workingCapital", "throughput", "qoe"]
    },
    supply: {
      id: "supply",
      label: "Supply chain / inventory diligence",
      purpose: "Cash cycle, trapped stock, and concentration in vendors or SKUs that can break fill.",
      modules: ["workingCapital", "liquidity", "concentration", "supply"]
    },
    commercial: {
      id: "commercial",
      label: "Commercial / backlog diligence",
      purpose: "Revenue quality: concentration, backlog cover, and whether booked work converts to cash.",
      modules: ["backlog", "concentration", "workingCapital", "qoe", "liquidity"]
    }
  };

  var FIELDS = [
    { id: "revenue", label: "Annual revenue ($)", value: 25000000, group: "P&L" },
    { id: "cogs", label: "COGS ($)", value: 17500000, group: "P&L" },
    { id: "ebitda", label: "Reported EBITDA ($)", value: 2000000, group: "P&L" },
    { id: "ebit", label: "EBIT ($)", value: 1500000, group: "P&L" },
    { id: "addbacks", label: "Owner / non-recurring add-backs ($)", value: 180000, group: "P&L" },
    { id: "oneTime", label: "One-time income in EBITDA ($)", value: 90000, group: "P&L" },
    { id: "ca", label: "Current assets ($)", value: 7500000, group: "Balance sheet" },
    { id: "cl", label: "Current liabilities ($)", value: 5200000, group: "Balance sheet" },
    { id: "cash", label: "Cash ($)", value: 900000, group: "Balance sheet" },
    { id: "ar", label: "Accounts receivable ($)", value: 3800000, group: "Balance sheet" },
    { id: "inventory", label: "Inventory ($)", value: 3200000, group: "Balance sheet" },
    { id: "ap", label: "Accounts payable ($)", value: 2400000, group: "Balance sheet" },
    { id: "debt", label: "Interest-bearing debt ($)", value: 6500000, group: "Balance sheet" },
    { id: "interest", label: "Annual interest ($)", value: 420000, group: "Debt" },
    { id: "principal", label: "Annual principal amortization ($)", value: 800000, group: "Debt" },
    { id: "capex", label: "Maintenance CAPEX ($)", value: 650000, group: "Cash" },
    { id: "nwcIncrease", label: "YoY increase in NWC ($)", value: 400000, group: "Cash" },
    { id: "cashTax", label: "Cash tax ($)", value: 280000, group: "Cash" },
    { id: "equityValue", label: "Stated equity value ($)", value: 12000000, group: "Valuation" },
    { id: "multiple", label: "EV / EBITDA multiple asked (x)", value: 6.5, group: "Valuation" },
    { id: "wacc", label: "WACC / hurdle (%)", value: 11, group: "Valuation" },
    { id: "investment", label: "Proposed investment / deal cash ($)", value: 1500000, group: "Project" },
    { id: "cf1", label: "Y1 incremental cash flow ($)", value: 280000, group: "Project" },
    { id: "cf2", label: "Y2 incremental cash flow ($)", value: 360000, group: "Project" },
    { id: "cf3", label: "Y3 incremental cash flow ($)", value: 420000, group: "Project" },
    { id: "cf4", label: "Y4 incremental cash flow ($)", value: 440000, group: "Project" },
    { id: "cf5", label: "Y5 incremental cash flow ($)", value: 460000, group: "Project" },
    { id: "backlog", label: "Firm backlog ($)", value: 18000000, group: "Commercial" },
    { id: "topCustomer", label: "Largest customer revenue ($)", value: 4200000, group: "Commercial" },
    { id: "constraintUtil", label: "Constraint utilization (%)", value: 92, group: "Operations" },
    { id: "throughput", label: "Constraint throughput T ($)", value: 8000000, group: "Operations" },
    { id: "fill", label: "Fill / OTIF (%)", value: 94, group: "Operations" }
  ];

  function compute(f, math) {
    var revenue = n(f.revenue, 1);
    var cogs = n(f.cogs, 1);
    var ebitda = n(f.ebitda);
    var ebit = n(f.ebit);
    var current = math.currentRatio(f.ca, f.cl);
    var quick = math.quickRatio(f.ca, f.inventory, f.cl);
    var nwcVal = math.nwc(f.ca, f.cl);
    var daysAR = math.dso(f.ar, revenue);
    var daysInv = math.dio(f.inventory, cogs);
    var daysAP = math.dpo(f.ap, cogs);
    var cashCycle = math.ccc(f.ar, f.inventory, f.ap, revenue, cogs);
    var icr = math.interestCoverage(ebit, f.interest);
    var dscr = math.dscr(ebitda, f.interest, f.principal);
    var nd = math.netDebt(f.debt, f.cash);
    var ndE = math.netDebtToEbitda(f.debt, f.cash, ebitda);
    var fcf = math.fcfBridge(ebitda, f.capex, f.nwcIncrease, f.cashTax);
    var qoe = math.qoe(ebitda, f.addbacks, f.oneTime);
    var enterprise = math.ev(f.equityValue, f.debt, f.cash);
    var evx = math.evEbitda(f.equityValue, f.debt, f.cash, qoe);
    var implied = math.impliedEquity(qoe, f.multiple, f.debt, f.cash);
    var cover = math.backlogCover(f.backlog, revenue);
    var conc = math.concentration(f.topCustomer, revenue);
    var gm = revenue ? (revenue - cogs) / revenue : NaN;
    var em = math.ebitdaMargin(ebitda, revenue);
    var rate = n(f.wacc, 11) / 100;
    var cf = [-Math.abs(n(f.investment)), n(f.cf1), n(f.cf2), n(f.cf3), n(f.cf4), n(f.cf5)];
    var npv = math.npv(rate, cf);
    var irr = math.irr(cf);
    var pb = math.payback(cf);
    var pi = math.profitabilityIndex(rate, cf);
    var trapped = Math.max(0, (daysInv - 45) / 365) * cogs;
    var qoeHaircut = ebitda ? (n(f.addbacks) - n(f.oneTime)) / ebitda : 0;
    var util = n(f.constraintUtil, 92);
    return {
      current: current,
      quick: quick,
      nwc: nwcVal,
      dso: daysAR,
      dio: daysInv,
      dpo: daysAP,
      ccc: cashCycle,
      icr: icr,
      dscr: dscr,
      netDebt: nd,
      netDebtToEbitda: ndE,
      fcf: fcf,
      qoe: qoe,
      ev: enterprise,
      evEbitda: evx,
      impliedEquity: implied,
      backlogCover: cover,
      concentration: conc,
      grossMargin: gm,
      ebitdaMargin: em,
      npv: npv,
      irr: irr,
      payback: pb,
      pi: pi,
      cashflows: cf,
      wacc: rate,
      trappedInventory: trapped,
      qoeHaircut: qoeHaircut,
      constraintUtil: util,
      investment: n(f.investment)
    };
  }

  function testsFor(situation, m) {
    var all = {
      liquidity: [
        {
          id: "current",
          module: "liquidity",
          gate: "hard",
          label: "Can near-term bills be paid from current assets?",
          formula: "Current ratio = Current assets ÷ Current liabilities",
          value: m.current,
          display: fmtNum(m.current) + "x",
          rating: rag(m.current >= 1.25, m.current >= 1.0),
          because: "A ratio at or above 1.25x means current assets more than cover current claims. Below 1.0x the firm is technically insolvent on a working-capital basis."
        },
        {
          id: "quick",
          module: "liquidity",
          gate: "hard",
          label: "Can bills be paid without selling inventory?",
          formula: "Quick ratio = (Current assets − Inventory) ÷ Current liabilities",
          value: m.quick,
          display: fmtNum(m.quick) + "x",
          rating: rag(m.quick >= 0.9, m.quick >= 0.7),
          because: "Inventory is not cash. If the quick ratio is weak, a slow job or a stuck SKU becomes a payroll problem."
        },
        {
          id: "fcf",
          module: "liquidity",
          gate: "soft",
          label: "Is free cash flow positive after maintenance spend?",
          formula: "FCF = EBITDA − CAPEX − ΔNWC − cash tax",
          value: m.fcf,
          display: fmtMoney(m.fcf),
          rating: rag(m.fcf > 0, m.fcf > -250000),
          because: "Reported profit that does not convert to cash cannot fund debt, owners, or growth. Negative FCF is a diligence flag even when EBITDA looks healthy."
        }
      ],
      coverage: [
        {
          id: "icr",
          module: "coverage",
          gate: "hard",
          label: "Does operating profit cover interest?",
          formula: "Interest coverage = EBIT ÷ Interest",
          value: m.icr,
          display: fmtNum(m.icr) + "x",
          rating: rag(m.icr >= 3, m.icr >= 1.5),
          because: "Lenders and owners both need a buffer. Coverage under 1.5x means a modest volume miss can miss a coupon."
        },
        {
          id: "dscr",
          module: "coverage",
          gate: "hard",
          label: "Does EBITDA cover interest plus principal?",
          formula: "DSCR = EBITDA ÷ (Interest + Principal)",
          value: m.dscr,
          display: fmtNum(m.dscr) + "x",
          rating: rag(m.dscr >= 1.25, m.dscr >= 1.0),
          because: "Banks underwrite DSCR, not hope. Below 1.0x the firm cannot service the current debt schedule from earnings."
        }
      ],
      leverage: [
        {
          id: "ndE",
          module: "leverage",
          gate: "soft",
          label: "Is net debt supportable by earnings power?",
          formula: "Net debt / EBITDA = (Debt − Cash) ÷ EBITDA",
          value: m.netDebtToEbitda,
          display: fmtNum(m.netDebtToEbitda) + "x",
          rating: rag(m.netDebtToEbitda <= 3, m.netDebtToEbitda <= 4.5),
          because: "Above ~4.5x, most private lenders treat the capital structure as stretched. Diligence then shifts from growth to de-risking."
        }
      ],
      workingCapital: [
        {
          id: "ccc",
          module: "workingCapital",
          gate: "soft",
          label: "How long is cash trapped in the cycle?",
          formula: "Cash conversion cycle = DSO + DIO − DPO",
          value: m.ccc,
          display: fmtNum(m.ccc, 0) + " days",
          rating: rag(m.ccc <= 60, m.ccc <= 90),
          because: "Every extra day in the cycle is cash that cannot pay vendors, crews, or debt. Construction and trades often hide the squeeze in AR and job inventory."
        },
        {
          id: "dso",
          module: "workingCapital",
          gate: "soft",
          label: "Are customers paying on time?",
          formula: "DSO = AR ÷ Revenue × 365",
          value: m.dso,
          display: fmtNum(m.dso, 0) + " days",
          rating: rag(m.dso <= 45, m.dso <= 65),
          because: "Long DSO is unbilled risk and retainage risk. It is a commercial quality issue, not just a collections issue."
        }
      ],
      qoe: [
        {
          id: "qoe",
          module: "qoe",
          gate: "soft",
          label: "Is EBITDA quality high enough to underwrite?",
          formula: "Quality of earnings = Reported EBITDA + add-backs − one-time income",
          value: m.qoe,
          display: fmtMoney(m.qoe),
          rating: rag(m.qoe > 0 && Math.abs(m.qoeHaircut) <= 0.15, m.qoe > 0 && Math.abs(m.qoeHaircut) <= 0.3),
          because: "Add-backs that are really run-rate costs inflate price. One-time income that sits inside EBITDA does the same. Diligence uses adjusted earnings, not the brochure."
        },
        {
          id: "margin",
          module: "qoe",
          gate: "soft",
          label: "Is the margin structure intact?",
          formula: "EBITDA margin = EBITDA ÷ Revenue",
          value: m.ebitdaMargin,
          display: fmtNum(m.ebitdaMargin * 100, 1) + "%",
          rating: rag(m.ebitdaMargin >= 0.08, m.ebitdaMargin >= 0.05),
          because: "Sub-5% EBITDA in a trades or manufacturing file usually means price, mix, or overhead is already broken. Growth will not fix that by itself."
        }
      ],
      valuation: [
        {
          id: "multiple",
          module: "valuation",
          gate: "soft",
          label: "Does the asked multiple survive adjusted earnings?",
          formula: "EV / QoE EBITDA = (Equity + Debt − Cash) ÷ Quality-of-earnings EBITDA",
          value: m.evEbitda,
          display: fmtNum(m.evEbitda) + "x",
          rating: rag(m.evEbitda <= 7, m.evEbitda <= 9),
          because: "Price is a claim on cash. If the multiple only works on unadjusted EBITDA, the buyer is paying for earnings that are not there."
        }
      ],
      project: [
        {
          id: "npv",
          module: "project",
          gate: "hard",
          label: "Does the proposed spend create value after the cost of capital?",
          formula: "NPV = Σ CFt / (1 + WACC)^t  (t = 0…5)",
          value: m.npv,
          display: fmtMoney(m.npv),
          rating: rag(m.npv > 0, m.npv > -0.1 * Math.abs(m.investment || 1)),
          because: "A negative NPV at stated WACC means the project destroys owner value even if it looks busy. Diligence stops the spend or restates the cash flows."
        },
        {
          id: "irr",
          module: "project",
          gate: "soft",
          label: "Does IRR clear the hurdle rate?",
          formula: "IRR is the rate r where NPV(r) = 0; compare to WACC",
          value: m.irr,
          display: isFinite(m.irr) ? fmtNum(m.irr * 100, 1) + "% vs WACC " + fmtNum(m.wacc * 100, 1) + "%" : "—",
          rating: rag(m.irr > m.wacc, m.irr > m.wacc * 0.85),
          because: "IRR below WACC is the same signal as negative NPV: capital is better left in the next-best use."
        }
      ],
      concentration: [
        {
          id: "conc",
          module: "concentration",
          gate: "soft",
          label: "Is revenue dangerously concentrated?",
          formula: "Concentration = Largest customer ÷ Revenue",
          value: m.concentration,
          display: fmtNum(m.concentration * 100, 1) + "%",
          rating: rag(m.concentration <= 0.18, m.concentration <= 0.3),
          because: "A single account above ~30% of revenue is a going-concern risk. Diligence prices that as a discount or a walk-away."
        }
      ],
      backlog: [
        {
          id: "backlog",
          module: "backlog",
          gate: "soft",
          label: "Does backlog cover a year of work?",
          formula: "Backlog cover = Firm backlog ÷ Revenue",
          value: m.backlogCover,
          display: fmtNum(m.backlogCover, 2) + "x years",
          rating: rag(m.backlogCover >= 0.6, m.backlogCover >= 0.35),
          because: "Thin backlog with long DSO is a cash and utilization problem arriving in the next two quarters."
        }
      ],
      throughput: [
        {
          id: "util",
          module: "throughput",
          gate: "soft",
          label: "Is the constraint already saturated?",
          formula: "Constraint utilization. Throughput T = sales − truly variable cost at the constraint.",
          value: m.constraintUtil,
          display: fmtNum(m.constraintUtil, 0) + "%",
          rating: rag(m.constraintUtil < 90, m.constraintUtil <= 96),
          because: "If the constraint is already above ~90% utilization, buying more non-constraint capacity does not increase T. Diligence funds exploit and subordinate first."
        }
      ],
      supply: [
        {
          id: "trap",
          module: "supply",
          gate: "soft",
          label: "Is inventory trapping cash above a 45-day target?",
          formula: "Trapped capital = max(0, (DIO − 45) / 365) × COGS",
          value: m.trappedInventory,
          display: fmtMoney(m.trappedInventory),
          rating: rag(m.trappedInventory <= 0, m.trappedInventory <= 400000),
          because: "Stock above the operating target is a loan the firm made to its own warehouse. Diligence treats it as recoverable cash, not a growth asset."
        }
      ]
    };

    var sit = SITUATIONS[situation] || SITUATIONS.acquisition;
    var tests = [];
    sit.modules.forEach(function (mod) {
      (all[mod] || []).forEach(function (t) {
        tests.push(t);
      });
    });
    return tests;
  }

  function walkTree(tests) {
    var hardReds = tests.filter(function (t) { return t.gate === "hard" && t.rating === "Red"; });
    var reds = tests.filter(function (t) { return t.rating === "Red"; });
    var yellows = tests.filter(function (t) { return t.rating === "Yellow"; });
    var greens = tests.filter(function (t) { return t.rating === "Green"; });
    var nodes = [];
    nodes.push({
      id: "gate-hard",
      kind: "decision",
      label: "Hard financial gates (liquidity and debt service)",
      taken: true,
      result: hardReds.length ? "STOP" : "PASS",
      because: hardReds.length
        ? "Failed: " + hardReds.map(function (t) { return t.label; }).join("; ")
        : "Current ratio, quick ratio, and coverage tests did not fail. Diligence continues."
    });
    if (hardReds.length) {
      nodes.push({
        id: "stop",
        kind: "leaf-neg",
        label: "Do not proceed on stated numbers",
        taken: true,
        result: "STOP",
        because: "A hard gate failed. Restate cash, debt, or the deal before any growth conversation."
      });
      return { verdict: "STOP", nodes: nodes, reds: reds, yellows: yellows, greens: greens };
    }
    nodes.push({
      id: "gate-soft",
      kind: "decision",
      label: "Quality, cycle, and concentration",
      taken: true,
      result: reds.length >= 2 || yellows.length >= 3 ? "CAUTION" : "CONTINUE",
      because: reds.length
        ? "Soft failures: " + reds.map(function (t) { return t.id; }).join(", ")
        : yellows.length + " yellow flags. None are automatic walk-aways."
    });
    var verdict = "GO";
    if (reds.length >= 2 || yellows.length >= 3) verdict = "CAUTION";
    if (reds.length >= 4) verdict = "STOP";
    nodes.push({
      id: "verdict",
      kind: verdict === "GO" ? "leaf-pos" : verdict === "CAUTION" ? "leaf-neu" : "leaf-neg",
      label: verdict === "GO" ? "Proceed to scoped diagnostic" : verdict === "CAUTION" ? "Proceed with conditions" : "Pause the engagement thesis",
      taken: true,
      result: verdict,
      because: verdict === "GO"
        ? "Hard gates passed and quality tests are mostly green. Money can be discussed with a defined workplan."
        : verdict === "CAUTION"
          ? "Continue, but the statement of work must include the failed tests as workstreams."
          : "Too many quality failures. Recast the thesis before investing consulting time as if the file were clean."
    });
    return { verdict: verdict, nodes: nodes, reds: reds, yellows: yellows, greens: greens };
  }

  function headline(verdict, sit) {
    if (verdict === "STOP") return "Due diligence: stop. Stated numbers do not support this " + sit.label.toLowerCase() + ".";
    if (verdict === "CAUTION") return "Due diligence: proceed with conditions. Several financial tests did not clear.";
    return "Due diligence: gates clear. Scope the next diagnostic against the remaining yellows.";
  }

  function nextTools(situation) {
    var map = {
      acquisition: ["/internal/tools/finance.html", "/internal/tools/montecarlo.html", "/internal/diagnostics/margin.html"],
      turnaround: ["/diagnostic/input.html", "/internal/tools/roi-throughput.html", "/internal/tools/risk.html"],
      capital: ["/internal/diagnostics/capital.html", "/internal/diagnostics/margin.html", "/internal/tools/ppm.html"],
      throughput: ["/internal/diagnostics/operations.html", "/internal/tools/roi-throughput.html"],
      supply: ["/internal/diagnostics/supply.html", "/internal/tools/supply-chain.html"],
      commercial: ["/diagnostic/input.html", "/internal/tools/trees.html"]
    };
    return map[situation] || map.acquisition;
  }

  function run(situation, fields, math) {
    math = math || (global.ISI && global.ISI.math);
    var sit = SITUATIONS[situation] || SITUATIONS.acquisition;
    var metrics = compute(fields, math);
    var tests = testsFor(sit.id, metrics);
    var tree = walkTree(tests);
    return {
      situation: sit,
      metrics: metrics,
      tests: tests,
      tree: tree,
      headline: headline(tree.verdict, sit),
      next: nextTools(sit.id),
      clientNarrative: tree.nodes.map(function (node) {
        return node.label + " → " + node.result + ". " + node.because;
      }).join(" ")
    };
  }

  global.ISI = global.ISI || {};
  global.ISI.diligence = {
    SITUATIONS: SITUATIONS,
    FIELDS: FIELDS,
    compute: compute,
    run: run,
    fmtMoney: fmtMoney,
    fmtNum: fmtNum
  };
})(typeof window !== "undefined" ? window : this);
