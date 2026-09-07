/**
 * ISI Consulting — shared kit for modular diagnostic engines.
 * Register engines on window.ISI.engines; helpers on window.ISI.kit.
 */
(function (global) {
  "use strict";

  var ISI = global.ISI || {};
  ISI.engines = ISI.engines || {};

  function clamp(n, min, max) {
    n = Number(n);
    if (!isFinite(n)) return min;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function normalize(value, min, max) {
    if (max === min) return 0;
    return clamp(((Number(value) - min) / (max - min)) * 100, 0, 100);
  }

  function rating(score, thresholds) {
    var t = thresholds || { green: 75, yellow: 50 };
    if (score >= t.green) return "Green";
    if (score >= t.yellow) return "Yellow";
    return "Red";
  }

  function avg(values) {
    var list = (values || []).filter(function (n) {
      return isFinite(Number(n));
    });
    if (!list.length) return 0;
    var sum = 0;
    for (var i = 0; i < list.length; i++) sum += Number(list[i]);
    return sum / list.length;
  }

  function mix(a, b, w) {
    w = w == null ? 0.5 : w;
    return Number(a) * (1 - w) + Number(b) * w;
  }

  function priorityScore(roi, effort) {
    return Number(roi) * 100 - Number(effort) * 50;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ratingClass(r) {
    var x = String(r || "").toLowerCase();
    if (x === "green") return "rating-green";
    if (x === "yellow") return "rating-yellow";
    return "rating-red";
  }

  async function fetchJson(url) {
    var res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
  }

  function readSession(key) {
    try {
      var raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function readInput() {
    return (
      readSession("isi_input") ||
      readSession("isi_diagnosticInput") ||
      {}
    );
  }

  function readScoring() {
    return readSession("isi_scoringResults");
  }

  function maturityScore(level) {
    if (level === "disciplined") return 82;
    if (level === "emerging") return 55;
    if (level === "ad_hoc") return 30;
    return 50;
  }

  function pickArchetype(score, archetypes) {
    var list = archetypes || [];
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var min = a.min == null ? -Infinity : a.min;
      var max = a.max == null ? Infinity : a.max;
      if (score >= min && score < max) return a;
    }
    return list[list.length - 1] || {
      id: "unclassified",
      name: "Unclassified Pattern",
      rootCause: ["Signals did not map to a domain archetype."]
    };
  }

  function projectScores(scores, lifts) {
    var keys = ["revenue", "margin", "operations", "leadership"];
    var out = { scores: {}, ratings: {} };
    var src = scores || {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var next = clamp((src[k] || 0) + (lifts[k] || 0), 0, 100);
      out.scores[k] = Math.round(next * 10) / 10;
      out.ratings[k] = rating(next);
    }
    return out;
  }

  var DEFAULT_PHASES = [
    { id: "30", name: "First 30 Days", focus: "Truth, sequencing, and quick wins" },
    { id: "60", name: "Days 31–60", focus: "Core system fixes" },
    { id: "90", name: "Days 61–90", focus: "Scale the working motion" },
    { id: "180", name: "Days 91–180", focus: "Architecture and options" }
  ];

  function phaseRoadmap(initiatives, phases) {
    var list = phases && phases.length ? phases : DEFAULT_PHASES;
    var used = {};
    return list.map(function (p) {
      var items = (initiatives || []).filter(function (i) {
        return String(i.horizon) === String(p.id) && !used[i.id];
      }).slice(0, 4);
      items.forEach(function (i) {
        used[i.id] = true;
      });
      if (!items.length) {
        items = (initiatives || []).filter(function (i) {
          return !used[i.id];
        }).slice(0, 2);
        items.forEach(function (i) {
          used[i.id] = true;
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

  function createEngine(config) {
    var cache = null;

    async function loadModel() {
      if (!cache) cache = await fetchJson(config.modelUrl);
      return cache;
    }

    var api = {
      id: config.id,
      name: config.name,
      firm: config.firm,
      family: config.family,
      loadModel: loadModel,
      run: async function (ctx, activation) {
        activation = activation || { reasons: [], domains: [] };
        var model = await loadModel();
        var moduleScores = config.scoreModules(ctx, model, ISI.kit);
        var modules = (model.modules || []).map(function (m) {
          var s = clamp(moduleScores[m.id] == null ? 50 : moduleScores[m.id], 0, 100);
          var rat = rating(s, model.thresholds);
          var findings = m.findings || {};
          return {
            id: m.id,
            name: m.name,
            framework: m.framework || "",
            score: Math.round(s * 10) / 10,
            rating: rat,
            finding: findings[rat] || ""
          };
        });
        var engineScore = avg(
          modules.map(function (m) {
            return m.score;
          })
        );
        var archetype = pickArchetype(engineScore, model.archetypes);
        var ranked = (model.initiatives || [])
          .map(function (i) {
            var boost = 0;
            var drivers = i.drivers || [];
            (activation.domains || []).forEach(function (d) {
              if (drivers.indexOf(d) !== -1) boost += 8;
            });
            if (drivers.indexOf(archetype.id) !== -1) boost += 12;
            var weakest = modules.slice().sort(function (a, b) {
              return a.score - b.score;
            })[0];
            if (weakest && drivers.indexOf(weakest.id) !== -1) boost += 6;
            return {
              id: i.id,
              name: i.name,
              summary: i.summary || "",
              firm: i.firm || config.firm,
              family: i.family || config.family,
              category: i.category || config.id,
              offering: i.offering || config.id,
              engineId: config.id,
              engineName: config.name,
              drivers: drivers,
              roi: i.roi,
              effort: i.effort,
              horizon: String(i.horizon),
              impacts: i.impacts || {},
              priorityScore: priorityScore(i.roi, i.effort) + boost
            };
          })
          .sort(function (a, b) {
            return b.priorityScore - a.priorityScore;
          });

        var selected = [];
        var seen = {};
        ranked.forEach(function (i) {
          if (selected.length >= 12) return;
          var matched = (i.drivers || []).some(function (d) {
            return d === archetype.id || (activation.domains || []).indexOf(d) !== -1;
          });
          if (matched || selected.length < 8) {
            if (!seen[i.id]) {
              seen[i.id] = true;
              selected.push(i);
            }
          }
        });

        return {
          id: config.id,
          name: config.name,
          shortName: config.shortName || config.name,
          firm: config.firm,
          family: config.family,
          activated: true,
          reasons: activation.reasons || [],
          domains: activation.domains || [],
          score: Math.round(engineScore * 10) / 10,
          rating: rating(engineScore, model.thresholds),
          archetype: {
            id: archetype.id,
            name: archetype.name,
            rootCause: archetype.rootCause || []
          },
          modules: modules,
          initiatives: selected,
          roadmap: phaseRoadmap(selected, model.phases || DEFAULT_PHASES),
          narrative: {
            headline: archetype.headline || archetype.name,
            situation: archetype.situation || (archetype.rootCause || []).slice(0, 2).join(" "),
            implication: archetype.implication || "",
            recommendation: archetype.recommendation || "",
            engine: config.name,
            firm: config.firm
          }
        };
      }
    };

    ISI.registerEngine(config.id, api);
    return api;
  }

  ISI.kit = {
    clamp: clamp,
    normalize: normalize,
    rating: rating,
    avg: avg,
    mix: mix,
    priorityScore: priorityScore,
    escapeHtml: escapeHtml,
    ratingClass: ratingClass,
    fetchJson: fetchJson,
    readSession: readSession,
    readInput: readInput,
    readScoring: readScoring,
    maturityScore: maturityScore,
    pickArchetype: pickArchetype,
    projectScores: projectScores,
    phaseRoadmap: phaseRoadmap,
    DEFAULT_PHASES: DEFAULT_PHASES
  };

  ISI.createEngine = createEngine;

  ISI.registerEngine = function (id, api) {
    ISI.engines[id] = api;
  };

  global.ISI = ISI;
})(typeof window !== "undefined" ? window : this);
