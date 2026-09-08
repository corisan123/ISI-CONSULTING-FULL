/**
 * Phase 8 — narrativeEngine.js
 * Sits on top of diagnostic outputs. Reads scoring, archetype, priorities, and
 * roadmap; returns structured narrative. Does not score, activate engines,
 * or write session data.
 */
import { templates } from "./templates.js";

var CATEGORIES = [
  { key: "revenue", label: "Revenue Engine" },
  { key: "margin", label: "Margin Health" },
  { key: "operations", label: "Operations" },
  { key: "leadership", label: "Leadership" }
];

function asText(value, fallback) {
  if (value == null) return fallback || "";
  var s = String(value).trim();
  return s || fallback || "";
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function formatScore(value) {
  var n = Number(value);
  if (!isFinite(n)) return "—";
  return n.toFixed(1);
}

function fill(template, tokens) {
  if (template == null) return "";
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, key) {
    return tokens[key] != null && tokens[key] !== "" ? String(tokens[key]) : "—";
  });
}

function fillList(list, tokens) {
  return asList(list).map(function (item) {
    return fill(item, tokens);
  });
}

function itemName(item) {
  if (item == null) return "";
  if (typeof item === "string") return item;
  return asText(item.name || item.title || item.phase, "");
}

function weakestCategory(scores, ratings) {
  var weakest = CATEGORIES[0];
  var min = Infinity;
  CATEGORIES.forEach(function (cat) {
    var n = Number(scores && scores[cat.key]);
    if (isFinite(n) && n < min) {
      min = n;
      weakest = cat;
    }
  });
  return {
    key: weakest.key,
    label: weakest.label,
    score: formatScore(scores && scores[weakest.key]),
    rating: asText(ratings && ratings[weakest.key], "—")
  };
}

function engineSummary(engines) {
  var list = asList(engines);
  if (!list.length) {
    return "No service engines are recorded on this diagnostic yet.";
  }
  return list
    .map(function (e) {
      var name = asText(e.shortName || e.name, "Engine");
      var firm = asText(e.firm, "");
      var arch = e.archetype && e.archetype.name ? e.archetype.name : "";
      var bits = [name];
      if (firm) bits.push("(" + firm + ")");
      if (arch) bits.push("— " + arch);
      return bits.join(" ");
    })
    .join("; ");
}

function normalize(payload) {
  payload = payload || {};
  var scoring = payload.scoring || {};
  var decision = payload.decision || payload.archetype || {};
  if (typeof decision === "string") {
    decision = { name: decision };
  }
  var priorities = asList(payload.priorities);
  var roadmap = asList(payload.roadmap);
  var scores = scoring.scores || payload.scores || {};
  var ratings = scoring.ratings || payload.ratings || {};
  var narrative = decision.narrative || payload.narrative || {};
  var engines = decision.engines || payload.engines || [];
  var firstPhase = roadmap[0] || {};
  var later = roadmap.slice(1).map(function (p) {
    return asText(p.phase || p.name, "");
  }).filter(Boolean);
  var weakest = weakestCategory(scores, ratings);
  var top = priorities[0] || {};
  var activated = asList(decision.activated || payload.activated);
  var rootCause = asList(decision.rootCause || (decision.archetype && decision.archetype.rootCause));

  var tokens = {
    archetype: asText(
      decision.name ||
        (decision.archetype && decision.archetype.name) ||
        payload.archetypeName,
      "an unclassified constraint"
    ),
    headline: asText(narrative.headline, ""),
    situation: asText(narrative.situation, ""),
    implication: asText(narrative.implication, ""),
    recommendation: asText(narrative.recommendation, "sequence work against the binding constraint"),
    topPriority: asText(itemName(top), "the top-ranked initiative"),
    nextPhase: asText(firstPhase.phase || firstPhase.name, "the first roadmap window"),
    nextPhaseFocus: asText(firstPhase.focus, "stabilization and truth"),
    laterPhases: later.length ? later.join(", ") : "later windows",
    weakestLabel: weakest.label,
    weakestScore: weakest.score,
    weakestRating: weakest.rating,
    revenueScore: formatScore(scores.revenue),
    marginScore: formatScore(scores.margin),
    operationsScore: formatScore(scores.operations),
    leadershipScore: formatScore(scores.leadership),
    revenueRating: asText(ratings.revenue, "—"),
    marginRating: asText(ratings.margin, "—"),
    operationsRating: asText(ratings.operations, "—"),
    leadershipRating: asText(ratings.leadership, "—"),
    engineSummary: engineSummary(engines),
    activatedList: activated.length ? activated.join(", ") : "none recorded",
    rootCauseList: rootCause.length ? rootCause.slice(0, 3).join("; ") : "not yet captured"
  };

  if (!tokens.headline) {
    tokens.headline = fill(templates.dashboardLead.lead, tokens);
  }
  if (!tokens.situation) {
    tokens.situation = fill(templates.dashboardLead.rationale, tokens);
  }

  return {
    scores: scores,
    ratings: ratings,
    priorities: priorities,
    roadmap: roadmap,
    engines: engines,
    tokens: tokens
  };
}

function surfaceFromTemplate(template, tokens) {
  return {
    id: template.id,
    title: template.title,
    lead: fill(template.lead, tokens),
    insights: fillList(template.insights, tokens),
    rationale: fill(template.rationale, tokens),
    nextPhaseFraming: fill(template.nextPhaseFraming, tokens)
  };
}

export function generateNarrative(payload) {
  var ctx = normalize(payload);
  var tokens = ctx.tokens;

  var dashboard = surfaceFromTemplate(templates.dashboardLead, tokens);
  var roadmap = surfaceFromTemplate(templates.roadmapExplanation, tokens);
  var summary = surfaceFromTemplate(templates.summaryBrief, tokens);

  return {
    meta: {
      layer: "narrative",
      version: "8.0.0",
      status: "placeholder-templates",
      generatedAt: new Date().toISOString()
    },
    tokens: tokens,
    blocks: {
      lead: dashboard.lead,
      insights: dashboard.insights,
      rationale: dashboard.rationale,
      nextPhase: {
        heading: tokens.nextPhase,
        focus: tokens.nextPhaseFocus,
        framing: dashboard.nextPhaseFraming
      }
    },
    surfaces: {
      dashboardLead: dashboard,
      roadmapExplanation: roadmap,
      summaryBrief: summary
    }
  };
}

export function generateFromSession() {
  var k = typeof window !== "undefined" && window.ISI && window.ISI.kit;
  var read = k && typeof k.readSession === "function"
    ? function (key) {
        return k.readSession(key);
      }
    : function () {
        return null;
      };

  return generateNarrative({
    scoring: read("isi_scoringResults"),
    decision: read("isi_decisionTree"),
    priorities: read("isi_prioritization"),
    roadmap: read("isi_roadmap")
  });
}

export { templates, fill as fillTemplate };

export var narrativeEngine = {
  generateNarrative: generateNarrative,
  generateFromSession: generateFromSession,
  templates: templates,
  fillTemplate: fill
};

export default narrativeEngine;

if (typeof window !== "undefined") {
  window.ISINarrative = narrativeEngine;
}
