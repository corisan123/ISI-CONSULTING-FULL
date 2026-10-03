/**
 * ISI Consulting — client engagement families (matches /website/forms intake groups).
 * Each family gets its own study type, tool chain, and entry URL — not one generic pipeline.
 */
(function (global) {
  "use strict";

  var FAMILIES = {
    commercial: {
      id: "commercial",
      label: "Fractional Business Development / commercial",
      clientIntake: "/website/forms/intake-commercial.html",
      studyType: "commercial",
      entryHref: "/internal/diagnostic/input.html",
      entryLabel: "Commercial diagnostic input (growth spine)",
      pipelineSteps: [
        "intake",
        "diagnosis",
        "diligence",
        "tree",
        "tornado",
        "interventions",
        "matrix",
        "packet"
      ],
      kits: ["growth"],
      orchestratorEngines: ["growth", "alignment"],
      summaryKeys: ["rootcause", "diligence", "tree-bid", "matrix", "interventions"]
    },
    financial: {
      id: "financial",
      label: "Corporate turnaround / financial expansion",
      clientIntake: "/website/forms/intake-financial.html",
      studyType: "financial",
      entryHref: "/internal/diagnostics/diligence.html",
      entryLabel: "Financial due diligence (start here)",
      pipelineSteps: [
        "intake",
        "diligence",
        "diagnosis",
        "margin-kit",
        "finance-tool",
        "tree",
        "tornado",
        "twoway",
        "montecarlo",
        "matrix",
        "packet"
      ],
      kits: ["margin"],
      orchestratorEngines: ["expansion", "growth"],
      summaryKeys: ["diligence", "margin", "finance", "montecarlo", "matrix"]
    },
    operations: {
      id: "operations",
      label: "Manufacturing / operational alignment",
      clientIntake: "/website/forms/intake-operations.html",
      studyType: "manufacturing",
      entryHref: "/internal/diagnostics/operations.html",
      entryLabel: "Throughput & constraint kit",
      pipelineSteps: [
        "intake",
        "diagnosis",
        "operations-kit",
        "roi-throughput",
        "diligence",
        "matrix",
        "packet"
      ],
      kits: ["operations"],
      orchestratorEngines: ["alignment"],
      summaryKeys: ["rootcause", "operations", "roi-throughput", "diligence"]
    },
    venture: {
      id: "venture",
      label: "Startup business plan / venture sequence",
      clientIntake: "/website/forms/intake-venture.html",
      studyType: "startup",
      entryHref: "/internal/diagnostics/diligence.html",
      entryLabel: "Venture diligence gate (no growth theater)",
      pipelineSteps: [
        "intake",
        "diligence",
        "margin-kit",
        "diagnosis",
        "interventions",
        "packet"
      ],
      kits: ["margin"],
      orchestratorEngines: ["expansion"],
      summaryKeys: ["diligence", "margin", "rootcause", "interventions"]
    },
    coaching: {
      id: "coaching",
      label: "Leadership alignment / coaching",
      clientIntake: "/website/forms/intake-coaching.html",
      studyType: "coaching",
      entryHref: "/internal/study.html",
      entryLabel: "Cadence study setup (no NPV chain)",
      pipelineSteps: ["intake", "diagnosis", "interventions", "packet"],
      kits: [],
      orchestratorEngines: ["alignment"],
      summaryKeys: ["rootcause", "interventions"]
    },
    project: {
      id: "project",
      label: "Project management consulting / EVM recovery",
      clientIntake: "/website/forms/intake-project.html",
      studyType: "project",
      entryHref: "/internal/diagnostics/capital.html",
      entryLabel: "Capital project / EVM kit",
      pipelineSteps: [
        "intake",
        "capital-kit",
        "diagnosis",
        "risk-tool",
        "matrix",
        "packet"
      ],
      kits: ["capital"],
      orchestratorEngines: [],
      summaryKeys: ["capital", "risk", "matrix"]
    }
  };

  function resolveId(id) {
    if (id && FAMILIES[id]) return id;
    try {
      var fromClient = sessionStorage.getItem("isi_active_engagement_group");
      if (fromClient && FAMILIES[fromClient]) return fromClient;
      var stored = sessionStorage.getItem("isi_engagement_family");
      if (stored && FAMILIES[stored]) return stored;
    } catch (e) { /* ignore */ }
    var eng = global.ISI && global.ISI.store && global.ISI.store.read();
    if (eng && eng.engagement && FAMILIES[eng.engagement.family]) return eng.engagement.family;
    return "commercial";
  }

  function get(id) {
    return FAMILIES[resolveId(id)];
  }

  function setActive(id) {
    if (!FAMILIES[id]) return null;
    try {
      sessionStorage.setItem("isi_engagement_family", id);
      sessionStorage.setItem("isi_active_engagement_group", id);
    } catch (e) { /* ignore */ }
    if (global.ISI && global.ISI.store) {
      global.ISI.store.setEngagement({ family: id, constraint: id });
    }
    return FAMILIES[id];
  }

  function list() {
    return Object.keys(FAMILIES).map(function (k) {
      return FAMILIES[k];
    });
  }

  global.ISI = global.ISI || {};
  global.ISI.engagementFamilies = {
    FAMILIES: FAMILIES,
    get: get,
    setActive: setActive,
    resolveId: resolveId,
    list: list
  };
})(typeof window !== "undefined" ? window : this);
