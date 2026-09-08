/**
 * Phase 9 — packetEngine.js
 * Assembles a client packet from existing diagnostic outputs.
 * Does not modify scoring, engines, decision-tree, or roadmap data.
 */
import { generateFromSession, generateNarrative } from "../narrative/narrativeEngine.js";
import { hashNarrativeTokens, applyAntiCopy, applyWatermark } from "./protect.js";
import { firm } from "./firm.js";
import { renderHeader } from "./templates/header.js";
import { renderFooter } from "./templates/footer.js";
import { renderExecutiveSummary } from "./templates/executiveSummary.js";
import { renderInitiatives } from "./templates/initiatives.js";
import { renderNextSteps } from "./templates/nextSteps.js";
import { renderRoiEbitda } from "./templates/roiEbitda.js";
import { renderContract } from "./templates/contract.js";

var GRADE_LABELS = {
  revenue: "Revenue Engine",
  margin: "Margin Health",
  operations: "Operations",
  leadership: "Leadership"
};

function readKit(key) {
  var k = typeof window !== "undefined" && window.ISI && window.ISI.kit;
  if (k && typeof k.readSession === "function") return k.readSession(key);
  return null;
}

function readInput() {
  var k = typeof window !== "undefined" && window.ISI && window.ISI.kit;
  if (k && typeof k.readInput === "function") return k.readInput() || {};
  return readKit("isi_input") || readKit("isi_diagnosticInput") || {};
}

function num(value) {
  var n = Number(value);
  return isFinite(n) ? n : 0;
}

function gradeFromScore(score) {
  var n = num(score);
  if (n >= 75) return { letter: "A", band: "Green", score: n.toFixed(1) };
  if (n >= 50) return { letter: "B", band: "Yellow", score: n.toFixed(1) };
  return { letter: "C", band: "Red", score: n.toFixed(1) };
}

function buildGrades(scores, ratings) {
  var grades = {};
  Object.keys(GRADE_LABELS).forEach(function (key) {
    var g = gradeFromScore(scores && scores[key]);
    g.label = GRADE_LABELS[key];
    g.rating = (ratings && ratings[key]) || g.band;
    grades[key] = g;
  });
  return grades;
}

function buildStatistics(scores, ratings, decision) {
  var keys = Object.keys(GRADE_LABELS);
  var values = keys.map(function (k) {
    return num(scores && scores[k]);
  });
  var sum = values.reduce(function (a, b) {
    return a + b;
  }, 0);
  var avg = values.length ? sum / values.length : 0;
  var weakestKey = keys[0];
  var min = Infinity;
  keys.forEach(function (k) {
    var n = num(scores && scores[k]);
    if (n < min) {
      min = n;
      weakestKey = k;
    }
  });
  var strongestKey = keys[0];
  var max = -Infinity;
  keys.forEach(function (k) {
    var n = num(scores && scores[k]);
    if (n > max) {
      max = n;
      strongestKey = k;
    }
  });
  var composite = gradeFromScore(avg);
  return {
    archetype: (decision && decision.name) || "—",
    averageScore: Math.round(avg * 10) / 10,
    compositeGrade: composite.letter + " (" + composite.band + ")",
    weakestLabel: GRADE_LABELS[weakestKey] + " " + min.toFixed(1),
    strongestLabel: GRADE_LABELS[strongestKey] + " " + max.toFixed(1),
    spread: Math.round((max - min) * 10) / 10,
    redCount: keys.filter(function (k) {
      return String((ratings && ratings[k]) || "").toLowerCase() === "red";
    }).length
  };
}

