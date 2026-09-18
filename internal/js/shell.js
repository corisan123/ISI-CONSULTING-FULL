/**
 * ISI Consulting — internal practice shell
 * Sticky header + hover mega-menu (table of contents).
 */
(function (global) {
  "use strict";

  var TOC = [
    {
      id: "train",
      label: "Training",
      href: "/internal/training.html",
      items: [
        { href: "/internal/training.html", label: "How to use (no file corruption)", hint: "Browser access, grouped vs a la carte" },
        { href: "/internal/engines.html", label: "Engine analytics", hint: "Last run of each diagnostic + tracking log" },
        { href: "/internal/file.html", label: "Complete file", hint: "Inputs, throughputs, actions, backup" },
        { href: "/client/resolution.html", label: "Room dashboard", hint: "What leadership sees" }
      ]
    },
    {
      id: "programs",
      label: "Programs",
      href: "/internal/programs.html",
      items: [
        { href: "/internal/programs.html", label: "Constraint catalog", hint: "Kits grouped by family" },
        { href: "/internal/intake.html", label: "Niche delivery intake", hint: "Study type + proof, not a generic form" },
        { href: "/internal/toolbox.html", label: "A la carte toolbox", hint: "One box, one formula or program" },
        { href: "/internal/study.html", label: "Study types", hint: "Workstreams by type" }
      ]
    },
    {
      id: "toolbox",
      label: "A la carte",
      href: "/internal/toolbox.html",
      items: [
        { href: "/internal/toolbox.html", label: "Toolbox home", hint: "Filter by family, run a single box" },
        { href: "/internal/tools/finance.html", label: "NPV / IRR / WACC", hint: "Full financial engine" },
        { href: "/internal/tools/regression.html", label: "Regression", hint: "OLS modeling" },
        { href: "/internal/tools/mece.html", label: "MECE", hint: "Issue trees" },
        { href: "/internal/tools/matrix.html", label: "Decision matrix", hint: "Weighted score" },
        { href: "/internal/tools/pivot.html", label: "Excel XML / CSV", hint: "Export transforms" }
      ]
    },
    {
      id: "home",
      label: "Bench",
      href: "/internal/index.html",
      items: [
        { href: "/internal/study.html", label: "Study setup", hint: "Type → workstreams, swim lanes, methods, proof" },
        { href: "/internal/pipeline.html", label: "Wired chain (10 programs)", hint: "One run populates diagnosis through packet" },
        { href: "/internal/index.html", label: "Practice home", hint: "TOC, live session, activate tools" },
        { href: "/internal/results.html", label: "Engagement results", hint: "Symptom vs proven cause vs financial gates" },
        { href: "/internal/index.html#dashboard", label: "Practice rollup", hint: "Last tool outputs" },
        { href: "/internal/index.html#session", label: "Engagement session", hint: "Company + constraint" },
        { href: "/client/resolution.html", label: "Client resolution dashboard", hint: "KPIs, unique constraints, 90-day load" }
      ]
    },
    {
      id: "diag",
      label: "Diagnostics",
      href: "/internal/index.html#diagnostics",
      items: [
        { href: "/internal/diagnostics/rootcause.html", label: "Structured diagnosis", hint: "Stated symptoms vs competing causes — keep or kill" },
        { href: "/internal/diagnostics/diligence.html", label: "0. Financial due diligence", hint: "First when money is involved — live ratios, QoE, NPV" },
        { href: "/diagnostic/input.html", label: "1. Growth & Turnaround", hint: "Live engine — revenue, margin, BD" },
        { href: "/internal/diagnostics/margin.html", label: "2. Margin & Capital", hint: "NPV, IRR, CAPEX, EBITDA" },
        { href: "/internal/diagnostics/operations.html", label: "3. Operations & Throughput", hint: "Constraint, SPC, OEE" },
        { href: "/internal/diagnostics/capital.html", label: "4. Capital Projects", hint: "Schedule, WBS, cost, risk" },
        { href: "/internal/diagnostics/supply.html", label: "5. Supply Chain & Inventory", hint: "Forecast, stock, tariff shock" }
      ]
    },
    {
      id: "tools",
      label: "Tools",
      href: "/internal/tools/finance.html",
      items: [
        { href: "/internal/tools/finance.html", label: "Financial engine", hint: "NPV, PV, IRR, CAPEX, WACC" },
        { href: "/internal/tools/roi-throughput.html", label: "Throughput ROI", hint: "T, I, OE — exploit vs buy a cell" },
        { href: "/internal/tools/sensitivity.html", label: "Sensitivity (1-way / 2-way)", hint: "Tornado + bid×develop EV grid" },
        { href: "/internal/tools/matrix.html", label: "Decision matrix", hint: "Weighted alternatives from the tree" },
        { href: "/internal/tools/scenarios.html", label: "Scenarios & feasibility", hint: "Base / up / down / stress + PoC gates" },
        { href: "/internal/tools/pivot.html", label: "Pivot & Excel transform", hint: "Group large tables, export CSV / Excel XML" },
        { href: "/internal/tools/risk.html", label: "Risk register", hint: "Probability × impact, EMV" },
        { href: "/internal/tools/kpis.html", label: "KPI library", hint: "Activate measures by constraint" },
        { href: "/internal/tools/stats.html", label: "Statistics bench", hint: "Internal — 15+ procedures" },
        { href: "/internal/tools/regression.html", label: "Regression modeling", hint: "OLS, R², LINEST equivalent" }
      ]
    },
    {
      id: "plan",
      label: "Planning",
      href: "/internal/tools/roadmap.html",
      items: [
        { href: "/internal/tools/roadmap.html", label: "Roadmap studio", hint: "Timeline, grid, swimlane, kanban" },
        { href: "/internal/tools/ppm.html", label: "Portfolio (PPM)", hint: "Trade-offs, capacity, risk" },
        { href: "/internal/tools/supply-chain.html", label: "Supply chain map", hint: "Flow, inventory, disruption" }
      ]
    },
    {
      id: "structure",
      label: "Structure",
      href: "/internal/tools/mece.html",
      items: [
        { href: "/internal/tools/mece.html", label: "MECE issue trees", hint: "Type-specific, then depth" },
        { href: "/internal/packet.html", label: "Study 1-pager", hint: "Executive summary from the bus" },
        { href: "/client/index.html", label: "Client-visible logic", hint: "Board-ready tree and formulas" },
        { href: "/internal/pipeline.html", label: "Wired chain", hint: "Ten programs, one bus" },
        { href: "/internal/tools/trees.html", label: "Decision tree studio", hint: "Five types with live analytics" },
        { href: "/internal/tools/interventions.html", label: "Intervention activation", hint: "Modules fire from intake" },
        { href: "/diagnostic/decisionTree.html", label: "Growth decision tree", hint: "Existing live tree" }
      ]
    },
    {
      id: "docs",
      label: "Documents",
      href: "/internal/documents/nda.html",
      items: [
        { href: "/website/forms/client-intake.html", label: "Client intake", hint: "Public form — stored locally" },
        { href: "/website/forms/discovery.html", label: "Discovery questionnaire", hint: "Metrics into diagnostic" },
        { href: "/internal/documents/nda.html", label: "NDA generator", hint: "Fill names, print template" },
        { href: "/internal/documents/exclusivity.html", label: "Exclusivity letter", hint: "Placeholder terms" },
        { href: "/internal/documents/sow.html", label: "Statement of Work", hint: "Scope skeleton" }
      ]
    },
    {
      id: "summary",
      label: "Summary",
      href: "/internal/index.html#dashboard",
      items: [
        { href: "/internal/index.html#dashboard", label: "Practice dashboard", hint: "Last tool outputs" },
        { href: "/internal/engines.html", label: "Engine tracking", hint: "Last run of each tool + session log" },
        { href: "/internal/results.html", label: "Engagement results", hint: "Board-ready: stated vs proven vs killed" },
        { href: "/diagnostic/summary.html", label: "Growth diagnostic summary", hint: "Existing last tab" },
        { href: "/diagnostic/dashboard.html", label: "Growth diagnostic dashboard", hint: "Existing engine dashboard" }
      ]
    }
  ];

  function currentPath() {
    return (location.pathname || "").replace(/\/$/, "") || "/internal/index.html";
  }

  function renderShell(activeId) {
    var header = document.createElement("header");
    header.className = "pr-header";
    header.innerHTML =
      '<a class="pr-brand" href="/internal/index.html">ISI <span>Practice Bench</span></a>' +
      '<span class="pr-tag">Internal · not indexed · placeholders until consultation</span>' +
      '<div class="pr-header-right"><a href="/client/index.html">Client view</a> · <a href="/website/index.html">Public site</a> · <a href="/internal/diagnostics/diligence.html">Due diligence</a></div>';

    var nav = document.createElement("nav");
    nav.className = "pr-mega";
    nav.setAttribute("aria-label", "Practice table of contents");
    var ul = document.createElement("ul");
    ul.className = "pr-mega-bar";
    TOC.forEach(function (group) {
      var li = document.createElement("li");
      li.className = "pr-mega-item" + (group.id === activeId ? " is-current" : "");
      var top = document.createElement("a");
      top.href = group.href;
      top.textContent = group.label;
      li.appendChild(top);
      var drop = document.createElement("div");
      drop.className = "pr-drop";
      group.items.forEach(function (item) {
        var a = document.createElement("a");
        a.href = item.href;
        a.innerHTML = item.label + (item.hint ? '<span class="hint">' + item.hint + "</span>" : "");
        drop.appendChild(a);
      });
      li.appendChild(drop);
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    document.body.classList.add("practice");
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);
  }

  function money(n) {
    if (!isFinite(n)) return "—";
    var abs = Math.abs(n);
    var sign = n < 0 ? "-" : "";
    if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return sign + "$" + (abs / 1e3).toFixed(1) + "K";
    return sign + "$" + Math.round(abs).toLocaleString("en-US");
  }

  function pct(n) {
    if (!isFinite(n)) return "—";
    return (n * 100).toFixed(1) + "%";
  }

  function pctPts(n) {
    if (!isFinite(n)) return "—";
    return n.toFixed(1) + "%";
  }

  global.ISI = global.ISI || {};
  global.ISI.shell = {
    TOC: TOC,
    render: renderShell,
    money: money,
    pct: pct,
    pctPts: pctPts,
    path: currentPath
  };
})(typeof window !== "undefined" ? window : this);
