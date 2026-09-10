/**
 * ISI Consulting — engine orchestrator (Phase 5A)
 * Decision-tree control: detect domains, activate engines, merge outputs.
 */
(function (global) {
  "use strict";

  var CONTROL_URL = "/src/data/decisionControl.json";
  var controlCache = null;

  function kit() {
    return global.ISI && global.ISI.kit;
  }

  function isRY(rating) {
    return rating === "Red" || rating === "Yellow";
  }

  function fire(map, engine, domain, reason, branch) {
    if (!map[engine]) map[engine] = { reasons: [], domains: [] };
    if (map[engine].domains.indexOf(domain) === -1) map[engine].domains.push(domain);
    map[engine].reasons.push({
      domain: domain,
      reason: reason,
      branch: branch || "quantitative"
    });
  }

  function dash(v, suffix) {
    if (v == null || v === "" || (typeof v === "number" && isNaN(v))) return "—";
    return String(v) + (suffix || "");
  }

  /**
   * Every test in the live tree. detect() and the SVG walk the same catalog
   * so the drawing cannot drift from the control system.
   */
  var TREE_TESTS = [
    {
      id: "win_rate",
      branch: "quantitative",
      label: "Revenue engine / win rate",
      question: "Is the revenue engine failing to carry share?",
      engine: "growth",
      domain: "market_share_loss",
      reason: "Win rate / revenue engine is not carrying share.",
      eval: function (input, r) {
        var fired = isRY(r.revenue) || Number(input.closeRate) < 30;
        return {
          fired: fired,
          evidence:
            "Revenue " +
            dash(r.revenue) +
            ", close rate " +
            dash(input.closeRate, "%") +
            ". Fires on Red/Yellow or close rate < 30%."
        };
      }
    },
    {
      id: "concentration",
      branch: "quantitative",
      label: "Client concentration",
      question: "Does account mix create retention risk?",
      engine: "growth",
      domain: "client_churn_concentration",
      reason: "Account concentration creates retention and mix risk.",
      eval: function (input) {
        var fired = Number(input.customerConcentration) >= 40;
        return {
          fired: fired,
          evidence:
            "Top-account concentration " +
            dash(input.customerConcentration, "%") +
            ". Fires at ≥ 40%."
        };
      }
    },
    {
      id: "pricing_pressure",
      branch: "quantitative",
      label: "Pricing / margin leak",
      question: "Are pricing and margin leaking value?",
      engine: "growth",
      domain: "pricing_pressure",
      reason: "Pricing and margin are leaking value.",
      eval: function (input, r) {
        var fired = isRY(r.margin) || Number(input.margin) < 30;
        return {
          fired: fired,
          evidence:
            "Margin rating " +
            dash(r.margin) +
            ", gross margin " +
            dash(input.margin, "%") +
            ". Fires on Red/Yellow or margin < 30%."
        };
      }
    },
    {
      id: "pipeline_stall",
      branch: "quantitative",
      label: "Pipeline velocity",
      question: "Is cycle time too slow for the growth target?",
      engine: "growth",
      domain: "pipeline_stall",
      reason: "Pipeline velocity is too slow for the growth target.",
      eval: function (input, r, s) {
        var fired = Number(input.salesCycle) >= 90 || (s.revenue != null && s.revenue < 75);
        return {
          fired: fired,
          evidence:
            "Sales cycle " +
            dash(input.salesCycle, " days") +
            ", revenue score " +
            (s.revenue != null ? Number(s.revenue).toFixed(1) : "—") +
            ". Fires at ≥ 90 days or revenue score < 75."
        };
      }
    },
    {
      id: "expansion_while_constrained",
      branch: "quantitative",
      label: "Expansion vs constrained core",
      question: "Is expansion requested while the core is still Red/Yellow?",
      engine: "expansion",
      domain: "market_entry",
      reason: "Expansion is requested while the core engine is still constrained.",
      eval: function (input, r) {
        var intent = input.expansionIntent || "none";
        var fired =
          intent !== "none" &&
          intent &&
          (isRY(r.operations) || isRY(r.leadership) || isRY(r.margin));
        return {
          fired: fired,
          evidence:
            "Expansion intent " +
            dash(intent) +
            "; ops " +
            dash(r.operations) +
            ", leadership " +
            dash(r.leadership) +
            ", margin " +
            dash(r.margin) +
            "."
        };
      }
    },
    {
      id: "rising_costs",
      branch: "quantitative",
      label: "Cost-to-serve / throughput",
      question: "Are cost-to-serve and throughput dragging the P&L?",
      engine: "alignment",
      domain: "rising_costs",
      reason: "Cost-to-serve and throughput are dragging the P&L.",
      eval: function (input, r) {
        var fired = isRY(r.operations) || Number(input.costToServe) >= 20;
        return {
          fired: fired,
          evidence:
            "Operations " +
            dash(r.operations) +
            ", cost-to-serve " +
            dash(input.costToServe, "%") +
            ". Fires on Red/Yellow or cost-to-serve ≥ 20%."
        };
      }
    },
    {
      id: "execution_drift",
      branch: "quantitative",
      label: "Execution discipline",
      question: "Is execution protecting delivery and margin?",
      engine: "alignment",
      domain: "execution_drift",
      reason: "Execution discipline is not protecting delivery or margin.",
      eval: function (input, r) {
        var fired = isRY(r.operations) || isRY(r.margin);
        return {
          fired: fired,
          evidence:
            "Operations " +
            dash(r.operations) +
            ", margin " +
            dash(r.margin) +
            ". Fires if either is Red/Yellow."
        };
      }
    },
    {
      id: "gtm_immaturity",
      branch: "qualitative",
      label: "GTM / sales-process maturity",
      question: "Can the commercial process support a repeatable GTM?",
      engine: "growth",
      domain: "gtm_immaturity",
      reason: "Commercial process maturity cannot support a repeatable GTM.",
      eval: function (input) {
        var fired = input.commercialMaturity === "ad_hoc" || input.commercialMaturity === "emerging";
        return {
          fired: fired,
          evidence:
            "Commercial maturity " +
            dash(input.commercialMaturity) +
            ". Fires on ad hoc or emerging."
        };
      }
    },
    {
      id: "bd_ops_split",
      branch: "qualitative",
      label: "BD ↔ operations handoff",
      question: "Are BD and operations on one capacity plan?",
      engine: "alignment",
      domain: "bd_ops_split",
      reason: "BD and operations are not on one capacity plan.",
      eval: function (input) {
        var fired = input.bdOpsTension === "strained" || input.bdOpsTension === "broken";
        return {
          fired: fired,
          evidence:
            "BD–Ops tension " +
            dash(input.bdOpsTension) +
            ". Fires on strained or broken."
        };
      }
    },
    {
      id: "leadership_gap",
      branch: "qualitative",
      label: "Leadership cadence",
      question: "Can leadership convert strategy into weekly execution?",
      engine: "alignment",
      domain: "leadership_gap",
      reason: "Leadership cadence cannot convert strategy into weekly execution.",
      eval: function (input, r) {
        var fired = isRY(r.leadership) || Number(input.leadership) <= 6;
        return {
          fired: fired,
          evidence:
            "Leadership rating " +
            dash(r.leadership) +
            ", score " +
            dash(input.leadership) +
            " / 10. Fires on Red/Yellow or ≤ 6."
        };
      }
    },
    {
      id: "growth_posture",
      branch: "strategic",
      label: "Growth posture",
      question: "Is the firm asking for grow or expand?",
      engine: "growth",
      domain: "market_share_loss",
      reason: "Growth posture requires a commercial excellence program.",
      eval: function (input) {
        var fired = input.growthAmbition === "grow" || input.growthAmbition === "expand";
        return {
          fired: fired,
          evidence:
            "Growth ambition " +
            dash(input.growthAmbition) +
            ". Fires on grow or expand."
        };
      }
    },
    {
      id: "new_office",
      branch: "strategic",
      label: "New office / geography",
      question: "Is a new office or geography in scope?",
      engine: "expansion",
      domain: "new_office",
      reason: "Client intends a new office / geography.",
      eval: function (input) {
        var intent = input.expansionIntent || "none";
        var fired = intent === "new_office" || intent === "both";
        return {
          fired: fired,
          evidence: "Expansion intent " + dash(intent) + ". Fires on new office or both."
        };
      }
    },
    {
      id: "new_revenue_stream",
      branch: "strategic",
      label: "New revenue stream",
      question: "Is a new offer or stream in scope?",
      engine: "expansion",
      domain: "new_revenue_stream",
      reason: "Client intends a new revenue stream or offer.",
      eval: function (input) {
        var intent = input.expansionIntent || "none";
        var fired = intent === "new_revenue_stream" || intent === "both";
        return {
          fired: fired,
          evidence: "Expansion intent " + dash(intent) + ". Fires on new stream or both."
        };
      }
    },
    {
      id: "expand_ambition",
      branch: "strategic",
      label: "Ungated market entry",
      question: "Is expansion ambition ahead of a gated thesis?",
      engine: "expansion",
      domain: "market_entry",
      reason: "Expansion ambition is ahead of a gated market-entry thesis.",
      eval: function (input) {
        var fired = input.growthAmbition === "expand";
        return {
          fired: fired,
          evidence: "Growth ambition " + dash(input.growthAmbition) + ". Fires on expand."
        };
      }
    }
  ];

  var BRANCH_META = [
    {
      id: "quantitative",
      label: "Quantitative",
      question: "Vital signs and operating metrics"
    },
    {
      id: "qualitative",
      label: "Qualitative",
      question: "Process, handoff, and cadence"
    },
    {
      id: "strategic",
      label: "Strategic",
      question: "Growth posture and expansion intent"
    }
  ];

  var ENGINE_META = [
    { id: "growth", label: "Growth", firm: "Bain" },
    { id: "expansion", label: "Expansion", firm: "Deloitte" },
    { id: "alignment", label: "Alignment", firm: "McKinsey" }
  ];

  function detect(ctx) {
    var input = ctx.input || {};
    var scoring = ctx.scoring || {};
    var r = scoring.ratings || {};
    var s = scoring.scores || {};
    var map = {
      growth: { reasons: [], domains: [] },
      expansion: { reasons: [], domains: [] },
      alignment: { reasons: [], domains: [] }
    };

    var walk = TREE_TESTS.map(function (node) {
      var result = node.eval(input, r, s);
      if (result.fired) {
        fire(map, node.engine, node.domain, node.reason, node.branch);
      }
      return {
        id: node.id,
        branch: node.branch,
        label: node.label,
        question: node.question,
        engine: node.engine,
        domain: node.domain,
        reason: node.reason,
        fired: !!result.fired,
        evidence: result.evidence
      };
    });

    var anyFired = walk.some(function (n) {
      return n.fired;
    });
    var activated = Object.keys(map).filter(function (id) {
      return map[id].reasons.length > 0;
    });
    var defaulted = !activated.length;
    if (defaulted) activated = ["growth"];

    var branches = { quantitative: [], qualitative: [], strategic: [] };
    walk.forEach(function (row) {
      if (!row.fired) return;
      branches[row.branch].push({
        engine: row.engine,
        domain: row.domain,
        reason: row.reason
      });
    });

    return {
      activated: activated,
      map: map,
      branches: branches,
      walk: walk,
      defaulted: defaulted,
      anyFired: anyFired,
      ratings: r,
      scores: s
    };
  }

  function mergeInitiatives(engineResults) {
    var seen = {};
    var list = [];
    engineResults.forEach(function (eng) {
      (eng.initiatives || []).forEach(function (i) {
        if (seen[i.id]) return;
        seen[i.id] = true;
        list.push(i);
      });
    });
    list.sort(function (a, b) {
      return b.priorityScore - a.priorityScore;
    });
    return list;
  }

  function mergeRoadmap(engineResults, initiatives) {
    var k = kit();
    var phases = k.DEFAULT_PHASES;
    var used = {};
    return phases.map(function (p) {
      var items = [];
      engineResults.forEach(function (eng) {
        var slice = (eng.initiatives || []).filter(function (i) {
          return String(i.horizon) === String(p.id) && !used[i.id];
        }).slice(0, 2);
        slice.forEach(function (i) {
          used[i.id] = true;
          items.push(i);
        });
      });
      if (items.length < 2) {
        (initiatives || []).forEach(function (i) {
          if (items.length >= 4) return;
          if (used[i.id]) return;
          used[i.id] = true;
          items.push(i);
        });
      }
      return {
        phase: p.name,
        focus: p.focus,
        horizon: p.id,
        initiatives: items.map(function (i) {
          return i.name;
        }),
        items: items
      };
    });
  }

  function simulate(scoring, initiatives, weight) {
    var lifts = { revenue: 0, margin: 0, operations: 0, leadership: 0 };
    (initiatives || []).slice(0, 5).forEach(function (i) {
      var imp = i.impacts || {};
      lifts.revenue += (imp.revenue || 0) * 100 * weight * 0.4;
      lifts.margin += (imp.margin || 0) * 100 * weight * 0.4;
      lifts.operations += (imp.operations || 0) * 100 * weight * 0.4;
      lifts.leadership += (imp.leadership || 0) * 100 * weight * 0.4;
    });
    return kit().projectScores((scoring && scoring.scores) || {}, lifts);
  }

  function unifiedNarrative(binding, engineResults, detection) {
    var n = engineResults.length;
    var names = engineResults.map(function (e) {
      return e.shortName || e.name;
    });
    var headlines = engineResults.map(function (e) {
      return (e.narrative && e.narrative.headline) || e.archetype.name;
    });
    return {
      headline:
        n > 1
          ? n +
            " overlapping problem domains. Binding constraint: " +
            ((binding.archetype && binding.archetype.name) || binding.name) +
            "."
          : headlines[0] || "Diagnostic complete.",
      situation: headlines.join(" "),
      implication:
        n > 1
          ? "Running a single workstream will miss the other constraints. Market-share, cost, and alignment problems compound."
          : (binding.narrative && binding.narrative.implication) || "",
      recommendation:
        "Sequence 30-day truth across " +
        names.join(", ") +
        ". Do not scale a constraint. " +
        ((binding.narrative && binding.narrative.recommendation) || ""),
      engines: names,
      domains: detection.activated
    };
  }

  async function orchestrate(ctx) {
    var k = kit();
    if (!controlCache) controlCache = await k.fetchJson(CONTROL_URL);
    var detection = detect(ctx);
    var engines = global.ISI.engines || {};
    var results = [];

    for (var i = 0; i < detection.activated.length; i++) {
      var id = detection.activated[i];
      var engine = engines[id];
      if (!engine || typeof engine.run !== "function") continue;
      var activation = detection.map[id];
      var result = await engine.run(ctx, activation);
      results.push(result);
    }

    if (!results.length) {
      throw new Error("No diagnostic engines registered or activated.");
    }

    results.sort(function (a, b) {
      return a.score - b.score;
    });
    var binding = results[0];
    var initiatives = mergeInitiatives(results);
    var roadmap = mergeRoadmap(results, initiatives);
    var scoring = ctx.scoring || { scores: {}, ratings: {} };

    var stabilizePool = initiatives.slice().sort(function (a, b) {
      return a.effort - b.effort;
    });
    var growthPool = initiatives.filter(function (i) {
      return i.engineId === "growth";
    });
    var scenarios = [
      {
        id: "stabilize",
        name: "Stabilize the binding constraint",
        engine: binding.id,
        description:
          "Concentrate 30–60 days on " +
          binding.archetype.name +
          " before adding growth load.",
        initiatives: stabilizePool.slice(0, 4).map(function (i) {
          return i.name;
        }),
        projected: simulate(scoring, stabilizePool, 0.7)
      },
      {
        id: "growth",
        name: "Grow the core",
        engine: "growth",
        description: "Commercial excellence on the existing book and funnel.",
        initiatives: (growthPool.length ? growthPool : initiatives).slice(0, 4).map(function (i) {
          return i.name;
        }),
        projected: simulate(scoring, growthPool.length ? growthPool : initiatives, 1)
      },
      {
        id: "combined",
        name: "Integrated multi-engine program",
        engine: "all",
        description:
          "Merge " +
          results.map(function (e) {
            return e.shortName;
          }).join(" + ") +
          " into one sequenced roadmap.",
        initiatives: initiatives.slice(0, 6).map(function (i) {
          return i.name;
        }),
        projected: simulate(scoring, initiatives, 0.9)
      }
    ];

    var rootCause = [];
    results.forEach(function (e) {
      (e.archetype.rootCause || []).slice(0, 2).forEach(function (c) {
        if (rootCause.indexOf(c) === -1) rootCause.push(c);
      });
    });

    return {
      id: binding.archetype.id,
      name: binding.archetype.name,
      rootCause: rootCause,
      bindingEngine: binding.id,
      posture: results.length > 1 ? "multi_engine" : binding.id,
      activated: detection.activated,
      branches: detection.branches,
      walk: detection.walk,
      defaulted: detection.defaulted,
      engines: results,
      initiatives: initiatives,
      roadmap: roadmap,
      scenarios: scenarios,
      narrative: unifiedNarrative(binding, results, detection),
      ratings: scoring.ratings || {},
      scores: scoring.scores || {},
      controlVersion: controlCache.version,
      drivers: results.reduce(function (acc, e) {
        acc.push(e.archetype.id);
        return acc.concat(e.domains || []);
      }, [])
    };
  }

  global.ISI = global.ISI || {};
  global.ISI.detectDomains = detect;
  global.ISI.orchestrate = orchestrate;
  global.ISI.branchMeta = BRANCH_META;
  global.ISI.engineMeta = ENGINE_META;
})(typeof window !== "undefined" ? window : this);
