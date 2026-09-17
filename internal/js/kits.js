/**
 * ISI Consulting — five diagnostic kits, one adapter.
 * Shared contract: collect KPIs → score MECE branches → save to practice store.
 */
(function (global) {
  "use strict";

  function n(v, d) {
    var x = Number(v);
    return isFinite(x) ? x : d;
  }

  function rag(ok, warn) {
    if (ok) return "Green";
    if (warn) return "Yellow";
    return "Red";
  }

  var KITS = {
    growth: {
      id: "growth",
      title: "Growth & Turnaround Diagnostic",
      live: "/diagnostic/input.html",
      purpose: "Commercial engine, margin compression, leadership cadence.",
      fields: []
    },
    margin: {
      id: "margin",
      title: "Margin & Capital Diagnostic",
      purpose: "Whether capital deployed in this engagement creates value after risk and cost of capital.",
      fields: [
        { id: "revenue", label: "Annual revenue ($)", value: 25000000 },
        { id: "ebitda", label: "Current EBITDA ($)", value: 2000000 },
        { id: "investment", label: "Proposed investment / CAPEX ($)", value: 750000 },
        { id: "cf1", label: "Year 1 incremental cash flow ($)", value: 180000 },
        { id: "cf2", label: "Year 2 incremental cash flow ($)", value: 240000 },
        { id: "cf3", label: "Year 3 incremental cash flow ($)", value: 310000 },
        { id: "cf4", label: "Year 4 incremental cash flow ($)", value: 340000 },
        { id: "cf5", label: "Year 5 incremental cash flow ($)", value: 360000 },
        { id: "rate", label: "Discount rate / WACC (%)", value: 10 },
        { id: "tax", label: "Tax rate (%)", value: 21 },
        { id: "da", label: "Annual D&A ($)", value: 120000 },
        { id: "pricePressure", label: "Price pressure (1–10)", value: 6 }
      ],
      mece: [
        { id: "value", label: "Does the case create value?", cut: "NPV / IRR vs WACC" },
        { id: "cash", label: "Can cash support the spend?", cut: "Payback and cumulative CF" },
        { id: "margin", label: "Is margin structurally intact?", cut: "EBITDA margin vs price pressure" },
        { id: "risk", label: "What can break the case?", cut: "Sensitivity of NPV to rate and Y1 CF" }
      ],
      run: function (f, math) {
        var rate = n(f.rate, 10) / 100;
        var cf = [-Math.abs(n(f.investment, 0)), n(f.cf1, 0), n(f.cf2, 0), n(f.cf3, 0), n(f.cf4, 0), n(f.cf5, 0)];
        var npv = math.npv(rate, cf);
        var irr = math.irr(cf);
        var pb = math.payback(cf);
        var dpb = math.discountedPayback(rate, cf);
        var pi = math.profitabilityIndex(rate, cf);
        var ebitdaM = n(f.revenue, 1) ? n(f.ebitda, 0) / n(f.revenue, 1) : 0;
        var ebitdaModeled = n(f.ebitda, 0) + n(f.da, 0) * 0.25 + Math.max(0, npv) * 0.15;
        var branches = [
          { id: "value", rating: rag(npv > 0 && irr > rate, npv > -n(f.investment, 1) * 0.1), evidence: "NPV " + Math.round(npv) + ", IRR " + (irr * 100).toFixed(1) + "% vs WACC " + (rate * 100).toFixed(1) + "%" },
          { id: "cash", rating: rag(pb <= 4, pb <= 6), evidence: "Undiscounted payback " + (isFinite(pb) ? pb.toFixed(1) + " yrs" : "beyond horizon") },
          { id: "margin", rating: rag(ebitdaM >= 0.1 && n(f.pricePressure, 0) <= 6, ebitdaM >= 0.06), evidence: "EBITDA margin " + (ebitdaM * 100).toFixed(1) + "%, price pressure " + f.pricePressure },
          { id: "risk", rating: rag(pi >= 1.2, pi >= 1.0), evidence: "Profitability index " + (isFinite(pi) ? pi.toFixed(2) : "—") }
        ];
        return {
          headline: npv >= 0 ? "Capital case is value-accretive at stated WACC." : "Capital case destroys value at stated WACC.",
          metrics: {
            NPV: npv,
            IRR: irr,
            Payback: pb,
            DiscountedPayback: dpb,
            PI: pi,
            EBITDA_margin: ebitdaM,
            EBITDA_modeled: ebitdaModeled
          },
          cashflows: cf,
          rate: rate,
          branches: branches
        };
      }
    },
    operations: {
      id: "operations",
      title: "Operations & Throughput Diagnostic",
      purpose: "Find the constraint, quantify lost throughput, and size the quality/cost leak.",
      fields: [
        { id: "demand", label: "Weekly demand (units)", value: 1200 },
        { id: "constraintCap", label: "Constraint capacity (units/week)", value: 900 },
        { id: "contrib", label: "Contribution margin $/unit", value: 85 },
        { id: "oee", label: "Constraint OEE (%)", value: 62 },
        { id: "scrap", label: "Scrap / rework (%)", value: 7.5 },
        { id: "wip", label: "WIP days", value: 18 },
        { id: "otif", label: "On-time-in-full (%)", value: 81 },
        { id: "changeover", label: "Changeover hours / week", value: 14 },
        { id: "fte", label: "Direct labor FTE", value: 42 },
        { id: "overtimePct", label: "Overtime (%)", value: 16 }
      ],
      mece: [
        { id: "constraint", label: "Where is the bottleneck?", cut: "Demand vs constraint capacity" },
        { id: "loss", label: "How is capacity lost?", cut: "OEE, changeover, scrap" },
        { id: "flow", label: "Is flow stable?", cut: "WIP days, OTIF" },
        { id: "labor", label: "Is labor amplifying the constraint?", cut: "Overtime vs throughput gap" }
      ],
      run: function (f) {
        var gap = Math.max(0, n(f.demand, 0) - n(f.constraintCap, 0));
        var lost = gap * n(f.contrib, 0) * 52;
        var oee = n(f.oee, 0);
        var scrap = n(f.scrap, 0);
        var wip = n(f.wip, 0);
        var otif = n(f.otif, 0);
        var branches = [
          { id: "constraint", rating: rag(gap <= 0, gap < n(f.demand, 1) * 0.1), evidence: "Throughput gap " + gap + " units/week" },
          { id: "loss", rating: rag(oee >= 75 && scrap <= 3, oee >= 60), evidence: "OEE " + oee + "%, scrap " + scrap + "%" },
          { id: "flow", rating: rag(wip <= 8 && otif >= 95, wip <= 14 && otif >= 88), evidence: "WIP " + wip + " days, OTIF " + otif + "%" },
          { id: "labor", rating: rag(n(f.overtimePct, 0) <= 8, n(f.overtimePct, 0) <= 15), evidence: "Overtime " + f.overtimePct + "% with FTE " + f.fte }
        ];
        return {
          headline: gap > 0
            ? "Constraint is binding. Annualized contribution at risk is the first recovery lever."
            : "Capacity covers demand; quality and flow are the remaining leaks.",
          metrics: {
            weeklyGap: gap,
            annualContributionAtRisk: lost,
            oee: oee,
            scrap: scrap,
            wipDays: wip,
            otif: otif
          },
          branches: branches
        };
      }
    },
    capital: {
      id: "capital",
      title: "Capital Projects Diagnostic",
      purpose: "Schedule integrity, cost performance, scope, and risk on a live project.",
      fields: [
        { id: "bac", label: "Budget at completion — BAC ($)", value: 4200000 },
        { id: "ac", label: "Actual cost to date — AC ($)", value: 2150000 },
        { id: "ev", label: "Earned value — EV ($)", value: 1680000 },
        { id: "pv", label: "Planned value — PV ($)", value: 2100000 },
        { id: "duration", label: "Planned duration (months)", value: 14 },
        { id: "elapsed", label: "Elapsed (months)", value: 8 },
        { id: "float", label: "Critical-path float (days)", value: -18 },
        { id: "changeOrders", label: "Approved change orders ($)", value: 310000 },
        { id: "openRisks", label: "Open high risks (count)", value: 6 },
        { id: "spiTarget", label: "SPI target", value: 1 }
      ],
      mece: [
        { id: "schedule", label: "Is the schedule recoverable?", cut: "SPI and critical-path float" },
        { id: "cost", label: "Is cost in control?", cut: "CPI, EAC vs BAC" },
        { id: "scope", label: "Has scope been absorbed?", cut: "Change orders / BAC" },
        { id: "risk", label: "Is residual risk priced?", cut: "Open high risks" }
      ],
      run: function (f) {
        var ev = n(f.ev, 0);
        var ac = n(f.ac, 0);
        var pv = n(f.pv, 1);
        var bac = n(f.bac, 1);
        var cpi = ac ? ev / ac : NaN;
        var spi = pv ? ev / pv : NaN;
        var eac = cpi ? ac + (bac - ev) / cpi : NaN;
        var vac = bac - eac;
        var tcpi = bac - ac ? (bac - ev) / (bac - ac) : NaN;
        var scopeCreep = bac ? n(f.changeOrders, 0) / bac : 0;
        var floatDays = n(f.float, 0);
        var branches = [
          { id: "schedule", rating: rag(spi >= 0.95 && floatDays >= 0, spi >= 0.85), evidence: "SPI " + spi.toFixed(2) + ", float " + floatDays + " days" },
          { id: "cost", rating: rag(cpi >= 0.95, cpi >= 0.85), evidence: "CPI " + cpi.toFixed(2) + ", EAC " + Math.round(eac) },
          { id: "scope", rating: rag(scopeCreep <= 0.05, scopeCreep <= 0.1), evidence: "Change orders " + (scopeCreep * 100).toFixed(1) + "% of BAC" },
          { id: "risk", rating: rag(n(f.openRisks, 0) <= 2, n(f.openRisks, 0) <= 5), evidence: n(f.openRisks, 0) + " open high risks" }
        ];
        return {
          headline: spi < 1 && cpi < 1
            ? "Project is behind and over cost. Recovery must hit both SPI and CPI."
            : "One of schedule or cost is holding; isolate the failing index.",
          metrics: { CPI: cpi, SPI: spi, EAC: eac, VAC: vac, TCPI: tcpi, scopeCreep: scopeCreep },
          branches: branches
        };
      }
    },
    supply: {
      id: "supply",
      title: "Supply Chain & Inventory Diagnostic",
      purpose: "Release trapped working capital without starving service.",
      fields: [
        { id: "cogs", label: "Annual COGS ($)", value: 14000000 },
        { id: "inventory", label: "On-hand inventory ($)", value: 4200000 },
        { id: "doh", label: "Days on hand", value: 96 },
        { id: "fill", label: "Fill rate (%)", value: 91 },
        { id: "forecastMAPE", label: "Forecast MAPE (%)", value: 28 },
        { id: "suppliers", label: "Active suppliers", value: 86 },
        { id: "singleSource", label: "Single-source SKUs (%)", value: 34 },
        { id: "tariffExposure", label: "Import value in tariff-sensitive HS ($)", value: 2100000 },
        { id: "leadTime", label: "Avg supplier lead time (days)", value: 52 },
        { id: "otifIn", label: "Inbound OTIF (%)", value: 78 }
      ],
      mece: [
        { id: "stock", label: "Is inventory the right size?", cut: "DOH vs fill rate" },
        { id: "signal", label: "Is the demand signal usable?", cut: "MAPE" },
        { id: "supply", label: "Is supply resilient?", cut: "Single-source, inbound OTIF, lead time" },
        { id: "trade", label: "Is trade policy a P&L risk?", cut: "Tariff-exposed import value" }
      ],
      run: function (f) {
        var turns = n(f.inventory, 1) ? n(f.cogs, 0) / n(f.inventory, 1) : 0;
        var doh = n(f.doh, 0);
        var fill = n(f.fill, 0);
        var mape = n(f.forecastMAPE, 0);
        var trapped = Math.max(0, (doh - 45) / 365) * n(f.cogs, 0);
        var branches = [
          { id: "stock", rating: rag(doh <= 50 && fill >= 97, doh <= 70 && fill >= 93), evidence: "DOH " + doh + ", fill " + fill + "%, turns " + turns.toFixed(2) },
          { id: "signal", rating: rag(mape <= 12, mape <= 20), evidence: "MAPE " + mape + "%" },
          { id: "supply", rating: rag(n(f.singleSource, 0) <= 15 && n(f.otifIn, 0) >= 92, n(f.singleSource, 0) <= 25), evidence: "Single-source " + f.singleSource + "%, inbound OTIF " + f.otifIn + "%" },
          { id: "trade", rating: rag(n(f.tariffExposure, 0) / n(f.cogs, 1) <= 0.08, n(f.tariffExposure, 0) / n(f.cogs, 1) <= 0.2), evidence: "Tariff-sensitive imports $" + Number(f.tariffExposure).toLocaleString() }
        ];
        return {
          headline: trapped > 0
            ? "Working capital is trapped above a 45-day operating target."
            : "Inventory position is tight; protect fill rate before cutting stock.",
          metrics: {
            turns: turns,
            daysOnHand: doh,
            fillRate: fill,
            mape: mape,
            trappedCapital: trapped
          },
          branches: branches
        };
      }
    }
  };

  function fieldsToObject(kit, form) {
    var o = {};
    kit.fields.forEach(function (field) {
      var el = form.querySelector("[name='" + field.id + "']");
      o[field.id] = el ? el.value : field.value;
    });
    return o;
  }

  global.ISI = global.ISI || {};
  global.ISI.kits = KITS;
})(typeof window !== "undefined" ? window : this);