function buildModeling(input, initiatives) {
  var revenue = num(input.revenue);
  var ebitdaPct = num(input.ebitda);
  var top = (initiatives || []).slice(0, 5);
  var rois = top.map(function (i) {
    return num(i.roi);
  });
  var avgRoi = rois.length
    ? rois.reduce(function (a, b) {
        return a + b;
      }, 0) / rois.length
    : 0;
  var marginImpact = top.reduce(function (a, i) {
    return a + num(i.impacts && i.impacts.margin);
  }, 0);
  var realization = 0.25;
  var ebitdaCurrent = revenue * (ebitdaPct / 100);
  var valueAtStake = revenue * avgRoi * realization;
  var ebitdaLift = revenue * marginImpact * realization;
  return {
    revenue: revenue,
    ebitdaPct: ebitdaPct,
    ebitdaCurrent: ebitdaCurrent,
    averageRoi: avgRoi,
    averageRoiPct: Math.round(avgRoi * 1000) / 10,
    valueAtStake: valueAtStake,
    marginLiftPts: marginImpact * realization * 100,
    ebitdaLift: ebitdaLift,
    ebitdaModeled: ebitdaCurrent + ebitdaLift,
    realization: realization,
    initiativeCount: top.length
  };
}

function shortId(hash) {
  return String(hash || "packet").slice(0, 12).toUpperCase();
}

export async function assemblePacket(payload) {
  payload = payload || {};
  var scoring = payload.scoring || {};
  var decision = payload.decision || {};
  var priorities = payload.priorities || [];
  var roadmap = payload.roadmap || [];
  var input = payload.input || {};
  var narrative =
    payload.narrative ||
    generateNarrative({
      scoring: scoring,
      decision: decision,
      priorities: priorities,
      roadmap: roadmap
    });

  var scores = scoring.scores || {};
  var ratings = scoring.ratings || {};
  var grades = buildGrades(scores, ratings);
  var statistics = buildStatistics(scores, ratings, decision);
  var modeling = buildModeling(input, priorities);
  var tokenHash = await hashNarrativeTokens(narrative.tokens || {});

  return {
    meta: {
      layer: "packet",
      version: "9.0.0",
      generatedAt: new Date().toISOString(),
      tokenHash: tokenHash,
      id: "ISI-" + shortId(tokenHash),
      issuedTo: payload.issuedTo || "Client leadership"
    },
    firm: firm,
    narrative: narrative,
    diagnostic: {
      scores: scores,
      ratings: ratings,
      grades: grades,
      engines: decision.engines || [],
      activated: decision.activated || []
    },
    statistics: statistics,
    initiatives: priorities,
    roadmap: roadmap,
    modeling: modeling,
    inputSnapshot: {
      revenue: num(input.revenue),
      margin: num(input.margin),
      ebitda: num(input.ebitda)
    }
  };
}

export async function assembleFromSession(options) {
  options = options || {};
  return assemblePacket({
    scoring: readKit("isi_scoringResults") || {},
    decision: readKit("isi_decisionTree") || {},
    priorities: readKit("isi_prioritization") || [],
    roadmap: readKit("isi_roadmap") || [],
    input: readInput(),
    narrative: generateFromSession(),
    issuedTo: options.issuedTo
  });
}

export function renderPacket(target, packet) {
  var host = typeof target === "string" ? document.querySelector(target) : target;
  if (!host || !packet) return null;

  var root = document.createElement("article");
  root.className = "isi-packet";
  root.setAttribute("data-packet-id", packet.meta.id);

  applyAntiCopy(root);
  applyWatermark(root, "ISI CONFIDENTIAL · " + packet.meta.id);

  root.appendChild(renderHeader(packet));
  root.appendChild(renderExecutiveSummary(packet));
  root.appendChild(renderInitiatives(packet));
  root.appendChild(renderNextSteps(packet));
  root.appendChild(renderRoiEbitda(packet));
  root.appendChild(renderContract(packet));
  root.appendChild(renderFooter(packet));

  host.innerHTML = "";
  host.appendChild(root);
  return root;
}

export var packetEngine = {
  assemblePacket: assemblePacket,
  assembleFromSession: assembleFromSession,
  renderPacket: renderPacket,
  firm: firm
};

export default packetEngine;

if (typeof window !== "undefined") {
  window.ISIPacket = packetEngine;
}
