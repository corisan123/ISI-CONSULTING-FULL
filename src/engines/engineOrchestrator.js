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

    if (isRY(r.revenue) || Number(input.closeRate) < 30) {
      fire(map, "growth", "market_share_loss", "Win rate / revenue engine is not carrying share.", "quantitative");
    }
    if (Number(input.customerConcentration) >= 40) {
      fire(map, "growth", "client_churn_concentration", "Account concentration creates retention and mix risk.", "quantitative");
    }
    if (isRY(r.margin) || Number(input.margin) < 30) {
      fire(map, "growth", "pricing_pressure", "Pricing and margin are leaking value.", "quantitative");
    }
    if (Number(input.salesCycle) >= 90 || (s.revenue != null && s.revenue < 75)) {
      fire(map, "growth", "pipeline_stall", "Pipeline velocity is too slow for the growth target.", "quantitative");
    }
    if (input.commercialMaturity === "ad_hoc" || input.commercialMaturity === "emerging") {
      fire(map, "growth", "gtm_immaturity", "Commercial process maturity cannot support a repeatable GTM.", "qualitative");
    }
    if (input.growthAmbition === "grow" || input.growthAmbition === "expand") {
      fire(map, "growth", "market_share_loss", "Growth posture requires a commercial excellence program.", "strategic");
    }

    var intent = input.expansionIntent || "none";
    if (intent === "new_office" || intent === "both") {
      fire(map, "expansion", "new_office", "Client intends a new office / geography.", "strategic");
    }
    if (intent === "new_revenue_stream" || intent === "both") {
      fire(map, "expansion", "new_revenue_stream", "Client intends a new revenue stream or offer.", "strategic");
    }
    if (input.growthAmbition === "expand") {
      fire(map, "expansion", "market_entry", "Expansion ambition is ahead of a gated market-entry thesis.", "strategic");
    }
    if (intent !== "none" && intent && (isRY(r.operations) || isRY(r.leadership) || isRY(r.margin))) {
      fire(map, "expansion", "market_entry", "Expansion is requested while the core engine is still constrained.", "quantitative");
    }

    if (isRY(r.operations) || Number(input.costToServe) >= 20) {
      fire(map, "alignment", "rising_costs", "Cost-to-serve and throughput are dragging the P&L.", "quantitative");
    }
    if (input.bdOpsTension === "strained" || input.bdOpsTension === "broken") {
      fire(map, "alignment", "bd_ops_split", "BD and operations are not on one capacity plan.", "qualitative");
    }
    if (isRY(r.leadership) || Number(input.leadership) <= 6) {
      fire(map, "alignment", "leadership_gap", "Leadership cadence cannot convert strategy into weekly execution.", "qualitative");
    }
    if (isRY(r.operations) || isRY(r.margin)) {
      fire(map, "alignment", "execution_drift", "Execution discipline is not protecting delivery or margin.", "quantitative");
    }

    var activated = Object.keys(map).filter(function (id) {
      return map[id].reasons.length > 0;
    });
    if (!activated.length) activated = ["growth"];

    var branches = { quantitative: [], qualitative: [], strategic: [] };
    activated.forEach(function (id) {
      map[id].reasons.forEach(function (row) {
        branches[row.branch].push({
          engine: id,
          domain: row.domain,
          reason: row.reason
        });
      });
    });

    return { activated: activated, map: map, branches: branches };
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
})(typeof window !== "undefined" ? window : this);
