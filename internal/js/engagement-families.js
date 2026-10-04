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
      entryHref: "/internal/commercial-engine.html",
      entryLabel: "Engine 1 — commercial / tollgate bus (proprietary)",
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
      summaryKeys: [
        "engine1-intake",
        "rootcause",
        "engine1-pipeline",
        "interventions",
        "diligence",
        "tree-bid",
        "sensitivity-1way",
        "montecarlo",
        "engine1-tollgate",
        "matrix",
        "engine1-summary"
      ]
    },
    financial: {
      id: "financial",
      label: "Corporate turnaround / financial expansion",
      clientIntake: "/website/forms/intake-financial.html",
      studyType: "financial",
      entryHref: "/internal/financial-engine.html",
      entryLabel: "Engine 2 — financial & capital bus (proprietary)",
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
      summaryKeys: [
        "engine2-intake",
        "diligence",
        "engine2-wacc",
        "engine2-capex",
        "engine2-depreciation",
        "engine2-margin-kit",
        "engine2-npv-stack",
        "sensitivity-1way",
        "montecarlo",
        "matrix",
        "engine2-summary"
      ]
    },
    operations: {
      id: "operations",
      label: "Manufacturing / operational alignment",
      clientIntake: "/website/forms/intake-operations.html",
      studyType: "manufacturing",
      entryHref: "/internal/operations-engine.html",
      entryLabel: "Engine 3 — operations & throughput bus (proprietary)",
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
      summaryKeys: [
        "engine3-intake",
        "rootcause",
        "engine3-pipeline",
        "operations",
        "diligence",
        "roi-throughput",
        "engine3-capex-gate",
        "sensitivity-1way",
        "montecarlo",
        "matrix",
        "engine3-summary"
      ]
    },
    venture: {
      id: "venture",
      label: "Startup business plan / venture sequence",
      clientIntake: "/website/forms/intake-venture.html",
      studyType: "startup",
      entryHref: "/internal/venture-engine.html",
      entryLabel: "Engine 4 — venture sequence bus (proprietary)",
      pipelineSteps: [
        "intake",
        "diligence",
        "unit-econ",
        "runway",
        "kill-gate",
        "tornado",
        "montecarlo",
        "matrix",
        "packet"
      ],
      kits: [],
      orchestratorEngines: ["expansion"],
      summaryKeys: [
        "engine4-intake",
        "engine4-sequence-integrity",
        "diligence",
        "engine4-unit-econ",
        "engine4-runway",
        "engine4-kill",
        "sensitivity-1way",
        "montecarlo",
        "matrix",
        "engine4-summary"
      ]
    },
    coaching: {
      id: "coaching",
      label: "Leadership alignment / coaching",
      clientIntake: "/website/forms/intake-coaching.html",
      studyType: "coaching",
      entryHref: "/internal/project-engine.html?path=coaching",
      entryLabel: "Engine 5 — coaching scorecard (no NPV chain)",
      pipelineSteps: ["intake", "diagnosis", "interventions", "packet"],
      kits: [],
      orchestratorEngines: ["alignment"],
      summaryKeys: [
        "engine5-intake",
        "engine5-coaching-readiness",
        "rootcause",
        "engine5-coaching-score",
        "interventions",
        "engine5-coaching-matrix",
        "engine5-summary"
      ]
    },
    project: {
      id: "project",
      label: "Project management consulting / EVM recovery",
      clientIntake: "/website/forms/intake-project.html",
      studyType: "project",
      entryHref: "/internal/project-engine.html",
      entryLabel: "Engine 5 — project / EVM bus (proprietary)",
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
      summaryKeys: [
        "engine5-intake",
        "engine5-change-integrity",
        "rootcause",
        "diligence",
        "engine5-evm-kit",
        "engine5-risk",
        "sensitivity-1way",
        "montecarlo",
        "matrix",
        "engine5-summary"
      ]
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
    if (eng && eng.bus && eng.bus.activeEngine) {
      var fromEngine = {
        "commercial-tollgate": "commercial",
        "financial-capital": "financial",
        "operations-throughput": "operations",
        "venture-sequence": "venture",
        "project-program": "project"
      }[eng.bus.activeEngine];
      if (fromEngine && FAMILIES[fromEngine]) return fromEngine;
    }
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
