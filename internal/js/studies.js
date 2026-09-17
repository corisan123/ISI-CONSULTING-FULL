/**
 * ISI Consulting — study types
 * A "study" is the engagement. Type reconfigures workstreams, MECE, methods, and proof.
 */
(function (global) {
  "use strict";

  var AGILE12 = [
    { id: "a1", label: "Early working increment", test: "The 90-day packet is a usable fact-base, not a slide deck promise." },
    { id: "a2", label: "Change is allowed", test: "Stage-gates exist so the thesis can be recast when diligence or diagnosis kills a story." },
    { id: "a3", label: "Frequent delivery", test: "Each workstream has a weekly output, not a big-bang report." },
    { id: "a4", label: "Business with the team", test: "A named client owner sits on every mission-critical workstream." },
    { id: "a5", label: "Owners, not committees", test: "Every swim lane has one owner. Dual ownership is a defect." },
    { id: "a6", label: "Working session over theater", test: "Decisions are made on the live model in the room." },
    { id: "a7", label: "Working model over slides", test: "NPV, EV, SPC, or throughput is computed, not asserted." },
    { id: "a8", label: "Sustainable pace", test: "Utilization and leadership bandwidth are measured; firefighting is named as a constraint." },
    { id: "a9", label: "Technical excellence", test: "Formulas, sanity checks, and sensitivity sit behind every recommendation." },
    { id: "a10", label: "Simplicity", test: "Few levers. MECE first-level buckets stay at four or fewer." },
    { id: "a11", label: "Decision rights", test: "Who can say yes/no is written. Optics are not a substitute." },
    { id: "a12", label: "Retrospective / kaizen", test: "The study itself has a waste review: what did not change a decision gets cut." }
  ];

  var TYPES = {
    commercial: {
      id: "commercial",
      label: "Commercial / growth study",
      question: "Why is profitable growth stalled — and which lever actually moves it?",
      diligenceSit: "commercial",
      scenarioModel: "bid",
      methods: ["scrum", "agile", "mece"],
      workstreams: [
        { id: "ws-diag", name: "Diagnostic fact-base", swimlane: "ISI", owner: "Engagement lead", method: "MECE + root cause" },
        { id: "ws-comm", name: "Win rate & pipeline quality", swimlane: "Client BD", owner: "BD owner", method: "Conversion math" },
        { id: "ws-price", name: "Price, mix, discount leakage", swimlane: "Client Finance", owner: "CFO / controller", method: "Margin bridge" },
        { id: "ws-cap", name: "Delivery can absorb won work", swimlane: "Client Ops", owner: "Ops lead", method: "Throughput" }
      ],
      mece: {
        question: "Why is profitable growth stalled?",
        branches: [
          { name: "Demand creation", children: ["Pipeline quality", "Win rate", "Cycle time"] },
          { name: "Offer & price", children: ["Mix", "Discount leakage", "Cost-to-serve"] },
          { name: "Delivery capacity", children: ["Throughput", "Lead time", "Quality escapes"] },
          { name: "Leadership system", children: ["Cadence", "Decision rights", "Accountability"] }
        ],
        mistakes: ["Do not split sales and revenue — they overlap.", "Do not stop at win rate without a testable cause."]
      },
      poc: [
        { id: "qualify", label: "Qualification gate exists and is used", pass: "Win rate and cycle time both move in a 30-day sample." },
        { id: "price", label: "Discounting is visible by job", pass: "Contribution recovered on a named bid class." }
      ]
    },
    financial: {
      id: "financial",
      label: "Financial / cash / turnaround study",
      question: "What is consuming cash and profit — and in what order should it be stopped?",
      diligenceSit: "turnaround",
      scenarioModel: "cash",
      methods: ["diligence", "scenarios", "agile"],
      workstreams: [
        { id: "ws-dd", name: "Financial due diligence", swimlane: "ISI", owner: "Engagement lead", method: "Liquidity, DSCR, QoE" },
        { id: "ws-wc", name: "Working-capital recovery", swimlane: "Client Finance", owner: "Controller", method: "CCC, DSO, DIO" },
        { id: "ws-earn", name: "Earnings quality", swimlane: "Client Finance", owner: "CFO", method: "QoE bridge" },
        { id: "ws-gov", name: "Cash cadence", swimlane: "Client Leadership", owner: "CEO", method: "13-week cash" }
      ],
      mece: {
        question: "Where did the cash and earnings go?",
        branches: [
          { name: "Liquidity", children: ["Current / quick", "FCF", "13-week cash"] },
          { name: "Cycle", children: ["DSO", "DIO", "DPO"] },
          { name: "Earnings quality", children: ["Add-backs", "One-time", "Margin structure"] },
          { name: "Claims on cash", children: ["Debt service", "Capex", "Distributions"] }
        ],
        mistakes: ["Revenue decline is not a cash diagnosis.", "Do not treat EBITDA as cash."]
      },
      poc: [
        { id: "gate", label: "Hard gates run before any growth thesis", pass: "STOP/CAUTION/GO is documented with formulas." },
        { id: "cash", label: "One cash action with a measured delta", pass: "DSO or trapped inventory moves in a defined window." }
      ]
    },
    capex: {
      id: "capex",
      label: "CAPEX / investment study",
      question: "Does this spend create value after WACC, risk, and the next-best use of cash?",
      diligenceSit: "capital",
      scenarioModel: "npv",
      methods: ["scenarios", "sensitivity", "mece"],
      workstreams: [
        { id: "ws-case", name: "Base investment case", swimlane: "ISI", owner: "Engagement lead", method: "NPV / IRR / PI" },
        { id: "ws-sens", name: "What-if & sensitivity", swimlane: "ISI", owner: "Analyst", method: "Tornado + 2-way + Monte Carlo" },
        { id: "ws-ops", name: "Operating dependency", swimlane: "Client Ops", owner: "Plant / PM", method: "Constraint check" },
        { id: "ws-dec", name: "Decision rights", swimlane: "Client C-suite", owner: "CFO / CEO", method: "Matrix + buy-in" }
      ],
      mece: {
        question: "Does this capital create value after cost of capital and risk?",
        branches: [
          { name: "Value", children: ["NPV", "IRR vs WACC", "PI"] },
          { name: "Cash timing", children: ["Payback", "Cumulative CF", "Working capital"] },
          { name: "Margin structure", children: ["Price", "Volume", "Cost"] },
          { name: "Risk", children: ["Sensitivity", "Monte Carlo tail", "Operational dependency"] }
        ],
        mistakes: ["Strategic fit is not a substitute for NPV.", "Do not double-count D&A in EBITDA and cash."]
      },
      poc: [
        { id: "npv", label: "Base, upside, downside, stress all computed", pass: "Sign of NPV is stable or the kill condition is named." },
        { id: "dep", label: "Non-constraint spend is identified", pass: "If utilization ≥ 90% at the constraint, non-constraint capex is deferred." }
      ]
    },
    manufacturing: {
      id: "manufacturing",
      label: "Manufacturing / throughput study",
      question: "What is the constraint, and will exploit beat buying another cell?",
      diligenceSit: "throughput",
      scenarioModel: "throughput",
      methods: ["kaizen", "toc", "scrum"],
      workstreams: [
        { id: "ws-con", name: "Constraint identity", swimlane: "ISI", owner: "Engagement lead", method: "Demand vs capacity" },
        { id: "ws-exp", name: "Exploit & subordinate", swimlane: "Client Ops", owner: "Supervisor", method: "Kaizen / OEE" },
        { id: "ws-t", name: "Throughput accounting", swimlane: "Client Finance", owner: "Controller", method: "T, I, OE" },
        { id: "ws-capex", name: "Elevate only if needed", swimlane: "Client C-suite", owner: "COO", method: "NPV of cell vs exploit" }
      ],
      mece: {
        question: "What limits throughput and where is the leak?",
        branches: [
          { name: "Constraint identity", children: ["Demand vs capacity", "Bottleneck resource"] },
          { name: "Capacity loss", children: ["OEE", "Changeover", "Scrap"] },
          { name: "Flow", children: ["WIP", "OTIF", "Queue"] },
          { name: "Policy", children: ["Local efficiency", "Batch rules", "Incentive"] }
        ],
        mistakes: ["Improving a non-constraint does not raise T.", "OEE and scrap can double-count the same lost hour."]
      },
      poc: [
        { id: "id", label: "Constraint named and agreed", pass: "One resource, one utilization number, one lost-T dollar." },
        { id: "exploit", label: "Exploit before capex", pass: "A kaizen delta on T is quantified before a cell is purchased." }
      ]
    },
    quality: {
      id: "quality",
      label: "Quality / yield / process study",
      question: "Is the loss special-cause or common-cause, and what is the cost of poor quality?",
      diligenceSit: "throughput",
      scenarioModel: "quality",
      methods: ["dmaic", "spc", "kaizen"],
      workstreams: [
        { id: "ws-d", name: "Define the defect and the customer hit", swimlane: "ISI", owner: "Engagement lead", method: "DMAIC Define" },
        { id: "ws-m", name: "Measure: SPC and yield", swimlane: "Client Quality", owner: "Quality lead", method: "Control limits, DPMO" },
        { id: "ws-a", name: "Analyze: special vs common cause", swimlane: "ISI", owner: "Analyst", method: "MECE + Pareto" },
        { id: "ws-i", name: "Improve & control", swimlane: "Client Ops", owner: "Supervisor", method: "Kaizen + control plan" }
      ],
      mece: {
        question: "Where is quality loss created, and is the process in control?",
        branches: [
          { name: "Incoming", children: ["Supplier defects", "Spec mismatch"] },
          { name: "Process", children: ["Special cause", "Common cause", "Setup"] },
          { name: "Detection", children: ["Inspection lag", "False accept"] },
          { name: "Cost", children: ["Scrap", "Rework", "Escape / warranty"] }
        ],
        mistakes: ["Averages hide special cause. Plot the points.", "Rework and scrap can overlap — keep money on one branch."]
      },
      poc: [
        { id: "spc", label: "Process plotted with limits", pass: "In-control or special-cause points named." },
        { id: "copq", label: "Cost of poor quality in dollars", pass: "Scrap + rework + escape ≥ a decision threshold or the work stops." }
      ]
    },
    project: {
      id: "project",
      label: "Capital project / schedule study",
      question: "Is the live project recoverable on schedule, cost, and scope?",
      diligenceSit: "capital",
      scenarioModel: "evm",
      methods: ["scrum", "risk", "mece"],
      workstreams: [
        { id: "ws-evm", name: "Earned value", swimlane: "ISI", owner: "Engagement lead", method: "CPI, SPI, EAC" },
        { id: "ws-path", name: "Critical path & float", swimlane: "Client PM", owner: "Project manager", method: "Schedule" },
        { id: "ws-co", name: "Change-order load", swimlane: "Client PM", owner: "PM / owner", method: "Scope" },
        { id: "ws-risk", name: "Risk EMV", swimlane: "ISI", owner: "Analyst", method: "Register" }
      ],
      mece: {
        question: "Is the project recoverable on schedule, cost, and scope?",
        branches: [
          { name: "Schedule", children: ["SPI", "Float", "Critical path"] },
          { name: "Cost", children: ["CPI", "EAC", "TCPI"] },
          { name: "Scope", children: ["Change orders", "WBS completeness"] },
          { name: "Risk & quality", children: ["Open high risks", "Rework", "Commissioning"] }
        ],
        mistakes: ["SPI is not percent-complete.", "Do not hide contingency inside BAC."]
      },
      poc: [
        { id: "eac", label: "EAC vs budget is on the table", pass: "Leadership sees the dollar gap, not a Gantt color." },
        { id: "float", label: "Critical path named", pass: "One recovery action tied to float, not a status meeting." }
      ]
    }
  };

  var KAIZEN_WASTES = [
    { id: "transport", label: "Transport", hint: "Moving work that does not change T." },
    { id: "inventory", label: "Inventory", hint: "WIP and stock above the 45-day target." },
    { id: "motion", label: "Motion", hint: "Walking, hunting, re-handling at the constraint." },
    { id: "waiting", label: "Waiting", hint: "Queue in front of the constraint or a signature." },
    { id: "overproduction", label: "Overproduction", hint: "Making what the next resource cannot take." },
    { id: "overprocessing", label: "Over-processing", hint: "Quality the customer does not pay for." },
    { id: "defects", label: "Defects", hint: "Scrap, rework, escapes — cost of poor quality." }
  ];

  function spawn(typeId, company) {
    var t = TYPES[typeId] || TYPES.commercial;
    return {
      type: t.id,
      label: t.label,
      question: t.question,
      company: company || "Client",
      workstreams: t.workstreams.map(function (w) {
        return Object.assign({ status: "ready", dod: "Evidence in the packet, not a status color." }, w);
      }),
      mece: t.mece,
      methods: t.methods,
      poc: t.poc,
      diligenceSit: t.diligenceSit,
      scenarioModel: t.scenarioModel,
      agile: AGILE12
    };
  }

  function auditMece(tree) {
    var names = {};
    var overlap = [];
    tree.branches.forEach(function (b) {
      b.children.forEach(function (c) {
        var k = c.toLowerCase();
        if (names[k]) overlap.push(c + " appears under " + names[k] + " and " + b.name);
        names[k] = b.name;
      });
    });
    return {
      firstLevel: tree.branches.length,
      exhaustiveNote: tree.branches.length > 5 ? "First level is getting wide — split a study, do not add a sixth bucket." : "First level is tight.",
      overlap: overlap,
      mistakes: tree.mistakes
    };
  }

  global.ISI = global.ISI || {};
  global.ISI.studies = {
    TYPES: TYPES,
    AGILE12: AGILE12,
    KAIZEN_WASTES: KAIZEN_WASTES,
    spawn: spawn,
    auditMece: auditMece
  };
})(typeof window !== "undefined" ? window : this);
