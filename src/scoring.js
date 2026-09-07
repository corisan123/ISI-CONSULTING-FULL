/**
 * ISI Consulting — scoring.js (Block 2B)
 * Weighted category scores + Red/Yellow/Green ratings from diagnostic input.
 * Does NOT run decision tree / ROI / roadmap (Blocks 2C–2E).
 */
(function (global) {
  "use strict";

  var INPUT_KEY = "isi_input";
  var INPUT_KEY_LEGACY = "isi_diagnosticInput";
  var RESULTS_KEY = "isi_scoringResults";

  var ABSOLUTE_MODEL_URL = "/src/data/scoringModel.json";

  var SCORE_MODEL_URL =
    (typeof window !== "undefined" && window.ISI_SCORE_MODEL_URL) ||
    ABSOLUTE_MODEL_URL;

  function normalize(value, min, max) {
    if (max === min) return 0;
    var n = ((value - min) / (max - min)) * 100;
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  function getRating(score, thresholds) {
    if (score >= thresholds.green) return "Green";
    if (score >= thresholds.yellow) return "Yellow";
    return "Red";
  }

  function calculateRevenueScore(data, weights) {
    var pipelineScore = normalize(data.pipeline, 0, 1000000);
    var closeRateScore = normalize(data.closeRate, 0, 100);
    var dealSizeScore = normalize(data.dealSize, 0, 250000);
    var salesCycleScore = 100 - normalize(data.salesCycle, 0, 180);

    return (
      pipelineScore * weights.pipeline +
      closeRateScore * weights.closeRate +
      dealSizeScore * weights.dealSize +
      salesCycleScore * weights.salesCycle
    );
  }

  function calculateMarginScore(data, weights) {
    var marginScore = normalize(data.margin, 0, 60);
    var ebitdaScore = normalize(data.ebitda, 0, 30);

    return marginScore * weights.margin + ebitdaScore * weights.ebitda;
  }

  function calculateOperationsScore(data, weights) {
    var ctsScore = 100 - normalize(data.costToServe, 0, 100);
    var concScore = 100 - normalize(data.customerConcentration, 0, 100);
    var capScore = normalize(data.salesCapacity, 0, 20);

    return (
      ctsScore * weights.costToServe +
      concScore * weights.customerConcentration +
      capScore * weights.salesCapacity
    );
  }

  function calculateLeadershipScore(data, weights) {
    return data.leadership * 10 * weights.leadership;
  }

  async function fetchScoringModel() {
    var urls = [SCORE_MODEL_URL];
    if (SCORE_MODEL_URL !== ABSOLUTE_MODEL_URL) {
      urls.push(ABSOLUTE_MODEL_URL);
    }

    var lastErr = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var res = await fetch(urls[i]);
        if (!res.ok) {
          lastErr = new Error("HTTP " + res.status + " for " + urls[i]);
          continue;
        }
        return await res.json();
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Unable to load scoring model");
  }

  async function runScoringEngine() {
    var raw;
    try {
      raw = sessionStorage.getItem(INPUT_KEY) || sessionStorage.getItem(INPUT_KEY_LEGACY);
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
      alert("Unable to read diagnostic input. Please complete the diagnostic input first.");
      return null;
    }

    if (!raw) {
      console.warn("No isi_input in sessionStorage.");
      alert("Please complete the diagnostic input first.");
      return null;
    }

    var diagData;
    try {
      diagData = JSON.parse(raw);
    } catch (err) {
      console.warn("Invalid isi_input JSON:", err);
      alert("Diagnostic input is invalid. Please re-enter it on the diagnostic input page.");
      return null;
    }

    var scoringModel;
    try {
      scoringModel = await fetchScoringModel();
    } catch (err) {
      console.warn("Failed to load scoring model:", err);
      alert("Could not load the scoring model. Serve from project root or use the relative path.");
      return null;
    }

    var scores = {
      revenue: calculateRevenueScore(diagData, scoringModel.weights.revenue),
      margin: calculateMarginScore(diagData, scoringModel.weights.margin),
      operations: calculateOperationsScore(diagData, scoringModel.weights.operations),
      leadership: calculateLeadershipScore(diagData, scoringModel.weights.leadership)
    };

    var ratings = {
      revenue: getRating(scores.revenue, scoringModel.thresholds),
      margin: getRating(scores.margin, scoringModel.thresholds),
      operations: getRating(scores.operations, scoringModel.thresholds),
      leadership: getRating(scores.leadership, scoringModel.thresholds)
    };

    var payload = { scores: scores, ratings: ratings };
    try {
      sessionStorage.setItem(RESULTS_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("sessionStorage unavailable:", err);
    }

    console.log("Scoring Results:", { scores: scores, ratings: ratings });
    return payload;
  }

  function ratingClass(rating) {
    var r = String(rating || "").toLowerCase();
    if (r === "green") return "rating-green";
    if (r === "yellow") return "rating-yellow";
    return "rating-red";
  }

  function displayResults() {
    var container = document.getElementById("scoringResults");
    if (!container) return;

    var raw;
    try {
      raw = sessionStorage.getItem(RESULTS_KEY);
    } catch (err) {
      return;
    }
    if (!raw) return;

    var results;
    try {
      results = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (!results || !results.scores || !results.ratings) return;

    var cats = [
      { key: "revenue", label: "Revenue Engine" },
      { key: "margin", label: "Margin Health" },
      { key: "operations", label: "Operations" },
      { key: "leadership", label: "Leadership" }
    ];

    var html = "";
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      var score = Number(results.scores[c.key]);
      var rating = results.ratings[c.key];
      html +=
        "<p class=\"scoring-line\">" +
        c.label +
        ': <span class="rating-badge ' +
        ratingClass(rating) +
        '">' +
        rating +
        "</span> (" +
        score.toFixed(1) +
        ")</p>";
    }
    container.innerHTML = html;
  }

  async function runAndDisplay() {
    await runScoringEngine();
    displayResults();
  }

  global.normalize = normalize;
  global.getRating = getRating;
  global.calculateRevenueScore = calculateRevenueScore;
  global.calculateMarginScore = calculateMarginScore;
  global.calculateOperationsScore = calculateOperationsScore;
  global.calculateLeadershipScore = calculateLeadershipScore;
  global.runScoringEngine = runScoringEngine;
  global.displayResults = displayResults;
  global.runAndDisplay = runAndDisplay;
})(typeof window !== "undefined" ? window : this);
